import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FaHome, FaCalendarPlus, FaGraduationCap, FaUser } from 'react-icons/fa';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return null;
  }

  const navItems = [
    { name: 'Painel', path: '/dashboard', icon: FaHome, state: { tab: 'overview' }, matchTab: 'overview' },
    { name: 'Cursos', path: '/courses', icon: FaGraduationCap, state: null, matchTab: null },
    { name: 'Agenda', path: '/dashboard', icon: FaCalendarPlus, state: { tab: 'booking' }, matchTab: 'booking' },
    { name: 'Perfil', path: '/profile', icon: FaUser, state: null, matchTab: null },
  ];

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex justify-around items-stretch z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        // Better active detection for tab-based routes
        const isActive = item.state 
          ? location.pathname === item.path && location.state?.tab === item.matchTab
          : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

        return (
          <NavLink
            key={item.name}
            to={item.path}
            state={item.state}
            className="flex flex-col items-center justify-center flex-1 min-h-[56px] py-2 relative transition-colors"
          >
            <div className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
              isActive 
                ? 'text-blue-600 dark:text-blue-400 scale-105' 
                : 'text-slate-400 dark:text-slate-500 active:scale-95'
            }`}>
              {/* Active pill indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
              <Icon size={22} />
              <span className="text-[10px] font-semibold tracking-wide uppercase leading-tight">{item.name}</span>
            </div>
          </NavLink>
        );
      })}
    </div>
  );
};
