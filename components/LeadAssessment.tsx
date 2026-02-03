/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { WHATSAPP_NUMBER } from '../constants.ts';
import { trackEvent } from '../services/trackingService.ts';

const LeadAssessment: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('lead_assessment_submit', { name });
    const message = `Olá Matthew! Meu nome é ${name}. Gostaria de fazer o Level Assessment gratuito que vi no seu site.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setSubmitted(true);
  };

  return (
    <section className="bg-slate-900 text-white py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent scale-150"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-blue-400 text-xs font-bold uppercase tracking-[0.4em] mb-6 block">Lead Magnet</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 leading-tight">Avaliação de Nível Gratuita</h2>
          <p className="text-slate-400 text-lg font-light leading-relaxed mb-8">
            Não tem certeza do seu nível? Envie uma mensagem e receba um feedback rápido via áudio no WhatsApp. É grátis e sem compromisso.
          </p>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-blue-400">
            <span className="w-10 h-[1px] bg-blue-400"></span>
            Feedback em até 24h
          </div>
        </div>

        <div className="bg-white p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Seu Nome</label>
              <input 
                required
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full bg-slate-50 border-b border-slate-200 py-3 px-4 text-slate-900 focus:border-blue-600 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">WhatsApp</label>
              <input 
                required
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 21 99999-9999"
                className="w-full bg-slate-50 border-b border-slate-200 py-3 px-4 text-slate-900 focus:border-blue-600 outline-none transition-all"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-5 bg-blue-600 text-white text-xs font-bold uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-xl"
            >
              Iniciar Avaliação
            </button>
            <p className="text-[9px] text-slate-400 text-center uppercase tracking-widest">
              🔒 Seus dados estão seguros (LGPD)
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LeadAssessment;