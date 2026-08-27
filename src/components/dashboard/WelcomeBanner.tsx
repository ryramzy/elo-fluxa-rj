import React, { useState } from 'react';
import { getXPProgress } from '../../utils/xpUtils';
import { trackEvent } from '../../utils/analytics';
import { StudentProgressModal } from './StudentProgressModal';

interface WelcomeBannerProps {
  profile: any;
  streak: number;
  bookings?: any[];
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ profile, streak, bookings = [] }) => {
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const xpProgress = getXPProgress(profile);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleOpenProgress = (e: React.MouseEvent) => {
    e.preventDefault();
    trackEvent('progress_modal_open', { uid: profile?.uid });
    setProgressModalOpen(true);
  };

  return (
    <>
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {getGreeting()}, {profile?.displayName?.split(' ')[0] || 'estudante'}! Ready to level up?
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-4">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-lg">🔥</span>
                  </div>
                  <span className="text-slate-300 font-medium text-xs sm:text-sm">{streak} day streak</span>
                </div>
                <div className="w-full sm:flex-1 tour-step-xp">
                  <div className="flex justify-between text-xs sm:text-sm text-slate-400 mb-1">
                    <span>XP to Level {(profile?.level || 1) + 1}</span>
                    <span>{Math.max(0, xpProgress.total - xpProgress.current)} XP</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                      style={{ width: `${xpProgress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile-only quick action buttons (3 Core Pillars) */}
              <div className="grid grid-cols-3 gap-2 mt-4 w-full sm:hidden">
                <a
                  href="/agenda"
                  className="inline-flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider py-2.5 px-2 rounded-xl transition-all shadow-md active:scale-95 border border-emerald-400/30 text-center"
                >
                  <span>🗓️</span> Agendar
                </a>
                <a
                  href="/classroom"
                  onClick={() => trackEvent('zoom_launcher_click', { uid: profile?.uid })}
                  className="inline-flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider py-2.5 px-2 rounded-xl transition-all shadow-md active:scale-95 border border-blue-400/30 text-center"
                >
                  <span>📹</span> Sala de Aula
                </a>
                <button
                  type="button"
                  onClick={handleOpenProgress}
                  className="inline-flex items-center justify-center gap-1 bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-wider py-2.5 px-2 rounded-xl transition-all shadow-md active:scale-95 border border-purple-400/30 text-center"
                >
                  <span>📊</span> Progresso
                </button>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <a
                href="/agenda"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95 border border-emerald-400/30"
              >
                <span>🗓️</span> Agendar Aula com Matt
              </a>
              <a
                href="/classroom"
                onClick={() => trackEvent('zoom_launcher_click', { uid: profile?.uid })}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95 border border-blue-400/30"
              >
                <span>📹</span> Entrar na Sala
              </a>
              <button
                type="button"
                onClick={handleOpenProgress}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95 border border-purple-400/30"
              >
                <span>📊</span> Meu Progresso & Feedback
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Progress Modal Popup */}
      <StudentProgressModal
        isOpen={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        profile={profile}
        streak={streak}
        bookings={bookings}
      />
    </>
  );
};
