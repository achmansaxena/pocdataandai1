import sql from 'mssql';

const sqlConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong!Passw0rd',
  database: process.env.DB_NAME || 'AdventureWorks2022',
  server: process.env.DB_SERVER || 'localhost',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // for local development
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
};

let poolPromise: Promise<sql.ConnectionPool>;

// In Next.js, it's best practice to reuse the connection pool across API routes
// especially during hot-reloads in development mode
const globalForSql = global as unknown as { poolPromise: Promise<sql.ConnectionPool> };

if (!globalForSql.poolPromise) {
  globalForSql.poolPromise = new sql.ConnectionPool(sqlConfig)
    .connect()
    .then(pool => {
      console.log('Connected to SQL Server (AdventureWorks)');
      return pool;
    })
    .catch(err => {
      console.error('Database Connection Failed! Bad Config: ', err);
      throw err;
    });
}

poolPromise = globalForSql.poolPromise;

export { sql, poolPromise };
