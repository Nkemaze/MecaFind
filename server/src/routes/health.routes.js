const { Router } = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');

const router = Router();

router.get('/', (_request, response) => {
  response.json({ status: 'ok', service: 'mecafind-api' });
});

router.get('/seed-admin', async (_request, response) => {
  try {
    const email = 'admin@mecafind.com';
    const name = 'MecaFind Admin';
    const password = 'Admin@MecaFind2026';
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin') ON CONFLICT (email) DO NOTHING RETURNING email`,
      [name, email, passwordHash],
    );
    if (!result.rowCount) return response.json({ message: 'Admin already exists.' });
    return response.json({ message: 'Admin created.', email, password });
  } catch (error) { return response.status(500).json({ message: error.message }); }
});

module.exports = router;
