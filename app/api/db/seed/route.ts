import { NextResponse } from "next/server";
import { seedGraph } from "@/lib/graph/seed";

/** POST /api/db/seed — alias for /api/graph/seed for backwards compatibility. */
export async function POST() {
  try {
    const seeded = await seedGraph();
    return NextResponse.json({ success: true, seeded });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
