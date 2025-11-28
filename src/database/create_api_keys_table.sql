-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    exchange TEXT NOT NULL,
    key TEXT NOT NULL, -- Encrypted
    secret TEXT NOT NULL, -- Encrypted
    label TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own keys" ON api_keys
    FOR ALL
    USING (auth.uid() = user_id);
