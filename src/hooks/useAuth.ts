import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<(User & { isGuest?: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        const isGuest = sessionStorage.getItem('elo_guest') === 'true';
        if (isGuest) {
          setUser({
            uid: 'guest_user',
            displayName: 'Visitante',
            email: 'guest@elospeak.com.br',
            isGuest: true
          } as any);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      sessionStorage.removeItem('elo_guest');
      sessionStorage.removeItem('elo_guest_time');
      sessionStorage.removeItem('elo_guest_enrollments');
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInAsGuest = () => {
    sessionStorage.setItem('elo_guest', 'true');
    sessionStorage.setItem('elo_guest_time', Date.now().toString());
    setUser({
      uid: 'guest_user',
      displayName: 'Visitante',
      email: 'guest@elospeak.com.br',
      isGuest: true
    } as any);
  };

  const signOutUser = async () => {
    try {
      sessionStorage.removeItem('elo_guest');
      sessionStorage.removeItem('elo_guest_time');
      sessionStorage.removeItem('elo_guest_enrollments');
      await fbSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return { 
    user, 
    loading, 
    signInWithGoogle, 
    signInAsGuest, 
    signOut: signOutUser 
  };
}

