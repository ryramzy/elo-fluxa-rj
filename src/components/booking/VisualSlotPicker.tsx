import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db, bookSlot as firestoreBookSlot, cancelBooking as firestoreCancelBooking } from '../../lib/firestore';
import { getErrorMessage, logError } from '../../utils/errorHandling';
import { useAuth } from '../../hooks/useAuth';
import { createCalendarEvent } from '../../lib/googleCalendar';

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

export const VisualSlotPicker: React.FC<VisualSlotPickerProps> = ({
  onSlotSelect
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [slotLoadingMap, setSlotLoadingMap] = useState<Record<string, 'idle' | 'booking' | 'success' | 'error'>>({});
  const [cancelling, setCancelling] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const { user } = useAuth();
  const currentUserId = user?.uid || '';

  const isAnySlotBooking = Object.values(slotLoadingMap).some(status => status === 'booking');
  
  const [toast, setToast] = useState<{message: string, type: 'error'|'success'} | null>(null);

  const showToast = (message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper to parse dates robustly across all browsers (including Safari and iOS)
  const parseLocalDate = (dateStr: string, timeStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, 0);
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

  const loadWeekBookings = async () => {
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

    const slotKey = `${date}_${time}`;
    if (slotLoadingMap[slotKey] === 'booking' || cancelling) return;

    // Interactive confirmation to give the user immediate feedback that their click was registered
    const confirmMessage = `Deseja agendar a sua aula para o dia ${date.split('-').reverse().join('/')} às ${time}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

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

      // Optimistically merge into local state array to trigger immediate re-render
      setBookings(prev => [...prev, newBooking]);
      setSlotLoadingMap(prev => ({ ...prev, [slotKey]: 'success' }));

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
      showToast(err.message || 'Failed to book slot.', 'error');
      // Rollback target slot loading status
      setSlotLoadingMap(prev => ({ ...prev, [slotKey]: 'error' }));
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (isAnySlotBooking || cancelling) return;
    setCancelling(true);
    
    try {
      await firestoreCancelBooking(bookingId);
      
      // Optimistically remove from state
      setBookings(prev => prev.filter(b => b.id !== bookingId));
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
    const { date: mattDate, time: mattTime } = getMattLocalStrings(dateStr, timeStr);
    return bookings.find(b => {
      if (b.date && b.time) {
        return b.date === mattDate && b.time === mattTime;
      }
      if (b.datetime) {
        const cellMs = parseLocalDate(dateStr, timeStr).getTime();
        const bookingMs = b.datetime.seconds * 1000;
        return Math.abs(bookingMs - cellMs) < 60000;
      }
      return false;
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
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Book Your Class
            </h2>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Week of {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-slate-900/50 rounded-xl border border-white/5">
            <button
              onClick={() => setSelectedWeek(selectedWeek - 1)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-transparent hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              Previous
            </button>
            <button
              onClick={() => setSelectedWeek(0)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                selectedWeek === 0 
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedWeek(selectedWeek + 1)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-transparent hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              Next
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
            <span className="text-xs font-medium text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500/80 shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
            <span className="text-xs font-medium text-slate-300">Your Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-700/80" />
            <span className="text-xs font-medium text-slate-400">Booked by Others</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="relative p-6 md:p-8 bg-[#0f172a]/40 min-h-[500px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm z-10">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="mt-4 text-slate-400 font-medium">Loading availability...</p>
          </div>
        ) : null}

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[800px]">
            {/* Days Header */}
            <div className="grid grid-cols-6 gap-4 mb-4">
              <div className="text-right pr-4 text-slate-500 text-xs font-medium uppercase tracking-wider pt-2">
                Time
              </div>
              {weekDates.map((date, i) => {
                const dateStr = date.toLocaleDateString('en-CA');
                const isToday = dateStr === new Date().toLocaleDateString('en-CA');
                return (
                  <div key={i} className={`flex flex-col items-center p-3 rounded-2xl transition-all ${isToday ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-transparent'}`}>
                    <span className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-400' : 'text-slate-300'}`}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className={`text-2xl font-bold ${isToday ? 'text-white' : 'text-slate-400'}`}>
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
                  <div className="text-right pr-4 py-3 text-slate-400 text-sm font-medium flex items-center justify-end transform -translate-y-0.5">
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
                      if (existingBooking.userId === currentUserId) slotState = 'mine';
                      else slotState = 'booked';
                    }

                    const slotKey = `${dateStr}_${time}`;
                    const currentSlotLoading = slotLoadingMap[slotKey];

                    return (
                      <div key={`${dateStr}-${time}`} className="relative h-14">
                        {showAsUnavailable ? (
                          // Unavailable slot
                          <div className="absolute inset-0 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                            <span className="text-xs text-slate-600 font-medium">—</span>
                          </div>
                        ) : slotState === 'available' ? (
                          // Available slot
                          <button
                            onClick={() => handleBookSlot(dateStr, time)}
                            disabled={isAnySlotBooking || cancelling || currentSlotLoading === 'booking'}
                            className="absolute inset-0 w-full rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300 flex flex-col items-center justify-center group/btn active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {currentSlotLoading === 'booking' ? (
                              <div className="flex flex-col items-center justify-center">
                                <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                                <span className="text-[9px] text-emerald-400/80 mt-1 uppercase tracking-wider">Booking...</span>
                              </div>
                            ) : (
                              <>
                                <span className="text-sm font-bold tracking-wide">Available</span>
                                <span className="text-[10px] opacity-0 group-hover/btn:opacity-100 transition-opacity uppercase tracking-wider mt-0.5">Click to Book</span>
                              </>
                            )}
                          </button>
                        ) : slotState === 'mine' ? (
                          // User's booking
                          <button
                            onClick={() => handleCancelBooking(existingBooking!.id)}
                            disabled={isAnySlotBooking || cancelling}
                            className="absolute inset-0 w-full rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all duration-300 flex flex-col items-center justify-center group/btn active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-sm font-bold tracking-wide group-hover/btn:hidden">Your Class</span>
                            <span className="text-sm font-bold tracking-wide hidden group-hover/btn:block">Cancel?</span>
                          </button>
                        ) : (
                          // Booked by someone else
                          <div className="absolute inset-0 rounded-xl bg-slate-800/60 border border-white/5 flex flex-col items-center justify-center cursor-not-allowed overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/50" />
                            <span className="text-sm font-medium text-slate-500 relative z-10">Booked</span>
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
