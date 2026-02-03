/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { SupportedLanguage } from '../types';
import { MATTHEW_BIO } from '../constants';

interface AboutProps {
  lang: SupportedLanguage;
}

export default function About({ lang }: AboutProps) {
  const bio = MATTHEW_BIO;

  return (
    <div className="animate-fade-in-up space-y-24 max-w-6xl mx-auto pb-12">
      {/* Intro Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <div className="relative group">
            <div className="aspect-[4/5] overflow-hidden rounded-sm shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=800" 
                alt="Matthew - Native English Coach" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-8 border-b-4 border-slate-900 shadow-xl">
               <h4 className="text-3xl font-serif">Matthew</h4>
               <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Native Coach & Architect</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8 pt-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
             <span className="text-lg">👋</span>
             <span className="text-xs font-bold uppercase tracking-widest">Meet Matthew</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            {bio.intro.title}
          </h2>
          <p className="text-xl text-slate-600 font-light leading-relaxed">
            {bio.intro.text}
          </p>
          
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100">
             <div>
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Languages</h5>
                <div className="space-y-3">
                   {bio.languages.map((l, i) => (
                     <div key={i} className="flex items-center gap-2">
                        <span className="text-lg">{l.icon}</span>
                        <span className="text-sm font-bold text-slate-700">{l.name}</span>
                        <span className="text-xs text-slate-400">({l.level})</span>
                     </div>
                   ))}
                </div>
             </div>
             <div>
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Specialties</h5>
                <div className="flex flex-wrap gap-3">
                   {bio.specialties.map((s, i) => (
                     <div key={i} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <span>{s.icon}</span>
                        <span>{s.name}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* About Me & Philosophy */}
      <section className="bg-white p-12 md:p-20 border border-slate-100 shadow-sm rounded-sm">
         <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center">
               <span className="text-xs font-bold uppercase tracking-[0.4em] text-blue-600 mb-4 block">Personal Perspective</span>
               <h3 className="text-4xl font-serif font-bold text-slate-900">{bio.aboutMe.title}</h3>
            </div>
            <p className="text-lg text-slate-600 leading-relaxed font-light first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-blue-600">
               {bio.aboutMe.text}
            </p>
            
            <div className="pt-12 border-t border-slate-100">
               <h5 className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">Interests & Passions</h5>
               <div className="flex flex-wrap justify-center gap-3">
                  {bio.interests.map((interest, i) => (
                    <span key={i} className="px-4 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-medium border border-slate-100 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all cursor-default">
                       {interest}
                    </span>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Experience & Education */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-16">
         <div className="space-y-12">
            <h3 className="text-2xl font-serif font-bold text-slate-900 border-l-4 border-blue-600 pl-6">Work Experience</h3>
            <div className="space-y-10">
               {bio.experience.map((exp, i) => (
                 <div key={i} className="group">
                    <h4 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{exp.role}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{exp.company}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{exp.desc}</p>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-12">
            <h3 className="text-2xl font-serif font-bold text-slate-900 border-l-4 border-blue-600 pl-6">Education & Training</h3>
            <div className="space-y-10">
               {bio.education.map((edu, i) => (
                 <div key={i} className="group">
                    <h4 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{edu.degree}</h4>
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">{edu.school}</p>
                    <p className="text-sm text-slate-500 leading-relaxed font-light">{edu.focus}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Teaching Style */}
      <section className="bg-slate-950 text-white p-12 md:p-20 rounded-sm relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"></div>
         <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-1 border-r border-white/10 pr-12 hidden md:block">
               <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-4 block">The Methodology</span>
               <h4 className="text-3xl font-serif italic">Teaching Style</h4>
            </div>
            <div className="md:col-span-2 space-y-8">
               <p className="text-xl text-slate-300 leading-relaxed font-light italic">
                 "{bio.teachingStyle}"
               </p>
               <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                  {bio.skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400">
                       <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                       {skill}
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
