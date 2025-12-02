-- Script tạo bảng Cấu hình Sàn (Exchange Configs)
-- Copy toàn bộ và chạy trong Supabase SQL Editor

CREATE TABLE IF NOT EXISTS exchange_configs (
    exchange_name VARCHAR(50) PRIMARY KEY, -- Binance, OKX, Bybit...
    
    -- Phí giao dịch chuẩn của sàn
    standard_maker_fee DECIMAL(10, 6) DEFAULT 0.001, -- 0.1%
    standard_taker_fee DECIMAL(10, 6) DEFAULT 0.001, -- 0.1%
    
    -- % Hoa hồng Sàn trả cho ApexOS (QUAN TRỌNG NHẤT)
    -- Ví dụ: 0.40 nghĩa là Apex nhận 40% phí giao dịch
    apex_partner_rate DECIMAL(5, 4) DEFAULT 0.30,
    
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dữ liệu mẫu (Seed Data)
INSERT INTO exchange_configs (exchange_name, standard_taker_fee, apex_partner_rate) VALUES
('Binance', 0.0010, 0.20), -- Binance trả 20%
('OKX',     0.0010, 0.45), -- OKX trả 45%
('Bybit',   0.0010, 0.40),
('Gate.io', 0.0020, 0.40),
('Bitget',  0.0010, 0.50)
ON CONFLICT (exchange_name) DO NOTHING;

-- Bật RLS (Row Level Security)
ALTER TABLE exchange_configs ENABLE ROW LEVEL SECURITY;

-- Cho phép ai cũng đọc được (để tool phân tích hoạt động)
DROP POLICY IF EXISTS "Public read config" ON exchange_configs;
CREATE POLICY "Public read config" ON exchange_configs FOR SELECT TO authenticated, anon USING (true);

-- Chỉ Admin mới được sửa (thông qua trang Admin)
DROP POLICY IF EXISTS "Admin update config" ON exchange_configs;
CREATE POLICY "Admin update config" ON exchange_configs FOR ALL TO authenticated USING (
    -- Kiểm tra user có phải là super_admin không thông qua bảng admin_users
    auth.uid() IN (SELECT id FROM admin_users WHERE role = 'super_admin' OR role = 'admin')
);
