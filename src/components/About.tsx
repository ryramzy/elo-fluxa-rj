/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courses } from '@/data/courses';
import { useAuth } from '@/hooks/useAuth';
import { useEnrollments } from '@/hooks/useEnrollments';
import Hero from './Hero';

export default function About() {
  const navigate = useNavigate();
  const { user, signInAsGuest } = useAuth();
  const { enrollments } = useEnrollments(user?.uid || '');
  const [linkCopied, setLinkCopied] = useState(false);

  // Redirect logged-in full users to dashboard (allow guests & unauthenticated to explore)
  useEffect(() => {
    if (user && !user.isGuest) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleShareClick = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleEnrollClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      
      {/* Hero Banner for Visitors & Guest Users */}
      {(!user || user.isGuest) && (
        <Hero onEnter={() => navigate('/login')} />
      )}
      
      {/* Social Proof Bar */}
      <section className="bg-white py-8 px-6 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-4">
            <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-blue-700">Professor nativo americano</span>
            </div>
            <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-green-700">Morando no Rio de Janeiro</span>
            </div>
            <div className="bg-purple-50 border border-purple-200 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-purple-700">Inglês real não de livro</span>
            </div>
            <div className="bg-orange-50 border border-orange-200 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-orange-700">Aulas ao vivo + cursos online</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pain-Benefit Section */}
      {!user && (
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Você se identifica com algum desses?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-600 font-medium">Estudo há anos mas trava na hora de falar</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-600 font-medium">Entendo inglês mas não consigo me expressar</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-600 font-medium">Fico nervoso quando preciso falar com americano</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-600 font-medium">Aprendo no app mas esqueço tudo logo depois</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-600 font-medium">Não tenho tempo para curso presencial</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-600 font-medium">Aqui você fala desde a primeira aula</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-600 font-medium">Aulas de conversação real com nativo</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-600 font-medium">Confiança que vem de praticar de verdade</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-600 font-medium">Método com contexto cultural cola na memória</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-600 font-medium">Aulas ao vivo online + cursos no seu ritmo</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg text-slate-700 font-medium mb-6">
              Isso é o que os meus alunos vivem. Vem viver também.
            </p>
            <button
              onClick={() => {
                signInAsGuest();
                navigate('/courses/basic-english-daily-life/lessons/be-dl-01');
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl transition-all shadow-lg text-sm uppercase tracking-wider hover:scale-105 border border-blue-400/40"
            >
              <span>⚡</span> Experimentar Aula Grátis (Sem Cadastro)
            </button>
          </div>
        </div>
      </section>
      )}

      {/* Course Showcase */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">O que você vai aprender</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Escolha seu caminho e comece sua jornada de fluência em inglês americano
            </p>
          </div>
          
          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const isEnrolled = enrollments.some(e => e.courseId === course.id);
              
              return (
                <div
                  key={course.id}
                  className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  onClick={() => handleEnrollClick(course.id)}
                >
                  {/* Photo Banner with Colored Overlay */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', course.imageUrl);
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', course.imageUrl, e);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div 
                      className="absolute inset-0 z-10"
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
                    <h3 className="font-bold text-slate-900 mb-2 text-lg">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
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
                    <div className="text-sm text-slate-500 mb-4">
                      {course.lessons.length} aulas · Professor
                    </div>

                    {/* CTA Button */}
                    {user ? (
                      // Authenticated users - go to LMS
                      <button
                        className="w-full py-3 rounded-lg font-medium transition-colors text-white"
                        style={{ backgroundColor: course.accentColor }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = course.accentColor + 'DD';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = course.accentColor;
                        }}
                      >
                        {isEnrolled ? 'Continuar' : 'Ver curso'}
                      </button>
                    ) : (
                      // Anonymous users - High Converting Interactive Trial CTA
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            signInAsGuest();
                            const firstLessonId = course.lessons[0]?.id || 'be-dl-01';
                            navigate(`/courses/${course.id}/lessons/${firstLessonId}`);
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider border border-blue-400/40 hover:scale-102"
                        >
                          ⚡ Experimentar 1ª Aula Grátis
                        </button>
                        <button 
                          onClick={() => handleEnrollClick(course.id)}
                          className="w-full text-slate-600 hover:text-slate-900 font-semibold py-1 text-xs transition-colors"
                        >
                          Ver Detalhes do Curso
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-slate-600">
              Comece grátis - sem cartão de crédito
            </p>
          </div>
        </div>
      </section>

      {/* Why This Works Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Por que funciona?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Professor nativo, não roteiro</h3>
              <p className="text-slate-600 leading-relaxed">
                Nossos professores são nativos americanos. Eles não seguem um script - ensinam do jeito que os americanos realmente falam.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  <div className="w-4 h-4 bg-green-600 rounded-full ml-2"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Contexto cultural primeiro</h3>
              <p className="text-slate-600 leading-relaxed">
                Inglês sem cultura é vocabulário solto. Aqui você aprende o idioma dentro da cultura: esportes, trabalho, música, vida real.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg"></div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Você fala. Desde o dia 1.</h3>
              <p className="text-slate-600 leading-relaxed">
                Chega de esperar 'estar pronto para falar'. Você pratica conversação desde a primeira aula, com feedback de um nativo.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-slate-500 font-medium mb-6 max-w-2xl mx-auto">
              Professores nativos americanos especializados em inglês para profissionais, estudantes e apaixonados por cultura americana.
            </p>
            <button 
              onClick={() => navigate('/sobre')}
              className="px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-lg transition-colors"
            >
              Conhecer nossos professores
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Como funciona</h2>
            <p className="text-lg text-slate-600">Três passos simples para dominar o inglês americano</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Escolha seu curso</h3>
              <p className="text-slate-600">Selecione o curso que melhor se adapta aos seus objetivos profissionais ou pessoais</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Aprenda com professores nativos</h3>
              <p className="text-slate-600">Aulas ao vivo com professores nativos, material autêntico e feedback personalizado</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Agende suas aulas</h3>
              <p className="text-slate-600">Pratique conversação ao vivo quando estiver pronto, nos horários que funcionam para você</p>
            </div>
          </div>
        </div>
      </section>

      {/* Transformation Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Transformações reais</h2>
            <p className="text-lg text-slate-600">De estudante de inglês para falante confiante</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-600">Antes</span>
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-slate-700 italic">"Trava em entrevistas em inglês"</p>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-600">Depois</span>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-slate-700 italic font-medium">"Conseguiu o emprego dos sonhos"</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-600">Antes</span>
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-slate-700 italic">"Não entende filmes sem legenda"</p>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-600">Depois</span>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-slate-700 italic font-medium">"Assiste NBA ao vivo sem esforço"</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-600">Antes</span>
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-slate-700 italic">"Medo de falar com americanos"</p>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-600">Depois</span>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-slate-700 italic font-medium">"Faz networking em conferências"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">O que nossos alunos dizem</h2>
            <p className="text-lg text-slate-600">Histórias reais de sucesso</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-lg p-6 opacity-75">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700">Depoimento em breve</h4>
                  <p className="text-sm text-slate-500 italic">Primeiro aluno</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 italic text-sm">
                "Depoimento em breve - nossos primeiros alunos estão começando agora."
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-6 opacity-75">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700">Depoimento em breve</h4>
                  <p className="text-sm text-slate-500 italic">Primeira aluna</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 italic text-sm">
                "Depoimento em breve - nossos primeiros alunos estão começando agora."
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-6 opacity-75">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700">Depoimento em breve</h4>
                  <p className="text-sm text-slate-500 italic">Primeiro aluno</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 italic text-sm">
                "Depoimento em breve - nossos primeiros alunos estão começando agora."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para parar de estudar<br />e começar a falar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Experimente a primeira aula 100% interativa agora.<br />
            Sem cartão de crédito, sem formulário.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={() => {
                signInAsGuest();
                navigate('/courses/basic-english-daily-life/lessons/be-dl-01');
              }}
              className="px-8 py-4 bg-white hover:bg-slate-100 text-blue-600 font-extrabold rounded-2xl transition-all shadow-lg inline-flex items-center justify-center gap-2 uppercase tracking-wider text-xs border-2 border-white hover:scale-105"
            >
              <span>⚡</span> Testar Aula Demonstrativa (Grátis)
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 border-2 border-white text-white hover:bg-white/10 font-extrabold rounded-2xl transition-all uppercase tracking-wider text-xs"
            >
              Criar Conta Grátis
            </button>
          </div>
          <p className="text-sm opacity-80">
            Vagas limitadas para aulas ao vivo este mês
          </p>
        </div>
      </section>
    </div>
  );
}