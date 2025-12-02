-- SECURE VOTING POWER CALCULATION
-- Date: 2025-11-30
-- Description: Trigger to automatically calculate voting power on server-side, ignoring client input.

-- 1. Create a function to calculate voting power
CREATE OR REPLACE FUNCTION calculate_voting_power()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Run as admin to access wallet data even if user can't see it
AS $$
DECLARE
    user_balance NUMERIC := 0;
BEGIN
    -- Option A: If you have a 'user_wallets' table with 'balance'
    -- SELECT balance INTO user_balance 
    -- FROM user_wallets 
    -- WHERE user_id = NEW.user_id AND currency = 'GOV_TOKEN';
    
    -- Option B (Current MVP): Default to 1 vote per user (1 Person = 1 Vote)
    -- Or fetch from a 'staking' table later.
    
    -- For now, we'll simulate a check. If 'user_tiers' exists, maybe higher tiers get more votes?
    -- Let's check user tier as an example of dynamic power.
    
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_tiers') THEN
        SELECT 
            CASE 
                WHEN tier = 'ELITE' THEN 10
                WHEN tier = 'TRADER' THEN 5
                WHEN tier = 'PRO' THEN 2
                ELSE 1
            END INTO user_balance
        FROM user_tiers
        WHERE user_id = NEW.user_id;
        
        -- If no tier record, default to 1
        IF user_balance IS NULL THEN
            user_balance := 1;
        END IF;
    ELSE
        user_balance := 1;
    END IF;

    -- OVERRIDE whatever the client sent
    NEW.voting_power := user_balance;

    RETURN NEW;
END;
$$;

-- 2. Attach Trigger to dao_votes table
DROP TRIGGER IF EXISTS set_voting_power_trigger ON dao_votes;

CREATE TRIGGER set_voting_power_trigger
BEFORE INSERT ON dao_votes
FOR EACH ROW
EXECUTE FUNCTION calculate_voting_power();

-- 3. Update Proposals Vote Counts automatically
-- When a vote is cast, update the summary in dao_proposals
CREATE OR REPLACE FUNCTION update_proposal_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.vote_type = 'for' THEN
            UPDATE dao_proposals SET votes_for = votes_for + NEW.voting_power WHERE id = NEW.proposal_id;
        ELSIF NEW.vote_type = 'against' THEN
            UPDATE dao_proposals SET votes_against = votes_against + NEW.voting_power WHERE id = NEW.proposal_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD.vote_type = 'for' THEN
            UPDATE dao_proposals SET votes_for = votes_for - OLD.voting_power WHERE id = OLD.proposal_id;
        ELSIF OLD.vote_type = 'against' THEN
            UPDATE dao_proposals SET votes_against = votes_against - OLD.voting_power WHERE id = OLD.proposal_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS update_proposal_counts_trigger ON dao_votes;

CREATE TRIGGER update_proposal_counts_trigger
AFTER INSERT OR DELETE ON dao_votes
FOR EACH ROW
EXECUTE FUNCTION update_proposal_vote_counts();
