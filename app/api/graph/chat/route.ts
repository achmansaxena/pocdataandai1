import { NextRequest, NextResponse } from "next/server";
import { executeGraphQuery } from "@/lib/ai/graph-agent";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'question' field." }, { status: 400 });
    }

    const result = await executeGraphQuery(question);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message.includes("429") ? 429 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
