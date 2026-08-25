import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, query, collection } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { Booking } from '../types';

/**
 * Reads cached bookings for a user from localStorage, filtering out expired past classes (TTL).
 */
function getCachedBookingsWithTTL(uid: string, userEmail?: string): Booking[] {
  if (!uid || typeof window === 'undefined' || uid === 'guest_user') return [];
  
  try {
    const rawCached = localStorage.getItem(`elo_cached_bookings_${uid}`);
    const now = Date.now();
    let validBookings: Booking[] = [];

    if (rawCached) {
      const parsed: Booking[] = JSON.parse(rawCached);
      // Filter out bookings that took place more than 2 hours ago (TTL expiration)
      validBookings = parsed.filter(b => {
        if (!b.date) return false;
        const [y, m, d] = b.date.split('-').map(Number);
        const [h, min] = (b.time || '00:00').split(':').map(Number);
        const classTime = new Date(y || 2026, (m || 1) - 1, d || 1, (h || 0) + 2, min || 0).getTime();
        return classTime >= now;
      });

      // Write sanitized cache back to localStorage
      if (validBookings.length !== parsed.length) {
        localStorage.setItem(`elo_cached_bookings_${uid}`, JSON.stringify(validBookings));
      }
    }

    // Also check legacy slot keys
    const rawKeys = localStorage.getItem(`elo_booked_slots_${uid}`);
    if (rawKeys) {
      const keys: string[] = JSON.parse(rawKeys);
      keys.forEach(k => {
        const [date, time] = k.split('_');
        if (!validBookings.some(b => b.date === date && b.time === time)) {
          const [y, m, d] = (date || '').split('-').map(Number);
          const [h, min] = (time || '00:00').split(':').map(Number);
          const classTime = new Date(y || 2026, (m || 1) - 1, d || 1, (h || 0) + 2, min || 0).getTime();
          if (classTime >= now) {
            validBookings.push({
              id: `opt_${k}`,
              userId: uid,
              uid,
              userName: 'Estudante',
              userEmail: userEmail || '',
              date,
              time,
              duration: 60,
              status: 'confirmed',
              tutorId: 'matt',
              tutorName: 'Professor Matt',
              meetLink: 'https://eloingles.com.br/classroom',
              createdAt: new Date()
            } as Booking);
          }
        }
      });
    }

    return validBookings;
  } catch (e) {
    console.warn('Error hydrating cached bookings:', e);
    return [];
  }
}

export function useBookings(uid: string, userEmail?: string) {
  const [bookings, setBookings] = useState<Booking[]>(() => 
    getCachedBookingsWithTTL(uid, userEmail)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to sort bookings by chronological ascending date and time
  const sortBookings = useCallback((list: Booking[]): Booking[] => {
    return [...list].sort((a, b) => {
      const [yA, mA, dA] = (a.date || '').split('-').map(Number);
      const [hA, minA] = (a.time || '00:00').split(':').map(Number);
      const timeA = new Date(yA || 2026, (mA || 1) - 1, dA || 1, hA || 0, minA || 0).getTime();

      const [yB, mB, dB] = (b.date || '').split('-').map(Number);
      const [hB, minB] = (b.time || '00:00').split(':').map(Number);
      const timeB = new Date(yB || 2026, (mB || 1) - 1, dB || 1, hB || 0, minB || 0).getTime();

      return timeA - timeB;
    });
  }, []);

  useEffect(() => {
    if (!uid || uid === 'guest_user') {
      setBookings([]);
      setLoading(false);
      return;
    }

    const emailLower = (userEmail || '').toLowerCase().trim();

    // 1. Listen for instant local booking creation custom events
    const handleBookingCreated = (e: Event) => {
      const customEvent = e as CustomEvent<Booking>;
      if (customEvent.detail) {
        const newBooking = customEvent.detail;
        setBookings(prev => {
          const filtered = prev.filter(b => !(b.date === newBooking.date && b.time === newBooking.time));
          return sortBookings([...filtered, newBooking]);
        });
      }
    };

    // 2. Listen for cross-tab storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `elo_cached_bookings_${uid}` || e.key === `elo_booked_slots_${uid}`) {
        const cached = getCachedBookingsWithTTL(uid, userEmail);
        setBookings(prev => {
          // Merge cached with existing
          const merged = [...prev];
          cached.forEach(c => {
            if (!merged.some(m => m.date === c.date && m.time === c.time)) {
              merged.push(c);
            }
          });
          return sortBookings(merged);
        });
      }
    };

    window.addEventListener('elo_booking_created', handleBookingCreated);
    window.addEventListener('storage', handleStorageChange);

    // 3. Universal real-time listener for Firestore bookings collection
    const bQuery = query(collection(db, 'bookings'));
    const unsubscribeFirestore = onSnapshot(
      bQuery,
      (snapshot) => {
        const firestoreMatched = snapshot.docs
          .map(doc => {
            const data = doc.data();
            // Normalize legacy 'booked' status to 'confirmed'
            const rawStatus = data.status === 'booked' ? 'confirmed' : (data.status || 'confirmed');
            return {
              id: doc.id,
              ...data,
              status: rawStatus,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            } as Booking;
          })
          .filter(b => {
            if (b.status === 'cancelled') return false;
            const bUserId = (b.userId || (b as any).uid || '').trim();
            const bUserEmail = (b.userEmail || (b as any).studentEmail || '').toLowerCase().trim();
            
            const matchesUid = uid && (bUserId === uid || bUserId === (b as any).uid || b.id.includes(uid));
            const matchesEmail = emailLower && bUserEmail === emailLower;
            
            return matchesUid || matchesEmail;
          });

        // Merge with active local optimistic cache to guarantee 0ms persistence
        const cached = getCachedBookingsWithTTL(uid, userEmail);
        const combined = [...firestoreMatched];
        
        cached.forEach(c => {
          // Add if not present in firestore snapshot yet
          if (!combined.some(f => f.date === c.date && f.time === c.time)) {
            combined.push(c);
          }
        });

        setBookings(sortBookings(combined));
        setLoading(false);
      },
      (err) => {
        console.warn('Real-time bookings sync warning:', err);
        setLoading(false);
      }
    );

    // Cleanup all listeners on unmount
    return () => {
      window.removeEventListener('elo_booking_created', handleBookingCreated);
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeFirestore();
    };
  }, [uid, userEmail, sortBookings]);

  return { bookings, loading, error };
}

