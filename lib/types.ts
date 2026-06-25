/**
 * lib/types.ts
 * Canonical shared types for the entire application.
 * Single source of truth — never duplicate these elsewhere.
 */

// ── Chat / Message ────────────────────────────────────────────────────────────

export type Role = "user" | "assistant";

/** Source data shown in the SQL explainability panel. */
export interface SQLSource {
  sql_query: string;
  raw_results: Record<string, unknown>[];
}

/** Source data shown in the Graph explainability panel. */
export interface GraphSource {
  cypher_query: string;
  relationship_path: string[];
  source_systems: string[];
  reasoning_summary: string;
  raw_results: Record<string, unknown>[];
}

/** A single chat message — user or assistant. */
export interface Message {
  id: string;
  role: Role;
  content: string;
  /** Present on assistant messages that used the SQL agent. */
  sqlSource?: SQLSource;
  /** Present on assistant messages that used the Graph agent. */
  graphSource?: GraphSource;
}

// ── API Response shapes ───────────────────────────────────────────────────────

export interface ChatAPIResponse {
  answer: string;
  source: SQLSource;
}

export interface GraphAPIResponse {
  answer: string;
  source: GraphSource;
}
