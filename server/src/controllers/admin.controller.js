const pool = require('../db/pool');
const { z } = require('../validators/common');

const statusSchema = z.object({ status: z.enum(['approved', 'rejected', 'suspended', 'pending']) });
const accountStatusSchema = z.object({ status: z.enum(['active', 'suspended']) });

async function mechanics(_request, response) {
  const result = await pool.query(
    `SELECT mp.id, mp.workshop_name AS "workshopName", mp.address, mp.city, mp.approval_status AS "approvalStatus",
            mp.created_at AS "createdAt", u.name AS "mechanicName", u.email, u.status AS "accountStatus"
       FROM mechanic_profiles mp JOIN users u ON u.id = mp.user_id
      ORDER BY mp.created_at DESC`,
  );
  return response.json({ mechanics: result.rows });
}

async function updateMechanicStatus(request, response) {
  const input = statusSchema.parse(request.body);
  const result = await pool.query(
    `UPDATE mechanic_profiles SET approval_status = $2, updated_at = NOW() WHERE id = $1
     RETURNING id, approval_status AS "approvalStatus"`,
    [request.params.id, input.status],
  );
  if (!result.rowCount) return response.status(404).json({ message: 'Mechanic not found.' });
  return response.json({ mechanic: result.rows[0] });
}

async function users(_request, response) {
  const result = await pool.query(
    `SELECT id, name, email, phone, role, status, created_at AS "createdAt"
       FROM users ORDER BY created_at DESC LIMIT 200`,
  );
  return response.json({ users: result.rows });
}

async function updateUserStatus(request, response) {
  const input = accountStatusSchema.parse(request.body);
  if (request.params.id === request.user.id) return response.status(400).json({ message: 'You cannot change your own account status.' });
  const result = await pool.query(
    `UPDATE users SET status = $2, updated_at = NOW() WHERE id = $1
     RETURNING id, status`,
    [request.params.id, input.status],
  );
  if (!result.rowCount) return response.status(404).json({ message: 'User not found.' });
  return response.json({ user: result.rows[0] });
}

async function paymentRecords(_request, response) {
  const result = await pool.query(
    `SELECT p.id, p.provider, p.amount_fcfa AS "amountFcfa", p.status, p.usages_granted AS "usagesGranted",
            p.created_at AS "createdAt", u.name AS "userName", u.email
       FROM payments p JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC LIMIT 200`,
  );
  return response.json({ payments: result.rows });
}

async function confirmPayment(request, response) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const paymentResult = await client.query('SELECT * FROM payments WHERE id = $1 FOR UPDATE', [request.params.id]);
    if (!paymentResult.rowCount) {
      await client.query('ROLLBACK');
      return response.status(404).json({ message: 'Payment not found.' });
    }
    const payment = paymentResult.rows[0];
    if (payment.status === 'confirmed') {
      await client.query('ROLLBACK');
      return response.status(409).json({ message: 'This payment is already confirmed.' });
    }
    if (payment.status !== 'pending') {
      await client.query('ROLLBACK');
      return response.status(400).json({ message: 'Only pending payments can be confirmed.' });
    }
    await client.query(`UPDATE payments SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1`, [payment.id]);
    await client.query(
      `UPDATE usage_wallets SET paid_uses_remaining = paid_uses_remaining + $2, updated_at = NOW() WHERE user_id = $1`,
      [payment.user_id, payment.usages_granted],
    );
    await client.query('COMMIT');
    return response.json({ message: 'Payment confirmed and uses added.' });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { confirmPayment, mechanics, paymentRecords, updateMechanicStatus, updateUserStatus, users };
