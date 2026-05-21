import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SlideCompletionStateProps {
  xpReward: number;
  onNextLesson?: () => void;
  onBookLesson: () => void;
  hasNextLesson: boolean;
}

export const SlideCompletionState: React.FC<SlideCompletionStateProps> = ({ 
  xpReward, 
  onNextLesson, 
  onBookLesson,
  hasNextLesson
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-fade-in-up">
      <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 mb-4">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div>
        <h2 className="text-4xl font-bold text-white mb-2">Excellent!</h2>
        <p className="text-xl text-blue-200">You earned +{xpReward} XP</p>
      </div>

      <div className="w-full max-w-sm space-y-4 mt-8 z-50 relative pointer-events-auto">
        <button 
          onClick={(e) => {
             e.stopPropagation();
             onBookLesson();
          }}
          className="w-full py-4 bg-white text-blue-600 font-bold uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors shadow-xl"
        >
          Book a Session to Practice
        </button>

        {hasNextLesson && onNextLesson && (
          <button 
            onClick={(e) => {
               e.stopPropagation();
               onNextLesson();
            }}
            className="w-full py-4 bg-blue-800 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors"
          >
            Continue to Next Lesson
          </button>
        )}
      </div>
    </div>
  );
};
