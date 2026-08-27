const pool = require('../db/pool');
const { z } = require('../validators/common');

const paymentSchema = z.object({ provider: z.string().trim().min(2).max(80) });
const directionUseSchema = z.object({ requestId: z.string().uuid() });

async function wallet(request, response) {
  const result = await pool.query(
    'SELECT free_uses_remaining AS "freeUsesRemaining", paid_uses_remaining AS "paidUsesRemaining" FROM usage_wallets WHERE user_id = $1',
    [request.user.id],
  );
  if (!result.rowCount) return response.status(404).json({ message: 'Usage wallet not found.' });
  const data = result.rows[0];
  return response.json({ ...data, totalUsesRemaining: data.freeUsesRemaining + data.paidUsesRemaining });
}

async function transactions(request, response) {
  const result = await pool.query(
    `SELECT ut.id, ut.type, ut.source, ut.created_at AS "createdAt", mp.workshop_name AS "workshopName"
       FROM usage_transactions ut LEFT JOIN mechanic_profiles mp ON mp.id = ut.mechanic_profile_id
      WHERE ut.user_id = $1 ORDER BY ut.created_at DESC LIMIT 100`,
    [request.user.id],
  );
  return response.json({ transactions: result.rows });
}

async function useDirections(request, response) {
  const { requestId } = directionUseSchema.parse(request.body);
  const mechanicResult = await pool.query(
    `SELECT id FROM mechanic_profiles WHERE id = $1 AND approval_status = 'approved'`,
    [request.params.id],
  );
  if (!mechanicResult.rowCount) return response.status(404).json({ message: 'Approved mechanic not found.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const walletResult = await client.query(
      'SELECT free_uses_remaining, paid_uses_remaining FROM usage_wallets WHERE user_id = $1 FOR UPDATE',
      [request.user.id],
    );
    if (!walletResult.rowCount) {
      await client.query('ROLLBACK');
      return response.status(404).json({ message: 'Usage wallet not found.' });
    }
    const existingUse = await client.query(
      `SELECT source FROM usage_transactions
        WHERE user_id = $1 AND request_id = $2 FOR UPDATE`,
      [request.user.id, requestId],
    );
    if (existingUse.rowCount) {
      const updated = await client.query(
        'SELECT free_uses_remaining AS "freeUsesRemaining", paid_uses_remaining AS "paidUsesRemaining" FROM usage_wallets WHERE user_id = $1',
        [request.user.id],
      );
      await client.query('COMMIT');
      const data = updated.rows[0];
      return response.json({ message: 'Directions already granted.', alreadyGranted: true, source: existingUse.rows[0].source, ...data, totalUsesRemaining: data.freeUsesRemaining + data.paidUsesRemaining });
    }
    const balance = walletResult.rows[0];
    let source;
    if (balance.free_uses_remaining > 0) source = 'free';
    else if (balance.paid_uses_remaining > 0) source = 'paid';
    else {
      await client.query('ROLLBACK');
      return response.status(402).json({ message: 'You have no uses remaining. Buy a 5-use package to continue.' });
    }
    const column = source === 'free' ? 'free_uses_remaining' : 'paid_uses_remaining';
    await client.query(`UPDATE usage_wallets SET ${column} = ${column} - 1, updated_at = NOW() WHERE user_id = $1`, [request.user.id]);
    await client.query(
      `INSERT INTO usage_transactions (user_id, mechanic_profile_id, request_id, type, source)
       VALUES ($1, $2, $3, 'directions', $4)`,
      [request.user.id, request.params.id, requestId, source],
    );
    const updated = await client.query(
      'SELECT free_uses_remaining AS "freeUsesRemaining", paid_uses_remaining AS "paidUsesRemaining" FROM usage_wallets WHERE user_id = $1',
      [request.user.id],
    );
    await client.query('COMMIT');
    const data = updated.rows[0];
    return response.json({ message: 'Direction use granted.', source, ...data, totalUsesRemaining: data.freeUsesRemaining + data.paidUsesRemaining });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function createCheckout(request, response) {
  const input = paymentSchema.parse(request.body);
  const result = await pool.query(
    `INSERT INTO payments (user_id, provider, amount_fcfa, usages_granted)
     VALUES ($1, $2, 1000, 5)
     RETURNING id, provider, amount_fcfa AS "amountFcfa", usages_granted AS "usagesGranted", status`,
    [request.user.id, input.provider],
  );
  return response.status(201).json({
    payment: result.rows[0],
    message: 'Payment created. Connect the selected provider to collect and confirm the payment.',
  });
}

async function payments(request, response) {
  const result = await pool.query(
    `SELECT id, provider, provider_reference AS "providerReference", amount_fcfa AS "amountFcfa",
            usages_granted AS "usagesGranted", status, created_at AS "createdAt", confirmed_at AS "confirmedAt"
       FROM payments WHERE user_id = $1 ORDER BY created_at DESC`,
    [request.user.id],
  );
  return response.json({ payments: result.rows });
}

module.exports = { createCheckout, payments, transactions, useDirections, wallet };
