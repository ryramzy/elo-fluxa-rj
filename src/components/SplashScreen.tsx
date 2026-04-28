/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'fade-in' | 'slide-up' | 'glow' | 'fade-out'>('fade-in');

  useEffect(() => {
    const sequence = [
      { phase: 'fade-in', duration: 300 },
      { phase: 'slide-up', duration: 200 },
      { phase: 'glow', duration: 400 },
      { phase: 'fade-out', duration: 300 }
    ];

    let currentIndex = 0;
    
    const timer = setInterval(() => {
      if (currentIndex < sequence.length) {
        setAnimationPhase(sequence[currentIndex].phase);
        currentIndex++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setIsVisible(false);
          onComplete();
        }, 300);
      }
    }, sequence[currentIndex]?.duration || 300);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    // Add letter-by-letter reveal effect
    if (animationPhase === 'glow') {
      const letters = document.querySelectorAll('.elo-letter');
      letters.forEach((letter, index) => {
        setTimeout(() => {
          letter.classList.add('letter-reveal');
        }, index * 100);
      });
    }
  }, [animationPhase]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]">
      <div 
        className={`
          transition-all duration-300
          ${animationPhase === 'fade-in' ? 'opacity-0 translate-y-6' : ''}
          ${animationPhase === 'slide-up' ? 'opacity-100 translate-y-0' : ''}
          ${animationPhase === 'glow' ? 'opacity-100' : ''}
          ${animationPhase === 'fade-out' ? 'opacity-0' : ''}
        `}
      >
        <div className="relative">
          <h1 className="text-6xl md:text-7xl font-bold text-white relative">
            {'Elo!'.split('').map((letter, index) => (
              <span
                key={index}
                className="elo-letter inline-block transition-all duration-500"
                style={{
                  opacity: animationPhase === 'glow' ? 0 : 1,
                  transform: animationPhase === 'glow' ? 'translateY(10px)' : 'translateY(0)',
                }}
              >
                {letter}
              </span>
            ))}
            
            {/* Glow effect behind text */}
            <div 
              className={`
                absolute inset-0 -z-10 transition-all duration-400
                ${animationPhase === 'glow' ? 'opacity-100' : 'opacity-0'}
              `}
              style={{
                background: 'radial-gradient(circle, center, transparent, rgba(91, 164, 245, 0.3), transparent)',
                filter: 'blur(20px)',
                transform: animationPhase === 'glow' ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          </h1>
        </div>
      </div>

      <style jsx>{`
        .elo-letter {
          transition: all 0.3s ease;
        }
        
        .letter-reveal {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        
        @keyframes letterPulse {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }
        
        .elo-letter:not(:first-child) {
          animation: letterPulse 2s ease-in-out infinite;
          animation-delay: 0.1s;
        }
      `}</style>
    </div>
  );
}
