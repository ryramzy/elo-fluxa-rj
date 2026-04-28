import React from 'react';
import type { User } from 'firebase/auth';

interface HeaderProps {
  profile: any;
  user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ profile, user }) => {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">Elo English</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Level {profile?.level || 1}
              </span>
            </div>
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
              <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                {profile?.displayName?.[0] || user?.email?.[0] || '?'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
