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
        className="header flex items-center justify-between p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 relative z-10 shadow-lg"
      >
        {/* Enhanced Logo and Branding */}
        <motion.div 
          className="flex items-center space-x-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="relative">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Sparkles className="w-6 h-6 text-white z-10" />
              {/* Animated background pattern */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
            <motion.div
              className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl opacity-30 blur-sm"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl blur-md animate-pulse" />
          </div>
          
          <div className="flex flex-col">
            <motion.h1 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Ava AI
            </motion.h1>
            <motion.p 
              className="text-sm text-gray-500 dark:text-gray-400 -mt-1 font-medium"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              ✨ Your Intelligent Assistant
            </motion.p>
          </div>
        </motion.div>

        {/* Enhanced Controls */}
        <div className="flex items-center space-x-3">
          {/* Chat Panel Toggle */}
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleChatPanel}
            className={classNames(
              "relative p-3 rounded-2xl transition-all duration-300 group",
              "backdrop-blur-sm border shadow-lg hover:shadow-xl",
              showChatPanel 
                ? "bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-700/50"
                : "bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-gray-400 border-gray-200/50 dark:border-slate-700/50 hover:bg-gray-50/80 dark:hover:bg-slate-700/80"
            )}
            title="Toggle Chat History"
          >
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {showChatPanel && (
              <motion.div
                layoutId="chatIndicator"
                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              />
            )}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          {/* Volume Toggle */}
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleMute}
            className={classNames(
              "relative p-3 rounded-2xl transition-all duration-300 group",
              "backdrop-blur-sm border shadow-lg hover:shadow-xl",
              isMuted 
                ? "bg-red-100/80 dark:bg-red-900/40 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-700/50" 
                : "bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-gray-400 border-gray-200/50 dark:border-slate-700/50 hover:bg-gray-50/80 dark:hover:bg-slate-700/80"
            )}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            <motion.div
              animate={isMuted ? { rotate: [0, -10, 10, 0] } : {}}
              transition={{ duration: 0.5, repeat: isMuted ? Infinity : 0 }}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 group-hover:scale-110 transition-transform" />
              ) : (
                <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
            </motion.div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleDarkMode}
            className={classNames(
              "relative p-3 rounded-2xl transition-all duration-300 group overflow-hidden",
              "backdrop-blur-sm border shadow-lg hover:shadow-xl",
              "bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-gray-400 border-gray-200/50 dark:border-slate-700/50 hover:bg-gray-50/80 dark:hover:bg-slate-700/80"
            )}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 group-hover:scale-110 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
            </motion.div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          {/* Settings Button */}
          <motion.button
            whileHover={{ scale: 1.1, y: -2, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="relative p-3 rounded-2xl transition-all duration-300 group backdrop-blur-sm border shadow-lg hover:shadow-xl bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-gray-400 border-gray-200/50 dark:border-slate-700/50 hover:bg-gray-50/80 dark:hover:bg-slate-700/80"
            title="Settings"
          >
            <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-500/10 to-slate-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
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
