import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firestore';
import { AppError, getErrorMessage, logError } from '../../utils/errorHandling';

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  duration: number;
  available: boolean;
  status: string;
  bookedBy?: string;
  bookedByName?: string;
}

interface VisualSlotPickerProps {
  onSlotSelect: (slot: TimeSlot) => void;
  selectedDate?: string;
}

export const VisualSlotPicker: React.FC<VisualSlotPickerProps> = ({
  onSlotSelect
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [currentUserId] = useState('current-user-id'); // In a real app, from auth context
  
  const [toast, setToast] = useState<{message: string, type: 'error'|'success'} | null>(null);

  const showToast = (message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fixed time slots from 8:00 to 21:00
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00'
  ];

  // Get Monday to Friday dates
  const getWeekDates = (offset: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    // If Sunday (0), offset by -6 to get Monday. Otherwise 1 - currentDay.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + (offset * 7));
    
    const weekDates = [];
    // Only 5 days (Monday to Friday)
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(selectedWeek);

  const loadWeekSlots = async () => {
    setLoading(true);
    setToast(null);
    
    try {
      const weekStart = weekDates[0].toISOString().split('T')[0];
      const weekEnd = weekDates[4].toISOString().split('T')[0];
      
      const slotsQuery = query(
        collection(db, 'slots'),
        where('date', '>=', weekStart),
        where('date', '<=', weekEnd),
        orderBy('date'),
        orderBy('time')
      );
      
      const snapshot = await getDocs(slotsQuery);
      const slotsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TimeSlot));
      
      setSlots(slotsData);
    } catch (err) {
      logError(err, { action: 'loadWeekSlots', selectedWeek });
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const bookSlot = async (slot: TimeSlot) => {
    if (booking || cancelling) return;
    setBooking(true);
    
    try {
      if (!slot.available) {
        throw new AppError('This time slot is no longer available', 'SLOT_NOT_AVAILABLE');
      }
      
      const testUserName = 'Current Student';
      
      await updateDoc(doc(db, 'slots', slot.id), {
        available: false,
        status: 'booked',
        bookedBy: currentUserId,
        bookedByName: testUserName,
        updatedAt: serverTimestamp()
      });
      
      await loadWeekSlots();
      showToast('Slot booked successfully!', 'success');
      
      if (onSlotSelect) {
        onSlotSelect(slot);
      }
    } catch (err) {
      logError(err, { action: 'bookSlot', slotId: slot.id });
      showToast(getErrorMessage(err), 'error');
    } finally {
      setBooking(false);
    }
  };

  const cancelSlot = async (slot: TimeSlot) => {
    if (booking || cancelling) return;
    setCancelling(true);
    
    try {
      if (slot.bookedBy !== currentUserId) {
        throw new AppError('You can only cancel your own bookings', 'PERMISSION_DENIED');
      }
      
      await updateDoc(doc(db, 'slots', slot.id), {
        available: true,
        status: 'available',
        bookedBy: null,
        bookedByName: null,
        updatedAt: serverTimestamp()
      });
      
      await loadWeekSlots();
      showToast('Slot cancelled successfully!', 'success');
    } catch (err) {
      logError(err, { action: 'cancelSlot', slotId: slot.id });
      showToast(getErrorMessage(err), 'error');
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    loadWeekSlots();
  }, [selectedWeek]);

  // Find a slot for a specific date and time
  const getSlot = (dateStr: string, time: string) => {
    return slots.find(s => s.date === dateStr && s.time === time);
  };

  // Check if a time is in the past
  const isPast = (dateStr: string, time: string) => {
    return new Date(`${dateStr}T${time}:00`) < new Date();
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
            <span className="text-xs font-medium text-slate-400">Booked/Unavailable</span>
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
                const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
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
                    const dateStr = date.toISOString().split('T')[0];
                    const slot = getSlot(dateStr, time);
                    const past = isPast(dateStr, time);
                    
                    let slotState = 'empty';
                    if (slot) {
                      if (slot.available) slotState = 'available';
                      else if (slot.bookedBy === currentUserId) slotState = 'mine';
                      else slotState = 'booked';
                    }

                    return (
                      <div key={`${dateStr}-${time}`} className="relative h-14">
                        {past ? (
                          // Past slot
                          <div className="absolute inset-0 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                            <span className="text-xs text-slate-600 font-medium">—</span>
                          </div>
                        ) : slotState === 'empty' ? (
                          // No slot created by admin
                          <div className="absolute inset-0 rounded-xl bg-slate-900/30 border border-white/5 border-dashed flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-slate-600 font-medium">Closed</span>
                          </div>
                        ) : slotState === 'available' ? (
                          // Available slot
                          <button
                            onClick={() => bookSlot(slot!)}
                            disabled={booking || cancelling}
                            className="absolute inset-0 w-full rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300 flex flex-col items-center justify-center group/btn active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-sm font-bold tracking-wide">Available</span>
                            <span className="text-[10px] opacity-0 group-hover/btn:opacity-100 transition-opacity uppercase tracking-wider mt-0.5">Click to Book</span>
                          </button>
                        ) : slotState === 'mine' ? (
                          // User's booking
                          <button
                            onClick={() => cancelSlot(slot!)}
                            disabled={booking || cancelling}
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
