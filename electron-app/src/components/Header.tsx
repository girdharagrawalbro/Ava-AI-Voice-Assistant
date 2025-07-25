import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bot, Sun, Moon, Bell, BellOff, AlertCircle, Home } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showControls?: boolean;
  isDarkMode?: boolean;
  isMuted?: boolean;
  onToggleTheme?: () => void;
  onToggleMute?: () => void;
  onEmergency?: () => void;
  isHomePage?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = "AVA",
  subtitle = "AI Voice Assistant",
  showControls = false,
  isDarkMode = false,
  isMuted = false,
  onToggleTheme,
  onToggleMute,
  onEmergency,
  isHomePage = false
}) => {
  const navigate = useNavigate();

  return (
    <header className={`${isHomePage ? 'relative z-10 p-6' : 'flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 shadow-md border-b border-slate-200 dark:border-slate-800 z-20'}`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-3"
      >
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
          <Bot className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {subtitle}
          </p>
        </div>
      </motion.div>
      
      {showControls && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-all"
            title="Go to Home"
          >
            <Home size={18} />
          </button>
          {onToggleTheme && (
            <button 
              onClick={onToggleTheme} 
              className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          {onToggleMute && (
            <button 
              onClick={onToggleMute} 
              className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all"
            >
              {isMuted ? <BellOff size={18} /> : <Bell size={18} />}
            </button>
          )}
          {onEmergency && (
            <button 
              onClick={onEmergency} 
              className="p-2 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-all"
            >
              <AlertCircle size={18} />
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
