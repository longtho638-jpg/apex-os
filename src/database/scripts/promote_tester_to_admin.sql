-- ==============================================================================
-- PROMOTE USER TO ADMIN (FIXED)
-- ==============================================================================
-- User: verified_tester_1763873096775@apex.com
-- Role: super_admin
-- ==============================================================================

DO $$
DECLARE
    target_email TEXT := 'verified_tester_1763873096775@apex.com';
    user_uid UUID;
BEGIN
    -- 1. Try to find the user's UUID from auth.users
    SELECT id INTO user_uid
    FROM auth.users
    WHERE email = target_email;

    -- 2. If user found, proceed to promote
    IF user_uid IS NOT NULL THEN
        RAISE NOTICE 'Found user % with UUID: %', target_email, user_uid;

        -- 3. Check if already in admin_users
        IF EXISTS (SELECT 1 FROM public.admin_users WHERE id = user_uid) THEN
            -- Update existing admin role
            UPDATE public.admin_users
            SET role = 'super_admin'
            -- Removed updated_at
            WHERE id = user_uid;
            RAISE NOTICE 'Updated existing admin user role to super_admin';
        ELSE
            -- Insert new admin user
            INSERT INTO public.admin_users (id, email, role, created_at)
            VALUES (
                user_uid, 
                target_email, 
                'super_admin', 
                NOW()
            );
            RAISE NOTICE 'Promoted user to admin successfully';
        END IF;
        
    ELSE
        RAISE WARNING 'User % not found in auth.users.', target_email;
    END IF;

END $$;

-- Verify
SELECT * FROM public.admin_users WHERE email = 'verified_tester_1763873096775@apex.com';
