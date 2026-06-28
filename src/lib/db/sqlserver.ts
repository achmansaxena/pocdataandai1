import sql from 'mssql';

// Singleton for SQL Server Connection Pool
let pool: sql.ConnectionPool | null = null;

const sqlConfig: sql.config = {
  user: process.env.MSSQL_USER || 'sa',
  password: process.env.MSSQL_PASSWORD || 'YourStrong!Passw0rd',
  database: process.env.MSSQL_DATABASE || 'AdventureWorks2022',
  server: process.env.MSSQL_SERVER || 'localhost',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // For local dev
    trustServerCertificate: true
  }
};

export const getSqlPool = async (): Promise<sql.ConnectionPool> => {
  if (!pool) {
    pool = await new sql.ConnectionPool(sqlConfig).connect();
  }
  return pool;
};

export const closeSqlPool = async () => {
  if (pool) {
    await pool.close();
    pool = null;
  }
};
