-- Add 'deposit' to the CHECK constraint for transactions.type
-- Since we can't easily ALTER CONSTRAINT in a single line for CHECK, 
-- we usually drop and re-add it, or if it's defined inline, we might need to update the table definition.
-- However, for a live DB, the safest is to drop the constraint and add a new one.

-- 1. Drop old constraint if it exists (name might vary, so we try a common name or check information_schema)
-- Assuming Supabase named it transactions_type_check
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

-- 2. Add new constraint with 'deposit'
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('rebate', 'withdrawal', 'withdrawal_fee', 'adjustment', 'bonus', 'refund', 'deposit'));
