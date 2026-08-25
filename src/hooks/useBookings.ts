import { useState, useEffect } from 'react';
import { onSnapshot, query, collection } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { Booking } from '../types';

export function useBookings(uid: string, userEmail?: string) {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    // Initial optimistic hydration from localStorage if available
    try {
      if (uid && typeof window !== 'undefined') {
        const storedKeys: string[] = JSON.parse(localStorage.getItem(`elo_booked_slots_${uid}`) || '[]');
        return storedKeys.map(k => {
          const [date, time] = k.split('_');
          return {
            id: `opt_${k}`,
            userId: uid,
            uid,
            userName: 'Estudante',
            userEmail: userEmail || '',
            date,
            time,
            duration: 60,
            status: 'confirmed' as const,
            tutorId: 'matt',
            tutorName: 'Professor Matt',
            meetLink: 'https://eloingles.com.br/classroom',
            createdAt: new Date()
          } as Booking;
        });
      }
    } catch (e) {}
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || uid === 'guest_user') {
      setBookings([]);
      setLoading(false);
      return;
    }

    const emailLower = (userEmail || '').toLowerCase().trim();

    // Universal real-time listener for bookings collection
    const bQuery = query(collection(db, 'bookings'));
    const unsubscribe = onSnapshot(
      bQuery,
      (snapshot) => {
        const matched = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            } as Booking;
          })
          .filter(b => {
            if (b.status === 'cancelled') return false;
            const bUserId = (b.userId || (b as any).uid || '').trim();
            const bUserEmail = (b.userEmail || (b as any).studentEmail || '').toLowerCase().trim();
            
            const matchesUid = uid && (bUserId === uid || bUserId === (b as any).uid);
            const matchesEmail = emailLower && bUserEmail === emailLower;
            
            return matchesUid || matchesEmail;
          });

        // Parse and sort bookings ascending by date and time
        matched.sort((a, b) => {
          const [yA, mA, dA] = (a.date || '').split('-').map(Number);
          const [hA, minA] = (a.time || '00:00').split(':').map(Number);
          const timeA = new Date(yA || 2026, (mA || 1) - 1, dA || 1, hA || 0, minA || 0).getTime();

          const [yB, mB, dB] = (b.date || '').split('-').map(Number);
          const [hB, minB] = (b.time || '00:00').split(':').map(Number);
          const timeB = new Date(yB || 2026, (mB || 1) - 1, dB || 1, hB || 0, minB || 0).getTime();

          return timeA - timeB;
        });

        setBookings(matched);
        setLoading(false);
      },
      (err) => {
        console.warn('Real-time bookings sync warning:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid, userEmail]);

  return { bookings, loading, error };
}

