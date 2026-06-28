/**
 * lib/graph/types.ts
 * Domain entity and relationship types for the Knowledge Graph.
 */

// ── Entity node types ─────────────────────────────────────────────────────────

export interface CustomerNode {
  id: string;
  name: string;
  industry: string;
  tier: "Enterprise" | "Mid-Market" | "SMB";
  region: string;
  healthScore: number; // 0–100
  source: "CRM" | "AdventureWorks SQL";
}

export interface ProductNode {
  id: string;
  name: string;
  category: string;
  version: string;
  source: "ProductCatalog" | "AdventureWorks SQL";
}

export interface ContractNode {
  id: string;
  value: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Expiring" | "Expired" | "Renewed";
  renewalRisk: "Low" | "Medium" | "High";
  source: "CRM";
}

export interface EntitlementNode {
  id: string;
  seats: number;
  usagePercent: number;
  featureSet: string;
  source: "Entitlement";
}

export interface SupportCaseNode {
  id: string;
  title: string;
  severity: "P1" | "P2" | "P3" | "P4";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  openedDate: string;
  source: "SupportSystem";
}

export interface FinancialMetricsNode {
  id: string;
  arr: number;           // Annual Recurring Revenue
  mrr: number;           // Monthly Recurring Revenue
  ltv: number;           // Lifetime Value
  churnRisk: number;     // 0–100
  source: "FinanceSystem";
}

export interface ContactNode {
  id: string;
  name: string;
  role: string;
  email: string;
  isPrimary: boolean;
  source: "CRM";
}

// ── Relationship types ────────────────────────────────────────────────────────

export type RelationshipType =
  | "OWNS"           // Customer → Product
  | "HAS_CONTRACT"   // Customer → Contract
  | "ENABLES"        // Contract → Entitlement
  | "OPENED_CASE"    // Customer → SupportCase
  | "GENERATES"      // Customer → FinancialMetrics
  | "MANAGED_BY";    // Customer → Contact

// ── Graph query result ────────────────────────────────────────────────────────

export interface GraphQueryResult {
  records: Record<string, unknown>[];
  summary: {
    relationshipPath: string[];
    sourceSystems: string[];
  };
}
