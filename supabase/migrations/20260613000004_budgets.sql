-- ============================================================
-- Migration 004: Budgets
-- ============================================================

CREATE TABLE budgets (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id   UUID        REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  limit_amount  BIGINT      NOT NULL CHECK (limit_amount > 0),
  -- Format: 'YYYY-MM' (misal: '2026-06')
  period        TEXT        NOT NULL DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Satu kategori hanya boleh punya satu anggaran per periode
  UNIQUE (user_id, category_id, period)
);

CREATE INDEX budgets_user_id_idx  ON budgets (user_id);
CREATE INDEX budgets_period_idx   ON budgets (period);

CREATE TRIGGER budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Row Level Security: budgets
-- ============================================================
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budgets: lihat milik sendiri"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "budgets: buat milik sendiri"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets: ubah milik sendiri"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets: hapus milik sendiri"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- View: budget_summary
-- Menggabungkan anggaran dengan total pengeluaran aktual
-- ============================================================
CREATE VIEW budget_summary AS
SELECT
  b.id,
  b.user_id,
  b.category_id,
  c.name        AS category_name,
  c.icon        AS category_icon,
  c.color       AS category_color,
  b.limit_amount,
  b.period,
  COALESCE(
    SUM(t.amount) FILTER (
      WHERE t.type = 'pengeluaran'
        AND TO_CHAR(t.date, 'YYYY-MM') = b.period
    ),
    0
  ) AS spent_amount,
  b.created_at,
  b.updated_at
FROM budgets b
JOIN categories c ON c.id = b.category_id
LEFT JOIN transactions t
  ON t.category_id = b.category_id
 AND t.user_id     = b.user_id
GROUP BY b.id, b.user_id, b.category_id, c.name, c.icon, c.color,
         b.limit_amount, b.period, b.created_at, b.updated_at;
