-- Script nâng cấp tài khoản lên FOUNDER (Cao nhất)
-- Copy toàn bộ và chạy trong Supabase SQL Editor

-- 1. Đảm bảo bảng user_tiers tồn tại
CREATE TABLE IF NOT EXISTS user_tiers (
    user_id UUID PRIMARY KEY REFERENCES auth.users,
    tier VARCHAR(20) DEFAULT 'FREE', -- FREE, BASIC, PRO, ELITE, FOUNDER
    valid_until TIMESTAMPTZ, -- Null nghĩa là vĩnh viễn
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật RLS cho user_tiers
ALTER TABLE user_tiers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own tier" ON user_tiers;
CREATE POLICY "Users can read own tier" ON user_tiers FOR SELECT USING (auth.uid() = user_id);

-- 2. Nâng cấp Bill Will lên FOUNDER
INSERT INTO user_tiers (user_id, tier, valid_until)
SELECT id, 'FOUNDER', NULL
FROM auth.users 
WHERE email = 'billwill.mentor@gmail.com'
ON CONFLICT (user_id) DO UPDATE 
SET tier = 'FOUNDER', valid_until = NULL;

-- 3. Kiểm tra lại kết quả
SELECT u.email, t.tier 
FROM auth.users u 
JOIN user_tiers t ON u.id = t.user_id 
WHERE u.email = 'billwill.mentor@gmail.com';
