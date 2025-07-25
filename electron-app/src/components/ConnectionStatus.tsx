import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Database, Server, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { SupabaseService } from '../services/supabase';

interface ConnectionStatusProps {
  className?: string;
}

interface ConnectionState {
  backend: 'connected' | 'disconnected' | 'checking';
  database: 'connected' | 'disconnected' | 'checking';
  lastCheck: Date;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    backend: 'checking',
    database: 'checking',
    lastCheck: new Date()
  });

  const checkConnections = async () => {
    setConnectionState(prev => ({
      ...prev,
      backend: 'checking',
      database: 'checking'
    }));

    // Check backend connection
    try {
      await apiService.checkServerStatus();
      setConnectionState(prev => ({ ...prev, backend: 'connected' }));
    } catch (error) {
      setConnectionState(prev => ({ ...prev, backend: 'disconnected' }));
    }

    // Check Supabase connection
    try {
      const result = await SupabaseService.checkConnection();
      setConnectionState(prev => ({ 
        ...prev, 
        database: result.status === 'connected' ? 'connected' : 'disconnected',
        lastCheck: new Date()
      }));
    } catch (error) {
      setConnectionState(prev => ({ 
        ...prev, 
        database: 'disconnected',
        lastCheck: new Date()
      }));
    }
  };

  useEffect(() => {
    checkConnections();
    const interval = setInterval(checkConnections, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      case 'checking': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (type: 'backend' | 'database', status: string) => {
    const baseClasses = `w-4 h-4 ${getStatusColor(status)}`;
    
    if (status === 'checking') {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <AlertCircle className={baseClasses} />
        </motion.div>
      );
    }
    
    if (type === 'backend') {
      return status === 'connected' ? 
        <Server className={baseClasses} /> : 
        <WifiOff className={baseClasses} />;
    } else {
      return status === 'connected' ? 
        <Database className={baseClasses} /> : 
        <Database className={baseClasses} />;
    }
  };

  const getOverallStatus = () => {
    if (connectionState.database === 'connected') {
      return connectionState.backend === 'connected' ? 'Full connectivity' : 'Database only (Supabase fallback)';
    }
    return 'Limited connectivity';
  };

  const getOverallColor = () => {
    if (connectionState.database === 'connected') {
      return connectionState.backend === 'connected' ? 'text-green-600' : 'text-yellow-600';
    }
    return 'text-red-600';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {getStatusIcon('backend', connectionState.backend)}
        <span className={`text-xs ${getStatusColor(connectionState.backend)}`}>
          API
        </span>
      </div>
      
      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
      
      <div className="flex items-center gap-1">
        {getStatusIcon('database', connectionState.database)}
        <span className={`text-xs ${getStatusColor(connectionState.database)}`}>
          DB
        </span>
      </div>

      <div className="hidden md:block">
        <span className={`text-xs font-medium ${getOverallColor()}`}>
          {getOverallStatus()}
        </span>
      </div>

      <button
        onClick={checkConnections}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Refresh connection status"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Wifi className="w-3 h-3 text-gray-500" />
        </motion.div>
      </button>
    </div>
  );
};

export default ConnectionStatus;
