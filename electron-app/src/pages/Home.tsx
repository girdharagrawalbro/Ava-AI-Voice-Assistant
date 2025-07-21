import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Pause, Play, Square, Plus, AlertCircle, Calendar, Pill, HeartPulse, Stethoscope, Download, Sun, Moon, Bell, BellOff } from 'lucide-react';
import Header from '../components/Header-New';
import VoiceInterface from '../components/VoiceInterface';
import ChatPanel from '../components/ChatPanel';
import StatusIndicator from '../components/StatusIndicator';
import { apiService } from '../services/api';
import { generateId, formatMessage, playAudio, stopAudio, pauseAudio, resumeAudio, storage, STORAGE_KEYS, THEMES, MAX_MESSAGES } from '../utils';
import type { Message, AppState, Medication, SymptomCheck } from '../types';

// Extend Window type for SpeechRecognition
declare global {
  // Add SpeechRecognition type to global scope
  // @ts-ignore
  var SpeechRecognition: any;
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

const Home: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    messages: [],
    isListening: false,
    isPaused: false,
    isMuted: false,
    isDarkMode: false,
    status: 'idle',
    currentAudio: undefined,
    currentAudioUrl: undefined,
    isSpeaking: false,
    medications: [],
    reminders: [],
    healthTips: [
      "Don't forget to drink water regularly",
      "Take short walks every hour if possible",
      "Remember to take deep breaths to reduce stress"
    ]
  });

  const [activeTab, setActiveTab] = useState<'medications' | 'health' | 'chat'>('medications');
  const [newMedication, setNewMedication] = useState<Omit<Medication, 'id'>>({ name: '', dosage: '', frequency: '', time: '' });
  const [symptomCheck, setSymptomCheck] = useState<SymptomCheck>({ symptoms: '', result: '' });
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: 'Primary Doctor', number: '555-0101' },
    { name: 'Emergency Services', number: '911' },
    { name: 'Family Contact', number: '555-0202' }
  ]);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Load saved data on mount
  useEffect(() => {
    const savedMessages = storage.get(STORAGE_KEYS.MESSAGES) || [];
    const savedSettings = storage.get(STORAGE_KEYS.SETTINGS) || {};
    const savedMedications = storage.get(STORAGE_KEYS.MEDICATIONS) || [];
    const savedTheme = storage.get(STORAGE_KEYS.THEME) || THEMES.LIGHT;

    setAppState(prev => ({
      ...prev,
      messages: savedMessages.slice(-MAX_MESSAGES),
      isMuted: savedSettings.isMuted || false,
      isDarkMode: savedTheme === THEMES.DARK,
      medications: savedMedications
    }));

    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Update state helper
  const updateState = useCallback((updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  }, []);

  // Add message to chat
  const addMessage = useCallback((text: string, isUser: boolean) => {
    const message: Message = {
      id: generateId(),
      text: formatMessage(text),
      isUser,
      timestamp: Date.now()
    };

    setAppState(prev => {
      const newMessages = [...prev.messages, message].slice(-MAX_MESSAGES);
      storage.set(STORAGE_KEYS.MESSAGES, newMessages);
      return { ...prev, messages: newMessages };
    });

    return message;
  }, []);

  // Get AI response
  const getAIResponse = useCallback(async (userText: string) => {
    try {
      updateState({ status: 'processing' });

      // Check for medication queries
      if (userText.toLowerCase().includes('what is my next medicine') || 
          userText.toLowerCase().includes('what medicine do i take next')) {
        const nextMed = getNextMedication();
        if (nextMed) {
          const response = `Your next medication is ${nextMed.name}, ${nextMed.dosage} at ${nextMed.time}.`;
          const aiMessage = addMessage(response, false);
          if (!appState.isMuted) await generateSpeech(response, aiMessage.id);
          return;
        }
      }

      // Check for symptom queries
      if (userText.toLowerCase().includes('i have') || 
          userText.toLowerCase().includes('i feel') ||
          userText.toLowerCase().includes('symptom')) {
        const response = await apiService.getGeminiResponse({ text: userText });
        const aiMessage = addMessage(response.response, false);
        if (!appState.isMuted) await generateSpeech(response.response, aiMessage.id);
        return;
      }

      // Default AI response
      const response = await apiService.getGeminiResponse({ text: userText });
      const aiMessage = addMessage(response.response, false);
      if (!appState.isMuted) await generateSpeech(response.response, aiMessage.id);

    } catch (error: any) {
      console.error('AI response error:', error);
      addMessage(`Sorry, I encountered an error. Please try again.`, false);
      updateState({ status: 'error' });
      setTimeout(() => updateState({ status: 'idle' }), 2000);
    }
  }, [addMessage, appState.isMuted, updateState]);

  // Start listening to user voice
  const startListening = useCallback(async () => {
    if (appState.isListening || isProcessingRef.current) return;

    try {
      isProcessingRef.current = true;
      updateState({ isListening: true, status: 'listening' });
      abortControllerRef.current = new AbortController();

      const SpeechRecognitionClass = (window.SpeechRecognition || (window as any).webkitSpeechRecognition);
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      interface SpeechRecognitionEventResult {
        [index: number]: {
          transcript: string;
        };
      }

      interface SpeechRecognitionEvent {
        results: SpeechRecognitionEventResult[];
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript: string = event.results[0][0].transcript;
        console.log('Voice input:', transcript);
        addMessage(transcript, true);
        getAIResponse(transcript);
      };

      recognition.onerror = (event: { error: any; }) => {
        console.error('Speech recognition error', event.error);
        updateState({ status: 'error' });
        setTimeout(() => updateState({ status: 'idle' }), 2000);
      };

      recognition.onend = () => {
        updateState({ isListening: false });
      };

      recognition.start();
    } catch (error) {
      console.error('Start listening error:', error);
      updateState({ isListening: false, status: 'error' });
    } finally {
      isProcessingRef.current = false;
    }
  }, [appState.isListening, updateState, addMessage, getAIResponse]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!appState.isListening) return;
    updateState({ isListening: false, status: 'idle' });
  }, [appState.isListening, updateState]);

  // Generate speech
  const generateSpeech = useCallback(async (text: string, messageId: string) => {
    try {
      updateState({ status: 'speaking', isSpeaking: true });

      const response = await apiService.generateSpeech({
        text,
        voice_id: 'en-US-terrell'
      });

      if (response.audio_url) {
        setAppState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId ? { ...msg, audioUrl: response.audio_url } : msg
          )
        }));

        if (!appState.isMuted) {
          const audio = await playAudio(response.audio_url);
          updateState({ currentAudio: audio, currentAudioUrl: response.audio_url });

          audio.onended = () => {
            updateState({ isSpeaking: false, status: 'idle', currentAudio: undefined, currentAudioUrl: undefined, isPaused: false });
          };

          audio.onerror = () => {
            updateState({ isSpeaking: false, status: 'idle', currentAudio: undefined, currentAudioUrl: undefined, isPaused: false });
          };
        }
      }
    } catch (error) {
      console.error('Speech generation error:', error);
      updateState({ isSpeaking: false, status: 'idle' });
    }
  }, [updateState, appState.isMuted]);

  // Medication management
  const addMedication = useCallback(() => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.time) return;

    const medication: Medication = {
      id: generateId(),
      ...newMedication
    };

    setAppState(prev => {
      const newMedications = [...prev.medications, medication];
      storage.set(STORAGE_KEYS.MEDICATIONS, newMedications);
      return { ...prev, medications: newMedications };
    });

    setNewMedication({ name: '', dosage: '', frequency: '', time: '' });
    addMessage(`Added medication: ${medication.name} ${medication.dosage} at ${medication.time}`, false);
  }, [newMedication, addMessage]);

  const getNextMedication = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return appState.medications
      .map(med => {
        const [hours, minutes] = med.time.split(':').map(Number);
        return {
          ...med,
          hours,
          minutes,
          timeValue: hours * 60 + minutes
        };
      })
      .filter(med => med.timeValue > currentHour * 60 + currentMinute)
      .sort((a, b) => a.timeValue - b.timeValue)[0];
  }, [appState.medications]);

  // Symptom checking
  const checkSymptoms = useCallback(async () => {
    if (!symptomCheck.symptoms.trim()) return;

    try {
      setSymptomCheck(prev => ({ ...prev, result: 'Analyzing symptoms...' }));
      const response = await apiService.getGeminiResponse({ text: symptomCheck.symptoms });
      setSymptomCheck(prev => ({ ...prev, result: response.response }));
      addMessage(`You reported: ${symptomCheck.symptoms}. ${response.response}`, false);
    } catch (error) {
      console.error('Symptom check error:', error);
      setSymptomCheck(prev => ({ ...prev, result: 'Failed to analyze symptoms. Please try again.' }));
    }
  }, [symptomCheck.symptoms, addMessage]);

  // Emergency handling
  const triggerEmergency = useCallback((contactIndex: number) => {
    const contact = emergencyContacts[contactIndex];
    addMessage(`Emergency: Calling ${contact.name} at ${contact.number}`, false);
    // In a real app, this would actually call the number
    alert(`Calling ${contact.name} at ${contact.number}`);
    setShowEmergencyModal(false);
  }, [emergencyContacts, addMessage]);

  // Audio controls
  const handlePlayAudio = useCallback(async (audioUrl: string) => {
    if (appState.isMuted) return;

    if (appState.currentAudio) {
      stopAudio(appState.currentAudio);
    }

    const audio = await playAudio(audioUrl);
    updateState({ currentAudio: audio, isSpeaking: true, currentAudioUrl: audioUrl });

    audio.onended = () => {
      updateState({ currentAudio: undefined, isSpeaking: false, currentAudioUrl: undefined, isPaused: false });
    };
  }, [appState.currentAudio, appState.isMuted, updateState]);

  const handleStopAudio = useCallback(() => {
    if (appState.currentAudio) {
      stopAudio(appState.currentAudio);
      updateState({ currentAudio: undefined, isSpeaking: false, isPaused: false, currentAudioUrl: undefined });
    }
  }, [appState.currentAudio, updateState]);

  const handlePauseResumeAudio = useCallback(async () => {
    if (!appState.currentAudio) return;

    if (appState.isPaused) {
      await resumeAudio(appState.currentAudio);
      updateState({ isPaused: false, isSpeaking: true });
    } else {
      pauseAudio(appState.currentAudio);
      updateState({ isPaused: true, isSpeaking: false });
    }
  }, [appState.currentAudio, appState.isPaused, updateState]);

  // UI toggles
  const handleToggleMute = useCallback(() => {
    const newMuted = !appState.isMuted;
    updateState({ isMuted: newMuted });
    storage.set(STORAGE_KEYS.SETTINGS, { ...storage.get(STORAGE_KEYS.SETTINGS), isMuted: newMuted });
    if (newMuted && appState.currentAudio) handleStopAudio();
  }, [appState.isMuted, appState.currentAudio, updateState, handleStopAudio]);

  const handleToggleTheme = useCallback(() => {
    const newTheme = appState.isDarkMode ? THEMES.LIGHT : THEMES.DARK;
    updateState({ isDarkMode: !appState.isDarkMode });
    document.documentElement.setAttribute('data-theme', newTheme);
    storage.set(STORAGE_KEYS.THEME, newTheme);
  }, [appState.isDarkMode, updateState]);

  const handleClearChat = useCallback(() => {
    if (window.confirm('Clear chat history?')) {
      updateState({ messages: [] });
      storage.remove(STORAGE_KEYS.MESSAGES);
    }
  }, [updateState]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (appState.currentAudio) stopAudio(appState.currentAudio);
    };
  }, [appState.currentAudio]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 shadow-md border-b border-slate-200 dark:border-slate-800 z-20">
        <div className="flex items-center gap-3">
          <img src="/medical-avatar.png" alt="Ava" className="w-10 h-10 rounded-full border-2 border-blue-400" />
          <h1 className="text-xl font-bold text-blue-700 dark:text-blue-300">Ava Health Assistant</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleToggleTheme} className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all">
            {appState.isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={handleToggleMute} className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all">
            {appState.isMuted ? <BellOff size={18} /> : <Bell size={18} />}
          </button>
          <button onClick={() => setShowEmergencyModal(true)} className="p-2 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-all">
            <AlertCircle size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="flex md:flex-col items-center justify-around md:justify-start gap-1 p-2 bg-white/70 dark:bg-slate-900/70 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 z-10">
          <button 
            onClick={() => setActiveTab('medications')} 
            className={`p-3 rounded-lg transition-all ${activeTab === 'medications' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
            title="Medications"
          >
            <Pill size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('health')} 
            className={`p-3 rounded-lg transition-all ${activeTab === 'health' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
            title="Health Monitoring"
          >
            <HeartPulse size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('chat')} 
            className={`p-3 rounded-lg transition-all ${activeTab === 'chat' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
            title="Chat with Ava"
          >
            <Stethoscope size={20} />
          </button>
        </nav>

        {/* Medications Panel */}
        <AnimatePresence>
          {activeTab === 'medications' && (
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300">Medication Management</h2>
                <button 
                  onClick={() => (document.getElementById('add-medication-modal') as HTMLDialogElement | null)?.showModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition-all"
                >
                  <Plus size={16} /> Add Medication
                </button>
              </div>

              {/* Today's Medications */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                  <Calendar size={18} /> Today's Schedule
                </h3>
                {appState.medications.length > 0 ? (
                  <ul className="space-y-3">
                    {appState.medications.map((med, index) => (
                      <motion.li 
                        key={med.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/40 px-4 py-3 rounded-lg shadow border border-blue-100 dark:border-blue-800/50"
                      >
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">{med.name}</span>
                          <span className="text-sm text-blue-600 dark:text-blue-300 ml-2">{med.dosage}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{med.time}</span>
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">{med.frequency}</span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-6 rounded-lg border border-dashed border-blue-200 dark:border-blue-800/50 text-center">
                    <p className="text-blue-600 dark:text-blue-300">No medications added yet</p>
                  </div>
                )}
              </div>

              {/* Reminders */}
              <div>
                <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                  <Bell size={18} /> Upcoming Reminders
                </h3>
                {appState.medications.length > 0 ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
                    <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                      Next: {getNextMedication()?.name} at {getNextMedication()?.time}
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 rounded-lg border border-dashed border-yellow-200 dark:border-yellow-800/50 text-center">
                    <p className="text-yellow-600 dark:text-yellow-300">No reminders set</p>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Health Monitoring Panel */}
        <AnimatePresence>
          {activeTab === 'health' && (
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col p-6 overflow-y-auto"
            >
              <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-6">Health Monitoring</h2>

              {/* Symptom Checker */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-4">Symptom Checker</h3>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800/50">
                  <textarea
                    value={symptomCheck.symptoms}
                    onChange={(e) => setSymptomCheck(prev => ({ ...prev, symptoms: e.target.value }))}
                    placeholder="Describe your symptoms (e.g., headache, nausea, fever)"
                    className="w-full px-4 py-3 rounded-lg border border-purple-200 dark:border-purple-700/50 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 mb-4"
                    rows={3}
                  />
                  <button
                    onClick={checkSymptoms}
                    disabled={!symptomCheck.symptoms.trim()}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Analyze Symptoms
                  </button>
                  {symptomCheck.result && (
                    <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-purple-100 dark:border-purple-800/50">
                      <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Analysis Result:</h4>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{symptomCheck.result}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Health Tips */}
              <div>
                <h3 className="text-lg font-medium text-green-700 dark:text-green-300 mb-4">Daily Health Tips</h3>
                <ul className="space-y-3">
                  {appState.healthTips.map((tip, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-lg border border-green-100 dark:border-green-800/50"
                    >
                      <p className="text-green-700 dark:text-green-300">{tip}</p>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Chat Panel */}
        <AnimatePresence>
          {activeTab === 'chat' && (
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col p-6 overflow-hidden"
            >
              <h2 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-6">Chat with Ava</h2>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto mb-6 custom-scrollbar">
                <div className="space-y-4">
                  {appState.messages.length > 0 ? (
                    appState.messages.map((message, index) => (
                      <motion.div 
                        key={message.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25, delay: index * 0.05 }}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <motion.div 
                          whileHover={{ scale: 1.02, y: -2 }} 
                          className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm border transition-all ${message.isUser ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400/30' : 'bg-white/95 dark:bg-slate-800/95 text-gray-800 dark:text-gray-200 border-gray-200/50 dark:border-slate-700/50'}`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                          <div className="flex items-center justify-between mt-3 gap-3">
                            <span className={`text-xs opacity-75 font-medium ${message.isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {!message.isUser && message.audioUrl && !appState.isMuted && (
                              <div className="flex items-center gap-2">
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
                                  className={`p-2 rounded-full text-white transition-colors shadow-lg hover:shadow-xl ${
                                    appState.currentAudioUrl === message.audioUrl && appState.isPaused ? 'bg-yellow-500 hover:bg-yellow-600' : 
                                    appState.currentAudioUrl === message.audioUrl && appState.isSpeaking ? 'bg-purple-500 hover:bg-purple-600' : 
                                    'bg-blue-500 hover:bg-blue-600'
                                  }`} 
                                  title={
                                    appState.currentAudioUrl === message.audioUrl && appState.isPaused ? "Resume audio" : 
                                    appState.currentAudioUrl === message.audioUrl && appState.isSpeaking ? "Pause audio" : 
                                    "Play audio response"
                                  }
                                >
                                  {appState.currentAudioUrl === message.audioUrl && appState.isPaused ? (
                                    <Play className="w-4 h-4" />
                                  ) : appState.currentAudioUrl === message.audioUrl && appState.isSpeaking ? (
                                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                                      <Pause className="w-4 h-4" />
                                    </motion.div>
                                  ) : (
                                    <Volume2 className="w-4 h-4" />
                                  )}
                                </motion.button>
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
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <img src="/medical-avatar.png" alt="Ava" className="w-16 h-16 rounded-full mb-4 opacity-80" />
                      <p className="text-gray-500 dark:text-gray-400">Hi there! I'm Ava, your health assistant. How can I help you today?</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Interface */}
              <div className="flex flex-col items-center">
                <VoiceInterface
                  onStartListening={startListening}
                  onStopListening={stopListening}
                  onPauseAudio={handlePauseResumeAudio}
                  onResumeAudio={handlePauseResumeAudio}
                  isDisabled={appState.status === 'error'}
                  isListening={appState.isListening}
                  isSpeaking={appState.isSpeaking}
                  isPaused={appState.isPaused}
                  status={appState.status}
                />
                <StatusIndicator status={appState.status} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Add Medication Modal */}
        <dialog id="add-medication-modal" className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 w-full max-w-md">
          <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-4">Add New Medication</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medication Name</label>
              <input
                type="text"
                value={newMedication.name}
                onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200"
                placeholder="e.g., Metformin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dosage</label>
              <input
                type="text"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200"
                placeholder="e.g., 500mg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
              <select
                value={newMedication.frequency}
                onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200"
              >
                <option value="">Select frequency</option>
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="As needed">As needed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
              <input
                type="time"
                value={newMedication.time}
                onChange={(e) => setNewMedication(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => (document.getElementById('add-medication-modal') as HTMLDialogElement | null)?.close()}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                addMedication();
                (document.getElementById('add-medication-modal') as HTMLDialogElement | null)?.close();
              }}
              disabled={!newMedication.name || !newMedication.dosage || !newMedication.time}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Medication
            </button>
          </div>
        </dialog>

        {/* Emergency Modal */}
        {showEmergencyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Emergency Contacts</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">Who would you like to contact?</p>
              <ul className="space-y-2 mb-6">
                {emergencyContacts.map((contact, index) => (
                  <li key={index} className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg border border-red-100 dark:border-red-800/50">
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-300">{contact.name}</p>
                      <p className="text-sm text-red-600 dark:text-red-400">{contact.number}</p>
                    </div>
                    <button
                      onClick={() => triggerEmergency(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                    >
                      Call
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowEmergencyModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;