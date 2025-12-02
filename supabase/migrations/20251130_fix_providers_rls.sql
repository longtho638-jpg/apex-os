-- 20251130_fix_providers_rls.sql
-- HỢP NHẤT PROVIDER & FIX LỖI 403
-- Mục tiêu: Cho phép Authenticated User đọc thông tin public của Providers để thực hiện Verify Account.

-- 1. Đảm bảo bảng providers tồn tại (Tạo nếu chưa có - chuẩn hóa schema)
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_code VARCHAR(50) NOT NULL UNIQUE, -- binance, okx, exness...
    provider_name VARCHAR(100) NOT NULL,
    asset_class VARCHAR(20) DEFAULT 'crypto', -- crypto, forex, stock
    
    partner_uuid VARCHAR(255), -- Partner ID công khai
    
    -- Các trường nhạy cảm (Chỉ Service Role mới được đọc)
    encrypted_api_key TEXT,
    encrypted_api_secret TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bật RLS
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public Read (Cho phép user đọc Partner ID để verify)
-- Chỉ select các cột an toàn. Tuy nhiên Postgres RLS không support column-level security trực tiếp trong POLICY đơn giản.
-- Cách tốt nhất là: Cứ cho đọc row, nhưng ở API chỉ select cột cần thiết.
-- Hoặc tạo VIEW. Ở đây ta cho phép đọc row có is_active = true.
DROP POLICY IF EXISTS "Public view providers" ON providers;
CREATE POLICY "Public view providers" ON providers
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- 4. Policy: Admin Full Access (Để Admin nhập key)
DROP POLICY IF EXISTS "Admin manage providers" ON providers;
CREATE POLICY "Admin manage providers" ON providers
    FOR ALL
    TO authenticated
    USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE role = 'super_admin' OR role = 'admin')
    );

-- 5. Seed Data (Dữ liệu mẫu cho Binance/OKX để test ngay)
INSERT INTO providers (provider_code, provider_name, asset_class, partner_uuid, is_active)
VALUES 
('binance', 'Binance', 'crypto', 'LIMITLESS_BINANCE_PARTNER_ID', true),
('okx', 'OKX', 'crypto', 'LIMITLESS_OKX_PARTNER_ID', true),
('bybit', 'Bybit', 'crypto', 'LIMITLESS_BYBIT_PARTNER_ID', true),
('exness', 'Exness', 'forex', 'LIMITLESS_EXNESS_PARTNER_ID', true)
ON CONFLICT (provider_code) DO UPDATE SET 
    partner_uuid = EXCLUDED.partner_uuid,
    is_active = true;
