import React from 'react';
import type { TimeSlot } from '../../types';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot | null) => void;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedSlot,
  onSelectSlot
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {slots.map(slot => (
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
  );
};
