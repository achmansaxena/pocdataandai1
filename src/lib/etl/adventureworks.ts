import { poolPromise } from '@/lib/db/sql';
import type { CustomerNode, ProductNode } from '@/lib/graph/types';

export async function extractAdventureWorksData() {
  const pool = await poolPromise;
  
  // 1. Extract Products
  // Fetch a subset of active products from AdventureWorks
  const productsResult = await pool.request().query(`
    SELECT TOP 10 
      ProductID, 
      Name, 
      ProductNumber, 
      ProductLine
    FROM Production.Product
    WHERE ListPrice > 0 AND ProductLine IS NOT NULL
  `);

  const products: ProductNode[] = productsResult.recordset.map(row => ({
    id: `AW-PROD-${row.ProductID}`,
    name: row.Name,
    category: row.ProductLine || 'Standard',
    version: row.ProductNumber,
    source: 'AdventureWorks SQL'
  }));

  // 2. Extract Customers
  // Fetch a subset of customers (using a simplified join for POC)
  const customersResult = await pool.request().query(`
    SELECT TOP 10
      c.CustomerID,
      s.Name as StoreName,
      'Retail' as Industry
    FROM Sales.Customer c
    JOIN Sales.Store s ON c.StoreID = s.BusinessEntityID
  `);

  const customers: CustomerNode[] = customersResult.recordset.map(row => ({
    id: `AW-CUST-${row.CustomerID}`,
    name: row.StoreName,
    industry: row.Industry,
    tier: 'Mid-Market',
    region: 'North America',
    healthScore: Math.floor(Math.random() * 40) + 50, // Synthetic score for POC
    source: 'AdventureWorks SQL'
  }));

  return {
    products,
    customers
  };
}
