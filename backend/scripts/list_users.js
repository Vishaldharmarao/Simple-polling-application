const mysql = require('mysql2/promise');

async function listUsers() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'polling_app';

  const conn = await mysql.createConnection({ host, user, password, database });
  try {
    const [rows] = await conn.query('SELECT id, email, password, role FROM users;');
    if (!rows || rows.length === 0) {
      console.log('No users found in', database + '.users');
      return;
    }
    console.table(rows.map(r => ({ id: r.id, email: r.email, password: r.password, role: r.role })));
  } catch (err) {
    console.error('Error querying users:', err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

listUsers().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
