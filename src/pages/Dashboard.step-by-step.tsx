import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNavigate } from 'react-router-dom';

const DashboardStepByStep: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile(user?.uid || '');
  const navigate = useNavigate();
  
  useDocumentTitle('Dashboard');

  console.log('Dashboard rendering - Step 1: Basic imports working');

  // Step 1: Test basic rendering
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <h1 className="text-2xl font-bold text-red-600">No user found</h1>
      </div>
    );
  }

  console.log('Dashboard rendering - Step 2: User found:', user.email);

  // Step 2: Test profile loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <h1 className="text-2xl font-bold text-yellow-600">Loading profile...</h1>
      </div>
    );
  }

  console.log('Dashboard rendering - Step 3: Profile loaded:', profile?.displayName);

  // Step 3: Test basic JSX
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        Dashboard - Step by Step Test
      </h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-green-100 dark:bg-green-900 rounded">
          ✅ Step 1: Basic rendering works
        </div>
        
        <div className="p-4 bg-green-100 dark:bg-green-900 rounded">
          ✅ Step 2: User authenticated: {user.email}
        </div>
        
        <div className="p-4 bg-green-100 dark:bg-green-900 rounded">
          ✅ Step 3: Profile loaded: {profile?.displayName || 'No name'}
        </div>
        
        <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded">
          📊 Next: Testing dashboard components...
        </div>
      </div>
    </div>
  );
};

export default DashboardStepByStep;
