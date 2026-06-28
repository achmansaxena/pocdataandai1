export interface BusinessQuestion {
  id: string;
  category: 'Renewal' | 'Product' | 'Support' | 'Contract' | 'Finance';
  question: string;
  expectedEntities: string[];
}

export const BUSINESS_QUESTIONS: BusinessQuestion[] = [
  // Renewal Risk
  {
    id: 'Q1',
    category: 'Renewal',
    question: 'Why is Customer X at risk of renewal?',
    expectedEntities: ['Customer', 'SupportCase', 'Contract', 'FinancialMetrics'],
  },
  {
    id: 'Q2',
    category: 'Renewal',
    question: 'Show me all active customers with a critical support case and a contract expiring in the next 30 days.',
    expectedEntities: ['Customer', 'SupportCase', 'Contract'],
  },
  
  // Product & Ownership
  {
    id: 'Q3',
    category: 'Product',
    question: 'What products does Customer X own?',
    expectedEntities: ['Customer', 'Product', 'Entitlement'],
  },
  {
    id: 'Q4',
    category: 'Product',
    question: 'Which customers own Product Y but do not have an active contract for it?',
    expectedEntities: ['Customer', 'Product', 'Contract', 'Entitlement'],
  },
  
  // Contracts
  {
    id: 'Q5',
    category: 'Contract',
    question: 'Which contracts are associated with Customer X?',
    expectedEntities: ['Customer', 'Contract'],
  },
  {
    id: 'Q6',
    category: 'Contract',
    question: 'What is the total value of all active contracts for Customer X?',
    expectedEntities: ['Customer', 'Contract', 'FinancialMetrics'],
  },
  
  // Support Impact
  {
    id: 'Q7',
    category: 'Support',
    question: 'What support issues impact renewal outcomes for Customer X?',
    expectedEntities: ['Customer', 'SupportCase', 'Contract'],
  },
  {
    id: 'Q8',
    category: 'Support',
    question: 'How many unresolved critical support cases exist for our top 10 MRR customers?',
    expectedEntities: ['Customer', 'SupportCase', 'FinancialMetrics'],
  },
  
  // Finance & Revenue
  {
    id: 'Q9',
    category: 'Finance',
    question: 'Which churned customers had the highest total spend?',
    expectedEntities: ['Customer', 'FinancialMetrics'],
  },
  {
    id: 'Q10',
    category: 'Finance',
    question: 'What is the MRR breakdown by product for Customer X?',
    expectedEntities: ['Customer', 'Product', 'FinancialMetrics', 'Entitlement'],
  }
];
