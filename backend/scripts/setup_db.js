const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('Schema file not found:', schemaPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');

  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || undefined; // schema.sql creates DB itself

  console.log(`Connecting to MySQL @ ${host} as ${user}...`);

  const connection = await mysql.createConnection({
    host,
    user,
    password,
    multipleStatements: true,
  });

  try {
    console.log('Running schema.sql...');
    const [results] = await connection.query(sql);
    console.log('Schema executed successfully.');
  } catch (err) {
    console.error('Error running schema:', err.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

run().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
