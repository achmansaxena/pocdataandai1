/**
 * lib/graph/neo4j.ts
 * Singleton Neo4j driver — reused across hot-reloads in Next.js dev mode.
 */

import neo4j, { Driver } from "neo4j-driver";

const globalForNeo4j = global as unknown as { neo4jDriver?: Driver };

export function getNeo4jDriver(): Driver {
  if (!globalForNeo4j.neo4jDriver) {
    const uri = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !username || !password) {
      throw new Error("Missing NEO4J_URI, NEO4J_USERNAME, or NEO4J_PASSWORD environment variables.");
    }

    globalForNeo4j.neo4jDriver = neo4j.driver(
      uri,
      neo4j.auth.basic(username, password),
      { disableLosslessIntegers: true }
    );
  }

  return globalForNeo4j.neo4jDriver;
}
