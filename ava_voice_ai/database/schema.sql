-- Ava AI Voice Assistant Database Schema
-- Execute this script in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    date_of_birth DATE,
    phone_number TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB
);

-- MEDICATIONS TABLE
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    medication_time TEXT NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    medication_type TEXT,
    doctor_prescribed TEXT,
    start_date DATE,
    end_date DATE,
    refill_reminder_days INTEGER DEFAULT 7
);

-- MEDICATION LOGS TABLE
CREATE TABLE IF NOT EXISTS medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
    taken_at TIMESTAMPTZ,
    scheduled_time TEXT,
    status TEXT NOT NULL, -- 'taken', 'missed', 'skipped', 'delayed'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REMINDERS TABLE
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    reminder_time TEXT NOT NULL,
    is_recurring BOOLEAN DEFAULT true,
    days_of_week TEXT[],
    reminder_type TEXT, -- 'medication', 'appointment', 'general'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_triggered TIMESTAMPTZ,
    snooze_until TIMESTAMPTZ
);

-- EMERGENCY CONTACTS TABLE
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    contact_type TEXT
);

-- HEALTH RECORDS TABLE
CREATE TABLE IF NOT EXISTS health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL, -- 'blood_pressure', 'weight', 'temperature', 'glucose', etc.
    data JSONB NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    severity TEXT, -- 'normal', 'warning', 'critical'
    follow_up_required BOOLEAN DEFAULT false
);

-- SYMPTOM CHECKS TABLE
CREATE TABLE IF NOT EXISTS symptom_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    symptoms TEXT NOT NULL,
    severity TEXT, -- 'mild', 'moderate', 'severe'
    duration TEXT,
    ai_analysis TEXT,
    recommendations TEXT[],
    checked_at TIMESTAMPTZ DEFAULT NOW(),
    follow_up_required BOOLEAN DEFAULT false,
    doctor_notified BOOLEAN DEFAULT false
);

-- CHAT SESSIONS TABLE
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMPTZ DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    audio_url TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    processing_time_ms INTEGER,
    gemini_response BOOLEAN DEFAULT false,
    voice_input BOOLEAN DEFAULT false
);

-- AUDIO FILES TABLE
CREATE TABLE IF NOT EXISTS audio_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    duration_seconds FLOAT,
    audio_type TEXT, -- 'speech', 'tts', 'recording'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_processed BOOLEAN DEFAULT false
);

-- HEALTH TIPS TABLE
CREATE TABLE IF NOT EXISTS health_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tip_content TEXT NOT NULL,
    category TEXT,
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT
);

-- USER HEALTH TIPS TABLE (for tracking user interactions with tips)
CREATE TABLE IF NOT EXISTS user_health_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    health_tip_id UUID REFERENCES health_tips(id) ON DELETE CASCADE,
    shown_at TIMESTAMPTZ DEFAULT NOW(),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    is_helpful BOOLEAN
);

-- CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON medications(is_active);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_medication_id ON medication_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_created_at ON medication_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON reminders(is_active);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(record_type);
CREATE INDEX IF NOT EXISTS idx_symptom_checks_user_id ON symptom_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_user_id ON audio_files(user_id);
CREATE INDEX IF NOT EXISTS idx_health_tips_active ON health_tips(is_active);
CREATE INDEX IF NOT EXISTS idx_user_health_tips_user_id ON user_health_tips(user_id);

-- CREATE FUNCTIONS FOR COMMON OPERATIONS

-- Function to increment message count in chat sessions
CREATE OR REPLACE FUNCTION increment_message_count(session_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE chat_sessions 
    SET message_count = message_count + 1 
    WHERE id = session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's active medications due now
CREATE OR REPLACE FUNCTION get_due_medications(user_id_param UUID, current_time TEXT)
RETURNS TABLE(
    medication_id UUID,
    medication_name TEXT,
    dosage TEXT,
    medication_time TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.name, m.dosage, m.medication_time
    FROM medications m
    WHERE m.user_id = user_id_param 
    AND m.is_active = true
    AND m.medication_time = current_time;
END;
$$ LANGUAGE plpgsql;

-- Function to get upcoming reminders
CREATE OR REPLACE FUNCTION get_upcoming_reminders(user_id_param UUID, hours_ahead INTEGER DEFAULT 1)
RETURNS TABLE(
    reminder_id UUID,
    title TEXT,
    description TEXT,
    reminder_time TEXT,
    medication_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.title,
        r.description,
        r.reminder_time,
        COALESCE(m.name, '') as medication_name
    FROM reminders r
    LEFT JOIN medications m ON r.medication_id = m.id
    WHERE r.user_id = user_id_param 
    AND r.is_active = true
    AND r.is_recurring = true
    AND (r.snooze_until IS NULL OR r.snooze_until <= NOW());
END;
$$ LANGUAGE plpgsql;

-- Insert some sample health tips
INSERT INTO health_tips (tip_content, category, priority, source) VALUES
('Drink at least 8 glasses of water daily to stay hydrated', 'hydration', 5, 'WHO Guidelines'),
('Take short walks every hour if you work at a desk', 'exercise', 4, 'Mayo Clinic'),
('Get 7-8 hours of sleep each night for optimal health', 'sleep', 5, 'Sleep Foundation'),
('Practice deep breathing exercises to reduce stress', 'mental_health', 3, 'APA Guidelines'),
('Eat at least 5 servings of fruits and vegetables daily', 'nutrition', 4, 'CDC Guidelines'),
('Wash your hands frequently to prevent illness', 'hygiene', 5, 'CDC Guidelines'),
('Take medication breaks to stretch and move around', 'exercise', 3, 'Physical Therapy Guidelines'),
('Maintain a regular sleep schedule, even on weekends', 'sleep', 4, 'Sleep Foundation'),
('Limit screen time before bedtime for better sleep', 'sleep', 3, 'Sleep Medicine Research'),
('Practice mindfulness or meditation for 10 minutes daily', 'mental_health', 4, 'Mindfulness Research')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_health_tips ENABLE ROW LEVEL SECURITY;

-- Create policies for data access (basic version - adjust based on your auth requirements)
-- Note: These policies assume you have authentication set up. For development, you might want to make them less restrictive.

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Helper policy for accessing user-related data
CREATE POLICY "Users can access own medications" ON medications FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can access own medication logs" ON medication_logs FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can access own reminders" ON reminders FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can access own emergency contacts" ON emergency_contacts FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can access own health records" ON health_records FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can access own symptom checks" ON symptom_checks FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can access own chat sessions" ON chat_sessions FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can access own chat messages" ON chat_messages FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can access own audio files" ON audio_files FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can access own health tip interactions" ON user_health_tips FOR ALL USING (auth.uid()::text = user_id::text);

-- Health tips are public (read-only)
CREATE POLICY "Health tips are publicly readable" ON health_tips FOR SELECT USING (is_active = true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_tips_updated_at BEFORE UPDATE ON health_tips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a default user for single-user applications (optional)
-- You can modify this or remove it based on your needs
INSERT INTO users (id, email, full_name, timezone) VALUES 
('00000000-0000-0000-0000-000000000001', 'user@example.com', 'Default User', 'UTC')
ON CONFLICT (id) DO NOTHING;

COMMIT;
