import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create root and render app
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log app info if in development
if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
  console.log('🤖 Ava AI Assistant - Electron Frontend');
  console.log('🔗 Backend should be running on http://127.0.0.1:8000');
  
  // Log Electron API availability
  if (typeof window !== 'undefined' && window.electronAPI) {
    console.log('✅ Electron API is available');
    window.electronAPI.getAppVersion().then(version => {
      console.log(`📱 App Version: ${version}`);
    });
  } else {
    console.log('⚠️ Electron API not available (running in browser?)');
  }
}
