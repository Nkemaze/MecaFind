const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const pool = require('../db/pool');
const { createToken, publicUser } = require('../services/auth.service');
const { z } = require('../validators/common');

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  phone: z.string().trim().max(32).optional(),
  role: z.enum(['car_owner', 'mechanic']).default('car_owner'),
});

const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
});

const resetPasswordSchema = z.object({
  token: z.string().min(32).max(256),
  password: z.string().min(8).max(128),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

async function register(request, response) {
  const input = registrationSchema.parse(request.body);
  const passwordHash = await bcrypt.hash(input.password, 12);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, status`,
      [input.name, input.email, passwordHash, input.phone ?? null, input.role],
    );
    const user = result.rows[0];
    if (user.role === 'car_owner') {
      await client.query('INSERT INTO usage_wallets (user_id) VALUES ($1)', [user.id]);
    }
    await client.query('COMMIT');
    return response.status(201).json({ user: publicUser(user), token: createToken(user) });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function login(request, response) {
  const input = loginSchema.parse(request.body);
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [input.email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
    return response.status(401).json({ message: 'Email or password is incorrect.' });
  }
  if (user.status !== 'active') return response.status(403).json({ message: 'This account is suspended.' });
  return response.json({ user: publicUser(user), token: createToken(user) });
}

async function me(request, response) {
  const result = await pool.query(
    'SELECT id, name, email, phone, role, status FROM users WHERE id = $1',
    [request.user.id],
  );
  if (!result.rowCount) return response.status(404).json({ message: 'User not found.' });
  return response.json({ user: publicUser(result.rows[0]) });
}

async function forgotPassword(request, response) {
  const { email } = forgotPasswordSchema.parse(request.body);
  const result = await pool.query('SELECT id FROM users WHERE email = $1 AND status = \'active\'', [email]);
  const message = 'If an active account exists for that email, a password-reset link has been prepared.';
  if (!result.rowCount) return response.json({ message });

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await pool.query(
    `UPDATE users
        SET password_reset_token_hash = $2, password_reset_expires_at = NOW() + INTERVAL '30 minutes', updated_at = NOW()
      WHERE id = $1`,
    [result.rows[0].id, tokenHash],
  );

  // Connect an email provider here for production. Returning a development link
  // keeps local testing usable without exposing reset tokens in production.
  if (process.env.NODE_ENV !== 'production') {
    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';
    return response.json({ message, developmentResetUrl: `${clientUrl}/auth/reset-password?token=${token}` });
  }
  return response.json({ message });
}

async function resetPassword(request, response) {
  const { token, password } = resetPasswordSchema.parse(request.body);
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const result = await pool.query(
    `SELECT id FROM users
      WHERE password_reset_token_hash = $1 AND password_reset_expires_at > NOW()`,
    [tokenHash],
  );
  if (!result.rowCount) return response.status(400).json({ message: 'This password-reset link is invalid or has expired.' });
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `UPDATE users
        SET password_hash = $2, password_reset_token_hash = NULL, password_reset_expires_at = NULL, updated_at = NOW()
      WHERE id = $1`,
    [result.rows[0].id, passwordHash],
  );
  return response.json({ message: 'Your password has been reset. You can now sign in.' });
}

async function changePassword(request, response) {
  const { currentPassword, newPassword } = changePasswordSchema.parse(request.body);
  const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [request.user.id]);
  if (!result.rowCount) return response.status(404).json({ message: 'User not found.' });
  if (!(await bcrypt.compare(currentPassword, result.rows[0].password_hash))) {
    return response.status(400).json({ message: 'Your current password is incorrect.' });
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1', [request.user.id, passwordHash]);
  return response.json({ message: 'Your password has been changed.' });
}

module.exports = { changePassword, forgotPassword, login, me, register, resetPassword };
