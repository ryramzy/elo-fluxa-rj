import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db, bookSlot as firestoreBookSlot, cancelBooking as firestoreCancelBooking } from '@lib/firestore';
import { getErrorMessage, logError } from '@utils/errorHandling';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { createCalendarEvent } from '@lib/googleCalendar';
import { trackEvent } from '@utils/analytics';
import { parseLocalDate } from '@utils/dateParser';

interface Booking {
  id: string;
  date: string;
  time: string;
  userId: string;
  userName: string;
  datetime?: any; // UTC Timestamp for timezone sync
}

interface VisualSlotPickerProps {
  onSlotSelect?: (date: string, time: string) => void;
  selectedDate?: string;
}

// In-memory cache to make calendar navigation and remounts instantaneous
const bookingsCache: Record<number, { data: Booking[]; timestamp: number }> = {};

export const VisualSlotPicker: React.FC<VisualSlotPickerProps> = ({
  onSlotSelect
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [slotLoadingMap, setSlotLoadingMap] = useState<Record<string, 'idle' | 'booking' | 'success' | 'error'>>({});
  const [cancelling, setCancelling] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [activeMobileDay, setActiveMobileDay] = useState<number>(0);
  const { user } = useAuth();
  const currentUserId = user?.uid || '';
  const { profile } = useUserProfile(currentUserId);
  const corporateCredits = profile?.corporateCredits ?? null;
  const isCreditLocked = corporateCredits === 0;

  const isAnySlotBooking = Object.values(slotLoadingMap).some(status => status === 'booking');
  
  const [toast, setToast] = useState<{message: string, type: 'error'|'success'} | null>(null);

  const showToast = (message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helpers for timezone conversions
  const getMattLocalStrings = (localDateStr: string, localTimeStr: string) => {
    const localDateObj = parseLocalDate(localDateStr, localTimeStr);
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(localDateObj);

    const partMap: Record<string, string> = {};
    parts.forEach(p => {
      partMap[p.type] = p.value;
    });

    return {
      date: `${partMap.year}-${partMap.month}-${partMap.day}`,
      time: `${partMap.hour}:${partMap.minute}`
    };
  };

  const isMattWorking = (localDateStr: string, localTimeStr: string): boolean => {
    const localDateObj = parseLocalDate(localDateStr, localTimeStr);
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'short',
      hour: 'numeric',
      hourCycle: 'h23'
    }).formatToParts(localDateObj);
    
    let weekday = '';
    let hour = -1;
    
    parts.forEach(p => {
      if (p.type === 'weekday') weekday = p.value;
      if (p.type === 'hour') hour = parseInt(p.value, 10);
    });
    
    const isWeekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday);
    const isWorkingHour = hour >= 8 && hour <= 21;
    
    return isWeekday && isWorkingHour;
  };

  const getLocalTimeSlots = (referenceDate: Date): string[] => {
    const referenceDateStr = referenceDate.toLocaleDateString('en-CA');
    const mattHours = [
      '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00'
    ];

    const localTimesSet = new Set<string>();

    mattHours.forEach(hour => {
      const dateObj = new Date(`${referenceDateStr}T${hour}:00-03:00`);
      const localTime = dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      });
      localTimesSet.add(localTime);
    });

    return Array.from(localTimesSet).sort();
  };

  // Get Monday to Friday dates
  const getWeekDates = (offset: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + (offset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(selectedWeek);
  const timeSlots = weekDates.length > 0 ? getLocalTimeSlots(weekDates[0]) : [];

  const loadWeekBookings = async (force = false) => {
    // Check in-memory cache first to make it load instantly
    const cached = bookingsCache[selectedWeek];
    const now = Date.now();
    
    if (!force && cached && (now - cached.timestamp < 15000)) {
      setBookings(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setToast(null);
    
    try {
      const localStartStr = weekDates[0].toLocaleDateString('en-CA');
      const localEndStr = weekDates[4].toLocaleDateString('en-CA');
      
      // Expand the start and end dates by 2 days in each direction to account for timezone shifts
      const startUtc = new Date(`${localStartStr}T00:00:00`);
      startUtc.setDate(startUtc.getDate() - 2);
      
      const endUtc = new Date(`${localEndStr}T23:59:59`);
      endUtc.setDate(endUtc.getDate() + 2);
      
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('datetime', '>=', Timestamp.fromDate(startUtc)),
        where('datetime', '<=', Timestamp.fromDate(endUtc))
      );
      
      const snapshot = await getDocs(bookingsQuery);
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking));
      
      // Save to cache
      bookingsCache[selectedWeek] = { data: bookingsData, timestamp: Date.now() };
      setBookings(bookingsData);
    } catch (err) {
      logError(err, { action: 'loadWeekBookings', selectedWeek });
      showToast('Failed to load availability.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (date: string, time: string) => {
    if (user?.isGuest) {
      showToast('Crie uma conta para agendar uma aula!', 'error');
      return;
    }

    // Telemetry 1: Slot Clicked
    trackEvent('booking_slot_clicked', { date, time, userId: currentUserId });

    const slotKey = `${date}_${time}`;
    if (slotLoadingMap[slotKey] === 'booking' || cancelling) return;

    // Interactive confirmation to give the user immediate feedback that their click was registered
    const confirmMessage = `Deseja agendar a sua aula para o dia ${date.split('-').reverse().join('/')} às ${time}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Telemetry 2: Confirm Accepted
    trackEvent('booking_confirm_accepted', { date, time, userId: currentUserId });

    // Instantly transition the target slot to a booking visual state
    setSlotLoadingMap(prev => ({ ...prev, [slotKey]: 'booking' }));
    
    try {
      const studentName = user?.displayName || user?.email?.split('@')[0] || 'Estudante';
      const studentEmail = user?.email || 'estudante@elo.com';
      
      // Convert student's local slot back to Matt's Rio date and time strings
      const { date: mattDate, time: mattTime } = getMattLocalStrings(date, time);
      
      // 1. Create Google Calendar event (or Jitsi fallback)
      let eventId: string | null = null;
      let meetLink: string | null = null;
      
      try {
        const [mYear, mMonth, mDay] = mattDate.split('-').map(Number);
        const [mHour, mMinute] = mattTime.split(':').map(Number);
        // America/Sao_Paulo (UTC-3). To convert local Rio time to UTC, add 3 hours.
        const startDateObj = new Date(Date.UTC(mYear, mMonth - 1, mDay, mHour + 3, mMinute, 0));
        const endDateObj = new Date(startDateObj.getTime() + 60 * 60 * 1000); // 1 hour duration
        
        const startDateTime = `${mattDate}T${mattTime}:00-03:00`;
        const endDateTime = endDateObj.toISOString().replace('Z', '-03:00'); // Convert to local Rio ISO
        
        const calRes = await createCalendarEvent({
          summary: `Aula de Inglês com Matt: ${studentName}`,
          description: `Sua aula particular de inglês americano com o Professor Matt.\nGoogle Meet: a ser acessado pelo link.`,
          startDateTime,
          endDateTime,
          attendeeEmail: studentEmail,
          attendeeName: studentName
        });
        eventId = calRes.eventId;
        meetLink = calRes.meetLink;
      } catch (calErr) {
        console.error('Failed to create calendar event, continuing with booking:', calErr);
        // Fallback to Jitsi meet link directly
        const sanitizedName = studentName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        meetLink = `https://meet.jit.si/elo-class-${sanitizedName}-${Date.now().toString().slice(-4)}`;
        eventId = `fallback_event_${Date.now()}`;
      }
      
      await firestoreBookSlot(mattDate, mattTime, currentUserId, studentName, studentEmail, '', eventId, meetLink);
      
      // Create local booking object to merge optimistically
      const newBooking: Booking = {
        id: `${mattDate}_${mattTime.replace(':', '')}`,
        date: mattDate,
        time: mattTime,
        userId: currentUserId,
        userName: studentName
      };

      // Optimistically merge into local state array to trigger immediate re-render and update cache
      setBookings(prev => {
        const next = [...prev, newBooking];
        bookingsCache[selectedWeek] = { data: next, timestamp: Date.now() };
        return next;
      });
      setSlotLoadingMap(prev => ({ ...prev, [slotKey]: 'success' }));

      // Telemetry 3: Booking Success
      trackEvent('booking_api_success', { date, time, mattDate, mattTime, userId: currentUserId, eventId });

      // 2. Trigger email confirmation in the background (fire-and-forget to avoid blocking UI thread)
      fetch('/api/email/booking-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendeeName: studentName,
          attendeeEmail: studentEmail,
          date: mattDate,
          time: mattTime,
          durationMinutes: 60,
          meetLink: meetLink,
          notes: ''
        })
      }).catch(emailErr => {
        console.error('Failed to send email confirmation in background:', emailErr);
      });
      
      showToast('Aula agendada com sucesso!', 'success');
      
      if (onSlotSelect) {
        onSlotSelect(date, time);
      }
    } catch (err: any) {
      logError(err, { action: 'bookSlot', date, time });
      
      // Telemetry 4: Booking Error
      trackEvent('booking_api_error', { date, time, error: err.message || err, userId: currentUserId });

      showToast(err.message || 'Failed to book slot.', 'error');
      // Rollback target slot loading status
      setSlotLoadingMap(prev => ({ ...prev, [slotKey]: 'error' }));
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (isAnySlotBooking || cancelling) return;

    const booking = bookings.find(b => b.id === bookingId);
    let isLateCancellation = false;

    if (booking) {
      let bookingDate: Date;
      if (booking.datetime) {
        bookingDate = new Date(booking.datetime.seconds * 1000);
      } else if (booking.date && booking.time) {
        const localIsoString = `${booking.date}T${booking.time}:00-03:00`;
        bookingDate = new Date(localIsoString);
      } else {
        bookingDate = new Date();
      }
      const hoursDiff = (bookingDate.getTime() - Date.now()) / (1000 * 60 * 60);
      isLateCancellation = hoursDiff < 24;
    }

    let confirmMessage = 'Deseja realmente cancelar o agendamento desta aula?';
    if (corporateCredits !== null) {
      confirmMessage = isLateCancellation
        ? 'Aviso: Esta aula começa em menos de 24h. Cancelar agora NÃO reembolsará seu crédito B2B. Deseja prosseguir?'
        : 'Deseja cancelar esta aula? Como falta mais de 24h, seu crédito B2B será reembolsado na sua conta. Deseja prosseguir?';
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setCancelling(true);
    
    try {
      await firestoreCancelBooking(bookingId);
      
      // Optimistically remove from state and update cache
      setBookings(prev => {
        const next = prev.filter(b => b.id !== bookingId);
        bookingsCache[selectedWeek] = { data: next, timestamp: Date.now() };
        return next;
      });
      showToast('Booking cancelled successfully!', 'success');
    } catch (err: any) {
      logError(err, { action: 'cancelBooking', bookingId });
      showToast(err.message || 'Failed to cancel booking.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    loadWeekBookings();
  }, [selectedWeek]);

  const getBooking = (dateStr: string, timeStr: string) => {
    const cellMs = parseLocalDate(dateStr, timeStr).getTime();
    return bookings.find(b => {
      let bookingMs = 0;
      if (b.datetime) {
        bookingMs = b.datetime.seconds ? b.datetime.seconds * 1000 : new Date(b.datetime).getTime();
      } else if (b.date && b.time) {
        const localIsoString = `${b.date}T${b.time}:00-03:00`;
        bookingMs = new Date(localIsoString).getTime();
      }
      return Math.abs(bookingMs - cellMs) < 60000;
    });
  };

  const isPast = (dateStr: string, time: string) => {
    return parseLocalDate(dateStr, time).getTime() < Date.now();
  };

  return (
    <div className="w-full max-w-7xl mx-auto backdrop-blur-xl bg-[#0f172a]/80 rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`absolute top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg backdrop-blur-md border animate-in slide-in-from-top-4 fade-in duration-300 ${
          toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-100' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="p-6 md:p-8 border-b border-white/5 bg-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Agende sua Aula
              </h2>
              {corporateCredits !== null && (
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-slate-900/60 border-slate-800 ${corporateCredits === 0 ? 'text-rose-400 border-rose-550/20' : 'text-slate-350'}`}>
                  Créditos: {corporateCredits}
                </span>
              )}
            </div>
            <p className="text-slate-400 mt-1 text-sm md:text-base font-normal">
              Semana de {weekDates[0].toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}
            </p>
            {corporateCredits === 0 && (
              <p className="text-rose-455 text-xs mt-2 font-semibold bg-rose-500/5 border border-rose-500/10 px-3 py-1.5 rounded-xl inline-block">
                Você consumiu todos os seus créditos corporativos do mês. Entre em contato com seu gestor de RH.
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-slate-900/50 rounded-xl border border-white/5">
            <button
              onClick={() => setSelectedWeek(selectedWeek - 1)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-transparent hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              Anterior
            </button>
            <button
              onClick={() => setSelectedWeek(0)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                selectedWeek === 0 
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setSelectedWeek(selectedWeek + 1)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-transparent hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              Próxima
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
            <span className="text-xs font-medium text-slate-300">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500/80 shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
            <span className="text-xs font-medium text-slate-300">Seu Agendamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-700/80" />
            <span className="text-xs font-medium text-slate-400">Reservado por outro aluno</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="relative p-0 md:p-8 bg-[#0f172a]/40 min-h-[500px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm z-10">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="mt-4 text-slate-400 font-medium">Carregando horários...</p>
          </div>
        ) : null}

        {/* 1. Mobile Day Selector (Tabs) - Visible only on mobile */}
        <div className="md:hidden flex overflow-x-auto gap-2.5 pb-4 mb-4 border-b border-white/5 scrollbar-none px-6 pt-6">
          {weekDates.map((date, idx) => {
            const dateStr = date.toLocaleDateString('en-CA');
            const isToday = dateStr === new Date().toLocaleDateString('en-CA');
            const isActive = activeMobileDay === idx;
            
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveMobileDay(idx)}
                className={`flex-1 min-w-[70px] flex flex-col items-center py-2.5 px-3 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 border-blue-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]'
                    : isToday
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  {date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                </span>
                <span className="text-lg font-black">
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Mobile Slots List - Visible only on mobile */}
        <div className="md:hidden space-y-3 px-6 pb-6">
          {timeSlots.map((time) => {
            const date = weekDates[activeMobileDay];
            const dateStr = date.toLocaleDateString('en-CA');
            const existingBooking = getBooking(dateStr, time);
            const past = isPast(dateStr, time);
            const working = isMattWorking(dateStr, time);
            const showAsUnavailable = past || !working;
            
            let slotState = 'available';
            if (existingBooking) {
              if (existingBooking.userId === currentUserId || existingBooking.uid === currentUserId) slotState = 'mine';
              else slotState = 'booked';
            }

            const slotKey = `${dateStr}_${time}`;
            const currentSlotLoading = slotLoadingMap[slotKey];

            return (
              <div key={`${dateStr}-${time}`} className="flex items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                <span className="text-slate-200 text-sm font-extrabold shrink-0">{time}</span>
                <div className="flex-1 max-w-[200px] h-12 relative">
                  {showAsUnavailable ? (
                    <div className="absolute inset-0 rounded-xl bg-slate-950/20 border border-slate-850 flex items-center justify-center">
                      <span className="text-xs text-slate-650 font-medium">— Indisponível</span>
                    </div>
                  ) : slotState === 'available' ? (
                    <button
                      onClick={() => handleBookSlot(dateStr, time)}
                      disabled={isAnySlotBooking || cancelling || currentSlotLoading === 'booking' || isCreditLocked}
                      className={`absolute inset-0 w-full h-full rounded-xl transition-all duration-300 flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isCreditLocked ? 'bg-slate-900/10 border border-slate-800 text-slate-500 cursor-not-allowed opacity-60' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}
                    >
                      {currentSlotLoading === 'booking' ? (
                        <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                      ) : isCreditLocked ? (
                        'Sem Crédito'
                      ) : (
                        'Reservar'
                      )}
                    </button>
                  ) : slotState === 'mine' ? (
                    <button
                      onClick={() => handleCancelBooking(existingBooking!.id)}
                      disabled={isAnySlotBooking || cancelling}
                      className="absolute inset-0 w-full h-full rounded-xl bg-blue-500/25 border border-blue-500/40 text-blue-300 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(59,130,246,0.1)]"
                    >
                      Sua Aula (Cancelar)
                    </button>
                  ) : (
                    <div className="absolute inset-0 rounded-xl bg-slate-850/20 border border-slate-850/40 text-slate-500 text-xs font-semibold flex items-center justify-center cursor-not-allowed">
                      Reservado
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Desktop Calendar Grid - Visible only on Desktop/Tablet */}
        <div className="hidden md:block overflow-x-auto pb-4">
          <div className="min-w-[800px]">
            {/* Days Header */}
            <div className="grid grid-cols-6 gap-4 mb-4">
              <div className="text-right pr-4 text-slate-550 text-xs font-bold uppercase tracking-wider pt-2">
                Horário
              </div>
              {weekDates.map((date, i) => {
                const dateStr = date.toLocaleDateString('en-CA');
                const isToday = dateStr === new Date().toLocaleDateString('en-CA');
                return (
                  <div key={i} className={`flex flex-col items-center p-3 rounded-2xl transition-all ${isToday ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-transparent'}`}>
                    <span className={`text-xs font-bold uppercase mb-1 tracking-wider ${isToday ? 'text-blue-400' : 'text-slate-400'}`}>
                      {date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                    </span>
                    <span className={`text-2xl font-black ${isToday ? 'text-white' : 'text-slate-300'}`}>
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time Grid */}
            <div className="space-y-3 relative">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-6 gap-4 group">
                  {/* Time Label */}
                  <div className="text-right pr-4 py-3 text-slate-455 text-sm font-extrabold flex items-center justify-end transform -translate-y-0.5">
                    {time}
                  </div>
                  
                  {/* Slots for each day */}
                  {weekDates.map((date) => {
                    const dateStr = date.toLocaleDateString('en-CA');
                    const existingBooking = getBooking(dateStr, time);
                    const past = isPast(dateStr, time);
                    const working = isMattWorking(dateStr, time);
                    const showAsUnavailable = past || !working;
                    
                    let slotState = 'available';
                    if (existingBooking) {
                      if (existingBooking.userId === currentUserId || existingBooking.uid === currentUserId) slotState = 'mine';
                      else slotState = 'booked';
                    }

                    const slotKey = `${dateStr}_${time}`;
                    const currentSlotLoading = slotLoadingMap[slotKey];

                    return (
                      <div key={`${dateStr}-${time}`} className="relative h-14">
                        {showAsUnavailable ? (
                          // Unavailable slot
                          <div className="absolute inset-0 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                            <span className="text-xs text-slate-650 font-medium">—</span>
                          </div>
                        ) : slotState === 'available' ? (
                          // Available slot
                          <button
                             onClick={() => handleBookSlot(dateStr, time)}
                             disabled={isAnySlotBooking || cancelling || currentSlotLoading === 'booking' || isCreditLocked}
                             className={`absolute inset-0 w-full rounded-xl transition-all duration-300 flex flex-col items-center justify-center group/btn active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isCreditLocked ? 'bg-slate-900/10 border border-slate-800 text-slate-500 cursor-not-allowed opacity-60' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'}`}
                           >
                             {currentSlotLoading === 'booking' ? (
                               <div className="flex flex-col items-center justify-center">
                                 <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                                 <span className="text-[9px] text-emerald-400/80 mt-1 uppercase tracking-wider">Agendando...</span>
                               </div>
                             ) : isCreditLocked ? (
                               <>
                                 <span className="text-sm font-bold tracking-wide text-slate-550">Bloqueado</span>
                                 <span className="text-[9px] text-slate-600 uppercase tracking-wider mt-0.5">Sem Créditos</span>
                               </>
                             ) : (
                               <>
                                 <span className="text-sm font-bold tracking-wide">Disponível</span>
                                 <span className="text-[10px] opacity-0 group-hover/btn:opacity-100 transition-opacity uppercase tracking-wider mt-0.5">Reservar</span>
                               </>
                             )}
                           </button>
                        ) : slotState === 'mine' ? (
                          // User's booking
                          <button
                            onClick={() => handleCancelBooking(existingBooking!.id)}
                            disabled={isAnySlotBooking || cancelling}
                            className="absolute inset-0 w-full rounded-xl bg-blue-500/25 border border-blue-500/40 text-blue-300 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all duration-300 flex flex-col items-center justify-center group/btn active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                          >
                            <span className="text-sm font-bold tracking-wide group-hover/btn:hidden">Sua Aula ✅</span>
                            <span className="text-sm font-bold tracking-wide hidden group-hover/btn:block">Cancelar? ❌</span>
                          </button>
                        ) : (
                          // Booked by someone else
                          <div className="absolute inset-0 rounded-xl bg-slate-800/40 border border-white/5 flex flex-col items-center justify-center cursor-not-allowed overflow-hidden opacity-50">
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/50" />
                            <span className="text-sm font-medium text-slate-500 relative z-10">Ocupado</span>
                          </div>
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
    </div>
  );
};
