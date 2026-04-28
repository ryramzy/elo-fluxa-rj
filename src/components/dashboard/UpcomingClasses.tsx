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
    .filter(b => b.status === 'confirmed' || b.status === 'booked')
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
          const bookingDate = new Date(booking.date);
          
          return (
            <div key={booking.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {bookingDate.toLocaleDateString('pt-BR', { 
                    weekday: 'short', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {booking.duration || 60} min
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                booking.status === 'confirmed' 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {booking.status === 'confirmed' ? 'Confirmada' : 'Agendada'}
              </span>
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
