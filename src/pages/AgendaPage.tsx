import { useState } from 'react';
import { useBooking } from '../hooks/useBooking';
import { BookingCalendar } from '../components/booking/BookingCalendar';
import { BookingForm } from '../components/booking/BookingForm';
import { BookingSuccess } from '../components/booking/BookingSuccess';
import type { TimeSlot, Booking } from '../types';

const AgendaPage = () => {
  const {
    slots,
    loading,
    booking,
    error,
    weekOffset,
    setWeekOffset,
    setError,
    getWeekRange,
    handleBook,
    handleCancel,
    formatDate,
    upcomingBookings,
    pastBookings,
  } = useBooking();

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [view, setView] = useState<'available' | 'my-bookings'>('available');
  const [showCancelConfirm, setShowCancelConfirm] = useState<Booking | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { label: weekLabel } = getWeekRange(weekOffset);

  const handleBookSlot = async () => {
    if (!selectedSlot) return;
    
    try {
      await handleBook(selectedSlot, notes);
      setSelectedSlot(null);
      setNotes('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      // Error handled in hook
    }
  };

  const handleCancelConfirm = async () => {
    if (!showCancelConfirm) return;
    const b = showCancelConfirm;
    setCancelling(b.id);
    setShowCancelConfirm(null);
    
    try {
      await handleCancel(b);
    } catch {
      // Error handled in hook
    } finally {
      setCancelling(null);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-32 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <BookingSuccess onBookMore={() => setShowSuccess(false)} />
        </div>
      </div>
    );
  }

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
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {v === 'available' 
                ? 'Horários disponíveis'
                : `Minhas aulas ${upcomingBookings.length > 0 
                    ? `(${upcomingBookings.length})` : ''}`}
            </button>
          ))}
        </div>

        {view === 'available' ? (
          <BookingCalendar
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            loading={loading}
            weekOffset={weekOffset}
            onWeekChange={setWeekOffset}
            weekLabel={weekLabel}
          />
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
                            · Professor nativo
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

            {upcomingBookings.length === 0 && pastBookings.length === 0 && (
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

      {/* Booking form */}
      <BookingForm
        selectedSlot={selectedSlot}
        notes={notes}
        onNotesChange={setNotes}
        onConfirm={handleBookSlot}
        onCancel={() => setSelectedSlot(null)}
        isBooking={booking}
      />

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
