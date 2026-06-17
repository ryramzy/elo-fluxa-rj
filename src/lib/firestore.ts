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
  limit,
  runTransaction,
  deleteDoc
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
  role: 'student' | 'tutor' | 'admin';
  bio?: string;
  targetGoal?: string;
  tutorNotes?: string;
  phone?: string;
}

export interface Enrollment {
  courseId: string;
  enrolledAt: Timestamp;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  xpEarned: number;
  activeLessonId?: string;
  activeSlideIndex?: number;
  completedLessons?: string[];
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
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  if (uid === 'guest_user') return;
  try {
    const userRef = doc(collection(db, 'users'), uid);
    await updateDoc(userRef, updates as any);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (uid === 'guest_user') {
    return {
      displayName: 'Visitante',
      email: 'guest@elospeak.com.br',
      xp: 0,
      level: 1,
      streakDays: 0,
      lastActiveDate: Timestamp.now(),
      badgesEarned: [],
      createdAt: Timestamp.now(),
      plan: 'free',
      planActivatedAt: null,
      bookingsThisMonth: 0,
      bookingLimit: 0,
      role: 'student'
    };
  }
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
  if (uid === 'guest_user') return;
  try {
    const userRef = doc(collection(db, 'users'), uid);
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (userDoc.exists()) {
        const currentXP = userDoc.data()?.xp || 0;
        const newXP = currentXP + xpToAdd;
        const newLevel = calculateLevel(newXP);
        
        transaction.update(userRef, {
          xp: newXP,
          level: newLevel.level,
          lastActiveDate: serverTimestamp()
        });
      }
    });
  } catch (error) {
    console.error('Error updating user XP atomically:', error);
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
      activeLessonId: doc.data().activeLessonId,
      activeSlideIndex: doc.data().activeSlideIndex,
      completedLessons: doc.data().completedLessons,
      id: doc.id
    } as Enrollment));
  } catch (error) {
    console.error('Error getting user enrollments:', error);
    throw error;
  }
}

export async function updateLessonProgress(
  uid: string,
  courseId: string,
  lessonId: string,
  slideIndex: number,
  isCompleted: boolean = false
): Promise<void> {
  if (uid === 'guest_user') {
    const stored = sessionStorage.getItem('elo_guest_enrollments');
    const enrollments = stored ? JSON.parse(stored) : [];
    const idx = enrollments.findIndex((e: any) => e.courseId === courseId);
    if (idx !== -1) {
      const data = enrollments[idx];
      const completedLessons = data.completedLessons || [];
      const updates: any = {
        ...data,
        activeLessonId: lessonId,
        activeSlideIndex: slideIndex,
      };

      if (isCompleted && !completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
        updates.completedLessons = completedLessons;
        updates.lessonsCompleted = completedLessons.length;
        updates.progress = Math.round((completedLessons.length / data.totalLessons) * 100);
      }
      
      enrollments[idx] = updates;
      sessionStorage.setItem('elo_guest_enrollments', JSON.stringify(enrollments));
      window.dispatchEvent(new Event('guest_enrollments_updated'));
    }
    return;
  }
  try {
    const queries = [
      query(collection(db, 'enrollments'), where('userId', '==', uid), where('courseId', '==', courseId)),
      query(collection(db, `users/${uid}/courses`), where('courseId', '==', courseId))
    ];

    let showCompletionNotification = false;

    for (const q of queries) {
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        const data = snapshot.docs[0].data();
        const completedLessons = data.completedLessons || [];
        
        const updates: any = {
          activeLessonId: lessonId,
          activeSlideIndex: slideIndex,
        };

        if (isCompleted && !completedLessons.includes(lessonId)) {
          completedLessons.push(lessonId);
          updates.completedLessons = completedLessons;
          updates.lessonsCompleted = completedLessons.length;
          updates.progress = Math.round((completedLessons.length / data.totalLessons) * 100);
          showCompletionNotification = true;
        }

        await updateDoc(docRef, updates);
      }
    }

    if (showCompletionNotification) {
      await createNotification(
        uid, 
        'Lição Concluída! 🎉', 
        `Você concluiu a lição no curso: ${courseId.replace(/-/g, ' ').toUpperCase()}`
      );
    }
  } catch (error) {
    console.error('Error updating lesson progress:', error);
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
  if (uid === 'guest_user') {
    throw new Error('Guests cannot create bookings.');
  }
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
  if (uid === 'guest_user') return;
  try {
    const userRef = doc(collection(db, 'users'), uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      const lastActive = userData.lastActiveDate?.toDate() || new Date(0);
      
      // Idempotency check: Skip if streak was already updated today
      const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
      const lastActiveStr = lastActive.toLocaleDateString('en-CA');
      if (todayStr === lastActiveStr && (userData.streakDays || 0) > 0) {
        return;
      }
      
      const today = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      
      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / oneDay);
      let newStreak = userData.streakDays || 1;
      
      if (daysDiff === 1) {
        newStreak = (userData.streakDays || 0) + 1;
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

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const bookingsQuery = query(
      collection(db, 'bookings'),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(bookingsQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
      } as unknown as Booking;
    });
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
  if (uid === 'guest_user') {
    return { canAccess: true };
  }
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
    const allEnrollmentsQuery = query(collection(db, `users/${uid}/courses`));
    const allEnrollmentsSnapshot = await getDocs(allEnrollmentsQuery);
    
    // If they are already enrolled in THIS course, allow it
    const isEnrolledInThis = allEnrollmentsSnapshot.docs.some(doc => doc.data().courseId === courseId);
    if (isEnrolledInThis) {
      return { canAccess: true };
    }

    // If they are not enrolled in this course, check if they hit the limit (1 course for free plan)
    if (allEnrollmentsSnapshot.docs.length >= 1) {
      return { canAccess: false, reason: 'O plano gratuito permite apenas 1 curso. Faça o upgrade para acessar mais.' };
    }
    
    return { canAccess: true };
  } catch (error) {
    console.error('Error checking course access:', error);
    return { canAccess: false, reason: 'Error checking access' };
  }
}

export async function enrollUserInCourse(uid: string, courseId: string, totalLessons: number): Promise<void> {
  if (uid === 'guest_user') {
    const stored = sessionStorage.getItem('elo_guest_enrollments');
    const enrollments = stored ? JSON.parse(stored) : [];
    if (!enrollments.some((e: any) => e.courseId === courseId)) {
      enrollments.push({
        courseId,
        enrolledAt: { toMillis: () => Date.now(), toDate: () => new Date() },
        progress: 0,
        lessonsCompleted: 0,
        totalLessons,
        xpEarned: 0,
        activeLessonId: '',
        activeSlideIndex: 0,
        completedLessons: []
      });
      sessionStorage.setItem('elo_guest_enrollments', JSON.stringify(enrollments));
      window.dispatchEvent(new Event('guest_enrollments_updated'));
    }
    return;
  }
  let isEnrolled = false;
  
  try {
    // Check root enrollments collection
    const enrollmentsRef = collection(db, 'enrollments');
    const q = query(enrollmentsRef, where('userId', '==', uid));
    const snapshot = await getDocs(q);
    isEnrolled = snapshot.docs.some(doc => doc.data().courseId === courseId);
  } catch (error) {
    console.warn('Could not read from root enrollments (possible missing index or rules). Falling back to legacy check.', error);
  }

  if (isEnrolled) return;

  try {
    // Also check legacy subcollection to prevent double enrollment during transition
    const legacyRef = collection(db, `users/${uid}/courses`);
    const legacyQ = query(legacyRef, where('courseId', '==', courseId));
    const legacySnapshot = await getDocs(legacyQ);
    if (!legacySnapshot.empty) return;
  } catch (error) {
    console.warn('Could not read legacy enrollments either.', error);
  }

  // Fetch user details for denormalization
  let userData: any = {};
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    userData = userDoc.exists() ? userDoc.data() : {};
  } catch (error) {
    console.warn('Could not fetch user details.', error);
  }

  const enrollmentData = {
    userId: uid,
    userName: userData.displayName || 'Unknown Student',
    userEmail: userData.email || 'No email provided',
    courseId,
    pricePaid: 0,
    emailSent: false,
    enrolledAt: serverTimestamp(),
    progress: 0,
    lessonsCompleted: 0,
    totalLessons,
    xpEarned: 0,
    activeLessonId: '',
    activeSlideIndex: 0,
    completedLessons: []
  };

  try {
    const legacyRef = collection(db, `users/${uid}/courses`);
    await addDoc(legacyRef, enrollmentData);
  } catch (error) {
    console.error('Failed to write to legacy enrollments:', error);
    throw error; // Throw so the UI can catch it
  }

  // Try to write to root as backup for future migration, but don't fail if it doesn't work
  try {
    const enrollmentsRef = collection(db, 'enrollments');
    await addDoc(enrollmentsRef, enrollmentData);
  } catch (error) {
    console.warn('Error writing to root enrollments:', error);
  }

  await createNotification(uid, 'Curso Matriculado! 🎓', `Você se matriculou no curso: ${courseId.replace(/-/g, ' ').toUpperCase()}`);
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
    date: date,        // "2026-05-05" — ALWAYS a plain string, NEVER Timestamp
    time: time,        // "08:00" — 24hr format string
    duration: duration,    // 60 — always minutes as number
    available: true,  // true
    status: "available",      // "available"
    bookedBy: null,
    bookedByName: null,
    meetLink: null,
    googleEventId: null,
    createdAt: serverTimestamp()
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

// Book a slot using a transaction to prevent double bookings
export async function bookSlot(
  date: string,
  time: string,
  userId: string,
  userName: string,
  userEmail: string,
  notes?: string
): Promise<string> {
  if (userId === 'guest_user') {
    throw new Error('Guests cannot book sessions.');
  }
  const bookingId = `${date}_${time.replace(':', '')}`;
  const bookingRef = doc(db, 'bookings', bookingId);
  const notifId = `booking_notif_${Date.now()}`;
  const notifRef = doc(db, 'users', userId, 'notifications', notifId);

  // Compute UTC datetime Timestamp based on America/Sao_Paulo (UTC-3 stable)
  const localIsoString = `${date}T${time}:00-03:00`;
  const utcDate = new Date(localIsoString);
  const datetimeTimestamp = Timestamp.fromDate(utcDate);

  await runTransaction(db, async (transaction) => {
    const bookingDoc = await transaction.get(bookingRef);
    if (bookingDoc.exists()) {
      throw new Error('This slot is already booked by someone else.');
    }

    transaction.set(bookingRef, {
      userId,
      userName,
      userEmail,
      date,
      time,
      duration: 60,
      status: 'confirmed',
      googleEventId: null,
      meetLink: null,
      notes: notes || '',
      createdAt: serverTimestamp(),
      datetime: datetimeTimestamp
    });

    transaction.set(notifRef, {
      title: 'Aula agendada! 🗓️',
      message: `Sua aula de inglês para o dia ${date} às ${time} foi agendada.`,
      read: false,
      createdAt: serverTimestamp()
    });
  });

  return bookingId;
}

// Cancel a booking
export async function cancelBooking(
  bookingId: string,
  googleEventId?: string
): Promise<void> {
  const bookingRef = doc(db, 'bookings', bookingId);
  const bookingDoc = await getDoc(bookingRef);
  
  if (!bookingDoc.exists()) {
    throw new Error('Booking not found');
  }
  
  const bookingData = bookingDoc.data() as Booking;
  
  if (bookingData.googleEventId || googleEventId) {
    try {
      await cancelCalendarEvent(bookingData.googleEventId || googleEventId);
    } catch (error) {
      console.error('Failed to cancel calendar event:', error);
    }
  }

  await deleteDoc(bookingRef);
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

// Create real-time notification in Firestore
export async function createNotification(
  uid: string,
  title: string,
  message: string
): Promise<void> {
  if (uid === 'guest_user') return;
  try {
    const notificationsRef = collection(db, 'users', uid, 'notifications');
    await addDoc(notificationsRef, {
      title,
      message,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Export db for use in hooks
export { db };
