import React from 'react';
import { WHATSAPP_NUMBER } from '../../../constants';
import { trackEvent } from '../../utils/analytics';

interface QuickLinksProps {
  onNavigateToAgenda: () => void;
  onOpenSubscription: () => void;
  studentName?: string;
}

export const QuickLinks: React.FC<QuickLinksProps> = ({ 
  onNavigateToAgenda, 
  onOpenSubscription,
  studentName
}) => {
  const whatsappMessage = studentName 
    ? `Oi Professor Matt! Sou o(a) ${studentName}. Gostaria de tirar uma dúvida sobre minhas aulas no ELO!`
    : `Oi Professor Matt! Gostaria de tirar uma dúvida sobre minhas aulas no ELO!`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-5 sm:p-6 shadow-sm">
      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mb-4">Acesso Rápido</h3>
      <div className="space-y-3">
        <button
          type="button"
          onClick={onNavigateToAgenda}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all border border-blue-500/10 hover:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5"
        >
          <span className="text-lg">📅</span>
          <span className="text-slate-900 dark:text-white font-extrabold text-xs uppercase tracking-wider">Agenda</span>
        </button>
        <button
          type="button"
          onClick={onOpenSubscription}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all border border-slate-100 dark:border-slate-700"
        >
          <span className="text-lg">💳</span>
          <span className="text-slate-900 dark:text-white font-extrabold text-xs uppercase tracking-wider">Plano de Assinatura</span>
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('whatsapp_click_quicklinks')}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition-all border border-slate-100 dark:border-slate-700"
        >
          <span className="text-lg">💬</span>
          <span className="text-slate-900 dark:text-white font-extrabold text-xs uppercase tracking-wider">Falar com Professor</span>
        </a>
      </div>
    </div>
  );
};
