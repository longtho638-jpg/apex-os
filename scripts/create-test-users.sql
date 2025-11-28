-- Helper script to create test users in auth.users if you are using local Supabase
-- or have access to insert into auth.users (usually requires service role or database access)

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'user1@test.com', 'hashed_password_here', NOW(), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'user2@test.com', 'hashed_password_here', NOW(), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'user3@test.com', 'hashed_password_here', NOW(), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'user4@test.com', 'hashed_password_here', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
