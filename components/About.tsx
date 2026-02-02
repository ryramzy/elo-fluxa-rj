/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import Testimonials from './Testimonials';
import { SupportedLanguage } from '../types';
import { trackEvent } from '../services/trackingService';

interface BadgeProps {
  label: string;
  tier: 'Gold' | 'Silver' | 'Bronze' | 'Special';
  status?: string;
  icon: string | React.ReactNode;
  progress: number;
  featured?: boolean;
}

function Badge({ label, tier, status, icon, progress, featured }: BadgeProps) {
  const isGold = tier === 'Gold';
  const isSpecial = tier === 'Special';
  
  return (
    <div className={`flex flex-col items-center text-center group transition-all duration-300 hover:scale-105 ${featured ? 'mb-8' : 'mb-4'}`}>
      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg mb-3 overflow-hidden border-2 border-white ${
        isGold ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600' : 
        isSpecial ? 'bg-gradient-to-br from-blue-500 to-green-500' :
        tier === 'Silver' ? 'bg-gradient-to-br from-slate-200 to-slate-400' :
        'bg-gradient-to-br from-orange-300 to-orange-500'
      }`}>
        {(isGold || isSpecial) && <div className="shimmer-overlay opacity-30"></div>}
        <span className="text-2xl sm:text-3xl relative z-10 filter drop-shadow-md">{icon}</span>
      </div>
      <h5 className={`font-bold text-slate-800 leading-tight mb-1 ${featured ? 'text-xs sm:text-sm' : 'text-[9px] sm:text-[10px]'}`}>
        {label}
      </h5>
      {status && (
        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          {status}
        </span>
      )}
      <div className="w-12 sm:w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${isGold ? 'bg-amber-500' : isSpecial ? 'bg-blue-400' : 'bg-slate-300'}`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

interface AboutProps {
  lang: SupportedLanguage;
}

export default function About({ lang }: AboutProps) {
  const t = {
    pt: {
      method: 'O Método',
      tagline1: 'Nativo.',
      tagline2: 'Que fala português.',
      desc: 'Sou o "Nativo dos Cariocas". Entendo os erros comuns de quem fala português e te ajudo a superá-los com confiança. Sem medo de ser iniciante.',
      cta: 'Agendar Aula',
      native: 'Coach Nativo',
      aboutTitle: 'Sobre o Matthew',
      perspective: 'Apoio em Português',
      perspectiveDesc: 'Eu falo português fluentemente. Isso significa que posso te explicar conceitos complexos na sua língua quando você travar, garantindo que o aprendizado nunca pare.',
      pro: 'Especialista em Business English para os setores de Petróleo & Gás e Tecnologia do Rio.',
      philoQuote: '"Aprender inglês não deve ser um fardo. É uma ponte para novas oportunidades no Rio e no mundo."'
    },
    en: {
      method: 'The Method',
      tagline1: 'Native.',
      tagline2: 'Portuguese Support.',
      desc: 'I am the "Carioca Native". I understand the common mistakes Portuguese speakers make and help you overcome them with confidence.',
      cta: 'Book a Lesson',
      native: 'Native Coach',
      aboutTitle: 'About Matthew',
      perspective: 'Portuguese Support',
      perspectiveDesc: 'I speak Portuguese fluently. This means I can explain complex concepts in your language when you get stuck.',
      pro: 'Specialist in Business English for Rio\'s Oil & Gas and Tech sectors.',
      philoQuote: '"Learning English shouldn\'t be a chore. It\'s a bridge to new opportunities in Rio and beyond."'
    }
  };

  const curr = (t as any)[lang] || t.en;

  const featuredBadges: Array<BadgeProps> = [
    { 
      label: lang === 'pt' ? 'Conexão Bilíngue' : 'Bilingual Connection', 
      tier: 'Special', 
      status: 'Ready to Help', 
      icon: <div className="flex gap-1"><span>🇺🇸</span><span>🇧🇷</span></div>, 
      progress: 100, 
      featured: true 
    },
    { label: lang === 'pt' ? 'Inspirador' : 'Inspirational', tier: 'Gold', status: 'Max Reach', icon: '✨', progress: 100, featured: true },
    { label: lang === 'pt' ? 'Exp. Rio Tech' : 'Rio Tech Expert', tier: 'Gold', status: 'Level 10', icon: '☁️', progress: 95, featured: true },
  ];

  return (
    <div className="animate-fade-in-up space-y-32 pb-24 max-w-6xl mx-auto">
      <section className="flex flex-col lg:flex-row gap-20 items-center">
        <div className="lg:w-1/2 flex-shrink-0">
          <div className="relative">
            <div className="aspect-[4/5] w-full max-w-sm mx-auto overflow-hidden rounded-sm shadow-[40px_40px_0_rgba(59,130,246,0.1)] border border-white">
              <img 
                src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=800" 
                alt="Matthew - Native English Coach" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-slate-900 text-white p-10 hidden md:block border-b-4 border-blue-600">
              <p className="text-xs font-bold uppercase tracking-[0.4em] mb-3 text-blue-400">{curr.native}</p>
              <h4 className="text-4xl font-serif">Matthew</h4>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 space-y-10">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.5em] text-blue-600 block">{curr.method}</span>
            <h2 className="font-serif font-bold text-slate-900 leading-[1.1] text-5xl md:text-7xl">
              {curr.tagline1} <br/> <span className="italic text-blue-400">{curr.tagline2}</span>
            </h2>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed font-light">
            {curr.desc}
          </p>
          <div className="flex gap-6 pt-4">
            <button 
              onClick={() => {
                trackEvent('about_cta_click');
                const agendaBtn = document.querySelector('[data-tab="agenda"]') as HTMLButtonElement;
                agendaBtn?.click();
              }}
              className="px-12 py-5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-blue-600 transition-all shadow-xl"
            >
              {curr.cta}
            </button>
          </div>
        </div>
      </section>

      <Testimonials lang={lang} />

      <section className="bg-white p-12 md:p-24 border border-slate-100 shadow-sm rounded-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
        <div className="max-w-4xl mx-auto text-center mb-20 relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-blue-600 mb-6 block">Credenciais & Diferenciais</span>
          <h3 className="text-4xl font-serif font-bold text-slate-900 mb-8 leading-tight">Por que estudar comigo?</h3>
          <div className="w-16 h-1 bg-blue-600 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-3 gap-12 mb-24 max-w-3xl mx-auto">
          {featuredBadges.map((b, i) => (
            <Badge key={i} {...b} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
        <div className="lg:col-span-8 space-y-20">
          <section>
            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-10 border-b border-slate-100 pb-6">{curr.aboutTitle}</h3>
            <div className="space-y-8 text-slate-600 leading-relaxed text-xl font-light">
              <p>
                🇧🇷 <strong className="text-slate-900 font-semibold">{curr.perspective}.</strong> {curr.perspectiveDesc}
              </p>
              <p>
                💼 {curr.pro}
              </p>
            </div>
          </section>

          <section className="bg-slate-900 text-white p-12 md:p-16 border-l-8 border-blue-600">
            <p className="text-slate-200 leading-relaxed italic font-serif text-2xl">
              {curr.philoQuote}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
