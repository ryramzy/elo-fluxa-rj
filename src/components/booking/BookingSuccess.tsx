import React from 'react';

interface BookingSuccessProps {
  onBookMore: () => void;
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({
  onBookMore
}) => {
  return (
    <div className="text-center py-20 space-y-4">
      <div className="text-6xl">🎉</div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
        Aula agendada com sucesso!
      </h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        Você receberá um e-mail com os detalhes da aula e o link para acessar a chamada.
      </p>
      <div className="space-y-3">
        <button
          onClick={onBookMore}
          className="bg-blue-600 hover:bg-blue-700 text-white 
                     px-6 py-3 rounded-xl font-medium 
                     transition-colors text-sm"
        >
          Agendar outra aula
        </button>
      </div>
    </div>
  );
};
