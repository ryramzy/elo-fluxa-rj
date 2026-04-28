import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoCall } from '../components/video/VideoCall';
import { useAuth } from '../hooks/useAuth';

const VideoCallPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEndCall = () => {
    navigate('/dashboard');
  };

  if (!roomId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Invalid Call Link
          </h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <VideoCall
      roomId={roomId}
      displayName={user?.displayName || 'Student'}
      onEnd={handleEndCall}
    />
  );
};

export default VideoCallPage;
