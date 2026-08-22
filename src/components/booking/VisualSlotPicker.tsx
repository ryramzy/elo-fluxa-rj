import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { db, bookSlot } from '@/lib/firestore';
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
  const [loading, setLoading] = useState(true);
  const [slotLoadingMap, setSlotLoadingMap] = useState<Record<string, 'idle' | 'booking' | 'success' | 'error'>>({});

  const [selectedWeek, setSelectedWeek] = useState(0);
  const [activeMobileDay, setActiveMobileDay] = useState<number>(0);
  const [successBooking, setSuccessBooking] = useState<{ date: string; time: string; tutorName: string; meetLink: string } | null>(null);

  const corporateCredits = profile?.corporateCredits ?? null;
  const isCreditLocked = corporateCredits === 0;

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);

  // 1. Fetch tutor roster from database
  useEffect(() => {
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
            name: 'Matt Ramsay',
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
          name: 'Matt Ramsay',
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

  // 2. Load availableSlots and bookings relative to selectedTutor
  useEffect(() => {
    if (!selectedTutor) return;
    setLoading(true);
    const bQuery = query(collection(db, 'bookings'), where('tutorId', '==', selectedTutor.id));
    const unsubscribeBookings = onSnapshot(bQuery, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      setBookings(list);
      setLoading(false);
    }, () => setLoading(false));

    const sQuery = query(collection(db, 'availableSlots'), where('tutorId', '==', selectedTutor.id));
    const unsubscribeSlots = onSnapshot(sQuery, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setAvailableSlots(list);
    });

    return () => {
      unsubscribeBookings();
      unsubscribeSlots();
    };
  }, [selectedTutor]);

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
    if (user?.isGuest) {
      showToast('Crie uma conta para agendar uma aula!', 'error');
      return;
    }

    const slotKey = `${date}_${time}`;
    if (slotLoadingMap[slotKey] === 'booking') return;

    if (!window.confirm(`Deseja agendar sua aula para ${date.split('-').reverse().join('/')} às ${time}?`)) {
      return;
    }

    setSlotLoadingMap(prev => ({ ...prev, [slotKey]: 'booking' }));

    const activeTutor = selectedTutor || {
      id: 'matthew',
      name: 'Professor (Professor)',
      email: 'matt@elospeak.com.br',
      calendarId: 'matt@elospeak.com.br'
    };

    try {
      const studentName = user?.displayName || user?.email?.split('@')[0] || 'Estudante';
      const studentEmail = user?.email || 'estudante@elo.com';

      // 1. Prefill Google Calendar event
      let eventId: string | null = null;
      let meetLink: string | null = null;

      try {
        const startDateTime = `${date}T${time}:00-03:00`;
        const endHour = parseInt(time.split(':')[0]) + 1;
        const endDateTime = `${date}T${String(endHour).padStart(2, '0')}:00-03:00`;

        const calRes = await createCalendarEvent({
          summary: `Aula de Inglês Elo: ${studentName}`,
          description: `Sua aula de conversação em inglês com ${activeTutor.name}.`,
          startDateTime,
          endDateTime,
          attendeeEmail: studentEmail,
          attendeeName: studentName,
          tutorCalendarId: activeTutor.calendarId
        });
        eventId = calRes.eventId;
        meetLink = calRes.meetLink;
      } catch (calErr) {
        console.warn('Calendar API fallback to Jitsi:', calErr);
        const sanitizedName = studentName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        meetLink = `https://meet.jit.si/elo-class-${sanitizedName}-${Date.now().toString().slice(-4)}`;
        eventId = `fallback_event_${Date.now()}`;
      }

      await bookSlot(
        date,
        time,
        currentUserId,
        studentName,
        studentEmail,
        '',
        eventId,
        meetLink,
        activeTutor.id,
        activeTutor.name
      );

      setSlotLoadingMap(prev => ({ ...prev, [slotKey]: 'success' }));
      showToast('Solicitação de aula enviada!', 'success');

      setSuccessBooking({
        date,
        time,
        tutorName: activeTutor.name,
        meetLink: meetLink || ''
      });

      // Send email payload containing tutor details dynamically to booking-request
      fetch('/api/email/booking-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendeeName: studentName,
          attendeeEmail: studentEmail,
          date,
          time,
          durationMinutes: 60,
          meetLink,
          notes: '',
          tutorName: activeTutor.name,
          tutorEmail: activeTutor.email
        })
      }).catch(emailErr => {
        console.error('Failed to send email confirmation in background:', emailErr);
      });

    } catch (err: any) {
      showToast(err.message || 'Erro ao agendar aula.', 'error');
      setSlotLoadingMap(prev => ({ ...prev, [slotKey]: 'error' }));
    }
  };

  const getGoogleCalendarLink = (booking: { date: string; time: string; tutorName?: string; meetLink?: string }) => {
    const [year, mMonth, mDay] = booking.date.split('-').map(Number);
    const [mHour, mMinute] = booking.time.split(':').map(Number);
    const localDate = new Date(Date.UTC(year, mMonth - 1, mDay, mHour + 3, mMinute, 0));
    const endDate = new Date(localDate.getTime() + 60 * 60 * 1000);
    
    const toUtcFormat = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dates = `${toUtcFormat(localDate)}/${toUtcFormat(endDate)}`;
    const title = encodeURIComponent(`Aula de Inglês Elo com ${booking.tutorName || 'Professor'}`);
    const details = encodeURIComponent(`Sua aula de conversação com a Elo.\nLink da sala: ${booking.meetLink || ''}`);
    const location = encodeURIComponent(booking.meetLink || '');
    
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
                  className={`flex items-center gap-3 p-2.5 rounded-2xl border text-left shrink-0 transition-all active:scale-95 ${
                    isActive
                      ? 'bg-blue-600/10 border-blue-500/80 text-white shadow-lg shadow-blue-500/5'
                      : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <img
                    src={t.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                    alt={t.name}
                    className="w-10 h-10 rounded-xl object-cover border border-white/10"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{t.name}</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5 truncate max-w-[150px]">{t.bio}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid container */}
      <div className="relative p-0 sm:p-6 md:p-8 bg-transparent min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xs z-10">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Carregando horários...</p>
          </div>
        )}

        {/* 1. Mobile Week Selector */}
        <div className="md:hidden sticky top-0 z-20 bg-[#020617]/90 backdrop-blur-md flex overflow-x-auto gap-1.5 pb-3 mb-3 border-b border-slate-800/50 scrollbar-none px-2 pt-3">
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
            const isAvailable = availableSlots.some(s => s.date === dateStr && s.time === time);
            const isBookedByMe = bookings.some(b => b.date === dateStr && b.time === time && (b.userId === currentUserId || b.uid === currentUserId));
            const isBookedOther = bookings.some(b => b.date === dateStr && b.time === time && b.userId !== currentUserId && b.uid !== currentUserId);

            return (
              <div key={time} className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-200 text-xs font-black shrink-0">{time}</span>
                <div className="flex-1 max-w-[200px] h-11 relative">
                  {!isAvailable ? (
                    <div className="absolute inset-0 rounded-lg bg-slate-950/30 border border-slate-900 flex items-center justify-center">
                      <span className="text-[11px] text-slate-650 font-bold">— Indisponível</span>
                    </div>
                  ) : isBookedByMe ? (
                    <div className="absolute inset-0 rounded-lg bg-blue-950/20 border border-blue-900/30 text-blue-400 text-[11px] font-bold flex items-center justify-center">
                      Sua Aula Confirmada ✅
                    </div>
                  ) : isBookedOther ? (
                    <div className="absolute inset-0 rounded-lg bg-red-955/20 border border-red-900/20 text-red-500 text-[11px] font-bold flex items-center justify-center cursor-not-allowed">
                      Ocupado ❌
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBookSlot(dateStr, time)}
                      disabled={isCreditLocked}
                      className={`-webkit-tap-highlight-color-transparent select-none absolute inset-0 w-full h-full rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center ${
                        isCreditLocked 
                          ? 'bg-slate-950/30 border border-slate-900 text-slate-500' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
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
                    const isAvailable = availableSlots.some(s => s.date === dateStr && s.time === time);
                    const isBookedByMe = bookings.some(b => b.date === dateStr && b.time === time && (b.userId === currentUserId || b.uid === currentUserId));
                    const isBookedOther = bookings.some(b => b.date === dateStr && b.time === time && b.userId !== currentUserId && b.uid !== currentUserId);

                    return (
                      <div key={i} className="relative h-11">
                        {!isAvailable ? (
                          <div className="absolute inset-0 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                            <span className="text-xs text-slate-600 font-bold">—</span>
                          </div>
                        ) : isBookedByMe ? (
                          <div className="absolute inset-0 rounded-xl bg-blue-950/20 border border-blue-900/30 text-blue-400 text-[11px] font-bold flex items-center justify-center">
                            Sua Aula ✅
                          </div>
                        ) : isBookedOther ? (
                          <div className="absolute inset-0 rounded-xl bg-red-955/20 border border-red-900/20 text-red-500 text-[11px] font-bold flex items-center justify-center cursor-not-allowed">
                            Ocupado ❌
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBookSlot(dateStr, time)}
                            disabled={isCreditLocked}
                            className={`absolute inset-0 w-full rounded-xl text-xs font-bold uppercase transition-all flex flex-col items-center justify-center ${
                              isCreditLocked 
                                ? 'bg-slate-900/20 border border-slate-800 text-slate-500' 
                                : 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white active:scale-95'
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
              Solicitação Enviada! ⏳
            </h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-medium">
              Sua solicitação de aula com o professor <strong>{successBooking.tutorName}</strong> está aguardando confirmação.
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
