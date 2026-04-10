import { useState, useEffect } from 'react';
import { updateStreak } from '../lib/firestore';
import { awardXP, XP_REWARDS } from '../lib/xpSystem';

export function useStreak(uid: string) {
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const updateStreakOnMount = async () => {
      try {
        await updateStreak(uid);
        setLoading(false);
      } catch (err) {
        console.error('Error updating streak:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    updateStreakOnMount();
  }, [uid]);

  const awardStreakXP = async () => {
    try {
      await awardXP(uid, XP_REWARDS.STREAK_DAY, 'streak day');
    } catch (err) {
      console.error('Error awarding streak XP:', err);
    }
  };

  return { streak, loading, error, awardStreakXP };
}
