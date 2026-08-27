require('dotenv').config();

const bcrypt = require('bcryptjs');

const pool = require('../src/db/pool');

async function createAdmin() {
  const { ADMIN_EMAIL: email, ADMIN_NAME: name = 'MecaFind Admin', ADMIN_PASSWORD: password } = process.env;
  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env before creating an administrator.');
  }
  if (password.length < 8) throw new Error('ADMIN_PASSWORD must have at least 8 characters.');

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING
     RETURNING email`,
    [name, email.toLowerCase(), passwordHash],
  );
  if (!result.rowCount) console.log('An account with that email already exists.');
  else console.log(`Administrator created for ${result.rows[0].email}.`);
}

createAdmin()
  .catch((error) => {
    console.error(`Could not create administrator: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
