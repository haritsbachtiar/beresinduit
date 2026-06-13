-- ============================================================
-- Migration 003: Transactions
-- ============================================================

CREATE TABLE transactions (
  id          UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID            REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID            REFERENCES categories(id) ON DELETE SET NULL,
  type        transaction_type NOT NULL,
  amount      BIGINT          NOT NULL CHECK (amount > 0),
  description TEXT            NOT NULL DEFAULT '',
  notes       TEXT,
  date        DATE            NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ     DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ     DEFAULT NOW() NOT NULL
);

CREATE INDEX transactions_user_id_idx   ON transactions (user_id);
CREATE INDEX transactions_date_idx      ON transactions (date DESC);
CREATE INDEX transactions_type_idx      ON transactions (type);
CREATE INDEX transactions_category_idx  ON transactions (category_id);

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Row Level Security: transactions
-- ============================================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions: lihat milik sendiri"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "transactions: buat milik sendiri"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions: ubah milik sendiri"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions: hapus milik sendiri"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
