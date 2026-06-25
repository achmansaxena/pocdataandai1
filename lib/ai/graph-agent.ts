/**
 * lib/ai/graph-agent.ts
 * Knowledge Graph conversational agent.
 * Pipeline: Natural Language → Cypher query → Graph execution → NL answer with explainability.
 */

import OpenAI from "openai";
import { runCypherQuery } from "@/lib/graph/query";
import type { GraphSource } from "@/lib/types";

/** Schema fed to the LLM for Cypher generation. */
const GRAPH_SCHEMA = `
Knowledge Graph Schema (Neo4j):

Node Labels and Properties:
- Customer        { id, name, industry, tier, region, healthScore (0-100), source }
- Product         { id, name, category, version, source }
- Contract        { id, value, startDate, endDate, status, renewalRisk (Low/Medium/High), source }
- Entitlement     { id, seats, usagePercent, featureSet, source }
- SupportCase     { id, title, severity (P1-P4), status, openedDate, source }
- FinancialMetrics{ id, arr, mrr, ltv, churnRisk (0-100), source }
- Contact         { id, name, role, email, isPrimary, source }

Relationships:
- (Customer)-[:OWNS]->(Product)
- (Customer)-[:HAS_CONTRACT]->(Contract)
- (Contract)-[:ENABLES]->(Entitlement)
- (Customer)-[:OPENED_CASE]->(SupportCase)
- (Customer)-[:GENERATES]->(FinancialMetrics)
- (Contact)-[:MANAGES]->(Customer)

Sample Customer names: "Acme Corp", "TechNova Inc", "RetailMax", "HealthBridge", "FinEdge Capital"

Rules:
- Return ONLY the Cypher query. No markdown, no explanation.
- Use MATCH and RETURN. Avoid DETACH DELETE or mutations.
- Always return meaningful properties (e.g. RETURN c.name, c.healthScore).
- For risk analysis, look at Contract.renewalRisk, FinancialMetrics.churnRisk, SupportCase.severity, Customer.healthScore.
- Use OPTIONAL MATCH when related nodes may not exist.
- Limit results with LIMIT 25 unless the question asks for all.
`;

function cleanCypher(raw: string): string {
  const codeBlock = raw.match(/```(?:cypher)?\n?([\s\S]*?)```/i);
  return (codeBlock ? codeBlock[1] : raw).trim();
}

export async function executeGraphQuery(
  question: string
): Promise<{ answer: string; source: GraphSource }> {
  const apiKey   = process.env.LLM_API_KEY;
  const baseURL  = process.env.LLM_BASE_URL;
  const model    = process.env.LLM_MODEL_NAME ?? "gpt-oss-120b";

  if (!apiKey) throw new Error("LLM_API_KEY is not configured.");

  const openai = new OpenAI({ apiKey, baseURL });

  // Phase 1: Generate Cypher
  const cypherPrompt = `Task: Generate a Neo4j Cypher query to answer the user's question.

Schema:
${GRAPH_SCHEMA}

Question: ${question}
Cypher Query (RETURN ONLY THE CYPHER QUERY):`;

  const cypherResponse = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: cypherPrompt }],
    temperature: 0,
  });

  const rawCypher = cypherResponse.choices[0]?.message?.content ?? "";
  const cypherQuery = cleanCypher(rawCypher);

  // Phase 2: Execute against Neo4j
  let graphResult;
  try {
    graphResult = await runCypherQuery(cypherQuery);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      answer: `I generated a Cypher query but encountered an error running it: ${msg}`,
      source: {
        cypher_query: cypherQuery,
        relationship_path: [],
        source_systems: [],
        reasoning_summary: "Query execution failed.",
        raw_results: [],
      },
    };
  }

  // Phase 3: Generate reasoning summary + natural language answer
  const answerPrompt = `Task: You are a Knowledge Graph AI analyst. Answer the user's question using the graph query results below.

Question: ${question}
Cypher Query Used: ${cypherQuery}
Graph Results: ${JSON.stringify(graphResult.records, null, 2)}
Relationship Paths Traversed: ${graphResult.summary.relationshipPath.join(", ") || "direct node lookup"}
Source Systems: ${graphResult.summary.sourceSystems.join(", ") || "Knowledge Graph"}

Instructions:
- Provide a clear, business-focused answer.
- Reference specific entities (customer names, contract IDs, values) found in the results.
- If asking about risk, explain what factors (renewalRisk, churnRisk, open P1/P2 cases, healthScore, low usage) contribute.
- End with a one-sentence "Reasoning Summary" prefixed with "**Reasoning:** ".
- Never mention Cypher, Neo4j, or technical implementation details.
- If results are empty, state no matching data was found.`;

  const answerResponse = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: answerPrompt }],
    temperature: 0.2,
  });

  const answer = answerResponse.choices[0]?.message?.content ?? "No answer generated.";

  // Extract reasoning summary for the explainability panel
  const reasoningMatch = answer.match(/\*\*Reasoning:\*\*\s*(.+)/);
  const reasoningSummary = reasoningMatch
    ? reasoningMatch[1].trim()
    : "Graph traversal completed successfully.";

  return {
    answer,
    source: {
      cypher_query: cypherQuery,
      relationship_path: graphResult.summary.relationshipPath,
      source_systems: graphResult.summary.sourceSystems.length
        ? graphResult.summary.sourceSystems
        : ["CRM", "SupportSystem", "FinanceSystem"],
      reasoning_summary: reasoningSummary,
      raw_results: graphResult.records,
    },
  };
}
