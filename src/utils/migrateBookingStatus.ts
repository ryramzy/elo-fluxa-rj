import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firestore';

/**
 * Normalizes legacy Firestore booking documents that have status: 'booked'
 * to canonical status: 'confirmed'. Runs idempotently and only once per session.
 */
export async function migrateBookingStatus(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // Only run once per session
  if (sessionStorage.getItem('elo_booking_status_migrated') === 'true') {
    return;
  }

  try {
    const bookedQuery = query(collection(db, 'bookings'), where('status', '==', 'booked'));
    const snapshot = await getDocs(bookedQuery);

    if (!snapshot.empty) {
      console.log(`[Migration] Found ${snapshot.size} legacy 'booked' documents. Normalizing to 'confirmed'...`);
      const updates = snapshot.docs.map(async (d) => {
        const bookingRef = doc(db, 'bookings', d.id);
        await updateDoc(bookingRef, { status: 'confirmed' });
      });
      await Promise.all(updates);
      console.log('[Migration] All legacy booking statuses normalized to confirmed.');
    }

    sessionStorage.setItem('elo_booking_status_migrated', 'true');
  } catch (err) {
    console.warn('[Migration] Booking status normalization skipped or failed:', err);
  }
}
