import React from 'react';
import { getXPProgress } from '../../utils/xpUtils';
import { courses } from '../../data/courses';
import { FaTimes, FaFire, FaTrophy, FaCalendarAlt, FaUserGraduate, FaComments, FaHeadphones, FaExternalLinkAlt } from 'react-icons/fa';

interface StudentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  streak: number;
  bookings?: any[];
}

export const StudentProgressModal: React.FC<StudentProgressModalProps> = ({
  isOpen,
  onClose,
  profile,
  streak,
  bookings = []
}) => {
  if (!isOpen) return null;

  const xpProgress = getXPProgress(profile);
  const userLevel = profile?.level || 1;
  const levelName = profile?.levelName || 'Iniciante';
  const badgesEarned = profile?.badgesEarned || [];
  
  // Find latest booking with tutor feedback
  const completedBookingWithFeedback = (bookings || [])
    .filter(b => b.tutorNotes && (b.tutorNotes.summary || b.tutorNotes.pronunciation || b.tutorNotes.homework))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))[0];

  const totalClassesCompleted = (bookings || []).filter(b => b.status === 'confirmed' || b.tutorNotes).length;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 p-2 rounded-full transition-colors"
          aria-label="Fechar"
        >
          <FaTimes size={16} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="relative shrink-0">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile?.displayName || 'Estudante'}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-md">
                {profile?.displayName?.charAt(0) || 'E'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                Nível {userLevel} • {levelName}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                <FaFire size={10} /> {streak} {streak === 1 ? 'dia' : 'dias'}
              </span>
            </div>
            <h3 className="text-lg font-black text-white truncate mt-1">
              {profile?.displayName || 'Estudante ELO!'}
            </h3>
            <p className="text-xs text-slate-400 truncate">
              Meta: <strong className="text-sky-300 font-semibold">{profile?.targetGoal || 'Conversação e fluência'}</strong>
            </p>
          </div>
        </div>

        {/* XP & Level Progression Card */}
        <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-300 flex items-center gap-1.5">
              <FaTrophy className="text-amber-400" /> Progresso de XP
            </span>
            <span className="text-blue-400 font-mono">
              {xpProgress.current} / {xpProgress.total} XP
            </span>
          </div>
          
          <div className="w-full bg-slate-800 rounded-full h-3.5 mb-2 p-0.5 border border-slate-700/50">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-700 shadow-sm"
              style={{ width: `${Math.max(5, xpProgress.percentage)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Faltam <strong className="text-white font-mono">{Math.max(0, xpProgress.total - xpProgress.current)} XP</strong> para o Nível {userLevel + 1}</span>
            <span className="text-emerald-400 font-bold">{Math.round(xpProgress.percentage)}% concluído</span>
          </div>
        </div>

        {/* 4 Fluency & Activity Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <FaComments size={18} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Aulas 1:1</span>
              <span className="text-base font-black text-white">{totalClassesCompleted} {totalClassesCompleted === 1 ? 'aula' : 'aulas'}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FaTrophy size={18} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Emblemas</span>
              <span className="text-base font-black text-white">{badgesEarned.length} / {courses.length}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <FaHeadphones size={18} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pronúncia</span>
              <span className="text-base font-black text-purple-300">Em Evolução 🎯</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <FaFire size={18} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Ritmo Semanal</span>
              <span className="text-base font-black text-amber-300">{streak > 0 ? 'Consistente 🔥' : 'Iniciando 🚀'}</span>
            </div>
          </div>
        </div>

        {/* Latest Teacher Feedback Snippet */}
        {completedBookingWithFeedback ? (
          <div className="bg-gradient-to-br from-slate-950 to-indigo-950/30 border border-indigo-900/40 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <span>📝</span> Último Feedback do Professor Matt
              </span>
              <span className="text-[10px] text-slate-400">
                {completedBookingWithFeedback.date?.split('-').reverse().join('/')}
              </span>
            </div>

            {completedBookingWithFeedback.tutorNotes.pronunciation && (
              <div className="text-xs text-slate-300 mb-2 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">🗣️ Dica de Pronúncia:</strong>
                {completedBookingWithFeedback.tutorNotes.pronunciation}
              </div>
            )}

            {completedBookingWithFeedback.tutorNotes.homework && (
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">📝 Tarefa Recomendada:</strong>
                {completedBookingWithFeedback.tutorNotes.homework}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 mb-6 text-center text-xs text-slate-400">
            <span>📚 Conclua aulas particulares no Zoom para receber correções de pronúncia e notas personalizadas aqui.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href="/agenda"
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-center"
          >
            <FaCalendarAlt size={14} /> Agendar Próxima Aula
          </a>
          
          <a
            href="/profile"
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-center"
          >
            <FaUserGraduate size={14} /> Ver Perfil Completo <FaExternalLinkAlt size={11} />
          </a>
        </div>
      </div>
    </div>
  );
};
