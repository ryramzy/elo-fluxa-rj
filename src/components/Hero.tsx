/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE, STUDENT_COUNT } from '../../constants.ts';
import { trackEvent } from '@/utils/analytics';
import { useAuth } from '@/hooks/useAuth';

interface HeroProps {
  onEnter: () => void;
}

export default function Hero({ onEnter }: HeroProps) {
  const navigate = useNavigate();
  const { signInAsGuest } = useAuth();

  function handleWhatsAppClick() {
    trackEvent('hero_whatsapp_click');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  }

  function handleDemoClick() {
    trackEvent('hero_demo_click');
    signInAsGuest();
    navigate('/courses/basic-english-daily-life/lessons/be-dl-01');
  }

  const current = {
    tag: 'O Nativo que fala sua língua',
    subtitle: 'Aulas com professor nativo americano, foco total em conversação real.',
    subtitleEn: '',
    cta1: 'Falar com Professor',
    cta2: 'Testar Aula Demonstrativa',
    socialProof: `Ajudando ${STUDENT_COUNT}+ alunos a alcançarem a fluência este mês.`
  };

  return (
    <section className="relative w-full min-h-[620px] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 py-16 px-6 rounded-3xl shadow-2xl border-2 border-blue-500/30 my-4 backdrop-blur-xl">
      {/* Background Animated Glow Effects */}
      <div className="absolute top-0 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-blue-600/20 rounded-full blur-3xl -z-0 pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-indigo-600/20 rounded-full blur-3xl -z-0 pointer-events-none"></div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center max-w-5xl mx-auto">
        <div className="animate-fade-in-up space-y-6">
          
          {/* Floating Tutor Badge */}
          <div className="flex flex-col items-center mb-6">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-800/90 border border-blue-400/40 text-blue-300 text-xs font-extrabold uppercase tracking-widest shadow-xl backdrop-blur-md mb-4 hover:scale-105 transition-all">
              <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                🇺🇸
              </span>
              <span>Professor Nativo • Matt</span>
            </div>

            <div className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">ELO!</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold tracking-wide bg-emerald-950/40 px-4 py-1.5 rounded-full border border-emerald-500/30">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
              {current.socialProof}
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-white leading-[1.1] mb-4 text-4xl md:text-6xl font-black tracking-tight">
              Fale inglês de verdade.
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 font-medium leading-relaxed">
              Conversação real com o tutor nativo americano.
            </p>
          </div>

          <div className="max-w-[650px] mx-auto">
            <p className="text-base md:text-lg text-slate-300 font-normal leading-relaxed">
              Esqueça gramática decorada. Aprenda connected speech, expressões das ruas dos EUA e agende suas aulas 1-on-1 com o Professor no Rio.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-xl mx-auto pt-4">
            <button 
              onClick={handleDemoClick}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-black uppercase tracking-wider rounded-2xl hover:scale-105 transition-all shadow-xl shadow-blue-600/30 border-2 border-blue-400 flex items-center justify-center gap-2 min-h-[56px]"
            >
              <span>⚡</span> Testar Aula Demonstrativa
            </button>
            <button 
              onClick={() => {
                trackEvent('hero_explore_courses');
                const el = document.getElementById('cursos');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/courses');
                }
              }}
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white text-sm font-black uppercase tracking-wider rounded-2xl hover:scale-105 transition-all shadow-xl border-2 border-slate-600 flex items-center justify-center gap-2 min-h-[56px]"
            >
              <span>📚</span> Ver Grade de Cursos
            </button>
            <button 
              onClick={() => { trackEvent('hero_enter_click'); onEnter(); }}
              className="w-full sm:w-auto px-6 py-4 border-2 border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-bold uppercase tracking-wider rounded-2xl hover:bg-slate-800/80 transition-all flex items-center justify-center min-h-[56px]"
            >
              Entrar
            </button>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-4 text-center">
            Sem cartão de crédito. Teste a primeira aula 100% grátis.
          </p>
        </div>
      </div>
    </section>
  );
}