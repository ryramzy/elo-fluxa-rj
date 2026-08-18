import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { db, cancelBooking, bookSlot } from '@/lib/firestore';
import { 
  collection, 
  query, 
  where,
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  setDoc
} from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  FaCheck, 
  FaTimes, 
  FaLink, 
  FaChevronLeft, 
  FaChevronRight, 
  FaRegCalendarPlus,
  FaFileAlt,
  FaSlidersH
} from 'react-icons/fa';

interface Booking {
  id: string;
  date: string;
  time: string;
  userId?: string;
  uid?: string;
  userName: string;
  userEmail?: string;
  studentName?: string;
  studentEmail?: string;
  status?: 'confirmed' | 'pending' | 'cancelled_by_tutor' | 'cancelled_by_student';
  meetLink?: string;
  googleEventId?: string;
}

interface AvailableSlot {
  id: string;
  date: string;
  time: string;
}

export default function TutorAgendaView() {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid || '');
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'schedule' | 'open'>('schedule');

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Forms state
  const [selectedStudentUid, setSelectedStudentUid] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('14:00');
  const [savingManualBooking, setSavingManualBooking] = useState(false);

  const [pasteText, setPasteText] = useState('');
  const [savingPaste, setSavingPaste] = useState(false);

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startHour, setStartHour] = useState('09:00');
  const [endHour, setEndHour] = useState('17:00');
  const [savingTemplate, setSavingTemplate] = useState(false);

  // 1. Firebase Listeners
  useEffect(() => {
    setLoading(true);
    // Realtime bookings listener
    const bQuery = query(collection(db, 'bookings'), where('tutorId', '==', 'matthew'));
    const unsubscribeBookings = onSnapshot(bQuery, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      setBookings(list);
      setLoading(false);
    }, () => setLoading(false));

    // Realtime available slots listener
    const sQuery = query(collection(db, 'availableSlots'), where('tutorId', '==', 'matthew'));
    const unsubscribeSlots = onSnapshot(sQuery, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AvailableSlot));
      setAvailableSlots(list);
    });

    // Realtime students listener
    const uQuery = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubscribeUsers = onSnapshot(uQuery, (snapshot) => {
      const list = snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as any));
      setUsers(list);
    });

    return () => {
      unsubscribeBookings();
      unsubscribeSlots();
      unsubscribeUsers();
    };
  }, []);

  // 2. Helper Actions
  const handleAcceptRequest = async (id: string) => {
    try {
      const booking = bookings.find(b => b.id === id);
      if (!booking) throw new Error('Agendamento não encontrado');

      await updateDoc(doc(db, 'bookings', id), { status: 'confirmed' });
      showToast('Aula aceita com sucesso!', 'success');

      // Trigger booking confirmation email to student
      fetch('/api/email/booking-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendeeName: booking.userName || booking.studentName,
          attendeeEmail: booking.userEmail || booking.studentEmail,
          date: booking.date,
          time: booking.time,
          durationMinutes: 60,
          meetLink: booking.meetLink || '',
          notes: '',
          tutorName: profile?.displayName || 'Professor Nativo',
          tutorEmail: user?.email || 'matt@elospeak.com.br'
        })
      }).catch(err => {
        console.error('Failed to trigger confirmation email on acceptance:', err);
      });
    } catch (e: any) {
      showToast(e.message || 'Erro ao aceitar aula', 'error');
    }
  };

  const handleDeclineRequest = async (id: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'cancelled_by_tutor' });
      showToast('Aula recusada.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Erro ao recusar aula', 'error');
    }
  };

  const handleCancelBookingTutor = async (id: string) => {
    if (!window.confirm('Tem certeza de que deseja cancelar esta aula?')) return;
    try {
      await cancelBooking(id);
      showToast('Aula cancelada.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Erro ao cancelar aula', 'error');
    }
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentUid || !manualDate || !manualTime) return;
    setSavingManualBooking(true);
    try {
      const student = users.find(u => u.uid === selectedStudentUid);
      if (!student) throw new Error('Estudante não encontrado');
      const meetLink = `https://meet.jit.si/elo-class-${student.displayName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'student'}-${Date.now().toString().slice(-4)}`;
      
      await bookSlot(
        manualDate,
        manualTime,
        student.uid,
        student.displayName || student.email,
        student.email,
        '',
        null,
        meetLink,
        'matthew',
        'Matthew',
        'confirmed'
      );
      showToast('Aula agendada com sucesso!', 'success');
      setBookingModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Erro ao agendar aula.', 'error');
    } finally {
      setSavingManualBooking(false);
    }
  };

  const handlePasteAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;
    setSavingPaste(true);
    try {
      const lines = pasteText.split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const [date, time] = line.split(' ');
        if (date && time) {
          const slotId = `matthew_${date}_${time.replace(':', '')}`;
          await setDoc(doc(db, 'availableSlots', slotId), {
            date,
            time,
            tutorId: 'matthew',
            tutorName: 'Professor Nativo'
          });
        }
      }
      showToast('Horários importados com sucesso!', 'success');
      setPasteModalOpen(false);
      setPasteText('');
    } catch (err: any) {
      showToast(err.message || 'Erro ao colar horários.', 'error');
    } finally {
      setSavingPaste(false);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0 || !startHour || !endHour) return;
    setSavingTemplate(true);
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      const dayOfWeek = now.getDay();
      
      const startH = parseInt(startHour.split(':')[0]);
      const endH = parseInt(endHour.split(':')[0]);
      
      for (const dayIdx of selectedDays) {
        const diff = dayIdx - dayOfWeek;
        const targetDate = new Date(currentYear, currentMonth, currentDay + diff);
        const dateStr = targetDate.toLocaleDateString('en-CA');
        
        for (let h = startH; h < endH; h++) {
          const timeStr = `${String(h).padStart(2, '0')}:00`;
          const slotId = `matthew_${dateStr}_${timeStr.replace(':', '')}`;
          await setDoc(doc(db, 'availableSlots', slotId), {
            date: dateStr,
            time: timeStr,
            tutorId: 'matthew',
            tutorName: 'Professor Nativo'
          });
        }
      }
      showToast('Modelo semanal aplicado!', 'success');
      setTemplateModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Erro ao aplicar modelo.', 'error');
    } finally {
      setSavingTemplate(false);
    }
  };

  const copyBookingLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/dashboard?tab=booking`);
    showToast('Link de agendamento copiado para o clipboard!', 'success');
  };

  // 3. Mini Month Render Helpers
  const changeMonth = (offset: number) => {
    const nextDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1);
    setSelectedDate(nextDate);
  };

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    
    const days: (Date | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }
    
    const weeks: (Date | null)[][] = [];
    while (days.length > 0) {
      weeks.push(days.splice(0, 7));
    }
    return weeks;
  };

  const selectedDateStr = selectedDate.toLocaleDateString('en-CA');
  const filteredBookings = bookings.filter(b => b.date === selectedDateStr && b.status !== 'cancelled_by_tutor' && b.status !== 'cancelled_by_student');
  const filteredSlots = availableSlots.filter(s => s.date === selectedDateStr);
  const pendingRequests = bookings.filter(b => b.status === 'pending');

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-8 text-slate-100 font-sans">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            Painel da Agenda 👑
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Gerencie seu cronograma de aulas e novos slots livres.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: Sidebar Picker + Global Actions */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          
          {/* Mini Calendar Card */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </span>
              <div className="flex gap-1">
                <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <FaChevronLeft size={10} />
                </button>
                <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <FaChevronRight size={10} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 mb-2">
              <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((week, widx) => (
                <React.Fragment key={widx}>
                  {week.map((day, didx) => {
                    if (!day) return <div key={didx} />;
                    const dateStr = day.toLocaleDateString('en-CA');
                    const isToday = dateStr === new Date().toLocaleDateString('en-CA');
                    const isSelected = dateStr === selectedDateStr;
                    
                    const dayBookings = bookings.filter(b => b.date === dateStr);
                    const hasConfirmed = dayBookings.some(b => b.status === 'confirmed');
                    const hasPending = dayBookings.some(b => b.status === 'pending');

                    return (
                      <button
                        key={didx}
                        onClick={() => setSelectedDate(day)}
                        className={`h-11 w-11 md:h-9 md:w-9 mx-auto rounded-full flex flex-col items-center justify-center text-xs relative font-bold transition-all -webkit-tap-highlight-color-transparent select-none ${
                          isToday 
                            ? 'bg-blue-600 text-white' 
                            : isSelected
                            ? 'bg-blue-950/40 text-blue-300 ring-2 ring-blue-500/60'
                            : 'hover:bg-slate-800 text-slate-350'
                        }`}
                      >
                        <span>{day.getDate()}</span>
                        <div className="absolute bottom-0.5 flex gap-0.5">
                          {hasConfirmed && <span className="w-1 h-1 rounded-full bg-emerald-500" />}
                          {hasPending && <span className="w-1 h-1 rounded-full bg-orange-500" />}
                        </div>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Pending Requests Queue Card */}
          {pendingRequests.length > 0 && (
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-800/50">
                Solicitações de Reserva ({pendingRequests.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {pendingRequests.map(req => (
                  <div key={req.id} className="bg-orange-950/10 border border-orange-900/30 p-2.5 rounded-xl flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{req.userName || req.studentName}</h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {req.date.split('-').reverse().slice(0,2).join('/')} às {req.time}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button 
                        onClick={() => handleAcceptRequest(req.id)}
                        className="w-7 h-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center transition-all active:scale-95"
                      >
                        <FaCheck size={9} />
                      </button>
                      <button 
                        onClick={() => handleDeclineRequest(req.id)}
                        className="w-7 h-7 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center justify-center transition-all active:scale-95"
                      >
                        <FaTimes size={9} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Grid Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setManualDate(selectedDateStr);
                setBookingModalOpen(true);
              }}
              className="py-2.5 px-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-600/10 -webkit-tap-highlight-color-transparent select-none min-h-[44px] md:min-h-[38px]"
            >
              <FaRegCalendarPlus size={14} />
              <span>Agendar Aula</span>
            </button>
            <button
              onClick={() => setPasteModalOpen(true)}
              className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 border border-slate-700/50 -webkit-tap-highlight-color-transparent select-none min-h-[44px] md:min-h-[38px]"
            >
              <FaFileAlt size={14} />
              <span>Colar Horários</span>
            </button>
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 border border-slate-700/50 -webkit-tap-highlight-color-transparent select-none min-h-[44px] md:min-h-[38px]"
            >
              <FaSlidersH size={14} />
              <span>Editar Modelo</span>
            </button>
            <button
              onClick={copyBookingLink}
              className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 border border-slate-700/50 -webkit-tap-highlight-color-transparent select-none min-h-[44px] md:min-h-[38px]"
            >
              <FaLink size={14} />
              <span>Copiar Link</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Stream of Daily schedule */}
        <div className="flex-1 space-y-4">
          
          {/* Tab switches */}
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-2">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`pb-2 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-350'
              }`}
            >
              Agenda de Aulas ({filteredBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`pb-2 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'open'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-350'
              }`}
            >
              Slots Livres ({filteredSlots.length})
            </button>

            <span className="ml-auto text-[10px] font-bold text-slate-550 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              📅 {selectedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>

          {loading ? (
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-12 text-center shadow-xl">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500">Carregando cronograma...</p>
            </div>
          ) : activeTab === 'schedule' ? (
            // Schedule Items Stream
            <div className="space-y-2.5">
              {filteredBookings.length === 0 ? (
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 text-center text-xs text-slate-500">
                  Nenhuma aula agendada para este dia.
                </div>
              ) : (
                filteredBookings.sort((a,b) => a.time.localeCompare(b.time)).map((booking) => (
                  <div key={booking.id} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-3 sm:p-4 rounded-xl flex items-center justify-between gap-3 shadow-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-200 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex-shrink-0">
                        {booking.time}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{booking.userName || booking.studentName}</h4>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {booking.status === 'confirmed' ? '✓ Confirmada' : '⏳ Aguardando'} • {booking.studentEmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <a
                        href="https://zoom.us/j/mramsay0"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all min-h-[36px] flex items-center justify-center gap-1 shadow-sm"
                        title="Iniciar Sala do Zoom (mramsay0@gmail.com)"
                      >
                        📹 Zoom
                      </a>
                      <a
                        href="/courses/beginner/lessons/be-dl-01"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all min-h-[36px] flex items-center justify-center gap-1 shadow-sm"
                        title="Abrir Deck de Apresentação de Aulas"
                      >
                        🖥️ Deck
                      </a>
                      {booking.meetLink && (
                        <a
                          href={booking.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-700/50 min-h-[36px] flex items-center justify-center"
                          title="Abrir sala alternativa do Google Meet / Jitsi"
                        >
                          Meet
                        </a>
                      )}
                      <button
                        onClick={() => handleCancelBookingTutor(booking.id)}
                        className="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-700/50 min-h-[36px]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Slots Tab Stream
            <div className="space-y-2.5">
              {filteredSlots.length === 0 ? (
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 text-center text-xs text-slate-500">
                  Nenhum slot aberto para este dia. Use as ações rápidas para adicionar.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {filteredSlots.sort((a,b) => a.time.localeCompare(b.time)).map(slot => (
                    <div key={slot.id} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-2 shadow-xl">
                      <span className="text-xs font-black text-slate-200">{slot.time}</span>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Deseja remover o horário disponível ${slot.time}?`)) {
                            await deleteDoc(doc(db, 'availableSlots', slot.id));
                            showToast('Slot removido.', 'success');
                          }
                        }}
                        className="w-7 h-7 bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-lg flex items-center justify-center border border-slate-700/50 transition-all active:scale-95"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1:       {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-955/80 backdrop-blur-sm px-4 pb-[env(safe-area-inset-bottom)] sm:pb-0">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 mb-4">Agendar Aula Particular</h3>
            <form onSubmit={handleCreateManualBooking} className="space-y-4 text-xs font-bold text-slate-400">
              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Aluno</label>
                <select
                  value={selectedStudentUid}
                  onChange={(e) => setSelectedStudentUid(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base md:text-xs"
                >
                  <option value="">-- Selecione o Aluno --</option>
                  {users.map(u => (
                    <option key={u.uid} value={u.uid}>{u.displayName || u.email}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Data</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base md:text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Horário</label>
                  <input
                    type="time"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base md:text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="px-4 py-3 bg-slate-850 hover:bg-slate-800 text-slate-350 rounded-xl uppercase tracking-wider text-[10px] font-bold border border-slate-700/50 transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={savingManualBooking}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl uppercase tracking-wider text-[10px] font-bold transition-colors shadow-md min-h-[44px] flex items-center justify-center"
                >
                  {savingManualBooking ? 'Gravando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Paste slots availability */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-955/80 backdrop-blur-sm px-4 pb-[env(safe-area-inset-bottom)] sm:pb-0">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 mb-2">Colar Disponibilidade</h3>
            <p className="text-[10px] text-slate-500 mb-4">Insira datas por linha no formato: <b>AAAA-MM-DD HH:MM</b> (Ex: 2026-07-08 14:00)</p>
            <form onSubmit={handlePasteAvailability} className="space-y-4 text-xs font-bold text-slate-400">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="2026-07-08 14:00&#10;2026-07-08 15:00"
                rows={6}
                required
                className="w-full font-mono bg-slate-955 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base md:text-xs"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPasteModalOpen(false)}
                  className="px-4 py-3 bg-slate-850 hover:bg-slate-800 text-slate-355 rounded-xl uppercase tracking-wider text-[10px] font-bold border border-slate-700/50 transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={savingPaste}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl uppercase tracking-wider text-[10px] font-bold transition-colors shadow-md min-h-[44px] flex items-center justify-center"
                >
                  {savingPaste ? 'Processando...' : 'Gravar Slots'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Weekly Default Template */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-955/80 backdrop-blur-sm px-4 pb-[env(safe-area-inset-bottom)] sm:pb-0">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 mb-2">Editar Modelo de Horários</h3>
            <p className="text-[10px] text-slate-500 mb-4">Gere slots livres para a semana atual nos dias selecionados.</p>
            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs font-bold text-slate-400">
              <div>
                <label className="block mb-2 uppercase tracking-wider">Dias</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => {
                    const active = selectedDays.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (active) setSelectedDays(prev => prev.filter(d => d !== idx));
                          else setSelectedDays(prev => [...prev, idx]);
                        }}
                        className={`px-3 py-2 rounded-lg border font-bold text-[10px] uppercase transition-all min-h-[44px] sm:min-h-[36px] flex items-center justify-center ${
                          active
                            ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                            : 'bg-slate-955 border-slate-800 text-slate-400'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Hora Inicial</label>
                  <input
                    type="time"
                    step="3600"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base md:text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Hora Final</label>
                  <input
                    type="time"
                    step="3600"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base md:text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setTemplateModalOpen(false)}
                  className="px-4 py-3 bg-slate-850 hover:bg-slate-800 text-slate-355 rounded-xl uppercase tracking-wider text-[10px] font-bold border border-slate-700/50 transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={savingTemplate}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl uppercase tracking-wider text-[10px] font-bold transition-colors shadow-md min-h-[44px] flex items-center justify-center"
                >
                  {savingTemplate ? 'Gerando...' : 'Aplicar Modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
