import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, MessageCircle } from 'lucide-react';
import ChatBubble from './ChatBubble';
import type { Message } from '../types';

interface ChatPanelProps {
  isOpen: boolean;
  messages: Message[];
  onClose: () => void;
  onClearHistory: () => void;
  onPlayAudio?: (audioUrl: string) => void;
  onStopAudio?: () => void;
  onPauseResumeAudio?: () => void;
  isAudioPlaying?: boolean;
  isPaused?: boolean;
  isMuted?: boolean;
  currentAudioUrl?: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  messages,
  onClose,
  onClearHistory,
  onPlayAudio,
  onStopAudio,
  onPauseResumeAudio,
  isAudioPlaying = false,
  isPaused = false,
  isMuted = false,
  currentAudioUrl
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Enhanced Chat Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            className="fixed top-0 right-0 h-full w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-l border-gray-200/50 dark:border-slate-700/50 shadow-2xl z-50"
          >
            {/* Enhanced Panel Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-700/50">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Chat History
                  </h2>
                  <motion.p 
                    className="text-sm text-gray-500 dark:text-gray-400 font-medium"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                  </motion.p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Enhanced Clear History Button */}
                {messages.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClearHistory}
                    className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50/80 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 group backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50"
                    title="Clear chat history"
                  >
                    <Trash2 className="w-4 h-4 group-hover:animate-bounce" />
                  </motion.button>
                )}
                
                {/* Enhanced Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50"
                  title="Close chat panel"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-hidden">
              {messages.length > 0 ? (
                <motion.div 
                  className="h-full overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin"
                >
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChatBubble
                          message={message}
                          onPlayAudio={onPlayAudio}
                          onStopAudio={onStopAudio}
                          onPauseResumeAudio={onPauseResumeAudio}
                          isAudioPlaying={isAudioPlaying && currentAudioUrl === message.audioUrl}
                          isPaused={isPaused && currentAudioUrl === message.audioUrl}
                          isMuted={isMuted}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </motion.div>
              ) : (
                /* Empty State */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full px-8"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl"
                  >
                    <MessageCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Start a conversation with Ava by clicking the microphone button.
                  </p>
                  
                  <motion.div
                    className="mt-8 space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {['Ask about the weather', 'Get help with coding', 'Plan your day'].map((suggestion, index) => (
                      <motion.div
                        key={suggestion}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-full text-sm text-gray-600 dark:text-gray-300"
                      >
                        💡 {suggestion}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Panel Footer */}
            <motion.div
              className="p-4 border-t border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Conversations are stored locally
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatPanel;
