import React from 'react';
import type { TimeSlot } from '../../types';

interface BookingCalendarProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot | null) => void;
  loading: boolean;
  weekOffset: number;
  onWeekChange: (offset: number) => void;
  weekLabel: string;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  loading,
  weekOffset,
  onWeekChange,
  weekLabel
}) => {
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });

  if (loading) {
    return (
      <div className="space-y-6">
        {[1,2].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-3"/>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {[1,2,3,4].map(j => (
                <div key={j} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl"/>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Week navigator */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onWeekChange(weekOffset - 1)}
          disabled={weekOffset <= 0}
          className="p-2 rounded-lg border border-slate-200 
                     dark:border-slate-700 text-slate-600 
                     dark:text-slate-300 disabled:opacity-30 
                     hover:bg-slate-100 dark:hover:bg-slate-800 
                     transition-colors"
        >
          ←
        </button>
        <span className="text-sm font-medium text-slate-700 
                         dark:text-slate-300 capitalize">
          {weekLabel}
        </span>
        <button
          onClick={() => onWeekChange(weekOffset + 1)}
          className="p-2 rounded-lg border border-slate-200 
                     dark:border-slate-700 text-slate-600 
                     dark:text-slate-300 hover:bg-slate-100 
                     dark:hover:bg-slate-800 transition-colors"
        >
          →
        </button>
      </div>

      {Object.keys(slotsByDate).length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="text-4xl">📅</div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Nenhum horário disponível esta semana
          </p>
          <p className="text-sm text-slate-400">
            Tente a próxima semana ou fale com Matt
          </p>
          <a 
            href={`https://wa.me/5521999999999?text=Olá Matt! Quero agendar uma aula.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 
                       bg-green-500 hover:bg-green-600 
                       text-white px-6 py-3 rounded-xl 
                       font-medium transition-colors text-sm"
          >
            Falar com Matt no WhatsApp
          </a>
        </div>
      ) : (
        (Object.entries(slotsByDate) as [string, TimeSlot[]][]).map(([date, daySlots]) => (
          <div key={date} className="mb-8">
            <h3 className="text-xs font-bold uppercase 
                           tracking-widest text-slate-400 
                           dark:text-slate-500 mb-3 capitalize">
              {formatDate(date)}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 
                            md:grid-cols-4 gap-3">
              {daySlots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => onSelectSlot(
                    selectedSlot?.id === slot.id ? null : slot
                  )}
                  className={`p-4 rounded-xl border text-left 
                             transition-all hover:scale-[1.02] ${
                    selectedSlot?.id === slot.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="font-bold text-slate-900 dark:text-white text-xl">
                    {slot.time}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {slot.duration || 60} min
                  </div>
                  {selectedSlot?.id === slot.id && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                      Selecionado ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
};
