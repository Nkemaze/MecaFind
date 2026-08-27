require('dotenv').config();

const app = require('./app');
const pool = require('./db/pool');
const port = Number(process.env.PORT ?? 4000);

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected successfully.');

    app.listen(port, () => {
      console.log(`MecaFind API listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
