const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function run() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'polling_app';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@polling.com';
  const newPassword = process.env.NEW_PASSWORD || 'admin123';

  console.log(`Connecting to MySQL @ ${host} as ${user}...`);
  const conn = await mysql.createConnection({ host, user, password, database });

  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(newPassword, saltRounds);

    const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', [adminEmail]);

    if (rows && rows.length > 0) {
      const id = rows[0].id;
      await conn.query('UPDATE users SET password = ? WHERE id = ?', [hash, id]);
      console.log(`Updated password for existing admin ${adminEmail} (id=${id}).`);
    } else {
      const [res] = await conn.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [adminEmail, hash, 'admin']);
      console.log(`Inserted new admin ${adminEmail} (id=${res.insertId}).`);
    }
  } catch (err) {
    console.error('Error setting admin password:', err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

run().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
