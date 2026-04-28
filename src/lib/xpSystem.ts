import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firestore';
import { auth } from '../../firebase';

// XP award amounts
export const XP_REWARDS = {
  FIRST_LOGIN: 50,
  LESSON_COMPLETED: 20,
  BOOKING_CREATED: 10,
  STREAK_DAY: 5,
  COURSE_ENROLLED: 25,
  COURSE_COMPLETED: 100,
};

// Award XP to user and handle level progression
export async function awardXP(uid: string, amount: number, reason: string) {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create user profile if it doesn't exist
      const user = auth.currentUser;
      await setDoc(userRef, {
        displayName: user?.displayName || '',
        email: user?.email || '',
        photoURL: user?.photoURL || '',
        xp: amount,
        level: calculateLevel(amount).level,
        streakDays: 0,
        lastActiveDate: new Date(),
        badgesEarned: [],
        createdAt: new Date(),
      });
      return;
    }

    const currentXP = userDoc.data().xp || 0;
    const newXP = currentXP + amount;
    const newLevel = calculateLevel(newXP);
    const currentLevel = userDoc.data().level || 1;

    // Check for level up
    if (newLevel.level > currentLevel) {
      console.log(`User ${uid} leveled up to ${newLevel.level}!`);
    }

    // Update user XP and level
    await updateDoc(userRef, {
      xp: newXP,
      level: newLevel.level,
      lastActiveDate: new Date(),
    });

    console.log(`Awarded ${amount} XP to user ${uid} for ${reason}. New total: ${newXP}`);
  } catch (error) {
    console.error('Error awarding XP:', error);
    throw error;
  }
}

// Award first login bonus (one-time)
export async function awardFirstLoginBonus(uid: string) {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().firstLoginAwarded) {
      return; // Already awarded
    }

    await awardXP(uid, XP_REWARDS.FIRST_LOGIN, 'first login');
    await updateDoc(userRef, { firstLoginAwarded: true });
  } catch (error) {
    console.error('Error awarding first login bonus:', error);
  }
}

// Award XP for course completion
export async function awardCourseCompletion(uid: string, courseId: string) {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return;

    const badgesEarned = userDoc.data().badgesEarned || [];
    
    // Add course badge if not already earned
    if (!badgesEarned.includes(courseId)) {
      const newBadges = [...badgesEarned, courseId];
      await updateDoc(userRef, { badgesEarned: newBadges });
      await awardXP(uid, XP_REWARDS.COURSE_COMPLETED, `course completion: ${courseId}`);
    }
  } catch (error) {
    console.error('Error awarding course completion:', error);
  }
}

// Calculate level from XP
function calculateLevel(xp: number): { level: number; name: string } {
  if (xp < 500) return { level: 1, name: 'Beginner' };
  if (xp < 1000) return { level: 2, name: 'Explorer' };
  if (xp < 2000) return { level: 3, name: 'Conversationalist' };
  if (xp < 3000) return { level: 4, name: 'Rising Star' };
  if (xp < 5000) return { level: 5, name: 'Fluent' };
  return { level: 6, name: 'Native Flow' };
}
