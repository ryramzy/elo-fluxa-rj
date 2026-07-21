import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../hooks/useUserProfile';
import { FaLock, FaUnlock } from 'react-icons/fa';
import type { Course } from '../../data/courses';

interface CourseCardProps {
  course: Course;
  enrollment: any;
  onEnroll: (courseId: string) => void;
  onContinue: (courseId: string) => void;
}

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

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  enrollment, 
  onEnroll, 
  onContinue 
}) => {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid || '');
  const navigate = useNavigate();
  const isEnrolled = !!enrollment;
  const lessonsCompleted = enrollment?.lessonsCompleted || 0;
  const totalLessons = course.lessons.length;
  const progressPercent = Math.round((lessonsCompleted / totalLessons) * 100) || 0;
  
  const isLocked = (profile?.plan || 'free') === 'free' && course.level !== 'Beginner' && course.id !== 'basic-english-daily-life';

  const themeKey = getCourseTheme(course.tag, course.id);
  const colors = themeMatrix[themeKey];

  const handleCardClick = () => {
    navigate(`/courses/${course.id}`);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`w-full bg-slate-900/80 border ${colors.border} rounded-2xl p-6 transition-all duration-300 cursor-pointer select-none ${colors.bgGlow} flex flex-col justify-between`}
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${colors.badge}`}>
            {course.tag}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400">
              +{course.totalXpReward || course.lessons.reduce((acc, l) => acc + l.xpReward, 0)} XP
            </span>
            {isLocked ? (
              <FaLock size={12} className="text-slate-500 animate-pulse" />
            ) : (
              <FaUnlock size={12} className="text-slate-400 opacity-40" />
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 mb-2">
          <span className="text-2xl filter drop-shadow-sm shrink-0">{course.emoji || '📚'}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-slate-100 line-clamp-1">
              {course.title}
            </h3>
            {course.titlePt && (
              <span className="block text-[10px] font-bold text-slate-400 italic mt-0.5 line-clamp-1">
                {course.titlePt}
              </span>
            )}
          </div>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed mb-6 h-12 overflow-hidden line-clamp-2">
          {course.descriptionPt || course.description}
        </p>
      </div>

      <div className="mt-auto pt-2 border-t border-slate-800">
        <div className="flex justify-between items-center text-[10px] mb-1.5 font-medium text-slate-400">
          <span>{isEnrolled ? 'Progresso' : 'Não Inscrito'}</span>
          {isEnrolled && <span>{lessonsCompleted}/{totalLessons} Lições</span>}
        </div>
        {isEnrolled ? (
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/40">
            <div 
              className={`h-full ${colors.progress} transition-all duration-500 rounded-full`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); onEnroll(course.id); }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px] transition-colors uppercase tracking-wider"
          >
            Iniciar Trilha
          </button>
        )}
      </div>
    </motion.div>
  );
};
