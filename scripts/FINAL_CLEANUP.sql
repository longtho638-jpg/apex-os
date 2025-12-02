-- FINAL CLEANUP & SETUP SCRIPT
-- Chạy script này để dọn dẹp và cài đặt chuẩn cho hệ thống Viral & Admin

-- 1. Dọn dẹp bảng user_tiers cũ (để tránh conflict cấu trúc)
DROP TABLE IF EXISTS user_tiers CASCADE;

-- 2. Tạo bảng user_tiers chuẩn (theo Unified Tiers)
CREATE TABLE user_tiers (
    user_id UUID PRIMARY KEY REFERENCES auth.users,
    tier VARCHAR(20) DEFAULT 'FREE', -- FREE, PRO, TRADER, ELITE, WHALE
    valid_until TIMESTAMPTZ, -- Null = Vĩnh viễn
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bật RLS cho user_tiers
ALTER TABLE user_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own tier" ON user_tiers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages tiers" ON user_tiers FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- 4. Cài đặt quyền WHALE (Max Level) cho Boss (Bill Will)
INSERT INTO user_tiers (user_id, tier)
SELECT id, 'WHALE'
FROM auth.users 
WHERE email = 'billwill.mentor@gmail.com'
ON CONFLICT (user_id) DO UPDATE 
SET tier = 'WHALE';

-- 5. Đảm bảo quyền Admin (trong bảng admin_users)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read admin list" ON admin_users;
CREATE POLICY "Admins can read admin list" ON admin_users FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users));

INSERT INTO admin_users (id, email, role)
SELECT id, email, 'super_admin'
FROM auth.users
WHERE email = 'billwill.mentor@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'super_admin';

-- 6. Kiểm tra lại kết quả
SELECT u.email, t.tier, a.role as admin_role
FROM auth.users u
LEFT JOIN user_tiers t ON u.id = t.user_id
LEFT JOIN admin_users a ON u.id = a.id
WHERE u.email = 'billwill.mentor@gmail.com';
