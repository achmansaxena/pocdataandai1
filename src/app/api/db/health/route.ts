import { NextResponse } from "next/server";
import { getNeo4jDriver } from "@/lib/graph/neo4j";

export async function GET() {
  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    const result = await session.run("MATCH (n) RETURN count(n) as count");
    const count = result.records[0].get("count") as number;

    return NextResponse.json({
      status: "connected",
      nodeCount: count,
      seeded: count > 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        seeded: false,
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}
