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

  // Collapsible Accordion States
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    conversation: true,
    grammar: true,
    specialty: true,
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

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

  // Course Categorization Logic
  const conversationCourses = availableCourses.filter(
    c => c.title.toLowerCase().includes('conversation') || c.id === 'basic-english-daily-life'
  );
  const grammarCourses = availableCourses.filter(
    c => c.title.toLowerCase().includes('grammar')
  );
  const specialtyCourses = availableCourses.filter(
    c => c.level === 'Specialty' && 
         !c.title.toLowerCase().includes('grammar') && 
         !c.title.toLowerCase().includes('conversation')
  );

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

  // Helper Course Card Renderer
  const renderCourseCard = (course: typeof courses[0], index: number) => {
    const isHovered = hoveredCourse === course.id;
    return (
      <motion.div
        key={course.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.05 }}
        whileHover={{ y: -6, scale: 1.015 }}
        className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border transition-all cursor-pointer shadow-md flex flex-col h-full ${
          isHovered 
            ? 'shadow-xl border-blue-400 dark:border-blue-500/50 shadow-blue-500/5' 
            : 'border-slate-200/80 dark:border-slate-700/80'
        }`}
        onMouseEnter={() => setHoveredCourse(course.id)}
        onMouseLeave={() => setHoveredCourse(null)}
        onClick={() => handleEnrollClick(course.id)}
      >
        <div className="relative h-44 overflow-hidden">
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
          <div className="absolute inset-0" style={{ backgroundColor: (course.accentColor || '#3B82F6') + '20' }} />
          <div className="absolute bottom-3 left-4 text-3xl drop-shadow-md">{course.emoji}</div>
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm" style={{ backgroundColor: course.accentColor || '#3B82F6' }}>
              {course.tag}
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 mb-1.5 text-base md:text-lg hover:text-blue-500 transition-colors line-clamp-1">
            {course.title}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 flex-1 leading-relaxed">
            {course.description}
          </p>
          
          <div className="flex items-center justify-between mb-4 border-t border-slate-100 dark:border-slate-700/50 pt-3">
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-medium">
              {course.audience || 'Todos os níveis'}
            </span>
            <span className="text-sm font-semibold" style={{ color: course.accentColor || '#3B82F6' }}>
              +{course.totalXpReward || course.lessons.reduce((acc, l) => acc + l.xpReward, 0)} XP
            </span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5 font-medium">
            <span>📚 {course.lessons.length} aulas</span>
            <span>·</span>
            <span>🗣️ Professor nativo</span>
          </div>

          <button
            className="w-full py-2.5 rounded-xl font-bold transition-all text-white shadow-sm text-sm"
            style={{ backgroundColor: course.accentColor || '#3B82F6' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = (course.accentColor || '#3B82F6') + 'DD'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = course.accentColor || '#3B82F6'}
          >
            {getButtonText(course.id)}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-900 font-sans text-[#1A1A1A] dark:text-slate-100 pt-24 pb-20 px-6 md:px-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
            Todos os Cursos
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Escolha seu caminho de aprendizado e comece a falar inglês americano de verdade com a Elo
          </p>
          
          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {['Todos', 'Profissional', 'Cultura', 'Acadêmico'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all shadow-sm ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60'
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Meus Cursos em Andamento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrolledCourses.map((course, index) => {
                const progress = getProgressPercentage(course.id);
                const isHovered = hoveredCourse === course.id;
                
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    whileHover={{ y: -6, scale: 1.015 }}
                    className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border transition-all cursor-pointer shadow-md flex flex-col h-full ${
                      isHovered 
                        ? 'shadow-xl border-blue-400 dark:border-blue-500/50 shadow-blue-500/5' 
                        : 'border-slate-200/80 dark:border-slate-700/80'
                    }`}
                    onMouseEnter={() => setHoveredCourse(course.id)}
                    onMouseLeave={() => setHoveredCourse(null)}
                    onClick={() => handleEnrollClick(course.id)}
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                      <div className="absolute inset-0" style={{ backgroundColor: (course.accentColor || '#3B82F6') + '20' }} />
                      <div className="absolute bottom-3 left-4 text-3xl drop-shadow-md">{course.emoji}</div>
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm" style={{ backgroundColor: course.accentColor || '#3B82F6' }}>
                          {course.tag}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-extrabold text-slate-900 dark:text-slate-100 mb-1.5 text-base md:text-lg hover:text-blue-500 transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 flex-1 leading-relaxed">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4 border-t border-slate-100 dark:border-slate-700/50 pt-3">
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-medium">
                          {course.audience || 'Todos os níveis'}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: course.accentColor || '#3B82F6' }}>
                          +{course.totalXpReward || course.lessons.reduce((acc, l) => acc + l.xpReward, 0)} XP
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1.5 font-medium">
                          <span>Progresso</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-750 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%`, backgroundColor: course.accentColor || '#3B82F6' }} 
                          />
                        </div>
                      </div>

                      <button
                        className="w-full py-2.5 rounded-xl font-bold transition-all text-white shadow-sm text-sm"
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

        {/* Available Categorized Courses Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Catálogo de Cursos (Cards por Categoria)
          </h2>

          {/* 1. Category: Conversation & Topics */}
          <div className="mb-8 bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm backdrop-blur-md transition-all">
            <div 
              onClick={() => toggleCategory('conversation')}
              className="flex items-center justify-between cursor-pointer select-none pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl text-2xl shadow-inner">
                  💬
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    Prática de Conversação
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full border border-blue-200/35 dark:border-blue-900/35 font-mono">
                      {conversationCourses.length} {conversationCourses.length === 1 ? 'curso' : 'cursos'}
                    </span>
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                    Tópicos do cotidiano, diálogos práticos e debates para destravar a sua fluência de forma divertida.
                  </p>
                </div>
              </div>
              <motion.svg 
                animate={{ rotate: openCategories.conversation ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-5 text-slate-450 dark:text-slate-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </div>

            <motion.div
              initial={false}
              animate={{ height: openCategories.conversation ? 'auto' : 0, opacity: openCategories.conversation ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {conversationCourses.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                  Nenhum curso disponível nesta categoria para os filtros selecionados.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  {conversationCourses.map((course, index) => renderCourseCard(course, index))}
                </div>
              )}
            </motion.div>
          </div>

          {/* 2. Category: Grammar & Levels */}
          <div className="mb-8 bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm backdrop-blur-md transition-all">
            <div 
              onClick={() => toggleCategory('grammar')}
              className="flex items-center justify-between cursor-pointer select-none pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl text-2xl shadow-inner">
                  📚
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    Cursos de Gramática & Níveis
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200/35 dark:border-amber-900/35 font-mono">
                      {grammarCourses.length} {grammarCourses.length === 1 ? 'curso' : 'cursos'}
                    </span>
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                    Aprenda a estruturar frases corretamente, do básico ao avançado, aplicando a gramática de forma prática.
                  </p>
                </div>
              </div>
              <motion.svg 
                animate={{ rotate: openCategories.grammar ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-5 text-slate-450 dark:text-slate-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </div>

            <motion.div
              initial={false}
              animate={{ height: openCategories.grammar ? 'auto' : 0, opacity: openCategories.grammar ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {grammarCourses.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                  Nenhum curso disponível nesta categoria para os filtros selecionados.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  {grammarCourses.map((course, index) => renderCourseCard(course, index))}
                </div>
              )}
            </motion.div>
          </div>

          {/* 3. Category: Specialty / Professional */}
          <div className="mb-8 bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm backdrop-blur-md transition-all">
            <div 
              onClick={() => toggleCategory('specialty')}
              className="flex items-center justify-between cursor-pointer select-none pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl text-2xl shadow-inner">
                  💼
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    Especializações Profissionais & Culturais
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/35 dark:border-emerald-900/35 font-mono">
                      {specialtyCourses.length} {specialtyCourses.length === 1 ? 'curso' : 'cursos'}
                    </span>
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                    Inglês focado para carreiras de destaque (Médico, Jurídico) ou imersões na cultura americana (Carros, Hip Hop, etc).
                  </p>
                </div>
              </div>
              <motion.svg 
                animate={{ rotate: openCategories.specialty ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-5 text-slate-450 dark:text-slate-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </div>

            <motion.div
              initial={false}
              animate={{ height: openCategories.specialty ? 'auto' : 0, opacity: openCategories.specialty ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {specialtyCourses.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                  Nenhum curso disponível nesta categoria para os filtros selecionados.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  {specialtyCourses.map((course, index) => renderCourseCard(course, index))}
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Courses;
