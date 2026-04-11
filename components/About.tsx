/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courses } from '../src/data/courses';

export default function About() {
  const navigate = useNavigate();
  const [linkCopied, setLinkCopied] = useState(false);

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
    <div className="animate-fade-in-up">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            De "I study English" para "I live in English"
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Domine o inglês americano real com aulas ao vivo, cursos especializados, e um professor nativo que entende sua jornada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/', { state: { openAuthModal: true } })}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              Criar conta grátis
            </button>
            <a
              href="https://wa.me/5521999999999?text=Ol%C3%A1!%20Tenho%20interesse%20nas%20aulas%20de%20ingl%C3%AAs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
            >
              Falar com Matt
            </a>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-white py-8 px-6 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-lg text-slate-700 font-medium">
              Já ensinei mais de <span className="text-2xl font-bold text-blue-600">1,247</span> alunos em <span className="text-2xl font-bold text-blue-600">28</span> países
            </p>
          </div>
          
          {/* Star Rating */}
          <div className="flex justify-center items-center gap-2 mb-8">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
            <span className="text-lg font-medium text-slate-700">4.9 (523 avaliações)</span>
          </div>
          
          {/* Logo Row */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['Petrobras', 'Vale', 'Hospital Albert Einstein', 'USP', 'Itaú', 'Embraer'].map((company) => (
              <div key={company} className="bg-slate-100 px-6 py-3 rounded-full">
                <span className="text-sm font-medium text-slate-600">{company}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Showcase */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">O que você vai aprender</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Escolha seu caminho e comece sua jornada de fluência em inglês americano
            </p>
          </div>
          
          <div className="flex overflow-x-auto gap-6 pb-4">
            {courses.map((course) => (
              <div key={course.id} className="flex-none w-80 bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4 text-center">{course.emoji}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{course.title}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">{course.audience}</span>
                  <span className="text-sm font-semibold" style={{ color: course.accentColor }}>
                    +{course.totalXpReward} XP
                  </span>
                </div>
                <button 
                  onClick={() => handleEnrollClick(course.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors"
                >
                  Ver curso
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-slate-600">
              Comece grátis - sem cartão de crédito necessário
            </p>
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
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Aprenda com Matt</h3>
              <p className="text-slate-600">Aulas ao vivo com um professor nativo, material autêntico e feedback personalizado</p>
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
            <div className="bg-slate-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  D
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Dr. Carlos Silva</h4>
                  <p className="text-sm text-slate-600">Médico, Hospital São Lucas</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-slate-700 italic">
                "O curso de inglês médico mudou minha carreira. Consigo agora atender pacientes internacionais com confiança e participar de conferências mundiais."
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  M
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Maria Oliveira</h4>
                  <p className="text-sm text-slate-600">Advogada, Rio de Janeiro</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-slate-700 italic">
                "Finalmente entendo o basquete! As aulas de sports english me ajudaram a conversar com clientes americanos sobre NBA e NFL."
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  R
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Roberto Santos</h4>
                  <p className="text-sm text-slate-600">Estudante, MIT</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-slate-700 italic">
                "O preparation course me ajudou a tirar 110 no TOEFL! Agora estou estudando em Boston com total confiança no meu inglês."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Comece hoje. Sua primeira aula é grátis.
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de alunos que já transformaram seu inglês com Matt
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button 
              onClick={() => navigate('/', { state: { openAuthModal: true } })}
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Criar conta grátis
            </button>
            <a
              href="https://wa.me/5521999999999?text=Ol%C3%A1!%20Tenho%20interesse%20nas%20aulas%20de%20ingl%C3%AAs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
            >
              Falar com Matt
            </a>
          </div>
          <p className="text-sm opacity-80">
            Vagas limitadas para aulas ao vivo com Matt este mês
          </p>
        </div>
      </section>
    </div>
  );
}