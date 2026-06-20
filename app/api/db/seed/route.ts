import { NextResponse } from 'next/server';
import neo4j from 'neo4j-driver';

export async function GET() {
  const driver = neo4j.driver(
    process.env.NEO4J_URI || '',
    neo4j.auth.basic(process.env.NEO4J_USERNAME || '', process.env.NEO4J_PASSWORD || '')
  );

  const session = driver.session();

  try {
    // Wipe clean
    await session.run('MATCH (n) DETACH DELETE n');

    // Create 3 Customers
    const customerQuery = `
      CREATE (c1:Customer {id: "CUST-001", name: "Acme Corp", industry: "Manufacturing"})
      CREATE (c2:Customer {id: "CUST-002", name: "Umbrella Ltd", industry: "Pharmaceuticals"})
      CREATE (c3:Customer {id: "CUST-003", name: "Stark Industries", industry: "Defense"})
      RETURN c1, c2, c3
    `;
    await session.run(customerQuery);

    // Create 4 Products
    const productQuery = `
      CREATE (p1:Product {id: "PROD-100", name: "Widget X", category: "Hardware"})
      CREATE (p2:Product {id: "PROD-200", name: "Cloud Sync Pro", category: "Software"})
      CREATE (p3:Product {id: "PROD-300", name: "Cyber Shield", category: "Security"})
      CREATE (p4:Product {id: "PROD-400", name: "Arc Reactor", category: "Energy"})
      RETURN p1, p2, p3, p4
    `;
    await session.run(productQuery);

    // Create 3 Contracts
    const contractQuery = `
      CREATE (ct1:Contract {id: "CONT-1001", status: "Active", value: 50000})
      CREATE (ct2:Contract {id: "CONT-1002", status: "Expired", value: 25000})
      CREATE (ct3:Contract {id: "CONT-1003", status: "Pending", value: 150000})
      RETURN ct1, ct2, ct3
    `;
    await session.run(contractQuery);

    // Create 3 Support Cases
    const supportQuery = `
      CREATE (s1:SupportCase {id: "CASE-901", status: "Open", priority: "Critical"})
      CREATE (s2:SupportCase {id: "CASE-902", status: "Closed", priority: "Low"})
      CREATE (s3:SupportCase {id: "CASE-903", status: "Open", priority: "High Risk"})
      RETURN s1, s2, s3
    `;
    await session.run(supportQuery);

    // Create Relationships
    // (Customer)-[:OWNS]->(Product)
    await session.run(`
      MATCH (c:Customer {id: "CUST-001"}), (p:Product {id: "PROD-100"})
      CREATE (c)-[:OWNS]->(p)
    `);
    await session.run(`
      MATCH (c:Customer {id: "CUST-002"}), (p:Product {id: "PROD-200"})
      CREATE (c)-[:OWNS]->(p)
    `);
    await session.run(`
      MATCH (c:Customer {id: "CUST-003"}), (p:Product {id: "PROD-400"})
      CREATE (c)-[:OWNS]->(p)
    `);

    // (Customer)-[:HAS_CONTRACT]->(Contract)
    await session.run(`
      MATCH (c:Customer {id: "CUST-001"}), (ct:Contract {id: "CONT-1001"})
      CREATE (c)-[:HAS_CONTRACT]->(ct)
    `);
    await session.run(`
      MATCH (c:Customer {id: "CUST-002"}), (ct:Contract {id: "CONT-1002"})
      CREATE (c)-[:HAS_CONTRACT]->(ct)
    `);
    await session.run(`
      MATCH (c:Customer {id: "CUST-003"}), (ct:Contract {id: "CONT-1003"})
      CREATE (c)-[:HAS_CONTRACT]->(ct)
    `);

    // (Customer)-[:OPENED]->(SupportCase)
    await session.run(`
      MATCH (c:Customer {id: "CUST-001"}), (s:SupportCase {id: "CASE-901"})
      CREATE (c)-[:OPENED]->(s)
    `);
    await session.run(`
      MATCH (c:Customer {id: "CUST-002"}), (s:SupportCase {id: "CASE-902"})
      CREATE (c)-[:OPENED]->(s)
    `);
    await session.run(`
      MATCH (c:Customer {id: "CUST-003"}), (s:SupportCase {id: "CASE-903"})
      CREATE (c)-[:OPENED]->(s)
    `);

    return NextResponse.json({ success: true, message: 'Database seeded successfully with sample Enterprise data.' });
  } catch (error) {
    console.error('Database seeding failed:', error);
    return NextResponse.json({ success: false, error: 'Database seeding failed.' }, { status: 500 });
  } finally {
    await session.close();
    await driver.close();
  }
}
