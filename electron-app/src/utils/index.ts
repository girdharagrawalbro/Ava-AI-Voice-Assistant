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

// Prevent rapid clicking issues
export const throttleClick = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): T => {
  let isThrottled = false;
  
  return ((...args: any[]) => {
    if (isThrottled) return;
    
    func(...args);
    isThrottled = true;
    setTimeout(() => isThrottled = false, delay);
  }) as T;
};

export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

export const playAudio = (url: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔊 Creating audio element for:', url);
      
      // Clean up any existing audio with the same URL
      const existingAudios = document.querySelectorAll(`audio[src="${url}"]`);
      existingAudios.forEach((audioElement) => {
        const audio = audioElement as HTMLAudioElement;
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      
      const audio = new Audio();
      
      // Configure audio properties
      audio.preload = 'auto';
      audio.volume = 1.0;
      audio.crossOrigin = 'anonymous';
      
      let hasResolved = false;
      
      // Faster response with reduced timeout
      const timeout = setTimeout(() => {
        if (!hasResolved) {
          console.error('🔊 Audio loading timeout after 8 seconds');
          hasResolved = true;
          reject(new Error('Audio loading timeout'));
        }
      }, 8000);
      
      // Optimized event handlers for quicker response
      audio.oncanplay = () => {
        if (hasResolved) return;
        console.log('🔊 Audio can play, starting immediately');
        clearTimeout(timeout);
        
        audio.play()
          .then(() => {
            console.log('🔊 Audio playback started successfully');
            hasResolved = true;
            resolve(audio);
          })
          .catch((error) => {
            console.error('🔊 Audio playback failed:', error);
            if (!hasResolved) {
              hasResolved = true;
              reject(error);
            }
          });
      };
      
      audio.onerror = () => {
        clearTimeout(timeout);
        console.error('🔊 Audio loading failed');
        if (!hasResolved) {
          hasResolved = true;
          reject(new Error('Audio loading failed'));
        }
      };
      
      audio.onended = () => {
        console.log('🔊 Audio playback ended');
      };
      
      // Set the source URL and load
      console.log('🔊 Setting audio source:', url);
      audio.src = url;
      audio.load();
      
    } catch (error) {
      console.error('🔊 Error creating audio element:', error);
      reject(error);
    }
  });
};

export const stopAudio = (audio: HTMLAudioElement): void => {
  try {
    if (audio && !audio.paused) {
      console.log('🛑 Stopping audio playback');
      audio.pause();
      audio.currentTime = 0;
    }
  } catch (error) {
    console.error('🛑 Error stopping audio:', error);
  }
};

export const pauseAudio = (audio: HTMLAudioElement): void => {
  try {
    if (audio && !audio.paused) {
      console.log('⏸️ Pausing audio playback');
      audio.pause();
    }
  } catch (error) {
    console.error('⏸️ Error pausing audio:', error);
  }
};

export const resumeAudio = (audio: HTMLAudioElement): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (audio && audio.paused) {
        console.log('▶️ Resuming audio playback');
        audio.play()
          .then(() => {
            console.log('▶️ Audio resumed successfully');
            resolve();
          })
          .catch((error) => {
            console.error('▶️ Error resuming audio:', error);
            reject(error);
          });
      } else {
        resolve();
      }
    } catch (error) {
      console.error('▶️ Error resuming audio:', error);
      reject(error);
    }
  });
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
  SETTINGS: 'ava_settings',
  MEDICATIONS: 'ava_medications',
  REMINDERS: 'ava_reminders',
  HEALTH_TIPS: 'ava_health_tips'
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
} as const;

export const MAX_MESSAGES = 100;
export const MAX_MESSAGE_LENGTH = 1000;
export const AUDIO_TIMEOUT = 30000; // 30 seconds
export const API_TIMEOUT = 30000; // 30 seconds
