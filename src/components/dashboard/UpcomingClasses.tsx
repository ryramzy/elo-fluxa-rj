import React from 'react';
import type { Booking } from '../../types';
import { getWhatsAppLink } from '../../../constants';
import { trackEvent } from '../../utils/analytics';

interface UpcomingClassesProps {
  bookings: Booking[];
  onNavigateToAgenda: () => void;
}

export const UpcomingClasses: React.FC<UpcomingClassesProps> = ({ 
  bookings, 
  onNavigateToAgenda 
}) => {
  const upcomingBookings = (bookings || [])
    .filter(b => b.status === 'confirmed')
    .sort((a, b) => {
      const [yA, mA, dA] = (a.date || '').split('-').map(Number);
      const [hA, minA] = (a.time || '00:00').split(':').map(Number);
      const timeA = new Date(yA || 2026, (mA || 1) - 1, dA || 1, hA || 0, minA || 0).getTime();

      const [yB, mB, dB] = (b.date || '').split('-').map(Number);
      const [hB, minB] = (b.time || '00:00').split(':').map(Number);
      const timeB = new Date(yB || 2026, (mB || 1) - 1, dB || 1, hB || 0, minB || 0).getTime();

      return timeA - timeB;
    })
    .slice(0, 3);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Próximas Aulas</h3>
      <div className="space-y-3">
        {upcomingBookings.map((booking) => {
          let formattedDate = `${booking.date} às ${booking.time || ''}`;
          try {
            const [year, month, day] = (booking.date || '').split('-').map(Number);
            const [hour, minute] = (booking.time || '00:00').split(':').map(Number);
            const bookingDate = new Date(year, (month || 1) - 1, day, hour || 0, minute || 0);
            
            if (!isNaN(bookingDate.getTime())) {
              formattedDate = bookingDate.toLocaleDateString('pt-BR', { 
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit', 
                minute: '2-digit' 
              });
            }
          } catch (e) {
            console.error('Error formatting booking date:', e);
          }
          
          return (
            <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl gap-3 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex-1">
                <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100 capitalize">
                  {formattedDate}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                  👨‍🏫 Tutor: {booking.tutorName || 'Professor Nativo'} • {booking.duration || 60} min
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={booking.meetLink || '/classroom'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md hover:scale-105"
                  >
                    📹 Entrar na Sala ({booking.tutorName || 'Professor Matt'})
                  </a>
                  <a
                    href={getWhatsAppLink('upcomingClass', { studentName: booking.userName, date: booking.date, time: booking.time })}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('whatsapp_click_upcoming_class', { bookingId: booking.id, time: booking.time })}
                    className="inline-flex items-center gap-1.5 bg-emerald-600/15 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all hover:scale-105"
                  >
                    💬 Falar com Professor
                  </a>
                </div>
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
