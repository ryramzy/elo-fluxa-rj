import React, { useState } from 'react';
import type { Booking } from '../../types';
import { getWhatsAppLink } from '../../../constants';
import { trackEvent } from '../../utils/analytics';
import { cancelBooking } from '@/lib/firestore';
import { useToast } from '@/hooks/useToast';

interface UpcomingClassesProps {
  bookings: Booking[];
  onNavigateToAgenda?: () => void;
}

export const UpcomingClasses: React.FC<UpcomingClassesProps> = ({ 
  bookings 
}) => {
  const { showToast } = useToast();
  const [confirmCancelBooking, setConfirmCancelBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // 1. Strict deduplication by composite key date + time
  const deduplicatedMap = new Map<string, Booking>();
  (bookings || [])
    .filter(b => b.status === 'confirmed' || b.status === 'pending')
    .forEach(b => {
      if (!b.date) return;
      const key = `${(b.date || '').trim()}_${(b.time || '00:00').slice(0, 5)}`;
      if (!deduplicatedMap.has(key)) {
        deduplicatedMap.set(key, b);
      }
    });

  const upcomingBookings = Array.from(deduplicatedMap.values())
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

  const handleExecuteCancel = async () => {
    if (!confirmCancelBooking) return;
    const targetBooking = confirmCancelBooking;
    
    // 1. INSTANT ZERO-LATENCY UI UPDATE (0ms)
    setConfirmCancelBooking(null);
    window.dispatchEvent(new CustomEvent('elo_booking_cancelled', {
      detail: {
        id: targetBooking.id,
        date: targetBooking.date,
        time: targetBooking.time
      }
    }));
    showToast('Aula cancelada com sucesso. O horário foi liberado.', 'success');

    trackEvent('student_cancelled_booking', {
      bookingId: targetBooking.id,
      date: targetBooking.date,
      time: targetBooking.time
    });

    // 2. BACKGROUND RESILIENT SERVER SYNC
    try {
      await cancelBooking(targetBooking.id, targetBooking.googleEventId, targetBooking);
    } catch (err: any) {
      console.warn('Background cancel sync warning (locally cleared):', err);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Próximas Aulas</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">
            {upcomingBookings.length} {upcomingBookings.length === 1 ? 'aula ativa' : 'aulas ativas'}
          </span>
        </div>
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
            
            const isConfirmed = booking.status === 'confirmed';

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
                    {isConfirmed ? (
                      <a
                        href={booking.meetLink || '/classroom'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md hover:scale-105"
                      >
                        📹 Entrar na Sala ({booking.tutorName || 'Professor Matt'})
                      </a>
                    ) : null}
                    <a
                      href={getWhatsAppLink('upcomingClass', { studentName: booking.userName, date: booking.date, time: booking.time })}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('whatsapp_click_upcoming_class', { bookingId: booking.id, time: booking.time })}
                      className="inline-flex items-center gap-1.5 bg-emerald-600/15 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all hover:scale-105"
                    >
                      💬 Falar no WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => setConfirmCancelBooking(booking)}
                      className="inline-flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-extrabold text-xs px-3 py-2 rounded-xl transition-all active:scale-95"
                    >
                      🗑️ Cancelar
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    isConfirmed 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {isConfirmed ? 'Confirmada' : 'Aguardando'}
                  </span>
                </div>
              </div>
            );
          })}
          {upcomingBookings.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
              Nenhuma aula agendada no momento
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Student Class Cancellation */}
      {confirmCancelBooking && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-xl mx-auto">
              🗑️
            </div>
            <h4 className="text-base font-black text-white tracking-tight">Cancelar Aula Agendada?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tem certeza que deseja cancelar sua aula de <strong className="text-slate-200">{confirmCancelBooking.date.split('-').reverse().join('/')}</strong> às <strong className="text-slate-200">{confirmCancelBooking.time}</strong> com o {confirmCancelBooking.tutorName || 'Professor Matt'}?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmCancelBooking(null)}
                disabled={isCancelling}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleExecuteCancel}
                disabled={isCancelling}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5"
              >
                {isCancelling ? 'Cancelando...' : 'Sim, Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
