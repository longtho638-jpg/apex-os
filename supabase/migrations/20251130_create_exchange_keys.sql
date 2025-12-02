-- 20251130_create_exchange_keys.sql
-- Quản lý API Key của người dùng cho các sàn giao dịch (Binance, OKX, Bybit...)

CREATE TABLE IF NOT EXISTS user_exchange_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exchange VARCHAR(50) NOT NULL, -- 'binance', 'okx', 'bybit'
    
    -- API Key (Public part) - Có thể lưu plain text
    api_key VARCHAR(255) NOT NULL,
    
    -- API Secret (Private part) - BẮT BUỘC MÃ HÓA
    -- Chúng ta sẽ dùng pgcrypto hoặc mã hóa từ phía App Server (Node.js) trước khi lưu.
    -- Ở đây lưu dạng text đã mã hóa (base64 của encrypted buffer)
    api_secret_encrypted TEXT NOT NULL,
    
    -- Label do user đặt (ví dụ: "Ví Trade Chính")
    label VARCHAR(100),
    
    -- Trạng thái
    is_valid BOOLEAN DEFAULT false, -- Đã verify kết nối thành công chưa
    last_synced_at TIMESTAMPTZ,     -- Thời điểm sync balance gần nhất
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Mỗi user chỉ được add 1 key cho mỗi sàn (trong giai đoạn MVP để đơn giản)
    CONSTRAINT unique_user_exchange UNIQUE (user_id, exchange)
);

-- RLS Policies
ALTER TABLE user_exchange_keys ENABLE ROW LEVEL SECURITY;

-- User chỉ xem được key của mình (nhưng KHÔNG xem được secret)
CREATE POLICY "Users can view own keys" ON user_exchange_keys
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- User có thể thêm key
CREATE POLICY "Users can add keys" ON user_exchange_keys
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- User có thể xóa key
CREATE POLICY "Users can delete keys" ON user_exchange_keys
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_exchange_keys_user_id ON user_exchange_keys(user_id);
