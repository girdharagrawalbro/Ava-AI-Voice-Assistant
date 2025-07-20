import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import type { Message } from '../types';
import { formatTimestamp, classNames } from '../utils';

interface ChatBubbleProps {
  message: Message;
  onPlayAudio?: (audioUrl: string) => void;
  onStopAudio?: () => void;
  isAudioPlaying?: boolean;
  isMuted?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  onPlayAudio,
  onStopAudio,
  isAudioPlaying = false,
  isMuted = false
}) => {
  const { text, isUser, timestamp, audioUrl } = message;
  const formattedTime = formatTimestamp(timestamp);

  const handleAudioClick = () => {
    if (isAudioPlaying) {
      onStopAudio?.();
    } else if (audioUrl && !isMuted) {
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
          
          {/* Enhanced audio button for AI messages */}
          {!isUser && audioUrl && (
            <motion.button
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAudioClick}
              disabled={isMuted}
              className={classNames(
                'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300',
                'backdrop-blur-sm border hover:shadow-lg group/btn',
                isMuted 
                  ? 'opacity-50 cursor-not-allowed bg-gray-100/50 border-gray-200/50'
                  : 'hover:shadow-md bg-white/80 dark:bg-slate-700/80 border-gray-200/50 dark:border-slate-600/50',
                isAudioPlaying && 'animate-pulse bg-blue-100/80 dark:bg-blue-900/30 ring-2 ring-blue-400/30'
              )}
              title={isMuted ? 'Audio muted' : (isAudioPlaying ? 'Stop audio' : 'Play audio')}
            >
              <motion.div
                animate={isAudioPlaying ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5, repeat: isAudioPlaying ? Infinity : 0 }}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <Volume2 className={classNames(
                    "w-3.5 h-3.5 transition-colors group-hover/btn:scale-110",
                    isAudioPlaying 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 group-hover/btn:text-blue-600'
                  )} />
                )}
              </motion.div>
            </motion.button>
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
