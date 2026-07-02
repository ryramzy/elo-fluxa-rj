import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FaHome, FaCalendarPlus, FaGraduationCap, FaUser, FaRobot } from 'react-icons/fa';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

    const navItems = [
      { name: 'Painel', path: '/dashboard', icon: <FaHome size={22} />, state: null },
      { name: 'Cursos', path: '/courses', icon: <FaGraduationCap size={22} />, state: null },
      { name: 'Tutor IA', path: '/ai-coach', icon: <FaRobot size={22} />, state: null },
      { name: 'Agenda', path: '/agenda', icon: <FaCalendarPlus size={22} />, state: null },
      { name: 'Perfil', path: '/profile', icon: <FaUser size={22} />, state: null },
    ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center pb-safe z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          state={item.state}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full py-3 transition-colors ${
              isActive && (!item.state || isActive) // simple active styling check
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`
          }
        >
          {item.icon}
          <span className="text-[9px] font-medium mt-1 tracking-wide uppercase">{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
};
