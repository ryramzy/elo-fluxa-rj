import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { speakText } from '@utils/tts';
import { useToast } from '@/hooks/useToast';
import { trackEvent } from '@utils/analytics';


interface Slide {
  id: string;
  title?: string;
  content: React.ReactNode;
  imageUrl?: string;
  spokenText?: string;
  type?: string;
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const swiperRef = useRef<SwiperType | undefined>(undefined);
  const { showToast } = useToast();

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleSpeakText = (text: string) => {
    if (isSpeaking) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      trackEvent('ai_coach_speech_stop', { slideIndex: currentIndex });
    } else {
      trackEvent('ai_coach_speech_listen', { textLength: text.length, slideIndex: currentIndex });
      speakText(
        text,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        (err) => {
          console.error('[SlideViewer] TTS error:', err);
          setIsSpeaking(false);
          showToast({ type: 'error', message: 'Falha ao reproduzir áudio da aula.' });
        }
      );
    }
  };

  useEffect(() => {
    // Cancel speaking when slide changes
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [currentIndex]);

  // Typing-safe keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toLowerCase();
        const isContentEditable = activeEl.getAttribute('contenteditable') === 'true';
        if (
          tagName === 'input' || 
          tagName === 'textarea' || 
          isContentEditable
        ) {
          return; // Skip page transition when typing
        }
      }

      if (!swiperRef.current) return;
      const swiper = swiperRef.current;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        swiper.slideNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        swiper.slidePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col font-sans text-white touch-none relative overflow-hidden">
      {/* 🔮 SLATE GLOW ACCENT DECK SHIELDS */}
      <div className="absolute inset-0 bg-slate-950 z-0 pointer-events-none" />
      <div className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <style>{`
        @keyframes siri-ripple {
          0% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 0.35; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes siri-wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.2); }
        }
        .siri-ripple-1 { animation: siri-ripple 2.2s infinite ease-out; }
        .siri-ripple-2 { animation: siri-ripple 2.2s infinite ease-out 0.7s; }
        .siri-ripple-3 { animation: siri-ripple 2.2s infinite ease-out 1.4s; }
        
        .siri-bar {
          width: 3.5px;
          height: 100%;
          background-color: #ffffff;
          border-radius: 9999px;
          display: inline-block;
          margin: 0 1.5px;
          transform-origin: center;
        }
        .siri-bar-1 { animation: siri-wave 1.1s infinite ease-in-out; }
        .siri-bar-2 { animation: siri-wave 1.3s infinite ease-in-out; animation-delay: 0.2s; }
        .siri-bar-3 { animation: siri-wave 1.0s infinite ease-in-out; animation-delay: 0.4s; }
        .siri-bar-4 { animation: siri-wave 1.2s infinite ease-in-out; animation-delay: 0.6s; }
      `}</style>
      
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
            <div className="relative flex items-center justify-center">
              {/* Pulsing glow ripples behind when speaking */}
              {isSpeaking && (
                <>
                  <div className="absolute w-14 h-14 rounded-full bg-blue-500/35 siri-ripple-1 pointer-events-none" />
                  <div className="absolute w-14 h-14 rounded-full bg-indigo-500/25 siri-ripple-2 pointer-events-none" />
                  <div className="absolute w-14 h-14 rounded-full bg-cyan-500/15 siri-ripple-3 pointer-events-none" />
                </>
              )}
              
              <button
                onClick={() => handleSpeakText(slides[currentIndex].spokenText!)}
                className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 relative cursor-pointer overflow-hidden group shadow-lg ${
                  isSpeaking
                    ? 'bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 border-blue-400/40 shadow-[0_0_25px_rgba(139,92,246,0.6)] siri-active-orb scale-105'
                    : 'bg-gradient-to-tr from-blue-700 via-indigo-650 to-cyan-500 border-blue-500/30 hover:border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:scale-105'
                }`}
                title={isSpeaking ? 'Parar de ouvir Elo' : 'Ouvir Elo falar'}
              >
                {/* Inner glass overlay for premium glossy look */}
                <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-80 pointer-events-none" />
                
                {isSpeaking ? (
                  /* Moving voice wave lines */
                  <div className="flex items-center justify-center h-5">
                    <span className="siri-bar siri-bar-1" />
                    <span className="siri-bar siri-bar-2" />
                    <span className="siri-bar siri-bar-3" />
                    <span className="siri-bar siri-bar-4" />
                  </div>
                ) : (
                  /* Idle microphone icon */
                  <svg className="w-5 h-5 text-white/95 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            </div>
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
          <SwiperSlide key={slide.id} className="relative w-full h-full flex flex-col justify-center px-8 md:px-16 overflow-y-auto">
            {slide.imageUrl && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20 z-0" 
                style={{ backgroundImage: `url(${slide.imageUrl})` }} 
              />
            )}
            
            {/* Centered Layout */}
            <div 
              className="relative z-10 max-w-3xl mx-auto w-full flex flex-col justify-center text-left"
              style={{ 
                paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))',
                paddingTop: 'calc(6rem + env(safe-area-inset-top))'
              }}
            >
              {slide.title && (
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-6 text-blue-300 leading-tight tracking-tight drop-shadow-sm">
                  {slide.title}
                </h2>
              )}
              <div className="text-base md:text-lg leading-relaxed flex-1 flex flex-col justify-center">
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
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 text-sm md:text-base"
          >
            <span>Concluir Aula</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
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
