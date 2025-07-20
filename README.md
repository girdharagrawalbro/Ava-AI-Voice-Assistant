# Ava AI Voice Assistant - Electron Frontend

A modern Electron-based frontend for the Ava AI Voice Assistant, built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS
- **Electron Integration**: Desktop app with native OS integration  
- **Voice Processing**: Real-time voice input and TTS output
- **AI Integration**: Seamless integration with AI backend
- **Responsive Design**: Beautiful UI with dark/light theme support
- **Type Safety**: Full TypeScript support with strict mode

## 📦 Updated Dependencies

### Core Framework
- **React**: `18.3.1` - Latest stable React version
- **React DOM**: `18.3.1` - React DOM renderer
- **TypeScript**: `5.8.3` - Latest TypeScript with enhanced features
- **Electron**: `37.2.3` - Latest Electron with security updates

### Build Tools
- **Vite**: `5.4.19` - Fast build tool and dev server
- **@vitejs/plugin-react**: `4.7.0` - Vite React plugin
- **Electron Builder**: `26.0.12` - Package and build desktop apps

### Styling
- **Tailwind CSS**: `3.4.17` - Utility-first CSS framework
- **Autoprefixer**: `10.4.21` - CSS vendor prefixing
- **PostCSS**: `8.5.6` - CSS transformation tool

### Code Quality
- **ESLint**: `9.31.0` - Latest ESLint with flat config
- **@typescript-eslint/**: `8.37.0` - TypeScript ESLint rules
- **Prettier**: `3.4.2` - Code formatting
- **@eslint/js**: `9.16.0` - ESLint JavaScript rules

### UI Libraries
- **@radix-ui/react-***: `1.1.x` - Accessible UI components
- **Framer Motion**: `12.23.6` - Animation library
- **Lucide React**: `0.525.0` - Beautiful icons
- **Clsx**: `2.1.1` - Utility for conditional classes

### Utilities
- **Axios**: `1.10.0` - HTTP client
- **Class Variance Authority**: `0.7.1` - Component variants
- **Tailwind Merge**: `2.5.4` - Tailwind class merging

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Python 3.8+ (for backend)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Development commands**
   ```bash
   # Frontend only (requires backend running separately)
   npm run dev:frontend
   
   # Full development with backend
   npm run dev
   
   # Frontend only with Electron
   npm run dev:frontend-only
   ```

3. **Build commands**
   ```bash
   # Build for production
   npm run build
   
   # Build and package Electron app
   npm run dist
   ```

4. **Code quality commands**
   ```bash
   # Lint code
   npm run lint
   
   # Auto-fix linting issues
   npm run lint:fix
   
   # Format code with Prettier
   npm run format
   
   # Check code formatting
   npm run format:check
   ```

## 📁 Project Structure

```
electron-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Radix-based)
│   │   ├── AVAInterface.tsx # Main AI interface
│   │   ├── ChatPanel.tsx    # Chat interface
│   │   └── ...
│   ├── pages/              # Application pages
│   │   ├── Home.tsx        # Main application page
│   │   └── ...
│   ├── services/           # API and service layer
│   │   └── api.ts          # Backend API calls
│   ├── styles/             # Global styles
│   │   └── global.css      # Tailwind imports and custom styles
│   ├── lib/                # Utility libraries
│   ├── utils/              # Helper functions
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Root React component
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── dist/                   # Production build output
├── main.js                 # Electron main process
├── preload.js              # Electron preload script
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── eslint.config.js        # ESLint configuration
├── .prettierrc             # Prettier configuration
└── README.md               # This file
```

## 🔧 Configuration Files

### TypeScript Configuration
- **tsconfig.json**: Main TypeScript configuration with strict mode
- **tsconfig.node.json**: Configuration for build tools

### Build Configuration
- **vite.config.ts**: Vite build configuration
- **postcss.config.js**: PostCSS for Tailwind processing

### Code Quality
- **eslint.config.js**: Modern flat ESLint configuration
- **.prettierrc**: Code formatting rules
- **.prettierignore**: Files to ignore during formatting

### Styling
- **tailwind.config.js**: Tailwind CSS configuration with custom theme
- **src/styles/global.css**: Global styles and CSS variables

## 🎨 Styling System

The app uses a comprehensive styling system:

- **Tailwind CSS**: Utility-first CSS framework
- **Custom CSS Variables**: Theme-aware color system
- **Dark/Light Theme**: Automatic theme switching
- **Responsive Design**: Mobile-first responsive design
- **Animation**: Framer Motion for smooth animations
- **Component Variants**: Type-safe component styling with CVA

## 🔌 Electron Integration

- **Main Process**: `main.js` - Electron application lifecycle
- **Preload Script**: `preload.js` - Secure IPC communication
- **Renderer Process**: React app with IPC communication
- **Auto-updater**: Built-in update mechanism
- **Native OS Integration**: System notifications, file dialogs

## 📡 API Integration

The frontend communicates with the Python backend through:

- **REST API**: HTTP requests via Axios
- **WebSocket**: Real-time communication (if needed)
- **Error Handling**: Comprehensive error boundaries
- **Type Safety**: Full TypeScript types for API responses

## 🧪 Development Features

- **Hot Reload**: Instant refresh during development
- **TypeScript**: Full type checking and IntelliSense
- **ESLint**: Code quality and consistency checks
- **Prettier**: Automatic code formatting
- **Source Maps**: Easy debugging with source maps

## 📦 Building for Production

```bash
# Build web assets
npm run build

# Package for current platform
npm run dist

# Package for all platforms (requires setup)
npm run dist:all
```

## 🐛 Known Issues & Solutions

### Issue: TypeScript Warnings
- **Status**: ✅ Fixed - Updated to TypeScript 5.8.3
- **Solution**: Modern TypeScript configuration with proper typing

### Issue: ESLint Configuration  
- **Status**: ✅ Fixed - Updated to ESLint 9.x with flat config
- **Solution**: Modern ESLint configuration with proper React rules

### Issue: Tailwind CSS Not Working
- **Status**: ✅ Fixed - Updated to Tailwind 3.4.17
- **Solution**: Proper PostCSS configuration and CSS imports

### Issue: Dependency Conflicts
- **Status**: ✅ Fixed - All dependencies updated to compatible versions
- **Solution**: Careful version management and peer dependency resolution

## 🔄 Version History

- **v1.0.0**: Initial release with all modern dependencies
- **Latest**: All packages updated to latest stable versions

## 🤝 Contributing

1. Follow the established code style (Prettier + ESLint)
2. Run type checking: `npx tsc --noEmit`
3. Run linting: `npm run lint`  
4. Test the build: `npm run build`

## 📄 License

MIT License - see LICENSE file for details

# 🤖 Ava – Conversational Voice AI Desktop App

A sleek desktop application that combines voice recognition, AI conversation, and natural text-to-speech for an engaging voice assistant experience.

## ✨ Features

- 🎙️ **Voice Input**: Advanced speech recognition using SpeechRecognition
- 🧠 **AI Conversations**: Powered by Google Gemini for intelligent responses  
- 🔊 **Natural Voice Output**: High-quality text-to-speech using Murf TTS
- 🪟 **Modern Desktop UI**: Beautiful interface built with Flet
- 💬 **Real-time Chat**: Visual conversation history with timestamps
- 🔇 **Audio Controls**: Mute/unmute functionality
- 🧹 **Chat Management**: Clear conversation history
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
GOOGLE_API_KEY=your_gemini_api_key_here
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
