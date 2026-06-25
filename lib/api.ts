/**
 * lib/api.ts
 * Typed HTTP client for all Next.js API routes.
 */

import type { ChatAPIResponse, GraphAPIResponse } from "@/lib/types";

export type { ChatAPIResponse, GraphAPIResponse };

export async function sendChatMessage(question: string): Promise<ChatAPIResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `API error ${res.status}`);
  }

  return res.json() as Promise<ChatAPIResponse>;
}

export async function sendGraphMessage(question: string): Promise<GraphAPIResponse> {
  const res = await fetch("/api/graph/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `API error ${res.status}`);
  }

  return res.json() as Promise<GraphAPIResponse>;
}

export async function triggerGraphSeed(): Promise<{ seeded: number }> {
  const res = await fetch("/api/graph/seed", { method: "POST" });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Seed error ${res.status}`);
  }

  return res.json() as Promise<{ seeded: number }>;
}
