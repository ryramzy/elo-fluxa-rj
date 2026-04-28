import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const DashboardMinimal: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile(user?.uid || '');
  
  useDocumentTitle('Dashboard');

  console.log('DashboardMinimal rendering, user:', user);
  console.log('DashboardMinimal rendering, profile:', profile);
  console.log('DashboardMinimal rendering, loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        Dashboard Minimal
      </h1>
      <div className="space-y-2">
        <p className="text-slate-600 dark:text-slate-400">
          User: {user?.displayName || 'No user'}
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Email: {user?.email || 'No email'}
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Profile: {profile?.displayName || 'No profile'}
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Level: {profile?.level || 'No level'}
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          XP: {profile?.xp || 'No XP'}
        </p>
      </div>
    </div>
  );
};

export default DashboardMinimal;
