import React from 'react';
import { Booking } from '../types';
import { FaGraduationCap, FaComments, FaLightbulb, FaBookOpen } from 'react-icons/fa';

interface TutorNotesWidgetProps {
  bookings: Booking[];
}

export const TutorNotesWidget: React.FC<TutorNotesWidgetProps> = ({ bookings }) => {
  if (!bookings || bookings.length === 0) return null;

  // Filter for confirmed bookings with tutorNotes
  const bookingsWithNotes = bookings.filter(
    (b) => b.status === 'confirmed' && b.tutorNotes && b.tutorNotes.submittedAt
  );

  if (bookingsWithNotes.length === 0) return null;

  // Sort by date and time descending to find the most recent one
  const sortedBookings = [...bookingsWithNotes].sort((a, b) => {
    const dateTimeA = `${a.date}T${a.time}`;
    const dateTimeB = `${b.date}T${b.time}`;
    return dateTimeB.localeCompare(dateTimeA);
  });

  const latestBooking = sortedBookings[0];
  const notes = latestBooking.tutorNotes!;

  // Format date to DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="mb-8 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden relative p-6 sm:p-8">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <FaGraduationCap size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-serif">
                Feedback de Conversação
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enviado por Professor após sua última aula
              </p>
            </div>
          </div>
          <div className="self-start sm:self-center px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-bold rounded-lg uppercase tracking-wider">
            Aula de {formatDate(latestBooking.date)} às {latestBooking.time}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pronunciation */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-slate-800 transition-colors">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <FaComments className="text-blue-400" size={14} />
              Pronúncia & Articulação 🗣️
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-wrap">
              {notes.pronunciation || 'Nenhuma nota de pronúncia registrada.'}
            </p>
          </div>

          {/* Vocabulary */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-slate-800 transition-colors">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <FaBookOpen className="text-emerald-400" size={14} />
              Novos Vocabulários 🧠
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-wrap">
              {notes.vocabulary || 'Nenhum novo vocabulário registrado.'}
            </p>
          </div>

          {/* Homework / Next Steps */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-slate-800 transition-colors">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <FaLightbulb className="text-amber-400" size={14} />
              Tarefa & Próximos Passos 📝
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-wrap">
              {notes.homework || 'Nenhum próximo passo registrado.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
