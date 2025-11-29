-- A/B Testing Tables

-- Campaigns
CREATE TABLE IF NOT EXISTS ab_test_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'ended')) DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for campaigns updated_at
CREATE TRIGGER update_ab_test_campaigns_modtime
    BEFORE UPDATE ON ab_test_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Variations
CREATE TABLE IF NOT EXISTS ab_test_variations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES ab_test_campaigns(id) ON DELETE CASCADE,
    template_id UUID REFERENCES referral_templates(id) ON DELETE SET NULL,
    traffic_weight INTEGER NOT NULL DEFAULT 50, -- Percentage 0-100
    url_slug TEXT, -- Optional override for specific landing page URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for variations updated_at
CREATE TRIGGER update_ab_test_variations_modtime
    BEFORE UPDATE ON ab_test_variations
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- RLS Policies
ALTER TABLE ab_test_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_variations ENABLE ROW LEVEL SECURITY;

-- Admins can manage everything
CREATE POLICY "Admins can manage campaigns"
    ON ab_test_campaigns
    USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('super_admin', 'admin')));

CREATE POLICY "Admins can manage variations"
    ON ab_test_variations
    USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('super_admin', 'admin')));

-- Public access for redirect logic (read-only)
-- We might need a service role for the redirect logic, but allowing public read for active campaigns is also an option.
-- For now, let's allow public read for active campaigns to simplify the edge function logic if needed.
CREATE POLICY "Public can view active campaigns"
    ON ab_test_campaigns FOR SELECT
    USING (status = 'active');

CREATE POLICY "Public can view variations"
    ON ab_test_variations FOR SELECT
    USING (true); -- Controlled by campaign visibility usually, but simple read is fine.
