import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { LOGIN_COPY_VARIANTS, DEFAULT_LOGIN_VARIANT, LoginCopyVariant } from '@/constants/loginCopy';
import { trackEvent } from '@/utils/analytics';
import { useAuth } from '@/hooks/useAuth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firestore';
import { getAuthErrorMessage } from '@/utils/authErrors';

interface LoginProps {
  copyVariant?: LoginCopyVariant;
}

const Login = ({ copyVariant = DEFAULT_LOGIN_VARIANT }: LoginProps) => {
  const { signInAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGuestSignIn = () => {
    trackEvent('auth_login', { method: 'guest' });
    signInAsGuest();
    navigate('/dashboard');
  };

  // Get copy for current variant
  const copy = LOGIN_COPY_VARIANTS[copyVariant];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Safely ensure user profile document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        displayName: user.displayName || 'Estudante',
        email: user.email || email,
        photoURL: user.photoURL || '',
        xp: 0,
        level: 1,
        streakDays: 0,
        lastActiveDate: new Date(),
        badgesEarned: [],
        createdAt: new Date(),
        role: 'student',
        hasSeenOnboarding: false,
        bio: '',
        targetGoal: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
      }, { merge: true });

      trackEvent('auth_login', { method: 'email' });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Email login error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Safely ensure user profile document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        displayName: user.displayName || 'Estudante',
        email: user.email || '',
        photoURL: user.photoURL || '',
        xp: 0,
        level: 1,
        streakDays: 0,
        lastActiveDate: new Date(),
        badgesEarned: [],
        createdAt: new Date(),
        role: 'student',
        hasSeenOnboarding: false,
        bio: '',
        targetGoal: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
      }, { merge: true });

      trackEvent('auth_login', { method: 'google' });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-6">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 font-sans">
        {/* Login Header - Low friction, task-focused */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-serif font-bold tracking-tight text-white flex items-center justify-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <span className="text-blue-500">Elo!</span>
          </Link>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            {copy.header}
          </h1>
          
          <p className="text-slate-400 text-sm font-light">
            {copy.subheader}
          </p>
          
          {/* Optional micro-tagline - low emphasis */}
          <p className="text-xs text-slate-500 mt-3">
            {copy.microTagline}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Login Form - Clear visual hierarchy */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
              Endereço de E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-md py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="seu-email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-md py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-md transition-colors tracking-wide uppercase text-sm disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <button
            type="button"
            onClick={handleGuestSignIn}
            disabled={loading}
            className="w-full bg-slate-700 hover:bg-slate-650 text-white font-bold py-4 rounded-md transition-colors tracking-wide uppercase text-sm disabled:opacity-50 border border-slate-600 mt-3"
          >
            Continuar como Visitante (10 min)
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">Ou continue com</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-slate-700 rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-700 focus:outline-none transition-colors"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.71 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.58C14.72 18.24 13.46 18.66 12 18.66C9.18 18.66 6.78 16.76 5.89 14.19H2.24V17.02C4.04 20.59 7.71 23 12 23Z" fill="#34A853" />
                <path d="M5.89 14.19C5.66 13.51 5.54 12.77 5.54 12C5.54 11.23 5.66 10.49 5.89 9.81V6.98H2.24C1.5 8.46 1.08 10.18 1.08 12C1.08 13.82 1.5 15.54 2.24 17.02L5.89 14.19Z" fill="#FBBC05" />
                <path d="M12 5.34C13.62 5.34 15.07 5.9 16.22 7H19.34C17.45 5.24 14.96 4.26 12 4.26C7.71 4.26 4.04 6.65 2.24 9.81L5.89 12.64C6.78 10.07 9.18 5.34 12 5.34Z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>
        </div>

        {/* Footer - Minimal, no distractions */}
        <div className="mt-8 text-center text-sm">
          <p className="text-slate-400">
            Não tem uma conta?{' '}
            <Link to="/signup" className="text-blue-500 hover:text-blue-400 font-bold transition-colors">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
