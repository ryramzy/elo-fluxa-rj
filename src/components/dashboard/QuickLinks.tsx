import React from 'react';

interface QuickLinksProps {
  onNavigateToAgenda: () => void;
  onNavigateToCourses: () => void;
}

export const QuickLinks: React.FC<QuickLinksProps> = ({ 
  onNavigateToAgenda, 
  onNavigateToCourses 
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Acesso Rápido</h3>
      <div className="space-y-3">
        <button
          onClick={onNavigateToAgenda}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <span className="text-lg">📅</span>
          <span className="text-slate-900 dark:text-white">Agenda</span>
        </button>
        <button
          onClick={onNavigateToCourses}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <span className="text-lg">📚</span>
          <span className="text-slate-900 dark:text-white">Todos os Cursos</span>
        </button>
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <span className="text-lg">💬</span>
          <span className="text-slate-900 dark:text-white">Falar com Matt</span>
        </a>
      </div>
    </div>
  );
};
