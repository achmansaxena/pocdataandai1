import OpenAI from "openai";
import { poolPromise } from "@/lib/db/sql";
import type { ChatAPIResponse } from "@/lib/types";

// Provide a simplified subset of the AdventureWorks schema to keep LLM context clean
const ADVENTUREWORKS_SCHEMA = `
Tables available in AdventureWorks2022:

1. Production.Product
   - ProductID (int)
   - Name (nvarchar)
   - ProductNumber (nvarchar)
   - Color (nvarchar)
   - StandardCost (money)
   - ListPrice (money)
   - Size (nvarchar)
   - Weight (decimal)

2. Sales.SalesOrderHeader
   - SalesOrderID (int)
   - OrderDate (datetime)
   - DueDate (datetime)
   - Status (tinyint)
   - CustomerID (int)
   - SubTotal (money)
   - TaxAmt (money)
   - Freight (money)
   - TotalDue (money)

3. Sales.SalesOrderDetail
   - SalesOrderID (int)
   - SalesOrderDetailID (int)
   - OrderQty (smallint)
   - ProductID (int)
   - UnitPrice (money)
   - LineTotal (numeric)

4. Person.Person
   - BusinessEntityID (int)
   - PersonType (nchar)
   - FirstName (nvarchar)
   - LastName (nvarchar)

Important Rules:
- Always use fully qualified table names (e.g., Production.Product).
- Write standard T-SQL.
- Avoid using formatting functions inside the query (no FORMAT, CONVERT for dates unless requested).
- Use TOP instead of LIMIT (e.g., SELECT TOP 10 ...).
`;

function cleanSQLQuery(query: string): string {
  const codeBlockMatch = query.match(/```(?:sql)?\n?([\s\S]*?)```/i);
  const cleaned = codeBlockMatch ? codeBlockMatch[1] : query;
  return cleaned.trim();
}

export async function executeTextToSQL(question: string): Promise<ChatAPIResponse> {
  const apiKey = process.env.LLM_API_KEY;
  const baseURL = process.env.LLM_BASE_URL;
  const modelName = process.env.LLM_MODEL_NAME || "gpt-oss-120b";

  if (!apiKey) throw new Error("LLM_API_KEY is not configured");

  const openai = new OpenAI({ apiKey, baseURL });

  // Phase 1: Generate T-SQL
  const sqlPrompt = `Task: Generate a Microsoft T-SQL query to answer the user's question.
Schema:
${ADVENTUREWORKS_SCHEMA}

Question: ${question}
T-SQL Query (RETURN ONLY THE T-SQL QUERY. DO NOT INCLUDE MARKDOWN, EXPLANATIONS, OR ANY OTHER TEXT):`;

  const sqlResponse = await openai.chat.completions.create({
    model: modelName,
    messages: [{ role: "user", content: sqlPrompt }],
    temperature: 0,
  });

  const rawSql = sqlResponse.choices[0]?.message?.content || "";
  const sqlQuery = cleanSQLQuery(rawSql);

  // Phase 2: Execute T-SQL
  const pool = await poolPromise;
  let rawResults: Record<string, unknown>[] = [];

  try {
    const dbResult = await pool.request().query(sqlQuery);
    rawResults = dbResult.recordset;
  } catch (dbError: unknown) {
    const msg = dbError instanceof Error ? dbError.message : String(dbError);
    return {
      answer: `I generated a T-SQL query but encountered an error running it against the database: ${msg}`,
      source: { sql_query: sqlQuery, raw_results: [] }
    };
  }

  // Phase 3: Generate Natural Language Answer
  const answerPrompt = `Task: You are an AI assistant that translates SQL database query results into clear, user-friendly natural language responses.
Question: ${question}
T-SQL Query: ${sqlQuery}
Query Results: ${JSON.stringify(rawResults)}

Instructions:
- Formulate a clean, natural response to the user's question using the provided Query Results.
- If the query results are empty or null, state clearly that no matching information was found.
- Keep the answer concise and business-focused.
- Do not mention technical implementation details like 'SQL query', 'T-SQL', or 'database fields' in the final response.`;

  const answerResponse = await openai.chat.completions.create({
    model: modelName,
    messages: [{ role: "user", content: answerPrompt }],
    temperature: 0,
  });

  const answer = answerResponse.choices[0]?.message?.content || "No answer generated.";

  return {
    answer,
    source: { sql_query: sqlQuery, raw_results: rawResults }
  };
}
