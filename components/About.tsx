/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { MATTHEW_BIO } from '../constants.ts';

export default function About() {
  const bio = MATTHEW_BIO;
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [expandedExps, setExpandedExps] = useState<Record<number, boolean>>({});

  const toggleExp = (idx: number) => {
    setExpandedExps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="animate-fade-in-up space-y-24 max-w-6xl mx-auto pb-12">
      {/* Introduction Header */}
      <section className="bg-white border border-slate-100 p-8 md:p-12 shadow-sm rounded-sm text-center">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-6 leading-tight">
          {bio.intro.title}
        </h2>
        <p className="text-xl text-slate-600 font-light leading-relaxed max-w-4xl mx-auto">
          {bio.intro.text}
        </p>
      </section>

      {/* About Me Section with Toggle */}
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
               <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Native English Coach</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8 pt-4">
          <div className="flex items-center gap-3">
             <span className="text-3xl">{bio.aboutMe.icon}</span>
             <h3 className="text-3xl font-serif font-bold text-slate-900">About Me</h3>
          </div>
          
          <div className={`relative ${!showFullAbout ? 'max-h-[300px] overflow-hidden' : ''} transition-all duration-500`}>
             <p className="text-lg text-slate-600 font-light leading-relaxed whitespace-pre-line">
               {bio.aboutMe.text}
             </p>
             {!showFullAbout && (
               <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8F9FA] to-transparent"></div>
             )}
          </div>
          
          <button 
            onClick={() => setShowFullAbout(!showFullAbout)}
            className="text-blue-600 font-bold uppercase tracking-widest text-xs hover:text-blue-700 transition-colors flex items-center gap-2"
          >
            {showFullAbout ? 'Read less' : 'Read more'}
            <svg className={`w-4 h-4 transform transition-transform ${showFullAbout ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-slate-100">
             <div>
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Languages</h5>
                <div className="space-y-4">
                   {bio.languages.map((l, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <span className="text-xl">{l.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{l.name}</span>
                          <span className="text-xs text-slate-400">{l.level}</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <div>
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Interests</h5>
                <div className="flex flex-wrap gap-2">
                   {bio.interests.map((interest, i) => (
                     <span key={i} className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-medium rounded-full border border-slate-200">
                        {interest}
                     </span>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Expertise & Skills Grid */}
      <section className="bg-white p-12 md:p-20 border border-slate-100 shadow-sm rounded-sm">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="space-y-8">
               <h4 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-blue-600"></span>
                  Specialties
               </h4>
               <div className="space-y-6">
                  {bio.specialties.expertise.map((exp, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                       <span className="text-3xl group-hover:scale-110 transition-transform">{exp.icon}</span>
                       <span className="font-bold text-slate-700 uppercase tracking-widest text-xs">{exp.name}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-8">
               <h4 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-blue-600"></span>
                  Language Skills
               </h4>
               <div className="flex flex-wrap gap-2">
                  {bio.specialties.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                       {skill}
                    </span>
                  ))}
               </div>
               <h4 className="text-xl font-serif font-bold text-slate-900 pt-4">Preferred Levels</h4>
               <div className="flex gap-4">
                  {bio.specialties.levels.map((level, i) => (
                    <div key={i} className="flex flex-col items-center">
                       <div className="w-2 h-2 bg-blue-400 rounded-full mb-2"></div>
                       <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-400">{level}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-8">
               <h4 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-blue-600"></span>
                  Industry Familiarity
               </h4>
               <div className="grid grid-cols-1 gap-2">
                  {bio.specialties.industries.map((ind, i) => (
                    <div key={i} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                       {ind}
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Bibliography Section - NEW */}
      <section className="space-y-12">
         <h3 className="text-3xl font-serif font-bold text-slate-900 border-b border-slate-200 pb-6">Selected Bibliography & Publications</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bio.bibliography?.map((item, i) => (
              <div key={i} className="bg-slate-50 p-8 border-l-2 border-blue-600 flex flex-col justify-between hover:bg-white transition-colors">
                 <div>
                    <h4 className="font-serif italic text-xl text-slate-800 mb-2">"{item.title}"</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{item.publisher} • {item.year}</p>
                    <p className="text-sm text-slate-600 font-light leading-relaxed">{item.description}</p>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* Teaching Style */}
      <section className="bg-slate-950 text-white p-12 md:p-20 rounded-sm relative overflow-hidden text-center">
         <div className="max-w-3xl mx-auto space-y-8">
            <span className="text-3xl block mb-4">{bio.teachingStyle.icon}</span>
            <h3 className="text-3xl md:text-4xl font-serif font-bold">{bio.teachingStyle.title}</h3>
            <p className="text-xl text-slate-300 leading-relaxed font-light italic">
               "{bio.teachingStyle.text}"
            </p>
         </div>
      </section>

      {/* Experience & Training */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-24">
         <div className="space-y-12">
            <h3 className="text-3xl font-serif font-bold text-slate-900 border-b border-slate-200 pb-6">Work Experience</h3>
            <div className="space-y-12">
               {bio.experience.map((exp, i) => (
                 <div key={i} className="group relative pl-8 border-l border-slate-200">
                    <div className="absolute top-0 left-[-5px] w-2 h-2 bg-blue-600 rounded-full"></div>
                    <h4 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{exp.role}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{exp.company}</p>
                    <div className={`${!expandedExps[i] ? 'max-h-20 overflow-hidden' : ''} transition-all duration-300 relative`}>
                        <p className="text-sm text-slate-500 leading-relaxed font-light">{exp.desc}</p>
                        {!expandedExps[i] && <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#F8F9FA] to-transparent"></div>}
                    </div>
                    <button 
                      onClick={() => toggleExp(i)}
                      className="mt-3 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline"
                    >
                       {expandedExps[i] ? 'Read less' : 'Read more'}
                    </button>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-12">
            <h3 className="text-3xl font-serif font-bold text-slate-900 border-b border-slate-200 pb-6">Education & Training</h3>
            <div className="space-y-12">
               {bio.education.map((edu, i) => (
                 <div key={i} className="group border-b border-slate-50 pb-8 last:border-0">
                    <h4 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{edu.degree}</h4>
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">{edu.school}</p>
                    <p className="text-sm text-slate-500 leading-relaxed font-light">{edu.focus}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}