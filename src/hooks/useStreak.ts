import { useState, useEffect } from 'react';
import { updateStreak, getUserProfile } from '../lib/firestore';
import { awardXP, XP_REWARDS } from '../lib/xpSystem';

export function useStreak(uid: string) {
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || uid === 'guest_user') {
      setStreak(0);
      setLoading(false);
      return;
    }

    const updateStreakOnMount = async () => {
      try {
        await updateStreak(uid);
        // Fetch the updated profile to get the actual streak value
        const profile = await getUserProfile(uid);
        if (profile) {
          setStreak(profile.streakDays || 0);
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Error updating streak:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    updateStreakOnMount();
  }, [uid]);

  const awardStreakXP = async () => {
    if (uid === 'guest_user') return;
    try {
      await awardXP(uid, XP_REWARDS.STREAK_DAY, 'streak day');
    } catch (err) {
      console.error('Error awarding streak XP:', err);
    }
  };

  return { streak, loading, error, awardStreakXP };
}
