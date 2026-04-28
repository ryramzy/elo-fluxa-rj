/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courses } from '../data/courses';
import { useAuth } from '../../hooks/useAuth';
import { useEnrollments } from '../hooks/useEnrollments';

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollments } = useEnrollments(user?.uid || '');
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  // Filter courses by audience
  const filteredCourses = courses.filter(course => {
    if (selectedFilter === 'Todos') return true;
    if (selectedFilter === 'Profissional') return course.audience === 'Profissionais';
    if (selectedFilter === 'Cultura') return course.audience === 'Amantes de cultura';
    if (selectedFilter === 'Acadêmico') return course.audience === 'Estudantes';
    return true;
  });

  const handleEnrollClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const getProgressPercentage = (courseId: string) => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    if (!enrollment || !enrollment.progress) return 0;
    return Math.round((enrollment.progress.completedLessons / enrollment.progress.totalLessons) * 100);
  };

  const getButtonText = (courseId: string) => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    const progress = getProgressPercentage(courseId);
    
    if (!enrollment) return 'Ver curso';
    if (progress === 100) return 'Revisar';
    return 'Continuar';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-900 font-sans text-[#1A1A1A] dark:text-slate-100 pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Todos os Cursos
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Escolha seu caminho e comece a falar inglês americano de verdade
          </p>
          
          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {['Todos', 'Profissional', 'Cultura', 'Acadêmico'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const progress = getProgressPercentage(course.id);
            const isEnrolled = enrollments.some(e => e.courseId === course.id);
            
            return (
              <div
                key={course.id}
                className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                onClick={() => handleEnrollClick(course.id)}
              >
                {/* Photo Banner with Colored Overlay */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', course.imageUrl, e);
                      e.target.style.display = 'none';
                    }}
                  />
                  <div 
                    className="absolute inset-0"
                    style={{ backgroundColor: course.accentColor + '40' }}
                  />
                  {/* Emoji */}
                  <div className="absolute bottom-4 left-4 text-4xl">
                    {course.emoji}
                  </div>
                  {/* Tag Badge */}
                  <div className="absolute top-4 right-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: course.accentColor }}
                    >
                      {course.tag}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-lg">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">
                      {course.audience}
                    </span>
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: course.accentColor }}
                    >
                      +{course.totalXpReward} XP
                    </span>
                  </div>

                  {/* Lesson Count */}
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {course.lessons.length} aulas · Professor nativo
                  </div>

                  {/* Progress Bar (if enrolled) */}
                  {isEnrolled && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
                        <span>Progresso</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: course.accentColor 
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    className="w-full py-3 rounded-lg font-medium transition-colors text-white"
                    style={{ backgroundColor: course.accentColor }}
                    onMouseEnter={(e) => {
                      if (!isEnrolled) {
                        e.currentTarget.style.backgroundColor = course.accentColor + 'DD';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isEnrolled) {
                        e.currentTarget.style.backgroundColor = course.accentColor;
                      }
                    }}
                  >
                    {getButtonText(course.id)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Courses;
