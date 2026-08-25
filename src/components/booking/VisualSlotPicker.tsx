import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { db, bookSlot, getClassroomSettings, migrateLegacyTutorIds } from '@/lib/firestore';
import { 
  collection, 
  query, 
  where,
  onSnapshot,
  doc,
  getDocs
} from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { createCalendarEvent } from '@/lib/googleCalendar';

interface VisualSlotPickerProps {
  onSlotSelect?: (date: string, time: string) => void;
  selectedDate?: string;
  onBack?: () => void;
  showTitle?: boolean;
}

interface Booking {
  id: string;
  date: string;
  time: string;
  userId?: string;
  uid?: string;
  status?: string;
}

interface Tutor {
  id: string;
  name: string;
  email: string;
  calendarId: string;
  bio: string;
  photoUrl: string;
}

export const VisualSlotPicker: React.FC<VisualSlotPickerProps> = ({
  onSlotSelect,
  onBack,
  showTitle = true
}) => {
  const { user } = useAuth();
  const currentUserId = user?.uid || '';
  const { profile } = useUserProfile(currentUserId);
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotLoadingMap, setSlotLoadingMap] = useState<Record<string, 'idle' | 'booking' | 'success' | 'error'>>({});
  const [optimisticBookedKeys, setOptimisticBookedKeys] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(`elo_booked_slots_${currentUserId}`) || '[]');
    } catch (e) {
      return [];
    }
  });

  const [selectedWeek, setSelectedWeek] = useState(0);
  const [activeMobileDay, setActiveMobileDay] = useState<number>(() => {
    const d = new Date().getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, ...
    return d === 0 ? 6 : d - 1; // Align Mon=0, Tue=1, Wed=2...
  });
  const [successBooking, setSuccessBooking] = useState<{ date: string; time: string; tutorName: string; meetLink: string } | null>(null);

  const corporateCredits = profile?.corporateCredits ?? null;
  const isCreditLocked = corporateCredits === 0;

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);

  // 1. Fetch tutor roster from database and run legacy migration
  useEffect(() => {
    migrateLegacyTutorIds().catch(() => {});
    const fetchTutors = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tutors'));
        if (!snapshot.empty) {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tutor));
          setTutors(list);
          setSelectedTutor(list[0]);
        } else {
          // Roster fallback
          const fallback: Tutor = {
            id: 'matt',
            name: 'Professor Matt',
            email: 'mramsay0@gmail.com',
            calendarId: 'mramsay0@gmail.com',
            bio: 'Professor nativo americano no Rio de Janeiro, especialista em conversação e fluência prática.',
            photoUrl: '/matt-profile.jpg'
          };
          setTutors([fallback]);
          setSelectedTutor(fallback);
        }
      } catch (e) {
        console.warn('Failed to fetch tutors, using Matt default:', e);
        const fallback: Tutor = {
          id: 'matt',
          name: 'Professor Matt',
          email: 'mramsay0@gmail.com',
          calendarId: 'mramsay0@gmail.com',
          bio: 'Professor nativo americano no Rio de Janeiro, especialista em conversação e fluência prática.',
          photoUrl: '/matt-profile.jpg'
        };
        setTutors([fallback]);
        setSelectedTutor(fallback);
      }
    };
    fetchTutors();
  }, []);

  // 2. Load availableSlots, blockedSlots, and bookings in real-time
  useEffect(() => {
    setLoading(true);
    
    // Listen to all bookings
    const bQuery = query(collection(db, 'bookings'));
    const unsubscribeBookings = onSnapshot(bQuery, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      setBookings(list);
      setLoading(false);
    }, (err) => {
      console.warn('Bookings listener fallback:', err);
      setLoading(false);
    });

    const tutorIds = selectedTutor ? [selectedTutor.id, 'matt', 'matthew'] : ['matt', 'matthew'];
    const sQuery = query(collection(db, 'availableSlots'), where('tutorId', 'in', tutorIds));
    const unsubscribeSlots = onSnapshot(sQuery, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setAvailableSlots(list);
    }, () => {});

    const blockQuery = query(collection(db, 'blockedSlots'), where('tutorId', 'in', tutorIds));
    const unsubscribeBlocked = onSnapshot(blockQuery, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setBlockedSlots(list);
    }, () => {});

    return () => {
      unsubscribeBookings();
      unsubscribeSlots();
      unsubscribeBlocked();
    };
  }, [selectedTutor]);

  // Default Availability Schedule: Mon-Fri 09:00-20:00, Sat 09:00-14:00
  const isDefaultAvailable = (dateStr: string, time: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const hour = parseInt(time.split(':')[0], 10);

    // Monday (1) to Friday (5): 09:00 to 20:00
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      return hour >= 9 && hour <= 20;
    }
    // Saturday (6): 09:00 to 14:00
    if (dayOfWeek === 6) {
      return hour >= 9 && hour <= 14;
    }
    // Sunday (0): Closed
    return false;
  };

  // 2. Dates calculations
  const getWeekDates = () => {
    const dates: Date[] = [];
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + (selectedWeek * 7);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(diff + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const timeSlots = Array.from({ length: 14 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);

  // 3. Actions
  const handleBookSlot = async (date: string, time: string) => {
    if (!currentUserId || user?.isGuest) {
      showToast('Faça login para agendar uma aula!', 'error');
      return;
    }

    const slotKey = `${date}_${time}`;

    const activeTutor = selectedTutor || {
      id: 'matt',
      name: 'Professor Matt',
      email: 'mramsay0@gmail.com',
      calendarId: 'mramsay0@gmail.com',
      bio: '',
      photoUrl: '/matt-profile.jpg'
    };

    const studentName = user?.displayName || user?.email?.split('@')[0] || 'Estudante';
    const studentEmail = (user?.email || 'estudante@eloingles.com.br').toLowerCase().trim();
    const defaultMeetLink = 'https://eloingles.com.br/classroom';

    // 1. INSTANT ZERO-LATENCY OPTIMISTIC UI FLIP
    setSlotLoadingMap(prev => ({ ...prev, [slotKey]: 'success' }));
    setOptimisticBookedKeys(prev => {
      const updated = Array.from(new Set([...prev, slotKey]));
      try {
        if (currentUserId) {
          localStorage.setItem(`elo_booked_slots_${currentUserId}`, JSON.stringify(updated));
        }
      } catch (e) {}
      return updated;
    });

    const newBookingObj: Booking = {
      id: `${activeTutor.id || 'matt'}_${date}_${time.replace(':', '')}`,
      userId: currentUserId,
      uid: currentUserId,
      userName: studentName,
      userEmail: studentEmail,
      date,
      time,
      tutorId: activeTutor.id || 'matt',
      tutorName: activeTutor.name || 'Professor Matt',
      duration: 60,
      status: 'confirmed',
      meetLink: defaultMeetLink
    };
    setBookings(prev => [...prev.filter(b => !(b.date === date && b.time === time)), newBookingObj]);

    // 2. INSTANT CONFIRMATION POPUP MODAL
    setSuccessBooking({
      date,
      time,
      tutorName: activeTutor.name || 'Professor Matt',
      meetLink: defaultMeetLink
    });
    showToast('Aula agendada e confirmada com sucesso! 🗓️', 'success');

    // 3. ASYNC PERSISTENCE IN BACKGROUND
    try {
      const classroomSettings = await getClassroomSettings().catch(() => ({ meetingUrl: defaultMeetLink }));
      const meetLink = classroomSettings.meetingUrl || defaultMeetLink;
      const eventId = `elo_class_${Date.now()}`;

      await bookSlot(
        date,
        time,
        currentUserId,
        studentName,
        studentEmail,
        '',
        eventId,
        meetLink,
        activeTutor.id || 'matt',
        activeTutor.name || 'Professor Matt',
        'confirmed'
      );

      // Dispatch booking confirmation email via Resend in background
      fetch('/api/email/booking-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendeeName: studentName,
          attendeeEmail: studentEmail,
          date,
          time,
          durationMinutes: 60,
          meetLink,
          tutorName: activeTutor.name || 'Professor Matt',
          tutorEmail: activeTutor.email || 'mramsay0@gmail.com'
        })
      }).catch(e => console.warn('Email dispatch warning:', e));
    } catch (err: any) {
      console.warn('Booking persistence failed, rolling back optimistic state:', err);
      // ROLLBACK: revert all optimistic state so user sees the slot is still available
      setOptimisticBookedKeys(prev => {
        const reverted = prev.filter(k => k !== slotKey);
        try {
          if (currentUserId) {
            localStorage.setItem(`elo_booked_slots_${currentUserId}`, JSON.stringify(reverted));
          }
        } catch (e) {}
        return reverted;
      });
      setBookings(prev => prev.filter(b => !(b.date === date && b.time === time && b.userId === currentUserId)));
      setSlotLoadingMap(prev => ({ ...prev, [slotKey]: 'idle' }));
      setSuccessBooking(null);
      showToast(err?.message || 'Erro ao salvar aula. Tente novamente.', 'error');
    }
  };

  // Helper for Google Calendar export link
  const getGoogleCalendarLink = (booking: { date: string; time: string; tutorName?: string; meetLink?: string }) => {
    const [year, mMonth, mDay] = booking.date.split('-').map(Number);
    const [mHour, mMinute] = booking.time.split(':').map(Number);
    const localDate = new Date(Date.UTC(year, mMonth - 1, mDay, mHour + 3, mMinute, 0));
    const endDate = new Date(localDate.getTime() + 60 * 60 * 1000);
    
    const toUtcFormat = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dates = `${toUtcFormat(localDate)}/${toUtcFormat(endDate)}`;
    const title = encodeURIComponent(`Aula de Inglês Elo com ${booking.tutorName || 'Professor Matt'}`);
    const details = encodeURIComponent(`Sua aula de conversação no ELO!\nLink da sala: ${booking.meetLink || 'https://eloingles.com.br/classroom'}`);
    const location = encodeURIComponent(booking.meetLink || 'https://eloingles.com.br/classroom');
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-transparent sm:bg-slate-900/40 sm:backdrop-blur-md border-0 sm:border border-slate-800/80 rounded-xl sm:rounded-2xl shadow-none sm:shadow-xl overflow-hidden relative font-sans text-slate-100">
      
      {/* Header section */}
      <div className="p-3 sm:p-6 md:p-8 border-b border-slate-800/80 bg-slate-900/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              {!showTitle ? (
                <span className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Semana de {weekDates[0].toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}
                </span>
              ) : (
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Agendar Sessão
                </h2>
              )}
              {corporateCredits !== null && (
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-slate-950/60 border-slate-800 ${corporateCredits === 0 ? 'text-rose-400 border-rose-500/20' : 'text-slate-300'}`}>
                  Créditos: {corporateCredits}
                </span>
              )}
            </div>
            {showTitle && (
              <p className="text-slate-400 mt-1 text-sm md:text-base font-normal flex flex-wrap items-center gap-2">
                Semana de {weekDates[0].toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}
                <span className="text-[10px] text-slate-400 bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded-md font-mono">
                  🌐 {profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'São Paulo'}
                </span>
              </p>
            )}
            {!showTitle && (
              <p className="text-slate-400 mt-1 text-xs font-normal flex items-center gap-2">
                <span className="text-[10px] text-slate-400 bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded-md font-mono">
                  🌐 {profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'São Paulo'}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {onBack && (
              <button
                onClick={onBack}
                className="-webkit-tap-highlight-color-transparent select-none px-4 py-2.5 min-h-[44px] md:min-h-[38px] text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors bg-slate-900/50 hover:bg-slate-800 rounded-xl border border-slate-800 flex items-center justify-center gap-1.5"
              >
                ← Painel
              </button>
            )}
            <div className="flex items-center justify-between sm:justify-start gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-800/80 flex-1 sm:flex-initial">
              <button
                onClick={() => setSelectedWeek(selectedWeek - 1)}
                className="-webkit-tap-highlight-color-transparent select-none flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-transparent rounded-lg transition-all min-h-[44px] md:min-h-[36px]"
              >
                Anterior
              </button>
              <button
                onClick={() => setSelectedWeek(0)}
                className={`-webkit-tap-highlight-color-transparent select-none flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all min-h-[44px] md:min-h-[36px] ${
                  selectedWeek === 0 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setSelectedWeek(selectedWeek + 1)}
                className="-webkit-tap-highlight-color-transparent select-none flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-transparent rounded-lg transition-all min-h-[44px] md:min-h-[36px]"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tutor Selector Carousel */}
      {tutors.length > 1 && (
        <div className="px-4 sm:px-8 pt-4 pb-3 border-b border-slate-800/80 bg-slate-900/10">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
            Escolha seu Professor
          </label>
          <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none">
            {tutors.map((t) => {
              const isActive = selectedTutor?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTutor(t)}
                  className={`flex items-center gap-3 p-2 pr-4 rounded-xl border transition-all shrink-0 ${
                    isActive 
                      ? 'bg-blue-600/10 border-blue-500 text-white shadow-lg shadow-blue-500/10' 
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <img src={t.photoUrl || '/matt-profile.jpg'} alt={t.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="text-left">
                    <p className="text-xs font-bold leading-tight">{t.name}</p>
                    <p className="text-[10px] text-slate-400">Nativo (USA)</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main interactive grid */}
      <div className="p-2 sm:p-6 md:p-8 relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xs z-10">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Carregando horários...</p>
          </div>
        )}

        {/* 1. Mobile Week Selector */}
        <div className="md:hidden relative flex overflow-x-auto gap-1.5 pb-3 mb-3 border-b border-slate-800/50 scrollbar-none px-1 pt-1">
          {weekDates.map((date, idx) => {
            const dateStr = date.toLocaleDateString('en-CA');
            const isToday = dateStr === new Date().toLocaleDateString('en-CA');
            const isActive = activeMobileDay === idx;
            
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveMobileDay(idx)}
                className={`-webkit-tap-highlight-color-transparent select-none flex-1 min-w-[58px] flex flex-col items-center py-2 px-1 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                    : isToday
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  {date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                </span>
                <span className="text-base font-black">
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Mobile Slots Lists */}
        <div className="md:hidden space-y-2 px-2 pb-4">
          {timeSlots.map((time) => {
            const date = weekDates[activeMobileDay];
            const dateStr = date.toLocaleDateString('en-CA');
            
            const isBlocked = blockedSlots.some(b => b.date === dateStr && b.time === time && b.blocked !== false);
            const hasExplicitSlot = availableSlots.some(s => s.date === dateStr && s.time === time);
            const isAvailable = (hasExplicitSlot || isDefaultAvailable(dateStr, time)) && !isBlocked;
            const slotKey = `${dateStr}_${time}`;

            const studentEmail = (user?.email || '').toLowerCase().trim();
            const isBookedByMe = optimisticBookedKeys.includes(slotKey) || bookings.some(b => 
              b.date === dateStr && 
              b.time === time && 
              (
                (currentUserId && (b.userId === currentUserId || b.uid === currentUserId)) || 
                (studentEmail && ((b as any).studentEmail?.toLowerCase() === studentEmail || (b as any).userEmail?.toLowerCase() === studentEmail))
              ) && 
              b.status !== 'cancelled'
            );
            const isBookedOther = !isBookedByMe && bookings.some(b => 
              b.date === dateStr && 
              b.time === time && 
              b.status !== 'cancelled'
            );

            return (
              <div key={time} className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-200 text-xs font-black shrink-0">{time}</span>
                <div className="flex-1 max-w-[200px] h-11 relative">
                  {!isAvailable && !isBookedByMe ? (
                    <div className="absolute inset-0 rounded-lg bg-slate-950/30 border border-slate-900 flex items-center justify-center">
                      <span className="text-[11px] text-slate-500 font-bold">— Indisponível</span>
                    </div>
                  ) : isBookedByMe ? (
                    <a
                      href="/classroom"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400 text-white text-xs font-black flex items-center justify-center shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all text-center px-1"
                    >
                      Sua Aula Confirmada ✅
                    </a>
                  ) : isBookedOther ? (
                    <div className="absolute inset-0 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 text-[11px] font-bold flex items-center justify-center cursor-not-allowed">
                      Ocupado ❌
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBookSlot(dateStr, time)}
                      disabled={isCreditLocked}
                      className={`-webkit-tap-highlight-color-transparent select-none absolute inset-0 w-full h-full rounded-lg text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center shadow-md ${
                        isCreditLocked 
                          ? 'bg-slate-950/30 border border-slate-900 text-slate-500' 
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white active:scale-95 border border-emerald-400/30'
                      }`}
                    >
                      {isCreditLocked ? 'Sem Créditos' : 'Reservar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Desktop Slots Grid */}
        <div className="hidden md:block overflow-x-auto pb-4">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 gap-3 mb-4">
              <div className="text-right pr-4 text-slate-500 text-xs font-bold uppercase tracking-wider pt-3">
                Horário
              </div>
              {weekDates.map((date, i) => {
                const dateStr = date.toLocaleDateString('en-CA');
                const isToday = dateStr === new Date().toLocaleDateString('en-CA');
                return (
                  <div key={i} className={`flex flex-col items-center p-2 rounded-xl border ${isToday ? 'bg-blue-500/10 border-blue-500/20' : 'border-transparent bg-transparent'}`}>
                    <span className="text-[10px] font-bold uppercase mb-0.5 tracking-wider text-slate-500">
                      {date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                    </span>
                    <span className="text-xl font-black text-slate-300">
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 gap-3">
                  <div className="text-right pr-4 py-2.5 text-slate-400 text-xs font-black flex items-center justify-end">
                    {time}
                  </div>
                  {weekDates.map((date, i) => {
                    const dateStr = date.toLocaleDateString('en-CA');
                    const slotKey = `${dateStr}_${time}`;
                    
                    const isBlocked = blockedSlots.some(b => b.date === dateStr && b.time === time && b.blocked !== false);
                    const hasExplicitSlot = availableSlots.some(s => s.date === dateStr && s.time === time);
                    const isAvailable = (hasExplicitSlot || isDefaultAvailable(dateStr, time)) && !isBlocked;

                    const studentEmail = (user?.email || '').toLowerCase().trim();
                    const isBookedByMe = optimisticBookedKeys.includes(slotKey) || bookings.some(b => 
                      b.date === dateStr && 
                      b.time === time && 
                      (
                        (currentUserId && (b.userId === currentUserId || b.uid === currentUserId)) || 
                        (studentEmail && ((b as any).studentEmail?.toLowerCase() === studentEmail || (b as any).userEmail?.toLowerCase() === studentEmail))
                      ) && 
                      b.status !== 'cancelled'
                    );
                    const isBookedOther = !isBookedByMe && bookings.some(b => 
                      b.date === dateStr && 
                      b.time === time && 
                      b.status !== 'cancelled'
                    );

                    return (
                      <div key={i} className="relative h-11">
                        {!isAvailable && !isBookedByMe ? (
                          <div className="absolute inset-0 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                            <span className="text-xs text-slate-600 font-bold">—</span>
                          </div>
                        ) : isBookedByMe ? (
                          <a
                            href="/classroom"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400 text-white text-[11px] font-black flex items-center justify-center shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all text-center px-1"
                          >
                            Sua Aula ✅
                          </a>
                        ) : isBookedOther ? (
                          <div className="absolute inset-0 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400 text-[11px] font-bold flex items-center justify-center cursor-not-allowed">
                            Ocupado ❌
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBookSlot(dateStr, time)}
                            disabled={isCreditLocked}
                            className={`absolute inset-0 w-full rounded-xl text-xs font-black uppercase tracking-wide transition-all flex flex-col items-center justify-center shadow-sm ${
                              isCreditLocked 
                                ? 'bg-slate-900/20 border border-slate-800 text-slate-500' 
                                : 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white active:scale-95'
                            }`}
                          >
                            <span>{isCreditLocked ? 'Sem Créditos' : 'Reservar'}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Success Booking Popup Modal */}
      {successBooking && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-955/80 backdrop-blur-sm px-4 pb-[env(safe-area-inset-bottom)] sm:pb-0">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl relative text-center">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <span className="text-2xl">🎉</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Aula Confirmada! 🎉
            </h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-medium">
              Sua aula particular com o <strong>{successBooking.tutorName}</strong> foi agendada e confirmada. O link da sala ao vivo já está disponível.
            </p>
            <div className="my-5 bg-slate-955/60 border border-slate-800/80 rounded-2xl p-4 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Data:</span>
                <span className="text-slate-200 font-bold">{successBooking.date.split('-').reverse().join('/')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Horário:</span>
                <span className="text-slate-200 font-bold">{successBooking.time}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Sala de Aula:</span>
                <a 
                  href={successBooking.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 font-bold hover:underline truncate max-w-[180px]"
                >
                  Entrar na Sala →
                </a>
              </div>
            </div>
            <div className="space-y-2">
              <a 
                href={getGoogleCalendarLink(successBooking)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 -webkit-tap-highlight-color-transparent select-none min-h-[44px]"
              >
                📅 Adicionar ao Google Agenda
              </a>
              <button
                onClick={() => {
                  const bookingData = successBooking;
                  setSuccessBooking(null);
                  if (onSlotSelect) {
                    onSlotSelect(bookingData.date, bookingData.time);
                  }
                }}
                className="w-full py-3 bg-slate-850 hover:bg-slate-800 active:scale-95 text-slate-350 rounded-xl text-xs font-bold transition-all border border-slate-700/50 -webkit-tap-highlight-color-transparent select-none min-h-[44px]"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
