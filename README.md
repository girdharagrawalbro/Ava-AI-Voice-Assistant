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
