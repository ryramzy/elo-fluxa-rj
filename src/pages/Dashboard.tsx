import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useEnrollments } from '../hooks/useEnrollments';
import { useBookings } from '../hooks/useBookings';
import { useStreak } from '../hooks/useStreak';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNavigate } from 'react-router-dom';

// Import components that we know work
import { Header } from '../components/dashboard/Header';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { KpiCards } from '../components/dashboard/KpiCards';
import { CoursesGrid } from '../components/dashboard/CoursesGrid';
import { UpcomingClasses } from '../components/dashboard/UpcomingClasses';
import { QuickLinks } from '../components/dashboard/QuickLinks';

const DashboardWorking: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid || '');
  const { enrollments, loading: enrollmentsLoading } = useEnrollments(user?.uid || '');
  const { bookings, loading: bookingsLoading } = useBookings(user?.uid || '');
  const { streak } = useStreak(user?.uid || '');
  const navigate = useNavigate();
  
  const loading = profileLoading || enrollmentsLoading || bookingsLoading;
  
  useDocumentTitle('Dashboard');

  console.log('DashboardWorking - user:', user?.email);
  console.log('DashboardWorking - profile:', profile?.displayName);
  console.log('DashboardWorking - loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-600">No user found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header profile={profile} user={user} />
      
      <WelcomeBanner profile={profile} streak={streak || 0} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <KpiCards
          bookings={bookings || []}
          enrollments={enrollments || []}
          profile={profile}
          weeklyBookingsCount={0}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CoursesGrid
              courses={[]}
              enrollments={enrollments || []}
              onEnroll={() => {}}
              onContinue={() => {}}
            />
          </div>

          <div className="space-y-6">
            <UpcomingClasses
              bookings={bookings || []}
              onNavigateToAgenda={() => navigate('/agenda')}
            />
            <QuickLinks
              onNavigateToAgenda={() => navigate('/agenda')}
              onNavigateToCourses={() => navigate('/courses')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWorking;
