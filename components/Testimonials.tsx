/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { TESTIMONIALS } from '../constants';
import { Testimonial, SupportedLanguage } from '../types';

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const [isTranslated, setIsTranslated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const displayContent = isTranslated && testimonial.translation ? testimonial.translation : testimonial.content;
  const isRTL = testimonial.language === 'ar' && !isTranslated;
  const showReadMore = testimonial.content.length > 180 && !isExpanded;

  return (
    <div className={`bg-white border border-slate-100 p-6 sm:p-8 rounded-sm shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] flex flex-col h-full ${testimonial.isFeatured ? 'relative border-amber-100' : ''}`}>
      {testimonial.isFeatured && (
        <div className="absolute top-4 right-4 bg-amber-50 text-amber-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
          <span className="text-xs">⭐</span> Featured
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-bold border border-slate-200 shadow-inner">
          {testimonial.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">{testimonial.name}</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
            {testimonial.date} • {testimonial.location}
          </p>
        </div>
      </div>

      <div className={`relative flex-1 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <p className={`text-slate-600 text-sm leading-relaxed ${!isExpanded ? 'line-clamp-4' : ''}`}>
          {displayContent}
        </p>
        
        {showReadMore && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mt-4 hover:underline"
          >
            Read More
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 items-center border-t border-slate-50 pt-4">
        {testimonial.translation && (
          <button 
            onClick={() => setIsTranslated(!isTranslated)}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
            </svg>
            {isTranslated ? 'Original' : 'Translate to English'}
          </button>
        )}
        
        {testimonial.portugueseSpeaker && (
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-widest border border-blue-100">
            Portuguese Speaker
          </span>
        )}
      </div>
    </div>
  );
}

export default function Testimonials({ lang }: { lang: SupportedLanguage }) {
  const featured = useMemo(() => TESTIMONIALS.filter(t => t.isFeatured).slice(0, 4), []);
  
  const sortedOthers = useMemo(() => {
    return [...TESTIMONIALS]
      .filter(t => !t.isFeatured)
      .sort((a, b) => {
        // Rio Priority: Brazil first
        const aIsBR = a.locationCode === 'BR';
        const bIsBR = b.locationCode === 'BR';
        if (aIsBR && !bIsBR) return -1;
        if (!aIsBR && bIsBR) return 1;
        return 0;
      });
  }, []);

  return (
    <section className="space-y-20">
      {/* Featured Section (Hall of Fame) */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-amber-500 text-xl">🏆</span>
              <span className="text-xs font-bold uppercase tracking-[0.4em] text-amber-500">Hall of Fame</span>
            </div>
            <h3 className="text-3xl font-serif font-bold text-slate-900">Featured Testimonials (4 of 4)</h3>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-4 py-2 rounded-sm shadow-sm">
            Trust Score: 100% Verified
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featured.map(t => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </div>

      {/* The Feed */}
      <div className="bg-white p-8 sm:p-16 rounded-sm border border-slate-100 shadow-inner">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-3 bg-slate-900 rounded-sm">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785 0.592 0.592 0 00.466.971c.363.006.722-.043 1.074-.145a6.445 6.445 0 002.349-1.041c.207-.123.445-.19.685-.19.247 0 .487.07.696.203a8.826 8.826 0 004.16.994z" />
             </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-slate-400 mb-1">Global Reach</h4>
            <p className="text-lg font-serif font-bold text-slate-900">Student Feed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedOthers.map(t => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
        
        <div className="mt-20 pt-10 border-t border-slate-50 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
            Showing {sortedOthers.length + featured.length} of 50+ Recent reviews from students worldwide
          </p>
        </div>
      </div>
    </section>
  );
}
