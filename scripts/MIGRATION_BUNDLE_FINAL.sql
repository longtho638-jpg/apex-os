-- TỔNG HỢP MIGRATION CUỐI CÙNG CHO APEX OS (CLEAN INSTALL - V5)
-- Chạy 1 lần duy nhất trên Supabase SQL Editor.
-- LƯU Ý: Script này sẽ XÓA CÁC BẢNG CŨ (nếu có) để cài đặt lại cấu trúc chuẩn.

-- =============================================================================
-- CLEANUP FIRST (DỌN DẸP TRƯỚC - FORCE MODE)
-- =============================================================================

-- 1. Drop Functions with CASCADE (Tự động drop triggers liên quan trên auth.users)
DROP FUNCTION IF EXISTS public.handle_new_user_wallet() CASCADE;
DROP FUNCTION IF EXISTS update_strategy_followers() CASCADE;

-- 2. Drop Tables with CASCADE (Xóa sạch bảng và các ràng buộc, index, trigger của bảng đó)
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS user_wallets CASCADE;
DROP TABLE IF EXISTS user_exchange_keys CASCADE;
DROP TABLE IF EXISTS strategy_subscriptions CASCADE;
DROP TABLE IF EXISTS strategies CASCADE;
DROP TABLE IF EXISTS exchange_configs CASCADE;


-- =============================================================================
-- PHẦN 1: FINANCIAL CORE (VÍ VÀ SỔ CÁI)
-- =============================================================================

CREATE TABLE user_wallets (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(20, 6) NOT NULL DEFAULT 0.0,      
    pending_balance DECIMAL(20, 6) NOT NULL DEFAULT 0.0, 
    total_earned DECIMAL(20, 6) NOT NULL DEFAULT 0.0, 
    currency VARCHAR(10) DEFAULT 'USDT',              
    is_frozen BOOLEAN DEFAULT false,                  
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (balance >= 0),
    CHECK (pending_balance >= 0)
);

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_wallets(user_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, 
    amount DECIMAL(20, 6) NOT NULL, 
    balance_before DECIMAL(20, 6) NOT NULL, 
    balance_after DECIMAL(20, 6) NOT NULL,  
    reference_id VARCHAR(100), 
    description TEXT,
    status VARCHAR(20) DEFAULT 'COMPLETED', 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger tạo ví
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo lại trigger (Vì trigger cũ đã bị drop do CASCADE ở trên)
CREATE TRIGGER on_auth_user_created_wallet
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- RLS
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON user_wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);


-- =============================================================================
-- PHẦN 2: EXCHANGE KEYS (QUẢN LÝ API KEY)
-- =============================================================================

CREATE TABLE user_exchange_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exchange VARCHAR(50) NOT NULL, 
    api_key VARCHAR(255) NOT NULL,
    api_secret_encrypted TEXT NOT NULL,
    label VARCHAR(100),
    is_valid BOOLEAN DEFAULT false, 
    last_synced_at TIMESTAMPTZ,     
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, exchange)
);

ALTER TABLE user_exchange_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own keys" ON user_exchange_keys FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add keys" ON user_exchange_keys FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete keys" ON user_exchange_keys FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- =============================================================================
-- PHẦN 3: MARKETPLACE (CHIẾN LƯỢC & COPY TRADE)
-- =============================================================================

CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    roi_30d DECIMAL(10, 2) DEFAULT 0.00,
    win_rate DECIMAL(5, 2) DEFAULT 0.00, 
    total_profit DECIMAL(20, 2) DEFAULT 0.00, 
    price_monthly DECIMAL(10, 2) DEFAULT 0.00, 
    platform_fee_rate DECIMAL(5, 4) DEFAULT 0.30, 
    min_investment DECIMAL(10, 2) DEFAULT 100.00,
    followers_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE strategy_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, 
    strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    amount_allocated DECIMAL(20, 2) NOT NULL DEFAULT 0.00, 
    status VARCHAR(20) DEFAULT 'ACTIVE', 
    started_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, strategy_id)
);

ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view strategies" ON strategies FOR SELECT TO authenticated, anon USING (is_public = true OR auth.uid() = creator_id);
CREATE POLICY "Creators can manage strategies" ON strategies FOR ALL TO authenticated USING (auth.uid() = creator_id);
CREATE POLICY "Users manage own subscriptions" ON strategy_subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Trigger cập nhật follower
CREATE OR REPLACE FUNCTION update_strategy_followers()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE strategies SET followers_count = followers_count + 1 WHERE id = NEW.strategy_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE strategies SET followers_count = followers_count - 1 WHERE id = OLD.strategy_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_subscription_change
AFTER INSERT OR DELETE ON strategy_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_strategy_followers();


-- =============================================================================
-- PHẦN 4: EXCHANGE CONFIGS (CẤU HÌNH PHÍ SÀN)
-- =============================================================================

CREATE TABLE exchange_configs (
    exchange_name VARCHAR(50) PRIMARY KEY, 
    standard_maker_fee DECIMAL(10, 6) DEFAULT 0.001, 
    standard_taker_fee DECIMAL(10, 6) DEFAULT 0.001, 
    apex_partner_rate DECIMAL(5, 4) DEFAULT 0.30,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Data
INSERT INTO exchange_configs (exchange_name, standard_taker_fee, apex_partner_rate) VALUES
('Binance', 0.0010, 0.20), 
('OKX',     0.0010, 0.45), 
('Bybit',   0.0010, 0.40),
('Gate.io', 0.0020, 0.40),
('Bitget',  0.0010, 0.50);

ALTER TABLE exchange_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read config" ON exchange_configs FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Admin update config" ON exchange_configs FOR ALL TO authenticated USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE role = 'super_admin' OR role = 'admin')
);

-- =============================================================================
-- HOÀN TẤT
-- =============================================================================
