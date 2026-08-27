ALTER TABLE usage_transactions
  ADD COLUMN IF NOT EXISTS request_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS usage_transactions_request_id_unique
  ON usage_transactions (request_id)
  WHERE request_id IS NOT NULL;
