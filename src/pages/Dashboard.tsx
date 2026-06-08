import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useEnrollments } from '../hooks/useEnrollments';
import { useBookings } from '../hooks/useBookings';
import { useStreak } from '../hooks/useStreak';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNavigate } from 'react-router-dom';

// Import components that we know work
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { KpiCards } from '../components/dashboard/KpiCards';
import { CoursesGrid } from '../components/dashboard/CoursesGrid';
import { UpcomingClasses } from '../components/dashboard/UpcomingClasses';
import { QuickLinks } from '../components/dashboard/QuickLinks';
import { courses } from '../data/courses';
import { OnboardingTour } from '../components/dashboard/OnboardingTour';
import { enrollUserInCourse } from '../lib/firestore';

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

  const getWeeklyBookingsCount = (userBookings: any[]) => {
    const today = new Date();
    const currentDay = today.getDay();
    // Monday is day 1, Sunday is day 0 in JS getDay()
    const monday = new Date(today);
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return userBookings.filter(b => {
      if (b.status !== 'confirmed') return false;
      const bDate = new Date(`${b.date}T00:00:00`);
      return bDate >= monday && bDate <= sunday;
    }).length;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-600">No user found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <OnboardingTour 
        hasSeenOnboarding={profile?.hasSeenOnboarding || false} 
        profileLoaded={!profileLoading && !!profile} 
      />
      <WelcomeBanner profile={profile} streak={streak || 0} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Prominent Booking CTA */}
        <div className="mb-8 bg-blue-600 rounded-2xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden tour-step-agenda">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
          <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Ready for your next lesson?</h2>
            <p className="text-blue-100 max-w-md">Book a 1-on-1 session with Elo and level up your English today.</p>
          </div>
          <button 
            onClick={() => navigate('/agenda')}
            className="relative z-10 w-full md:w-auto bg-white text-blue-600 font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all"
          >
            Book a Lesson
          </button>
        </div>

        <KpiCards
          bookings={bookings || []}
          enrollments={enrollments || []}
          profile={profile}
          weeklyBookingsCount={getWeeklyBookingsCount(bookings || [])}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 tour-step-courses">
            <CoursesGrid
              courses={courses}
              enrollments={enrollments || []}
              onEnroll={async (courseId) => {
                if (!user) return;
                const course = courses.find(c => c.id === courseId);
                if (!course) return;
                try {
                  await enrollUserInCourse(user.uid, courseId, course.lessons.length);
                  navigate(`/courses/${courseId}/lessons/${course.lessons[0].id}`);
                } catch (err) {
                  console.error('Failed to enroll:', err);
                  navigate(`/courses/${courseId}`);
                }
              }}
              onContinue={(courseId) => {
                const course = courses.find(c => c.id === courseId);
                const enrollment = enrollments?.find(e => e.courseId === courseId);
                if (enrollment?.activeLessonId) {
                  navigate(`/courses/${courseId}/lessons/${enrollment.activeLessonId}`);
                } else if (course?.lessons[0]) {
                  navigate(`/courses/${courseId}/lessons/${course.lessons[0].id}`);
                } else {
                  navigate(`/courses/${courseId}`);
                }
              }}
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
