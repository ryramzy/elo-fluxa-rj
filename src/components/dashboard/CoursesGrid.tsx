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
  const enrolledCourses = courses.filter(course => enrollments.some(e => e.courseId === course.id));
  const availableCourses = courses.filter(course => !enrollments.some(e => e.courseId === course.id));

  return (
    <div className="space-y-12">
      {/* Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762z" />
            </svg>
            Meus Cursos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => {
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
      )}

      {/* Available Courses */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Explorar Cursos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableCourses.slice(0, 4).map((course) => { // Limit to 4 on dashboard
            return (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={undefined}
                onEnroll={onEnroll}
                onContinue={onContinue}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
