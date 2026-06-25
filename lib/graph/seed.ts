/**
 * lib/graph/seed.ts
 * Generates synthetic domain data and ingests it into Neo4j.
 * Covers all 6 entity types and 6 relationship types from the POC document.
 * Safe to call multiple times — uses MERGE to avoid duplicates.
 */

import { getNeo4jDriver } from "@/lib/graph/neo4j";
import { applySchema } from "@/lib/graph/schema";
import type {
  CustomerNode,
  ProductNode,
  ContractNode,
  EntitlementNode,
  SupportCaseNode,
  FinancialMetricsNode,
  ContactNode,
} from "@/lib/graph/types";

// ── Synthetic data ────────────────────────────────────────────────────────────

const CUSTOMERS: CustomerNode[] = [
  { id: "CUST-001", name: "Acme Corp",        industry: "Manufacturing",  tier: "Enterprise",  region: "North America", healthScore: 72, source: "CRM" },
  { id: "CUST-002", name: "TechNova Inc",     industry: "Technology",    tier: "Enterprise",  region: "Europe",        healthScore: 55, source: "CRM" },
  { id: "CUST-003", name: "RetailMax",        industry: "Retail",        tier: "Mid-Market",  region: "Asia Pacific",  healthScore: 81, source: "CRM" },
  { id: "CUST-004", name: "HealthBridge",     industry: "Healthcare",    tier: "Enterprise",  region: "North America", healthScore: 40, source: "CRM" },
  { id: "CUST-005", name: "FinEdge Capital",  industry: "Finance",       tier: "Mid-Market",  region: "Europe",        healthScore: 91, source: "CRM" },
];

const PRODUCTS: ProductNode[] = [
  { id: "PROD-001", name: "DataSphere Platform",  category: "Data Platform",  version: "3.2", source: "ProductCatalog" },
  { id: "PROD-002", name: "InsightEngine",        category: "Analytics",      version: "2.1", source: "ProductCatalog" },
  { id: "PROD-003", name: "ConnectHub",           category: "Integration",    version: "1.8", source: "ProductCatalog" },
  { id: "PROD-004", name: "SecureVault",          category: "Security",       version: "4.0", source: "ProductCatalog" },
];

const CONTRACTS: ContractNode[] = [
  { id: "CTR-001", value: 450000, startDate: "2023-01-15", endDate: "2024-01-14", status: "Expiring", renewalRisk: "High",   source: "CRM" },
  { id: "CTR-002", value: 280000, startDate: "2023-06-01", endDate: "2025-05-31", status: "Active",   renewalRisk: "Low",    source: "CRM" },
  { id: "CTR-003", value: 120000, startDate: "2024-01-01", endDate: "2024-12-31", status: "Active",   renewalRisk: "Medium", source: "CRM" },
  { id: "CTR-004", value: 720000, startDate: "2022-09-01", endDate: "2024-08-31", status: "Expiring", renewalRisk: "High",   source: "CRM" },
  { id: "CTR-005", value: 95000,  startDate: "2024-03-01", endDate: "2025-02-28", status: "Active",   renewalRisk: "Low",    source: "CRM" },
];

const ENTITLEMENTS: EntitlementNode[] = [
  { id: "ENT-001", seats: 500, usagePercent: 34, featureSet: "Full Platform", source: "Entitlement" },
  { id: "ENT-002", seats: 200, usagePercent: 88, featureSet: "Analytics Add-On", source: "Entitlement" },
  { id: "ENT-003", seats: 50,  usagePercent: 62, featureSet: "Standard",     source: "Entitlement" },
  { id: "ENT-004", seats: 800, usagePercent: 21, featureSet: "Enterprise Bundle", source: "Entitlement" },
  { id: "ENT-005", seats: 75,  usagePercent: 95, featureSet: "Standard",     source: "Entitlement" },
];

const SUPPORT_CASES: SupportCaseNode[] = [
  { id: "CASE-001", title: "Data ingestion failure on nightly ETL",  severity: "P1", status: "Open",        openedDate: "2024-06-10", source: "SupportSystem" },
  { id: "CASE-002", title: "Dashboard slow to load > 30s",           severity: "P2", status: "In Progress", openedDate: "2024-06-01", source: "SupportSystem" },
  { id: "CASE-003", title: "SSO integration broken after upgrade",   severity: "P1", status: "Open",        openedDate: "2024-06-15", source: "SupportSystem" },
  { id: "CASE-004", title: "Incorrect revenue numbers in reports",   severity: "P2", status: "Resolved",    openedDate: "2024-05-20", source: "SupportSystem" },
  { id: "CASE-005", title: "API rate limit exceeded on bulk export",  severity: "P3", status: "Closed",      openedDate: "2024-04-10", source: "SupportSystem" },
];

const FINANCIAL_METRICS: FinancialMetricsNode[] = [
  { id: "FIN-001", arr: 450000,  mrr: 37500,  ltv: 1350000, churnRisk: 72, source: "FinanceSystem" },
  { id: "FIN-002", arr: 280000,  mrr: 23333,  ltv: 840000,  churnRisk: 45, source: "FinanceSystem" },
  { id: "FIN-003", arr: 120000,  mrr: 10000,  ltv: 360000,  churnRisk: 30, source: "FinanceSystem" },
  { id: "FIN-004", arr: 720000,  mrr: 60000,  ltv: 2160000, churnRisk: 80, source: "FinanceSystem" },
  { id: "FIN-005", arr: 95000,   mrr: 7917,   ltv: 285000,  churnRisk: 12, source: "FinanceSystem" },
];

const CONTACTS: ContactNode[] = [
  { id: "CON-001", name: "Sarah Mitchell",  role: "VP of Engineering",    email: "s.mitchell@acme.com",     isPrimary: true,  source: "CRM" },
  { id: "CON-002", name: "James Park",      role: "CTO",                  email: "j.park@technova.com",     isPrimary: true,  source: "CRM" },
  { id: "CON-003", name: "Priya Sharma",    role: "Head of Operations",   email: "p.sharma@retailmax.com",  isPrimary: true,  source: "CRM" },
  { id: "CON-004", name: "David Chen",      role: "IT Director",          email: "d.chen@healthbridge.com", isPrimary: true,  source: "CRM" },
  { id: "CON-005", name: "Emma Laurent",    role: "CFO",                  email: "e.laurent@finedge.com",   isPrimary: true,  source: "CRM" },
];

// ── Relationships ─────────────────────────────────────────────────────────────

// Customer → [Products]
const OWNS = [
  ["CUST-001", "PROD-001"], ["CUST-001", "PROD-002"],
  ["CUST-002", "PROD-001"], ["CUST-002", "PROD-003"],
  ["CUST-003", "PROD-002"], ["CUST-003", "PROD-004"],
  ["CUST-004", "PROD-001"], ["CUST-004", "PROD-003"], ["CUST-004", "PROD-004"],
  ["CUST-005", "PROD-002"],
];

// Customer → Contract (1:1 for simplicity)
const HAS_CONTRACT = [
  ["CUST-001", "CTR-001"],
  ["CUST-002", "CTR-002"],
  ["CUST-003", "CTR-003"],
  ["CUST-004", "CTR-004"],
  ["CUST-005", "CTR-005"],
];

// Contract → Entitlement
const ENABLES = [
  ["CTR-001", "ENT-001"],
  ["CTR-002", "ENT-002"],
  ["CTR-003", "ENT-003"],
  ["CTR-004", "ENT-004"],
  ["CTR-005", "ENT-005"],
];

// Customer → SupportCase
const OPENED_CASE = [
  ["CUST-001", "CASE-001"],
  ["CUST-002", "CASE-002"],
  ["CUST-004", "CASE-003"],
  ["CUST-001", "CASE-004"],
  ["CUST-003", "CASE-005"],
];

// Customer → FinancialMetrics
const GENERATES = [
  ["CUST-001", "FIN-001"],
  ["CUST-002", "FIN-002"],
  ["CUST-003", "FIN-003"],
  ["CUST-004", "FIN-004"],
  ["CUST-005", "FIN-005"],
];

// Contact → Customer (MANAGED_BY direction: Contact manages Customer)
const MANAGED_BY = [
  ["CON-001", "CUST-001"],
  ["CON-002", "CUST-002"],
  ["CON-003", "CUST-003"],
  ["CON-004", "CUST-004"],
  ["CON-005", "CUST-005"],
];

// ── Seeder ────────────────────────────────────────────────────────────────────

export async function seedGraph(): Promise<number> {
  await applySchema();

  const driver = getNeo4jDriver();
  const session = driver.session();
  let seededNodes = 0;

  try {
    // Nodes
    for (const c of CUSTOMERS) {
      await session.run(`MERGE (n:Customer {id: $id}) SET n += $props`, { id: c.id, props: c });
      seededNodes++;
    }
    for (const p of PRODUCTS) {
      await session.run(`MERGE (n:Product {id: $id}) SET n += $props`, { id: p.id, props: p });
      seededNodes++;
    }
    for (const c of CONTRACTS) {
      await session.run(`MERGE (n:Contract {id: $id}) SET n += $props`, { id: c.id, props: c });
      seededNodes++;
    }
    for (const e of ENTITLEMENTS) {
      await session.run(`MERGE (n:Entitlement {id: $id}) SET n += $props`, { id: e.id, props: e });
      seededNodes++;
    }
    for (const s of SUPPORT_CASES) {
      await session.run(`MERGE (n:SupportCase {id: $id}) SET n += $props`, { id: s.id, props: s });
      seededNodes++;
    }
    for (const f of FINANCIAL_METRICS) {
      await session.run(`MERGE (n:FinancialMetrics {id: $id}) SET n += $props`, { id: f.id, props: f });
      seededNodes++;
    }
    for (const ct of CONTACTS) {
      await session.run(`MERGE (n:Contact {id: $id}) SET n += $props`, { id: ct.id, props: ct });
      seededNodes++;
    }

    // Relationships
    for (const [cid, pid] of OWNS) {
      await session.run(`MATCH (c:Customer {id:$cid}),(p:Product {id:$pid}) MERGE (c)-[:OWNS]->(p)`, { cid, pid });
    }
    for (const [cid, ctid] of HAS_CONTRACT) {
      await session.run(`MATCH (c:Customer {id:$cid}),(ct:Contract {id:$ctid}) MERGE (c)-[:HAS_CONTRACT]->(ct)`, { cid, ctid });
    }
    for (const [ctid, eid] of ENABLES) {
      await session.run(`MATCH (ct:Contract {id:$ctid}),(e:Entitlement {id:$eid}) MERGE (ct)-[:ENABLES]->(e)`, { ctid, eid });
    }
    for (const [cid, sid] of OPENED_CASE) {
      await session.run(`MATCH (c:Customer {id:$cid}),(s:SupportCase {id:$sid}) MERGE (c)-[:OPENED_CASE]->(s)`, { cid, sid });
    }
    for (const [cid, fid] of GENERATES) {
      await session.run(`MATCH (c:Customer {id:$cid}),(f:FinancialMetrics {id:$fid}) MERGE (c)-[:GENERATES]->(f)`, { cid, fid });
    }
    for (const [conid, cid] of MANAGED_BY) {
      await session.run(`MATCH (con:Contact {id:$conid}),(c:Customer {id:$cid}) MERGE (con)-[:MANAGES]->(c)`, { conid, cid });
    }
  } finally {
    await session.close();
  }

  return seededNodes;
}
