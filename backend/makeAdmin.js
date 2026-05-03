require('dotenv').config();
const mysql = require('mysql2/promise');

async function makeAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    const email = 'athithyaperumal1244@gmail.com';
    const [result] = await connection.execute(
      'UPDATE users SET role = ? WHERE email = ?',
      ['admin', email]
    );

    if (result.affectedRows > 0) {
      console.log(`Success! User ${email} is now an admin.`);
    } else {
      console.log(`User ${email} not found. Did you register?`);
    }
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await connection.end();
  }
}

makeAdmin();
