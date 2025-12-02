-- =====================================================
-- APEX OS - Money Engine (Financial System)
-- Version: 008
-- Purpose: Wallets, Transactions (Ledger), Withdrawals
-- =====================================================

-- =====================================================
-- 1. WALLETS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    currency TEXT DEFAULT 'USDT' NOT NULL,
    balance DECIMAL(20, 8) DEFAULT 0 NOT NULL CHECK (balance >= 0),
    pending_payout DECIMAL(20, 8) DEFAULT 0 NOT NULL CHECK (pending_payout >= 0),
    is_frozen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, currency)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);

-- RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallet" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage wallets" ON public.wallets
    FOR ALL USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('super_admin', 'admin')
    );

-- =====================================================
-- 2. PAYMENT METHODS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('crypto_wallet', 'bank_transfer')),
    name TEXT NOT NULL, -- e.g. "My Binance Wallet"
    details JSONB NOT NULL, -- Encrypted details ideally, or just address for crypto
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON public.payment_methods(user_id);

-- RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own payment methods" ON public.payment_methods
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins view payment methods" ON public.payment_methods
    FOR SELECT USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('super_admin', 'admin')
    );

-- Trigger to ensure only one default per user
CREATE OR REPLACE FUNCTION set_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default THEN
        UPDATE public.payment_methods
        SET is_default = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_default_payment_method
    BEFORE INSERT OR UPDATE ON public.payment_methods
    FOR EACH ROW EXECUTE FUNCTION set_default_payment_method();

-- =====================================================
-- 3. WITHDRAWALS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id),
    amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
    fee DECIMAL(20, 8) DEFAULT 0 NOT NULL CHECK (fee >= 0),
    net_amount DECIMAL(20, 8) NOT NULL CHECK (net_amount > 0),
    currency TEXT DEFAULT 'USDT' NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
    payment_method_snapshot JSONB NOT NULL, -- Snapshot of details at time of request
    tx_hash TEXT, -- Blockchain TX Hash
    admin_note TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);

-- RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own withdrawals" ON public.withdrawals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create withdrawals" ON public.withdrawals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage withdrawals" ON public.withdrawals
    FOR ALL USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('super_admin', 'admin')
    );

-- =====================================================
-- 4. TRANSACTIONS (IMMUTABLE LEDGER)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id),
    type TEXT NOT NULL CHECK (type IN ('rebate', 'withdrawal', 'withdrawal_fee', 'adjustment', 'bonus', 'refund', 'deposit')),
    amount DECIMAL(20, 8) NOT NULL, -- Can be negative for deductions
    balance_after DECIMAL(20, 8) NOT NULL,
    reference_id TEXT, -- e.g., trade_id or withdrawal_id
    reference_type TEXT, -- 'trade', 'withdrawal', 'manual'
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON public.transactions(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions(reference_id);

-- RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallet transactions" ON public.transactions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.wallets WHERE id = transactions.wallet_id AND user_id = auth.uid())
    );

CREATE POLICY "Admins view all transactions" ON public.transactions
    FOR SELECT USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('super_admin', 'admin')
    );

-- =====================================================
-- 5. FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at
CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON public.wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at
    BEFORE UPDATE ON public.withdrawals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create wallet on user signup (optional, or handle in app)
-- For now, we'll let the app create it lazily or via a separate trigger on auth.users

-- Function to process withdrawal request (Deduct balance, add to pending)
CREATE OR REPLACE FUNCTION process_withdrawal_request()
RETURNS TRIGGER AS $$
DECLARE
    v_wallet_id UUID;
    v_balance DECIMAL;
    v_is_frozen BOOLEAN;
BEGIN
    -- Get wallet and lock
    SELECT id, balance, is_frozen INTO v_wallet_id, v_balance, v_is_frozen
    FROM public.wallets
    WHERE user_id = NEW.user_id AND currency = NEW.currency
    FOR UPDATE; -- Lock row for transaction

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    -- CRITICAL: Check if wallet is frozen
    IF v_is_frozen THEN
        RAISE EXCEPTION 'Wallet is frozen - withdrawals not permitted';
    END IF;

    IF v_balance < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Update wallet
    UPDATE public.wallets
    SET balance = balance - NEW.amount,
        pending_payout = pending_payout + NEW.amount
    WHERE id = v_wallet_id;

    -- Create Ledger Entry
    INSERT INTO public.transactions (
        wallet_id, type, amount, balance_after, reference_id, reference_type, description
    ) VALUES (
        v_wallet_id, 'withdrawal', -NEW.amount, v_balance - NEW.amount, NEW.id::text, 'withdrawal', 'Withdrawal Request'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for withdrawal creation
CREATE TRIGGER trigger_withdrawal_request
    BEFORE INSERT ON public.withdrawals
    FOR EACH ROW EXECUTE FUNCTION process_withdrawal_request();

-- Function to handle withdrawal approval/rejection
-- This is complex to do purely in SQL triggers because of state transitions.
-- We will handle approval/rejection logic in the Application Layer (API) 
-- which will update wallet/transactions transactionally.
-- But we can add a safety check trigger to prevent modifying 'completed' withdrawals.

CREATE OR REPLACE FUNCTION check_withdrawal_status_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IN ('completed', 'rejected', 'cancelled') THEN
        RAISE EXCEPTION 'Cannot modify a finalized withdrawal';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_withdrawal_status
    BEFORE UPDATE ON public.withdrawals
    FOR EACH ROW EXECUTE FUNCTION check_withdrawal_status_update();

