CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  step_connect_exchange BOOLEAN DEFAULT FALSE,
  step_view_signal BOOLEAN DEFAULT FALSE,
  step_execute_trade BOOLEAN DEFAULT FALSE,
  step_set_alerts BOOLEAN DEFAULT FALSE,
  step_refer_friend BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_onboarding_user ON user_onboarding(user_id);
