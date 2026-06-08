import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { speakText } from '../../utils/tts';

interface Slide {
  id: string;
  title?: string;
  content: React.ReactNode;
  imageUrl?: string;
  spokenText?: string;
}

interface SlideViewerProps {
  slides: Slide[];
  initialSlide?: number;
  onSlideChange?: (index: number) => void;
  onComplete: () => void;
  onClose: () => void;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({ slides, initialSlide = 0, onSlideChange, onComplete, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlide);
  const swiperRef = useRef<SwiperType | undefined>(undefined);

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleSpeakText = (text: string) => {
    speakText(text);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col font-sans text-white touch-none">
      
      {/* Top Bar Navigation */}
      <div 
        className="absolute top-0 left-0 right-0 p-4 flex flex-col gap-3 z-30 bg-gradient-to-b from-slate-900/80 to-transparent"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-between">
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="flex items-center gap-2 px-3 py-2 text-white/90 hover:text-white bg-slate-800/50 hover:bg-slate-700/80 rounded-lg backdrop-blur-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-sm">Sair da Aula</span>
          </button>
          
          {slides[currentIndex]?.spokenText && (
            <button
              onClick={() => handleSpeakText(slides[currentIndex].spokenText!)}
              className="flex items-center gap-2 px-3 py-2 text-blue-100 hover:text-white bg-blue-600/50 hover:bg-blue-500/80 rounded-lg backdrop-blur-md transition-colors border border-blue-400/30 shadow-[0_0_15px_rgba(37,99,235,0.3)] animate-pulse"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h2l4 4V4L9 8H7a2 2 0 00-2 2z" />
              </svg>
              <span className="font-medium text-sm">Ouça</span>
            </button>
          )}
        </div>
        
        {/* Segmented Progress Bar */}
        <div className="flex gap-1 w-full max-w-3xl mx-auto">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-white' : idx < currentIndex ? 'bg-white/60' : 'bg-white/20'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Slide Content via Swiper */}
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        initialSlide={initialSlide}
        onSlideChange={(swiper) => {
          setCurrentIndex(swiper.activeIndex);
          onSlideChange?.(swiper.activeIndex);
        }}
        className="w-full h-full"
        spaceBetween={50}
        threshold={15} // Requires 15px of movement to start sliding (prevents accidental swipes)
        resistanceRatio={0.65} // Makes it harder to over-swipe past the edges
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full flex flex-col justify-center px-8">
            {slide.imageUrl && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 z-0" 
                style={{ backgroundImage: `url(${slide.imageUrl})` }} 
              />
            )}
            
            <div 
              className="relative z-10 max-w-lg mx-auto w-full h-full flex flex-col justify-center animate-fade-in-up"
              style={{ 
                paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))',
                paddingTop: 'calc(6rem + env(safe-area-inset-top))'
              }}
            >
              {slide.title && (
                <h2 className="text-3xl font-serif font-bold mb-6 text-blue-300 leading-tight">
                  {slide.title}
                </h2>
              )}
              <div className="text-xl md:text-2xl font-medium leading-snug flex-1 flex flex-col">
                {slide.content}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Navigation Controls Overlay */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-6 flex justify-between z-20 bg-gradient-to-t from-slate-900 to-transparent"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <button 
          onClick={handlePrev}
          className={`p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {currentIndex === slides.length - 1 ? (
          <button 
            onClick={onComplete}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2"
          >
            <span>Finish</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
