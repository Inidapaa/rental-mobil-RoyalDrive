-- ============================================
-- SQL untuk Insert Data User Manual
-- ============================================
-- Jalankan perintah ini di Supabase SQL Editor
-- Dashboard Supabase > SQL Editor > New Query

-- 1. Pastikan kolom username sudah ada
ALTER TABLE public.user 
ADD COLUMN IF NOT EXISTS username VARCHAR(255);

-- 2. Hapus data lama jika ada (opsional, untuk testing)
-- DELETE FROM public.user WHERE email = 'dafaqoirudin@gmail.com';

-- 3. Insert data baru
INSERT INTO public.user (email, role, username, created_at)
VALUES ('dafaqoirudin@gmail.com', 'admin', 'Daffa', CURRENT_DATE)
ON CONFLICT (email) 
DO UPDATE SET 
  role = EXCLUDED.role,
  username = EXCLUDED.username;

-- 4. Verifikasi data sudah masuk
SELECT id, email, username, role, created_at 
FROM public.user 
WHERE email = 'dafaqoirudin@gmail.com';

-- ============================================
-- Jika masih error, cek struktur tabel:
-- ============================================
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'user' AND table_schema = 'public'
-- ORDER BY ordinal_position;

