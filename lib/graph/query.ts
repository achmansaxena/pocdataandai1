/**
 * lib/graph/query.ts
 * Executes raw Cypher queries against Neo4j and returns structured results
 * including the relationship path and source systems involved.
 */

import { getNeo4jDriver } from "@/lib/graph/neo4j";
import type { GraphQueryResult } from "@/lib/graph/types";

/**
 * Runs a Cypher query and returns records + metadata.
 * Source systems are extracted from `source` properties on returned nodes.
 */
export async function runCypherQuery(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<GraphQueryResult> {
  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    const result = await session.run(cypher, params);

    const records = result.records.map((record) => {
      const row: Record<string, unknown> = {};
      record.keys.forEach((key) => {
        const val = record.get(key);
        // Flatten Neo4j nodes to plain objects
        if (val && typeof val === "object" && "properties" in val) {
          row[key as string] = (val as { properties: Record<string, unknown> }).properties;
        } else {
          row[key as string] = val;
        }
      });
      return row;
    });

    // Collect unique source systems from node properties
    const sourceSystems = new Set<string>();
    records.forEach((row) => {
      Object.values(row).forEach((val) => {
        if (val && typeof val === "object" && "source" in val) {
          sourceSystems.add((val as { source: string }).source);
        }
      });
    });

    // Extract relationship path from the Cypher query pattern for display
    const pathMatch = cypher.match(/\(:\w+\)(?:-\[:\w+\]->|\s*->\s*)\(:\w+\)/g);
    const relationshipPath = pathMatch ?? [];

    return {
      records,
      summary: {
        relationshipPath,
        sourceSystems: Array.from(sourceSystems),
      },
    };
  } finally {
    await session.close();
  }
}
