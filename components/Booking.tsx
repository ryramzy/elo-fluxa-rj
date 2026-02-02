/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState } from 'react';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../constants';

const Booking: React.FC = () => {
  const [showSlots, setShowSlots] = useState(false);

  const handleWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  };

  const mockSlots = [
    "Segunda, 10:00 (Rio)",
    "Terça, 14:30 (Rio)",
    "Quarta, 16:00 (Rio)"
  ];

  return (
    <div className="bg-blue-50 p-12 md:p-20 rounded-xl border-2 border-dashed border-blue-200 text-center max-w-4xl mx-auto shadow-inner">
      <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-8 text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      </div>
      <h3 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-6">Agenda Conectada</h3>
      <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-xl mx-auto">
        Minha agenda agora está integrada ao Google Calendar e Zoom via MCP. 
        Você pode ver a disponibilidade real ou pedir para o Assistente de IA agendar para você.
      </p>
      
      {!showSlots ? (
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button 
            onClick={() => setShowSlots(true)}
            className="bg-blue-600 text-white px-10 py-5 rounded-none font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl"
          >
            Ver Horários Livres
          </button>
          <div className="flex items-center gap-4 text-sm font-bold text-blue-800 uppercase tracking-widest bg-white px-6 py-5 border border-blue-200 shadow-sm">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            Live Availability
          </div>
        </div>
      ) : (
        <div className="animate-fade-in-up">
            <div className="grid grid-cols-1 gap-4 mb-10 max-w-md mx-auto">
                {mockSlots.map((slot, i) => (
                    <div key={i} className="bg-white p-4 border border-blue-100 flex justify-between items-center group hover:border-blue-500 transition-all">
                        <span className="font-bold text-slate-700">{slot}</span>
                        <button onClick={handleWhatsApp} className="text-xs font-bold text-blue-600 uppercase tracking-widest group-hover:underline">Escolher</button>
                    </div>
                ))}
            </div>
            <button onClick={() => setShowSlots(false)} className="text-slate-400 text-xs uppercase tracking-widest hover:text-slate-600">Voltar</button>
        </div>
      )}
      
      <p className="mt-12 text-xs text-gray-400 uppercase tracking-[0.2em] font-bold">
        Agendamento automatizado com link de Zoom instantâneo.
      </p>
    </div>
  );
};

export default Booking;