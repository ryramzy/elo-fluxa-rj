import React from 'react';
import { VideoRoom } from './VideoRoom';

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
  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-350">
            Aula Particular: {displayName}
          </span>
        </div>
        {onEnd && (
          <button
            onClick={onEnd}
            className="bg-red-600 hover:bg-red-500 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all shadow-red-950/20"
          >
            Encerrar Aula
          </button>
        )}
      </div>

      {/* Classroom Container */}
      <div className="flex-1 p-4 md:p-6 bg-slate-900 flex flex-col justify-stretch">
        <VideoRoom
          roomId={roomId}
          displayName={displayName}
          onEnd={onEnd}
        />
      </div>
    </div>
  );
};
