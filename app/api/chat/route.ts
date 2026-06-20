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
    console.error("API Chat execution failed:", error);
    let errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    
    if (errorMessage.includes("429")) {
      errorMessage = "The AI service is currently experiencing high traffic (Rate Limit Exceeded). Please wait a moment and try again.";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
