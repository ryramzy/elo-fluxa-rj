import React from 'react';
import type { Booking } from '../../types';

interface UpcomingClassesProps {
  bookings: Booking[];
  onNavigateToAgenda: () => void;
}

export const UpcomingClasses: React.FC<UpcomingClassesProps> = ({ 
  bookings, 
  onNavigateToAgenda 
}) => {
  const upcomingBookings = bookings
    .filter(b => b.status === 'confirmed')
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Próximas Aulas</h3>
      <div className="space-y-3">
        {upcomingBookings.map((booking) => {
          const bookingDate = booking.datetime?.toDate 
            ? booking.datetime.toDate() 
            : new Date(`${booking.date}T${booking.time || '00:00'}:00-03:00`);
          
          return (
            <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl gap-3 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex-1">
                <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {bookingDate.toLocaleDateString('pt-BR', { 
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                  👨‍🏫 Tutor: {booking.tutorName || 'Matt Ramsay'} • {booking.duration || 60} min
                </div>
                <a
                  href={booking.meetLink || `/video-call/${booking.id}`}
                  target={booking.meetLink ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg transition-all shadow-[0_2px_8px_rgba(16,185,129,0.2)] hover:shadow-lg"
                >
                  🎥 Entrar na Aula com Matt
                </a>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                  booking.status === 'confirmed' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {booking.status === 'confirmed' ? 'Confirmada' : 'Agendada'}
                </span>
              </div>
            </div>
          );
        })}
        {upcomingBookings.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Nenhuma aula agendada
          </div>
        )}
      </div>
      <button
        onClick={onNavigateToAgenda}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
      >
        Agendar agora
      </button>
    </div>
  );
};
