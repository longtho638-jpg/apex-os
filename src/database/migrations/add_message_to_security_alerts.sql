ALTER TABLE security_alerts ADD COLUMN IF NOT EXISTS message TEXT;
NOTIFY pgrst, 'reload schema';
