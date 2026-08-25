import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, query, collection } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { Booking } from '../types';

/**
 * Reads cached bookings for a user from localStorage, filtering out expired past classes (TTL).
 * Automatically cleans up any obsolete legacy keys.
 */
function getCachedBookingsWithTTL(uid: string, userEmail?: string): Booking[] {
  if (!uid || typeof window === 'undefined' || uid === 'guest_user') return [];
  
  try {
    // Purge obsolete legacy string-only array if present
    localStorage.removeItem(`elo_booked_slots_${uid}`);

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

  // Helper to sort bookings chronologically and strictly deduplicate by date + time
  const sortAndDeduplicateBookings = useCallback((list: Booking[]): Booking[] => {
    const seen = new Set<string>();
    const deduplicated: Booking[] = [];

    const sorted = [...list].sort((a, b) => {
      const [yA, mA, dA] = (a.date || '').split('-').map(Number);
      const [hA, minA] = (a.time || '00:00').split(':').map(Number);
      const timeA = new Date(yA || 2026, (mA || 1) - 1, dA || 1, hA || 0, minA || 0).getTime();

      const [yB, mB, dB] = (b.date || '').split('-').map(Number);
      const [hB, minB] = (b.time || '00:00').split(':').map(Number);
      const timeB = new Date(yB || 2026, (mB || 1) - 1, dB || 1, hB || 0, minB || 0).getTime();

      return timeA - timeB;
    });

    for (const item of sorted) {
      if (!item.date) continue;
      const key = `${item.date.trim()}_${(item.time || '00:00').slice(0, 5)}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    }

    return deduplicated;
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
          const filtered = prev.filter(b => !(b.date === newBooking.date && (b.time || '').slice(0, 5) === (newBooking.time || '').slice(0, 5)));
          return sortAndDeduplicateBookings([...filtered, newBooking]);
        });
      }
    };

    // 2. Listen for cross-tab storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `elo_cached_bookings_${uid}`) {
        const cached = getCachedBookingsWithTTL(uid, userEmail);
        setBookings(prev => {
          const merged = [...prev];
          cached.forEach(c => {
            if (!merged.some(m => m.date === c.date && (m.time || '').slice(0, 5) === (c.time || '').slice(0, 5))) {
              merged.push(c);
            }
          });
          return sortAndDeduplicateBookings(merged);
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
          if (!combined.some(f => f.date === c.date && (f.time || '').slice(0, 5) === (c.time || '').slice(0, 5))) {
            combined.push(c);
          }
        });

        const finalBookings = sortAndDeduplicateBookings(combined);
        setBookings(finalBookings);

        // Keep localStorage aligned with confirmed bookings
        try {
          if (firestoreMatched.length > 0) {
            localStorage.setItem(`elo_cached_bookings_${uid}`, JSON.stringify(finalBookings));
          }
        } catch (e) {}

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
  }, [uid, userEmail, sortAndDeduplicateBookings]);

  return { bookings, loading, error };
}

