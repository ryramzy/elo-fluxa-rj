import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { FaUserShield, FaClock } from 'react-icons/fa';

export const GuestBanner: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes in seconds

  useEffect(() => {
    const startTimeStr = sessionStorage.getItem('elo_guest_time');
    let startTime = startTimeStr ? parseInt(startTimeStr, 10) : Date.now();
    if (!startTimeStr) {
      sessionStorage.setItem('elo_guest_time', startTime.toString());
    }

    // Calculate initial time immediately
    const initialElapsed = Math.floor((Date.now() - startTime) / 1000);
    const initialRemaining = 600 - initialElapsed;
    if (initialRemaining <= 0) {
      setTimeLeft(0);
      handleExpiry();
      return;
    } else {
      setTimeLeft(initialRemaining);
    }

    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const remaining = 600 - elapsedSeconds;

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        handleExpiry();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleExpiry = async () => {
    try {
      await signOut();
      showToast({ type: 'info', message: 'Sua sessão de visitante de 10 minutos expirou! Crie uma conta para continuar de onde parou.' });
      navigate('/login');
    } catch (err) {
      console.error('Failed to sign out guest user:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full mb-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-2xl p-4 md:p-5 shadow-lg backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 font-sans border-l-4 border-l-amber-500">
      <div className="flex items-center gap-3.5 text-slate-800 dark:text-amber-100/90 text-left">
        <div className="bg-amber-500/20 p-2.5 rounded-xl text-amber-500 flex-shrink-0 animate-pulse">
          <FaUserShield size={20} />
        </div>
        <div>
          <h4 className="font-bold text-sm sm:text-base tracking-tight mb-0.5 text-slate-900 dark:text-white flex items-center gap-2">
            Modo Visitante Ativo
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
              <FaClock size={10} />
              {formatTime(timeLeft)}
            </span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-355 font-light leading-relaxed max-w-2xl">
            Você está testando o app. Seu progresso e XP são temporários e serão perdidos ao sair. Crie uma conta gratuita para salvar seu histórico e agendar aulas reais!
          </p>
        </div>
      </div>
      
      <button
        onClick={() => navigate('/signup')}
        className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-xl shadow-md transition-all duration-200 hover:scale-105 flex-shrink-0"
      >
        Criar Conta Grátis
      </button>
    </div>
  );
};
