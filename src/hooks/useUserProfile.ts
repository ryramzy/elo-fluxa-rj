import { useState, useEffect } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { User } from 'firebase/auth';

export function useUserProfile(uid: string) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', uid),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const xp = data?.xp || 0;
          const levelInfo = calculateLevel(xp);
          
          setProfile({
            displayName: data?.displayName || '',
            email: data?.email || '',
            photoURL: data?.photoURL || '',
            xp,
            level: levelInfo.level,
            levelName: levelInfo.name,
            streakDays: data?.streakDays || 0,
            lastActiveDate: data?.lastActiveDate || null,
            badgesEarned: data?.badgesEarned || [],
            createdAt: data?.createdAt || null,
          });
        } else {
          setError('User profile not found');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching user profile:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { profile, loading, error };
}

function calculateLevel(xp: number): { level: number; name: string } {
  if (xp < 500) return { level: 1, name: 'Beginner' };
  if (xp < 1000) return { level: 2, name: 'Explorer' };
  if (xp < 2000) return { level: 3, name: 'Conversationalist' };
  if (xp < 3000) return { level: 4, name: 'Rising Star' };
  if (xp < 5000) return { level: 5, name: 'Fluent' };
  return { level: 6, name: 'Native Flow' };
}
