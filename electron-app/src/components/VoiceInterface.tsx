import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Pause, Play } from 'lucide-react';
import { classNames } from '../utils';

interface VoiceInterfaceProps {
  onStartListening?: () => void;
  onStopListening?: () => void;
  onPauseAudio?: () => void;
  onResumeAudio?: () => void;
  isDisabled?: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  isPaused?: boolean;
  status?: string;
}

type VoiceState = 'idle' | 'listening' | 'speaking' | 'paused';

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onStartListening,
  onStopListening,
  onPauseAudio,
  onResumeAudio,
  isDisabled = false,
  isListening = false,
  isSpeaking = false,
  isPaused = false
}) => {
  // Use props to determine voice state instead of internal state
  const voiceState = useMemo((): VoiceState => {
    if (isPaused) return 'paused';
    if (isSpeaking) return 'speaking';
    if (isListening) return 'listening';
    return 'idle';
  }, [isListening, isSpeaking, isPaused]);

  const handleMicrophoneClick = () => {
    if (isDisabled) return;
    
    if (voiceState === 'idle' || voiceState === 'paused') {
      onStartListening?.();
    } else if (voiceState === 'listening') {
      onStopListening?.();
    }
  };

  const handlePausePlayClick = () => {
    if (isDisabled) return;
    
    if (voiceState === 'speaking') {
      onPauseAudio?.();
    } else if (voiceState === 'paused') {
      onResumeAudio?.();
    }
  };

  const getStatusLabel = () => {
    switch (voiceState) {
      case 'listening':
        return '🎤 Listening...';
      case 'speaking':
        return '🔊 Speaking...';
      case 'paused':
        return '⏸️ Listen';
      default:
        return '💬 Tap to speak';
    }
  };

  const getMicrophoneIcon = () => {
    if (voiceState === 'listening') {
      return <Mic className="w-10 h-10 drop-shadow-lg filter" />;
    } else if (voiceState === 'speaking' || voiceState === 'paused') {
      return (
        <motion.div
          animate={{ scale: voiceState === 'speaking' ? [1, 1.3, 1, 1.4, 1] : 1 }}
          transition={{ duration: 0.5, repeat: voiceState === 'speaking' ? Infinity : 0 }}
        >
          <Volume2 className="w-10 h-10 drop-shadow-lg filter" />
        </motion.div>
      );
    }
    return <Mic className="w-10 h-10 drop-shadow-lg filter" />;
  };

  return (
    <div className="relative flex flex-col items-center justify-center gap-4">
      {/* Main Voice Control Container */}
      <div className="relative flex items-center gap-4">
        {/* Enhanced outer ripple effects */}
        {(voiceState === 'listening' || voiceState === 'speaking') && (
          <>
            <motion.div
              className={classNames(
                "absolute inset-0 rounded-full border-2 opacity-80",
                voiceState === 'listening'
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
                voiceState === 'listening'
                  ? "border-red-400/50 shadow-[0_0_15px_rgba(248,113,113,0.4)]"
                  : "border-purple-400/50 shadow-[0_0_15px_rgba(167,139,250,0.4)]"
              )}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.8, opacity: 0 }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.4, ease: "easeOut" }}
            />
          </>
        )}

        {/* Enhanced background glow */}
        <motion.div
          className={classNames(
            "absolute inset-0 rounded-full blur-2xl transition-all duration-500",
            voiceState === 'listening'
              ? "bg-gradient-to-r from-red-500/40 via-rose-500/40 to-red-600/40"
              : voiceState === 'speaking'
                ? "bg-gradient-to-r from-purple-500/40 via-violet-500/40 to-purple-600/40"
                : "bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-blue-600/30"
          )}
          animate={
            (voiceState === 'listening' || voiceState === 'speaking')
              ? {
                scale: [1, 1.3, 1.1, 1.3, 1],
                opacity: [0.3, 0.7, 0.5, 0.8, 0.4]
              }
              : { scale: 1, opacity: 0.2 }
          }
          transition={{
            duration: voiceState === 'listening' ? 1.8 : 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Main Microphone/Speaker Button */}
        <motion.button
          whileHover={{ scale: isDisabled ? 1 : 1.1 }}
          whileTap={{ scale: isDisabled ? 1 : 0.95 }}
          onClick={handleMicrophoneClick}
          disabled={isDisabled}
          className={classNames(
            'relative w-28 h-28 rounded-full transition-all duration-200 focus:outline-none focus:ring-4',
            'shadow-2xl backdrop-blur-sm border-2 overflow-hidden',
            'before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/10 before:to-transparent before:z-10',
            voiceState === 'listening'
              ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 border-red-400/70 focus:ring-red-500/30 shadow-red-500/50'
              : voiceState === 'speaking' || voiceState === 'paused'
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
                backgroundImage: `conic-gradient(from 0deg, transparent, ${voiceState === 'listening'
                    ? 'rgba(255,255,255,0.4)'
                    : voiceState === 'speaking'
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
              voiceState === 'listening'
                ? 'bg-gradient-to-br from-red-300/50 to-red-700/50'
                : voiceState === 'speaking'
                  ? 'bg-gradient-to-br from-purple-300/50 to-purple-700/50'
                  : 'bg-gradient-to-br from-blue-300/40 to-blue-700/40'
            )}
            animate={
              voiceState === 'listening' || voiceState === 'speaking'
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
              voiceState === 'listening'
                ? { scale: [1, 1.2, 1.1, 1.25, 1] }
                : voiceState === 'speaking'
                  ? { scale: [1, 1.15, 1.05, 1.2, 1] }
                  : { scale: 1 }
            }
            transition={{ duration: voiceState === 'listening' ? 0.8 : 1.5, repeat: Infinity }}
          >
            {getMicrophoneIcon()}
          </motion.div>
        </motion.button>

        {/* Pause/Play Button - Only show when speaking or paused */}
        <AnimatePresence>
          {(voiceState === 'speaking' || voiceState === 'paused') && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePausePlayClick}
              disabled={isDisabled}
              className={classNames(
                'relative w-16 h-16 rounded-full transition-all duration-200 focus:outline-none focus:ring-4',
                'shadow-lg backdrop-blur-sm border-2 overflow-hidden',
                'before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/10 before:to-transparent before:z-10',
                voiceState === 'paused'
                  ? 'bg-gradient-to-br from-green-500 via-green-600 to-green-700 border-green-400/70 focus:ring-green-500/30 shadow-green-500/50'
                  : 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 border-yellow-400/70 focus:ring-yellow-500/30 shadow-yellow-500/50',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="relative z-20 flex items-center justify-center h-full text-white">
                {voiceState === 'paused' ? (
                  <Play className="w-6 h-6 drop-shadow-lg filter ml-0.5" />
                ) : (
                  <Pause className="w-6 h-6 drop-shadow-lg filter" />
                )}
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced status text */}
      <motion.div
        className="flex items-center justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.span
          className={classNames(
            "text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-300",
            voiceState === 'listening'
              ? "bg-red-100/90 text-red-700 border-red-200/50 shadow-lg shadow-red-500/20 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700/30"
              : voiceState === 'speaking'
                ? "bg-purple-100/90 text-purple-700 border-purple-200/50 shadow-lg shadow-purple-500/20 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700/30"
                : voiceState === 'paused'
                  ? "bg-yellow-100/90 text-yellow-700 border-yellow-200/50 shadow-lg shadow-yellow-500/20 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700/30"
                  : "bg-blue-100/90 text-blue-700 border-blue-200/50 shadow-lg shadow-blue-500/20 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/30"
          )}
          animate={
            voiceState === 'listening' || voiceState === 'speaking'
              ? { scale: [1, 1.05, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {getStatusLabel()}
        </motion.span>
      </motion.div>
    </div>
  );
};

export default VoiceInterface;
