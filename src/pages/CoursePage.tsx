import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useEnrollments } from '@/hooks/useEnrollments';
import { courses, Course, LessonMetadata } from '@/data/courses';
import { checkCourseAccess, enrollUserInCourse } from '@lib/firestore';
import { awardXP } from '@lib/xpSystem';
import SubscriptionModal from '@components/SubscriptionModal';
import { sounds } from '@utils/sounds';
import { WHATSAPP_NUMBER } from '../../constants';
import { trackEvent } from '@utils/analytics';
import { 
  LuBookOpen, 
  LuClock, 
  LuTrophy, 
  LuPlay, 
  LuArrowLeft, 
  LuBriefcase, 
  LuFlame 
} from 'react-icons/lu';
import { 
  FaLock, 
  FaUnlock, 
  FaCheckCircle, 
  FaWhatsapp, 
  FaInfoCircle, 
  FaShareAlt 
} from 'react-icons/fa';

// --- THEME COLOR MATRIX FOR DYNAMIC GRADIENTS & ACCENTS ---
const themeMatrix = {
  'cyber-blue': {
    glowColor: 'bg-sky-500/10',
    border: 'border-sky-500/20 hover:border-sky-400/40',
    text: 'text-sky-400',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    progress: 'bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]',
    button: 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-[0_4px_14px_rgba(14,165,233,0.3)]',
    pulseGlow: 'shadow-[0_0_15px_rgba(14,165,233,0.15)] border-sky-500/40'
  },
  'amber': {
    glowColor: 'bg-amber-500/10',
    border: 'border-amber-500/20 hover:border-amber-400/40',
    text: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    progress: 'bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]',
    button: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_4px_14px_rgba(251,191,36,0.3)]',
    pulseGlow: 'shadow-[0_0_15px_rgba(251,191,36,0.15)] border-amber-500/40'
  },
  'purple': {
    glowColor: 'bg-purple-500/10',
    border: 'border-purple-500/20 hover:border-purple-400/40',
    text: 'text-purple-400',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    progress: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
    button: 'bg-purple-500 hover:bg-purple-400 text-slate-950 shadow-[0_4px_14px_rgba(168,85,247,0.3)]',
    pulseGlow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)] border-purple-500/40'
  },
  'pink': {
    glowColor: 'bg-pink-500/10',
    border: 'border-pink-500/20 hover:border-pink-400/40',
    text: 'text-pink-400',
    badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    progress: 'bg-pink-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]',
    button: 'bg-pink-500 hover:bg-pink-400 text-slate-950 shadow-[0_4px_14px_rgba(244,63,94,0.3)]',
    pulseGlow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)] border-pink-500/40'
  }
};

const getCourseTheme = (course: Course) => {
  if (course.tag === 'Grammar') {
    return 'purple';
  }
  if (['Conversation', 'Essentials', 'Travel'].includes(course.tag)) {
    return 'amber';
  }
  const technicalTags = ['Tech', 'Engineering', 'Software Developers', 'Finance', 'Product'];
  if (technicalTags.includes(course.tag) || course.id.includes('tech') || course.id.includes('dev')) {
    return 'cyber-blue';
  }
  return 'pink';
};

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid || '');
  const { enrollments } = useEnrollments(user?.uid || '');
  const [activeTab, setActiveTab] = useState<'lessons' | 'about'>('lessons');
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  const course = courses.find(c => c.id === courseId);
  const enrollment = enrollments.find(e => e.courseId === courseId);
  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.progress === 100;

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans text-slate-100 p-4">
        <div className="text-center bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl">
          <h1 className="text-2xl font-extrabold mb-4 text-slate-200">Curso não encontrado</h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-sky-400 hover:text-sky-300 font-semibold underline flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <LuArrowLeft size={16} /> Voltar ao Painel
          </button>
        </div>
      </div>
    );
  }

  const courseThemeKey = getCourseTheme(course);
  const theme = themeMatrix[courseThemeKey];

  const handleEnrollClick = async () => {
    if (!user?.uid) return;
    setEnrollError(null);
    
    try {
      const accessCheck = await checkCourseAccess(user.uid, course.id);
      
      if (!accessCheck.canAccess) {
        setSelectedCourseForEnroll(course.id);
        setSubscriptionModalOpen(true);
        return;
      }
      
      await enrollInCourse();
    } catch (error: any) {
      console.error('Error checking course access:', error);
      setEnrollError(error.message || 'Failed to check course access. Please try again.');
    }
  };

  const enrollInCourse = async () => {
    if (!user?.uid) return;
    setEnrollError(null);
    setIsEnrolling(true);
    
    try {
      await enrollUserInCourse(user.uid, course.id, course.lessons.length);
      trackEvent('course_enroll', { courseId: course.id });
      awardXP(user.uid, 50, 'course enrolled').catch(xpError => {
        console.error('Failed to award XP:', xpError);
      });
      
      fetch('/api/email/enrollment-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: profile?.displayName || user.displayName || 'Student',
          studentEmail: user.email,
          courseName: course.title,
          courseLink: `${window.location.origin}/courses/${course.id}/lessons/${course.lessons[0].id}`
        })
      }).catch(err => console.error('Failed to send enrollment email:', err));

      setSubscriptionModalOpen(false);
      setSelectedCourseForEnroll(null);
      
      sounds.playEnrollSuccess();
      setEnrollSuccess(true);
      setIsEnrolling(false);
      
      setTimeout(() => {
        navigate(`/courses/${course.id}/lessons/${course.lessons[0].id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      setIsEnrolling(false);
      setEnrollError(error.message || 'Failed to enroll in the course. Please try again or contact support.');
    }
  };

  const handleSubscriptionPlanSelect = async (plan: 'starter' | 'pro' | 'elite') => {
    if (!user?.uid) return;
    
    try {
      if (plan === 'starter') {
        await enrollInCourse();
      } else {
        console.log(`User selected ${plan} plan - redirecting to WhatsApp for payment`);
      }
    } catch (error) {
      console.error('Error handling plan selection:', error);
    }
  };

  const handleShareClick = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleLessonClick = async (lesson: LessonMetadata) => {
    if (!user?.uid) {
      navigate('/login', { state: { returnTo: `/courses/${courseId}/lessons/${lesson.id}` } });
      return;
    }

    if (lesson.lessonIndex === 0 || isEnrolled) {
      navigate(`/courses/${courseId}/lessons/${lesson.id}`);
    } else {
      setSelectedCourseForEnroll(course.id);
      setSubscriptionModalOpen(true);
    }
  };

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'reading': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'quiz': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'conversation': return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
      default: return 'bg-slate-800 text-slate-300 border border-slate-700/50';
    }
  };

  const estimatedTotalTime = course.lessons.reduce((total, lesson) => {
    const minutes = parseInt(String((lesson as any).duration || '30'));
    return total + (isNaN(minutes) ? 30 : minutes);
  }, 0);

  const totalLessonXP = course.lessons.reduce((total, lesson) => total + lesson.xpReward, 0);
  const progressPercent = enrollment?.progress || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500/30 pt-24 pb-20 relative overflow-hidden">
      
      {/* 🔮 DYNAMIC BACKGROUND MESH GLOW */}
      <div className={`absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.12] z-0 pointer-events-none ${theme.glowColor}`} />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* 🔙 BACK LINK */}
        <Link 
          to="/courses" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6 text-sm font-semibold group"
        >
          <LuArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Voltar para Cursos
        </Link>

        {/* 🎭 COURSE HERO BRIEFING PANEL */}
        <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800 rounded-3xl p-8 md:p-10 mb-8 backdrop-blur-md group">
          {/* Faded cover background image */}
          <div 
            className="absolute right-0 top-0 w-full md:w-2/3 h-full bg-cover bg-center opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-105" 
            style={{ backgroundImage: `url(${course.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl filter drop-shadow-md">{course.emoji}</span>
                <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${theme.badge}`}>
                  {course.tag}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700/50 rounded-md">
                  {course.level}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-1">
                {course.title}
              </h1>
              {course.titlePt && (
                <p className="text-slate-400 text-sm font-bold italic mb-3">
                  {course.titlePt}
                </p>
              )}
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                {course.descriptionPt || course.description}
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end justify-center self-stretch md:self-auto bg-slate-950/40 border border-slate-850 p-5 rounded-2xl min-w-[180px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Recompensa Total</span>
              <span className={`text-2xl font-extrabold flex items-center gap-1.5 ${theme.text}`}>
                <LuTrophy size={20} /> +{course.totalXpReward || totalLessonXP} XP
              </span>
            </div>
          </div>
        </div>

        {/* 📊 PROGRESS DRAWER (If enrolled) */}
        {isEnrolled && (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md mb-8">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Progresso do Treinamento</span>
              <span className="text-sm font-extrabold text-slate-200">{progressPercent}% completo</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800/40 overflow-hidden">
              <div 
                className={`h-full ${theme.progress} rounded-full transition-all duration-500`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* 🗺️ SPRINT COLUMNS LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 🌲 LEFT QUEST MAP PANEL */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
              
              {/* TABS HEADERS */}
              <div className="flex border-b border-slate-800/80 bg-slate-950/20">
                <button
                  onClick={() => setActiveTab('lessons')}
                  className={`flex-1 py-4 px-6 text-sm font-bold tracking-wide transition-all ${
                    activeTab === 'lessons'
                      ? `${theme.text} border-b-2 ${courseThemeKey === 'cyber-blue' ? 'border-sky-500' : courseThemeKey === 'amber' ? 'border-amber-500' : courseThemeKey === 'purple' ? 'border-purple-500' : 'border-pink-500'} bg-slate-900/20`
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Missões Práticas
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex-1 py-4 px-6 text-sm font-bold tracking-wide transition-all ${
                    activeTab === 'about'
                      ? `${theme.text} border-b-2 ${courseThemeKey === 'cyber-blue' ? 'border-sky-500' : courseThemeKey === 'amber' ? 'border-amber-500' : courseThemeKey === 'purple' ? 'border-purple-500' : 'border-pink-500'} bg-slate-900/20`
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sobre o Curso
                </button>
              </div>

              {/* TABS VIEWS */}
              {activeTab === 'lessons' && (
                <div className="p-3 sm:p-6">
                  
                  {/* VERTICAL QUEST MAP LIST */}
                  <div className="space-y-4">
                    {course.lessons.map((lesson, index) => {
                      const isLessonCompleted = Array.isArray(enrollment?.completedLessons) 
                        ? enrollment.completedLessons.includes(lesson.id) 
                        : false;
                      const isCurrent = enrollment?.activeLessonId === lesson.id || (!enrollment?.activeLessonId && index === 0);
                      const canAccess = lesson.lessonIndex === 0 || isEnrolled;
                      
                      // Node Status styling variables
                      let nodeStyle = '';
                      let numberBadge = '';

                      if (isLessonCompleted) {
                        nodeStyle = 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40';
                        numberBadge = 'bg-emerald-500/20 border-emerald-500 text-emerald-400';
                      } else if (isCurrent) {
                        nodeStyle = `${theme.pulseGlow} bg-slate-900/60`;
                        numberBadge = `${courseThemeKey === 'cyber-blue' ? 'bg-sky-500/20 border-sky-500 text-sky-400' : courseThemeKey === 'amber' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : courseThemeKey === 'purple' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-pink-500/20 border-pink-500 text-pink-400'}`;
                      } else if (canAccess) {
                        nodeStyle = 'border-slate-800 hover:border-slate-700 bg-slate-900/20';
                        numberBadge = 'bg-slate-800 border-slate-700 text-slate-400';
                      } else {
                        nodeStyle = 'border-slate-800/40 bg-slate-900/10 opacity-40 cursor-not-allowed';
                        numberBadge = 'bg-slate-900 border-slate-850 text-slate-600';
                      }

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => canAccess && handleLessonClick(lesson)}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${nodeStyle} ${canAccess ? 'cursor-pointer' : ''}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${numberBadge}`}>
                              {isLessonCompleted ? <FaCheckCircle size={14} /> : index + 1}
                            </div>
                            
                            <div>
                              <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-tight">
                                {lesson.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <LuClock size={11} /> 30 min
                                </span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${getLessonTypeColor(
                                  lesson.title.toLowerCase().includes('quiz') ? 'quiz' : 'conversation'
                                )}`}>
                                  {lesson.title.toLowerCase().includes('quiz') ? 'Quiz' : 'Conversação'}
                                </span>
                                {lesson.lessonIndex === 0 && (
                                  <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-bold uppercase">
                                    Grátis
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-4 sm:mt-0 self-end sm:self-auto shrink-0">
                            <span className="text-xs font-bold text-slate-400">+{lesson.xpReward} XP</span>
                            
                            {!canAccess ? (
                              <FaLock size={12} className="text-slate-500 mr-2" />
                            ) : isCurrent ? (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLessonClick(lesson);
                                }}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${theme.button}`}
                              >
                                <LuPlay size={11} fill="currentColor" /> Iniciar
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ABOUT TAB VIEW */}
              {activeTab === 'about' && (
                <div className="p-3 sm:p-6 space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 mb-2">Sobre este curso</h3>
                    <p className="text-slate-450 text-xs sm:text-sm leading-relaxed">{course.aboutText || course.description}</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-100 mb-2">Quem deve fazer</h3>
                    <p className="text-slate-450 text-xs sm:text-sm leading-relaxed">{course.whoThisIsFor || 'Estudantes e profissionais buscando acelerar sua conversação e destravar o inglês real.'}</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-100 mb-2">O que você aprenderá</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(course.whatYouWillLearn || ['Vocabulário prático', 'Expressões idiomáticas do dia a dia', 'Confiança sob pressão', 'Padrões de diálogo real']).map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-slate-350">
                          <FaCheckCircle className={`shrink-0 mt-0.5 ${theme.text}`} size={12} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="text-base font-bold text-slate-100 mb-3">Seu Instrutor Nativo</h3>
                    <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-slate-950 text-lg ${theme.button}`}>
                        M
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">Professor</h4>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Native speaker de Nova York. Especialista em destravar a fala de profissionais brasileiros.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 🗺️ RIGHT SIDEBAR DETAILS PANEL */}
          <div className="space-y-6">
            
            {/* STATS BOARD */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
              <h3 className="font-extrabold text-sm uppercase tracking-widest text-slate-350 mb-4 border-b border-slate-800/80 pb-2">
                Painel do Curso
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Total XP Disponível</span>
                  <span className="font-bold text-slate-200">+{course.totalXpReward || totalLessonXP} XP</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Tempo de Carga</span>
                  <span className="font-bold text-slate-200">
                    {isNaN(estimatedTotalTime) || estimatedTotalTime === 0 ? '—' : `~${Math.floor(estimatedTotalTime / 60)}h ${estimatedTotalTime % 60}min`}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Aulas Totais</span>
                  <span className="font-bold text-slate-200">{course.lessons.length} Missões</span>
                </div>
              </div>
            </div>

            {/* ENROLLMENT PROGRESS STATS */}
            {isEnrolled && (
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
                <h3 className="font-extrabold text-sm uppercase tracking-widest text-slate-350 mb-4 border-b border-slate-800/80 pb-2">
                  Seu Desempenho
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Missões Concluídas</span>
                    <span className="font-bold text-slate-200">
                      {enrollment?.lessonsCompleted || 0} / {course.lessons.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">XP Conquistado</span>
                    <span className="font-bold text-slate-200">{enrollment?.xpEarned || 0} XP</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Streak de Estudos</span>
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <LuFlame className="text-orange-500" size={13} /> {profile?.streakDays || 0} dias
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION PANELS */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
              <h3 className="font-extrabold text-sm uppercase tracking-widest text-slate-350 mb-4 border-b border-slate-800/80 pb-2">
                Ações
              </h3>
              
              <div className="space-y-3">
                {isEnrolled ? (
                  isCompleted ? (
                    <button className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider">
                      Curso Concluído! 🎉
                    </button>
                  ) : (
                    <Link 
                      to={`/courses/${courseId}/lessons/${(() => {
                        let nextLessonId = enrollment?.activeLessonId;
                        if (!nextLessonId) {
                          const completed = Array.isArray(enrollment?.completedLessons) ? enrollment.completedLessons : [];
                          const firstUncompleted = course.lessons.find(l => !completed.includes(l.id));
                          nextLessonId = firstUncompleted?.id || course.lessons[0].id;
                        }
                        return nextLessonId;
                      })()}`}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-center block transition-all ${theme.button}`}
                    >
                      Continuar Prática
                    </Link>
                  )
                ) : (
                  <button 
                    onClick={handleEnrollClick}
                    disabled={isEnrolling || enrollSuccess}
                    className={`w-full font-bold py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-wider ${
                      enrollSuccess 
                        ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-350 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                        : theme.button
                    } ${isEnrolling ? 'opacity-80 cursor-wait' : ''}`}
                  >
                    {isEnrolling ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processando...
                      </>
                    ) : enrollSuccess ? (
                      'Matriculado! 🎉'
                    ) : (
                      'Matricular-se no Curso'
                    )}
                  </button>
                )}
                
                <button 
                  onClick={handleShareClick}
                  className="w-full bg-slate-950/40 hover:bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-700 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <FaShareAlt size={12} /> {linkCopied ? 'Link Copiado!' : 'Compartilhar Curso'}
                </button>
              </div>
            </div>

            {/* ERROR POPUP PANEL */}
            {enrollError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2">
                <FaInfoCircle className="shrink-0 mt-0.5" size={14} />
                <div className="flex-1 text-xs font-semibold leading-relaxed">
                  {enrollError}
                </div>
                <button onClick={() => setEnrollError(null)} className="text-red-400 hover:text-red-200 transition-colors text-xs font-bold">
                  ✕
                </button>
              </div>
            )}

            {/* HELP CARD */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
              <h3 className="font-extrabold text-sm uppercase tracking-widest text-slate-350 mb-3">
                Dúvidas?
              </h3>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1!%20Tenho%20d%C3%BAvidas%20sobre%20o%20curso%20${encodeURIComponent(course.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-xs font-bold uppercase tracking-wider"
              >
                <FaWhatsapp size={16} /> Suporte no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => {
          setSubscriptionModalOpen(false);
          setSelectedCourseForEnroll(null);
        }}
        onPlanSelect={handleSubscriptionPlanSelect}
      />
    </div>
  );
};

export default CoursePage;
