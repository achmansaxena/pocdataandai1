/**
 * lib/api.ts – Typed client for Next.js API Routes.
 */

export interface SQLSource {
  sql_query: string;
  raw_results: Record<string, unknown>[];
}

export interface ChatResponse {
  answer: string;
  source: SQLSource;
}

export async function sendChatMessage(question: string): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(\`API error \${res.status}: \${errorText}\`);
  }

  return res.json() as Promise<ChatResponse>;
}
