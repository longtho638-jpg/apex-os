-- 20251130_fix_providers_rls_v2.sql
-- HỢP NHẤT PROVIDER & FIX LỖI 403 (Phiên bản V2 - Fix lỗi NOT NULL)

-- 1. Sửa bảng providers (Nếu đã tồn tại) để cho phép NULL ở các cột key
-- Vì có thể ta chỉ cần Partner ID để verify ref trước khi nhập API Key trade.
ALTER TABLE IF EXISTS providers ALTER COLUMN encrypted_api_key DROP NOT NULL;
ALTER TABLE IF EXISTS providers ALTER COLUMN encrypted_api_secret DROP NOT NULL;

-- 2. Đảm bảo bảng tồn tại (Create if not exists)
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_code VARCHAR(50) NOT NULL UNIQUE, 
    provider_name VARCHAR(100) NOT NULL,
    asset_class VARCHAR(20) DEFAULT 'crypto', 
    
    partner_uuid VARCHAR(255), 
    
    encrypted_api_key TEXT, -- Đã bỏ NOT NULL
    encrypted_api_secret TEXT, -- Đã bỏ NOT NULL
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bật RLS
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Public Read (Cho phép user đọc Partner ID)
DROP POLICY IF EXISTS "Public view providers" ON providers;
CREATE POLICY "Public view providers" ON providers
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- 5. Policy: Admin Full Access
DROP POLICY IF EXISTS "Admin manage providers" ON providers;
CREATE POLICY "Admin manage providers" ON providers
    FOR ALL
    TO authenticated
    USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE role = 'super_admin' OR role = 'admin')
    );

-- 6. Seed Data (Dữ liệu mẫu)
INSERT INTO providers (provider_code, provider_name, asset_class, partner_uuid, is_active)
VALUES 
('binance', 'Binance', 'crypto', 'LIMITLESS_BINANCE_PARTNER_ID', true),
('okx', 'OKX', 'crypto', 'LIMITLESS_OKX_PARTNER_ID', true),
('bybit', 'Bybit', 'crypto', 'LIMITLESS_BYBIT_PARTNER_ID', true),
('exness', 'Exness', 'forex', 'LIMITLESS_EXNESS_PARTNER_ID', true)
ON CONFLICT (provider_code) DO UPDATE SET 
    partner_uuid = EXCLUDED.partner_uuid,
    is_active = true;
