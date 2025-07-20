import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import MicrophoneButton from '../components/MicrophoneButton';
import ChatPanel from '../components/ChatPanel';
import StatusIndicator from '../components/StatusIndicator';
import { apiService } from '../services/api';
import { generateId, formatMessage, playAudio, stopAudio, storage, STORAGE_KEYS, THEMES, MAX_MESSAGES } from '../utils';
import type { Message, AppState } from '../types';

const Home: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    messages: [],
    isListening: false,
    isSpeaking: false,
    isMuted: false,
    isDarkMode: false,
    status: 'idle',
    currentAudio: undefined
  });

  const [showChatPanel, setShowChatPanel] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedMessages = storage.get(STORAGE_KEYS.MESSAGES) || [];
    const savedSettings = storage.get(STORAGE_KEYS.SETTINGS) || {};
    const savedTheme = storage.get(STORAGE_KEYS.THEME) || THEMES.LIGHT;

    setAppState(prev => ({
      ...prev,
      messages: savedMessages.slice(-MAX_MESSAGES),
      isDarkMode: savedTheme === THEMES.DARK,
      isMuted: savedSettings.isMuted || false
    }));

    // Apply theme
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Save messages when they change
  useEffect(() => {
    if (appState.messages.length > 0) {
      storage.set(STORAGE_KEYS.MESSAGES, appState.messages);
    }
  }, [appState.messages]);

  // Update app state
  const updateState = useCallback((updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  }, []);

  // Add message to chat
  const addMessage = useCallback((text: string, isUser: boolean, audioUrl?: string) => {
    const message: Message = {
      id: generateId(),
      text: formatMessage(text),
      isUser,
      timestamp: new Date(),
      audioUrl
    };

    setAppState(prev => ({
      ...prev,
      messages: [...prev.messages.slice(-MAX_MESSAGES + 1), message]
    }));

    return message;
  }, []);

  // Handle voice input start
  const startListening = useCallback(async () => {
    if (appState.isListening) return;

    try {
      updateState({ isListening: true, status: 'listening' });
      
      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      // Use new API service method
      const response = await apiService.startVoiceRecognition({ 
        timeout: 10, 
        phrase_time_limit: 15 
      });
      
      // Add user message
      addMessage(response.text, true);
      
      // Get AI response
      await getAIResponse(response.text);
      
    } catch (error: any) {
      console.error('Voice input error:', error);
      updateState({ status: 'error' });
      
      if (!error.message?.includes('aborted')) {
        addMessage(`Error: ${error.message}`, false);
      }
    } finally {
      updateState({ isListening: false });
      if (appState.status !== 'speaking' && appState.status !== 'processing') {
        updateState({ status: 'idle' });
      }
    }
  }, [appState.isListening, appState.status, addMessage, updateState]);

  // Handle voice input stop
  const stopListening = useCallback(async () => {
    if (!appState.isListening) return;

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      await apiService.stopVoiceRecognition();
    } catch (error) {
      console.error('Stop listening error:', error);
    } finally {
      updateState({ isListening: false, status: 'idle' });
    }
  }, [appState.isListening, updateState]);

  // Get AI response
  const getAIResponse = useCallback(async (userText: string) => {
    try {
      updateState({ status: 'processing' });
      
      const response = await apiService.getGeminiResponse({ text: userText });
      
      const aiMessage = addMessage(response.response, false);
      
      // Generate speech for AI response
      if (!appState.isMuted) {
        await generateSpeech(response.response, aiMessage.id);
      }
      
    } catch (error: any) {
      console.error('AI response error:', error);
      addMessage(`AI Error: ${error.message}`, false);
      updateState({ status: 'error' });
      
      setTimeout(() => updateState({ status: 'idle' }), 2000);
    }
  }, [addMessage, appState.isMuted, updateState]);

  // Generate speech
  const generateSpeech = useCallback(async (text: string, messageId: string) => {
    try {
      updateState({ status: 'speaking', isSpeaking: true });
      
      const response = await apiService.generateSpeech({ 
        text, 
        voice_id: 'en-US-terrell' 
      });
      
      if (response.audio_url || response.audio_path || response.filename) {
        const audioUrl = response.audio_url || 
          (response.filename ? apiService.getAudioUrl(response.filename) : 
           response.audio_path ? apiService.getAudioUrl(response.audio_path) : '');
        
        // Update message with audio URL
        setAppState((prev: AppState) => ({
          ...prev,
          messages: prev.messages.map((msg: Message) => 
            msg.id === messageId ? { ...msg, audioUrl } : msg
          )
        }));
        
        // Play audio if we have a URL
        if (audioUrl) {
          const audio = await playAudio(audioUrl);
          updateState({ currentAudio: audio });
          
          audio.onended = () => {
            updateState({ isSpeaking: false, status: 'idle', currentAudio: undefined });
          };
        }
      } else if (response.fallback) {
        // Fallback TTS was used (no audio file)
        console.log('Using fallback TTS:', response.message);
        updateState({ isSpeaking: false, status: 'idle' });
      } else {
        throw new Error('Speech generation failed - no audio returned');
      }
    } catch (error: any) {
      console.error('Speech generation error:', error);
      updateState({ isSpeaking: false, status: 'idle', currentAudio: undefined });
    }
  }, [updateState]);

  // Handle audio playback
  const handlePlayAudio = useCallback(async (audioUrl: string) => {
    try {
      if (appState.currentAudio) {
        stopAudio(appState.currentAudio);
      }
      
      const audio = await playAudio(audioUrl);
      updateState({ currentAudio: audio, isSpeaking: true });
      
      audio.onended = () => {
        updateState({ currentAudio: undefined, isSpeaking: false });
      };
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }, [appState.currentAudio, updateState]);

  // Stop audio playback
  const handleStopAudio = useCallback(() => {
    if (appState.currentAudio) {
      stopAudio(appState.currentAudio);
      updateState({ currentAudio: undefined, isSpeaking: false });
    }
  }, [appState.currentAudio, updateState]);

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    const newMuted = !appState.isMuted;
    updateState({ isMuted: newMuted });
    
    // Save setting
    const settings = storage.get(STORAGE_KEYS.SETTINGS) || {};
    storage.set(STORAGE_KEYS.SETTINGS, { ...settings, isMuted: newMuted });
    
    // Stop current audio if muting
    if (newMuted && appState.currentAudio) {
      handleStopAudio();
    }
  }, [appState.isMuted, appState.currentAudio, updateState, handleStopAudio]);

  // Clear chat
  const handleClearChat = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      updateState({ messages: [] });
      storage.remove(STORAGE_KEYS.MESSAGES);
    }
  }, [updateState]);

  // Toggle theme
  const handleToggleTheme = useCallback(() => {
    const newTheme = appState.isDarkMode ? THEMES.LIGHT : THEMES.DARK;
    updateState({ isDarkMode: !appState.isDarkMode });
    
    document.documentElement.setAttribute('data-theme', newTheme);
    storage.set(STORAGE_KEYS.THEME, newTheme);
  }, [appState.isDarkMode, updateState]);

  // Toggle chat panel
  const handleToggleChatPanel = useCallback(() => {
    setShowChatPanel(prev => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (appState.currentAudio) {
        stopAudio(appState.currentAudio);
      }
    };
  }, [appState.currentAudio]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-all duration-700">
      {/* Header */}
      <Header
        isDarkMode={appState.isDarkMode}
        isMuted={appState.isMuted}
        showChatPanel={showChatPanel}
        onToggleDarkMode={handleToggleTheme}
        onToggleMute={handleToggleMute}
        onToggleChatPanel={handleToggleChatPanel}
      />

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating particles */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full"
            animate={{ 
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/40 rounded-full"
            animate={{ 
              y: [20, -20, 20],
              x: [10, -10, 10],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-indigo-400/20 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 2 }}
          />

          {/* Gradient orbs */}
          <motion.div
            className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        {/* Central Interface */}
        <motion.div 
          className="flex flex-col items-center justify-center h-full px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Status Indicator */}
          <div className="mb-8">
            <StatusIndicator 
              status={appState.status}
            />
          </div>

          {/* Microphone Button */}
          <motion.div 
            className="mb-12"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20, 
              delay: 0.5 
            }}
          >
            <MicrophoneButton
              isListening={appState.isListening}
              isSpeaking={appState.isSpeaking}
              isDisabled={appState.status === 'error'}
              onStartListening={startListening}
              onStopListening={stopListening}
            />
          </motion.div>

          {/* Welcome Message */}
          <AnimatePresence>
            {appState.messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center max-w-md"
              >
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Hi! I'm Ava 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  Your intelligent voice assistant. Click the microphone to start a conversation, or ask me anything!
                </p>
                
                {/* Quick action suggestions */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Try saying:</p>
                  {[
                    '🌤️ "What\'s the weather like?"',
                    '💡 "Help me with coding"',
                    '📅 "Plan my day"'
                  ].map((suggestion, index) => (
                    <motion.div
                      key={suggestion}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full text-sm text-gray-700 dark:text-gray-300 border border-white/20 dark:border-slate-700/50"
                    >
                      {suggestion}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats */}
          {appState.messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 px-6 py-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-full border border-white/30 dark:border-slate-700/30"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                💬 {appState.messages.length} messages in this session
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Chat Panel */}
        <ChatPanel
          isOpen={showChatPanel}
          messages={appState.messages}
          onClose={() => setShowChatPanel(false)}
          onClearHistory={handleClearChat}
          onPlayAudio={handlePlayAudio}
          onStopAudio={handleStopAudio}
          isAudioPlaying={!!appState.currentAudio}
          isMuted={appState.isMuted}
        />
      </main>
    </div>
  );
};

export default Home;
