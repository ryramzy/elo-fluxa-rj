import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useEnrollments } from '../hooks/useEnrollments';
import { useBookings } from '../hooks/useBookings';
import { useStreak } from '../hooks/useStreak';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { trackEvent } from '../utils/analytics';

// Import components that we know work
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { KpiCards } from '../components/dashboard/KpiCards';
import { CoursesGrid } from '../components/dashboard/CoursesGrid';
import { UpcomingClasses } from '../components/dashboard/UpcomingClasses';
import { LiveTutorsWidget } from '../components/dashboard/LiveTutorsWidget';
import { QuickLinks } from '../components/dashboard/QuickLinks';
import { courses } from '../data/courses';
import { OnboardingTour } from '../components/dashboard/OnboardingTour';
import { enrollUserInCourse } from '../lib/firestore';
import { VisualSlotPicker } from '../components/booking/VisualSlotPicker';
import Admin from './Admin';
import { FaGraduationCap, FaCalendarAlt } from 'react-icons/fa';
import { DictionaryWidget } from '../components/dashboard/DictionaryWidget';
import { TriviaWidget } from '../components/dashboard/TriviaWidget';
import { TutorNotesWidget } from '../components/TutorNotesWidget';

const DashboardWorking: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid || '');
  const { enrollments, loading: enrollmentsLoading } = useEnrollments(user?.uid || '');
  const { bookings, loading: bookingsLoading } = useBookings(user?.uid || '');
  const { streak } = useStreak(user?.uid || '');
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'booking'>(
    (location.state as any)?.tab === 'booking' ? 'booking' : 'overview'
  );
  const [isAdminView, setIsAdminView] = useState(true);

  useEffect(() => {
    const stateTab = (location.state as any)?.tab;
    if (stateTab === 'booking' || stateTab === 'overview') {
      setActiveTab(stateTab);
    }
  }, [location.state]);

  useEffect(() => {
    const savedView = sessionStorage.getItem('elo_admin_view');
    if (savedView !== null) {
      setIsAdminView(savedView === 'true');
    }
  }, []);

  const toggleViewMode = () => {
    const newView = !isAdminView;
    setIsAdminView(newView);
    sessionStorage.setItem('elo_admin_view', String(newView));
  };
  
  const loading = profileLoading || enrollmentsLoading || bookingsLoading;
  
  useDocumentTitle('Dashboard');

  console.log('DashboardWorking - user:', user?.email);
  console.log('DashboardWorking - profile:', profile?.displayName, 'role:', profile?.role);
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

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
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

  // Unified Ecosystem: Render Tutor Dashboard if user has tutor or admin role
  const adminUid = import.meta.env.VITE_ADMIN_UID;
  const isTutorOrAdmin = profile?.role === 'tutor' || profile?.role === 'admin' || (user?.uid && adminUid && user.uid.trim() === adminUid.trim());
  
  if (isTutorOrAdmin && isAdminView) {
    return <Admin onSwitchToStudentView={toggleViewMode} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {isTutorOrAdmin && (
        <div className="w-full bg-blue-600 text-white text-center py-3 px-4 font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-4">
          <span>Você está no modo de visualização de aluno.</span>
          <button 
            onClick={toggleViewMode}
            className="bg-white text-blue-600 px-4 py-1.5 rounded-lg font-extrabold hover:bg-slate-100 transition-colors shadow-sm"
          >
            Voltar para o Painel Admin
          </button>
        </div>
      )}
      <OnboardingTour 
        hasSeenOnboarding={profile?.hasSeenOnboarding || false} 
        profileLoaded={!profileLoading && !!profile} 
      />
      <WelcomeBanner profile={profile} streak={streak || 0} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        
        {/* Navigation Tabs for Student Dashboard */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl shadow-inner border border-slate-300/20">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FaGraduationCap size={16} />
              Aulas & Progresso
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'booking'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FaCalendarAlt size={16} />
              Agendar Sessão
            </button>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Prominent Booking CTA */}
            <div className="mb-8 bg-blue-600 rounded-2xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden tour-step-agenda">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
              <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Ready for your next lesson?</h2>
                <p className="text-blue-100 max-w-md">Book a 1-on-1 session with Elo and level up your English today.</p>
              </div>
              <button 
                onClick={() => setActiveTab('booking')}
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
              <div className="lg:col-span-2 space-y-8">
                <TutorNotesWidget bookings={bookings || []} />
                <div className="tour-step-courses">
                  <CoursesGrid
                    courses={courses}
                    enrollments={enrollments || []}
                    onEnroll={async (courseId) => {
                      if (!user) return;
                      const course = courses.find(c => c.id === courseId);
                      if (!course) return;
                      try {
                        trackEvent('course_enroll', { courseId });
                        await enrollUserInCourse(user.uid, courseId, course.lessons.length);
                        navigate(`/courses/${courseId}/lessons/${course.lessons[0].id}`);
                      } catch (err) {
                        console.error('Failed to enroll:', err);
                        showToast({ type: 'error', message: 'Não foi possível se matricular no curso. Verifique sua conexão e tente novamente.' });
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DictionaryWidget />
                  <TriviaWidget />
                </div>
              </div>

              <div className="space-y-6">
                <LiveTutorsWidget />
                <UpcomingClasses
                  bookings={bookings || []}
                  onNavigateToAgenda={() => setActiveTab('booking')}
                />
                <QuickLinks
                  onNavigateToAgenda={() => setActiveTab('booking')}
                  onNavigateToCourses={() => navigate('/courses')}
                  onNavigateToAiCoach={() => navigate('/ai-coach')}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="bg-[#020617] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800/80 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#020617] to-[#020617]">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
                  Agendar Sessão
                </h2>
                <p className="text-xs text-slate-400 mt-1">Selecione um horário disponível abaixo para reservar sua aula de 1 hora.</p>
              </div>
              <button
                onClick={() => setActiveTab('overview')}
                className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors bg-slate-800 px-4 py-2 rounded-lg border border-slate-700/50"
              >
                Voltar ao Painel
              </button>
            </div>
            
            <VisualSlotPicker onSlotSelect={() => {
              setActiveTab('overview');
              showToast({ type: 'success', message: 'Sua aula foi agendada e está disponível no seu painel.' });
            }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardWorking;
