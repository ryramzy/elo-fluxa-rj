/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { courses } from '../data/courses';
import { useAuth } from '../hooks/useAuth';
import { useEnrollments } from '../hooks/useEnrollments';

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollments } = useEnrollments(user?.uid || '');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);

  const filteredCourses = courses.filter(course => {
    const audience = course.audience || (course.tag === 'Business' ? 'Profissionais' : 'Amantes de cultura');
    if (selectedFilter === 'Todos') return true;
    if (selectedFilter === 'Profissional') return audience === 'Profissionais';
    if (selectedFilter === 'Cultura') return audience === 'Amantes de cultura';
    if (selectedFilter === 'Acadêmico') return audience === 'Estudantes';
    return true;
  });

  const enrolledCourses = filteredCourses.filter(course => enrollments.some(e => e.courseId === course.id));
  const availableCourses = filteredCourses.filter(course => !enrollments.some(e => e.courseId === course.id));

  const handleEnrollClick = (courseId: string) => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    
    if (enrollment) {
      let nextLessonId = enrollment.activeLessonId;
      if (!nextLessonId) {
        const course = courses.find(c => c.id === courseId);
        const completed = Array.isArray(enrollment.completedLessons) ? enrollment.completedLessons : [];
        const firstUncompleted = course?.lessons.find(l => !completed.includes(l.id));
        nextLessonId = firstUncompleted?.id || course?.lessons?.[0]?.id;
      }
      
      if (nextLessonId) {
        navigate(`/courses/${courseId}/lessons/${nextLessonId}`);
        return;
      }
    }
    
    navigate(`/courses/${courseId}`);
  };

  const getProgressPercentage = (courseId: string) => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    if (!enrollment) return 0;
    return typeof enrollment.progress === 'number' ? enrollment.progress : 0;
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

        {/* Enrolled Courses Section */}
        {enrolledCourses.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Meus Cursos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrolledCourses.map((course, index) => {
                const progress = getProgressPercentage(course.id);
                const isHovered = hoveredCourse === course.id;
                
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border transition-all cursor-pointer shadow-md ${
                      isHovered ? 'shadow-xl border-blue-200' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    onMouseEnter={() => setHoveredCourse(course.id)}
                    onMouseLeave={() => setHoveredCourse(null)}
                    onClick={() => handleEnrollClick(course.id)}
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0" style={{ backgroundColor: (course.accentColor || '#3B82F6') + '40' }} />
                      <div className="absolute bottom-4 left-4 text-4xl">{course.emoji}</div>
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: course.accentColor || '#3B82F6' }}>
                          {course.tag}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-lg">{course.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">{course.audience || 'Todos os níveis'}</span>
                        <span className="text-sm font-semibold" style={{ color: course.accentColor || '#3B82F6' }}>+{course.totalXpReward || course.lessons.reduce((acc, l) => acc + l.xpReward, 0)} XP</span>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
                          <span>Progresso</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: course.accentColor || '#3B82F6' }} />
                        </div>
                      </div>

                      <button
                        className="w-full py-3 rounded-lg font-medium transition-colors text-white"
                        style={{ backgroundColor: course.accentColor || '#3B82F6' }}
                      >
                        {getButtonText(course.id)}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Courses Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Catálogo de Cursos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableCourses.map((course, index) => {
              const isHovered = hoveredCourse === course.id;
              
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border transition-all cursor-pointer shadow-md ${
                    isHovered ? 'shadow-xl border-blue-200' : 'border-slate-200 dark:border-slate-700'
                  }`}
                  onMouseEnter={() => setHoveredCourse(course.id)}
                  onMouseLeave={() => setHoveredCourse(null)}
                  onClick={() => handleEnrollClick(course.id)}
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{ backgroundColor: (course.accentColor || '#3B82F6') + '40' }} />
                    <div className="absolute bottom-4 left-4 text-4xl">{course.emoji}</div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: course.accentColor || '#3B82F6' }}>
                        {course.tag}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-lg">{course.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">{course.audience || 'Todos os níveis'}</span>
                      <span className="text-sm font-semibold" style={{ color: course.accentColor || '#3B82F6' }}>+{course.totalXpReward || course.lessons.reduce((acc, l) => acc + l.xpReward, 0)} XP</span>
                    </div>

                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      {course.lessons.length} aulas · Professor nativo
                    </div>

                    <button
                      className="w-full py-3 rounded-lg font-medium transition-colors text-white"
                      style={{ backgroundColor: course.accentColor || '#3B82F6' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = (course.accentColor || '#3B82F6') + 'DD'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = course.accentColor || '#3B82F6'}
                    >
                      {getButtonText(course.id)}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
