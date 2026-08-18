import { useState, useEffect } from 'react';
import { onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { auth } from '../lib/firebase';
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

    if (uid === 'guest_user') {
      setProfile({
        displayName: 'Visitante',
        email: 'guest@elospeak.com.br',
        photoURL: '',
        xp: 0,
        level: 1,
        levelName: 'Beginner',
        streakDays: 0,
        lastActiveDate: null,
        badgesEarned: [],
        createdAt: null,
        hasSeenOnboarding: true,
        role: 'student',
        bio: 'Visitante testando o app',
        targetGoal: 'Falar inglês americano fluente',
        isGuest: true
      });
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', uid),
      async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const xp = data?.xp || 0;
          const levelInfo = calculateLevel(xp);
          const userEmail = (data?.email || auth.currentUser?.email || '').toLowerCase().trim();
          const isAuthorizedEmail = 
            userEmail === 'mramsayo@gmail.com' ||
            userEmail === 'mramsay0@gmail.com' ||
            userEmail === 'erneleducation@gmail.com' ||
            userEmail.endsWith('@elospeak.com.br') ||
            userEmail.endsWith('@elospeak.com');

          const role = isAuthorizedEmail ? 'admin' : (data?.role || 'student');

          setProfile({
            displayName: data?.displayName || auth.currentUser?.displayName || 'Professor Nativo',
            email: data?.email || userEmail,
            photoURL: data?.photoURL || auth.currentUser?.photoURL || '',
            xp,
            level: levelInfo.level,
            levelName: levelInfo.name,
            streakDays: data?.streakDays || 0,
            lastActiveDate: data?.lastActiveDate || null,
            badgesEarned: data?.badgesEarned || [],
            createdAt: data?.createdAt || null,
            hasSeenOnboarding: !!data?.hasSeenOnboarding,
            role,
            plan: data?.plan || 'free',
            bio: data?.bio || '',
            targetGoal: data?.targetGoal || '',
          });
          setLoading(false);
        } else {
          // Auto-create user profile if it doesn't exist in Firestore
          try {
            const currentUser = auth.currentUser;
            if (currentUser && currentUser.uid === uid) {
              const userRef = doc(db, 'users', uid);
              await setDoc(userRef, {
                displayName: currentUser.displayName || 'Estudante',
                email: currentUser.email || '',
                photoURL: currentUser.photoURL || '',
                xp: 0,
                level: 1,
                streakDays: 0,
                lastActiveDate: new Date(),
                badgesEarned: [],
                createdAt: new Date(),
                role: 'student',
                hasSeenOnboarding: false,
                plan: 'free',
                bio: '',
                targetGoal: '',
              });
              // The onSnapshot listener will be automatically triggered again with the new document.
            } else {
              setError('User profile not found');
              setLoading(false);
            }
          } catch (createErr: any) {
            console.error('Error auto-creating user profile:', createErr);
            setError('User profile not found');
            setLoading(false);
          }
        }
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
