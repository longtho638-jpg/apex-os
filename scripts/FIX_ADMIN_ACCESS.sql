-- 1. Tạo bảng admin_users nếu chưa có
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Admin đọc được admin
CREATE POLICY "Admins can read admin list" ON admin_users
  FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users));

-- 2. Thêm Bill Will vào danh sách Admin (INSERT nếu chưa có)
INSERT INTO admin_users (id, email, role)
SELECT id, email, 'super_admin'
FROM auth.users
WHERE email = 'billwill.mentor@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'super_admin';

-- 3. Đồng bộ quyền vào auth.users (metadata) để chắc chắn
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"super_admin"'
)
WHERE email = 'billwill.mentor@gmail.com';
