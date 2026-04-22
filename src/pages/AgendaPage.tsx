import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { getAvailableSlots, bookSlot, getUserBookings, cancelBooking } 
  from '../lib/firestore';
import { TimeSlot, Booking } from '../types';

const AgendaPage = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid || '');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [view, setView] = useState<'available' | 'my-bookings'>('available');
  const [notes, setNotes] = useState('');

  // Get start of current week
  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [available, userBookings] = await Promise.all([
          getAvailableSlots(getWeekStart()),
          user?.uid ? getUserBookings(user.uid) : [],
        ]);
        setSlots(available);
        setMyBookings(userBookings);
      } catch (err) {
        console.error('Error loading agenda:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  const handleBook = async () => {
    if (!selectedSlot || !user) return;
    setBooking(true);
    try {
      await bookSlot(
        selectedSlot.id,
        user.uid,
        profile?.displayName || user.displayName || 'Aluno',
        user.email || '',
        notes
      );
      // Refresh
      setSlots(prev => prev.filter(s => s.id !== selectedSlot.id));
      setSelectedSlot(null);
      setNotes('');
      // Reload bookings
      const updated = await getUserBookings(user.uid);
      setMyBookings(updated);
    } catch (err) {
      console.error('Booking error:', err);
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (booking: Booking) => {
    if (!user || !window.confirm('Tem certeza que deseja cancelar esta aula?')) {
      return;
    }
    
    try {
      await cancelBooking(booking.id, booking.slotId);
      // Reload bookings
      const updated = await getUserBookings(user.uid);
      setMyBookings(updated);
    } catch (err) {
      console.error('Cancellation error:', err);
      alert('Erro ao cancelar aula. Tente novamente.');
    }
  };

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 
                    pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 
                         dark:text-white mb-2">
            Agenda
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Agende sua aula de conversação com Matt
          </p>
        </div>

        {/* Toggle */}
        <div className="flex gap-2 mb-8">
          {(['available', 'my-bookings'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-5 py-2 rounded-full text-sm font-medium 
                         transition-colors ${
                view === v
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 \
                     dark:text-slate-300 border border-slate-200 \
                     dark:border-slate-700'
              }`}
            >
              {v === 'available' ? 'Horários disponíveis' 
                                 : `Minhas aulas (${myBookings.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            Carregando...
          </div>
        ) : view === 'available' ? (
          <>
            {Object.keys(slotsByDate).length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-500 dark:text-slate-400 mb-2">
                  Nenhum horário disponível esta semana
                </p>
                <p className="text-sm text-slate-400">
                  Fale com Matt no WhatsApp para agendar
                </p>
              </div>
            ) : (
              Object.entries(slotsByDate).map(([date, daySlots]) => (
                <div key={date} className="mb-8">
                  <h3 className="text-sm font-semibold uppercase 
                                 tracking-widest text-slate-400 
                                 dark:text-slate-500 mb-3">
                    {formatDate(date)}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 
                                  md:grid-cols-4 gap-3">
                    {daySlots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-4 rounded-xl border text-left 
                                   transition-all ${
                          selectedSlot?.id === slot.id
                            ? 'border-blue-500 bg-blue-50 \
                               dark:bg-blue-950'
                            : 'border-slate-200 dark:border-slate-700 \
                               bg-white dark:bg-slate-800 \
                               hover:border-blue-300'
                        }`}
                      >
                        <div className="font-semibold text-slate-900 
                                        dark:text-white text-lg">
                          {slot.time}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {slot.duration} min
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* Booking panel */}
            {selectedSlot && (
              <div className="fixed bottom-0 left-0 right-0 
                             bg-white dark:bg-slate-900 border-t 
                             border-slate-200 dark:border-slate-700 
                             p-6 shadow-2xl z-50">
                <div className="max-w-4xl mx-auto">
                  <p className="font-semibold text-slate-900 
                                dark:text-white mb-3">
                    {formatDate(selectedSlot.date)} às {selectedSlot.time}
                    <span className="text-slate-400 font-normal ml-2">
                      ({selectedSlot.duration} min)
                    </span>
                  </p>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Algum tema ou dúvida específica? (opcional)"
                    className="w-full p-3 rounded-lg border 
                               border-slate-200 dark:border-slate-700 
                               bg-slate-50 dark:bg-slate-800 
                               text-slate-900 dark:text-white 
                               text-sm mb-4 resize-none"
                    rows={2}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedSlot(null)}
                      className="flex-1 py-3 rounded-lg border 
                                 border-slate-200 dark:border-slate-700 
                                 text-slate-600 dark:text-slate-300 
                                 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleBook}
                      disabled={booking}
                      className="flex-1 py-3 rounded-lg bg-green-500 
                                 hover:bg-green-600 text-white 
                                 font-medium transition-colors 
                                 disabled:opacity-50"
                    >
                      {booking ? 'Agendando...' : 'Confirmar aula'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* My Bookings view */
          <div className="space-y-4">
            {myBookings.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                Você ainda não tem aulas agendadas
              </div>
            ) : (
              myBookings.map(booking => (
                <div key={booking.id}
                  className="bg-white dark:bg-slate-800 rounded-xl 
                             border border-slate-200 
                             dark:border-slate-700 p-5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-900 
                                    dark:text-white">
                        {formatDate(booking.date)} às {booking.time}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {booking.duration} min · Professor Matt
                      </p>
                      {/* Google Meet link placeholder */}
                      {booking.meetLink ? (
                        <a href={booking.meetLink} target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 
                                     hover:underline mt-2 block"
                        >
                          Entrar no Google Meet →
                        </a>
                      ) : (
                        <p className="text-xs text-slate-400 mt-2">
                          Link da aula em breve
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs 
                                       font-medium bg-green-100 
                                       text-green-700 dark:bg-green-900 
                                       dark:text-green-300">
                        Confirmada
                      </span>
                      <button
                        onClick={() => handleCancel(booking)}
                        className="px-3 py-1 rounded-full text-xs 
                                         font-medium bg-red-100 
                                         text-red-700 dark:bg-red-900 
                                         dark:text-red-300 hover:bg-red-200 
                                         dark:hover:bg-red-800 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                  {booking.notes && (
                    <p className="text-sm text-slate-500 
                                  dark:text-slate-400 mt-3 
                                  border-t border-slate-100 
                                  dark:border-slate-700 pt-3">
                      {booking.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaPage;
