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

  // Generate slides dynamically based on lesson content
  const generateSlides = () => {
    const slides = [];
    const content = lessonContent[courseId!]?.[lessonId!];

    // Slide 1: Intro
    slides.push({
      id: 'intro',
      title: lesson.title,
      content: <p className="text-slate-200">{lesson.description}</p>
    });

    if (content && lesson.type === 'reading') {
      if (content.hook) {
        slides.push({
          id: 'hook',
          title: 'Did you know?',
          content: <p className="text-blue-100 italic">"{content.hook}"</p>
        });
      }

      content.sections.forEach((section: any, idx: number) => {
        slides.push({
          id: `section-${idx}`,
          title: section.title,
          content: <p className="text-slate-100">{section.content}</p>
        });
      });

      if (content.vocabularyBox && content.vocabularyBox.length > 0) {
        slides.push({
          id: 'vocab',
          title: 'Vocabulary',
          content: (
            <div className="space-y-4">
              {content.vocabularyBox.slice(0, 3).map((v: any, i: number) => (
                <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-left">
                  <h4 className="font-bold text-amber-400">{v.term}</h4>
                  <p className="text-sm text-slate-300">{v.definition}</p>
                </div>
              ))}
            </div>
          )
        });
      }
    } else if (lesson.type === 'video' || lesson.type === 'conversation' || lesson.type === 'quiz') {
      // Fallback for non-reading lessons until they are fully split into slides
      slides.push({
        id: 'interactive',
        title: 'Interactive Content',
        content: (
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-300 mb-4">This is a {lesson.type} session.</p>
            <p className="text-slate-400 text-sm">Follow the instructions provided by your instructor.</p>
          </div>
        )
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
