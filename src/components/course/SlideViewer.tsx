import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Slide {
  id: string;
  title?: string;
  content: React.ReactNode;
  imageUrl?: string;
}

interface SlideViewerProps {
  slides: Slide[];
  onComplete: () => void;
  onClose: () => void;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({ slides, onComplete, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // Avoid triggering tap when interacting with inner content like buttons
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('input')) {
      return;
    }

    const clickX = e.clientX;
    const screenWidth = window.innerWidth;
    
    if (clickX > screenWidth / 2) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col font-sans text-white touch-none" onClick={handleTap}>
      
      {/* Segmented Progress Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex gap-1 z-20">
        {slides.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'bg-white' : idx < currentIndex ? 'bg-white/60' : 'bg-white/20'
            }`} 
          />
        ))}
      </div>

      {/* Close Button */}
      <div className="absolute top-8 right-4 z-20">
        <button onClick={onClose} className="p-2 text-white/80 hover:text-white bg-black/20 rounded-full backdrop-blur-md">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col justify-center px-8 relative overflow-hidden">
        {slides[currentIndex].imageUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 z-0" 
            style={{ backgroundImage: `url(${slides[currentIndex].imageUrl})` }} 
          />
        )}
        
        <div className="relative z-10 max-w-lg mx-auto w-full animate-fade-in-up">
          {slides[currentIndex].title && (
            <h2 className="text-3xl font-serif font-bold mb-6 text-blue-300 leading-tight">
              {slides[currentIndex].title}
            </h2>
          )}
          <div className="text-xl md:text-2xl font-medium leading-snug">
            {slides[currentIndex].content}
          </div>
        </div>
      </div>
      
      {/* Bottom Hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-white/40 text-sm font-medium tracking-widest uppercase pointer-events-none">
        Tap right to advance
      </div>
    </div>
  );
};
