import { NextRequest, NextResponse } from "next/server";
import { executeTextToSQL } from "@/lib/ai/sql-agent";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ error: "Missing question parameter" }, { status: 400 });
    }

    const result = await executeTextToSQL(question);

    return NextResponse.json(result);

  } catch (error) {
    const raw = error instanceof Error ? error.message : "Internal Server Error";
    const message = raw.includes("429")
      ? "The AI service is currently experiencing high traffic. Please wait a moment and try again."
      : raw;

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
