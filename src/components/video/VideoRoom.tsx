import React, { useRef } from 'react';
import { useJitsi } from '../../hooks/useJitsi';

interface VideoRoomProps {
  roomId: string;
  displayName: string;
  onEnd?: () => void;
}

export const VideoRoom: React.FC<VideoRoomProps> = ({ roomId, displayName, onEnd }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { loading, error } = useJitsi({ roomId, displayName, containerRef, onEnd });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50/10 border border-red-500/25 rounded-2xl max-w-md mx-auto my-12 text-center">
        <span className="text-4xl mb-3">⚠️</span>
        <h3 className="text-md font-bold text-red-600 dark:text-red-400">Falha ao iniciar chamada</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex-1 min-h-[450px] bg-slate-950 overflow-hidden rounded-2xl shadow-inner border border-slate-800/80">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10 space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-xs text-slate-450 uppercase tracking-wider font-bold">Carregando sala de aula...</p>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
