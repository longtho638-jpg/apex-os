-- =====================================================
-- APEX OS - Money Engine Functions
-- Version: 009
-- Purpose: Transactional Withdrawal Management
-- =====================================================

-- Approve Withdrawal
CREATE OR REPLACE FUNCTION approve_withdrawal(
    p_withdrawal_id UUID,
    p_admin_id UUID,
    p_tx_hash TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_withdrawal RECORD;
    v_wallet_id UUID;
BEGIN
    -- Get withdrawal and lock
    SELECT * INTO v_withdrawal
    FROM public.withdrawals
    WHERE id = p_withdrawal_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Withdrawal not found');
    END IF;

    IF v_withdrawal.status != 'pending' AND v_withdrawal.status != 'processing' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Withdrawal is not pending');
    END IF;

    -- Update Withdrawal
    UPDATE public.withdrawals
    SET status = 'completed',
        approved_by = p_admin_id,
        approved_at = NOW(),
        tx_hash = p_tx_hash,
        updated_at = NOW()
    WHERE id = p_withdrawal_id;

    -- Update Wallet (Decrease pending_payout)
    UPDATE public.wallets
    SET pending_payout = pending_payout - v_withdrawal.amount,
        updated_at = NOW()
    WHERE id = v_withdrawal.wallet_id;

    -- Log Transaction (Optional, maybe just update metadata of original tx? Or create new one?)
    -- Let's create a 'withdrawal_completed' log for clarity
    INSERT INTO public.transactions (
        wallet_id, type, amount, balance_after, reference_id, reference_type, description
    )
    SELECT 
        v_withdrawal.wallet_id, 
        'withdrawal', -- Keep type consistent or use specific subtype?
        0, -- No balance change, just status change
        (SELECT balance FROM public.wallets WHERE id = v_withdrawal.wallet_id),
        p_withdrawal_id::text, 
        'withdrawal', 
        'Withdrawal Completed'
    ;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reject Withdrawal
CREATE OR REPLACE FUNCTION reject_withdrawal(
    p_withdrawal_id UUID,
    p_admin_id UUID,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_withdrawal RECORD;
    v_wallet_id UUID;
    v_current_balance DECIMAL;
BEGIN
    -- Get withdrawal and lock
    SELECT * INTO v_withdrawal
    FROM public.withdrawals
    WHERE id = p_withdrawal_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Withdrawal not found');
    END IF;

    IF v_withdrawal.status != 'pending' AND v_withdrawal.status != 'processing' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Withdrawal is not pending');
    END IF;

    -- Update Withdrawal
    UPDATE public.withdrawals
    SET status = 'rejected',
        admin_note = p_reason,
        approved_by = p_admin_id, -- Rejected by
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_withdrawal_id;

    -- Update Wallet (Refund balance, Decrease pending_payout)
    UPDATE public.wallets
    SET balance = balance + v_withdrawal.amount,
        pending_payout = pending_payout - v_withdrawal.amount,
        updated_at = NOW()
    WHERE id = v_withdrawal.wallet_id
    RETURNING balance INTO v_current_balance;

    -- Create Refund Transaction
    INSERT INTO public.transactions (
        wallet_id, type, amount, balance_after, reference_id, reference_type, description
    ) VALUES (
        v_withdrawal.wallet_id,
        'refund',
        v_withdrawal.amount,
        v_current_balance,
        p_withdrawal_id::text,
        'withdrawal',
        'Withdrawal Rejected: ' || p_reason
    );

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
