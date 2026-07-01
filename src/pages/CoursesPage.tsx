import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useEnrollments } from '@/hooks/useEnrollments';
import { courses as baseCourses, Course } from '@/data/courses';
import { 
  LuBookOpen, 
  LuFlame, 
  LuTrophy, 
  LuBriefcase, 
  LuCompass 
} from 'react-icons/lu';
import { FaLock, FaUnlock, FaCheckCircle } from 'react-icons/fa';

// Explicit dynamic Tailwind color theme mapping matrix
const themeMatrix = {
  'cyber-blue': {
    bgGlow: 'hover:shadow-[0_0_25px_rgba(56,189,248,0.25)]',
    border: 'border-sky-500/30 hover:border-sky-400',
    text: 'text-sky-400',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    progress: 'bg-sky-500'
  },
  'amber': {
    bgGlow: 'hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]',
    border: 'border-amber-500/30 hover:border-amber-400',
    text: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    progress: 'bg-amber-500'
  },
  'purple': {
    bgGlow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
    border: 'border-purple-500/30 hover:border-purple-400',
    text: 'text-purple-400',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    progress: 'bg-purple-500'
  },
  'pink': {
    bgGlow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]',
    border: 'border-pink-500/30 hover:border-pink-400',
    text: 'text-pink-400',
    badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    progress: 'bg-pink-500'
  }
};

const getCourseTheme = (tag: string, id: string) => {
  if (tag === 'Grammar') return 'purple';
  if (['Conversation', 'Essentials', 'Travel'].includes(tag)) return 'amber';
  const technicalTags = ['Tech', 'Engineering', 'Software Developers'];
  if (technicalTags.includes(tag) || id.includes('tech') || id.includes('dev')) {
    return 'cyber-blue';
  }
  return 'pink';
};

const getCourseAudience = (course: Course) => {
  if (course.tag === 'Grammar') {
    return 'Gramática';
  }
  if (['Conversation', 'Essentials', 'Travel'].includes(course.tag)) {
    return 'Conversação';
  }
  const profTags = ['Business', 'Tech', 'Healthcare', 'Legal', 'Engineering', 'Startup', 'Marketing', 'Management', 'Automotive'];
  if (profTags.includes(course.tag) || course.id.includes('tech') || course.id.includes('dev')) {
    return 'Profissional';
  }
  return 'Cultura';
};

export default function CoursesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid || '');
  const { enrollments } = useEnrollments(user?.uid || '');
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  // Real user details calculated dynamically from firestore syncs
  const userProfile = {
    xp: profile?.xp || 0,
    streak: profile?.streakDays || 0,
    level: profile?.level || 1,
    organizationId: profile?.organizationId || null,
    plan: profile?.plan || 'free'
  };

  // Filter logic matching target category selectors
  const filteredCourses = baseCourses.filter(course => {
    const audience = getCourseAudience(course);
    if (selectedFilter === 'Todos') return true;
    return audience === selectedFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans selection:bg-sky-500/30 pt-24 pb-20 relative overflow-hidden">
      
      {/* 🔮 BACKGROUND DECORATIVE ORBS */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* 🏛️ HEADER & GLOBAL TRACK METRICS BANNER */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl backdrop-blur-md relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-sky-400 bg-clip-text text-transparent">
              Trilhas de Aprendizado
            </h1>
            {userProfile.organizationId && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                <LuBriefcase size={12} /> Tech Track Verified
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm">Escolha seu cenário e domine a conversação em tempo real.</p>
        </div>

        <div className="flex items-center gap-6 self-stretch md:self-auto justify-around bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <LuTrophy className="text-amber-400" size={20} />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nível {userProfile.level}</p>
              <p className="text-sm font-extrabold text-slate-200">{userProfile.xp} XP</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <LuFlame className="text-orange-500 animate-pulse" size={20} />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ofensiva</p>
              <p className="text-sm font-extrabold text-slate-200">{userProfile.streak} Dias</p>
            </div>
          </div>
        </div>
      </header>

      {/* 🎯 FILTER PILLS MATRIX */}
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-start gap-2.5 mb-8 relative z-10">
        {['Todos', 'Conversação', 'Gramática', 'Profissional', 'Cultura'].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
              selectedFilter === filter
                ? 'bg-blue-600 border-blue-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* 🗺️ THE GAME CARD SELECTION GRID MAP */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {filteredCourses.map((course) => {
          const themeKey = getCourseTheme(course.tag, course.id);
          const colors = themeMatrix[themeKey];
          
          const enrollment = enrollments.find(e => e.courseId === course.id);
          const lessonsCompleted = enrollment?.lessonsCompleted || 0;
          const totalLessons = course.lessons.length;
          const progressPercent = Math.round((lessonsCompleted / totalLessons) * 100) || 0;

          // Free tier locks: allows Basic English / Beginner level classes, gates intermediate / specialty
          const isLocked = userProfile.plan === 'free' && course.level !== 'Beginner' && course.id !== 'basic-english-daily-life';

          return (
            <motion.div
              key={course.id}
              onClick={() => navigate(`/courses/${course.id}`)}
              whileHover={{ y: -4 }}
              className={`group relative bg-slate-900/40 border ${colors.border} rounded-2xl p-6 transition-all duration-300 cursor-pointer backdrop-blur-sm select-none ${colors.bgGlow}`}
            >
              {/* Top Row Status Flags */}
              <div className="flex justify-between items-center mb-4">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${colors.badge}`}>
                  {course.tag}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">+{course.totalXpReward || course.lessons.reduce((acc, l) => acc + l.xpReward, 0)} XP</span>
                  {isLocked ? (
                    <FaLock size={12} className="text-slate-500" />
                  ) : (
                    <FaUnlock size={12} className="text-slate-400 opacity-40" />
                  )}
                </div>
              </div>

              {/* Course Identity Details */}
              <div className="flex items-start gap-2 mb-2">
                <span className="text-2xl filter drop-shadow-sm shrink-0">{course.emoji}</span>
                <h3 className="text-lg font-bold group-hover:text-white text-slate-100 transition-colors line-clamp-1">
                  {course.title}
                </h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-6 h-12 overflow-hidden line-clamp-2">
                {course.descriptionPt || course.description}
              </p>

              {/* Progress System Elements */}
              <div className="mt-auto pt-2 border-t border-slate-900">
                <div className="flex justify-between items-center text-[10px] mb-1.5 font-medium text-slate-400">
                  <span>Progresso</span>
                  <span>{lessonsCompleted}/{totalLessons} Lições</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/40">
                  <div 
                    className={`h-full ${colors.progress} transition-all duration-500 rounded-full`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </main>

    </div>
  );
}
