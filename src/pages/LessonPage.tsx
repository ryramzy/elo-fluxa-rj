import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEnrollments } from '../hooks/useEnrollments';
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

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollments } = useEnrollments(user?.uid || '');
  
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

        let typeLabel = '';
        if (type === 'VOCAB') typeLabel = 'Vocabulary';
        else if (type === 'CONCEPT') typeLabel = 'Concept';
        else if (type === 'EXAMPLE') typeLabel = 'Example';
        else if (type === 'CULTURE') typeLabel = 'Culture Note';
        else if (type === 'DRILL') typeLabel = 'Practice Drill';
        else if (type === 'ROLEPLAY') typeLabel = 'Roleplay Scenario';
        else if (type === 'REVIEW') typeLabel = 'Review';

        slides.push({
          id: `slide-${idx}`,
          title: heading,
          spokenText: body, // Allows the SlideViewer to read the text
          type: type,       // Pass slide type (INTRO, VOCAB, etc.) to slide viewer
          content: (
            <div className="flex flex-col h-full space-y-6">
              {typeLabel && (
                <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                  {typeLabel}
                </span>
              )}
              {body && (
                <div className="text-slate-100 text-lg md:text-xl leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto prose prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {body}
                  </ReactMarkdown>
                </div>
              )}
              {eloPrompt && (type === 'DRILL' || type === 'ROLEPLAY') ? (
                <div className="mt-4">
                  <VoicePractice eloPrompt={eloPrompt} />
                </div>
              ) : eloPrompt ? (
                <div className="mt-8 bg-blue-900/40 border border-blue-500/30 rounded-2xl p-5 relative">
                  <div className="absolute -top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-blue-900/50">
                    <span className="text-base">✨</span> Elo
                  </div>
                  <p className="text-blue-100 italic text-base md:text-lg pt-2">
                    "{eloPrompt}"
                  </p>
                </div>
              ) : null}
            </div>
          )
        });
      });
    } else {
      // Fallback
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
    />
  );
};

export default LessonPage;
