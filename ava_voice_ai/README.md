# 🤖 Ava – Conversational Voice AI Desktop App with Database Integration

> **🎉 Now available with modern Electron + TypeScript frontend and Supabase database!**  
> See `../electron-app/` for the new React-based desktop interface.

A comprehensive desktop application that combines voice recognition, AI conversation, natural text-to-speech, and robust data persistence for a complete voice assistant experience with medication management, health tracking, and more.

## 🖥️ Choose Your Interface

### 🌟 Modern Electron Frontend (Recommended)
- **Location**: `../electron-app/`
- **Technology**: React + TypeScript + Electron
- **Features**: Modern UI, better performance, professional design
- **Setup**: See `../electron-app/README.md`

### 🐍 Python Flet Frontend (Legacy)  
- **Location**: This directory
- **Technology**: Python + Flet
- **Features**: Simple setup, Python-native
- **Usage**: `python main.py`

## ✨ Core Features

### 🎙️ Voice & AI Capabilities
- **Voice Input**: Advanced speech recognition using SpeechRecognition
- **AI Conversations**: Powered by Google Gemini for intelligent responses  
- **Natural Voice Output**: High-quality text-to-speech using Murf TTS
- **Real-time Chat**: Visual conversation history with timestamps

### 🏥 Health & Medication Management
- **Medication Tracking**: Add, edit, and manage medications with dosages and schedules
- **Smart Reminders**: Automatic medication reminders with flexible scheduling
- **Health Records**: Track vital signs, symptoms, and health data
- **AI Symptom Analysis**: Get AI-powered health insights and recommendations
- **Emergency Contacts**: Manage emergency contact information

### 📊 Data Persistence
- **Supabase Database**: Secure cloud database with real-time sync
- **Offline Fallback**: Continues working without internet connection
- **Data Security**: Row-level security and encrypted data storage
- **Chat History**: Persistent conversation history across sessions

## 🗄️ Database Features

The application now includes comprehensive database integration with the following tables:
- **Users** - User profiles and preferences
- **Medications** - Medication management with detailed tracking
- **Medication Logs** - Track when medications were taken
- **Reminders** - Smart reminders for medications and appointments
- **Emergency Contacts** - Emergency contact management
- **Health Records** - Store health data and measurements
- **Symptom Checks** - AI-powered symptom analysis history
- **Chat Sessions & Messages** - Conversation history tracking
- **Audio Files** - Audio file management and metadata
- **Health Tips** - Personalized health tips system
- ⚡ **Responsive Design**: Non-blocking UI with threaded operations

## 🏗️ Architecture

```
ava_voice_ai/
├── main.py                 # Application entry point
├── .env                    # API configuration (create from .env.example)
├── requirements.txt        # Python dependencies
├── core/                   # Core AI services
│   ├── voice_input.py     # Speech recognition
│   ├── gemini_response.py # Gemini AI integration  
│   └── murf_tts.py        # Murf TTS integration
├── ui/                    # User interface
│   ├── layout.py          # Main application layout
│   └── components.py      # Reusable UI components
└── assets/                # Application assets
    ├── audio/             # Generated speech files
    └── avatars/           # Assistant images (future)
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo>
cd ava_voice_ai
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure API Keys

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
MURF_API_KEY=your_murf_api_key_here
```

### 4. Run the Application

```bash
python main.py
```

## 🔑 Getting API Keys

### Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

### Murf TTS API Key
1. Sign up at [Murf.ai](https://murf.ai/)
2. Navigate to your account settings
3. Generate an API key
4. Copy the key to your `.env` file

## 🎯 Usage

1. **Start the App**: Run `python main.py` and wait for initialization
2. **Voice Input**: Click the microphone button and speak
3. **AI Response**: Ava will respond both in text and voice
4. **Chat History**: View your conversation in the chat window
5. **Controls**: Use mute/unmute and clear chat buttons as needed

## 🛠️ Development

### Project Structure

- **`main.py`**: Entry point and application startup
- **`core/`**: Backend services for AI functionality
- **`ui/`**: Frontend components and layout management
- **`assets/`**: Static files and generated content

### Key Components

- **VoiceInput**: Handles microphone access and speech recognition
- **GeminiResponse**: Manages AI conversation and context
- **MurfTTS**: Converts text to natural-sounding speech
- **AvaLayout**: Main UI controller and event handler

### Threading Architecture

The app uses threading to keep the UI responsive:
- Voice recognition runs in background threads
- AI processing is non-blocking
- Audio playback doesn't freeze the interface

## 🔧 Customization

### Voice Settings

Modify voice characteristics in `core/murf_tts.py`:

```python
self.default_voice_id = "en-US-sarah"  # Change voice
self.default_style = "friendly"       # Change speaking style
```

### AI Personality

Customize Ava's personality in `core/gemini_response.py`:

```python
self.system_prompt = """Your custom personality prompt here..."""
```

### UI Theme

Adjust the visual theme in `ui/layout.py`:

```python
page.theme_mode = ft.ThemeMode.DARK  # Switch to dark mode
```

## 📋 Requirements

### Python Packages
- `flet>=0.21.2` - Desktop UI framework
- `requests>=2.31.0` - HTTP requests for APIs
- `SpeechRecognition>=3.10.0` - Voice input processing
- `pyaudio>=0.2.11` - Audio input/output
- `google-generativeai>=0.3.2` - Gemini AI integration
- `python-dotenv>=1.0.0` - Environment variable management
- `audioplayer>=0.6` - Audio playback

### System Requirements
- Python 3.8 or higher
- Microphone access
- Internet connection for AI services
- Audio output capability

## 🐛 Troubleshooting

### Common Issues

**Microphone Not Working**
- Check microphone permissions for your terminal/IDE
- Verify microphone is not being used by other applications
- Test with `python -m speech_recognition` 

**API Connection Errors**  
- Verify API keys are correct in `.env` file
- Check internet connection
- Ensure API services are not rate-limited

**Audio Playback Issues**
- Install audio system dependencies for your OS
- Check system volume and audio output device
- Try different audio formats if needed

### Debug Mode

For detailed logging, modify the print statements in core modules or add:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Flet**: Excellent Python UI framework
- **Google Gemini**: Powerful AI conversation capabilities
- **Murf AI**: High-quality text-to-speech synthesis
- **SpeechRecognition**: Reliable voice input processing

## 📞 Support

If you encounter issues or have questions:

1. Check the troubleshooting section above
2. Review the console output for error details  
3. Ensure all API keys are properly configured
4. Verify all dependencies are installed correctly

---

**Made with ❤️ for the Murf AI Coding Challenge**
