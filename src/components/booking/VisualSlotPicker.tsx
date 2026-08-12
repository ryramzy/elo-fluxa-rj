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
  tutorId?: string;
  tutorName?: string;
}

interface Tutor {
  id: string;
  name: string;
  email: string;
  calendarId: string;
  bio: string;
  photoUrl: string;
}

const DEFAULT_TUTORS: Tutor[] = [
  {
    id: 'matthew',
    name: 'Matthew (Matt)',
    email: 'matt@elospeak.com.br',
    calendarId: 'matt@elospeak.com.br',
    bio: 'Americano nativo de São Francisco, coach de conversação e especialista em destravar a fala de brasileiros.',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
  }
];

interface VisualSlotPickerProps {
  onSlotSelect?: (date: string, time: string) => void;
  selectedDate?: string;
  onBack?: () => void;
}

// In-memory cache to make calendar navigation and remounts instantaneous
const bookingsCache: Record<number, { data: Booking[]; timestamp: number }> = {};
const slotsCache: Record<number, { data: any[]; timestamp: number }> = {};

export const VisualSlotPicker: React.FC<VisualSlotPickerProps> = ({
  onSlotSelect,
  onBack,
  showTitle = true
}) => {
  const [successBooking, setSuccessBooking] = useState<{ date: string; time: string; tutorName: string; meetLink: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
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

  const [tutors, setTutors] = useState<Tutor[]>(DEFAULT_TUTORS);
  const [selectedTutor, setSelectedTutor] = useState<Tutor>(DEFAULT_TUTORS[0]);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tutors'));
        if (!snapshot.empty) {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tutor));
          setTutors(list);
          setSelectedTutor(list[0]);
        }
      } catch (e) {
        console.warn('Failed to fetch tutors from Firestore, using default roster:', e);
      }
    };
    fetchTutors();
  }, []);

  const isAnySlotBooking = Object.values(slotLoadingMap).some(status => status === 'booking');
  
  const [toast, setToast] = useState<{message: string, type: 'error'|'success'} | null>(null);

  // Prefilled client-side Google Calendar template URL generator
  const getGoogleCalendarLink = (booking: { date: string; time: string; tutorName?: string; meetLink?: string }) => {
    const [year, mMonth, mDay] = booking.date.split('-').map(Number);
    const [mHour, mMinute] = booking.time.split(':').map(Number);
    
    // America/Sao_Paulo offset is UTC-3. Shift hours to get standard UTC ISO format.
    const localDate = new Date(Date.UTC(year, mMonth - 1, mDay, mHour + 3, mMinute, 0));
    const endDate = new Date(localDate.getTime() + 60 * 60 * 1000); // 1 hr session
    
    const toUtcFormat = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const dates = `${toUtcFormat(localDate)}/${toUtcFormat(endDate)}`;
    const title = encodeURIComponent(`Aula de Inglês Elo com ${booking.tutorName || 'Professor'}`);
    const details = encodeURIComponent(`Sua aula de conversação em inglês com a Elo Speak.\nSala do Jitsi/Google Meet: ${booking.meetLink || ''}`);
    const location = encodeURIComponent(booking.meetLink || '');
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

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
    const userTz = profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';

    mattHours.forEach(hour => {
      const dateObj = new Date(`${referenceDateStr}T${hour}:00-03:00`);
      const localTime = dateObj.toLocaleTimeString('en-US', {
        timeZone: userTz,
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
    const cachedBookings = bookingsCache[selectedWeek];
    const cachedSlots = slotsCache[selectedWeek];
    const now = Date.now();
    
    if (!force && cachedBookings && cachedSlots && (now - cachedBookings.timestamp < 15000)) {
      setBookings(cachedBookings.data);
      setAvailableSlots(cachedSlots.data);
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
      
      // Load bookings only for the selected tutor (index-free single-field filter query)
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('tutorId', '==', selectedTutor.id)
      );
      
      const snapshot = await getDocs(bookingsQuery);
      const bookingsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Booking))
        .filter(b => {
          if (!b.datetime) return false;
          const ts = b.datetime.toDate ? b.datetime.toDate().getTime() : new Date(b.datetime).getTime();
          return ts >= startUtc.getTime() && ts <= endUtc.getTime();
        });

      // Query available slots only for the selected tutor (index-free single-field filter query)
      const slotsQuery = query(
        collection(db, 'availableSlots'),
        where('tutorId', '==', selectedTutor.id)
      );

      const slotsSnapshot = await getDocs(slotsQuery);
      const slotsData = slotsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(s => {
          if (!s.date) return false;
          return s.date >= localStartStr && s.date <= localEndStr;
        });
      
      // Save to cache
      bookingsCache[selectedWeek] = { data: bookingsData, timestamp: Date.now() };
      slotsCache[selectedWeek] = { data: slotsData, timestamp: Date.now() };
      setBookings(bookingsData);
      setAvailableSlots(slotsData);
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
        
        const createCallPromise = createCalendarEvent({
          summary: `Aula de Inglês com ${selectedTutor.name}: ${studentName}`,
          description: `Sua aula particular de inglês com ${selectedTutor.name}.\nGoogle Meet: a ser acessado pelo link.`,
          startDateTime,
          endDateTime,
          attendeeEmail: studentEmail,
          attendeeName: studentName,
          tutorCalendarId: selectedTutor.calendarId
        });

        // Suppress unhandled rejection if calendar call finishes after timeout
        createCallPromise.catch(() => {});

        let timeoutId: ReturnType<typeof setTimeout>;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Calendar API response timeout')), 3500);
        });

        try {
          const calRes = await Promise.race([createCallPromise, timeoutPromise]);
          clearTimeout(timeoutId!);
          eventId = calRes.eventId;
          meetLink = calRes.meetLink;
        } catch (raceErr) {
          clearTimeout(timeoutId!);
          throw raceErr; // re-throw so outer catch handles fallback
        }
      } catch (calErr) {
        console.warn('Calendar API timeout or error, proceeding with instant meeting link:', calErr);
        // Fallback to Jitsi meet link directly
        const sanitizedName = studentName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        meetLink = `https://meet.jit.si/elo-class-${sanitizedName}-${Date.now().toString().slice(-4)}`;
        eventId = `fallback_event_${Date.now()}`;
      }
      
      await firestoreBookSlot(mattDate, mattTime, currentUserId, studentName, studentEmail, '', eventId, meetLink, selectedTutor.id, selectedTutor.name);
      
      // Create local booking object to merge optimistically
      const newBooking: Booking = {
        id: `${selectedTutor.id}_${mattDate}_${mattTime.replace(':', '')}`,
        date: mattDate,
        time: mattTime,
        userId: currentUserId,
        userName: studentName,
        tutorId: selectedTutor.id,
        tutorName: selectedTutor.name
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
      
      setSuccessBooking({
        date: date,
        time: time,
        tutorName: selectedTutor.name,
        meetLink: meetLink || ''
      });
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
  }, [selectedWeek, selectedTutor]);

  const getBooking = (dateStr: string, timeStr: string) => {
    const cellMs = parseLocalDate(dateStr, timeStr).getTime();
    
    let mattDate = '';
    let mattTime = '';
    try {
      const res = getMattLocalStrings(dateStr, timeStr);
      mattDate = res.date;
      mattTime = res.time;
    } catch (e) {
      console.error('Error converting cell timezone:', e);
    }

    return bookings.find(b => {
      const bTutorId = b.tutorId || 'matthew';
      if (bTutorId !== selectedTutor.id) {
        return false;
      }
      
      // 1. Direct timestamp matching
      if (b.datetime) {
        const bookingMs = b.datetime.seconds ? b.datetime.seconds * 1000 : new Date(b.datetime).getTime();
        if (Math.abs(bookingMs - cellMs) < 60000) {
          return true;
        }
      }
      
      // 2. String comparison (converted to Rio timezone coordinates)
      if (mattDate && mattTime && b.date && b.time) {
        const bDate = b.date.trim();
        const bTime = b.time.trim();
        const mDate = mattDate.trim();
        const mTime = mattTime.trim();
        
        const bHourMin = bTime.split(':').slice(0, 2).join(':');
        const mHourMin = mTime.split(':').slice(0, 2).join(':');
        
        if (bDate === mDate && bHourMin === mHourMin) {
          return true;
        }
      }
      
      // 3. Fallback: Parse stored Rio string directly to timestamp
      if (b.date && b.time) {
        try {
          const localIsoString = `${b.date.trim()}T${b.time.trim()}:00-03:00`;
          const bookingMs = new Date(localIsoString).getTime();
          if (Math.abs(bookingMs - cellMs) < 60000) {
            return true;
          }
        } catch (e) {}
      }

      return false;
    });
  };

  const isPast = (dateStr: string, time: string) => {
    return parseLocalDate(dateStr, time).getTime() < Date.now();
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-transparent sm:bg-slate-900/40 sm:backdrop-blur-md border-0 sm:border border-slate-800/80 rounded-xl sm:rounded-2xl shadow-none sm:shadow-xl overflow-hidden relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg backdrop-blur-md border animate-in slide-in-from-top-4 fade-in duration-300 text-center sm:text-left text-xs ${
          toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-100' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="p-3 sm:p-6 md:p-8 border-b border-white/5 bg-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              {!showTitle ? (
                <span className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Semana de {weekDates[0].toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}
                </span>
              ) : (
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Agende sua Aula
                </h2>
              )}
              {corporateCredits !== null && (
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-slate-900/60 border-slate-800 ${corporateCredits === 0 ? 'text-rose-400 border-rose-500/20' : 'text-slate-350'}`}>
                  Créditos: {corporateCredits}
                </span>
              )}
            </div>
            {showTitle && (
              <p className="text-slate-400 mt-1 text-sm md:text-base font-normal flex flex-wrap items-center gap-2">
                Semana de {weekDates[0].toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}
                <span className="text-[10px] text-slate-400 bg-slate-900/60 border border-slate-800 px-2 py-0.5 rounded-md font-mono">
                  🌐 {profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'}
                </span>
              </p>
            )}
            {!showTitle && (
              <p className="text-slate-400 mt-1 text-xs font-normal flex items-center gap-2">
                <span className="text-[10px] text-slate-400 bg-slate-900/60 border border-slate-800 px-2 py-0.5 rounded-md font-mono">
                  🌐 {profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'}
                </span>
              </p>
            )}
            {corporateCredits === 0 && (
              <p className="text-rose-400 text-xs mt-2 font-semibold bg-rose-500/5 border border-rose-500/10 px-3 py-1.5 rounded-xl inline-block">
                Você consumiu todos os seus créditos corporativos do mês. Entre em contato com seu gestor de RH.
              </p>
            )}
          </div>
          
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2.5 min-h-[38px] text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition-colors bg-slate-900/50 hover:bg-slate-800 rounded-xl border border-white/5 flex items-center justify-center gap-1.5"
              >
                ← Painel
              </button>
            )}
            <div className="flex items-center justify-between sm:justify-start gap-2 p-1 bg-slate-900/50 rounded-xl border border-white/5 flex-1 sm:flex-initial">
              <button
                onClick={() => setSelectedWeek(selectedWeek - 1)}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 min-h-[38px] text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-transparent hover:bg-white/5 rounded-lg transition-all flex items-center justify-center"
              >
                Anterior
              </button>
              <button
                onClick={() => setSelectedWeek(0)}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 min-h-[38px] text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center ${
                  selectedWeek === 0 
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setSelectedWeek(selectedWeek + 1)}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 min-h-[38px] text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-transparent hover:bg-white/5 rounded-lg transition-all flex items-center justify-center"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-white/5">
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

        {/* Tutor Profile (Boutique Model) */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-row gap-3 items-center">
            <img src={selectedTutor.photoUrl} alt={selectedTutor.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
            <div className="flex-1 text-left">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Seu Professor: {selectedTutor.name}</span>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed hidden sm:block">{selectedTutor.bio}</p>
            </div>
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
        <div className="md:hidden sticky top-0 z-20 bg-[#0f172a] flex overflow-x-auto gap-1.5 pb-3 mb-3 border-b border-white/5 scrollbar-none px-2 pt-3">
          {weekDates.map((date, idx) => {
            const dateStr = date.toLocaleDateString('en-CA');
            const isToday = dateStr === new Date().toLocaleDateString('en-CA');
            const isActive = activeMobileDay === idx;
            
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveMobileDay(idx)}
                className={`flex-1 min-w-[60px] flex flex-col items-center py-2 px-1 rounded-xl border transition-all duration-300 ${
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
        <div className="md:hidden space-y-3 px-2 pb-4">
          {timeSlots.map((time) => {
            const date = weekDates[activeMobileDay];
            const dateStr = date.toLocaleDateString('en-CA');
            const { date: mattDate, time: mattTime } = getMattLocalStrings(dateStr, time);
            const existingBooking = getBooking(dateStr, time);
            const past = isPast(dateStr, time);
            const isAvailableInDb = availableSlots.some(s => s.date === mattDate && s.time === mattTime);
            const showAsUnavailable = past || !isAvailableInDb;
            
            let slotState = 'available';
            if (existingBooking) {
              if (existingBooking.userId === currentUserId || existingBooking.uid === currentUserId) slotState = 'mine';
              else slotState = 'booked';
            }

            const slotKey = `${dateStr}_${time}`;
            const currentSlotLoading = slotLoadingMap[slotKey];

            return (
              <div key={`${dateStr}-${time}`} className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-slate-200 text-sm font-extrabold shrink-0">{time}</span>
                <div className="flex-1 max-w-[200px] h-9 relative">
                  {showAsUnavailable ? (
                    <div className="absolute inset-0 rounded-lg bg-slate-950/20 border border-slate-800 flex items-center justify-center">
                      <span className="text-[11px] text-slate-500 font-medium">— Indisponível</span>
                    </div>
                  ) : slotState === 'available' ? (
                    <button
                      onClick={() => handleBookSlot(dateStr, time)}
                      disabled={isAnySlotBooking || cancelling || currentSlotLoading === 'booking' || isCreditLocked}
                      className={`absolute inset-0 w-full h-full rounded-lg transition-all duration-300 flex items-center justify-center font-bold text-xs uppercase tracking-wider active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isCreditLocked ? 'bg-slate-900/10 border border-slate-800 text-slate-500 cursor-not-allowed opacity-60' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/25 active:bg-emerald-700'}`}
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
                      className="absolute inset-0 w-full h-full rounded-lg bg-blue-600 text-white font-bold text-[11px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/25 hover:bg-red-600 hover:shadow-red-650/20"
                    >
                      Sua Aula (Cancelar)
                    </button>
                  ) : (
                    <div className="absolute inset-0 rounded-lg bg-red-950/20 border border-red-900/20 text-red-400 text-xs font-bold flex items-center justify-center cursor-not-allowed opacity-60">
                      Ocupado ❌
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
              <div className="text-right pr-4 text-slate-500 text-xs font-bold uppercase tracking-wider pt-2">
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
                  <div className="text-right pr-4 py-3 text-slate-400 text-sm font-extrabold flex items-center justify-end transform -translate-y-0.5">
                    {time}
                  </div>
                  
                  {/* Slots for each day */}
                  {weekDates.map((date) => {
                    const dateStr = date.toLocaleDateString('en-CA');
                    const { date: mattDate, time: mattTime } = getMattLocalStrings(dateStr, time);
                    const existingBooking = getBooking(dateStr, time);
                    const past = isPast(dateStr, time);
                    const isAvailableInDb = availableSlots.some(s => s.date === mattDate && s.time === mattTime);
                    const showAsUnavailable = past || !isAvailableInDb;
                    
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
                            <span className="text-xs text-slate-500 font-medium">—</span>
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
                                 <span className="text-sm font-bold tracking-wide text-slate-400">Bloqueado</span>
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
                          // Booked by someone else (faded red)
                          <div className="absolute inset-0 rounded-xl bg-red-950/20 border border-red-900/20 flex flex-col items-center justify-center cursor-not-allowed overflow-hidden opacity-60">
                            <span className="text-sm font-bold text-red-400">Ocupado ❌</span>
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
      {successBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative text-center">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <span className="text-2xl">🎉</span>
            </div>
            
            <h3 className="text-xl font-bold text-white tracking-tight">
              Aula Reservada!
            </h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              Sua aula particular de inglês com o professor <strong>{successBooking.tutorName}</strong> foi confirmada.
            </p>
            
            <div className="my-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-left space-y-2">
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
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
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
                className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 active:scale-95 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700/50"
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
