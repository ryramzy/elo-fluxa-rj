import React from 'react';
import type { Course } from '../../data/courses';

interface CourseCardProps {
  course: Course;
  enrollment: any;
  onEnroll: (courseId: string) => void;
  onContinue: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  enrollment, 
  onEnroll, 
  onContinue 
}) => {
  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.progress === 100;

  const handleCardClick = () => {
    if (isEnrolled && !isCompleted) {
      onContinue(course.id);
    }
  };

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEnroll(course.id);
  };

  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContinue(course.id);
  };

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
      onClick={handleCardClick}
    >
      {/* Course image */}
      <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-2 left-2 text-white">
          <h3 className="font-bold text-sm">{course.title}</h3>
        </div>
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {isCompleted ? (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Concluído
            </span>
          ) : isEnrolled ? (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              Em andamento
            </span>
          ) : (
            <span className="bg-slate-500 text-white text-xs px-2 py-1 rounded-full">
              Não inscrito
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        {/* Course tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {course.tags.map((tag, index) => (
            <span 
              key={index}
              className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* XP reward */}
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          +{course.xpReward || 100} XP
        </div>
        
        {/* Progress bar */}
        {isEnrolled && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
              <span>Progress</span>
              <span>{enrollment?.progress || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all"
                style={{ 
                  width: `${enrollment?.progress || 0}%`,
                  backgroundColor: course.accentColor 
                }}
              />
            </div>
          </div>
        )}
        
        {/* Context-aware CTA */}
        {isEnrolled ? (
          isCompleted ? (
            <button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded transition-colors">
              Review
            </button>
          ) : (
            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded transition-colors"
              onClick={handleContinueClick}
            >
              Continue
            </button>
          )
        ) : (
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded transition-colors"
            onClick={handleEnrollClick}
          >
            Enroll
          </button>
        )}
      </div>
    </div>
  );
};
