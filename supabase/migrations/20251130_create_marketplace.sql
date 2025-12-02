-- 20251130_create_marketplace.sql
-- MARKETPLACE & SOCIAL TRADING

-- 1. Bảng Chiến Lược (Strategies)
CREATE TABLE IF NOT EXISTS strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Thông số hiệu suất (Được cập nhật bởi Cronjob)
    roi_30d DECIMAL(10, 2) DEFAULT 0.00, -- %
    win_rate DECIMAL(5, 2) DEFAULT 0.00, -- %
    total_profit DECIMAL(20, 2) DEFAULT 0.00, -- USD
    
    -- Cấu hình copy
    price_monthly DECIMAL(10, 2) DEFAULT 0.00, -- 0 = Free
    platform_fee_rate DECIMAL(5, 4) DEFAULT 0.30, -- Phí sàn thu (30% mặc định)
    min_investment DECIMAL(10, 2) DEFAULT 100.00,
    
    -- Social Proof
    followers_count INT DEFAULT 0,
    
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng Đăng Ký (Subscriptions) - Ai đang copy ai
CREATE TABLE IF NOT EXISTS strategy_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Người copy
    strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    
    amount_allocated DECIMAL(20, 2) NOT NULL DEFAULT 0.00, -- Số vốn bỏ vào copy
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'STOPPED'
    
    started_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Mỗi user chỉ copy 1 strategy 1 lần
    CONSTRAINT unique_subscription UNIQUE (user_id, strategy_id)
);

-- 3. RLS Policies
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_subscriptions ENABLE ROW LEVEL SECURITY;

-- Strategies: Ai cũng xem được public, Creator xem được private của mình
CREATE POLICY "Public view strategies" ON strategies
    FOR SELECT TO authenticated, anon
    USING (is_public = true OR auth.uid() = creator_id);

CREATE POLICY "Creators can manage strategies" ON strategies
    FOR ALL TO authenticated
    USING (auth.uid() = creator_id);

-- Subscriptions: User chỉ xem/sửa được sub của mình
CREATE POLICY "Users manage own subscriptions" ON strategy_subscriptions
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

-- 4. Trigger: Tăng/Giảm follower count
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

-- Seed Data (Dữ liệu mẫu để Marketplace không trống trơn)
-- Lưu ý: Cần thay thế UUID bằng ID thật nếu chạy script này
-- Ở đây tôi comment lại để tránh lỗi khi chạy tự động
/*
INSERT INTO strategies (creator_id, name, description, roi_30d, win_rate, followers_count, price_monthly)
VALUES 
(auth.uid(), 'Whale Hunter V1', 'Chuyên săn cá voi khung H4', 45.2, 78.5, 1240, 99),
(auth.uid(), 'Safe Yield Farming', 'Rủi ro thấp, lãi ổn định', 12.5, 95.0, 5300, 0),
(auth.uid(), 'Degen Scalping', 'High Risk High Reward', 120.5, 45.0, 890, 199);
*/
