import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEnrollments } from '../hooks/useEnrollments';
import { useUserProfile } from '../hooks/useUserProfile';
import { courses } from '../data/courses';
import { lessonContent } from '../data/lessonContent';
import { awardXP } from '../lib/xpSystem';
import { updateLessonProgress } from '../lib/firestore';
import { SlideViewer } from '../components/course/SlideViewer';
import { SlideCompletionState } from '../components/course/SlideCompletionState';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sounds } from '../utils/sounds';
import { VoicePractice } from '../components/course/VoicePractice';
import { trackEvent } from '../utils/analytics';

// Interactive Multiple Choice Quiz Component
interface QuizSlideContentProps {
  slideId: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  onCorrectAnswer?: () => void;
}

const QuizSlideContent: React.FC<QuizSlideContentProps> = ({
  slideId,
  questionText,
  options,
  correctAnswerIndex,
  onCorrectAnswer
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset quiz state when slide ID changes
  useEffect(() => {
    setSelectedIdx(null);
    setSubmitted(false);
  }, [slideId]);

  const handleSelectOption = (idx: number) => {
    if (submitted) return;
    setSelectedIdx(idx);
  };

  const handleSubmit = () => {
    if (selectedIdx === null || submitted) return;
    setSubmitted(true);
    if (selectedIdx === correctAnswerIndex) {
      sounds.playSuccess();
      onCorrectAnswer?.();
    } else {
      sounds.playError();
    }
  };

  return (
    <div className="flex flex-col space-y-5 w-full">
      <p className="text-slate-100 text-base md:text-lg font-bold leading-relaxed">
        {questionText}
      </p>
      
      <div className="grid grid-cols-1 gap-3">
        {options.map((option, idx) => {
          let buttonStyle = "bg-slate-950/45 border-white/5 hover:border-white/15 hover:bg-slate-900/60 text-slate-200";
          
          if (selectedIdx === idx) {
            buttonStyle = "bg-blue-600/15 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(37,99,235,0.15)]";
          }
          
          if (submitted) {
            if (idx === correctAnswerIndex) {
              buttonStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
            } else if (selectedIdx === idx) {
              buttonStyle = "bg-rose-500/20 border-rose-500 text-rose-350 shadow-[0_0_15px_rgba(244,63,94,0.2)]";
            } else {
              buttonStyle = "bg-slate-950/20 border-white/5 text-slate-500 opacity-50 pointer-events-none";
            }
          }
          
          return (
            <button
              key={idx}
              disabled={submitted}
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between text-xs md:text-sm font-semibold active:scale-[0.99] ${buttonStyle}`}
            >
              <span>{option}</span>
              {submitted && idx === correctAnswerIndex && (
                <span className="text-emerald-450 text-sm">✅</span>
              )}
              {submitted && selectedIdx === idx && idx !== correctAnswerIndex && (
                <span className="text-rose-400 text-sm">❌</span>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedIdx !== null && !submitted && (
        <button
          onClick={handleSubmit}
          className="mt-4 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-98 text-xs md:text-sm uppercase tracking-wider"
        >
          Confirmar Resposta
        </button>
      )}
      
      {submitted && (
        <div className={`p-4 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300 text-xs font-semibold flex items-center gap-2 ${
          selectedIdx === correctAnswerIndex 
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/25 text-rose-350'
        }`}>
          <span>
            {selectedIdx === correctAnswerIndex 
              ? '✨ Excelente! Resposta certa. +10 XP obtido!' 
              : '❌ Ops, opção incorreta! Leia a dica do tutor e prossiga para revisar.'}
          </span>
        </div>
      )}
    </div>
  );
};

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollments } = useEnrollments(user?.uid || '');
  const { profile } = useUserProfile(user?.uid || '');
  
  const course = courses.find(c => c.id === courseId);
  const lessonIndex = course?.lessons.findIndex(l => l.id === lessonId);
  const lesson = lessonIndex !== undefined ? course?.lessons[lessonIndex] : undefined;
  const isLastLesson = lessonIndex === course?.lessons.length! - 1;

  const enrollment = enrollments.find(e => e.courseId === courseId);
  const initialSlide = enrollment?.activeLessonId === lessonId ? (enrollment?.activeSlideIndex || 0) : 0;

  const [isCompleted, setIsCompleted] = useState(false);
  const saveProgressTimeoutRef = useRef<any>(null);
  const latestIndexRef = useRef(initialSlide);

  useEffect(() => {
    if (courseId && lessonId) {
      trackEvent('lesson_start', { courseId, lessonId });
    }
  }, [courseId, lessonId]);

  const content = lessonContent[courseId!]?.[lessonId!];

  if (!course || !lesson || !content || !content.slides || content.slides.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-4">
        <div className="max-w-md w-full bg-slate-800/80 border border-red-500/30 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">Conteúdo não disponível</h1>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Desculpe! O conteúdo para esta lição ("{lesson?.title || 'Aula'}") ainda não foi configurado ou não pôde ser carregado.
          </p>
          <button 
            onClick={() => navigate(`/courses/${courseId}`)}
            className="w-full py-3 bg-red-600/20 hover:bg-red-600/35 border border-red-500/50 hover:border-red-400/80 text-red-200 rounded-xl transition-all duration-300 font-medium active:scale-98 shadow-lg shadow-red-950/40"
          >
            Voltar para o Curso
          </button>
        </div>
      </div>
    );
  }

  // Keep track of initial slide and update ref
  useEffect(() => {
    latestIndexRef.current = initialSlide;
  }, [initialSlide]);

  const handleSlideChange = (index: number) => {
    if (!user?.uid || !courseId || !lessonId) return;
    
    latestIndexRef.current = index;
    trackEvent('slide_view', { courseId, lessonId, slideIndex: index });

    if (saveProgressTimeoutRef.current) {
      clearTimeout(saveProgressTimeoutRef.current);
    }

    // Debounce slide progress update by 2.5 seconds to minimize Firestore write costs
    saveProgressTimeoutRef.current = setTimeout(async () => {
      try {
        await updateLessonProgress(user.uid, courseId, lessonId, latestIndexRef.current, false);
        saveProgressTimeoutRef.current = null;
      } catch (error) {
        console.error('Error saving slide progress:', error);
      }
    }, 2500);
  };

  // On unmount, flush any pending progress save immediately to avoid losing state
  useEffect(() => {
    return () => {
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current);
        const finalIndex = latestIndexRef.current;
        if (user?.uid && courseId && lessonId && user.uid !== 'guest_user') {
          updateLessonProgress(user.uid, courseId, lessonId, finalIndex, false)
            .catch(err => console.error('Error flushing slide progress on unmount:', err));
        }
      }
    };
  }, [user?.uid, courseId, lessonId]);

  const handleCompleteLesson = async () => {
    if (!user?.uid || !courseId || !lessonId) return;
    try {
      trackEvent('lesson_complete', { courseId, lessonId });
      await updateLessonProgress(user.uid, courseId, lessonId, initialSlide, true);
      await awardXP(user.uid, lesson.xpReward, `lesson completed: ${lesson.title}`);
      setIsCompleted(true);
      
      // Play lesson complete sound
      sounds.playLessonComplete();
      
      // Trigger Confetti!
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
      
      console.log(`+${lesson.xpReward} XP earned!`);
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const handleNextLesson = () => {
    if (isLastLesson) {
      navigate(`/courses/${courseId}`);
    } else {
      const nextLesson = course.lessons[lessonIndex! + 1];
      navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
    }
  };

  const generateSlides = () => {
    const slides = [];
    const content = lessonContent[courseId!]?.[lessonId!];

    if (content && content.slides) {
      content.slides.forEach((slide: string, idx: number) => {
        const parts = slide.split('|||');
        const type = parts[0] || '';
        const heading = parts[1] || '';
        const body = parts[2] || '';
        const eloPrompt = parts[3] || '';
        const targetPhrase = parts[4] || '';

        let typeLabel = '';
        if (type === 'VOCAB') typeLabel = 'Vocabulário Útil 🏷️';
        else if (type === 'CONCEPT') typeLabel = 'Conceito Gramatical 💡';
        else if (type === 'EXAMPLE') typeLabel = 'Exemplo de Conversa 💬';
        else if (type === 'CULTURE') typeLabel = 'Nota de Cultura Americana 🇺🇸';
        else if (type === 'DRILL') typeLabel = 'Treino de Fala 🗣️';
        else if (type === 'ROLEPLAY') typeLabel = 'Cenário de Roleplay 🎭';
        else if (type === 'REVIEW') typeLabel = 'Revisão da Aula ✅';
        else if (type === 'QUIZ') typeLabel = 'Quiz Interativo ⚡';

        // Set up premium styled border glow wrappers
        let borderGlowClass = "border-white/10 bg-slate-900/40";
        if (type === 'VOCAB') {
          borderGlowClass = "border-amber-500/25 bg-gradient-to-br from-amber-950/10 via-slate-900/40 to-slate-900/50 shadow-[0_0_20px_rgba(245,158,11,0.03)]";
        } else if (type === 'CONCEPT') {
          borderGlowClass = "border-blue-500/25 bg-gradient-to-br from-blue-950/10 via-slate-900/40 to-slate-900/50 shadow-[0_0_20px_rgba(59,130,246,0.03)]";
        } else if (type === 'CULTURE') {
          borderGlowClass = "border-purple-500/25 bg-gradient-to-br from-purple-950/10 via-slate-900/40 to-slate-900/50 shadow-[0_0_20px_rgba(168,85,247,0.03)]";
        } else if (type === 'DRILL' || type === 'ROLEPLAY') {
          borderGlowClass = "border-pink-500/25 bg-gradient-to-br from-pink-950/10 via-slate-900/40 to-slate-900/50 shadow-[0_0_20px_rgba(236,72,153,0.03)]";
        } else if (type === 'QUIZ') {
          borderGlowClass = "border-indigo-500/25 bg-gradient-to-br from-indigo-950/10 via-slate-900/40 to-slate-900/50 shadow-[0_0_20px_rgba(99,102,241,0.03)]";
        }

        const isQuiz = type === 'QUIZ';
        let slideBody = null;

        if (isQuiz) {
          const quizParts = body.split('[OPTIONS]');
          const questionText = quizParts[0].trim();
          let quizOptions: string[] = [];
          let correctAnswerIndex = -1;
          
          if (quizParts[1]) {
            const optionsAndCorrect = quizParts[1].split('[CORRECT]');
            quizOptions = optionsAndCorrect[0]
              .split('\n')
              .map(o => o.trim())
              .filter(o => o !== '');
            if (optionsAndCorrect[1]) {
              correctAnswerIndex = parseInt(optionsAndCorrect[1].trim(), 10) - 1;
            }
          }

          slideBody = (
            <QuizSlideContent
              slideId={`slide-${idx}`}
              questionText={questionText}
              options={quizOptions}
              correctAnswerIndex={correctAnswerIndex}
              onCorrectAnswer={() => {
                if (user?.uid) {
                  awardXP(user.uid, 10, 'quiz_correct');
                  // Trigger floating +XP in the gamification HUD
                  (window as any).__eloAddSessionXp?.(10);
                }
              }}
            />
          );
        } else {
          slideBody = body && (
            <div className="text-slate-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {body}
              </ReactMarkdown>
            </div>
          );
        }

        slides.push({
          id: `slide-${idx}`,
          title: heading,
          spokenText: isQuiz ? '' : body,
          type: type,
          content: (
            <div className={`p-4 md:p-8 rounded-2xl md:rounded-3xl border backdrop-blur-md transition-all ${borderGlowClass} flex flex-col h-full space-y-4`}>
              {typeLabel && (
                <span className={`text-[10px] font-extrabold tracking-widest uppercase ${
                  type === 'VOCAB' ? 'text-amber-400' :
                  type === 'CONCEPT' ? 'text-blue-400' :
                  type === 'CULTURE' ? 'text-purple-400' :
                  type === 'DRILL' || type === 'ROLEPLAY' ? 'text-pink-400' :
                  'text-indigo-400'
                }`}>
                  {typeLabel}
                </span>
              )}
              
              {slideBody}
              
              {eloPrompt && (type === 'DRILL' || type === 'ROLEPLAY') ? (
                <div className="mt-4">
                  <VoicePractice 
                    eloPrompt={eloPrompt}
                    targetPhrase={targetPhrase}
                    accuracyThreshold={courseId?.includes('advanced') ? 90 : 80}
                  />
                </div>
              ) : eloPrompt ? (
                <div className="mt-6 bg-blue-950/40 border border-blue-500/20 rounded-2xl p-4 relative shadow-[0_4px_12px_rgba(59,130,246,0.05)]">
                  <div className="absolute -top-3 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>✨</span> Elo
                  </div>
                  <p className="text-blue-100 italic text-sm md:text-base pt-1">
                    "{eloPrompt}"
                  </p>
                </div>
              ) : null}
            </div>
          )
        });
      });
    } else {
      slides.push({
        id: 'intro',
        title: lesson.title,
        content: <p className="text-slate-200">Content loading...</p>
      });
    }

    // Final Completion Slide
    slides.push({
      id: 'completion',
      content: (
        <SlideCompletionState 
          xpReward={lesson.xpReward}
          onNextLesson={handleNextLesson}
          onBookLesson={() => navigate('/dashboard', { state: { tab: 'booking' } })}
          hasNextLesson={!isLastLesson}
        />
      )
    });

    return slides;
  };

  return (
    <SlideViewer 
      slides={generateSlides()} 
      initialSlide={initialSlide}
      onSlideChange={handleSlideChange}
      onComplete={handleCompleteLesson}
      onClose={() => navigate(`/courses/${courseId}`)}
      userXp={profile?.xp || 0}
      userStreak={profile?.streakDays || 0}
      userLevel={profile?.level || 1}
    />
  );
};

export default LessonPage;
