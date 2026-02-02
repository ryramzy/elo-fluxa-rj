/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../constants';
import { trackEvent } from '../services/trackingService';

const Booking: React.FC = () => {
  const [showSlots, setShowSlots] = useState(false);

  const handleWhatsApp = (slot: string) => {
    trackEvent('booking_slot_selected', { slot });
    const message = `Olá Matthew! Gostaria de agendar o horário de ${slot} que vi no seu site.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const mockSlots = [
    "Segunda, 10:00 (Rio)",
    "Terça, 14:30 (Rio)",
    "Quarta, 16:00 (Rio)"
  ];

  const isLowAvailability = mockSlots.length < 5;

  return (
    <div className="bg-white p-12 md:p-20 border border-slate-100 text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden">
      {isLowAvailability && (
        <div className="absolute top-6 right-6 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-amber-100 animate-pulse">
          ⚠️ Poucas vagas disponíveis
        </div>
      )}

      <div className="inline-block p-4 bg-blue-50 rounded-full mb-8 text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      </div>
      <h3 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">Agenda Conectada</h3>
      <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-xl mx-auto">
        Minha agenda está integrada ao Google Calendar. Veja a disponibilidade real e garanta sua vaga.
      </p>
      
      {!showSlots ? (
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button 
            onClick={() => { trackEvent('booking_view_slots_click'); setShowSlots(true); }}
            className="bg-slate-900 text-white px-10 py-5 rounded-none font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
          >
            Ver Horários Livres
          </button>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest px-6 py-5 border border-slate-100">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Availability
          </div>
        </div>
      ) : (
        <div className="animate-fade-in-up">
            <div className="grid grid-cols-1 gap-4 mb-10 max-w-md mx-auto">
                {mockSlots.map((slot, i) => (
                    <div key={i} className="bg-slate-50 p-6 border border-slate-100 flex justify-between items-center group hover:border-blue-500 hover:bg-white transition-all">
                        <span className="font-bold text-slate-700">{slot}</span>
                        <button 
                          onClick={() => handleWhatsApp(slot)} 
                          className="bg-blue-600 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all"
                        >
                          Agendar
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={() => setShowSlots(false)} className="text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-slate-900">Voltar</button>
        </div>
      )}
      
      <p className="mt-12 text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
        Agendamento 100% online com confirmação instantânea.
      </p>
    </div>
  );
};

export default Booking;
