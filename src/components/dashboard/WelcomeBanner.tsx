import React from 'react';
import { getXPProgress } from '../../utils/xpUtils';
import { getWhatsAppLink } from '../../../constants';
import { trackEvent } from '../../utils/analytics';

interface WelcomeBannerProps {
  profile: any;
  streak: number;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ profile, streak }) => {
  const xpProgress = getXPProgress(profile);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {getGreeting()}, {profile?.displayName?.split(' ')[0] || 'estudante'}! Ready to level up?
            </h1>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-lg">🔥</span>
                </div>
                <span className="text-slate-300 font-medium">{streak} day streak</span>
              </div>
              <div className="flex-1 tour-step-xp">
                <div className="flex justify-between text-sm text-slate-400 mb-1">
                  <span>XP to Level {(profile?.level || 1) + 1}</span>
                  <span>{Math.max(0, xpProgress.total - xpProgress.current)} XP</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-600 ease-out"
                    style={{ width: `${xpProgress.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center shrink-0">
            <a
              href={getWhatsAppLink('onboarding', { studentName: profile?.displayName })}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_click_welcome_banner', { uid: profile?.uid })}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95 border border-emerald-400/30"
            >
              <span>💬</span> Falar com Matt no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
