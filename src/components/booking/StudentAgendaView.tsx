import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { db, cancelBooking } from '@/lib/firestore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FaPlus } from 'react-icons/fa';
import { VisualSlotPicker } from './VisualSlotPicker';

interface Booking {
  id: string;
  date: string;
  time: string;
  userId?: string;
  uid?: string;
  userName?: string;
  studentName?: string;
  userEmail?: string;
  studentEmail?: string;
  status?: string;
  datetime?: any;
  meetLink?: string;
}

function getGoogleCalendarLink(b: Booking) {
  const title = encodeURIComponent("Aula de Inglês - Elo!");
  const details = encodeURIComponent(`Aula de conversação com Matthew Ramsay. Link da aula: ${b.meetLink || ''}`);
  const localIsoString = `${b.date}T${b.time}:00-03:00`;
  const startDate = new Date(localIsoString);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  const formatCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dates = `${formatCalDate(startDate)}/${formatCalDate(endDate)}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
}

function downloadIcsFile(b: Booking) {
  const localIsoString = `${b.date}T${b.time}:00-03:00`;
  const startDate = new Date(localIsoString);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  const formatIcsDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Elo Speak//EN',
    'BEGIN:VEVENT',
    `UID:booking-${b.id}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    'SUMMARY:Aula de Inglês - Elo!',
    `DESCRIPTION:Aula de conversação com Matthew Ramsay. Link da aula: ${b.meetLink || ''}`,
    b.meetLink ? `URL:${b.meetLink}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');
  
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `aula-elo-${b.date}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function StudentAgendaView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotPickerOpen, setSlotPickerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list: Booking[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as Booking);
      });
      setBookings(list);
      setLoading(false);
    }, (error) => {
      console.error('Error loading student bookings:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCancelStudentBooking = async (bookingId: string, datetimeSeconds?: number) => {
    // 24h refund checking
    let deservesWarning = false;
    if (datetimeSeconds) {
      const bookingMs = datetimeSeconds * 1000;
      const hoursDiff = (bookingMs - Date.now()) / (1000 * 60 * 60);
      if (hoursDiff < 24) deservesWarning = true;
    }

    const cancelMsg = deservesWarning
      ? '⚠️ Cancelamentos com menos de 24 horas de antecedência NÃO reembolsam créditos. Deseja cancelar mesmo assim?'
      : 'Deseja realmente cancelar seu agendamento de aula com reembolso de crédito?';

    if (!window.confirm(cancelMsg)) return;

    try {
      const booking = bookings.find(b => b.id === bookingId);
      await cancelBooking(bookingId);
      showToast({ type: 'success', message: 'Agendamento cancelado com sucesso!' });
      
      if (booking) {
        fetch('/api/email/booking-cancellation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attendeeName: booking.studentName || booking.userName || user?.displayName || 'Estudante',
            attendeeEmail: booking.studentEmail || booking.userEmail || user?.email || '',
            date: booking.date,
            time: booking.time,
            deservesRefund: !deservesWarning,
            cancellationType: 'student'
          })
        }).catch(err => console.error('Error sending cancellation email:', err));
      }
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      showToast({ type: 'error', message: 'Erro ao cancelar agendamento: ' + err.message });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Carregando suas aulas...</p>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => {
    // Check if slot starts in future
    const dateLimit = b.datetime?.seconds 
      ? b.datetime.seconds * 1000 
      : new Date(`${b.date}T${b.time || '00:00'}:00-03:00`).getTime();
    return dateLimit > Date.now();
  }).sort((a, b) => {
    const timeA = a.datetime?.seconds ? a.datetime.seconds * 1000 : new Date(a.date).getTime();
    const timeB = b.datetime?.seconds ? b.datetime.seconds * 1000 : new Date(b.date).getTime();
    return timeA - timeB;
  });

  const pastBookings = bookings.filter(b => {
    const dateLimit = b.datetime?.seconds 
      ? b.datetime.seconds * 1000 
      : new Date(`${b.date}T${b.time || '00:00'}:00-03:00`).getTime();
    return dateLimit <= Date.now();
  }).sort((a, b) => {
    const timeA = a.datetime?.seconds ? a.datetime.seconds * 1000 : new Date(a.date).getTime();
    const timeB = b.datetime?.seconds ? b.datetime.seconds * 1000 : new Date(b.date).getTime();
    return timeB - timeA; // Most recent past first
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Title */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            Minhas Aulas 🗓️
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Painel do Aluno</p>
        </div>

        <button
          onClick={() => setSlotPickerOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-blue-500/10"
        >
          <FaPlus size={10} />
          Agendar Nova Aula
        </button>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-750 p-6 shadow-sm mb-6">
        <h2 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-4 pb-2 border-b border-gray-50 dark:border-slate-700/50">
          Suas Próximas Aulas
        </h2>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-10 space-y-4">
            <p className="text-xs text-gray-500 font-medium">Você ainda não tem aulas agendadas. Que tal marcar uma?</p>
            <button
              onClick={() => setSlotPickerOpen(true)}
              className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-extrabold uppercase tracking-wider border border-blue-200/50 transition-all"
            >
              Agendar Primeira Aula
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {upcomingBookings.map(b => (
              <div 
                key={b.id} 
                className="p-4 bg-emerald-50/20 border border-emerald-100/80 rounded-2xl flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-gray-800 dark:text-slate-100 bg-white dark:bg-slate-800 px-3 py-2 border border-gray-105 rounded-xl">
                    {b.time}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                      Aula de Inglês com Matthew Ramsay
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 uppercase tracking-wide">
                      {b.date.split('-').reverse().join('/')} • Sotaque Americano
                    </p>
                    <div className="flex gap-2.5 mt-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
                      <span>Adicionar:</span>
                      <a
                        href={getGoogleCalendarLink(b)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:text-blue-400 transition-colors"
                      >
                        Google Agenda
                      </a>
                      <span>•</span>
                      <button
                        onClick={() => downloadIcsFile(b)}
                        className="text-blue-500 hover:text-blue-400 transition-colors uppercase font-bold text-[9px]"
                      >
                        Apple / Outlook
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {b.meetLink && (
                    <a
                      href={b.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-sm"
                    >
                      Entrar
                    </a>
                  )}
                  <button
                    onClick={() => handleCancelStudentBooking(b.id, b.datetime?.seconds)}
                    className="px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-gray-200 dark:bg-slate-800 dark:hover:bg-red-950/20 dark:border-slate-700 dark:text-red-400 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-750 p-6 shadow-sm">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="w-full flex justify-between items-center text-xs font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 pb-2 border-b border-gray-50 dark:border-slate-700/50"
        >
          <span>Histórico de Aulas ({pastBookings.length})</span>
          <span>{historyOpen ? 'Recolher ▲' : 'Expandir ▼'}</span>
        </button>

        {historyOpen && (
          <div className="mt-4">
            {pastBookings.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">Nenhuma aula passada registrada.</p>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-slate-750">
                {pastBookings.map(b => (
                  <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-slate-200">
                        {b.date.split('-').reverse().join('/')} às {b.time}
                      </span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Professor: Matthew Ramsay</span>
                    </div>
                    <span className="bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      Concluída
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* INTERACTIVE BOOKING PICKER MODAL (VisualSlotPicker) */}
      {slotPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto px-4 py-6 md:p-12 flex items-start justify-center">
          <div className="max-w-6xl w-full bg-[#020617] rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">Agendar Nova Aula 🗓️</h3>
              <button
                onClick={() => setSlotPickerOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Voltar
              </button>
            </div>
            
            {/* Embedded Visual Slot Picker */}
            <div className="p-4 md:p-6 bg-[#020617]">
              <VisualSlotPicker 
                onSlotSelect={() => {
                  setSlotPickerOpen(false);
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
