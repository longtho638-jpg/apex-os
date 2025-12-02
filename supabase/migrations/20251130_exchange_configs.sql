-- Bảng cấu hình hoa hồng của Sàn dành cho ApexOS (Source of Truth)
-- Bảng này quyết định dòng tiền chảy vào hệ thống Viral

CREATE TABLE IF NOT EXISTS exchange_configs (
    exchange_name VARCHAR(50) PRIMARY KEY, -- Binance, OKX, Bybit...
    
    -- Phí giao dịch chuẩn của sàn (để tính toán so sánh)
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
('Binance', 0.0010, 0.20), -- Binance thường trả thấp (20%)
('OKX',     0.0010, 0.45), -- OKX deal tốt (45%)
('Bybit',   0.0010, 0.40),
('Gate.io', 0.0020, 0.40),
('Bitget',  0.0010, 0.50)  -- Bitget thường trả cao nhất
ON CONFLICT (exchange_name) DO NOTHING;

-- RLS (Chỉ Admin mới được sửa bảng này)
ALTER TABLE exchange_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read config" ON exchange_configs FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Admin update config" ON exchange_configs FOR ALL TO authenticated USING (
    -- Giả sử có role admin hoặc check email
    auth.jwt() ->> 'email' IN ('admin@apexos.com', 'founder@apexos.com') 
    -- Hoặc dùng function check_admin() nếu đã có
);
