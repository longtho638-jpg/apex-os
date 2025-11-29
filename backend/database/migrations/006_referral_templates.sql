-- Referral Templates Table
-- Stores HTML templates for provider referral pages

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS referral_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    html_content TEXT NOT NULL, -- Contains the raw HTML/Tailwind code
    preview_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to update updated_at
CREATE TRIGGER update_referral_templates_modtime
    BEFORE UPDATE ON referral_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- RLS Policies
ALTER TABLE referral_templates ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage templates"
    ON referral_templates
    USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role IN ('super_admin', 'admin')
        )
    );

-- Public (or authenticated users) can view active templates (for selection)
CREATE POLICY "Users can view active templates"
    ON referral_templates FOR SELECT
    USING (is_active = true);
