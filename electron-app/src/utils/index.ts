// Utility functions for the Ava AI Assistant

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

export const formatMessage = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: number | null = null;
  
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait) as any;
  }) as T;
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean = false;
  
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

export const playAudio = async (url: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    
    audio.onloadeddata = () => {
      audio.play()
        .then(() => resolve(audio))
        .catch(reject);
    };
    
    audio.onerror = () => {
      reject(new Error('Failed to load audio'));
    };
  });
};

export const stopAudio = (audio: HTMLAudioElement): void => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'idle':
      return 'var(--color-success)';
    case 'listening':
      return 'var(--color-warning)';
    case 'processing':
      return 'var(--color-primary)';
    case 'speaking':
      return 'var(--color-primary)';
    case 'error':
      return 'var(--color-error)';
    default:
      return 'var(--color-text-secondary)';
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'idle':
      return 'Ready';
    case 'listening':
      return 'Listening...';
    case 'processing':
      return 'Thinking...';
    case 'speaking':
      return 'Speaking...';
    case 'error':
      return 'Error';
    default:
      return 'Unknown';
  }
};

export const validateText = (text: string): boolean => {
  return text.trim().length > 0 && text.trim().length <= 1000;
};

export const sanitizeText = (text: string): string => {
  return text.replace(/[<>]/g, '').trim();
};

// Local storage helpers
export const storage = {
  get: (key: string): any => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Handle storage errors silently
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Handle storage errors silently
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch {
      // Handle storage errors silently
    }
  }
};

// Constants
export const STORAGE_KEYS = {
  THEME: 'ava_theme',
  MESSAGES: 'ava_messages',
  SETTINGS: 'ava_settings'
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
} as const;

export const MAX_MESSAGES = 100;
export const MAX_MESSAGE_LENGTH = 1000;
export const AUDIO_TIMEOUT = 30000; // 30 seconds
export const API_TIMEOUT = 30000; // 30 seconds
