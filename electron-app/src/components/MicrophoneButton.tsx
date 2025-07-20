import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { classNames } from '../utils';

interface MicrophoneButtonProps {
  isListening: boolean;
  isSpeaking?: boolean;
  isDisabled?: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  isListening,
  isSpeaking = false,
  isDisabled = false,
  onStartListening,
  onStopListening
}) => {
  const handleClick = () => {
    if (isDisabled) return;
    
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Enhanced outer ripple effects */}
      {(isListening || isSpeaking) && (
        <>
          <motion.div
            className={classNames(
              "absolute inset-0 rounded-full border-2 opacity-80",
              isListening 
                ? "border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                : "border-purple-500/60 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            )}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 3.5, opacity: 0 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className={classNames(
              "absolute inset-0 rounded-full border-2 opacity-60",
              isListening 
                ? "border-red-400/50 shadow-[0_0_15px_rgba(248,113,113,0.4)]" 
                : "border-purple-400/50 shadow-[0_0_15px_rgba(167,139,250,0.4)]"
            )}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.4, ease: "easeOut" }}
          />
          <motion.div
            className={classNames(
              "absolute inset-0 rounded-full border-2 opacity-40",
              isListening 
                ? "border-red-300/40 shadow-[0_0_10px_rgba(252,165,165,0.5)]" 
                : "border-purple-300/40 shadow-[0_0_10px_rgba(196,181,253,0.5)]"
            )}
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.8, ease: "easeOut" }}
          />
        </>
      )}
      
      {/* Enhanced background glow */}
      <motion.div
        className={classNames(
          "absolute inset-0 rounded-full blur-2xl transition-all duration-500",
          isListening 
            ? "bg-gradient-to-r from-red-500/40 via-rose-500/40 to-red-600/40" 
            : isSpeaking 
            ? "bg-gradient-to-r from-purple-500/40 via-violet-500/40 to-purple-600/40"
            : "bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-blue-600/30"
        )}
        animate={
          isListening || isSpeaking 
            ? { 
                scale: [1, 1.3, 1.1, 1.3, 1], 
                opacity: [0.3, 0.7, 0.5, 0.8, 0.4] 
              }
            : { scale: 1, opacity: 0.2 }
        }
        transition={{ 
          duration: isListening ? 1.8 : 2.2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Main button with enhanced design */}
      <motion.button
        whileHover={{ scale: isDisabled ? 1 : 1.1 }}
        whileTap={{ scale: isDisabled ? 1 : 0.9 }}
        onClick={handleClick}
        disabled={isDisabled}
        className={classNames(
          'relative w-28 h-28 rounded-full transition-all duration-300 focus:outline-none focus:ring-4',
          'shadow-2xl backdrop-blur-sm border-2 overflow-hidden',
          'before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/10 before:to-transparent before:z-10',
          isListening
            ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 border-red-400/70 focus:ring-red-500/30 shadow-red-500/50'
            : isSpeaking
            ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 border-purple-400/70 focus:ring-purple-500/30 shadow-purple-500/50'
            : 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 border-blue-400/70 focus:ring-blue-500/30 shadow-blue-500/50 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600',
          isDisabled && 'opacity-50 cursor-not-allowed grayscale filter'
        )}
      >
        {/* Enhanced animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={
            {
              backgroundImage: `conic-gradient(from 0deg, transparent, ${
                isListening 
                  ? 'rgba(255,255,255,0.4)' 
                  : isSpeaking 
                  ? 'rgba(255,255,255,0.3)'
                  : 'rgba(255,255,255,0.2)'
              }, transparent)`
            } as React.CSSProperties
          }
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Enhanced inner glow */}
        <motion.div
          className={classNames(
            'absolute inset-3 rounded-full blur-sm',
            isListening
              ? 'bg-gradient-to-br from-red-300/50 to-red-700/50'
              : isSpeaking
              ? 'bg-gradient-to-br from-purple-300/50 to-purple-700/50'
              : 'bg-gradient-to-br from-blue-300/40 to-blue-700/40'
          )}
          animate={
            isListening || isSpeaking 
              ? { 
                  opacity: [0.4, 0.8, 0.6, 0.9, 0.4],
                  scale: [1, 1.1, 1, 1.15, 1]
                } 
              : { opacity: 0.3 }
          }
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        
        {/* Icon container with enhanced animations */}
        <motion.div
          className="relative z-20 flex items-center justify-center h-full text-white"
          animate={
            isListening 
              ? { scale: [1, 1.2, 1.1, 1.25, 1] }
              : isSpeaking
              ? { scale: [1, 1.15, 1.05, 1.2, 1] }
              : { scale: 1 }
          }
          transition={{ duration: isListening ? 0.8 : 1.5, repeat: Infinity }}
        >
          {isListening ? (
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <MicOff className="w-10 h-10 drop-shadow-lg filter" />
            </motion.div>
          ) : isSpeaking ? (
            <motion.div
              animate={{ scale: [1, 1.3, 1, 1.4, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Volume2 className="w-10 h-10 drop-shadow-lg filter" />
            </motion.div>
          ) : (
            <Mic className="w-10 h-10 drop-shadow-lg filter" />
          )}
        </motion.div>
        
        {/* Enhanced pulse indicator */}
        {(isListening || isSpeaking) && (
          <motion.div
            className="absolute inset-4 rounded-full bg-white/30"
            animate={{ 
              scale: [1, 1.4, 1.2, 1.5, 1], 
              opacity: [0.6, 0, 0.4, 0, 0.6] 
            }}
            transition={{ 
              duration: isListening ? 1.2 : 1.8, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        
        {/* Enhanced shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full rounded-full"
          whileHover={{ x: '200%' }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </motion.button>
      
      {/* Enhanced status text */}
      <motion.div
        className="absolute -bottom-14 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.span 
          className={classNames(
            "text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-300",
            isListening 
              ? "bg-red-100/90 text-red-700 border-red-200/50 shadow-lg shadow-red-500/20 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700/30"
              : isSpeaking
              ? "bg-purple-100/90 text-purple-700 border-purple-200/50 shadow-lg shadow-purple-500/20 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700/30"
              : "bg-blue-100/90 text-blue-700 border-blue-200/50 shadow-lg shadow-blue-500/20 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/30"
          )}
          animate={
            isListening || isSpeaking 
              ? { scale: [1, 1.05, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : '💬 Tap to speak'}
        </motion.span>
      </motion.div>
    </div>
  );
};

export default MicrophoneButton;
