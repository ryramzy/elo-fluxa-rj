/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../constants';
import { SupportedLanguage } from '../types';

interface HeroProps {
  onScheduleClick: () => void;
  lang: SupportedLanguage;
}

export default function Hero({ onScheduleClick, lang }: HeroProps) {
  function handleWhatsAppClick() {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  }

  const content = {
    pt: {
      tag: 'A Conexão Nativa',
      subtitle: 'Inglês com americano nativo. Conectando você ao mundo com fluência, confiança e o estilo de vida carioca.',
      cta1: 'WhatsApp',
      cta2: 'Agenda Aula'
    },
    en: {
      tag: 'The Native Connection',
      subtitle: 'Native American English. Connecting you to the world with fluency, confidence, and the Carioca lifestyle.',
      cta1: 'WhatsApp',
      cta2: 'Schedule'
    },
    tr: {
      tag: 'Yerel Bağlantı',
      subtitle: 'Ana dili Amerikan İngilizcesi olan Matthew ile İngilizce. Rio yaşam tarzıyla akıcılık ve özgüven kazanın.',
      cta1: 'WhatsApp',
      cta2: 'Randevu Al'
    },
    ar: {
      tag: 'الاتصال الأصلي',
      subtitle: 'الإنجليزية مع ماثيو، المتحدث الأصلي. تواصل مع العالم بطلاقة وثقة، وبأسلوب حياة كاريوكا.',
      cta1: 'واتساب',
      cta2: 'جدولة حصة'
    },
    jp: {
      tag: 'ネイティブコネクション',
      subtitle: 'ネイティブのアメリカ英語。流暢さと自信、そしてリオのライフスタイルで世界とつながりましょう。',
      cta1: 'WhatsApp',
      cta2: '予約する'
    },
    zh: {
      tag: '原汁原味的连接',
      subtitle: '跟随母语人士 Matthew 学习英语。以流利和自信连接世界，体验里约生活方式。',
      cta1: 'WhatsApp',
      cta2: '预约课程'
    }
  };

  const current = content[lang] || content.en;

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-slate-900 pt-[33px]">
      <div className="absolute inset-0 w-full h-full">
        <img 
            src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=2000" 
            alt="Rio de Janeiro landscape" 
            className="w-full h-full object-cover opacity-50 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 max-w-5xl mx-auto">
        <div className="animate-fade-in-up">
          <span className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-blue-400 mb-8 px-6 py-2 border border-blue-400/30 bg-blue-400/10 rounded-full">
            {current.tag}
          </span>
          <h1 className={`font-serif text-white leading-[0.9] mb-8 ${lang === 'zh' || lang === 'jp' ? 'text-5xl md:text-7xl lg:text-8xl' : 'text-6xl md:text-8xl lg:text-9xl'}`}>
            Elo <span className="italic text-blue-400">Matt!</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 font-light leading-relaxed mb-12 max-w-2xl mx-auto">
            {current.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={handleWhatsAppClick}
              className="px-12 py-5 bg-blue-600 text-white text-xs font-bold uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-xl inline-flex items-center gap-3"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.207l-.694 2.547 2.628-.69c.904.536 1.774.821 2.809.822 3.183 0 5.768-2.587 5.769-5.767 0-3.181-2.587-5.766-5.769-5.766zm3.386 8.213c-.148.416-.745.76-1.024.811-.278.051-.62.083-1.002-.134-1.482-.84-2.441-2.355-2.515-2.454-.074-.1-.603-.803-.603-1.532s.38-1.083.515-1.232c.134-.149.297-.186.396-.186.099 0 .198.001.284.004.092.003.216-.034.338.257.123.292.421 1.024.458 1.099.037.075.062.163.013.261-.05.1-.074.162-.149.248-.074.086-.156.193-.223.259-.074.075-.152.156-.065.306.087.149.387.639.83 1.034.57.507 1.05.664 1.2.739.149.075.236.063.323-.037.086-.1.371-.433.47-.583.099-.15.198-.124.334-.075.137.049.866.408 1.015.483.149.075.248.112.284.174.037.062.037.36-.112.776zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.18L2 22l4.947-1.3c1.472.822 3.161 1.3 4.978 1.3 5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              {current.cta1}
            </button>
            <button 
              onClick={onScheduleClick}
              className="px-12 py-5 bg-white text-slate-900 text-xs font-bold uppercase tracking-[0.3em] hover:bg-slate-100 transition-all shadow-xl"
            >
              {current.cta2}
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
      </div>
    </section>
  );
}