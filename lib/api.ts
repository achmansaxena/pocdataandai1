/**
 * lib/api.ts – Typed client for Next.js API Routes.
 */

export interface GraphSource {
  cypher_query: string;
  raw_results: Record<string, unknown>[];
}

export interface ChatResponse {
  answer: string;
  source: GraphSource;
}

export interface DbHealthResponse {
  status: "connected" | "error";
  nodeCount: number;
  seeded: boolean;
  error?: string;
}

export interface DbSeedResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function sendChatMessage(question: string): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error ${res.status}: ${errorText}`);
  }

  return res.json() as Promise<ChatResponse>;
}

export async function checkDbHealth(): Promise<DbHealthResponse> {
  const res = await fetch("/api/db/health");
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`DB Health error ${res.status}: ${errorText}`);
  }
  return res.json() as Promise<DbHealthResponse>;
}

export async function seedDb(): Promise<DbSeedResponse> {
  const res = await fetch("/api/db/seed", {
    method: "POST",
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`DB Seed error ${res.status}: ${errorText}`);
  }
  return res.json() as Promise<DbSeedResponse>;
}
