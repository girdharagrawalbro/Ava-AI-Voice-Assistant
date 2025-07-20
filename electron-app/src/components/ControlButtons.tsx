import React from 'react';
import { Volume2, VolumeX, Trash2, Moon, Sun } from 'lucide-react';
import { classNames } from '../utils';

interface ControlButtonsProps {
  isMuted: boolean;
  isDarkMode: boolean;
  onToggleMute: () => void;
  onClearChat: () => void;
  onToggleTheme: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  isMuted,
  isDarkMode,
  onToggleMute,
  onClearChat,
  onToggleTheme
}) => {
  const buttonClass = classNames(
    'flex items-center justify-center w-8 h-8 rounded-lg',
    'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
    'transition-all duration-200 active:scale-95'
  );

  return (
    <div className="flex items-center gap-2">
      {/* Mute/Unmute button */}
      <button
        onClick={onToggleMute}
        className={buttonClass}
        title={isMuted ? 'Unmute audio' : 'Mute audio'}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {/* Theme toggle button */}
      <button
        onClick={onToggleTheme}
        className={buttonClass}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Clear chat button */}
      <button
        onClick={onClearChat}
        className={classNames(
          buttonClass,
          'text-red-500 hover:text-red-700 hover:bg-red-50'
        )}
        title="Clear chat history"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default ControlButtons;
