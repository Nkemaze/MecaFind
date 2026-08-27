require('dotenv').config();

const fs = require('fs');
const path = require('path');
const app = require('./app');
const pool = require('./db/pool');
const port = Number(process.env.PORT ?? 4000);

async function initSchema() {
  const check = await pool.query(`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') AS exists`);
  if (check.rows[0].exists) {
    console.log('Database tables already exist.');
    return;
  }
  console.log('Initializing database schema...');
  const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('Database schema created successfully.');
}

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected successfully.');

    await initSchema();

    app.listen(port, () => {
      console.log(`MecaFind API listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
