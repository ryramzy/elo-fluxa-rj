import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firestore';
import { useAuth } from '../../hooks/useAuth';
import { FaCheckCircle, FaArrowRight, FaArrowLeft, FaAward, FaBolt, FaBriefcase, FaPlane, FaComments, FaFilm, FaLock, FaMicrophone, FaBookOpen, FaClock, FaFire } from 'react-icons/fa';
import { trackEvent } from '../../utils/analytics';
import confetti from 'canvas-confetti';

interface InteractiveOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const InteractiveOnboardingModal: React.FC<InteractiveOnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<string>('Básico');
  const [goal, setGoal] = useState<string>('Carreira & Reuniões');
  const [challenge, setChallenge] = useState<string>('Bloqueio na hora de falar');
  const [pace, setPace] = useState<string>('30 min por dia');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const totalSteps = 4;
  const progressPercentage = Math.round((step / totalSteps) * 100);

  const levels = [
    {
      id: 'Iniciante Zero',
      title: 'Iniciante Zero',
      desc: 'Não sei quase nada ou apenas palavras isoladas',
      emoji: '🐣',
      starterLevel: 1,
      badge: 'Nível 1'
    },
    {
      id: 'Básico',
      title: 'Básico',
      desc: 'Entendo frases simples mas travo completamente na hora de falar',
      emoji: '🌿',
      starterLevel: 1,
      badge: 'Nível 1'
    },
    {
      id: 'Intermediário',
      title: 'Intermediário',
      desc: 'Consigo me virar, mas falta vocabulário natural e fluência',
      emoji: '🚀',
      starterLevel: 2,
      badge: 'Nível 2'
    },
    {
      id: 'Avançado',
      title: 'Avançado / Profissional',
      desc: 'Já falo bem, foco em Business English e expressões nativas',
      emoji: '💼',
      starterLevel: 3,
      badge: 'Nível 3'
    }
  ];

  const goals = [
    {
      id: 'Carreira & Reuniões',
      title: 'Carreira & Negócios',
      desc: 'Destravar para falar em reuniões de trabalho, entrevistas e emails',
      icon: FaBriefcase,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'Viagens & Morar Fora',
      title: 'Viagens & Imigração',
      desc: 'Viajar com independência, restaurantes, aeroportos e morar fora',
      icon: FaPlane,
      color: 'from-emerald-600 to-teal-600'
    },
    {
      id: 'Conversação Real com Nativos',
      title: 'Conversação Natural',
      desc: 'Falar inglês do dia a dia com nativos sem vergonha',
      icon: FaComments,
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'Cultura & Mídia sem Legendas',
      title: 'Filmes, Séries & Podcasts',
      desc: 'Entender conversas em velocidade real sem precisar de tradução',
      icon: FaFilm,
      color: 'from-amber-600 to-orange-600'
    }
  ];

  const challenges = [
    {
      id: 'Bloqueio na hora de falar',
      title: 'Bloqueio na hora de falar',
      desc: 'Entendo na cabeça, mas na hora de soltar a voz me dá branco',
      icon: FaLock,
    },
    {
      id: 'Pronúncia e Connected Speech',
      title: 'Pronúncia & Sotaque',
      desc: 'Quero soar mais natural e aprender como os nativos conectam as palavras',
      icon: FaMicrophone,
    },
    {
      id: 'Falta de Vocabulário',
      title: 'Falta de Vocabulário',
      desc: 'Faltam palavras e expressões modernas para me expressar com precisão',
      icon: FaBookOpen,
    },
    {
      id: 'Compreensão Rápida',
      title: 'Velocidade dos Nativos',
      desc: 'Quando falam rápido ou usam gírias, me perco com facilidade',
      icon: FaBolt,
    }
  ];

  const paces = [
    {
      id: '15 min por dia',
      title: '15 minutos / dia',
      desc: 'Prática diária rápida com micro-lições para criar o hábito',
      icon: FaClock,
      tag: 'Leve & Constante'
    },
    {
      id: '30 min por dia',
      title: '30 minutos / dia',
      desc: 'Ritmo ideal: decks interativos + exercícios de connected speech',
      icon: FaFire,
      tag: 'Recomendado ⭐'
    },
    {
      id: 'Aulas 1:1 no Zoom',
      title: 'Aulas 1:1 com Professor Nativo',
      desc: 'Prática intensiva no Zoom com agendamento flexível',
      icon: FaComments,
      tag: 'Mais Rápido 🚀'
    }
  ];

  const handleNext = () => {
    if (step < totalSteps + 1) {
      setStep(step + 1);
      if (step === totalSteps) {
        // Trigger celebratory confetti on reaching completion step
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    }
  };

  const handleFinish = async () => {
    setSaving(true);

    // Immediately cache in localStorage so Dashboard never re-opens onboarding
    if (user?.uid) {
      try {
        localStorage.setItem(`elo_onboarding_completed_${user.uid}`, 'true');
      } catch (e) {}
    }

    try {
      if (user && user.uid !== 'guest_user') {
        const userRef = doc(db, 'users', user.uid);
        const selectedLevelObj = levels.find(l => l.id === level) || levels[1];
        
        const { setDoc, serverTimestamp, increment } = await import('firebase/firestore');
        await setDoc(userRef, {
          hasSeenOnboarding: true,
          level: selectedLevelObj.starterLevel,
          levelName: selectedLevelObj.title,
          targetGoal: goal,
          learningGoal: goal,
          challenge: challenge,
          learningPace: pace,
          xp: increment(50), // 50 XP Welcome Gift
          lastActiveDate: serverTimestamp()
        }, { merge: true });

        trackEvent('onboarding_completed', {
          level,
          goal,
          challenge,
          pace
        });

        // Prompt for PWA push notification permission on onboarding completion
        try {
          const { isPWAStandalone, requestPushPermission } = await import('../../utils/pushNotifications');
          if (isPWAStandalone()) {
            setTimeout(() => {
              requestPushPermission(user.uid);
            }, 1500);
          }
        } catch (pErr) {}
      }
    } catch (err) {
      console.warn('Onboarding save error:', err);
    } finally {
      setSaving(false);
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-10 relative text-white my-8 overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Progress Bar Header */}
        {step <= totalSteps && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              <span>Personalizando seu plano</span>
              <span>Passo {step} de {totalSteps}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: ENGLISH LEVEL */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center sm:text-left">
                <span className="text-xs font-black uppercase text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full">
                  Nível Atual
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  Qual é o seu nível de inglês hoje?
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Seja sincero(a). Nós adaptamos o conteúdo e as aulas 1:1 exatamente para onde você está.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {levels.map((lvl) => {
                  const isSelected = level === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setLevel(lvl.id)}
                      className={`p-5 rounded-2xl text-left border transition-all flex flex-col justify-between relative active:scale-[0.98] ${
                        isSelected
                          ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/50'
                          : 'bg-slate-800/60 border-slate-750 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{lvl.emoji}</span>
                        {isSelected && <FaCheckCircle className="text-blue-400 text-lg" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{lvl.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{lvl.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  Continuar <FaArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PRIMARY GOAL */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center sm:text-left">
                <span className="text-xs font-black uppercase text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-full">
                  Seu Foco
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  Qual é o seu principal objetivo?
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Qual transformação você deseja alcançar com suas aulas e prática?
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {goals.map((g) => {
                  const isSelected = goal === g.id;
                  const Icon = g.icon;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id)}
                      className={`w-full p-4 sm:p-5 rounded-2xl text-left border transition-all flex items-center gap-4 active:scale-[0.98] ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/50'
                          : 'bg-slate-800/60 border-slate-750 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-gradient-to-tr ${g.color} text-white shadow-md`}>
                        <Icon />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm sm:text-base">{g.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{g.desc}</p>
                      </div>
                      {isSelected && <FaCheckCircle className="text-indigo-400 text-lg flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-3.5 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <FaArrowLeft /> Voltar
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  Continuar <FaArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: BIGGEST CHALLENGE */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center sm:text-left">
                <span className="text-xs font-black uppercase text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-full">
                  Superação
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  Qual é o seu maior gargalo hoje?
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  O que mais te impede de falar inglês com segurança?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {challenges.map((c) => {
                  const isSelected = challenge === c.id;
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setChallenge(c.id)}
                      className={`p-5 rounded-2xl text-left border transition-all flex flex-col justify-between active:scale-[0.98] ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/50'
                          : 'bg-slate-800/60 border-slate-750 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-base">
                          <Icon />
                        </div>
                        {isSelected && <FaCheckCircle className="text-amber-400 text-base" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{c.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-3.5 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <FaArrowLeft /> Voltar
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  Continuar <FaArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: STUDY PACE */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center sm:text-left">
                <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
                  Sua Rotina
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  Quanto tempo você quer dedicar?
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Constância diária supera qualquer método tradicional de cursinho.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                {paces.map((p) => {
                  const isSelected = pace === p.id;
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPace(p.id)}
                      className={`w-full p-5 rounded-2xl text-left border transition-all flex items-center gap-4 active:scale-[0.98] ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/50'
                          : 'bg-slate-800/60 border-slate-750 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl flex-shrink-0">
                        <Icon />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{p.title}</h3>
                          <span className="text-[10px] font-black uppercase bg-emerald-950 border border-emerald-700/60 text-emerald-300 px-2 py-0.5 rounded-full">
                            {p.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{p.desc}</p>
                      </div>
                      {isSelected && <FaCheckCircle className="text-emerald-400 text-lg flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-3.5 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <FaArrowLeft /> Voltar
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  Gerar Meu Plano <FaArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: COMPLETION / REWARD SUMMARY */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-6 py-4"
            >
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-500 rounded-3xl flex items-center justify-center text-4xl text-slate-950 mx-auto shadow-xl shadow-yellow-500/30 animate-bounce">
                🎉
              </div>

              <div>
                <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-950 border border-emerald-700/60 px-3.5 py-1.5 rounded-full">
                  +50 XP Bônus de Boas-Vindas
                </span>
                <h2 className="text-3xl font-black text-white mt-3">
                  Seu Plano Personalizado Está Pronto!
                </h2>
                <p className="text-sm text-slate-300 max-w-md mx-auto mt-2">
                  Configuramos sua trilha de estudo e preparamos suas lições para focar em <strong>{goal}</strong>.
                </p>
              </div>

              {/* Summary Badges */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 text-left space-y-3 max-w-lg mx-auto">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400">Nível Inicial:</span>
                  <span className="font-bold text-white">{level}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400">Foco Principal:</span>
                  <span className="font-bold text-indigo-300">{goal}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400">Gargalo a Destravar:</span>
                  <span className="font-bold text-amber-300">{challenge}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Meta de Prática:</span>
                  <span className="font-bold text-emerald-300">{pace}</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleFinish}
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-500/30 active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <FaBolt /> {saving ? 'Salvando...' : 'Acessar Meu Painel'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
