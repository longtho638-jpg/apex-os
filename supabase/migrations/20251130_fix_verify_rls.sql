-- 20251130_fix_verify_rls.sql
-- Fix lỗi 403: Cho phép User tự Insert/Update tài khoản verify của mình

-- 1. User Exchange Accounts (Verify Ref)
ALTER TABLE user_exchange_accounts ENABLE ROW LEVEL SECURITY;

-- Drop cũ để override
DROP POLICY IF EXISTS "Users can view own accounts" ON user_exchange_accounts;
DROP POLICY IF EXISTS "Users can manage own accounts" ON user_exchange_accounts;

-- Policy mới: Full quyền trên dòng của chính mình
CREATE POLICY "Users can manage own accounts" ON user_exchange_accounts
    FOR ALL -- SELECT, INSERT, UPDATE, DELETE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Providers (Cần quyền đọc để lấy partner_uuid nếu API gọi từ client - tuy nhiên API gọi server side thì dùng Service Role tốt hơn)
-- Nhưng để chắc chắn không bị 403 nếu service role lỗi, ta cho phép đọc public các thông tin không nhạy cảm.
-- Tuy nhiên bảng providers chứa encrypted key, KHÔNG NÊN public.
-- Vậy nên ta giữ nguyên providers security. Vấn đề 403 khả năng cao nằm ở bảng user_exchange_accounts.
