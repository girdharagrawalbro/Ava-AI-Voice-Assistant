import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react';
import type { Message } from '../types';
import { formatTimestamp, classNames } from '../utils';

interface ChatBubbleProps {
  message: Message;
  onPlayAudio?: (audioUrl: string) => void;
  onStopAudio?: () => void;
  onPauseResumeAudio?: () => void;
  isAudioPlaying?: boolean;
  isPaused?: boolean;
  isMuted?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  onPlayAudio,
  onStopAudio,
  onPauseResumeAudio,
  isAudioPlaying = false,
  isPaused = false,
  isMuted = false
}) => {
  const { text, isUser, timestamp, audioUrl } = message;
  const formattedTime = formatTimestamp(timestamp);

  const handleAudioClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔊 Audio button clicked:', { 
      audioUrl, 
      isAudioPlaying, 
      isPaused,
      isMuted,
      messageId: message.id,
      isUser: message.isUser 
    });
    
    if (isMuted) {
      console.log('🔇 Audio is muted, cannot play');
      return;
    }
    
    if (!audioUrl) {
      console.log('🔇 No audio URL available for message:', message.id);
      return;
    }

    // Validate audio URL
    if (!audioUrl.startsWith('http://') && !audioUrl.startsWith('https://') && !audioUrl.startsWith('/')) {
      console.error('🔇 Invalid audio URL format:', audioUrl);
      return;
    }

    // Handle different audio states with immediate feedback
    if (isPaused) {
      console.log('▶️ Resuming audio playback');
      onPauseResumeAudio?.();
    } else if (isAudioPlaying) {
      console.log('⏸️ Pausing audio playbook');
      onPauseResumeAudio?.();
    } else {
      console.log('▶️ Starting audio playback:', audioUrl);
      onPlayAudio?.(audioUrl);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.8
      }}
      className={classNames(
        'flex w-full mb-6 group',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <motion.div 
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={classNames(
          'chat-bubble max-w-[85%] rounded-3xl px-6 py-4 shadow-lg backdrop-blur-sm transition-all duration-300',
          'relative border group-hover:shadow-xl',
          isUser 
            ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white ml-12 shadow-blue-500/30 border-blue-400/30' 
            : 'bg-white/95 dark:bg-slate-800/95 text-gray-800 dark:text-gray-100 mr-12 shadow-gray-200/50 border-gray-200/50 dark:border-slate-700/50'
        )}
      >
        {/* Enhanced glass morphism overlay */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        
        {/* Message text with enhanced typography */}
        <motion.div 
          className="text-sm leading-relaxed mb-3 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p className="whitespace-pre-wrap break-words">
            {text}
          </p>
        </motion.div>
        
        {/* Enhanced message footer */}
        <motion.div 
          className={classNames(
            'flex items-center justify-between gap-3 relative z-10',
            isUser ? 'text-blue-100/80' : 'text-gray-500/80 dark:text-gray-400/80'
          )}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-xs opacity-75 font-medium">
            {formattedTime}
          </span>
          
          {/* Enhanced audio controls for AI messages */}
          {!isUser && audioUrl && (
            <div className="flex items-center gap-2">
              {/* Play/Pause Button */}
              <motion.button
                whileHover={{ scale: isMuted ? 1 : 1.15, rotate: isMuted ? 0 : 5 }}
                whileTap={{ scale: isMuted ? 1 : 0.9 }}
                onClick={handleAudioClick}
                disabled={isMuted}
                className={classNames(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200',
                  'backdrop-blur-sm border hover:shadow-lg group/btn focus:outline-none focus:ring-2',
                  isMuted 
                    ? 'opacity-50 cursor-not-allowed bg-gray-100/50 border-gray-200/50 dark:bg-gray-800/50 dark:border-gray-700/50'
                    : isPaused
                      ? 'bg-yellow-100/80 border-yellow-300/50 text-yellow-600 hover:bg-yellow-200/80 shadow-yellow-500/20 focus:ring-yellow-500/30 dark:bg-yellow-900/40 dark:border-yellow-600/40 dark:text-yellow-400'
                      : isAudioPlaying
                        ? 'bg-purple-100/80 border-purple-300/50 text-purple-600 hover:bg-purple-200/80 shadow-purple-500/20 focus:ring-purple-500/30 dark:bg-purple-900/40 dark:border-purple-600/40 dark:text-purple-400'
                        : 'bg-blue-100/80 border-blue-300/50 text-blue-600 hover:bg-blue-200/80 shadow-blue-500/20 focus:ring-blue-500/30 dark:bg-blue-900/40 dark:border-blue-600/40 dark:text-blue-400'
                )}
                title={
                  isMuted 
                    ? "Audio is muted" 
                    : isPaused
                      ? "Resume audio"
                      : isAudioPlaying 
                        ? "Pause audio" 
                        : "Play audio"
                }
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : isPaused ? (
                  <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                ) : isAudioPlaying ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <Pause className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Volume2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                )}
              </motion.button>
              
              {/* Stop Button - only show when audio is playing or paused */}
              {(isAudioPlaying || isPaused) && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onStopAudio?.()}
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100/80 border border-red-300/50 text-red-600 hover:bg-red-200/80 shadow-red-500/20 transition-all duration-300"
                  title="Stop audio"
                >
                  <Square className="w-3 h-3" />
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
        
        {/* User avatar indicator */}
        {isUser && (
          <motion.div 
            className="absolute -right-3 -bottom-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white dark:border-slate-900"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
          >
            U
          </motion.div>
        )}
        
        {/* AI avatar indicator */}
        {!isUser && (
          <motion.div 
            className="absolute -left-3 -bottom-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white dark:border-slate-900"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
          >
            🤖
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ChatBubble;
