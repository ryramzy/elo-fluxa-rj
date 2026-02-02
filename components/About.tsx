/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import Testimonials from './Testimonials';
import { SupportedLanguage } from '../types';

interface BadgeProps {
  label: string;
  tier: 'Gold' | 'Silver' | 'Bronze';
  status?: string;
  icon: string;
  progress: number;
  featured?: boolean;
}

function Badge({ label, tier, status, icon, progress, featured }: BadgeProps) {
  const isGold = tier === 'Gold';
  
  return (
    <div className={`flex flex-col items-center text-center group transition-all duration-300 hover:scale-105 ${featured ? 'mb-8' : 'mb-4'}`}>
      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg mb-3 overflow-hidden border-2 border-white ${
        isGold ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600' : 
        tier === 'Silver' ? 'bg-gradient-to-br from-slate-200 to-slate-400' :
        'bg-gradient-to-br from-orange-300 to-orange-500'
      }`}>
        {isGold && <div className="shimmer-overlay opacity-30"></div>}
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
          className={`h-full transition-all duration-1000 ${isGold ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-300'}`} 
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
      tagline1: 'Humano.',
      tagline2: 'Sem travas.',
      desc: 'Aprender inglês não deve ser um fardo. Foco em criar conexões reais, identificar nuances culturais e te ajudar a falar como um nativo — esteja você no Rio ou no Vale do Silício.',
      cta: 'Agendar Aula',
      native: 'Coach Nativo',
      aboutTitle: 'Sobre o Matthew',
      perspective: 'Perspectiva Global',
      perspectiveDesc: 'Já viajei para 13 países e morei em três. Explorei várias regiões dos EUA e valorizo profundamente as nuances culturais da comunicação.',
      pro: 'Profissionalmente, me especializo em Tecnologia & Finanças (IA Generativa, Arquitetura de Nuvem, Mercados). Ajudo os alunos não apenas com vocabulário, mas com o contexto específico de sua indústria.',
      hobby: 'Fora do ensino, mantenho-me ativo 💪 (trilha, boxe, academia) e pratico o Estoicismo. Acredito que aprender inglês é uma jornada de autoaperfeiçoamento, não apenas um conjunto de regras gramaticais.',
      philo: 'Filosofia de Ensino',
      philoQuote: '"A linguagem é uma ferramenta de conexão. Meu objetivo é fazer você se sentir confiante o suficiente para expressar quem você realmente é em inglês, evitando completamente a barreira da língua."'
    },
    en: {
      method: 'The Method',
      tagline1: 'Human.',
      tagline2: 'Not rigid.',
      desc: "Learning English shouldn't feel like a chore. I focus on building real connections, identifying cultural nuances, and helping you speak like a local—whether you're in Rio or Silicon Valley.",
      cta: 'Book a Lesson',
      native: 'Native Coach',
      aboutTitle: 'About Matthew',
      perspective: 'Global perspective',
      perspectiveDesc: 'I’ve traveled to 13 countries and lived in three. I’ve explored various regions of the U.S. and deeply appreciate the cultural nuances of communication.',
      pro: 'Professionally, I specialize in Technology & Finance (Generative AI, Cloud Architecture, Markets). I help students not just with vocabulary, but with the specific context of their industry.',
      hobby: 'Outside teaching, I stay active 💪 (hiking, boxing, gym) and practice Stoicism. I believe that learning English is a journey of self-improvement, not just a set of grammar rules.',
      philo: 'Teaching Philosophy',
      philoQuote: '"Language is a tool for connection. My goal is to make you feel confident enough to express your true self in English, avoiding the \'language barrier\' entirely."'
    },
    tr: {
      method: 'Yöntem',
      tagline1: 'İnsani.',
      tagline2: 'Katı değil.',
      desc: 'İngilizce öğrenmek bir angarya olmamalı. Gerçek bağlantılar kurmaya, kültürel nüansları belirlemeye ve ister Rio\'da ister Silikon Vadisi\'nde olun, yerel biri gibi konuşmanıza yardımcı olmaya odaklanıyorum.',
      cta: 'Ders Ayarla',
      native: 'Yerel Koç',
      aboutTitle: 'Matthew Hakkında',
      perspective: 'Küresel bakış açısı',
      perspectiveDesc: '13 ülkeyi gezdim ve üçünde yaşadım. ABD\'nin çeşitli bölgelerini keşfettim ve iletişimin kültürel nüanslarına derinden değer veriyorum.',
      pro: 'Profesyonel olarak Teknoloji ve Finans (Üretken Yapay Zeka, Bulut Mimarisi, Piyasalar) alanında uzmanım.',
      hobby: 'Öğretmenlik dışında aktif kalıyorum 💪 (yürüyüş, boks, spor salonu) ve Stoacılık pratiği yapıyorum.',
      philo: 'Öğretim Felsefesi',
      philoQuote: '"Dil bir bağlantı aracıdır. Amacım, dil engelinden tamamen kaçınarak, kendinizi İngilizce olarak ifade edebilecek kadar özgüvenli hissetmenizi sağlamaktır."'
    },
    ar: {
      method: 'المنهجية',
      tagline1: 'إنسانية.',
      tagline2: 'ليست جامدة.',
      desc: 'لا ينبغي أن يكون تعلم اللغة الإنجليزية عملاً شاقاً. أركز على بناء علاقات حقيقية، وتحديد الفروق الثقافية، ومساعدتك على التحدث مثل أهل اللغة - سواء كنت في ريو أو في وادي السيليكون.',
      cta: 'احجز درساً',
      native: 'مدرب أصلي',
      aboutTitle: 'حول ماثيو',
      perspective: 'منظور عالمي',
      perspectiveDesc: 'سافرت إلى 13 دولة وعشت في ثلاث. استكشفت مناطق مختلفة من الولايات المتحدة وأقدر بشدة الفروق الثقافية في التواصل.',
      pro: 'مهنياً، أتخصص في التكنولوجيا والتمويل (الذكاء الاصطعي التوليدي، هندسة السحابة، الأسواق).',
      hobby: 'خارج التدريس، أحافظ على نشاطي 💪 (المشي لمسافات طويلة، الملاكمة، الجيم) وأمارس الرواقية.',
      philo: 'فلسفة التدريس',
      philoQuote: '"اللغة هي أداة للتواصل. هدفي هو جعلك تشعر بالثقة الكافية للتعبير عن نفسك الحقيقية باللغة الإنجليزية، وتجنب \'حاجز اللغة\' تماماً."'
    },
    jp: {
      method: 'メソッド',
      tagline1: '人間的。',
      tagline2: '堅苦しくない。',
      desc: '英語学習は苦痛であってはなりません。私は、リオにいてもシリコンバレーにいても、真のつながりを築き、文化的なニュアンスを特定し、地元の人と同じように話せるようサポートすることに重点を置いています。',
      cta: 'レッスンを予約する',
      native: 'ネイティブコーチ',
      aboutTitle: 'マシューについて',
      perspective: 'グローバルな視点',
      perspectiveDesc: '13カ国を旅し、3カ国に住んだことがあります。米国のさまざまな地域を探索し、コミュニケーションの文化的なニュアンスを深く理解しています。',
      pro: 'プロフェッショナルとしては、テクノロジーとファイナンス（生成AI、クラウドアーキテクチャ、市場）を専門としています。',
      hobby: '教えること以外では、アクティブに過ごし💪（ハイキング、ボクシング、ジム）、ストア哲学を実践しています。',
      philo: '教育哲学',
      philoQuote: '「言語はつながりのためのツールです。私の目標は、言語の壁を完全に取り払い、英語で本当の自分を表現できる自信を持ってもらうことです」'
    },
    zh: {
      method: '教学方法',
      tagline1: '人性化。',
      tagline2: '不僵化。',
      desc: '学习英语不应该是一项苦差事。我专注于建立真实的联系，识别文化差异，并帮助你像当地人一样说话——无论你是在里约还是硅谷。',
      cta: '预约课程',
      native: '母语教练',
      aboutTitle: '关于 Matthew',
      perspective: '全球视野',
      perspectiveDesc: '我曾去过 13 个国家，并在三个国家居住过。我探索过美国的各个地区，深知沟通中的文化细微差别。',
      pro: '在专业领域，我专注于技术和金融（生成式人工智能、云架构、市场）。',
      hobby: '在教学之外，我保持运动习惯 💪（徒步、拳击、健身）并践行斯多葛学派哲学。',
      philo: '教学理念',
      philoQuote: '“语言是连接的工具。我的目标是让你有足够的信心用英语表达真实的自我，完全避开‘语言障碍’。”'
    }
  };

  const curr = t[lang] || t.en;

  const featuredBadges: Array<BadgeProps> = [
    { label: lang === 'pt' ? 'Professor Experiente' : 'Experienced Teacher', tier: 'Gold', status: 'Max Reach', icon: '👨‍🏫', progress: 100, featured: true },
    { label: lang === 'pt' ? 'Inspirador' : 'Inspirational', tier: 'Gold', status: 'Max Reach', icon: '✨', progress: 100, featured: true },
    { label: lang === 'pt' ? 'Especialista em Gramática' : 'Grammar Expert', tier: 'Gold', status: 'Level 10', icon: '📖', progress: 95, featured: true },
  ];

  return (
    <div className="animate-fade-in-up space-y-32 pb-24 max-w-6xl mx-auto">
      {/* Intro Section */}
      <section className="flex flex-col lg:flex-row gap-20 items-center">
        <div className="lg:w-1/2 flex-shrink-0">
          <div className="relative">
            <div className="aspect-[4/5] w-full max-w-sm mx-auto overflow-hidden rounded-sm shadow-[40px_40px_0_rgba(15,23,42,0.05)] border border-white">
              <img 
                src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=800" 
                alt="Matthew - Native English Coach" 
                className="w-full h-full object-cover grayscale-[0.2]"
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
            <h2 className={`font-serif font-bold text-slate-900 leading-[1.1] ${lang === 'zh' || lang === 'jp' ? 'text-4xl md:text-5xl' : 'text-5xl md:text-7xl'}`}>
              {curr.tagline1} <br/> <span className="italic text-slate-400">{curr.tagline2}</span>
            </h2>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed font-light">
            {curr.desc}
          </p>
          <div className="flex gap-6 pt-4">
            <button 
              onClick={() => {
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

      {/* Testimonials */}
      <Testimonials lang={lang} />

      {/* Badge Showcase */}
      <section className="bg-white p-12 md:p-24 border border-slate-100 shadow-sm rounded-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
        <div className="max-w-4xl mx-auto text-center mb-20 relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-amber-500 mb-6 block">Progress & Credentials</span>
          <h3 className="text-4xl font-serif font-bold text-slate-900 mb-8 leading-tight">Expertise Badges</h3>
          <div className="w-16 h-1 bg-amber-500 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-3 gap-12 mb-24 max-w-3xl mx-auto">
          {featuredBadges.map((b, i) => (
            <Badge key={i} {...b} />
          ))}
        </div>
      </section>

      {/* Bio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
        <div className="lg:col-span-8 space-y-20">
          <section>
            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-10 border-b border-slate-100 pb-6">{curr.aboutTitle}</h3>
            <div className="space-y-8 text-slate-600 leading-relaxed text-xl font-light">
              <p>
                🌍 <strong className="text-slate-900 font-semibold">{curr.perspective}.</strong> {curr.perspectiveDesc}
              </p>
              <p>
                {curr.pro}
              </p>
              <p>
                {curr.hobby}
              </p>
            </div>
          </section>

          <section className="bg-slate-900 text-white p-12 md:p-16 border-l-8 border-blue-600">
            <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-blue-400 mb-6">{curr.philo}</h4>
            <p className="text-slate-200 leading-relaxed italic font-serif text-2xl">
              {curr.philoQuote}
            </p>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-16">
          <div className="p-10 border border-slate-100 bg-white shadow-sm">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-10">Experience & Edu</h4>
            <div className="space-y-10">
               <div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1">Google Cloud Architect</h5>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Certified Expert</p>
               </div>
               <div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1">Sustainability Planner</h5>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ECO Action | Atlanta</p>
               </div>
               <div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1">Econ Graduate Studies</h5>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Univ. of Sydney</p>
               </div>
               <div className="pt-6 border-t border-slate-50">
                  <span className="px-4 py-2 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-[0.2em] rounded-sm shadow-lg">TESOL Certified</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
