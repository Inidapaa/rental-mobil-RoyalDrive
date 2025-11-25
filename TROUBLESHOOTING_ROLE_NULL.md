# Troubleshooting: Role Still Null

## Masalah

Role masih `null` setelah login, meskipun data sudah ada di tabel `user`.

## Langkah Troubleshooting

### 1. Pastikan Data Ada di Tabel

Jalankan query ini di Supabase SQL Editor:

```sql
SELECT id, email, username, role, created_at
FROM public.user
WHERE email = 'dafaqoirudin@gmail.com';
```

**Jika tidak ada data**, jalankan:

```sql
INSERT INTO public.user (email, role, username, created_at)
VALUES ('dafaqoirudin@gmail.com', 'admin', 'Daffa', CURRENT_DATE)
ON CONFLICT (email)
DO UPDATE SET
  role = EXCLUDED.role,
  username = EXCLUDED.username;
```

### 2. Cek RLS (Row Level Security)

1. Buka Supabase Dashboard
2. Table Editor > `user` table
3. Pastikan tombol menunjukkan **"RLS disabled"** (orange)
4. Jika "RLS enabled", klik untuk disable

### 3. Cek Permissions

Pastikan anon key memiliki permission untuk SELECT:

1. Supabase Dashboard > Authentication > Policies
2. Cek policy untuk tabel `user`
3. Pastikan ada policy yang mengizinkan SELECT untuk authenticated users

### 4. Cek Console Browser

Buka browser console (F12) dan cari:

- `📊 User data from database:` - Apakah null atau ada data?
- `❌ Error from database:` - Apakah ada error?
- `❌ Error code:` - Code error apa?

### 5. Test Query Manual

Jalankan query ini di Supabase SQL Editor untuk test:

```sql
-- Test query dengan anon key
SELECT role, email, username
FROM public.user
WHERE email = 'dafaqoirudin@gmail.com';
```

Jika query ini berhasil di SQL Editor tapi gagal di aplikasi, kemungkinan masalah RLS atau permission.

### 6. Cek Environment Variable

Pastikan `VITE_SUPABASE_ANON_KEY` sudah di-set di file `.env`:

```env
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 7. Cek Network Tab

1. Buka DevTools (F12) > Network tab
2. Filter: "user"
3. Cek request ke Supabase
4. Lihat response - apakah ada error atau data?

## Solusi Cepat

Jika semua sudah dicek dan masih null, coba:

1. **Restart dev server**
2. **Hard refresh browser** (Ctrl+Shift+R)
3. **Clear browser cache**
4. **Cek apakah email di Supabase Auth sama dengan email di tabel user**

## Error Codes yang Mungkin

- `PGRST116`: No rows returned (data tidak ada)
- `42501`: Permission denied (RLS atau permission issue)
- `42P01`: Table doesn't exist (tabel tidak ada)
