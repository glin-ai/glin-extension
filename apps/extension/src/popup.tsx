/**
 * Popup entry point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

// Placeholder component until we build the UI
function App() {
  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#1a1a2e',
      color: '#ffffff',
      minHeight: '600px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>GLIN Wallet</h1>
      <p style={{ fontSize: '14px', color: '#888', marginBottom: '30px' }}>
        v0.1.0 - Development Build
      </p>

      <div style={{
        backgroundColor: '#16213e',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '16px', marginBottom: '15px' }}>🔧 In Development</h2>
        <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#aaa' }}>
          The GLIN Wallet extension is currently under construction.<br/>
          Core features are being implemented.
        </p>
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        <p>✅ Background Service Worker</p>
        <p>✅ Message Passing System</p>
        <p>✅ window.glin Provider</p>
        <p>⏳ Popup UI (Next)</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
