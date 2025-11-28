# Row Level Security (RLS) Policies

## Overview
We use Supabase RLS to ensure data security at the database layer.

## Policies by Table

### `user_tiers`
*   **View:** Users can only view their own tier status.
*   **Modify:** Service Role only (Backend logic updates tiers).

### `referral_network`
*   **View:** Users can view:
    1.  People they referred (`referrer_id = auth.uid()`)
    2.  Who referred them (`referee_id = auth.uid()`)
*   **Modify:** Service Role only (Invite system updates this).

### `commission_pool`
*   **View:** All authenticated users (Public transparency).
*   **Modify:** Service Role only (Monthly jobs).

### `commission_transactions`
*   **View:** Users can only view their own earnings.
*   **Modify:** Service Role only.

### `viral_metrics`
*   **View:** All authenticated users (Public growth stats).
*   **Modify:** Service Role only.

## Testing RLS
To verify RLS is working:
1.  Log in as User A.
2.  Attempt to `SELECT * FROM commission_transactions`.
3.  Ensure you only receive rows where `user_id` matches User A.
