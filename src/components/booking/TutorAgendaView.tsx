import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { db, bookSlot, cancelBooking } from '@/lib/firestore';
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
  FaCalendarAlt, 
  FaCalendarCheck, 
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
  userName?: string;
  studentName?: string;
  userEmail?: string;
  studentEmail?: string;
  status?: string;
  datetime?: any;
  meetLink?: string;
}

interface User {
  uid: string;
  displayName?: string;
  email?: string;
  phone?: string;
}

export function TutorAgendaView() {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid || '');
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'schedule' | 'open'>('schedule');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Tutor selector states
  const [selectedTutorId, setSelectedTutorId] = useState<string>('matthew');
  const [tutorList, setTutorList] = useState<any[]>([
    { id: 'matthew', name: 'Matthew (Matt)' },
    { id: 'sarah', name: 'Sarah Jenkins' }
  ]);

  // Filters state
  const [filterAvailable, setFilterAvailable] = useState(true);
  const [filterConfirmed, setFilterConfirmed] = useState(true);
  const [filterPending, setFilterPending] = useState(true);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Auto-resolve logged-in tutor ID
  useEffect(() => {
    if (profile && (profile.role === 'tutor' || profile.role === 'teacher')) {
      setSelectedTutorId(profile.uid);
    }
  }, [profile]);

  // Load available tutors
  useEffect(() => {
    getDocs(collection(db, 'tutors')).then(snapshot => {
      if (!snapshot.empty) {
        setTutorList(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
      }
    }).catch(e => console.warn('Failed to load tutors list, using default roster:', e));
  }, []);

  // Modal states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Form states for manual booking
  const [selectedStudentUid, setSelectedStudentUid] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [savingManualBooking, setSavingManualBooking] = useState(false);

  // Paste availability text
  const [pasteText, setPasteText] = useState('');
  const [savingPaste, setSavingPaste] = useState(false);

  // Template settings
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [startHour, setStartHour] = useState('08:00');
  const [endHour, setEndHour] = useState('21:00');
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Subscribe to bookings, available slots, and users list within a rolling range relative to selectedDate
  useEffect(() => {
    const startObj = new Date(selectedDate);
    startObj.setDate(selectedDate.getDate() - 30); // 30 days in the past from selectedDate
    const startStr = startObj.toLocaleDateString('en-CA');

    const endObj = new Date(selectedDate);
    endObj.setDate(selectedDate.getDate() + 60); // 60 days in the future from selectedDate
    const endStr = endObj.toLocaleDateString('en-CA');

    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    );

    const slotsQuery = query(
      collection(db, 'availableSlots'),
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    );

    const unsubBookings = onSnapshot(bookingsQuery, (snap) => {
      const list: Booking[] = [];
      snap.forEach(d => {
        const data = d.data();
        if ((data.tutorId || 'matthew') === selectedTutorId) {
          list.push({ id: d.id, ...data } as Booking);
        }
      });
      setBookings(list);
      setLoading(false);
    }, (error) => {
      console.error('Error loading bookings:', error);
      setLoading(false);
    });

    const unsubSlots = onSnapshot(slotsQuery, (snap) => {
      const list: any[] = [];
      snap.forEach(d => {
        const data = d.data();
        if ((data.tutorId || 'matthew') === selectedTutorId) {
          list.push({ id: d.id, ...data });
        }
      });
      setAvailableSlots(list);
    }, (error) => {
      console.error('Error loading slots:', error);
    });

    return () => {
      unsubBookings();
      unsubSlots();
    };
  }, [selectedTutorId, selectedDate]);

  // Lazily load users only when the scheduling modal is opened
  const [usersLoading, setUsersLoading] = useState(false);
  useEffect(() => {
    if (bookingModalOpen && users.length === 0) {
      setUsersLoading(true);
      getDocs(collection(db, 'users')).then(snap => {
        const uList: User[] = [];
        snap.forEach(d => {
          uList.push({ uid: d.id, ...d.data() } as User);
        });
        setUsers(uList);
      }).catch(err => {
        console.error('Error loading users for modal:', err);
      }).finally(() => {
        setUsersLoading(false);
      });
    }
  }, [bookingModalOpen, users.length]);

  const handleAcceptRequest = async (bookingId: string) => {
    try {
      const ref = doc(db, 'bookings', bookingId);
      await updateDoc(ref, { status: 'confirmed' });
      showToast({ type: 'success', message: 'Aula confirmada com sucesso!' });
    } catch (err: any) {
      console.error('Error accepting booking:', err);
      showToast({ type: 'error', message: 'Erro ao aceitar: ' + err.message });
    }
  };

  const handleDeclineRequest = async (bookingId: string) => {
    if (!window.confirm('Deseja realmente recusar esta solicitação de aula?')) return;
    try {
      const booking = bookings.find(b => b.id === bookingId);
      const ref = doc(db, 'bookings', bookingId);
      await deleteDoc(ref);
      showToast({ type: 'success', message: 'Solicitação recusada com sucesso.' });

      if (booking) {
        fetch('/api/email/booking-cancellation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attendeeName: booking.studentName || booking.userName || 'Estudante',
            attendeeEmail: booking.studentEmail || booking.userEmail || '',
            date: booking.date,
            time: booking.time,
            deservesRefund: true,
            cancellationType: 'tutor'
          })
        }).catch(err => console.error('Error sending decline email:', err));
      }
    } catch (err: any) {
      console.error('Error declining booking:', err);
      showToast({ type: 'error', message: 'Erro ao recusar: ' + err.message });
    }
  };

  const handleCancelBookingTutor = async (bookingId: string) => {
    if (!window.confirm('Deseja realmente cancelar esta aula confirmada?')) return;
    try {
      const booking = bookings.find(b => b.id === bookingId);
      await cancelBooking(bookingId);
      showToast({ type: 'success', message: 'Aula cancelada com sucesso.' });

      if (booking) {
        fetch('/api/email/booking-cancellation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attendeeName: booking.studentName || booking.userName || 'Estudante',
            attendeeEmail: booking.studentEmail || booking.userEmail || '',
            date: booking.date,
            time: booking.time,
            deservesRefund: true,
            cancellationType: 'tutor'
          })
        }).catch(err => console.error('Error sending cancellation email:', err));
      }
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      showToast({ type: 'error', message: 'Erro ao cancelar: ' + err.message });
    }
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentUid || !manualDate || !manualTime) {
      showToast({ type: 'error', message: 'Preencha todos os campos.' });
      return;
    }

    setSavingManualBooking(true);
    try {
      const student = users.find(u => u.uid === selectedStudentUid);
      const studentName = student?.displayName || 'Estudante';
      const studentEmail = student?.email || '';

      const idSuffix = Date.now().toString().slice(-4);
      const meetLink = `https://meet.jit.si/elo-class-particular-${idSuffix}`;
      const eventId = `manual_${Date.now()}`;
      const tutorName = tutorList.find(t => t.id === selectedTutorId)?.name || 'Matthew';

      await bookSlot(manualDate, manualTime, selectedStudentUid, studentName, studentEmail, 'Criado manualmente pelo Tutor', eventId, meetLink, selectedTutorId, tutorName);
      showToast({ type: 'success', message: 'Aula agendada com sucesso!' });
      setBookingModalOpen(false);
      setSelectedStudentUid('');
      setManualDate('');
      setManualTime('');
    } catch (err: any) {
      console.error('Error creating manual booking:', err);
      showToast({ type: 'error', message: err.message || 'Erro ao agendar' });
    } finally {
      setSavingManualBooking(false);
    }
  };

  const handlePasteAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;

    setSavingPaste(true);
    try {
      const lines = pasteText.split('\n');
      let count = 0;
      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned) continue;

        let match = cleaned.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
        let date = '';
        let time = '';
        if (match) {
          date = match[1];
          time = match[2];
        } else {
          match = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}:\d{2})$/);
          if (match) {
            date = `${match[3]}-${match[2]}-${match[1]}`;
            time = match[4];
          }
        }

        if (date && time) {
          const slotId = `${selectedTutorId}_${date}_${time.replace(':', '')}`;
          await setDoc(doc(db, 'availableSlots', slotId), {
            date,
            time,
            tutorId: selectedTutorId,
            createdAt: new Date()
          });
          count++;
        }
      }
      showToast({ type: 'success', message: `${count} horários adicionados com sucesso!` });
      setPasteModalOpen(false);
      setPasteText('');
    } catch (err: any) {
      console.error('Error pasting availability:', err);
      showToast({ type: 'error', message: 'Erro: ' + err.message });
    } finally {
      setSavingPaste(false);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTemplate(true);
    try {
      const today = new Date();
      const currentDay = today.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);

      const startH = parseInt(startHour.split(':')[0], 10);
      const endH = parseInt(endHour.split(':')[0], 10);

      let count = 0;
      for (let i = 0; i < 5; i++) {
        const dateObj = new Date(monday);
        dateObj.setDate(monday.getDate() + i);
        const dayOfWeek = dateObj.getDay();

        if (selectedDays.includes(dayOfWeek)) {
          const dateStr = dateObj.toLocaleDateString('en-CA');
          for (let hour = startH; hour <= endH; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const slotId = `${selectedTutorId}_${dateStr}_${timeStr.replace(':', '')}`;
            await setDoc(doc(db, 'availableSlots', slotId), {
              date: dateStr,
              time: timeStr,
              tutorId: selectedTutorId,
              createdAt: new Date()
            });
            count++;
          }
        }
      }
      showToast({ type: 'success', message: `${count} slots gerados de acordo com o modelo!` });
      setTemplateModalOpen(false);
    } catch (err: any) {
      console.error('Error saving template:', err);
      showToast({ type: 'error', message: 'Erro ao gerar slots: ' + err.message });
    } finally {
      setSavingTemplate(false);
    }
  };

  const copyBookingLink = () => {
    const link = window.location.origin + '/signup';
    navigator.clipboard.writeText(link).then(() => {
      showToast({ type: 'success', message: 'Link de agendamento copiado para o clipboard!' });
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
  };

  const pendingRequests = bookings.filter(b => b.status === 'pending');

  const getWeekRangeString = () => {
    const currentDay = selectedDate.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(selectedDate);
    monday.setDate(selectedDate.getDate() + mondayOffset);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    return `${monday.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })} – ${friday.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getTimelineDays = () => {
    const currentDay = selectedDate.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(selectedDate);
    monday.setDate(selectedDate.getDate() + mondayOffset);

    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toLocaleDateString('en-CA');

      const dayBookings = bookings.filter(b => b.date === dateStr);
      const daySlots = availableSlots.filter(s => s.date === dateStr);

      const items: any[] = [];

      dayBookings.forEach(b => {
        if (b.status === 'confirmed' && filterConfirmed) {
          items.push({ type: 'confirmed', time: b.time, booking: b });
        } else if (b.status === 'pending' && filterPending) {
          items.push({ type: 'pending', time: b.time, booking: b });
        }
      });

      if (filterAvailable) {
        daySlots.forEach(s => {
          const isBooked = dayBookings.some(b => b.time === s.time);
          if (!isBooked) {
            items.push({ type: 'available', time: s.time, slot: s });
          }
        });
      }

      items.sort((a, b) => a.time.localeCompare(b.time));

      days.push({
        date: d,
        dateStr,
        items
      });
    }

    return days;
  };

  const renderMiniMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonthDays = [];
    for (let i = 0; i < firstDay; i++) {
      prevMonthDays.push(null);
    }

    const monthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      monthDays.push(new Date(year, month, i));
    }

    const allDays = [...prevMonthDays, ...monthDays];

    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const handleDateClick = (date: Date) => {
      setSelectedDate(date);
      const dateStr = date.toLocaleDateString('en-CA');
      setTimeout(() => {
        const element = document.getElementById(`day-header-${dateStr}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    };

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-750 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-slate-200">
            {monthNames[month]} {year}
          </span>
          <div className="flex gap-1.5">
            <button 
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-gray-500"
            >
              <FaChevronLeft size={10} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-gray-500"
            >
              <FaChevronRight size={10} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-1">
          <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weeks.map((week, widx) => (
            <React.Fragment key={widx}>
              {week.map((date, didx) => {
                if (!date) return <div key={didx} />;
                
                const dateStr = date.toLocaleDateString('en-CA');
                const isToday = dateStr === new Date().toLocaleDateString('en-CA');
                const isSelected = dateStr === selectedDate.toLocaleDateString('en-CA');
                
                const dayBookings = bookings.filter(b => b.date === dateStr);
                const hasConfirmed = dayBookings.some(b => b.status === 'confirmed');
                const hasPending = dayBookings.some(b => b.status === 'pending');

                return (
                  <button
                    key={didx}
                    onClick={() => handleDateClick(date)}
                    className={`h-7 w-7 rounded-full flex flex-col items-center justify-center text-xs relative font-semibold transition-all ${
                      isToday 
                        ? 'bg-blue-600 text-white font-bold' 
                        : isSelected
                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 font-bold dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-500/60'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200'
                    }`}
                  >
                    <span>{date.getDate()}</span>
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
    );
  };

  const timelineDays = getTimelineDays();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            Painel de Agendamento 👑
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
            {getWeekRangeString()}
          </p>
        </div>


      </div>

      <div className="flex flex-col-reverse md:flex-row gap-6">
        
        {/* SIDEBAR */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-6">
          
          {/* Pending Requests Component */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-750 p-5 shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-gray-50 dark:border-slate-700/50 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Solicitações de Reserva</h3>
              {pendingRequests.length > 0 && (
                <span className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingRequests.length} pendente{pendingRequests.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {pendingRequests.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">Nenhuma solicitação pendente ✓</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(req => (
                  <div key={req.id} className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-150/50 dark:border-orange-900/30 p-3 rounded-xl flex flex-col gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">{req.studentName}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {req.date.split('-').reverse().join('/')} • {req.time}
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                        title="Aceitar Solicitação"
                      >
                        <FaCheck size={9} />
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(req.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                        title="Recusar Solicitação"
                      >
                        <FaTimes size={9} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mini-Month Calendar */}
          {renderMiniMonth()}

          {/* Action Button Group */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => {
                setManualDate(selectedDate.toLocaleDateString('en-CA'));
                setBookingModalOpen(true);
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 uppercase tracking-wider"
            >
              <FaRegCalendarPlus size={13} />
              Agendar Aula Particular
            </button>
            
            <button
              onClick={() => setPasteModalOpen(true)}
              className="w-full py-3 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-200 border border-gray-150 dark:border-slate-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
            >
              <FaFileAlt size={13} />
              Colar Disponibilidade
            </button>

            <button
              onClick={() => setTemplateModalOpen(true)}
              className="w-full py-3 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-200 border border-gray-150 dark:border-slate-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
            >
              <FaSlidersH size={13} />
              Editar Modelo de Horários
            </button>

            <button
              onClick={copyBookingLink}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
            >
              <FaLink size={13} />
              Copiar Link de Agendamento
            </button>
          </div>

          {/* Display Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-750 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-4 pb-2 border-b border-gray-50 dark:border-slate-700/50">
              Exibir no Calendário
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-slate-250 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filterAvailable}
                  onChange={(e) => setFilterAvailable(e.target.checked)}
                  className="rounded text-blue-500 focus:ring-blue-300 border-gray-300 w-4 h-4"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" /> Disponível
                </span>
              </label>

              <label className="flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-slate-250 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filterConfirmed}
                  onChange={(e) => setFilterConfirmed(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-300 border-gray-300 w-4 h-4"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Confirmado
                </span>
              </label>

              <label className="flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-slate-250 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filterPending}
                  onChange={(e) => setFilterPending(e.target.checked)}
                  className="rounded text-orange-500 focus:ring-orange-300 border-gray-300 w-4 h-4"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-orange-500" /> Pendente
                </span>
              </label>
            </div>
          </div>

        </div>

        {/* MAIN TIMELINE STREAM */}
        <div className="flex-1 space-y-6">
          
          {/* Tabs & Week Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-slate-700 pb-2">
            <div className="flex border-b border-transparent">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`pb-3 px-6 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'schedule'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Seu Cronograma
              </button>
              <button
                onClick={() => setActiveTab('open')}
                className={`pb-3 px-6 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'open'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Horários Disponíveis ({availableSlots.length})
              </button>
            </div>

            {activeTab === 'schedule' && (
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200/50 dark:border-slate-700/50 self-stretch sm:self-auto justify-between sm:justify-start">
                <button
                  onClick={() => {
                    const prev = new Date(selectedDate);
                    prev.setDate(selectedDate.getDate() - 7);
                    setSelectedDate(prev);
                    setCurrentDate(prev);
                  }}
                  className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-slate-350 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                >
                  ◀ Sem. Ant.
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    setSelectedDate(now);
                    setCurrentDate(now);
                  }}
                  className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                    selectedDate.toDateString() === new Date().toDateString()
                      ? 'bg-blue-600 text-white shadow-sm font-black'
                      : 'text-gray-600 dark:text-slate-350 hover:bg-white dark:hover:bg-slate-700'
                  }`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => {
                    const next = new Date(selectedDate);
                    next.setDate(selectedDate.getDate() + 7);
                    setSelectedDate(next);
                    setCurrentDate(next);
                  }}
                  className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-slate-350 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                >
                  Próx. Sem. ▶
                </button>
              </div>
            )}
          </div>

          {/* Loader */}
          {loading ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-750 p-12 text-center shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-xs text-gray-500">Carregando cronograma...</p>
            </div>
          ) : activeTab === 'schedule' ? (
            /* Tab Content: Seu Cronograma */
            <div className="space-y-6">
              {timelineDays.map(day => (
                <div key={day.dateStr} id={`day-header-${day.dateStr}`} className="space-y-3 scroll-mt-6">
                  {/* Day Date Header */}
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-700/50 pb-2">
                    {day.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>

                  {day.items.length === 0 ? (
                    <p className="text-xs text-gray-500 pl-4 py-2 font-medium">Nenhum horário agendado ou disponível.</p>
                  ) : (
                    <div className="space-y-3">
                      {day.items.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-4 sm:items-center justify-between transition-all shadow-sm ${
                            item.type === 'confirmed'
                              ? 'bg-emerald-50/40 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30'
                              : item.type === 'pending'
                              ? 'bg-orange-50/40 border-orange-150 dark:bg-orange-950/10 dark:border-orange-900/30'
                              : 'bg-blue-50/20 border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/30'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-extrabold text-gray-800 dark:text-slate-100 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-xs border border-gray-100/50 dark:border-slate-700">
                              {item.time}
                            </span>
                            <div>
                              {item.type === 'confirmed' && (
                                <>
                                  <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                    {item.booking.studentName}
                                  </h4>
                                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">Aula Particular Confirmada • {item.booking.studentEmail}</p>
                                </>
                              )}
                              {item.type === 'pending' && (
                                <>
                                  <h4 className="text-xs font-bold text-orange-850 dark:text-orange-300">Solicitação - {item.booking.studentName}</h4>
                                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">Aguardando Confirmação • {item.booking.studentEmail}</p>
                                </>
                              )}
                              {item.type === 'available' && (
                                <>
                                  <h4 className="text-xs font-bold text-blue-750 dark:text-blue-400">Disponível</h4>
                                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">Disponível para reservas (Garantia de 15min)</p>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto justify-end">
                            {item.type === 'confirmed' && (
                              <>
                                {item.booking.meetLink && (
                                  <a
                                    href={item.booking.meetLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                                  >
                                    Entrar
                                  </a>
                                )}
                                <button
                                  onClick={() => handleCancelBookingTutor(item.booking.id)}
                                  className="px-3 py-1.5 bg-red-50/50 hover:bg-red-50 text-red-600 border border-red-200/50 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}

                            {item.type === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAcceptRequest(item.booking.id)}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm"
                                >
                                  Aceitar
                                </button>
                                <button
                                  onClick={() => handleDeclineRequest(item.booking.id)}
                                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm"
                                >
                                  Recusar
                                </button>
                              </>
                            )}

                            {item.type === 'available' && (
                              <button
                                onClick={async () => {
                                  if (window.confirm('Bloquear este horário disponível?')) {
                                    await deleteDoc(doc(db, 'availableSlots', item.slot.id));
                                    showToast({ type: 'success', message: 'Horário bloqueado/removido.' });
                                  }
                                }}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 dark:border-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                              >
                                Bloquear
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Tab Content: Horários Disponíveis */
            <div className="space-y-4">
              <div className="bg-blue-50/50 border border-blue-100 text-blue-800 p-4 rounded-2xl text-xs font-semibold leading-relaxed">
                ℹ️ Slots disponíveis são garantidos por 15 minutos após o início da reserva do aluno.
              </div>

              {availableSlots.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-750 p-8 text-center shadow-sm">
                  <p className="text-xs text-gray-500">Nenhum horário aberto no momento. Use as ações rápidas ao lado para colar horários ou carregar o modelo semanal.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableSlots.map(slot => (
                    <div 
                      key={slot.id} 
                      className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 p-3.5 rounded-xl shadow-xs flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400">{slot.date.split('-').reverse().slice(0, 2).join('/')}</span>
                        <span className="text-sm font-extrabold text-gray-800 dark:text-slate-100 mt-0.5">{slot.time}</span>
                      </div>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Deseja remover o horário disponível ${slot.date} ${slot.time}?`)) {
                            await deleteDoc(doc(db, 'availableSlots', slot.id));
                            showToast({ type: 'success', message: 'Horário disponível removido.' });
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all active:scale-95"
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

      {/* MODAL 1: Schedule Private Lesson */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs px-4">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-2xl p-6 border border-gray-100 dark:border-slate-750 shadow-2xl relative">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white mb-4">Agendar Aula Particular</h3>
            
            <form onSubmit={handleCreateManualBooking} className="space-y-4 text-xs font-bold text-gray-600 dark:text-slate-350">
              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Selecione o Estudante</label>
                <select
                  value={selectedStudentUid}
                  onChange={(e) => setSelectedStudentUid(e.target.value)}
                  required
                  disabled={usersLoading}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white disabled:opacity-50"
                >
                  <option value="">{usersLoading ? 'Carregando lista de alunos...' : '-- Selecione o Aluno --'}</option>
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Horário</label>
                  <input
                    type="time"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-200 rounded-xl uppercase tracking-wider text-[10px]"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={savingManualBooking}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl uppercase tracking-wider text-[10px]"
                >
                  {savingManualBooking ? 'Gravando...' : 'Salvar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Paste Weekly Availability */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs px-4">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-2xl p-6 border border-gray-100 dark:border-slate-750 shadow-2xl relative">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white mb-2">Colar Disponibilidade Semanal</h3>
            <p className="text-[10px] text-gray-500 mb-4">Insira um horário por linha no formato:<br/><b>AAAA-MM-DD HH:MM</b> (Ex: 2026-07-08 14:00)</p>

            <form onSubmit={handlePasteAvailability} className="space-y-4 text-xs font-bold text-gray-600 dark:text-slate-350">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="2026-07-08 14:00&#10;2026-07-08 15:00&#10;2026-07-09 10:00"
                rows={6}
                required
                className="w-full font-mono bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white text-xs"
              />

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPasteModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-200 rounded-xl uppercase tracking-wider text-[10px]"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={savingPaste}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl uppercase tracking-wider text-[10px]"
                >
                  {savingPaste ? 'Processando...' : 'Gravar Horários'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Weekly Template */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs px-4">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-2xl p-6 border border-gray-100 dark:border-slate-750 shadow-2xl relative">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white mb-2">Editar Modelo de Horários</h3>
            <p className="text-[10px] text-gray-500 mb-4">Gere slots livres para a semana atual nos dias selecionados.</p>

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs font-bold text-gray-600 dark:text-slate-350">
              <div>
                <label className="block mb-2 uppercase tracking-wider">Dias Disponíveis</label>
                <div className="flex flex-wrap gap-2">
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
                        className={`px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase transition-all ${
                          active
                            ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                            : 'bg-slate-50 border-gray-150 text-gray-600 dark:bg-slate-900 dark:border-slate-700'
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white"
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setTemplateModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-200 rounded-xl uppercase tracking-wider text-[10px]"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={savingTemplate}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl uppercase tracking-wider text-[10px]"
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
