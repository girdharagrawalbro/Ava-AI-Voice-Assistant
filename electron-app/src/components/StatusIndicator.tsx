import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mic, Volume2, Zap, AlertCircle } from 'lucide-react';
import { getStatusColor, getStatusText } from '../utils';
import type { AppState } from '../types';

interface StatusIndicatorProps {
  status: AppState['status'];
  message?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message
}) => {
  const displayText = message || getStatusText(status);
  const isProcessing = status === 'processing' || status === 'listening';

  const getStatusIcon = () => {
    switch (status) {
      case 'listening':
        return <Mic className="w-3 h-3" />;
      case 'processing':
        return <Zap className="w-3 h-3" />;
      case 'speaking':
        return <Volume2 className="w-3 h-3" />;
      case 'error':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="status-indicator flex items-center justify-center gap-4 px-6 py-3 rounded-full backdrop-blur-md bg-white/20 dark:bg-slate-900/30 border border-white/30 dark:border-slate-700/30 shadow-xl"
    >
      {/* Enhanced status icon */}
      <motion.div
        animate={{
          scale: isProcessing ? [1, 1.3, 1] : 1,
          rotate: status === 'processing' ? [0, 180, 360] : 0
        }}
        transition={{
          scale: { duration: 0.8, repeat: isProcessing ? Infinity : 0, ease: "easeInOut" },
          rotate: { duration: 1.5, repeat: status === 'processing' ? Infinity : 0, ease: "linear" }
        }}
        className="flex items-center justify-center relative"
      >
        <div className="relative z-10">
          {getStatusIcon()}
        </div>
        {/* Icon glow effect */}
        {isProcessing && (
          <motion.div
            className="absolute inset-0 rounded-full blur-sm opacity-50"
            style={{ backgroundColor: getStatusColor(status) } as React.CSSProperties}
            animate={{ 
              scale: [1, 1.5, 1], 
              opacity: [0.5, 0.8, 0.5] 
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>

      {/* Enhanced status dot */}
      <motion.div
        animate={{
          scale: isProcessing ? [1, 1.4, 1] : 1,
          opacity: isProcessing ? [0.5, 1, 0.5] : 1
        }}
        transition={{
          duration: 0.8,
          repeat: isProcessing ? Infinity : 0,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <div
          className="w-3 h-3 rounded-full transition-all duration-300 shadow-lg"
          style={{ backgroundColor: getStatusColor(status) } as React.CSSProperties}
        />
        {/* Dot pulse effect */}
        {isProcessing && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: getStatusColor(status) } as React.CSSProperties}
            animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      {/* Enhanced status text */}
      <motion.span 
        className="text-sm text-white/95 font-semibold tracking-wide"
        animate={isProcessing ? { opacity: [1, 0.7, 1] } : { opacity: 1 }}
        transition={{ duration: 1, repeat: isProcessing ? Infinity : 0 }}
      >
        {displayText}
      </motion.span>
      
      {/* Enhanced loading spinner for processing states */}
      {isProcessing && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Loader2 className="w-4 h-4 text-white/80" />
          {/* Spinner glow */}
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Loader2 className="w-4 h-4 text-white blur-sm" />
          </motion.div>
        </motion.div>
      )}

      {/* Background gradient overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 via-transparent to-white/10 pointer-events-none" />
      
      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${getStatusColor(status)}40, transparent)`
        } as React.CSSProperties}
        animate={{ rotate: isProcessing ? 360 : 0 }}
        transition={{ duration: 2, repeat: isProcessing ? Infinity : 0, ease: "linear" }}
      />
    </motion.div>
  );
};

export default StatusIndicator;
