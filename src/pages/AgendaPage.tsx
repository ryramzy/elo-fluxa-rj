import React from 'react';
import { VisualSlotPicker } from '../components/booking/VisualSlotPicker';
import type { TimeSlot } from '../types';

const AgendaPage = () => {
  const handleSlotSelect = (slot: TimeSlot) => {
    console.log('Slot selected:', slot);
    // Handle successful booking if needed
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Agenda - Book Your Class
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Choose your preferred time slot from the visual calendar below
        </p>
      </div>

      <VisualSlotPicker onSlotSelect={handleSlotSelect} />

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
          How to Book Your Classes:
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <h4 className="font-medium mb-2">📅 Find Your Time</h4>
            <ul className="space-y-1">
              <li>• Use "Current Week" to see today's availability</li>
              <li>• Browse future weeks with Previous/Next buttons</li>
              <li>• Green slots are available for booking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">✨ Book & Cancel</h4>
            <ul className="space-y-1">
              <li>• Click any green slot to book it instantly</li>
              <li>• Orange slots are your bookings - click to cancel</li>
              <li>• Red slots are booked by other students</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>📚 Class Schedule:</strong> Monday-Friday, 8AM-9PM (60-minute sessions)
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgendaPage;
