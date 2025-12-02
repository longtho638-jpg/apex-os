-- 20251130_create_financial_core.sql
-- FINANCIAL CORE SYSTEM
-- "Trái tim" quản lý dòng tiền của ApexOS.
-- Bao gồm: Ví người dùng và Sổ cái giao dịch (Ledger).

-- 1. Bảng Ví Người Dùng (User Wallets)
-- Mỗi user chỉ có 1 ví duy nhất (1-1 relationship với auth.users)
CREATE TABLE IF NOT EXISTS user_wallets (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(20, 6) NOT NULL DEFAULT 0.0,      -- Số dư khả dụng
    pending_balance DECIMAL(20, 6) NOT NULL DEFAULT 0.0, -- Tiền đang chờ xử lý (vd: chờ rút)
    total_earned DECIMAL(20, 6) NOT NULL DEFAULT 0.0, -- Tổng tiền đã kiếm được (Lifetime)
    currency VARCHAR(10) DEFAULT 'USDT',              -- Mặc định là USDT
    is_frozen BOOLEAN DEFAULT false,                  -- Trạng thái đóng băng ví (Risk Guardian)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ràng buộc: Số dư không bao giờ được âm
    CONSTRAINT balance_non_negative CHECK (balance >= 0),
    CONSTRAINT pending_balance_non_negative CHECK (pending_balance >= 0)
);

-- 2. Bảng Sổ Cái Giao Dịch (Wallet Transactions)
-- Ghi lại mọi biến động số dư (Double-entry bookkeeping mindset)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_wallets(user_id),
    type VARCHAR(50) NOT NULL, -- 'REBATE', 'REFERRAL_L1', 'REFERRAL_L2', 'WITHDRAWAL', 'BONUS', 'SUBSCRIPTION_FEE'
    amount DECIMAL(20, 6) NOT NULL, -- Số tiền biến động (+ hoặc -)
    balance_before DECIMAL(20, 6) NOT NULL, -- Snapshot số dư trước khi giao dịch
    balance_after DECIMAL(20, 6) NOT NULL,  -- Snapshot số dư sau khi giao dịch
    reference_id VARCHAR(100), -- ID tham chiếu (vd: OrderID, UserID của Ref)
    description TEXT,
    status VARCHAR(20) DEFAULT 'COMPLETED', -- 'PENDING', 'COMPLETED', 'FAILED'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trigger: Tự động tạo Ví khi User mới đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_wallets (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger này sẽ chạy sau khi insert vào auth.users (nếu chưa có trigger tương tự)
-- Lưu ý: Nếu đã có trigger `on_auth_user_created` ở các file trước, ta nên gộp logic vào đó.
-- Ở đây tôi tạo trigger riêng biệt để đảm bảo tính module hóa, đặt tên rõ ràng.
DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- 4. Trigger: Cập nhật updated_at cho user_wallets
CREATE OR REPLACE FUNCTION update_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_wallets_timestamp
BEFORE UPDATE ON user_wallets
FOR EACH ROW EXECUTE FUNCTION update_wallet_updated_at();

-- 5. RLS Policies (Row Level Security)
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: User chỉ được xem ví của chính mình
CREATE POLICY "Users can view own wallet" ON user_wallets
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Policy: User chỉ được xem giao dịch của chính mình
CREATE POLICY "Users can view own transactions" ON wallet_transactions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Chỉ Admin/System (Service Role) mới được sửa đổi số dư (Insert/Update)
-- Chúng ta KHÔNG cho phép User tự update ví của mình qua API client trực tiếp.
-- Việc update phải thông qua Edge Function hoặc Database Function (RPC).

-- 6. Indexing (Tối ưu hiệu năng)
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);

-- 7. RPC Function: Safe Balance Update (Hàm cộng/trừ tiền an toàn - Atomic)
-- Đây là cách duy nhất để Client/Server tương tác với ví (thông qua call rpc)
CREATE OR REPLACE FUNCTION add_transaction(
    p_user_id UUID,
    p_type VARCHAR,
    p_amount DECIMAL,
    p_description TEXT,
    p_reference_id VARCHAR DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_current_balance DECIMAL;
    v_new_balance DECIMAL;
    v_wallet_exists BOOLEAN;
BEGIN
    -- 1. Lock row ví để tránh Race Condition (Concurrent updates)
    SELECT balance INTO v_current_balance
    FROM user_wallets
    WHERE user_id = p_user_id
    FOR UPDATE; -- Row Locking

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Wallet not found');
    END IF;

    -- 2. Tính toán
    v_new_balance := v_current_balance + p_amount;

    -- 3. Validate (Không cho phép số dư âm nếu là trừ tiền)
    IF v_new_balance < 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance');
    END IF;

    -- 4. Update Wallet
    UPDATE user_wallets
    SET balance = v_new_balance,
        total_earned = CASE WHEN p_amount > 0 THEN total_earned + p_amount ELSE total_earned END
    WHERE user_id = p_user_id;

    -- 5. Insert Ledger Record
    INSERT INTO wallet_transactions (
        user_id, type, amount, balance_before, balance_after, reference_id, description
    ) VALUES (
        p_user_id, p_type, p_amount, v_current_balance, v_new_balance, p_reference_id, p_description
    );

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- SECURITY DEFINER: Hàm này chạy với quyền của người tạo (Admin), bypass RLS để user có thể gọi nó (nếu được grant).
