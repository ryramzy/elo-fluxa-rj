import { useState, useEffect } from 'react';
import { onSnapshot, query, where, orderBy, limit, Timestamp, collection } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { Booking } from '../lib/firestore';

export function useBookings(uid: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const now = new Date();
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'bookings'),
        where('uid', '==', uid),
        where('datetime', '>=', Timestamp.fromDate(now)),
        where('status', 'in', ['booked', 'completed']),
        orderBy('datetime', 'asc'),
        limit(10)
      ),
      (querySnapshot) => {
        const bookingData = querySnapshot.docs.map(doc => ({
          uid: doc.data().uid,
          studentName: doc.data().studentName,
          studentEmail: doc.data().studentEmail,
          datetime: doc.data().datetime,
          status: doc.data().status,
          calendarEventId: doc.data().calendarEventId,
          createdAt: doc.data().createdAt,
          id: doc.id
        }));

        setBookings(bookingData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching bookings:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { bookings, loading, error };
}
