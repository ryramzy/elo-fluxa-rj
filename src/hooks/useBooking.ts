import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useUserProfile } from './useUserProfile';
import { 
  getAvailableSlots, 
  bookSlot, 
  getUserBookings, 
  cancelBooking 
} from '../lib/firestore';
import type { TimeSlot, Booking } from '../types';

export const useBooking = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid || '');
  
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Week navigation
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekRange = (offset: number) => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    // Optimized range: current week + 2 weeks ahead for better performance
    const fromDate = monday.toISOString().split('T')[0];
    const toDate = new Date(monday);
    toDate.setDate(monday.getDate() + 21); // 3 weeks total
    const toDateStr = toDate.toISOString().split('T')[0];
    
    console.log('Loading slots from:', fromDate, 'to:', toDateStr);
    
    return {
      from: fromDate,
      to: toDateStr,
      label: 'Horários Disponíveis',
    };
  };

  const loadData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const { from, to } = getWeekRange(weekOffset);
      console.log('🔄 Loading agenda data for user:', user.email);
      const [available, userBookings] = await Promise.all([
        getAvailableSlots(from, to),
        getUserBookings(user.uid),
      ]);
      console.log('📊 Loaded slots:', available.length, 'User bookings:', userBookings.length);
      console.log('📅 Available slots:', available);
      setSlots(available);
      setMyBookings(userBookings);
    } catch (err) {
      console.error('❌ Error loading agenda:', err);
      setError('Erro ao carregar horários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (selectedSlot: TimeSlot, notes: string) => {
    if (!selectedSlot || !user) throw new Error('Slot or user missing');
    
    setBooking(true);
    setError(null);
    try {
      const bookingId = await bookSlot(
        selectedSlot.id,
        user.uid,
        profile?.displayName || user.displayName || 'Aluno',
        user.email || '',
        notes
      );

      setSlots(prev => prev.filter(s => s.id !== selectedSlot.id));
      await loadData();
      return bookingId;
    } catch (err: any) {
      if (err.message === 'SLOT_UNAVAILABLE') {
        setError('Este horário acabou de ser reservado. Escolha outro.');
        await loadData();
      } else {
        setError('Erro ao agendar. Tente novamente.');
      }
      throw err;
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (booking: Booking) => {
    if (!user) throw new Error('User not found');
    
    try {
      await cancelBooking(booking.id, booking.slotId, booking.googleEventId);
      await loadData();
    } catch {
      setError('Erro ao cancelar. Tente novamente.');
      throw new Error('Cancel failed');
    }
  };

  useEffect(() => { loadData(); }, [user?.uid, weekOffset]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });

  const upcomingBookings = myBookings.filter(
    b => b.status === 'confirmed' && b.date >= 
      new Date().toISOString().split('T')[0]
  );
  
  const pastBookings = myBookings.filter(
    b => b.status === 'completed' || 
      b.date < new Date().toISOString().split('T')[0]
  );

  return {
    slots,
    myBookings,
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
  };
};
