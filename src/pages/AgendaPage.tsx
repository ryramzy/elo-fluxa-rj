import React from 'react';
import { VisualSlotPicker } from '../components/booking/VisualSlotPicker';
import type { TimeSlot } from '../types';

const AgendaPage = () => {
  const handleSlotSelect = (slot: TimeSlot) => {
    // Analytics or additional side effects can go here.
    // The VisualSlotPicker handles the actual booking logic.
  };

  return (
    <div className="min-h-screen bg-[#020617] py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020617] to-[#020617]">
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight mb-4">
          Schedule Your Session
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
          Select an available time slot below to instantly book your next 1-hour session. 
          All times are shown in your local timezone.
        </p>
      </div>

      {/* Main Calendar Component */}
      <VisualSlotPicker onSlotSelect={handleSlotSelect} />

    </div>
  );
};

export default AgendaPage;
