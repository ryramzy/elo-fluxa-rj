import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, createNotification } from './firestore';
import { auth } from '../../firebase';
import { addGlobalToast } from '../hooks/useToast';

// XP award amounts
export const XP_REWARDS = {
  FIRST_LOGIN: 50,
  LESSON_COMPLETED: 20,
  BOOKING_CREATED: 10,
  STREAK_DAY: 5,
  COURSE_ENROLLED: 25,
  COURSE_COMPLETED: 100,
};

// Calculate level from XP
function calculateLevel(xp: number): { level: number; name: string } {
  if (xp < 500) return { level: 1, name: 'Beginner' };
  if (xp < 1000) return { level: 2, name: 'Explorer' };
  if (xp < 2000) return { level: 3, name: 'Conversationalist' };
  if (xp < 3000) return { level: 4, name: 'Rising Star' };
  if (xp < 5000) return { level: 5, name: 'Fluent' };
  return { level: 6, name: 'Native Flow' };
}

interface OfflineXpItem {
  uid: string;
  amount: number;
  reason: string;
  txId: string;
  attempts: number;
}

// Award XP to user and handle level progression
export async function awardXP(uid: string, amount: number, reason: string, txId?: string) {
  if (uid === 'guest_user') return;

  const activeTxId = txId || (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15));

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
        role: 'student',
        processedXpTransactions: [activeTxId]
      });
      return;
    }

    const userData = userDoc.data();
    const processedXpTransactions = userData.processedXpTransactions || [];
    
    // Idempotency: Skip if already processed
    if (processedXpTransactions.includes(activeTxId)) {
      console.warn(`[XP System] Transaction ${activeTxId} already processed. Skipping duplicate award.`);
      return;
    }

    const currentXP = userData.xp || 0;
    const newXP = currentXP + amount;
    const newLevel = calculateLevel(newXP);
    const currentLevel = userData.level || 1;

    // Check for level up
    if (newLevel.level > currentLevel) {
      console.log(`User ${uid} leveled up to ${newLevel.level}!`);
    }

    // Update user XP and level, and append txId to prevent duplication
    await updateDoc(userRef, {
      xp: newXP,
      level: newLevel.level,
      lastActiveDate: new Date(),
      processedXpTransactions: arrayUnion(activeTxId)
    });

    console.log(`Awarded ${amount} XP to user ${uid} for ${reason}. Tx: ${activeTxId}. New total: ${newXP}`);
    await createNotification(uid, 'XP Conquistado! ⚡', `Você ganhou +${amount} XP por: ${reason}!`);
  } catch (error) {
    console.error('Error awarding XP:', error);
    if (typeof window !== 'undefined') {
      try {
        const queue: OfflineXpItem[] = JSON.parse(localStorage.getItem('offline_xp_queue') || '[]');
        
        // Prevent duplicate queueing
        if (!queue.some(item => item.txId === activeTxId)) {
          if (queue.length >= 50) {
            addGlobalToast('Limite de salvamento offline atingido. Conecte-se para salvar novos prêmios de XP.', 'warning');
            console.warn('[Offline Queue] XP queue limit (50) exceeded. Discarding new item.');
          } else {
            queue.push({ uid, amount, reason, txId: activeTxId, attempts: 0 });
            localStorage.setItem('offline_xp_queue', JSON.stringify(queue));
            console.log('[Offline Queue] Queued XP update:', { amount, reason, txId: activeTxId });
          }
        }
      } catch (storageError) {
        console.error('Failed to write to localStorage offline XP queue:', storageError);
      }
    }
    throw error;
  }
}

// Award first login bonus (one-time)
export async function awardFirstLoginBonus(uid: string) {
  if (uid === 'guest_user') return;
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
  if (uid === 'guest_user') return;
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return;

    const badgesEarned = userDoc.data().badgesEarned || [];
    
    if (!badgesEarned.includes(courseId)) {
      const newBadges = [...badgesEarned, courseId];
      await updateDoc(userRef, { badgesEarned: newBadges });
      await awardXP(uid, XP_REWARDS.COURSE_COMPLETED, `course completion: ${courseId}`);
    }
  } catch (error) {
    console.error('Error awarding course completion:', error);
  }
}

// Listen to progress queue sync completion event before syncing XP awards
if (typeof window !== 'undefined') {
  window.addEventListener('progress_sync_complete', async () => {
    try {
      const queueRaw = localStorage.getItem('offline_xp_queue');
      if (!queueRaw) return;
      const queue: OfflineXpItem[] = JSON.parse(queueRaw);
      if (queue.length === 0) return;

      console.log(`[Offline Queue] Progress sync finished. Sincronizando ${queue.length} prêmios de XP pendentes...`);
      localStorage.setItem('offline_xp_queue', '[]');

      const failedItems: OfflineXpItem[] = [];

      for (const item of queue) {
        try {
          // Attempt synchronisation
          await awardXP(item.uid, item.amount, item.reason, item.txId);
          console.log(`[Offline Queue] XP Sync success for: ${item.reason}`);
        } catch (syncError) {
          const nextAttempts = item.attempts + 1;
          console.error(`[Offline Queue] XP Sync failed (tentativa ${nextAttempts}/3) for: ${item.reason}`, syncError);
          
          if (nextAttempts < 3) {
            // Requeue with backoff tracking
            failedItems.push({
              ...item,
              attempts: nextAttempts
            });
          } else {
            console.error(`[Offline Queue] XP item ${item.txId} exceeded max attempts (3). Discarding.`);
            addGlobalToast(`Algum progresso offline (XP: +${item.amount}) não pôde ser sincronizado após várias tentativas.`, 'error');
          }
        }
      }

      if (failedItems.length > 0) {
        const currentQueue: OfflineXpItem[] = JSON.parse(localStorage.getItem('offline_xp_queue') || '[]');
        localStorage.setItem('offline_xp_queue', JSON.stringify([...failedItems, ...currentQueue]));
      }
    } catch (err) {
      console.error('[Offline Queue] Error processing XP queue sync:', err);
    }
  });
}
