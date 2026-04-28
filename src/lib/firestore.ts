import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  getFirestore,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  writeBatch,
  addDoc,
  Timestamp,
  limit
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { TimeSlot, Booking } from '../types';
import { createCalendarEvent, cancelCalendarEvent } from './googleCalendar';

// Types
export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: Timestamp;
  badgesEarned: string[];
  createdAt: Timestamp;
  plan: 'free' | 'pro' | 'elite';
  planActivatedAt: Timestamp | null;
  bookingsThisMonth: number;
  bookingLimit: number;
}

export interface Enrollment {
  courseId: string;
  enrolledAt: Timestamp;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  xpEarned: number;
}

export interface LegacyBooking {
  uid: string;
  studentName: string;
  studentEmail: string;
  datetime: Timestamp;
  status: 'booked' | 'confirmed' | 'completed' | 'cancelled';
  calendarEventId?: string;
  createdAt: Timestamp;
}

export interface AvailableSlot {
  datetime: Timestamp;
  status: 'open' | 'booked';
  createdAt: Timestamp;
}

// Helper functions
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(collection(db, 'users'), uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function updateUserXP(uid: string, xpToAdd: number): Promise<void> {
  try {
    const userRef = doc(collection(db, 'users'), uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentXP = userDoc.data()?.xp || 0;
      const newXP = currentXP + xpToAdd;
      const newLevel = calculateLevel(newXP);
      
      await updateDoc(userRef, {
        xp: newXP,
        level: newLevel.level,
        lastActiveDate: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating user XP:', error);
    throw error;
  }
}

export async function getUserEnrollments(uid: string): Promise<Enrollment[]> {
  try {
    const enrollmentsQuery = query(
      collection(db, `users/${uid}/courses`),
      orderBy('enrolledAt', 'desc')
    );
    const querySnapshot = await getDocs(enrollmentsQuery);
    
    return querySnapshot.docs.map(doc => ({
      courseId: doc.data().courseId,
      enrolledAt: doc.data().enrolledAt,
      progress: doc.data().progress,
      lessonsCompleted: doc.data().lessonsCompleted,
      totalLessons: doc.data().totalLessons,
      xpEarned: doc.data().xpEarned,
      id: doc.id
    } as Enrollment));
  } catch (error) {
    console.error('Error getting user enrollments:', error);
    throw error;
  }
}

export async function getUpcomingBookings(uid: string): Promise<LegacyBooking[]> {
  try {
    const now = new Date();
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('uid', '==', uid),
      where('datetime', '>=', Timestamp.fromDate(now)),
      where('status', 'in', ['booked', 'completed']),
      orderBy('datetime', 'asc'),
      limit(10)
    );
    const querySnapshot = await getDocs(bookingsQuery);
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.data().uid,
      studentName: doc.data().studentName,
      studentEmail: doc.data().studentEmail,
      datetime: doc.data().datetime,
      status: doc.data().status,
      calendarEventId: doc.data().calendarEventId,
      createdAt: doc.data().createdAt,
      id: doc.id
    } as LegacyBooking));
  } catch (error) {
    console.error('Error getting upcoming bookings:', error);
    throw error;
  }
}

export async function createBooking(uid: string, datetime: Date): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const bookingData = {
      uid,
      studentName: user.displayName || 'Unknown',
      studentEmail: user.email || 'unknown@example.com',
      datetime: Timestamp.fromDate(datetime),
      status: 'booked' as const,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

export async function updateStreak(uid: string): Promise<void> {
  try {
    const userRef = doc(collection(db, 'users'), uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      const lastActive = userData.lastActiveDate?.toDate() || new Date(0);
      const today = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      
      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / oneDay);
      let newStreak = userData.streakDays || 1;
      
      if (daysDiff === 1) {
        newStreak = userData.streakDays + 1;
      } else if (daysDiff > 1) {
        newStreak = 1;
      }
      
      await updateDoc(userRef, {
        streakDays: newStreak,
        lastActiveDate: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
}

// Helper function to calculate level from XP
function calculateLevel(xp: number): { level: number; name: string } {
  if (xp < 500) return { level: 1, name: 'Beginner' };
  if (xp < 1000) return { level: 2, name: 'Explorer' };
  if (xp < 2000) return { level: 3, name: 'Conversationalist' };
  if (xp < 3000) return { level: 4, name: 'Rising Star' };
  if (xp < 5000) return { level: 5, name: 'Fluent' };
  return { level: 6, name: 'Native Flow' };
}

// Admin helper functions
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(usersQuery);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      uid: doc.id
    } as UserProfile & { uid: string }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

export async function getAllBookings(): Promise<(LegacyBooking & { uid: string })[]> {
  try {
    const bookingsQuery = query(
      collection(db, 'bookings'),
      orderBy('datetime', 'asc')
    );
    const querySnapshot = await getDocs(bookingsQuery);
    
    const bookings = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      uid: doc.id
    } as LegacyBooking & { uid: string }));

    // Join with user data
    const bookingsWithUserDetails = await Promise.all(
      bookings.map(async (booking) => {
        const userDoc = await getDoc(doc(collection(db, 'users'), booking.uid));
        const userData = userDoc.data();
        return {
          ...booking,
          displayName: userData?.displayName || 'Unknown',
          email: userData?.email || 'unknown@example.com'
        };
      })
    );

    return bookingsWithUserDetails;
  } catch (error) {
    console.error('Error getting all bookings:', error);
    throw error;
  }
}

export async function updateBookingStatus(bookingId: string, status: 'booked' | 'confirmed' | 'completed' | 'cancelled'): Promise<void> {
  try {
    const bookingRef = doc(collection(db, 'bookings'), bookingId);
    await updateDoc(bookingRef, { status });
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
}

export async function getAllEnrollments(): Promise<{ courseId: string; uid: string; progress: number; xpEarned: number }[]> {
  try {
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    
    const allEnrollments: { courseId: string; uid: string; progress: number; xpEarned: number }[] = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const uid = userDoc.id;
      const enrollmentsQuery = query(
        collection(db, 'users', uid, 'courses')
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      
      enrollmentsSnapshot.docs.forEach(enrollmentDoc => {
        const data = enrollmentDoc.data();
        allEnrollments.push({
          courseId: data.courseId,
          uid,
          progress: data.progress,
          xpEarned: data.xpEarned
        });
      });
    }
    
    return allEnrollments;
  } catch (error) {
    console.error('Error getting all enrollments:', error);
    throw error;
  }
}

// Available slots functions (legacy - replaced by TimeSlot-based getAvailableSlots below)
// export async function getAvailableSlots(): Promise<(AvailableSlot & { id: string })[]> {
//   try {
//     const slotsQuery = query(
//       collection(db, 'availableSlots'),
//       where('status', '==', 'open'),
//       orderBy('datetime', 'asc')
//     );
//     const querySnapshot = await getDocs(slotsQuery);
//     
//     return querySnapshot.docs.map(doc => ({
//       ...doc.data(),
//       id: doc.id
//     } as AvailableSlot & { id: string }));
//   } catch (error) {
//     console.error('Error getting available slots:', error);
//     throw error;
//   }
// }

export async function createAvailableSlot(datetime: Date): Promise<string> {
  try {
    const slotData = {
      datetime: Timestamp.fromDate(datetime),
      status: 'open' as const,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'availableSlots'), slotData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating available slot:', error);
    throw error;
  }
}

export async function bookAvailableSlot(slotId: string, uid: string): Promise<void> {
  try {
    const slotRef = doc(collection(db, 'availableSlots'), slotId);
    await updateDoc(slotRef, { status: 'booked' });
  } catch (error) {
    console.error('Error booking available slot:', error);
    throw error;
  }
}

// Plan management functions
export async function updateUserPlan(uid: string, plan: 'free' | 'pro' | 'elite'): Promise<void> {
  try {
    const userRef = doc(collection(db, 'users'), uid);
    const bookingLimits = {
      free: 1,
      pro: 4,
      elite: 999
    };
    
    await updateDoc(userRef, {
      plan,
      planActivatedAt: serverTimestamp(),
      bookingLimit: bookingLimits[plan]
    });
  } catch (error) {
    console.error('Error updating user plan:', error);
    throw error;
  }
}

export async function checkCourseAccess(uid: string, courseId: string): Promise<{ canAccess: boolean; reason?: string }> {
  try {
    const userDoc = await getDoc(doc(collection(db, 'users'), uid));
    if (!userDoc.exists()) {
      return { canAccess: false, reason: 'User profile not found' };
    }
    
    const userProfile = userDoc.data() as UserProfile;
    
    // Pro and Elite plans have access to all courses
    if (userProfile.plan === 'pro' || userProfile.plan === 'elite') {
      return { canAccess: true };
    }
    
    // Free plan: check if user has enrollments
    const enrollmentsQuery = query(
      collection(db, `users/${uid}/courses`),
      where('courseId', '==', courseId)
    );
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    
    if (enrollmentsSnapshot.empty) {
      return { canAccess: false, reason: 'Free plan limited to 1 course. Upgrade to access this course.' };
    }
    
    return { canAccess: true };
  } catch (error) {
    console.error('Error checking course access:', error);
    return { canAccess: false, reason: 'Error checking access' };
  }
}

export async function incrementBookingCount(uid: string): Promise<void> {
  try {
    const userRef = doc(collection(db, 'users'), uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      const currentCount = userData.bookingsThisMonth || 0;
      const bookingLimit = userData.bookingLimit || 1;
      
      if (currentCount >= bookingLimit) {
        throw new Error('Booking limit reached for this month');
      }
      
      await updateDoc(userRef, {
        bookingsThisMonth: currentCount + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing booking count:', error);
    throw error;
  }
}

export async function resetMonthlyBookingCount(uid: string): Promise<void> {
  try {
    const userRef = doc(collection(db, 'users'), uid);
    await updateDoc(userRef, {
      bookingsThisMonth: 0
    });
  } catch (error) {
    console.error('Error resetting booking count:', error);
    throw error;
  }
}

// Create a new time slot
export async function createTimeSlot(
  date: string,
  time: string,
  duration: number = 60
): Promise<string> {
  const slotData = {
    date,
    time,
    duration,
    available: true,
    status: 'available' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'slots'), slotData);
  return docRef.id;
}

// Get available slots for a given date range
export async function getAvailableSlots(
  from: string,
  to?: string
): Promise<TimeSlot[]> {
  const constraints = [
    where('date', '>=', from),
    where('available', '==', true),
    orderBy('date'),
    orderBy('time')
  ];
  
  if (to) {
    constraints.splice(1, 0, where('date', '<=', to));
  }
  
  const q = query(
    collection(db, 'slots'),
    ...constraints
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TimeSlot));
}

// Book a slot
export async function bookSlot(
  slotId: string,
  userId: string,
  userName: string,
  userEmail: string,
  notes?: string
): Promise<string> {
  // Get slot data first
  const slotRef = doc(db, 'slots', slotId);
  const slotSnap = await getDoc(slotRef);
  if (!slotSnap.exists()) {
    throw new Error('Slot not found');
  }
  
  const slotData = slotSnap.data() as TimeSlot;
  
  // Check if slot is still available
  if (!slotData.available) {
    throw new Error('SLOT_UNAVAILABLE');
  }

  // Update Firestore with booking info
  const batch = writeBatch(db);
  
  // Mark slot as unavailable
  batch.update(slotRef, {
    available: false,
    bookedBy: userId,
    bookedByName: userName,
    updatedAt: serverTimestamp(),
  });

  // Create booking record
  const bookingRef = doc(collection(db, 'bookings'));
  batch.set(bookingRef, {
    userId,
    userName,
    userEmail,
    slotId,
    date: slotData.date,
    time: slotData.time,
    duration: slotData.duration,
    status: 'confirmed',
    googleEventId: null,
    meetLink: null,
    notes: notes || '',
    createdAt: serverTimestamp(),
  });

  await batch.commit();
  return bookingRef.id;
}

// Cancel a booking
export async function cancelBooking(
  bookingId: string,
  slotId: string,
  googleEventId?: string
): Promise<void> {
  // Get booking data to get Google Calendar event ID
  const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
  if (!bookingDoc.exists()) {
    throw new Error('Booking not found');
  }
  
  const bookingData = bookingDoc.data() as Booking;
  
  // Cancel Google Calendar event if it exists
  if (bookingData.googleEventId) {
    try {
      await cancelCalendarEvent(bookingData.googleEventId);
    } catch (error) {
      console.error('Failed to cancel calendar event:', error);
      // Continue with Firestore update even if calendar cancellation fails
    }
  }

  // Update Firestore
  const batch = writeBatch(db);
  batch.update(doc(db, 'bookings', bookingId), {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, 'slots', slotId), {
    available: true,
    bookedBy: null,
    bookedByName: null,
    googleEventId: null,
    meetLink: null,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

// Get user's bookings
export async function getUserBookings(
  userId: string
): Promise<Booking[]> {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    where('status', '==', 'confirmed'),
    orderBy('date')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
}

// Export db for use in hooks
export { db };
