-- Create invites table
CREATE TABLE IF NOT EXISTS invites (
    code TEXT PRIMARY KEY,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    used_by UUID REFERENCES auth.users(id)
);

-- RLS Policies
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invites" ON invites
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Public can check invite validity" ON invites
    FOR SELECT
    USING (true);
