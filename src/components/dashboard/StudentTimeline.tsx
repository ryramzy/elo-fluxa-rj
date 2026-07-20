import React from 'react';
import { FaCheckCircle, FaCircle, FaStar, FaArrowRight, FaBookOpen } from 'react-icons/fa';

interface Booking {
  id: string;
  date: string;
  time: string;
  status?: string;
  datetime?: any;
  tutorNotes?: {
    pronunciation?: string;
    vocabulary?: string;
    homework?: string;
    summary?: string;
    studentRating?: number;
    nextGoal?: string;
    attendance?: 'present' | 'absent';
    submittedAt?: any;
  };
}

interface StudentTimelineProps {
  bookings: Booking[];
  xp: number;
  onBookNextLesson: () => void;
}

export const StudentTimeline: React.FC<StudentTimelineProps> = ({ bookings, xp, onBookNextLesson }) => {
  // 1. Check if they have an upcoming confirmed lesson
  const hasUpcoming = bookings.some(b => {
    const dateLimit = b.datetime?.seconds 
      ? b.datetime.seconds * 1000 
      : new Date(`${b.date}T${b.time || '00:00'}:00-03:00`).getTime();
    return dateLimit > Date.now() && b.status === 'confirmed';
  });

  // 2. Check if they have at least one completed lesson
  const hasCompleted = bookings.some(b => {
    const dateLimit = b.datetime?.seconds 
      ? b.datetime.seconds * 1000 
      : new Date(`${b.date}T${b.time || '00:00'}:00-03:00`).getTime();
    return dateLimit <= Date.now() && (b.status === 'confirmed' || b.status === 'completed');
  });

  // 3. Check if notes are available on any past class
  const pastBookings = bookings.filter(b => {
    const dateLimit = b.datetime?.seconds 
      ? b.datetime.seconds * 1000 
      : new Date(`${b.date}T${b.time || '00:00'}:00-03:00`).getTime();
    return dateLimit <= Date.now();
  });
  
  const latestPastWithNotes = pastBookings
    .filter(b => b.tutorNotes && b.tutorNotes.summary)
    .sort((a, b) => {
      const timeA = a.datetime?.seconds ? a.datetime.seconds * 1000 : new Date(a.date).getTime();
      const timeB = b.datetime?.seconds ? b.datetime.seconds * 1000 : new Date(b.date).getTime();
      return timeB - timeA; // Latest first
    })[0];

  const hasNotes = !!latestPastWithNotes;

  // 4. Check if homework is assigned
  const hasHomework = hasNotes && !!latestPastWithNotes.tutorNotes?.homework;

  // 5. XP Earned check
  const hasXp = xp > 0;

  const steps = [
    {
      id: 1,
      title: 'Aula Agendada 🗓️',
      description: hasUpcoming ? 'Sua próxima aula está confirmada.' : 'Agende uma aula particular para começar.',
      completed: hasUpcoming,
    },
    {
      id: 2,
      title: 'Aula Concluída ✅',
      description: hasCompleted ? 'Parabéns por concluir sua aula!' : 'Participe da aula ao vivo com o professor.',
      completed: hasCompleted,
    },
    {
      id: 3,
      title: 'Feedback Disponível 📝',
      description: hasNotes 
        ? `Resumo: "${latestPastWithNotes.tutorNotes?.summary?.substring(0, 50)}..."` 
        : 'O professor disponibilizará feedback após a aula.',
      completed: hasNotes,
    },
    {
      id: 4,
      title: 'Tarefa de Casa 🏠',
      description: hasHomework 
        ? `Tarefa: "${latestPastWithNotes.tutorNotes?.homework?.substring(0, 50)}..."` 
        : 'Revise os conteúdos e faça a tarefa de casa.',
      completed: hasHomework,
    },
    {
      id: 5,
      title: 'XP Conquistado ⚡️',
      description: hasXp ? `Você já acumulou ${xp} XP no seu perfil!` : 'Ganhe pontos praticando nos cursos ou concluindo aulas.',
      completed: hasXp,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-750 p-6 shadow-sm">
      <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-6 pb-2 border-b border-gray-50 dark:border-slate-700/50">
        Seu Progresso & Próximos Passos
      </h3>

      <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-700 space-y-6">
        {steps.map((step, idx) => (
          <div key={step.id} className="relative group">
            {/* Step Icon */}
            <div className="absolute -left-[33px] top-0.5 bg-white dark:bg-slate-800 rounded-full p-0.5">
              {step.completed ? (
                <FaCheckCircle className="text-emerald-500 text-lg shadow-sm" />
              ) : (
                <FaCircle className="text-slate-200 dark:text-slate-600 text-sm m-[2px]" />
              )}
            </div>

            {/* Step Content */}
            <div>
              <h4 className={`text-xs font-extrabold uppercase tracking-wide ${step.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                {step.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Book Next Lesson Loop CTA */}
      <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avançar no Inglês</p>
          <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">Pratique regularmente para manter a fluência!</h4>
        </div>
        <button
          onClick={onBookNextLesson}
          className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 transition-all"
        >
          <FaBookOpen size={11} />
          Agendar Nova Aula
          <FaArrowRight size={10} />
        </button>
      </div>
    </div>
  );
};
