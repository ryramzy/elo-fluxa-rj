import React from 'react';
import { CourseCard } from './CourseCard';
import type { Course } from '../../data/courses';

interface CoursesGridProps {
  courses: Course[];
  enrollments: any[];
  onEnroll: (courseId: string) => void;
  onContinue: (courseId: string) => void;
}

export const CoursesGrid: React.FC<CoursesGridProps> = ({ 
  courses, 
  enrollments, 
  onEnroll, 
  onContinue 
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Seus Cursos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => {
          const enrollment = enrollments.find(e => e.courseId === course.id);
          
          return (
            <CourseCard
              key={course.id}
              course={course}
              enrollment={enrollment}
              onEnroll={onEnroll}
              onContinue={onContinue}
            />
          );
        })}
      </div>
    </div>
  );
};
