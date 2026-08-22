import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<(User & { isGuest?: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout: If Firebase auth takes longer than 1.5s (e.g. slow mobile connection),
    // unblock the landing page UI immediately so the user is never stuck on a spinner.
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    let unsubscribe = () => {};

    try {
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        clearTimeout(safetyTimer);
        if (currentUser) {
          setUser(currentUser);
        } else {
          let isGuest = false;
          try {
            isGuest = typeof window !== 'undefined' && sessionStorage.getItem('elo_guest') === 'true';
          } catch (e) {
            // Private mode security error guard
          }

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
        }
        setLoading(false);
      }, (error) => {
        console.warn('Auth state error caught:', error);
        clearTimeout(safetyTimer);
        setLoading(false);
      });
    } catch (e) {
      console.warn('onAuthStateChanged setup error:', e);
      clearTimeout(safetyTimer);
      setLoading(false);
    }

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      try {
        sessionStorage.removeItem('elo_guest');
        sessionStorage.removeItem('elo_guest_time');
        sessionStorage.removeItem('elo_guest_enrollments');
      } catch (e) {}
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInAsGuest = () => {
    try {
      sessionStorage.setItem('elo_guest', 'true');
      sessionStorage.setItem('elo_guest_time', Date.now().toString());
    } catch (e) {}
    setUser({
      uid: 'guest_user',
      displayName: 'Visitante',
      email: 'guest@elospeak.com.br',
      isGuest: true
    } as any);
  };

  const signOutUser = async () => {
    try {
      try {
        sessionStorage.removeItem('elo_guest');
        sessionStorage.removeItem('elo_guest_time');
        sessionStorage.removeItem('elo_guest_enrollments');
      } catch (e) {}
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
