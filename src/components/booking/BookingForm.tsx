import React from 'react';
import type { TimeSlot } from '../../types';

interface BookingFormProps {
  selectedSlot: TimeSlot | null;
  notes: string;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isBooking: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  selectedSlot,
  notes,
  onNotesChange,
  onConfirm,
  onCancel,
  isBooking
}) => {
  if (!selectedSlot) return null;

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50
                   bg-white dark:bg-slate-900 border-t 
                   border-slate-200 dark:border-slate-700 
                   shadow-2xl">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-lg capitalize">
              {formatDate(selectedSlot.date)}
            </p>
            <p className="text-slate-500 text-sm">
              {selectedSlot.time} · {selectedSlot.duration || 60} min
              · Professor nativo
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 
                       dark:hover:text-slate-200 p-1"
          >
            ✕
          </button>
        </div>
        <textarea
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          placeholder="Tema ou dúvida para a aula? (opcional)"
          className="w-full p-3 rounded-xl border 
                     border-slate-200 dark:border-slate-700 
                     bg-slate-50 dark:bg-slate-800 
                     text-slate-900 dark:text-white text-sm 
                     mb-4 resize-none focus:outline-none 
                     focus:ring-2 focus:ring-blue-500/20 
                     focus:border-blue-400"
          rows={2}
        />
        <button
          onClick={onConfirm}
          disabled={isBooking}
          className="w-full py-4 rounded-xl bg-green-500 
                     hover:bg-green-600 active:scale-[0.99]
                     text-white font-bold transition-all 
                     disabled:opacity-50 text-base"
        >
          {isBooking ? 'Agendando...' : 'Confirmar aula ✓'}
        </button>
      </div>
    </div>
  );
};
