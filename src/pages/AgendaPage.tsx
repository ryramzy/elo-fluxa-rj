import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { 
  getAvailableSlots, 
  bookSlot, 
  getUserBookings, 
  cancelBooking 
} from '../lib/firestore';
import type { TimeSlot, Booking } from '../types';

const AgendaPage = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid || '');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [view, setView] = useState<'available' | 'my-bookings'>('available');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] 
    = useState<Booking | null>(null);

  // Week navigation
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekRange = (offset: number) => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) 
      + offset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      from: monday.toISOString().split('T')[0],
      to: sunday.toISOString().split('T')[0],
      label: monday.toLocaleDateString('pt-BR', { 
        day: 'numeric', month: 'long' 
      }) + ' – ' + sunday.toLocaleDateString('pt-BR', { 
        day: 'numeric', month: 'long' 
      }),
    };
  };

  const loadData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const { from, to } = getWeekRange(weekOffset);
      const [available, userBookings] = await Promise.all([
        getAvailableSlots(from, to),
        getUserBookings(user.uid),
      ]);
      setSlots(available);
      setMyBookings(userBookings);
    } catch (err) {
      console.error('Error loading agenda:', err);
      setError('Erro ao carregar horários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user?.uid, weekOffset]);

  const handleBook = async () => {
    if (!selectedSlot || !user) return;
    setBooking(true);
    setError(null);
    try {
      const bookingId = await bookSlot(
        selectedSlot.id,
        user.uid,
        profile?.displayName || user.displayName || 'Aluno',
        user.email || '',
        notes
      );

      // Trigger Google Calendar + email via API
      await fetch('/api/calendar/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          slotId: selectedSlot.id,
          date: selectedSlot.date,
          time: selectedSlot.time,
          durationMinutes: selectedSlot.duration || 60,
          attendeeName: profile?.displayName 
            || user.displayName || 'Aluno',
          attendeeEmail: user.email,
        }),
      });

      setSlots(prev => prev.filter(s => s.id !== selectedSlot.id));
      setSelectedSlot(null);
      setNotes('');
      await loadData();
    } catch (err: any) {
      if (err.message === 'SLOT_UNAVAILABLE') {
        setError('Este horário acabou de ser reservado. Escolha outro.');
        setSelectedSlot(null);
        await loadData();
      } else {
        setError('Erro ao agendar. Tente novamente.');
      }
    } finally {
      setBooking(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!showCancelConfirm || !user) return;
    const b = showCancelConfirm;
    setCancelling(b.id);
    setShowCancelConfirm(null);
    try {
      await cancelBooking(b.id, b.slotId, b.googleEventId);
      await loadData();
    } catch {
      setError('Erro ao cancelar. Tente novamente.');
    } finally {
      setCancelling(null);
    }
  };

  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });

  const upcomingBookings = myBookings.filter(
    b => b.status === 'confirmed' && b.date >= 
      new Date().toISOString().split('T')[0]
  );
  const pastBookings = myBookings.filter(
    b => b.status === 'completed' || 
      b.date < new Date().toISOString().split('T')[0]
  );

  const { label: weekLabel } = getWeekRange(weekOffset);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 
                    pt-24 pb-32 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 
                         dark:text-white mb-1">
            Agenda
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Agende sua aula de conversação com Matt
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 
                          dark:bg-red-950 border border-red-200 
                          dark:border-red-800 text-red-700 
                          dark:text-red-300 text-sm flex 
                          justify-between items-center">
            {error}
            <button onClick={() => setError(null)} 
              className="ml-4 text-red-400 hover:text-red-600">
              ✕
            </button>
          </div>
        )}

        {/* View toggle */}
        <div className="flex gap-2 mb-8 bg-white dark:bg-slate-800 
                        p-1 rounded-xl border border-slate-200 
                        dark:border-slate-700 w-fit">
          {(['available', 'my-bookings'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-5 py-2 rounded-lg text-sm font-medium 
                         transition-all ${
                view === v
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 \
                     hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {v === 'available' 
                ? 'Horários disponíveis'
                : `Minhas aulas ${upcomingBookings.length > 0 
                    ? `(${upcomingBookings.length})` : ''}`}
            </button>
          ))}
        </div>

        {loading ? (
          // Skeleton
          <div className="space-y-6">
            {[1,2].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 
                               rounded w-32 mb-3"/>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {[1,2,3,4].map(j => (
                    <div key={j} className="h-20 bg-slate-200 
                                           dark:bg-slate-700 rounded-xl"/>
                  ))}
                </div>
              </div>
            ))}
          </div>

        ) : view === 'available' ? (
          <>
            {/* Week navigator */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setWeekOffset(w => w - 1)}
                disabled={weekOffset <= 0}
                className="p-2 rounded-lg border border-slate-200 
                           dark:border-slate-700 text-slate-600 
                           dark:text-slate-300 disabled:opacity-30 
                           hover:bg-slate-100 dark:hover:bg-slate-800 
                           transition-colors"
              >
                ←
              </button>
              <span className="text-sm font-medium text-slate-700 
                               dark:text-slate-300 capitalize">
                {weekLabel}
              </span>
              <button
                onClick={() => setWeekOffset(w => w + 1)}
                className="p-2 rounded-lg border border-slate-200 
                           dark:border-slate-700 text-slate-600 
                           dark:text-slate-300 hover:bg-slate-100 
                           dark:hover:bg-slate-800 transition-colors"
              >
                →
              </button>
            </div>

            {Object.keys(slotsByDate).length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="text-4xl">📅</div>
                <p className="text-slate-600 dark:text-slate-400 
                               font-medium">
                  Nenhum horário disponível esta semana
                </p>
                <p className="text-sm text-slate-400">
                  Tente a próxima semana ou fale com Matt
                </p>
                <a 
                  href={`https://wa.me/5521999999999?text=Olá Matt! Quero agendar uma aula.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 
                             bg-green-500 hover:bg-green-600 
                             text-white px-6 py-3 rounded-xl 
                             font-medium transition-colors text-sm"
                >
                  Falar com Matt no WhatsApp
                </a>
              </div>
            ) : (
              Object.entries(slotsByDate).map(([date, daySlots]) => (
                <div key={date} className="mb-8">
                  <h3 className="text-xs font-bold uppercase 
                                 tracking-widest text-slate-400 
                                 dark:text-slate-500 mb-3 capitalize">
                    {formatDate(date)}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 
                                  md:grid-cols-4 gap-3">
                    {daySlots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(
                          selectedSlot?.id === slot.id ? null : slot
                        )}
                        className={`p-4 rounded-xl border text-left 
                                   transition-all hover:scale-[1.02] ${
                          selectedSlot?.id === slot.id
                            ? 'border-blue-500 bg-blue-50 \
                               dark:bg-blue-950 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-700 \
                               bg-white dark:bg-slate-800 \
                               hover:border-blue-300 \
                               hover:shadow-sm'
                        }`}
                      >
                        <div className="font-bold text-slate-900 
                                        dark:text-white text-xl">
                          {slot.time}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {slot.duration || 60} min
                        </div>
                        {selectedSlot?.id === slot.id && (
                          <div className="text-xs text-blue-600 
                                          dark:text-blue-400 mt-2 
                                          font-medium">
                            Selecionado ✓
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>

        ) : (
          /* My Bookings */
          <div className="space-y-6">
            {upcomingBookings.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase 
                               tracking-widest text-slate-400 mb-3">
                  Próximas aulas
                </h3>
                <div className="space-y-3">
                  {upcomingBookings.map(b => (
                    <div key={b.id}
                      className="bg-white dark:bg-slate-800 
                                 rounded-xl border border-slate-200 
                                 dark:border-slate-700 p-5 
                                 transition-all hover:shadow-sm"
                    >
                      <div className="flex justify-between 
                                      items-start gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 
                                        dark:text-white capitalize">
                            {formatDate(b.date)}
                          </p>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {b.time} · {b.duration || 60} min 
                            · Professor Matt
                          </p>
                          {b.meetLink ? (
                            <a href={b.meetLink} target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 
                                         text-sm text-blue-600 
                                         dark:text-blue-400 
                                         hover:underline mt-2 
                                         font-medium"
                            >
                              Entrar no Google Meet →
                            </a>
                          ) : (
                            <p className="text-xs text-slate-400 mt-2">
                              Link chegará em breve
                            </p>
                          )}
                          {b.notes && (
                            <p className="text-xs text-slate-400 
                                          mt-2 italic">
                              "{b.notes}"
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-3 py-1 rounded-full 
                                           text-xs font-medium 
                                           bg-green-100 text-green-700 
                                           dark:bg-green-900/40 
                                           dark:text-green-300 
                                           whitespace-nowrap">
                            Confirmada
                          </span>
                          <button
                            onClick={() => setShowCancelConfirm(b)}
                            disabled={cancelling === b.id}
                            className="text-xs text-slate-400 
                                       hover:text-red-500 
                                       transition-colors 
                                       disabled:opacity-50"
                          >
                            {cancelling === b.id 
                              ? 'Cancelando...' : 'Cancelar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase 
                               tracking-widest text-slate-400 mb-3">
                  Histórico
                </h3>
                <div className="space-y-3 opacity-60">
                  {pastBookings.map(b => (
                    <div key={b.id}
                      className="bg-white dark:bg-slate-800 
                                 rounded-xl border border-slate-200 
                                 dark:border-slate-700 p-4"
                    >
                      <p className="font-medium text-slate-700 
                                    dark:text-slate-300 capitalize 
                                    text-sm">
                        {formatDate(b.date)} às {b.time}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {b.duration || 60} min · Concluída
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myBookings.length === 0 && (
              <div className="text-center py-20 space-y-3">
                <div className="text-4xl">🎯</div>
                <p className="text-slate-600 dark:text-slate-400 
                               font-medium">
                  Nenhuma aula agendada ainda
                </p>
                <button
                  onClick={() => setView('available')}
                  className="bg-blue-600 hover:bg-blue-700 text-white 
                             px-6 py-3 rounded-xl font-medium 
                             transition-colors text-sm"
                >
                  Ver horários disponíveis
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking bottom sheet */}
      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 z-50
                       bg-white dark:bg-slate-900 border-t 
                       border-slate-200 dark:border-slate-700 
                       shadow-2xl">
          <div className="max-w-3xl mx-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-slate-900 
                              dark:text-white text-lg capitalize">
                  {formatDate(selectedSlot.date)}
                </p>
                <p className="text-slate-500 text-sm">
                  {selectedSlot.time} · {selectedSlot.duration || 60} min
                  · Professor Matt
                </p>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="text-slate-400 hover:text-slate-600 
                           dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Tema ou dúvida para a aula? (opcional)"
              className="w-full p-3 rounded-xl border 
                         border-slate-200 dark:border-slate-700 
                         bg-slate-50 dark:bg-slate-800 
                         text-slate-900 dark:text-white text-sm 
                         mb-4 resize-none focus:outline-none 
                         focus:ring-2 focus:ring-blue-500/20 
                         focus:border-blue-400"
              rows={2}
            />
            <button
              onClick={handleBook}
              disabled={booking}
              className="w-full py-4 rounded-xl bg-green-500 
                         hover:bg-green-600 active:scale-[0.99]
                         text-white font-bold transition-all 
                         disabled:opacity-50 text-base"
            >
              {booking ? 'Agendando...' : 'Confirmar aula ✓'}
            </button>
          </div>
        </div>
      )}

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center 
                        justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl 
                          p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-slate-900 dark:text-white 
                           text-lg mb-2">
              Cancelar aula?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 
                          text-sm mb-6">
              {formatDate(showCancelConfirm.date)} às{' '}
              {showCancelConfirm.time}. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(null)}
                className="flex-1 py-3 rounded-xl border 
                           border-slate-200 dark:border-slate-700 
                           text-slate-600 dark:text-slate-300 
                           font-medium hover:bg-slate-50 
                           dark:hover:bg-slate-700 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleCancelConfirm}
                className="flex-1 py-3 rounded-xl bg-red-500 
                           hover:bg-red-600 text-white font-medium 
                           transition-colors"
              >
                Sim, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaPage;
