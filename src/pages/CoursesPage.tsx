import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LuBookOpen, 
  LuTerminal, 
  LuGlobe, 
  LuSparkles, 
  LuFlame, 
  LuTrophy, 
  LuPlay, 
  LuChevronRight,
  LuBriefcase
} from 'react-icons/lu';
import { FaLock, FaUnlock, FaCheckCircle } from 'react-icons/fa';

// --- TYPE DEFINITIONS ---
export interface RPGScenario {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  backgroundImage: string;
  initialCharacter: {
    name: string;
    avatarBase: string;
    initialEmotion: 'idle' | 'happy' | 'impatient' | 'annoyed';
  };
  requiredGoals: string[];
}

export interface GamifiedCourse {
  id: string;
  title: string;
  description: string;
  category: 'Technical' | 'Conversational' | 'Professional' | 'Cultural';
  targetIndustry?: 'tech' | 'finance' | 'legal' | 'general';
  xpReward: number;
  totalLessons: number;
  lessonsCompleted: number;
  isLocked: boolean;
  themeColor: 'cyber-blue' | 'amber' | 'purple' | 'pink';
  lessons: {
    id: string;
    title: string;
    type: 'quiz_deck' | 'visual_novel_rpg';
    scenarios?: RPGScenario[];
  }[];
}

// --- MOCK DATABASE DATA (src/data/courses.ts equivalent) ---
const GAMIFIED_COURSES: GamifiedCourse[] = [
  {
    id: "tech_eng_01",
    title: "English for Software Developers",
    description: "Navigate production outages, code reviews, and architecture debates with American teams.",
    category: "Technical",
    targetIndustry: "tech",
    xpReward: 1200,
    totalLessons: 4,
    lessonsCompleted: 2,
    isLocked: false,
    themeColor: "cyber-blue",
    lessons: [
      {
        id: "dev_lesson_1",
        title: "Handling the Live Production Crash",
        type: "visual_novel_rpg",
        scenarios: [
          {
            id: "scen_prod_crash",
            title: "The Broken Deploy with Chloe",
            difficulty: "Advanced",
            backgroundImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
            initialCharacter: {
              name: "Chloe (SF Product Manager)",
              avatarBase: "chloe",
              initialEmotion: "annoyed"
            },
            requiredGoals: [
              "Isolate the deployment root cause flawlessly",
              "Explain the fix without deep infrastructure jargon",
              "Negotiate an acceptable service restoration timeline"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "biz_talk_02",
    title: "The Silicon Valley Pitch Deck",
    description: "Defend your application's metrics, scalability, and AI integrations to venture capitalists.",
    category: "Professional",
    targetIndustry: "tech",
    xpReward: 1500,
    totalLessons: 3,
    lessonsCompleted: 0,
    isLocked: false,
    themeColor: "pink",
    lessons: [
      {
        id: "biz_lesson_1",
        title: "The Seed Round Q&A",
        type: "visual_novel_rpg",
        scenarios: [
          {
            id: "scen_vc_pitch",
            title: "Pitching Bobby at Austin Ventures",
            difficulty: "Advanced",
            backgroundImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
            initialCharacter: {
              name: "Bobby (Texas VC Lead)",
              avatarBase: "bobby",
              initialEmotion: "idle"
            },
            requiredGoals: [
              "Present application acquisition hooks clearly",
              "Defend cloud infrastructure spend projections",
              "Handle aggressive pushback on market competitors"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "conv_travel_03",
    title: "Immersive Survival English",
    description: "High-pressure real-world simulations for airport customs, diner ordering, and transit emergencies.",
    category: "Conversational",
    xpReward: 800,
    totalLessons: 5,
    lessonsCompleted: 5,
    isLocked: false,
    themeColor: "amber",
    lessons: [
      {
        id: "conv_lesson_1",
        title: "JFK Border Controls",
        type: "visual_novel_rpg",
        scenarios: [
          {
            id: "scen_jfk_customs",
            title: "Passing Officer Davis at Border Security",
            difficulty: "Intermediate",
            backgroundImage: "https://images.unsplash.com/photo-1544016768-982d1554f0b9",
            initialCharacter: {
              name: "Officer Davis (JFK Security)",
              avatarBase: "davis",
              initialEmotion: "impatient"
            },
            requiredGoals: [
              "State your professional consulting duration accurately",
              "Declare visa status parameters cleanly",
              "Maintain calm delivery under active timer pressure"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "corp_legal_04",
    title: "Enterprise Trust & Legal Frameworks",
    description: "B2B specific scenarios reviewing client compliance data, protocols, and national SEO strategies.",
    category: "Professional",
    targetIndustry: "legal",
    xpReward: 2000,
    totalLessons: 6,
    lessonsCompleted: 0,
    isLocked: true, // Premium/Corporate Gated
    themeColor: "purple",
    lessons: []
  }
];

export default function CoursesPage() {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<GamifiedCourse | null>(null);
  
  // Simulated user global details
  const userProfile = {
    xp: 3450,
    streak: 12,
    level: 4,
    organizationId: "mercor_corp_2026" // Simulating active corporate tenant link
  };

  // Explicit dynamic Tailwind color theme mapping matrix
  const themeMatrix = {
    'cyber-blue': {
      bgGlow: 'hover:shadow-[0_0_25px_rgba(56,189,248,0.25)]',
      border: 'border-sky-500/30 hover:border-sky-400',
      text: 'text-sky-400',
      badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      progress: 'bg-sky-500'
    },
    'amber': {
      bgGlow: 'hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]',
      border: 'border-amber-500/30 hover:border-amber-400',
      text: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      progress: 'bg-amber-500'
    },
    'purple': {
      bgGlow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
      border: 'border-purple-500/30 hover:border-purple-400',
      text: 'text-purple-400',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      progress: 'bg-purple-500'
    },
    'pink': {
      bgGlow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]',
      border: 'border-pink-500/30 hover:border-pink-400',
      text: 'text-pink-400',
      badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      progress: 'bg-pink-500'
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans selection:bg-sky-500/30 pt-24">
      
      {/* 🏛️ HEADER & GLOBAL TRACK METRICS BANNER */}
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-sky-400 bg-clip-text text-transparent">
              Trilhas de Aprendizado
            </h1>
            {userProfile.organizationId && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                <LuBriefcase size={12} /> Tech Track Verified
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm">Escolha seu cenário e domine a conversação em tempo real.</p>
        </div>

        <div className="flex items-center gap-6 self-stretch md:self-auto justify-around bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <LuTrophy className="text-amber-400" size={20} />
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Nível {userProfile.level}</p>
              <p className="text-sm font-extrabold text-slate-200">{userProfile.xp} XP</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <LuFlame className="text-orange-500 animate-pulse" size={20} />
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Ofensiva</p>
              <p className="text-sm font-extrabold text-slate-200">{userProfile.streak} Dias</p>
            </div>
          </div>
        </div>
      </header>

      {/* 🗺️ THE GAME CARD SELECTION GRID MAP */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {GAMIFIED_COURSES.map((course) => {
          const colors = themeMatrix[course.themeColor];
          const progressPercent = Math.round((course.lessonsCompleted / course.totalLessons) * 100) || 0;

          return (
            <motion.div
              key={course.id}
              onClick={() => !course.isLocked && setSelectedCourse(course)}
              whileHover={!course.isLocked ? { y: -4 } : {}}
              className={`group relative bg-slate-900/40 border ${colors.border} rounded-2xl p-6 transition-all duration-300 cursor-pointer backdrop-blur-sm select-none ${colors.bgGlow} ${course.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Top Row Status Flags */}
              <div className="flex justify-between items-center mb-4">
                <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${colors.badge}`}>
                  {course.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">+{course.xpReward} XP</span>
                  {course.isLocked ? <FaLock size={14} className="text-slate-500" /> : <FaUnlock size={14} className="text-slate-400 opacity-40" />}
                </div>
              </div>

              {/* Course Identity Details */}
              <h3 className="text-xl font-bold mb-2 group-hover:text-slate-50 text-slate-100 transition-colors">
                {course.title}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6 h-12 overflow-hidden line-clamp-3">
                {course.description}
              </p>

              {/* Progress System Elements */}
              <div className="mt-auto">
                <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-slate-400">
                  <span>Progresso</span>
                  <span>{course.lessonsCompleted}/{course.totalLessons} Lições</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/40">
                  <div 
                    className={`h-full ${colors.progress} transition-all duration-500 rounded-full`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </main>

      {/* 🎭 SLIDE-DOWN TARGET CONTENT DRAWER */}
      {selectedCourse && (
        <section className="max-w-7xl mx-auto bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800 p-8 rounded-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-100">
                <LuBookOpen className={themeMatrix[selectedCourse.themeColor].text} size={24} />
                {selectedCourse.title}
              </h2>
              <p className="text-slate-400 text-sm mt-1">Selecione uma lição prática abaixo para carregar o simulador de RPG.</p>
            </div>
            <button 
              onClick={() => setSelectedCourse(null)}
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-md border border-slate-750 transition-colors"
            >
              Fechar Painel
            </button>
          </div>

          <div className="space-y-4">
            {selectedCourse.lessons.map((lesson) => (
              <div 
                key={lesson.id}
                className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-700 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded">
                      {lesson.type === 'visual_novel_rpg' ? 'RPG Imersivo' : 'Quiz Deck'}
                    </span>
                    <h4 className="text-md font-bold text-slate-200">{lesson.title}</h4>
                  </div>

                  {/* Render Character Preview chips and goal list strings natively */}
                  {lesson.scenarios?.map((scen) => (
                    <div key={scen.id} className="mt-3 bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-5 h-5 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase">
                          {scen.initialCharacter.avatarBase[0]}
                        </div>
                        <span className="text-xs text-slate-300 font-medium">Interação: <strong className="text-slate-100">{scen.initialCharacter.name}</strong></span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                          {scen.difficulty}
                        </span>
                      </div>

                      <ul className="space-y-1.5">
                        {scen.requiredGoals.map((goal, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                            <FaCheckCircle size={13} className="text-slate-600 shrink-0" />
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/ai-coach?lesson=${lesson.id}`)}
                  className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-3 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(14,165,233,0.3)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.4)] transition-all"
                >
                  <LuPlay size={16} fill="currentColor" /> Iniciar Simulação
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
