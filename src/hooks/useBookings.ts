import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { Booking } from '../types';

export function useBookings(uid: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setBookings([]);
      setLoading(false);
      return;
    }

    // Query bookings where userId matches the student's UID
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          } as Booking;
        });

        // Sort bookings in memory: date ascending, then time ascending
        bookingsData.sort((a, b) => {
          const dateTimeA = `${a.date}T${a.time}`;
          const dateTimeB = `${b.date}T${b.time}`;
          return dateTimeA.localeCompare(dateTimeB);
        });

        setBookings(bookingsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching user bookings:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { bookings, loading, error };
}
