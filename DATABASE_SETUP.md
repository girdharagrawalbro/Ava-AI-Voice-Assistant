# Ava AI Voice Assistant - Database Integration Setup

This guide will help you set up the enhanced Ava AI Voice Assistant with Supabase database integration.

## 🗄️ Database Features Added

The following database tables have been integrated into your Ava AI Voice Assistant:

- **Users** - User profiles and preferences
- **Medications** - Medication management with detailed tracking
- **Medication Logs** - Track when medications were taken
- **Reminders** - Smart reminders for medications and appointments
- **Emergency Contacts** - Emergency contact management
- **Health Records** - Store health data and measurements
- **Symptom Checks** - AI-powered symptom analysis history
- **Chat Sessions** - Conversation history tracking
- **Chat Messages** - Individual message storage
- **Audio Files** - Audio file management and metadata
- **Health Tips** - Personalized health tips system
- **User Health Tips** - Track user interactions with tips

## 🚀 Quick Setup Guide

### Step 1: Create Supabase Account

1. Go to [Supabase](https://app.supabase.com/)
2. Create a new account or sign in
3. Create a new project
4. Wait for the project to be ready

### Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (something like `https://xxx.supabase.co`)
   - **Anon Key** (public key starting with `eyJ...`)
   - **Service Role Key** (secret key starting with `eyJ...`)

### Step 3: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database/schema.sql` from this project
3. Paste it into the SQL Editor and run it
4. This will create all the necessary tables and functions

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your credentials:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url_here
   SUPABASE_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
   
   # AI Service Configuration
   GEMINI_API_KEY=your_gemini_api_key_here
   MURF_API_KEY=your_murf_api_key_here
   ```

### Step 5: Install Dependencies

```bash
pip install -r requirements.txt
```

New dependencies added:
- `supabase>=2.0.0` - Supabase Python client
- `postgrest>=0.12.0` - PostgreSQL REST API client
- `storage3>=0.6.0` - Supabase storage client

### Step 6: Initialize Database

Run the setup script to initialize your database:

```bash
python setup_database.py
```

This will:
- Check your configuration
- Test database connection
- Create a default user
- Insert sample health tips
- Verify all tables are working

### Step 7: Start the Application

```bash
python main.py
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Your Supabase project URL | Yes | - |
| `SUPABASE_KEY` | Your Supabase anon key | Yes | - |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key | No | - |
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes | - |
| `MURF_API_KEY` | Murf TTS API key | No | - |
| `DEFAULT_USER_ID` | Default user ID for single-user mode | No | `default-user` |
| `MAX_AUDIO_FILES` | Maximum audio files to keep | No | `50` |
| `AUDIO_RETENTION_HOURS` | Hours to keep audio files | No | `24` |
| `DEFAULT_TIMEZONE` | Default timezone | No | `UTC` |

### Database Configuration

The application supports both database and fallback modes:

- **Database Mode**: When Supabase is configured, all data is stored in the database
- **Fallback Mode**: When database is not available, uses in-memory storage (data is lost on restart)

## 📊 API Endpoints

### New Database-Integrated Endpoints

All existing endpoints now support database storage with automatic fallback:

#### Medications
- `GET /api/medications` - Get user medications
- `POST /api/medications` - Add new medication
- `PUT /api/medications/{id}` - Update medication
- `DELETE /api/medications/{id}` - Delete medication

#### Medication Logs
- `POST /api/medication-logs` - Log medication taken
- `GET /api/medication-logs` - Get medication history

#### Reminders
- `GET /api/reminders` - Get user reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/{id}` - Update reminder
- `DELETE /api/reminders/{id}` - Delete reminder

#### Emergency Contacts
- `GET /api/emergency-contacts` - Get emergency contacts
- `POST /api/emergency-contacts` - Add emergency contact
- `PUT /api/emergency-contacts/{id}` - Update contact
- `DELETE /api/emergency-contacts/{id}` - Delete contact

#### Health Records
- `POST /api/health-records` - Add health record
- `GET /api/health-records` - Get health history

#### Symptom Checks
- `POST /api/symptom-check` - Analyze symptoms (now saves to database)
- `GET /api/symptom-history` - Get symptom check history

#### Health Tips
- `GET /api/health-tips` - Get personalized health tips (from database)

## 🔒 Security Features

### Row Level Security (RLS)

All tables have Row Level Security enabled to ensure users can only access their own data.

### Data Privacy

- All user data is isolated by user ID
- Audio files have expiration timestamps
- Sensitive health data is encrypted in transit and at rest

## 🧪 Testing the Integration

### Check Database Status

```bash
curl http://localhost:8000/status
```

Look for the `database` section in the response:
```json
{
  "success": true,
  "data": {
    "database": {
      "status": "healthy",
      "timestamp": "2024-01-20T10:00:00Z"
    }
  }
}
```

### Test Medication Management

1. Add a medication:
```bash
curl -X POST http://localhost:8000/api/medications \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vitamin D",
    "dosage": "1000 IU",
    "frequency": "Once daily",
    "time": "08:00",
    "notes": "Take with breakfast"
  }'
```

2. Get medications:
```bash
curl http://localhost:8000/api/medications
```

## 🐛 Troubleshooting

### Database Connection Issues

1. **Check Supabase URL and Keys**:
   - Ensure URL starts with `https://` and ends with `.supabase.co`
   - Verify keys are not expired

2. **Check Network Connectivity**:
   ```bash
   ping your-project.supabase.co
   ```

3. **Verify Database Schema**:
   - Run the SQL script in Supabase SQL Editor
   - Check if tables exist in Database → Tables

### Environment Issues

1. **Missing .env file**:
   ```bash
   cp .env.example .env
   ```

2. **Invalid API keys**:
   - Check Gemini API key at [Google AI Studio](https://makersuite.google.com/)
   - Verify Murf API key at [Murf](https://murf.ai/)

### Dependency Issues

1. **Install missing packages**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Update packages**:
   ```bash
   pip install --upgrade supabase
   ```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Google Gemini AI](https://ai.google.dev/)
- [Murf TTS API](https://murf.ai/docs/)

## 🆘 Support

If you encounter issues:

1. Check the application logs for error messages
2. Verify your environment configuration
3. Test database connectivity using the setup script
4. Check Supabase dashboard for any service issues

The application will automatically fall back to in-memory storage if the database is unavailable, ensuring Ava AI continues to work even with connection issues.
