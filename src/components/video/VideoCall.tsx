import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface VideoCallProps {
  roomId: string;
  displayName: string;
  onEnd?: () => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  roomId,
  displayName,
  onEnd
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Jitsi Meet iframe URL
  const jitsiUrl = `https://meet.jit.si/${roomId}`;

  useEffect(() => {
    // Load Jitsi Meet API script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => setIsLoading(false);
    script.onerror = () => {
      setError('Failed to load video service');
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setError('Failed to connect to video call');
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="text-6xl mb-4">📹</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Video Call Error
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-6 max-w-md">
          {error}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
          {onEnd && (
            <button
              onClick={onEnd}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Leave Call
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            In Call with {displayName}
          </span>
        </div>
        {onEnd && (
          <button
            onClick={onEnd}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            End Call
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-600 dark:text-slate-400">
              Connecting to video call...
            </p>
          </div>
        </div>
      )}

      {/* Jitsi iframe */}
      <iframe
        src={jitsiUrl}
        allow="camera; microphone; fullscreen; display-capture"
        style={{
          width: '100%',
          height: isLoading ? '0' : '100%',
          border: 'none',
          display: isLoading ? 'none' : 'block'
        }}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="Video Call"
      />
    </div>
  );
};
