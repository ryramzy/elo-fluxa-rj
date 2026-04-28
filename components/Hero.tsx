/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE, STUDENT_COUNT } from '../constants.ts';
import { trackEvent } from '../services/trackingService.ts';

interface HeroProps {
  onEnter: () => void;
}

export default function Hero({ onEnter }: HeroProps) {
  function handleWhatsAppClick() {
    trackEvent('hero_whatsapp_click');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  }

  const current = {
    tag: 'O Nativo que fala sua língua',
    subtitle: 'Aulas com professor nativo americano, foco total em conversação real.',
    subtitleEn: '',
    cta1: 'WhatsApp',
    cta2: 'Entrar no site',
    socialProof: `Ajudando ${STUDENT_COUNT}+ cariocas a alcançarem a fluência este mês.`
  };

  return (
    <section className="relative w-full h-[75vh] min-h-[600px] overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 pt-[33px]">

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 max-w-5xl mx-auto">
        <div className="animate-fade-in-up">
          <div className="flex flex-col items-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-400 mb-4 relative">
              <span className="relative z-10 tracking-wider animate-pulse-glow">Elo!</span>
              <span className="absolute inset-0 blur-md bg-blue-400/20 -z-10"></span>
            </h2>
            <span className="inline-block text-[11px] md:text-xs font-bold uppercase tracking-[0.4em] text-blue-300 mb-6 px-8 py-3 border border-blue-400/40 bg-blue-400/20 rounded-full shadow-lg shadow-blue-400/20">
              {current.tag}
            </span>
            <div className="flex items-center gap-2 text-[10px] text-white/60 font-bold uppercase tracking-widest">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {current.socialProof}
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="font-heading text-white leading-[0.9] mb-3 text-4xl md:text-5xl font-bold">
              Fale inglês de verdade.
            </h1>
            <p className="text-lg md:text-xl text-blue-300 font-light leading-relaxed">
              Desde a primeira aula.
            </p>
          </div>
          <div className="mb-10 max-w-[600px] mx-auto">
            <p className="text-lg text-slate-200 font-light leading-relaxed">
              {current.subtitle}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <button 
              onClick={handleWhatsAppClick}
              className="px-8 py-4 bg-[#22C55E] text-white text-sm font-bold uppercase tracking-[0.3em] hover:bg-[#16A34A] hover:scale-105 transition-all shadow-xl shadow-green-500/25 inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.207l-.694 2.547 2.628-.69.904.536 1.774.821 2.809.822 3.183 0 5.768-2.587 5.769-5.767 0-3.181-2.587-5.766-5.769-5.766zm3.386 8.213c-.148.416-.745.76-1.024.811-.278.051-.62.083-1.002-.134-1.482-.84-2.441-2.355-2.515-2.454-.074-.1-.603-.803-.603-1.532s.38-1.083.515-1.232c.134-.149.297-.186.396-.186.099 0 .198.001.284.004.092.003.216-.034.338.257.123.292.421 1.024.458 1.099.037.075.062.163.013.261-.05.1-.074.162-.149.248-.074.086-.156.193-.223.259-.074.075-.152.156-.065.306.087.149.387.639.83 1.034.57.507 1.05.664 1.2.739.149.075.236.063.323-.037.086-.1.371-.433.47-.583.099-.15.198-.124.334-.075.137.049.866.408 1.015.483.149.075.248.112.284.174.037.062.037.36-.112.776zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.18L2 22l4.947-1.3c1.472.822 3.161 1.3 4.978 1.3 5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              Quero começar
            </button>
            <button 
              onClick={() => { trackEvent('hero_enter_click'); onEnter(); }}
              className="px-6 py-3 border-2 border-white/60 text-white text-sm font-medium uppercase tracking-[0.3em] hover:bg-white hover:text-slate-900 hover:scale-105 transition-all shadow-lg shadow-white/10 backdrop-blur-sm"
            >
              Entrar
            </button>
          </div>
          <p className="text-sm text-slate-300 font-light mt-6 text-center opacity-80">
            Comece sem pressão. Evolua no seu ritmo.
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
      </div>
    </section>
  );
}