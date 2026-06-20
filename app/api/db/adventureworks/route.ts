import { NextResponse } from 'next/server';
import { poolPromise } from '@/lib/db/sql';

export async function GET() {
  try {
    const pool = await poolPromise;
    
    // Query some data from AdventureWorks to verify it works
    // We are querying top 10 products
    const result = await pool.request().query(`
      SELECT TOP 10 
        ProductID, 
        Name, 
        ProductNumber, 
        Color, 
        StandardCost, 
        ListPrice
      FROM Production.Product
      WHERE ListPrice > 0
      ORDER BY ListPrice DESC
    `);

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully connected to AdventureWorks database',
      data: result.recordset 
    });
  } catch (error: any) {
    console.error('AdventureWorks connection failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to query database', 
      details: error.message 
    }, { status: 500 });
  }
}
