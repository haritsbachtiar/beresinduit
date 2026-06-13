-- ============================================================
-- Migration 002: Categories + kategori default per user baru
-- ============================================================

CREATE TABLE categories (
  id          UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID            REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT            NOT NULL,
  icon        TEXT            NOT NULL DEFAULT 'circle',
  color       TEXT            NOT NULL DEFAULT '#6b7280',
  type        transaction_type NOT NULL,
  is_default  BOOLEAN         NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ     DEFAULT NOW() NOT NULL
);

CREATE INDEX categories_user_id_idx ON categories (user_id);
CREATE INDEX categories_type_idx    ON categories (type);

-- ============================================================
-- Row Level Security: categories
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories: lihat milik sendiri"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "categories: buat milik sendiri"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories: ubah milik sendiri"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Kategori default tidak bisa dihapus
CREATE POLICY "categories: hapus hanya yang bukan default"
  ON categories FOR DELETE
  USING (auth.uid() = user_id AND is_default = FALSE);

-- ============================================================
-- Fungsi: buat kategori default saat user baru daftar
-- ============================================================
CREATE OR REPLACE FUNCTION create_default_categories(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO categories (user_id, name, icon, color, type, is_default) VALUES
    -- Pemasukan
    (p_user_id, 'Gaji',      'briefcase',    '#22c55e', 'pemasukan', TRUE),
    (p_user_id, 'Freelance', 'laptop',       '#10b981', 'pemasukan', TRUE),
    (p_user_id, 'Investasi', 'trending-up',  '#06b6d4', 'pemasukan', TRUE),
    (p_user_id, 'Hadiah',    'gift',         '#f59e0b', 'pemasukan', TRUE),
    (p_user_id, 'Lainnya',   'plus-circle',  '#6b7280', 'pemasukan', TRUE),
    -- Pengeluaran
    (p_user_id, 'Makanan',   'utensils',     '#ef4444', 'pengeluaran', TRUE),
    (p_user_id, 'Transport', 'car',          '#f97316', 'pengeluaran', TRUE),
    (p_user_id, 'Belanja',   'shopping-bag', '#ec4899', 'pengeluaran', TRUE),
    (p_user_id, 'Kesehatan', 'heart',        '#14b8a6', 'pengeluaran', TRUE),
    (p_user_id, 'Hiburan',   'tv-2',         '#8b5cf6', 'pengeluaran', TRUE),
    (p_user_id, 'Pendidikan','book-open',    '#3b82f6', 'pengeluaran', TRUE),
    (p_user_id, 'Tagihan',   'file-text',    '#64748b', 'pengeluaran', TRUE),
    (p_user_id, 'Lainnya',   'ellipsis',     '#6b7280', 'pengeluaran', TRUE);
END;
$$;

-- ============================================================
-- Update trigger handle_new_user: tambah pembuatan kategori default
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  );

  PERFORM create_default_categories(NEW.id);

  RETURN NEW;
END;
$$;
