import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNavigate } from 'react-router-dom';

// Import components one by one
import { Header } from '../components/dashboard/Header';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { KpiCards } from '../components/dashboard/KpiCards';
import { CoursesGrid } from '../components/dashboard/CoursesGrid';
import { UpcomingClasses } from '../components/dashboard/UpcomingClasses';
import { QuickLinks } from '../components/dashboard/QuickLinks';

const DashboardComponentTest: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile(user?.uid || '');
  const navigate = useNavigate();
  
  useDocumentTitle('Dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Test Header component */}
      <Header profile={profile} user={user} />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Dashboard Component Test
        </h1>
        
        <div className="space-y-6">
          {/* Test WelcomeBanner */}
          <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded">
            <h3 className="font-bold mb-2">Testing WelcomeBanner:</h3>
            <WelcomeBanner profile={profile} streak={0} />
          </div>
          
          {/* Test KpiCards */}
          <div className="p-4 bg-green-100 dark:bg-green-900 rounded">
            <h3 className="font-bold mb-2">Testing KpiCards:</h3>
            <KpiCards
              bookings={[]}
              enrollments={[]}
              profile={profile}
              weeklyBookingsCount={0}
            />
          </div>
          
          {/* Test QuickLinks */}
          <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded">
            <h3 className="font-bold mb-2">Testing QuickLinks:</h3>
            <QuickLinks
              onNavigateToAgenda={() => navigate('/agenda')}
              onNavigateToCourses={() => navigate('/courses')}
            />
          </div>

          {/* Test CoursesGrid */}
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded">
            <h3 className="font-bold mb-2">Testing CoursesGrid:</h3>
            <CoursesGrid 
              courses={[]} 
              enrollments={[]} 
              onEnroll={() => {}} 
              onContinue={() => {}} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponentTest;
