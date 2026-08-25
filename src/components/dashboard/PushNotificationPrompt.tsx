import React, { useState } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { FaBell, FaTimes, FaCheck } from 'react-icons/fa';

interface PushNotificationPromptProps {
  userId?: string;
}

export const PushNotificationPrompt: React.FC<PushNotificationPromptProps> = ({ userId }) => {
  const { permission, isRequesting, requestPermission, isSupported } = usePushNotifications(userId);
  const [dismissed, setDismissed] = useState(() => {
    try {
      const until = localStorage.getItem('elo_push_dismissed_until');
      if (until && Number(until) > Date.now()) return true;
    } catch (e) {}
    return false;
  });

  if (!isSupported || permission !== 'default' || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      // Dismiss for 7 days
      localStorage.setItem('elo_push_dismissed_until', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } catch (e) {}
  };

  const handleEnable = async () => {
    await requestPermission();
  };

  return (
    <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 border border-blue-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg backdrop-blur-xs">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 text-lg shadow-inner">
          <FaBell className="animate-bounce" />
        </div>
        <div className="flex-1 pr-6">
          <h4 className="text-sm font-black text-white tracking-tight">
            Lembretes de Aula no Celular & PC
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Receba lembretes 15 minutos antes da sua aula ao vivo com o Professor Matt e notificações quando novos horários forem abertos.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleEnable}
              disabled={isRequesting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              <FaBell size={11} />
              {isRequesting ? 'Ativando...' : 'Ativar Notificações'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition-all"
            >
              Agora não
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 p-1.5 rounded-lg transition-colors"
          title="Fechar"
        >
          <FaTimes size={13} />
        </button>
      </div>
    </div>
  );
};
