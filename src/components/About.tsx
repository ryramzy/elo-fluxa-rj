/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courses } from '@/data/courses';
import { useAuth } from '@/hooks/useAuth';
import { useEnrollments } from '@/hooks/useEnrollments';
import { 
  BRAND_NAME, 
  DOMAIN_NAME, 
  STUDENT_COUNT, 
  WHATSAPP_NUMBER, 
  ZOOM_MEETING_URL, 
  getWhatsAppLink, 
  TESTIMONIALS,
  MATTHEW_BIO
} from '../../constants';
import Hero from './Hero';
import LoginModal from './LoginModal';
import { FaCheckCircle, FaCalendarAlt, FaVideo, FaComments, FaStar, FaChevronDown, FaChevronUp, FaWhatsapp, FaBolt, FaArrowRight } from 'react-icons/fa';

export default function About() {
  const navigate = useNavigate();
  const { user, signInAsGuest } = useAuth();
  const { enrollments } = useEnrollments(user?.uid || '');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly'>('monthly');

  // Redirect authenticated full users directly to their dashboard
  useEffect(() => {
    if (user && !user.isGuest) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleStartAuth = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setLoginModalOpen(true);
    }
  };

  const handleDemoLesson = (courseId = 'basic-english-daily-life', lessonId = 'be-dl-01') => {
    signInAsGuest();
    navigate(`/courses/${courseId}/lessons/${lessonId}`);
  };

  const faqs = [
    {
      q: "Preciso ter conta no Zoom para entrar na aula com o Matt?",
      a: "Não! Você só precisa clicar no botão 'Entrar no Zoom' na plataforma. O link abre diretamente no seu navegador ou aplicativo, sem necessidade de cadastro prévio ou pagamento de licença."
    },
    {
      q: "Como funciona o agendamento de aulas?",
      a: "É no estilo do Cambly: você acessa nosso calendário visual, escolhe os dias e horários livres que melhor se encaixam na sua rotina e confirma com 1 clique."
    },
    {
      q: "E se eu for iniciante e tiver vergonha de falar?",
      a: "O Matt mora no Rio de Janeiro há mais de 6 anos e é fluente em português. Ele entende exatamente as dificuldades e os vícios de pronúncia dos brasileiros, criando um ambiente 100% acolhedor e focado em destravar sua fala."
    },
    {
      q: "Como funcionam os planos de assinatura?",
      a: "Você tem acesso ilimitado à biblioteca completa de cursos e decks interativos do ELO!, além do seu pacote mensal de aulas ao vivo 1:1 no Zoom com o professor. Sem fidelidade forçada, podendo cancelar quando quiser."
    },
    {
      q: "Posso pagar com Pix ou Cartão de Crédito?",
      a: "Sim! Aceitamos Pix instantâneo, Cartão de Crédito em até 12x, boleto e saldo Mercado Pago — tudo processado com segurança pelo Mercado Pago."
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
        onSignIn={() => navigate('/dashboard')} 
      />

      {/* 1. HERO SECTION */}
      <Hero onEnter={handleStartAuth} />

      {/* 2. HOW IT WORKS (Cambly + Open English Hybrid) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-blue-500 bg-blue-50 dark:bg-blue-950/60 px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
            Simples • Sem Burocracia
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-4 tracking-tight">
            Como funciona o {BRAND_NAME}?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base md:text-lg">
            O melhor do modelo Cambly (agendamento flexível) com a praticidade do Open English (aulas 1-click no Zoom).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="w-14 h-14 bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl font-black mb-6 group-hover:scale-110 transition-transform">
              <FaCalendarAlt />
            </div>
            <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Passo 1</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Escolha seu Horário</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Consulte os horários abertos no calendário e agende suas sessões 1:1 conforme sua disponibilidade da semana.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="w-14 h-14 bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl font-black mb-6 group-hover:scale-110 transition-transform">
              <FaVideo />
            </div>
            <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Passo 2</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Entre no Zoom em 1 Clique</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Sem precisar criar conta no Zoom ou instalar programas pesados. Clique no botão de acesso direto e inicie a aula com o professor.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="w-14 h-14 bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center text-2xl font-black mb-6 group-hover:scale-110 transition-transform">
              <FaComments />
            </div>
            <div className="text-xs font-black text-purple-600 uppercase tracking-widest mb-1">Passo 3</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pratique & Destrave</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Conversação real com foco em connected speech, expressões nativas e feedback detalhado no WhatsApp pós-aula.
            </p>
          </div>
        </div>
      </section>

      {/* 3. ABOUT MATT RAMSAY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 rounded-3xl p-8 md:p-12 border border-blue-500/20 shadow-2xl text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Professor Avatar / Badge */}
            <div className="lg:col-span-5 flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 p-1.5 shadow-2xl shadow-blue-500/30 overflow-hidden">
                  <img 
                    src="/matt-profile.jpg" 
                    alt="Professor Matt" 
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = '<div class="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-5xl font-black">M</div>';
                      }
                    }}
                  />
                </div>
                <div className="absolute bottom-2 right-2 bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full border-2 border-slate-900 shadow-md flex items-center gap-1">
                  <span>🇺🇸</span> Nativo EUA
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-black mt-4">Professor Matt</h3>
              <p className="text-blue-300 text-sm font-bold">Professor Nativo & Fundador • {DOMAIN_NAME}</p>
              
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 px-3 py-1 rounded-full flex items-center gap-1">
                  📍 Rio de Janeiro
                </span>
                <span className="text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 px-3 py-1 rounded-full flex items-center gap-1">
                  🇧🇷 Português Fluente
                </span>
                <span className="text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 px-3 py-1 rounded-full flex items-center gap-1">
                  ⏳ +6 anos no Brasil
                </span>
              </div>
            </div>

            {/* Professor Story & Bio */}
            <div className="lg:col-span-7 space-y-4 text-slate-300">
              <h4 className="text-2xl font-black text-white">
                "O Nativo que fala sua língua no Rio de Janeiro."
              </h4>
              <p className="text-sm md:text-base leading-relaxed">
                {MATTHEW_BIO.intro.text}
              </p>
              <p className="text-sm md:text-base leading-relaxed text-slate-400">
                Com anos de experiência ensinando em grandes plataformas (como Cambly e Open English), desenvolvi o método ELO! especialmente para profissionais, estudantes e entusiastas brasileiros que querem falar com naturalidade, sem o bloqueio da gramática tradicional de livro.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <a
                  href={getWhatsAppLink('landing')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95"
                >
                  <FaWhatsapp className="text-base" /> Falar com o Matt no WhatsApp
                </a>
                <button
                  onClick={handleStartAuth}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 border border-blue-400/40"
                >
                  <FaBolt /> Acessar Plataforma
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SUBSCRIPTION PLANS & PAYWALL CARDS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Planos de Assinatura
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-4 tracking-tight">
            Invista na sua Fluência Real
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-base">
            Aulas particulares com professores nativos no Zoom + acesso ilimitado a todos os módulos de curso.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Weekly Plan (1x/week) */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-black uppercase px-3 py-1 rounded-full mb-4">
                Plano 1x por Semana
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Conversação Contínua</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">1 aula particular por semana (4 aulas/mês)</p>
              
              <div className="my-6">
                <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">R$ 400</span>
                <span className="text-sm font-semibold text-slate-500"> / mês</span>
              </div>

              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span><strong>1 aula 1:1 particular/semana (60 min)</strong> no Zoom</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Acesso ilimitado a todos os <strong>Cursos ELO!</strong></span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Feedback detalhado de pronúncia por aula</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Suporte direto com professor no WhatsApp</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStartAuth}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95"
            >
              Começar Plano 1x por Semana
            </button>
          </div>

          {/* Bi-Weekly Plan (2x/week) (Featured) */}
          <div className="bg-gradient-to-b from-blue-900/30 to-indigo-950/40 dark:from-slate-800 dark:to-slate-850 border-2 border-emerald-500 rounded-3xl p-8 shadow-2xl relative flex flex-col justify-between">
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
              ⭐ Mais Escolhido (Aceleração)
            </div>

            <div>
              <div className="inline-block bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase px-3 py-1 rounded-full mb-4">
                Plano 2x por Semana
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Imersão de Fluência</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">2 aulas particulares por semana (8 aulas/mês)</p>

              <div className="my-6">
                <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">R$ 700</span>
                <span className="text-sm font-semibold text-slate-500"> / mês</span>
              </div>

              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span><strong>2 aulas 1:1 particulares/semana (60 min cada)</strong> no Zoom</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Acesso ilimitado a todos os <strong>Cursos ELO!</strong></span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Acompanhamento intensivo de pronúncia e negócios</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Prioridade de agendamento na grade semanal</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStartAuth}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 border border-emerald-400/40"
            >
              Assinar Plano 2x por Semana
            </button>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE LMS COURSE SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-4 py-1.5 rounded-full border border-purple-200 dark:border-purple-800">
            Currículo Completo
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-4 tracking-tight">
            Cursos Interativos ELO!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-base">
            De conversação do dia a dia a Business English para tecnologia e reuniões internacionais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:scale-[1.01] flex flex-col justify-between"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0 z-10"
                  style={{ backgroundColor: course.accentColor + '30' }}
                />
                <div className="absolute bottom-3 left-3 text-3xl">
                  {course.emoji}
                </div>
                <div className="absolute top-3 right-3">
                  <span 
                    className="px-3 py-1 rounded-full text-[11px] font-black text-white shadow-md"
                    style={{ backgroundColor: course.accentColor }}
                  >
                    {course.tag}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">
                    {course.lessons.length} aulas • Prática interativa
                  </span>
                  <button
                    onClick={() => handleDemoLesson(course.id, course.lessons[0]?.id)}
                    className="px-3.5 py-2.5 min-h-[38px] bg-blue-50 hover:bg-blue-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-blue-600 dark:text-blue-400 font-extrabold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Testar <FaArrowRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. REAL STUDENT TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-4 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
            Resultados Comprovados
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-4 tracking-tight">
            O que nossos alunos dizem
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-base">
            Alunos do Rio de Janeiro e de todo o Brasil aprendendo com professores nativos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.slice(0, 3).map((t, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={14} />
                  ))}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{t.content}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</h4>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">{t.location} • Verificado</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Dúvidas Frequentes
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
            Tudo o que você precisa saber sobre as aulas e a plataforma {BRAND_NAME}.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-slate-900 dark:text-white flex items-center justify-between gap-4 text-sm md:text-base hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <FaChevronUp className="text-blue-500 flex-shrink-0" /> : <FaChevronDown className="text-slate-400 flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. FINAL CONVERSION BANNER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl space-y-6">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">
            Pronto para falar inglês de verdade?
          </h2>
          <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto">
            Junte-se a mais de {STUDENT_COUNT} alunos e comece hoje mesmo sua jornada de conversação com o professor.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <button
              onClick={handleStartAuth}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 hover:bg-slate-100 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              <FaBolt className="text-blue-600" /> Criar Conta Grátis
            </button>
            <a
              href={getWhatsAppLink('landing')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              <FaWhatsapp className="text-base" /> Falar com o Matt no WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
