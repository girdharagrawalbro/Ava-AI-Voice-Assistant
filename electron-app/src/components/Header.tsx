import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Sun, Volume2, VolumeX, MessageCircle, Sparkles } from 'lucide-react';
import SettingsModal from './SettingsModal';
import { classNames } from '../utils';

interface HeaderProps {
  isDarkMode: boolean;
  isMuted: boolean;
  showChatPanel: boolean;
  onToggleDarkMode: () => void;
  onToggleMute: () => void;
  onToggleChatPanel: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  isMuted,
  showChatPanel,
  onToggleDarkMode,
  onToggleMute,
  onToggleChatPanel
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50 relative z-10"
      >
        {/* Logo and Branding */}
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="relative">
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <motion.div
              className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl opacity-20 blur-sm"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          
          <div className="flex flex-col">
            <motion.h1 
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Ava
            </motion.h1>
            <motion.p 
              className="text-xs text-gray-500 dark:text-gray-400 -mt-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              AI Assistant
            </motion.p>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Chat Panel Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleChatPanel}
            className={classNames(
              "relative p-2 rounded-xl transition-all duration-200",
              "hover:bg-gray-100 dark:hover:bg-slate-800",
              showChatPanel 
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400"
            )}
            title="Toggle Chat History"
          >
            <MessageCircle className="w-5 h-5" />
            {showChatPanel && (
              <motion.div
                layoutId="chatIndicator"
                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              />
            )}
          </motion.button>

          {/* Volume Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleMute}
            className={classNames(
              "p-2 rounded-xl transition-all duration-200",
              "hover:bg-gray-100 dark:hover:bg-slate-800",
              isMuted 
                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" 
                : "text-gray-600 dark:text-gray-400"
            )}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </motion.button>

          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleDarkMode}
            className={classNames(
              "relative p-2 rounded-xl transition-all duration-200 overflow-hidden",
              "hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400"
            )}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.div>
          </motion.button>

          {/* Settings Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Gradient overlay for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      </motion.header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        isMuted={isMuted}
        isDarkMode={isDarkMode}
        onToggleMute={onToggleMute}
        onToggleDarkMode={onToggleDarkMode}
      />
    </>
  );
};

export default Header;
