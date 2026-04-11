import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { courses, Course, Lesson } from '../data/courses';
import { lessonContent } from '../data/lessonContent';
import { awardXP } from '../lib/xpSystem';
import LessonPaywall from '../components/LessonPaywall';
import SubscriptionModal from '../components/SubscriptionModal';

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [quizState, setQuizState] = useState<{
    answers: Record<number, string>;
    showResults: boolean;
    score: number;
  }>({
    answers: {},
    showResults: false,
    score: 0
  });

  const course = courses.find(c => c.id === courseId);
  const lessonIndex = course?.lessons.findIndex(l => l.id === lessonId);
  const lesson = lessonIndex !== undefined ? course?.lessons[lessonIndex] : undefined;
  const isLastLesson = lessonIndex === course?.lessons.length! - 1;

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Lesson not found</h1>
          <button 
            onClick={() => navigate(`/courses/${courseId}`)}
            className="text-blue-600 hover:text-blue-700 underline"
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
      
      // Show XP toast (would integrate with global toast system)
      console.log(`+${lesson.xpReward} XP earned!`);
      
      // If last lesson, show celebration
      if (isLastLesson) {
        setShowConfetti(true);
      }
      
      // Navigate to next lesson after delay
      setTimeout(() => {
        if (isLastLesson) {
          navigate(`/courses/${courseId}`);
        } else {
          const nextLesson = course.lessons[lessonIndex + 1];
          navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
        }
      }, 2000);
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answer: string) => {
    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionIndex]: answer }
    }));
  };

  const submitQuiz = () => {
    // Mock quiz scoring (2 out of 3 questions correct)
    const score = 2;
    setQuizState(prev => ({
      ...prev,
      showResults: true,
      score
    }));
  };

  const resetQuiz = () => {
    setQuizState({
      answers: {},
      showResults: false,
      score: 0
    });
  };

  const renderReadingContent = () => {
    const content = lessonContent[courseId]?.[lessonId];
    
    if (!content) {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{lesson.title}</h1>
              <p className="text-slate-600">Content not available yet.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Estimated read time: {lesson.duration}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">{lesson.title}</h1>
            <p className="text-slate-600 mb-6">{lesson.description}</p>
          </div>

          {/* Hook */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <p className="text-blue-900 font-medium">{content.hook}</p>
          </div>

          <div className="prose prose-slate max-w-none">
            {/* Sections */}
            {content.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{section.title}</h2>
                <p className="text-slate-700 leading-relaxed">{section.content}</p>
              </div>
            ))}

            {/* Vocabulary Box */}
            <div className="bg-amber-50 rounded-lg p-6 my-8">
              <h3 className="text-xl font-semibold text-amber-900 mb-4">Essential Vocabulary</h3>
              <div className="space-y-4">
                {content.vocabularyBox.map((vocab, index) => (
                  <div key={index} className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-amber-800">{vocab.term}</h4>
                    <p className="text-amber-700 text-sm mb-1">{vocab.definition}</p>
                    <p className="text-amber-600 text-xs italic">When to use: {vocab.whenToUse}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural Note */}
            {content.culturalNote && (
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 my-8">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Cultural Note</h3>
                <p className="text-purple-800">{content.culturalNote}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderVideoContent = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{lesson.title}</h1>
          <p className="text-slate-600">{lesson.description}</p>
        </div>

        {/* Video Placeholder */}
        <div 
          className="relative aspect-video rounded-lg overflow-hidden mb-8 flex items-center justify-center"
          style={{ backgroundColor: course.color }}
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-2"></div>
            </div>
            <p className="text-white text-lg font-medium">Vídeo em breve</p>
            <p className="text-white/80 text-sm mt-2">Disponível após lançamento oficial</p>
          </div>
        </div>

        {/* Transcript Placeholder */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Transcript</h3>
          <div className="bg-slate-50 rounded-lg p-6 space-y-4">
            <p className="text-slate-700 leading-relaxed">
              Welcome to this lesson on professional elevator pitches. Today, we're going to learn how to 
              introduce yourself effectively in 60 seconds or less. This skill is crucial for networking events, 
              job interviews, and business meetings.
            </p>
            <p className="text-slate-700 leading-relaxed">
              An elevator pitch is a brief, persuasive speech that you use to spark interest in what your 
              organization does. It should be compelling, memorable, and concise. The name comes from the 
              idea that you should be able to deliver your pitch in the time it takes to ride an elevator.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Let's break down the structure of a great elevator pitch. First, you need a strong opening that 
              grabs attention. Then, clearly state what you do or what your company does. Finally, end with 
              a call to action or a memorable closing statement.
            </p>
          </div>
        </div>

        {/* Key Phrases */}
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Key Phrases from This Lesson</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-900 font-medium">"Let me introduce myself..."</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-900 font-medium">"I specialize in..."</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-900 font-medium">"What I do is..."</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-900 font-medium">"I'd love to connect..."</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-900 font-medium">"My expertise lies in..."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuizContent = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{lesson.title}</h1>
          <p className="text-slate-600">{lesson.description}</p>
        </div>

        {!quizState.showResults ? (
          <div className="space-y-8">
            {/* Question 1 */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                1. What is the most appropriate greeting in a formal business meeting?
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'a', text: 'Hey, what\'s up?' },
                  { id: 'b', text: 'Nice to meet you, I\'m [Name].' },
                  { id: 'c', text: 'Yo, how\'s it going?' },
                  { id: 'd', text: 'Sup everyone?' }
                ].map(option => (
                  <label key={option.id} className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="q1"
                      value={option.id}
                      checked={quizState.answers[0] === option.id}
                      onChange={() => handleQuizAnswer(0, option.id)}
                      className="mr-3"
                    />
                    <span className="text-slate-700">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                2. How long should an elevator pitch be?
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'a', text: '30 seconds or less' },
                  { id: 'b', text: '60 seconds or less' },
                  { id: 'c', text: '2-3 minutes' },
                  { id: 'd', text: '5 minutes' }
                ].map(option => (
                  <label key={option.id} className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="q2"
                      value={option.id}
                      checked={quizState.answers[1] === option.id}
                      onChange={() => handleQuizAnswer(1, option.id)}
                      className="mr-3"
                    />
                    <span className="text-slate-700">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 3 */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                3. What is the most important element of a professional greeting?
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'a', text: 'Being overly casual' },
                  { id: 'b', text: 'Direct eye contact and confidence' },
                  { id: 'c', text: 'Speaking very quickly' },
                  { id: 'd', text: 'Using complex vocabulary' }
                ].map(option => (
                  <label key={option.id} className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="q3"
                      value={option.id}
                      checked={quizState.answers[2] === option.id}
                      onChange={() => handleQuizAnswer(2, option.id)}
                      className="mr-3"
                    />
                    <span className="text-slate-700">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={submitQuiz}
              disabled={Object.keys(quizState.answers).length < 3}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Submit Quiz
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">??</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              You got {quizState.score} out of 3 correct!
            </h2>
            <p className="text-slate-600 mb-6">+15 XP earned!</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetQuiz}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleCompleteLesson}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Next Lesson
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderConversationContent = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{lesson.title}</h1>
          <p className="text-slate-600">{lesson.description}</p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">What We'll Practice</h3>
          <p className="text-slate-700 mb-6">
            In this conversation practice session, you'll engage in realistic dialogue scenarios that 
            simulate actual professional interactions. Matt will guide you through common situations and 
            provide real-time feedback on your pronunciation, vocabulary, and cultural appropriateness.
          </p>
          
          <div className="bg-teal-50 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-teal-900 mb-3">Session Structure:</h4>
            <ol className="space-y-2 text-teal-800">
              <li>1. Warm-up conversation (5 minutes)</li>
              <li>2. Target scenario practice (15 minutes)</li>
              <li>3. Feedback and correction (5 minutes)</li>
              <li>4. Review and next steps (5 minutes)</li>
            </ol>
          </div>
        </div>

        {/* Dialogue Example */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Sample Dialogue</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                M
              </div>
              <div className="flex-1 bg-blue-50 rounded-lg p-4">
                <p className="text-blue-900 font-medium mb-1">Matt</p>
                <p className="text-blue-800">Hi there! Welcome to your English practice session. How are you feeling today?</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                Y
              </div>
              <div className="flex-1 bg-teal-50 rounded-lg p-4">
                <p className="text-teal-900 font-medium mb-1">You</p>
                <p className="text-teal-800">Hello! I'm excited to practice. I want to improve my business English.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                M
              </div>
              <div className="flex-1 bg-blue-50 rounded-lg p-4">
                <p className="text-blue-900 font-medium mb-1">Matt</p>
                <p className="text-blue-800">That's great! Let's start with a professional introduction. Imagine you're at a networking event...</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
          <p className="text-amber-900 font-medium">
            <strong>Note:</strong> This lesson includes a live session with Matt. You'll receive personalized feedback 
            and real-time practice opportunities.
          </p>
        </div>

        <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition-colors">
          Book Conversation Session
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <p className="text-sm text-slate-600">{course.title}</p>
              <h1 className="text-lg font-semibold text-slate-900">{lesson.title}</h1>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Lesson {lessonIndex! + 1} of {course.lessons.length}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {lesson.type === 'reading' && renderReadingContent()}
        {lesson.type === 'video' && renderVideoContent()}
        {lesson.type === 'quiz' && renderQuizContent()}
        {lesson.type === 'conversation' && renderConversationContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                if (lessonIndex! > 0) {
                  const prevLesson = course.lessons[lessonIndex! - 1];
                  navigate(`/courses/${courseId}/lessons/${prevLesson.id}`);
                }
              }}
              disabled={lessonIndex === 0}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 rounded-lg transition-colors"
            >
              Previous Lesson
            </button>

            <button
              onClick={handleCompleteLesson}
              disabled={isCompleted}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg transition-colors"
            >
              {isCompleted ? 'Completed ??' : 'Mark as Complete'}
            </button>
          </div>

          {/* Show LessonPaywall for free lessons, or Next Lesson button for paid lessons */}
          {isCompleted && lesson.free && lessonIndex! < course.lessons.length - 1 && (
            <LessonPaywall
              courseId={courseId}
              lessonTitle={lesson.title}
              onPlanSelect={() => setSubscriptionModalOpen(true)}
            />
          )}

          {/* Regular Next Lesson button for paid lessons or when not completed */}
          {((!lesson.free && isCompleted) || (!isCompleted && lessonIndex! < course.lessons.length - 1)) && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  const nextLesson = course.lessons[lessonIndex! + 1];
                  navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Next Lesson
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)]
              }}
            >
              <div className="w-3 h-3 rounded-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onPlanSelect={(plan: string) => {
          // Handle plan selection - would integrate with payment system
          console.log('Selected plan:', plan);
          setSubscriptionModalOpen(false);
        }}
      />

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        .animate-fall {
          animation: fall 3s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default LessonPage;
