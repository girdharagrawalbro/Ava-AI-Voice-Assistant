// Type definitions for the Ava AI Assistant

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Message Types
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
}

// API Request Types
export interface VoiceRequest {
  timeout?: number;
  phrase_time_limit?: number;
}

export interface GeminiRequest {
  text: string;
  conversation_history?: any[];
}

export interface TTSRequest {
  text: string;
  voice_id?: string;
  style?: string;
  speed?: number;
}

// API Response Data Types
export interface VoiceResponse {
  text: string;
  duration: number;
}

export interface GeminiResponseData {
  response: string;
  input: string;
}

export interface TTSResponse {
  audio_url?: string;
  audio_path?: string;
  filename?: string;
  text: string;
  fallback?: boolean;
  message?: string;
}

export interface ServiceStatus {
  voice_input: boolean;
  gemini_ai: boolean;
  murf_tts: boolean;
}

// Legacy response types for compatibility
export interface VoiceRecognitionResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export interface GeminiResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export interface MurfTTSResponse {
  success: boolean;
  audioUrl?: string;
  audioPath?: string;
  error?: string;
}

export interface AppState {
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  isDarkMode: boolean;
  status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  currentAudio?: HTMLAudioElement;
}

export interface ApiEndpoints {
  voice: string;
  gemini: string;
  murf: string;
  audio: string;
}

export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  getAppName: () => Promise<string>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  platform: string;
}

export interface Versions {
  node: string;
  chrome: string;
  electron: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    versions: Versions;
  }
}
