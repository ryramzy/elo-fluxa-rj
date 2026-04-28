import React from 'react';
import { useAuth } from '../hooks/useAuth';

const DashboardSimple: React.FC = () => {
  const { user } = useAuth();

  console.log('Dashboard rendering, user:', user);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Dashboard Test
      </h1>
      <p className="text-slate-600 dark:text-slate-400">
        User: {user?.displayName || 'No user'}
      </p>
      <p className="text-slate-600 dark:text-slate-400">
        Email: {user?.email || 'No email'}
      </p>
    </div>
  );
};

export default DashboardSimple;
