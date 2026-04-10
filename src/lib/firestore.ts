import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp,
  getFirestore 
} from 'firebase/firestore';
import { auth } from '../../firebase';

// Initialize Firestore
const db = getFirestore();

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
}

export interface Enrollment {
  courseId: string;
  enrolledAt: Timestamp;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  xpEarned: number;
}

export interface Booking {
  uid: string;
  studentName: string;
  studentEmail: string;
  datetime: Timestamp;
  status: 'booked' | 'completed' | 'cancelled';
  calendarEventId?: string;
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

export async function getUpcomingBookings(uid: string): Promise<Booking[]> {
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
    } as Booking));
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

// Export db for use in hooks
export { db };
