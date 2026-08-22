import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getLevelName } from '../../utils/xpUtils';
import type { Booking } from '../../types';

interface KpiCardsProps {
  bookings: Booking[];
  enrollments: any[];
  profile: any;
  weeklyBookingsCount: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ 
  bookings, 
  enrollments, 
  profile, 
  weeklyBookingsCount 
}) => {
  const navigate = useNavigate();

  // Find the next active confirmed booking
  const getNextBooking = () => {
    const now = new Date();
    return bookings.find(b => {
      if (b.status !== 'confirmed') return false;
      const bDate = new Date(`${b.date}T${b.time}:00-03:00`);
      return bDate >= now;
    });
  };

  const nextBooking = getNextBooking();

  const getNextBookingText = (booking: Booking) => {
    try {
      const dateParts = booking.date.split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1;
      const day = parseInt(dateParts[2]);
      const timeParts = booking.time.split(':');
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);
      
      const dateObj = new Date(year, month, day, hours, minutes);
      return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return `${booking.date} às ${booking.time}`;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
      {/* Weekly Bookings Card */}
      <div className="bg-blue-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-blue-200 dark:border-blue-900/50 hover:shadow-lg transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 mb-0.5 sm:mb-1 font-medium">Aulas na semana</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-800 dark:text-blue-200">{weeklyBookingsCount}</p>
            <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-500 mt-0.5 sm:mt-1 hidden sm:block">Prática semanal ativa</p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/35 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-blue-600 dark:text-blue-400 text-base sm:text-xl font-bold">📅</span>
          </div>
        </div>
      </div>

      {/* Active Courses Card */}
      <div className="bg-green-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-green-200 dark:border-green-900/50 hover:shadow-lg transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs sm:text-sm text-green-700 dark:text-green-400 mb-0.5 sm:mb-1 font-medium">Meus Cursos</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-green-200">{enrollments.length}</p>
            <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-500 mt-0.5 sm:mt-1 hidden sm:block">Cursos em andamento</p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/35 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-green-600 dark:text-green-400 text-base sm:text-xl font-bold">🎓</span>
          </div>
        </div>
      </div>

      {/* Next Class Card */}
      <div className="bg-purple-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-purple-200 dark:border-purple-900/50 hover:shadow-lg transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-1">
            <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400 mb-0.5 sm:mb-1 font-medium">Próxima aula</p>
            <p className="text-sm sm:text-lg font-bold text-purple-800 dark:text-purple-200 truncate">
              {nextBooking ? getNextBookingText(nextBooking) : 'Nenhuma'}
            </p>
            {nextBooking ? (
              <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-500 mt-0.5 sm:mt-1 hidden sm:block">
                {nextBooking.meetLink ? 'Link do Meet disponível' : 'Aula agendada'}
              </p>
            ) : (
              <button 
                onClick={() => navigate('/dashboard', { state: { tab: 'booking' } })}
                className="text-[11px] sm:text-xs text-purple-600 dark:text-purple-400 hover:underline mt-0.5 sm:mt-1 block font-medium"
              >
                Agendar agora →
              </button>
            )}
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/35 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-purple-600 dark:text-purple-400 text-base sm:text-xl font-bold">⏰</span>
          </div>
        </div>
      </div>

      {/* Level Card */}
      <div className="bg-amber-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 hover:shadow-lg transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 mb-0.5 sm:mb-1 font-medium">Meu nível</p>
            <p className="text-lg sm:text-2xl font-bold text-amber-800 dark:text-amber-200">{getLevelName(profile?.level || 1)}</p>
            <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-500 mt-0.5 sm:mt-1">{profile?.xp || 0} XP total</p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-900/35 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-amber-600 dark:text-amber-400 text-base sm:text-xl font-bold">🏆</span>
          </div>
        </div>
      </div>
    </div>
  );
};

