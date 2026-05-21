import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { courses } from '../data/courses';
import { lessonContent } from '../data/lessonContent';
import { awardXP } from '../lib/xpSystem';
import { SlideViewer } from '../components/course/SlideViewer';
import { SlideCompletionState } from '../components/course/SlideCompletionState';

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isCompleted, setIsCompleted] = useState(false);

  const course = courses.find(c => c.id === courseId);
  const lessonIndex = course?.lessons.findIndex(l => l.id === lessonId);
  const lesson = lessonIndex !== undefined ? course?.lessons[lessonIndex] : undefined;
  const isLastLesson = lessonIndex === course?.lessons.length! - 1;

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <button 
            onClick={() => navigate(`/courses/${courseId}`)}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Back to course
          </button>
        </div>
      </div>
    );
  }

  const handleCompleteLesson = async () => {
    if (!user?.uid) return;
    try {
      await awardXP(user.uid, lesson.xpReward, `lesson completed: ${lesson.title}`);
      setIsCompleted(true);
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
          content: (
            <div className="flex flex-col h-full space-y-6">
              {typeLabel && (
                <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                  {typeLabel}
                </span>
              )}
              {body && (
                <div className="text-slate-100 text-lg md:text-xl leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto">
                  {body}
                </div>
              )}
              {eloPrompt && (
                <div className="mt-8 bg-blue-900/40 border border-blue-500/30 rounded-2xl p-5 relative">
                  <div className="absolute -top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-blue-900/50">
                    <span className="text-base">✨</span> Elo
                  </div>
                  <p className="text-blue-100 italic text-base md:text-lg pt-2">
                    "{eloPrompt}"
                  </p>
                </div>
              )}
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
          onBookLesson={() => navigate('/agenda')}
          hasNextLesson={!isLastLesson}
        />
      )
    });

    return slides;
  };

  return (
    <SlideViewer 
      slides={generateSlides()} 
      onComplete={handleCompleteLesson}
      onClose={() => navigate(`/courses/${courseId}`)}
    />
  );
};

export default LessonPage;
