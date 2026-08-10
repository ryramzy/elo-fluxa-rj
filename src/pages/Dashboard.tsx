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
import { StudentTimeline } from '../components/dashboard/StudentTimeline';
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
import SubscriptionModal from '../components/SubscriptionModal';
import { LuTriangleAlert } from 'react-icons/lu';

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firestore';

import { getAdminViewMode, setAdminViewMode } from '../utils/adminView';
import { WidgetErrorBoundary } from '../components/dashboard/WidgetErrorBoundary';

const DashboardWorking: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid || '');
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const { enrollments, loading: enrollmentsLoading } = useEnrollments(user?.uid || '');
  const { bookings, loading: bookingsLoading } = useBookings(user?.uid || '');
  const { streak } = useStreak(user?.uid || '');
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'booking' | 'referral'>(
    (location.state as any)?.tab === 'booking' ? 'booking' : 'overview'
  );
  const [referredUsers, setReferredUsers] = useState<any[]>([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAdminView, setIsAdminView] = useState(() => getAdminViewMode());

  useEffect(() => {
    const handleViewChange = (e: any) => {
      if (typeof e.detail === 'boolean') {
        setIsAdminView(e.detail);
      } else {
        setIsAdminView(getAdminViewMode());
      }
    };

    window.addEventListener('elo_admin_view_changed' as any, handleViewChange);
    return () => window.removeEventListener('elo_admin_view_changed' as any, handleViewChange);
  }, []);

  useEffect(() => {
    const stateTab = (location.state as any)?.tab;
    if (stateTab === 'booking' || stateTab === 'overview') {
      setActiveTab(stateTab);
    }
  }, [location.state]);

  useEffect(() => {
    if (!user?.uid || activeTab !== 'referral') return;
    
    const fetchReferrals = async () => {
      setReferralsLoading(true);
      try {
        const q = query(collection(db, 'users'), where('referredBy', '==', user.uid));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReferredUsers(list);
      } catch (err) {
        console.error('Error fetching referrals:', err);
      } finally {
        setReferralsLoading(false);
      }
    };

    fetchReferrals();
  }, [user?.uid, activeTab]);

  const toggleViewMode = () => {
    const next = !isAdminView;
    setIsAdminView(next);
    setAdminViewMode(next);
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

  useEffect(() => {
    if (!profileLoading && !user) {
      navigate('/login');
    }
  }, [user, profileLoading, navigate]);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Unified Ecosystem: Render Tutor Dashboard if user has tutor or admin role
  const adminUid = import.meta.env.VITE_ADMIN_UID;
  const userEmail = (user?.email || profile?.email || '').toLowerCase().trim();
  const isAuthorizedEmail = 
    userEmail === 'mramsayo@gmail.com' ||
    userEmail === 'mramsay0@gmail.com' ||
    userEmail === 'erneleducation@gmail.com' ||
    userEmail.endsWith('@elospeak.com.br') ||
    userEmail.endsWith('@elospeak.com');

  const isTutorOrAdmin = profile?.role === 'tutor' || profile?.role === 'admin' || isAuthorizedEmail || (user?.uid && adminUid && user.uid.trim() === adminUid.trim());

  console.log('[Dashboard] VIEW DECISION:', { isAdminView, isTutorOrAdmin, willRenderAdmin: isTutorOrAdmin && isAdminView, userEmail, profileRole: profile?.role });
  
  if (isTutorOrAdmin && isAdminView) {
    return <Admin />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {isTutorOrAdmin && (
        <div className="w-full bg-blue-600 text-white text-center py-2.5 px-4 font-bold text-xs tracking-wider uppercase shadow-md flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <span>Você está no modo de visualização de aluno.</span>
          <button 
            onClick={toggleViewMode}
            className="bg-white text-blue-600 px-4 py-1.5 rounded-lg font-extrabold hover:bg-slate-100 transition-colors shadow-sm text-xs"
          >
            Voltar para o Painel Admin
          </button>
        </div>
      )}
      <OnboardingTour 
        hasSeenOnboarding={profile?.hasSeenOnboarding || false} 
        profileLoaded={!profileLoading && !!profile} 
      />
      <WidgetErrorBoundary widgetName="Boas-vindas">
        <WelcomeBanner profile={profile} streak={streak || 0} />
      </WidgetErrorBoundary>

      {profile?.paymentPastDue && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4">
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3 text-rose-500">
              <LuTriangleAlert size={20} className="shrink-0" />
              <div className="text-left">
                <h4 className="text-sm font-bold text-white leading-tight">Pagamento Atrasado ⚠️</h4>
                <p className="text-xs text-slate-400">Houve uma falha na cobrança da sua assinatura. Atualize seu cartão de crédito para evitar a interrupção do acesso.</p>
              </div>
            </div>
            <button
              onClick={() => setSubscriptionModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors shadow-[0_4px_12px_rgba(244,63,94,0.3)] shrink-0"
            >
              Atualizar Cartão
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6">
        
        {/* Navigation Tabs for Student Dashboard */}
        <div className="w-full flex justify-start sm:justify-center overflow-x-auto no-scrollbar pb-1 mb-8">
          <div className="inline-flex bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl shadow-inner border border-slate-300/20 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap ${
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
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap ${
                activeTab === 'booking'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FaCalendarAlt size={16} />
              Agendar Sessão
            </button>
            <button
              onClick={() => setActiveTab('referral')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap ${
                activeTab === 'referral'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="text-base">🎁</span>
              Indique & Ganhe
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

            <WidgetErrorBoundary widgetName="Resumo de Métricas">
              <KpiCards
                bookings={bookings || []}
                enrollments={enrollments || []}
                profile={profile}
                weeklyBookingsCount={getWeeklyBookingsCount(bookings || [])}
              />
            </WidgetErrorBoundary>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <WidgetErrorBoundary widgetName="Notas do Professor">
                  <TutorNotesWidget bookings={bookings || []} />
                </WidgetErrorBoundary>

                <WidgetErrorBoundary widgetName="Grade de Cursos">
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
                </WidgetErrorBoundary>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <WidgetErrorBoundary widgetName="Dicionário">
                    <DictionaryWidget />
                  </WidgetErrorBoundary>
                  <WidgetErrorBoundary widgetName="Trivia">
                    <TriviaWidget />
                  </WidgetErrorBoundary>
                </div>
              </div>

              <div className="space-y-6">
                <WidgetErrorBoundary widgetName="Professores Ao Vivo">
                  <LiveTutorsWidget onNavigateToAgenda={() => setActiveTab('booking')} />
                </WidgetErrorBoundary>
                <WidgetErrorBoundary widgetName="Linha do Tempo">
                  <StudentTimeline
                    bookings={bookings || []}
                    xp={profile?.xp || 0}
                    onBookNextLesson={() => setActiveTab('booking')}
                  />
                </WidgetErrorBoundary>
                <WidgetErrorBoundary widgetName="Próximas Aulas">
                  <UpcomingClasses
                    bookings={bookings || []}
                    onNavigateToAgenda={() => setActiveTab('booking')}
                  />
                </WidgetErrorBoundary>
                <WidgetErrorBoundary widgetName="Links Rápidos">
                  <QuickLinks
                    onNavigateToAgenda={() => setActiveTab('booking')}
                    onNavigateToCourses={() => navigate('/courses')}
                  />
                </WidgetErrorBoundary>
              </div>
            </div>
          </>
        ) : activeTab === 'booking' ? (
          <div className="bg-[#020617] rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-2xl border border-slate-800/80 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#020617] to-[#020617]">
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
            
            <WidgetErrorBoundary widgetName="Agenda de Aulas">
              <VisualSlotPicker onSlotSelect={() => {
                setActiveTab('overview');
                showToast({ type: 'success', message: 'Sua aula foi agendada e está disponível no seu painel.' });
              }} />
            </WidgetErrorBoundary>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-750/50">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Indique e Ganhe Aulas 🎁
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Convide seus amigos para praticar inglês no Elo e ganhe créditos de aula extra!</p>
              </div>
              <button
                onClick={() => setActiveTab('overview')}
                className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-650"
              >
                Voltar ao Painel
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Share Link Card */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 p-6 rounded-2xl border border-blue-100/50 dark:border-blue-900/30">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Seu Link de Indicação Exclusivo</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Copie e compartilhe o link abaixo. Quando seu amigo se cadastrar com ele e ativar qualquer assinatura, você ganha <strong>+1 aula particular</strong> direto no seu perfil!
                  </p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/signup?ref=${user?.uid || ''}`}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-xs text-slate-600 dark:text-slate-300 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${user?.uid || ''}`);
                        setCopied(true);
                        showToast({ type: 'success', message: 'Link de indicação copiado!' });
                        setTimeout(() => setCopied(false), 2050);
                      }}
                      className="px-5 py-3 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all"
                    >
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                {/* Referred Users Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-750/50 p-6">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-50 dark:border-slate-700/50">
                    Seus Amigos Indicados ({referredUsers.length})
                  </h3>

                  {referralsLoading ? (
                    <div className="py-10 text-center">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-xs text-slate-400">Buscando indicações...</p>
                    </div>
                  ) : referredUsers.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                      Nenhum amigo cadastrado com seu link ainda. Comece a indicar! 🚀
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-50 dark:border-slate-700/50 font-bold uppercase tracking-wider text-[10px]">
                            <th className="pb-3">Nome</th>
                            <th className="pb-3">Email</th>
                            <th className="pb-3">Status de Assinatura</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30">
                          {referredUsers.map(u => (
                            <tr key={u.id} className="text-slate-700 dark:text-slate-350">
                              <td className="py-3 font-bold">{u.displayName || 'Estudante'}</td>
                              <td className="py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                              <td className="py-3">
                                {u.plan && u.plan !== 'free' ? (
                                  <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider">
                                    Assinatura Ativa ✅
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-500 dark:bg-slate-900/50 dark:text-slate-450 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider">
                                    Apenas Cadastrado
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Benefits Overview */}
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    Benefícios Acumulados
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider">Total de Aulas Ganhas</span>
                      <span className="text-3xl font-black text-slate-800 dark:text-white">
                        {referredUsers.filter(u => u.plan && u.plan !== 'free').length}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider">Créditos Ativos Disponíveis</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {profile?.corporateCredits || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-955 border border-slate-800 rounded-2xl space-y-3">
                  <span className="text-xl">🏆</span>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Campanha Especial</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Não há limite de convites! Indique quantos amigos quiser. Quanto mais amigos assinarem o plano do Elo, mais aulas de conversação particular você ganha gratuitamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onPlanSelect={(plan) => {
          setSubscriptionModalOpen(false);
        }}
      />
    </div>
  );
};

export default DashboardWorking;
