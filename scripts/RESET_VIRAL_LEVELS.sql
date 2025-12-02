-- Xóa bỏ hệ thống Tier cũ (Founder, Elite...)
DROP TABLE IF EXISTS user_tiers;

-- Tạo hệ thống Viral 4 Level mới
CREATE TABLE IF NOT EXISTS user_levels (
    user_id UUID PRIMARY KEY REFERENCES auth.users,
    current_level INT DEFAULT 1, -- 1, 2, 3, 4
    level_name VARCHAR(50) DEFAULT 'MEMBER', -- MEMBER, PARTNER, LEADER, WHALE
    
    -- Điều kiện đạt được (Progress)
    total_volume DECIMAL(20, 2) DEFAULT 0,
    total_f1_count INT DEFAULT 0,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật RLS
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own level" ON user_levels FOR SELECT USING (auth.uid() = user_id);

-- Set Boss (Bill Will) lên Max Level 4 (WHALE)
INSERT INTO user_levels (user_id, current_level, level_name, total_volume, total_f1_count)
SELECT id, 4, 'WHALE', 999999999, 9999
FROM auth.users 
WHERE email = 'billwill.mentor@gmail.com'
ON CONFLICT (user_id) DO UPDATE 
SET current_level = 4, level_name = 'WHALE';

-- Kiểm tra kết quả
SELECT email, current_level, level_name FROM auth.users u 
JOIN user_levels l ON u.id = l.user_id
WHERE email = 'billwill.mentor@gmail.com';
