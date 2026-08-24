import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { getAuthErrorMessage } from '@/utils/authErrors';
import { trackEvent } from '@/utils/analytics';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

export default function LoginModal({ isOpen, onClose, onSignIn }: LoginModalProps) {
  const { signInAsGuest } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        trackEvent('auth_login', { method: 'email' });
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCred.user;

        if (name.trim()) {
          try {
            await updateProfile(user, { displayName: name.trim() });
          } catch (pErr) {
            console.warn('Could not set displayName on auth profile:', pErr);
          }
        }

        // Create initial Firestore user document safely
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              displayName: name.trim() || 'Estudante',
              email: user.email || email.trim(),
              photoURL: user.photoURL || '',
              xp: 0,
              level: 1,
              streakDays: 1,
              lastActiveDate: new Date(),
              badgesEarned: [],
              createdAt: new Date(),
              role: 'student',
              hasSeenOnboarding: false,
              plan: 'free',
              bio: '',
              targetGoal: '',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
            });
          }
        } catch (dbErr) {
          console.warn('Profile doc init error (handled by snapshot listener):', dbErr);
        }

        // Trigger Resend welcome email (async non-blocking)
        fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() || 'Estudante', email: user.email })
        }).catch(e => console.warn('Welcome email error:', e));

        trackEvent('auth_signup', { method: 'email' });
      }

      onClose();
      onSignIn();
    } catch (err: any) {
      console.error('Email auth error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      try {
        sessionStorage.removeItem('elo_guest');
        sessionStorage.removeItem('elo_guest_time');
      } catch (e) {}

      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Safely ensure or update user profile in Firestore
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Brand new user: initialize full profile
          await setDoc(userRef, {
            displayName: user.displayName || 'Estudante',
            email: user.email || '',
            photoURL: user.photoURL || '',
            xp: 0,
            level: 1,
            streakDays: 1,
            lastActiveDate: new Date(),
            badgesEarned: [],
            createdAt: new Date(),
            role: 'student',
            hasSeenOnboarding: false,
            plan: 'free',
            bio: '',
            targetGoal: '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
          });

          // Trigger Resend welcome email on new Google registration
          fetch('/api/email/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: user.displayName || 'Estudante', email: user.email })
          }).catch(e => console.warn('Welcome email error:', e));
        } else {
          // Existing user: only update non-restricted fields
          await updateDoc(userRef, {
            lastActiveDate: new Date(),
            photoURL: user.photoURL || userSnap.data()?.photoURL || '',
            displayName: user.displayName || userSnap.data()?.displayName || 'Estudante',
          });
        }
      } catch (dbErr) {
        console.warn('Google sign-in profile sync handled gracefully:', dbErr);
      }

      trackEvent('auth_login', { method: 'google' });
      onClose();
      onSignIn();
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = () => {
    signInAsGuest();
    onClose();
    onSignIn();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal content */}
        <div 
          className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <FaTimes className="w-5 h-5" />
          </button>

          {/* Modal header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-lg shadow-blue-500/20">
              E!
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isLogin ? 'Entrar no ELO!' : 'Criar Conta Grátis'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isLogin ? 'Acesse suas aulas e progresso' : 'Junte-se à nossa comunidade de conversação'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 px-4 py-3 rounded-xl mb-4 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {/* Google OAuth button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-4 py-3.5 font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 mb-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continuar com Google</span>
          </button>

          {/* Guest login button */}
          <button
            onClick={handleGuestSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-300 transition-colors text-xs font-semibold mb-4"
          >
            <span>Testar como Visitante (Sem cadastro)</span>
          </button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-900 text-slate-500 font-bold uppercase tracking-wider">ou com email</span>
            </div>
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Seu Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  placeholder="Ex: Gabriel Santos"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Seu Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seuemail@exemplo.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Sua Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-xl transition-all tracking-wider uppercase text-xs shadow-lg shadow-blue-600/30 active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? (isLogin ? 'Entrando...' : 'Criando Conta...') : (isLogin ? 'Entrar' : 'Criar Minha Conta')}
            </button>
          </form>

          {/* Toggle between login/signup */}
          <div className="text-center mt-5">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors"
            >
              {isLogin ? 'Não tem conta? Criar conta grátis' : 'Já tem uma conta? Fazer login'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
