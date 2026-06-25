/**
 * lib/graph/schema.ts
 * Applies Neo4j constraints and indexes for the Knowledge Graph.
 * Run once during initialization / seed.
 */

import { getNeo4jDriver } from "@/lib/graph/neo4j";

const CONSTRAINTS = [
  "CREATE CONSTRAINT IF NOT EXISTS FOR (c:Customer)         REQUIRE c.id IS UNIQUE",
  "CREATE CONSTRAINT IF NOT EXISTS FOR (p:Product)          REQUIRE p.id IS UNIQUE",
  "CREATE CONSTRAINT IF NOT EXISTS FOR (c:Contract)         REQUIRE c.id IS UNIQUE",
  "CREATE CONSTRAINT IF NOT EXISTS FOR (e:Entitlement)      REQUIRE e.id IS UNIQUE",
  "CREATE CONSTRAINT IF NOT EXISTS FOR (s:SupportCase)      REQUIRE s.id IS UNIQUE",
  "CREATE CONSTRAINT IF NOT EXISTS FOR (f:FinancialMetrics) REQUIRE f.id IS UNIQUE",
  "CREATE CONSTRAINT IF NOT EXISTS FOR (ct:Contact)         REQUIRE ct.id IS UNIQUE",
];

export async function applySchema(): Promise<void> {
  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    for (const cypher of CONSTRAINTS) {
      await session.run(cypher);
    }
  } finally {
    await session.close();
  }
}
