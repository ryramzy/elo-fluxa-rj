import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { LOGIN_COPY_VARIANTS, DEFAULT_LOGIN_VARIANT, LoginCopyVariant } from '../../src/constants/loginCopy';

interface LoginProps {
  copyVariant?: LoginCopyVariant;
}

const Login = ({ copyVariant = DEFAULT_LOGIN_VARIANT }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get copy for current variant
  const copy = LOGIN_COPY_VARIANTS[copyVariant];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/agenda');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
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
            <span className="text-blue-500">Elo Matt!</span>
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
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-md py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-md py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="•••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-md transition-colors tracking-wide uppercase text-sm disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

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
