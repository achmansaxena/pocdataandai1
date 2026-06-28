// Enterprise Context Layer - Canonical Entity Model

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  sourceSystem: string;
}

export interface Customer extends BaseEntity {
  name: string;
  industry: string;
  segment: string;
  status: 'ACTIVE' | 'CHURNED' | 'AT_RISK';
}

export interface Product extends BaseEntity {
  name: string;
  category: string;
  sku: string;
}

export interface Contract extends BaseEntity {
  customerId: string;
  startDate: Date;
  endDate: Date;
  value: number;
  status: 'ACTIVE' | 'EXPIRED' | 'RENEWING';
}

export interface Entitlement extends BaseEntity {
  contractId: string;
  productId: string;
  quantity: number;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface SupportCase extends BaseEntity {
  customerId: string;
  productId?: string;
  subject: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

export interface FinancialMetrics extends BaseEntity {
  customerId: string;
  arr: number; // Annual Recurring Revenue
  mrr: number; // Monthly Recurring Revenue
  totalSpend: number;
}

export interface Contact extends BaseEntity {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// Graph Relationships mapped for reference
// - Customer [OWNS] Product
// - Customer [HAS] Contract
// - Contract [ENABLES] Entitlement
// - Customer [OPENS] SupportCase
// - Customer [GENERATES] Revenue (FinancialMetrics)
// - Contact [MANAGES] Customer
