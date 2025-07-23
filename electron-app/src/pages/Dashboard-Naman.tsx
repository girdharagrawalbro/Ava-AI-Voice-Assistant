import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Volume2, Pause, Play, Square, Home, ArrowLeft } from 'lucide-react';
import Header from '../components/Header-New';
import VoiceInterface from '../components/VoiceInterface';
import ChatPanel from '../components/ChatPanel'; ``
import StatusIndicator from '../components/StatusIndicator';
import { apiService } from '../services/api';
import { generateId, formatMessage, playAudio, stopAudio, pauseAudio, resumeAudio, storage, STORAGE_KEYS, THEMES, MAX_MESSAGES } from '../utils';
import type { Message, AppState } from '../types';

const Dashboard: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    messages: [],
    isListening: false,
    isSpeaking: false,
    isPaused: false,
    isMuted: false,
    isDarkMode: false,
    status: 'idle',
    currentAudio: undefined
  });

  const [showChatPanel, setShowChatPanel] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const navigate = useNavigate();

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

  // Handle voice input start with debouncing
  const startListening = useCallback(async () => {
    if (appState.isListening || isProcessingRef.current) return;

    isProcessingRef.current = true;
    try {
      console.log('🎤 Starting voice recognition...');
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

      console.log('🎤 Voice recognition response:', response);

      if (response.text && response.text.trim()) {
        // Add user message
        addMessage(response.text, true);

        // Get AI response
        await getAIResponse(response.text);
      } else {
        console.log('🎤 No speech detected or empty response');
        addMessage('No speech detected. Please try again.', false);
      }

    } catch (error: any) {
      console.error('🎤 Voice input error:', error);
      updateState({ status: 'error' });

      if (!error.message?.includes('aborted')) {
        const errorMessage = error.message?.includes('Network error')
          ? 'Cannot connect to voice service. Please check if the backend is running.'
          : error.message?.includes('timeout') || error.message?.includes('TIMEOUT')
            ? 'Voice recognition timed out. Please try again.'
            : `Voice recognition error: ${error.message}`;

        addMessage(errorMessage, false);
      }
    } finally {
      updateState({ isListening: false });
      if (appState.status !== 'speaking' && appState.status !== 'processing') {
        setTimeout(() => updateState({ status: 'idle' }), 1000);
      }
      isProcessingRef.current = false;
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
      console.log('🎵 Generating speech for text:', text);
      updateState({ status: 'speaking', isSpeaking: true });

      const response = await apiService.generateSpeech({
        text,
        voice_id: 'en-US-terrell'
      });

      console.log('🎵 Speech generation response:', response);

      if (response.audio_url || response.audio_path || response.filename) {
        let audioUrl = '';

        if (response.audio_url) {
          audioUrl = response.audio_url;
        } else if (response.filename) {
          audioUrl = apiService.getAudioUrl(response.filename);
        } else if (response.audio_path) {
          audioUrl = apiService.getAudioUrl(response.audio_path);
        }

        console.log('🎵 Final audio URL:', audioUrl);

        // Update message with audio URL
        setAppState((prev: AppState) => ({
          ...prev,
          messages: prev.messages.map((msg: Message) =>
            msg.id === messageId ? { ...msg, audioUrl } : msg
          )
        }));

        // Play audio automatically if we have a URL and not muted
        if (audioUrl && !appState.isMuted) {
          try {
            console.log('🎵 Playing audio:', audioUrl);
            const audio = await playAudio(audioUrl);
            updateState({ currentAudio: audio, currentAudioUrl: audioUrl });

            audio.onended = () => {
              console.log('🎵 Audio playback ended');
              updateState({ isSpeaking: false, status: 'idle', currentAudio: undefined, currentAudioUrl: undefined, isPaused: false });
            };

            audio.onerror = (error) => {
              console.error('🎵 Audio playback error:', error);
              updateState({ isSpeaking: false, status: 'idle', currentAudio: undefined, currentAudioUrl: undefined, isPaused: false });
            };
          } catch (audioError) {
            console.error('🎵 Failed to play audio:', audioError);
            updateState({ isSpeaking: false, status: 'idle' });
          }
        } else {
          console.log('🎵 Audio playback skipped (muted or no URL)');
          updateState({ isSpeaking: false, status: 'idle' });
        }
      } else if (response.fallback) {
        // Fallback TTS was used (no audio file)
        console.log('🎵 Using fallback TTS:', response.message);
        updateState({ isSpeaking: false, status: 'idle' });
      } else {
        console.error('🎵 No audio data in response:', response);
        throw new Error('Speech generation failed - no audio returned');
      }
    } catch (error: any) {
      console.error('🎵 Speech generation error:', error);
      updateState({ isSpeaking: false, status: 'idle', currentAudio: undefined, currentAudioUrl: undefined, isPaused: false });
    }
  }, [updateState, appState.isMuted]);

  // Handle audio playbook with immediate UI feedback
  const handlePlayAudio = useCallback(async (audioUrl: string) => {
    if (isProcessingRef.current) return;

    try {
      console.log('🔊 Manual audio play requested:', audioUrl);

      if (appState.isMuted) {
        console.log('🔇 Audio is muted, cannot play');
        return;
      }

      // Validate audio URL
      if (!audioUrl || typeof audioUrl !== 'string') {
        console.error('🔇 Invalid audio URL:', audioUrl);
        return;
      }

      // Convert relative URLs to absolute URLs
      let fullAudioUrl = audioUrl;
      if (audioUrl.startsWith('/audio/')) {
        fullAudioUrl = `http://127.0.0.1:8000${audioUrl}`;
        console.log('🔊 Converted to full URL:', fullAudioUrl);
      }

      if (appState.currentAudio) {
        console.log('🔊 Stopping current audio');
        stopAudio(appState.currentAudio);
      }

      console.log('🔊 Playing audio:', fullAudioUrl);
      const audio = await playAudio(fullAudioUrl);
      updateState({ currentAudio: audio, isSpeaking: true, currentAudioUrl: fullAudioUrl });

      audio.onended = () => {
        console.log('🔊 Manual audio playback ended');
        updateState({ currentAudio: undefined, isSpeaking: false, currentAudioUrl: undefined, isPaused: false });
      };

      audio.onerror = (error) => {
        console.error('🔊 Manual audio playback error:', error);
        updateState({ currentAudio: undefined, isSpeaking: false, currentAudioUrl: undefined, isPaused: false });
      };
    } catch (error: any) {
      console.error('🔊 Manual audio playback failed:', error);
      updateState({ currentAudio: undefined, isSpeaking: false, currentAudioUrl: undefined, isPaused: false });

      // Show user-friendly error message
      if (error.message?.includes('timeout')) {
        console.warn('🔊 Audio loading timed out - the audio file might be too large or the server is slow');
      } else if (error.message?.includes('Network')) {
        console.warn('🔊 Network error - check if the backend server is running');
      } else {
        console.warn('🔊 Audio playback failed:', error.message);
      }
    }
  }, [appState.currentAudio, appState.isMuted, updateState]);

  // Stop audio playback
  const handleStopAudio = useCallback(() => {
    if (appState.currentAudio) {
      console.log('🛑 Stopping audio playback');
      stopAudio(appState.currentAudio);
      updateState({ currentAudio: undefined, isSpeaking: false, isPaused: false, currentAudioUrl: undefined });
    }
  }, [appState.currentAudio, updateState]);

  // Pause/Resume audio playback
  const handlePauseResumeAudio = useCallback(async () => {
    if (!appState.currentAudio) return;

    try {
      if (appState.isPaused) {
        console.log('▶️ Resuming audio playback');
        await resumeAudio(appState.currentAudio);
        updateState({ isPaused: false, isSpeaking: true });
      } else {
        console.log('⏸️ Pausing audio playback');
        pauseAudio(appState.currentAudio);
        updateState({ isPaused: true, isSpeaking: false });
      }
    } catch (error) {
      console.error('Error pausing/resuming audio:', error);
      // Reset state on error
      updateState({ currentAudio: undefined, isSpeaking: false, isPaused: false });
    }
  }, [appState.currentAudio, appState.isPaused, updateState]);

  // Separate pause handler for VoiceInterface with immediate UI feedback
  const handlePauseAudio = useCallback(() => {
    if (!appState.currentAudio || appState.isPaused || isProcessingRef.current) return;

    try {
      console.log('⏸️ Pausing audio playback');
      // Update UI immediately
      updateState({ isPaused: true, isSpeaking: false });
      pauseAudio(appState.currentAudio);
    } catch (error) {
      console.error('Error pausing audio:', error);
      updateState({ currentAudio: undefined, isSpeaking: false, isPaused: false });
    }
  }, [appState.currentAudio, appState.isPaused, updateState]);

  // Separate resume handler for VoiceInterface with immediate UI feedback
  const handleResumeAudio = useCallback(async () => {
    if (!appState.currentAudio || !appState.isPaused || isProcessingRef.current) return;

    try {
      console.log('▶️ Resuming audio playbook');
      // Update UI immediately
      updateState({ isPaused: false, isSpeaking: true });
      await resumeAudio(appState.currentAudio);
    } catch (error) {
      console.error('Error resuming audio:', error);
      updateState({ currentAudio: undefined, isSpeaking: false, isPaused: false });
    }
  }, [appState.currentAudio, appState.isPaused, updateState]);

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    const newMuted = !appState.isMuted;
    console.log('🔇 Toggling mute:', newMuted);
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

  // Navigate to home
  const handleNavigateHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

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
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-all duration-700 relative">
      {/* Enhanced Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1.1, 1.4, 1],
            opacity: [0.3, 0.6, 0.4, 0.7, 0.3],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-indigo-500/15 via-pink-500/10 to-purple-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.3, 1.1, 1.2],
            opacity: [0.2, 0.5, 0.3, 0.6, 0.2],
            rotate: [360, 270, 180, 90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-500/10 via-blue-500/15 to-indigo-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1.2, 1.6, 1],
            opacity: [0.1, 0.3, 0.2, 0.4, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            } as React.CSSProperties}
            animate={{
              y: [0, -20, 0, 20, 0],
              x: [0, 10, 0, -10, 0],
              opacity: [0.2, 0.8, 0.3, 0.7, 0.2],
              scale: [1, 1.5, 1, 2, 1]
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="h-full w-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59 130 246) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      {/* Header */}
      <Header
        isDarkMode={appState.isDarkMode}
        isMuted={appState.isMuted}
        showChatPanel={showChatPanel}
        onToggleDarkMode={handleToggleTheme}
        onToggleMute={handleToggleMute}
        onToggleChatPanel={handleToggleChatPanel}
        onNavigateHome={handleNavigateHome}
      />

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Central Interface */}
        <motion.div
          className="flex flex-col items-center justify-center h-full px-8 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Voice Recognition Indicator */}
          <AnimatePresence>
            {appState.isListening && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-6 flex items-center gap-3 px-6 py-3 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-400/30"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-4 h-4 bg-green-500 rounded-full"
                />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  🎤 Listening... Speak now!
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Processing Indicator */}
          <AnimatePresence>
            {appState.status === 'processing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-6 flex items-center gap-3 px-6 py-3 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-400/30"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 bg-purple-500 rounded-full"
                />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  🧠 Ava is thinking...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Audio Playing Indicator */}
          <AnimatePresence>
            {appState.isSpeaking && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-6 flex items-center gap-3 px-6 py-3 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-4 h-4 bg-blue-500 rounded-full"
                />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  🗣️ Ava is speaking...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Indicator */}
          <div className="mb-4 mt-2">
            <StatusIndicator
              status={appState.status}
            />
          </div>

          {/* Voice Interface */}
          <motion.div
            className="mb-12 w-36"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.5
            }}
          >
            <VoiceInterface
              onStartListening={startListening}
              onStopListening={stopListening}
              onPauseAudio={handlePauseAudio}
              onResumeAudio={handleResumeAudio}
              isDisabled={appState.status === 'error'}
              isListening={appState.isListening}
              isSpeaking={appState.isSpeaking}
              isPaused={appState.isPaused}
              status={appState.status}
            />
          </motion.div>

          {/* Chat Messages Display on Main Screen */}
          <AnimatePresence>
            {appState.messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full max-w-4xl max-h-80 overflow-y-auto mb-8 px-4 custom-scrollbar"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(59, 130, 246, 0.3) transparent'
                } as React.CSSProperties}
              >
                <div className="space-y-4">
                  {appState.messages.slice(-3).map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        delay: index * 0.1
                      }}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        className={`
                          max-w-[70%] rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm border transition-all
                          ${message.isUser
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400/30'
                            : 'bg-white/95 dark:bg-slate-800/95 text-gray-800 dark:text-gray-200 border-gray-200/50 dark:border-slate-700/50'
                          }
                        `}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.text}
                        </p>
                        <div className="flex items-center justify-between mt-3 gap-3">
                          <span className={`text-xs opacity-75 font-medium ${message.isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {!message.isUser && message.audioUrl && !appState.isMuted && (
                            <div className="flex items-center gap-2">
                              {/* Play/Pause Button */}
                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  const isCurrentMessage = appState.currentAudioUrl === message.audioUrl;
                                  if (appState.isPaused && isCurrentMessage) {
                                    handlePauseResumeAudio();
                                  } else if (appState.isSpeaking && isCurrentMessage) {
                                    handlePauseResumeAudio();
                                  } else {
                                    handlePlayAudio(message.audioUrl!);
                                  }
                                }}
                                className={`p-2 rounded-full text-white transition-colors shadow-lg hover:shadow-xl ${appState.currentAudioUrl === message.audioUrl && appState.isPaused
                                  ? 'bg-yellow-500 hover:bg-yellow-600'
                                  : appState.currentAudioUrl === message.audioUrl && appState.isSpeaking
                                    ? 'bg-purple-500 hover:bg-purple-600'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                  }`}
                                title={
                                  appState.currentAudioUrl === message.audioUrl && appState.isPaused
                                    ? "Resume audio"
                                    : appState.currentAudioUrl === message.audioUrl && appState.isSpeaking
                                      ? "Pause audio"
                                      : "Play audio response"
                                }
                              >
                                {appState.currentAudioUrl === message.audioUrl && appState.isPaused ? (
                                  <Play className="w-4 h-4" />
                                ) : appState.currentAudioUrl === message.audioUrl && appState.isSpeaking ? (
                                  <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                  >
                                    <Pause className="w-4 h-4" />
                                  </motion.div>
                                ) : (
                                  <Volume2 className="w-4 h-4" />
                                )}
                              </motion.button>

                              {/* Stop Button - only show when audio is playing or paused from this message */}
                              {appState.currentAudioUrl === message.audioUrl && (appState.isSpeaking || appState.isPaused) && (
                                <motion.button
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={handleStopAudio}
                                  className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg hover:shadow-xl"
                                  title="Stop audio"
                                >
                                  <Square className="w-3 h-3" />
                                </motion.button>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                {/* Show more messages indicator */}
                {appState.messages.length > 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mt-6"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowChatPanel(true)}
                      className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm rounded-full border border-blue-400/30 text-blue-600 dark:text-blue-400 font-medium transition-all"
                    >
                      View all {appState.messages.length} messages →
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

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
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                  Hi! I'm Ava 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-lg">
                  Your intelligent voice assistant. Click the microphone to start a conversation, or ask me anything!
                </p>

                {/* Quick action suggestions */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">Try saying:</p>
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
                      className="px-6 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full text-sm text-gray-700 dark:text-gray-300 border border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
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
              className="mt-4 px-6 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full border border-white/40 dark:border-slate-700/40"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
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
          onPauseResumeAudio={handlePauseResumeAudio}
          isAudioPlaying={appState.isSpeaking && !!appState.currentAudio}
          isPaused={appState.isPaused}
          isMuted={appState.isMuted}
          currentAudioUrl={appState.currentAudioUrl}
        />
      </main>
    </div>
  );
};

export default Dashboard;