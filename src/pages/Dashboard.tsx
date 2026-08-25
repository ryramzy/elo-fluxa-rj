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
import { CoursesGrid } from '../components/dashboard/CoursesGrid';
import { UpcomingClasses } from '../components/dashboard/UpcomingClasses';
import { StudentTimeline } from '../components/dashboard/StudentTimeline';
import { LiveTutorsWidget } from '../components/dashboard/LiveTutorsWidget';
import { QuickLinks } from '../components/dashboard/QuickLinks';
import { courses } from '../data/courses';
import { InteractiveOnboardingModal } from '../components/dashboard/InteractiveOnboardingModal';
import { enrollUserInCourse } from '../lib/firestore';
import { VisualSlotPicker } from '../components/booking/VisualSlotPicker';
import { FaGraduationCap, FaCalendarAlt } from 'react-icons/fa';
import { DictionaryWidget } from '../components/dashboard/DictionaryWidget';
import { TriviaWidget } from '../components/dashboard/TriviaWidget';
import { TutorNotesWidget } from '../components/TutorNotesWidget';
import SubscriptionModal from '../components/SubscriptionModal';
import { LuTriangleAlert } from 'react-icons/lu';

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { WidgetErrorBoundary } from '../components/dashboard/WidgetErrorBoundary';

const DashboardWorking: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid || '');
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const { enrollments, loading: enrollmentsLoading } = useEnrollments(user?.uid || '');
  const { bookings, loading: bookingsLoading } = useBookings(user?.uid || '', user?.email || '');
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
  
  const loading = profileLoading || enrollmentsLoading || bookingsLoading;
  
  useDocumentTitle('Dashboard');

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

    return (userBookings || []).filter(b => {
      if (b.status === 'cancelled') return false;
      const [year, month, day] = (b.date || '').split('-').map(Number);
      if (!year || !month || !day) return false;
      const bDate = new Date(year, month - 1, day);
      return bDate >= monday && bDate <= sunday;
    }).length;
  };

  // Find next upcoming confirmed booking
  const getNextActiveBooking = (userBookings: any[]) => {
    const now = new Date();
    return (userBookings || []).find(b => {
      if (b.status === 'cancelled') return false;
      const [year, month, day] = (b.date || '').split('-').map(Number);
      const [hour, minute] = (b.time || '00:00').split(':').map(Number);
      if (!year || !month || !day) return false;
      const bDate = new Date(year, month - 1, day, hour || 0, minute || 0);
      return bDate >= now;
    }) || userBookings[0];
  };

  const nextActiveBooking = getNextActiveBooking(bookings || []);

  const [hasDismissedOnboarding, setHasDismissedOnboarding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!user?.uid || profileLoading || !profile) return;

    // Privileged accounts, tutors, admins never see onboarding
    const isPrivileged = profile.role === 'admin' || profile.role === 'tutor' || 
                         user.email === 'mramsay0@gmail.com' || user.email === 'mramsayo@gmail.com' || user.email === 'erneleducation@gmail.com';
    if (isPrivileged || user.isGuest) {
      setShowOnboarding(false);
      return;
    }

    // Check localStorage cache
    let localSeen = false;
    try {
      localSeen = localStorage.getItem(`elo_onboarding_completed_${user.uid}`) === 'true';
    } catch (e) {}

    const alreadyDone = profile.hasSeenOnboarding || localSeen || (profile.xp && profile.xp > 0) || !!profile.learningGoal;

    if (alreadyDone) {
      setHasDismissedOnboarding(true);
      setShowOnboarding(false);
      try {
        localStorage.setItem(`elo_onboarding_completed_${user.uid}`, 'true');
      } catch (e) {}
    } else {
      setShowOnboarding(true);
    }
  }, [user, profile, profileLoading]);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <InteractiveOnboardingModal 
        isOpen={showOnboarding}
        onComplete={() => {
          setHasDismissedOnboarding(true);
          setShowOnboarding(false);
          if (user?.uid) {
            try {
              localStorage.setItem(`elo_onboarding_completed_${user.uid}`, 'true');
            } catch (e) {}
          }
        }}
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
            {/* Smart Hero Card (3-State Architecture) */}
            {nextActiveBooking && nextActiveBooking.status === 'confirmed' ? (
              /* State 1: Confirmed Upcoming Class */
              <div className="mb-8 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl shadow-xl p-5 sm:p-7 md:p-8 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden border border-blue-400/20">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 text-center md:text-left mb-6 md:mb-0 space-y-2">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider">
                    <span>🎉</span> Aula Confirmada
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black tracking-tight">
                    Sua próxima aula está confirmada!
                  </h2>
                  <p className="text-blue-100/90 text-xs sm:text-sm max-w-lg font-medium">
                    Com o <strong>{nextActiveBooking.tutorName || 'Professor Matt'}</strong> no dia <strong>{nextActiveBooking.date.split('-').reverse().join('/')}</strong> às <strong>{nextActiveBooking.time}</strong>.
                  </p>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <a 
                    href={nextActiveBooking.meetLink || '/classroom'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto bg-white hover:bg-slate-100 text-blue-700 font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 text-center"
                  >
                    📹 Entrar na Sala
                  </a>
                  <button 
                    onClick={() => setActiveTab('booking')}
                    className="w-full sm:w-auto bg-blue-900/40 hover:bg-blue-900/60 border border-white/20 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    📅 Ver Agenda
                  </button>
                </div>
              </div>
            ) : nextActiveBooking && nextActiveBooking.status === 'pending' ? (
              /* State 2: Pending Class Confirmation */
              <div className="mb-8 bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 rounded-2xl shadow-xl p-5 sm:p-7 md:p-8 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden border border-amber-400/20">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 text-center md:text-left mb-6 md:mb-0 space-y-2">
                  <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-300/30 text-amber-200 text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider">
                    <span>⏳</span> Aguardando Confirmação
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black tracking-tight">
                    Solicitação em processamento
                  </h2>
                  <p className="text-amber-100/90 text-xs sm:text-sm max-w-lg font-medium">
                    Horário solicitado: <strong>{nextActiveBooking.date.split('-').reverse().join('/')}</strong> às <strong>{nextActiveBooking.time}</strong> com o Professor Matt.
                  </p>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <a 
                    href="https://wa.me/5521995719878?text=Ol%C3%A1%20Professor%20Matt%2C%20gostaria%20de%20confirmar%20meu%20hor%C3%A1rio%20de%20aula%20no%20ELO!"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 text-center"
                  >
                    💬 Falar no WhatsApp
                  </a>
                  <button 
                    onClick={() => setActiveTab('booking')}
                    className="w-full sm:w-auto bg-amber-900/40 hover:bg-amber-900/60 border border-white/20 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    📅 Ver Agenda
                  </button>
                </div>
              </div>
            ) : (
              /* State 3: No Upcoming Class Booked */
              <div className="mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl shadow-lg p-5 sm:p-7 md:p-8 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden border border-blue-400/20 tour-step-agenda">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 text-center md:text-left mb-6 md:mb-0 space-y-2">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-100 text-xs font-bold uppercase px-3 py-1 rounded-full tracking-wider">
                    <span>⚡</span> Prática Individual
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black tracking-tight">
                    Pronto para sua próxima aula?
                  </h2>
                  <p className="text-blue-100/90 text-xs sm:text-sm max-w-md font-medium">
                    Agende uma sessão individual com o Professor Matt e acelere sua fluência no inglês.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('booking')}
                  className="relative z-10 w-full md:w-auto bg-white hover:bg-slate-50 text-blue-600 font-extrabold uppercase tracking-wider text-xs px-8 py-4 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  🗓️ Escolher Horário
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <WidgetErrorBoundary widgetName="Notas do Professor">
                  <TutorNotesWidget bookings={bookings || []} />
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
          <WidgetErrorBoundary widgetName="Agenda de Aulas">
            <VisualSlotPicker 
              showTitle={false}
              onBack={() => setActiveTab('overview')}
              onSlotSelect={() => {
                setActiveTab('overview');
                showToast({ type: 'success', message: 'Sua aula foi agendada e está disponível no seu painel.' });
              }} 
            />
          </WidgetErrorBoundary>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-750/50">
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
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-750/50 p-4 sm:p-6">
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
                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
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

                <div className="p-4 sm:p-6 bg-slate-955 border border-slate-800 rounded-2xl space-y-3">
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
