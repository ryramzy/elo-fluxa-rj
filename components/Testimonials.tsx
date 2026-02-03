/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useMemo } from 'react';
import { TESTIMONIALS } from '../constants.ts';
import { Testimonial, SupportedLanguage } from '../types.ts';

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  const isRTL = testimonial.language === 'ar';

  return (
    <div className={`bg-white border border-slate-100 p-6 sm:p-8 rounded-sm shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] flex flex-col h-full ${testimonial.isFeatured ? 'relative border-blue-100 ring-1 ring-blue-50' : ''}`}>
      {testimonial.isFeatured && (
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
          Featured Review
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-blue-400 text-sm font-serif border border-slate-800 shadow-xl">
          {testimonial.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">{testimonial.name}</h4>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
            {testimonial.location} • Verified
          </p>
        </div>
      </div>

      <div className={`relative flex-1 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="mb-4 flex gap-0.5">
           {[...Array(5)].map((_, i) => (
             <svg key={i} className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
           ))}
        </div>
        <p className="text-slate-600 text-sm leading-relaxed font-light italic">
          "{testimonial.content}"
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 items-center border-t border-slate-50 pt-4">
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{testimonial.date}</span>
        {testimonial.portugueseSpeaker && (
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-[2px] text-[8px] font-bold uppercase tracking-widest border border-blue-100">
            Native Support Used
          </span>
        )}
      </div>
    </div>
  );
}

export default function Testimonials({ lang }: { lang: SupportedLanguage }) {
  const featured = useMemo(() => TESTIMONIALS.filter(t => t.isFeatured), []);
  const others = useMemo(() => TESTIMONIALS.filter(t => !t.isFeatured), []);

  return (
    <div className="animate-fade-in-up space-y-24 max-w-6xl mx-auto pb-12">
      {/* Social Proof Header */}
      <section className="text-center space-y-4 pt-12">
         <span className="text-xs font-bold uppercase tracking-[0.6em] text-blue-600 block">Trust & Social Proof</span>
         <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">What My Students Say</h2>
         <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
      </section>

      {/* Hall of Fame - Featured */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featured.map(t => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </section>

      {/* Feed - Others */}
      <section className="bg-white p-8 md:p-16 border border-slate-100 shadow-sm rounded-sm">
        <div className="flex items-center justify-between mb-12 border-b border-slate-100 pb-8">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 rounded-sm">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-400">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785 0.592 0.592 0 00.466.971c.363.006.722-.043 1.074-.145a6.445 6.445 0 002.349-1.041c.207-.123.445-.19.685-.19.247 0 .487.07.696.203a8.826 8.826 0 004.16.994z" />
                 </svg>
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900">Latest Reviews</h3>
           </div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Feed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {others.map(t => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </section>
    </div>
  );
}