import React from 'react';
import { getXPProgress } from '../../utils/xpUtils';

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
      <div className="max-w-7xl mx-auto px-6 py-8">
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
              <div className="flex-1">
                <div className="flex justify-between text-sm text-slate-400 mb-1">
                  <span>XP to Level {profile?.level + 1 || 2}</span>
                  <span>{xpProgress.total - xpProgress.current} XP</span>
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
        </div>
      </div>
    </div>
  );
};
