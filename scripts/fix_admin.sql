-- Hàm này dùng để set quyền Admin cho user bằng Email
-- Chạy cái này trong SQL Editor trên Supabase Dashboard

-- 1. Tìm và update trực tiếp (Cách nhanh nhất)
UPDATE auth.users
SET raw_app_meta_data = '{"provider": "email", "providers": ["email"], "role": "super_admin", "is_admin": true}'::jsonb
WHERE email = 'billwill.mentor@gmail.com';

-- 2. Kiểm tra lại xem đã lên chưa
SELECT id, email, raw_app_meta_data FROM auth.users WHERE email = 'billwill.mentor@gmail.com';
