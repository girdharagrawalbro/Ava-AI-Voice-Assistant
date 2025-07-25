-- Additional SQL to fix Row Level Security for development
-- Run this in your Supabase SQL Editor after running the main schema.sql

-- Temporarily disable RLS for development (you can enable it later for production)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminders DISABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_checks DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_health_tips DISABLE ROW LEVEL SECURITY;

-- Keep health_tips public
-- Health tips table doesn't need RLS as it's public data

-- Insert or update the default user to ensure it exists
INSERT INTO users (id, email, full_name, timezone, created_at, updated_at) 
VALUES (
    '00000000-0000-0000-0000-000000000001', 
    'user@example.com', 
    'Default User', 
    'UTC',
    NOW(),
    NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
    updated_at = NOW(),
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    timezone = EXCLUDED.timezone;

-- Grant necessary permissions to the anon role for development
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Note: For production, you should:
-- 1. Re-enable RLS on all tables
-- 2. Set up proper authentication 
-- 3. Create appropriate RLS policies based on auth.uid()
-- 4. Revoke broad permissions and grant specific ones

COMMIT;
