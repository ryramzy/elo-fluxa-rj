import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { useToast } from '@/hooks/useToast';
import { trackEvent } from '@utils/analytics';
import confetti from 'canvas-confetti';
import { MaterialLibraryModal } from './MaterialLibraryModal';
import { 
  LuMaximize, 
  LuMinimize, 
  LuLayoutGrid, 
  LuBookOpen, 
  LuChevronLeft, 
  LuChevronRight, 
  LuCheck, 
  LuCircleHelp, 
  LuX 
} from 'react-icons/lu';

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
  userXp?: number;
  userStreak?: number;
  userLevel?: number;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({ 
  slides, 
  initialSlide = 0, 
  onSlideChange, 
  onComplete, 
  onClose, 
  userXp = 0, 
  userStreak = 0, 
  userLevel = 1 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlide);
  const [sessionXp, setSessionXp] = useState(0);
  const [floatingXp, setFloatingXp] = useState<{ amount: number; id: number } | null>(null);
  
  // Presentation Mode States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [isTeacherNotesOpen, setIsTeacherNotesOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | undefined>(undefined);
  const xpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showToast } = useToast();

  const addSessionXp = (amount: number) => {
    setSessionXp(prev => prev + amount);
    setFloatingXp({ amount, id: Date.now() });
    if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
    xpTimerRef.current = setTimeout(() => setFloatingXp(null), 1200);
  };

  useEffect(() => {
    (window as any).__eloAddSessionXp = addSessionXp;
    return () => {
      delete (window as any).__eloAddSessionXp;
      if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
    };
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleJumpToSlide = (index: number) => {
    swiperRef.current?.slideTo(index);
    setIsGridOpen(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Exit fullscreen failed:', err);
      });
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (currentIndex === 5 || currentIndex === 7 || currentIndex === slides.length - 1) {
      triggerConfetti();
    }
  }, [currentIndex, slides.length]);

  // Keyboard Navigation for Live Class Presentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toLowerCase();
        const isContentEditable = activeEl.getAttribute('contenteditable') === 'true';
        if (tagName === 'input' || tagName === 'textarea' || isContentEditable) {
          return;
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
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setIsGridOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsTeacherNotesOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentSlide = slides[currentIndex];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-[#020617] z-50 flex flex-col font-sans text-white relative overflow-hidden select-none"
    >
      {/* Background Deck Ambience */}
      <div className="absolute inset-0 bg-[#020617] z-0 pointer-events-none" />
      <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />
      
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-30px); }
        }
      `}</style>
      
      {/* Top Presentation Bar */}
      <div 
        className="absolute top-0 left-0 right-0 p-4 flex flex-col gap-3 z-30 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }} 
              className="flex items-center gap-2 px-3 py-2 text-white/90 hover:text-white bg-slate-900/80 border border-slate-800 hover:bg-slate-800 rounded-xl backdrop-blur-md transition-colors text-xs font-bold"
              title="Sair do Modo Apresentação"
            >
              <LuChevronLeft className="w-4 h-4" />
              <span>Sair</span>
            </button>

            {/* Slide Index Dropdown Toggle */}
            <button
              onClick={() => setIsGridOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold backdrop-blur-md transition-colors"
              title="Abrir Grade de Slides (Atalho: G)"
            >
              <LuLayoutGrid className="w-4 h-4 text-blue-400" />
              <span>Slide {currentIndex + 1} / {slides.length}</span>
            </button>
          </div>

          {/* Presentation Tools (Desktop & Mobile Tutors) */}
          <div className="flex items-center gap-2">
            {/* Library / OpenEnglish PDFs button */}
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-300 hover:text-white rounded-xl text-xs font-bold backdrop-blur-md transition-all shadow-sm"
              title="Abrir Biblioteca de Materiais & PDFs"
            >
              <LuBookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Biblioteca & PDFs</span>
            </button>

            {/* Teacher Notes / Guide Toggle */}
            <button
              onClick={() => setIsTeacherNotesOpen(prev => !prev)}
              className={`p-2 rounded-xl border backdrop-blur-md transition-all ${
                isTeacherNotesOpen 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Guia do Professor / Notas (Atalho: T)"
            >
              <LuCircleHelp className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 backdrop-blur-md transition-colors"
              title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia (Atalho: F)'}
            >
              {isFullscreen ? <LuMinimize className="w-4 h-4" /> : <LuMaximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Gamification Status Bar */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full">
            <span>🔥</span>
            <span className="text-amber-300">{userStreak}d</span>
          </div>
          <div className="flex items-center gap-1 bg-purple-500/15 border border-purple-500/30 px-2.5 py-1 rounded-full">
            <span>⭐</span>
            <span className="text-purple-300">Lv.{userLevel}</span>
          </div>
          <div className="relative flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            <span>💎</span>
            <span className="text-emerald-300">{userXp + sessionXp} XP</span>
            {floatingXp && (
              <span
                key={floatingXp.id}
                className="absolute -top-6 right-0 text-emerald-400 font-extrabold text-sm pointer-events-none"
                style={{ animation: 'floatUp 1.2s ease-out forwards' }}
              >
                +{floatingXp.amount} XP
              </span>
            )}
          </div>
        </div>

        {/* Progress Timeline Segments */}
        <div className="flex gap-1 w-full max-w-5xl mx-auto">
          {slides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => handleJumpToSlide(idx)}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]' : idx < currentIndex ? 'bg-white/60' : 'bg-white/15'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Main Slide Presentation View (Swiper) */}
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
        threshold={15}
        resistanceRatio={0.65}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full flex flex-col justify-center px-4 sm:px-8 md:px-16 overflow-y-auto">
            {slide.imageUrl && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-15 z-0" 
                style={{ backgroundImage: `url(${slide.imageUrl})` }} 
              />
            )}
            
            <div 
              className="relative z-10 max-w-4xl mx-auto w-full flex flex-col justify-center text-left"
              style={{ 
                paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))',
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

      {/* Slide Navigation Footer Overlay */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-20 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:bg-slate-800 transition-all ${currentIndex === 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}
          title="Slide Anterior (Seta Esquerda)"
        >
          <LuChevronLeft className="w-6 h-6 text-slate-200" />
        </button>
        
        <div className="text-xs font-semibold text-slate-400">
          <span className="hidden sm:inline">Use as setas ou barras para navegar no deck</span>
          <span className="sm:hidden bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800 text-[11px] font-mono text-slate-300">
            {currentIndex + 1} / {slides.length}
          </span>
        </div>

        {currentIndex === slides.length - 1 ? (
          <button 
            onClick={onComplete}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl font-extrabold shadow-lg shadow-blue-500/25 flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider transition-all hover:scale-105"
          >
            <span>Concluir Aula</span>
            <LuCheck className="w-5 h-5 text-emerald-300" />
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
            title="Próximo Slide (Espaço ou Seta Direita)"
          >
            <LuChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Drawer 1: Slide Grid Jumper */}
      {isGridOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LuLayoutGrid className="w-5 h-5 text-blue-400" /> Grade de Slides da Aula
              </h3>
              <button 
                onClick={() => setIsGridOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-1">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => handleJumpToSlide(idx)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    idx === currentIndex
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Slide {idx + 1}
                  </span>
                  <span className="text-xs font-semibold mt-1 line-clamp-2">
                    {s.title || `Seção ${idx + 1}`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Drawer 2: Teacher Notes / Guide */}
      {isTeacherNotesOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-40 bg-slate-900 border border-slate-800 rounded-2xl p-4 w-80 max-h-96 overflow-y-auto shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <LuCircleHelp size={14} /> Guia do Professor / Dicas
            </span>
            <button 
              onClick={() => setIsTeacherNotesOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <LuX size={14} />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentSlide?.spokenText ? (
              <span><strong>Meta de Fala:</strong> "{currentSlide.spokenText}"</span>
            ) : (
              <span>Incentive o aluno a ler em voz alta os exemplos do slide e tirar dúvidas de pronúncia antes de avançar.</span>
            )}
          </p>
        </div>
      )}

      {/* Modal 3: OpenEnglish & PDF Library */}
      <MaterialLibraryModal 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />
    </div>
  );
};
