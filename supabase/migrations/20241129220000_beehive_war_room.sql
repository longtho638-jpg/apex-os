-- Add metadata column to crm_pipelines for Ghost Profit and Sniper Triggers
ALTER TABLE crm_pipelines ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create notifications table for Resonance Bell
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'AMBIENT', 'NECTAR', 'CRITICAL'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel_preference JSONB DEFAULT '{"web": true, "push": true, "email": false}',
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Service role can insert notifications
CREATE POLICY "Service role can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);
