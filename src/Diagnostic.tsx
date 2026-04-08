import React from 'react';

// Diagnostic Component - Renders environment variables for deployment verification
// This component should be removed after successful deployment verification

const Diagnostic: React.FC = () => {
  const maskSecret = (value: string | undefined) => {
    if (!value) return 'MISSING';
    if (value.length <= 8) return 'TOO_SHORT';
    return value.substring(0, 4) + '***' + value.substring(value.length - 4);
  };

  const envVars = {
    'Firebase Project ID': import.meta.env.VITE_FIREBASE_PROJECT_ID || 'MISSING',
    'Firebase API Key': maskSecret(import.meta.env.VITE_FIREBASE_API_KEY),
    'Firebase Auth Domain': import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'MISSING',
    'Firebase Storage Bucket': import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'MISSING',
    'Firebase Messaging Sender ID': import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'MISSING',
    'Firebase App ID': maskSecret(import.meta.env.VITE_FIREBASE_APP_ID),
    'Google Client ID': maskSecret(import.meta.env.VITE_GOOGLE_CLIENT_ID),
  };

  const allPresent = Object.values(envVars).every(val => val !== 'MISSING' && val !== 'TOO_SHORT');

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: allPresent ? '#d4edda' : '#f8d7da',
      border: `2px solid ${allPresent ? '#c3e6cb' : '#f5c6cb'}`,
      borderRadius: '8px',
      padding: '15px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        fontWeight: 'bold',
        marginBottom: '10px',
        color: allPresent ? '#155724' : '#721c24'
      }}>
        {allPresent ? 'ENVIRONMENT OK' : 'ENVIRONMENT ERROR'}
      </div>
      
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key} style={{
          marginBottom: '5px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{fontWeight: 'bold', color: '#495057'}}>{key}:</span>
          <span style={{
            color: value === 'MISSING' ? '#dc3545' : 
                   value === 'TOO_SHORT' ? '#fd7e14' : '#28a745',
            wordBreak: 'break-all',
            marginLeft: '10px'
          }}>
            {value}
          </span>
        </div>
      ))}
      
      <div style={{
        marginTop: '10px',
        fontSize: '10px',
        color: '#6c757d',
        borderTop: '1px solid #dee2e6',
        paddingTop: '8px'
      }}>
        Project: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'NOT SET'}
      </div>
    </div>
  );
};

export default Diagnostic;
