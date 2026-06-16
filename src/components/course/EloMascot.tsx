import React from 'react';

interface EloMascotProps {
  type: string;
}

export const EloMascot: React.FC<EloMascotProps> = ({ type }) => {
  // Normalize types
  const slideType = type.toUpperCase();

  // Helper keyframes in style block for premium micro-animations
  const animationStyles = (
    <style>{`
      @keyframes elo-float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(1deg); }
      }
      @keyframes eye-pulse {
        0%, 100% { opacity: 0.95; transform: scaleY(1); }
        50% { opacity: 0.7; transform: scaleY(0.9); }
        98% { transform: scaleY(1); }
        99% { transform: scaleY(0.1); } /* Blink! */
      }
      @keyframes prop-rotate {
        0%, 100% { transform: rotate(-5deg) translateY(0); }
        50% { transform: rotate(5deg) translateY(-4px); }
      }
      @keyframes wave-pulse {
        0%, 100% { transform: scale(0.9); opacity: 0.3; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
      @keyframes star-spin {
        0% { transform: rotate(0deg) scale(0.8); }
        50% { transform: rotate(180deg) scale(1.1); }
        100% { transform: rotate(360deg) scale(0.8); }
      }
      
      .elo-mascot-container {
        animation: elo-float 5s infinite ease-in-out;
      }
      .elo-eyes {
        animation: eye-pulse 4s infinite ease-in-out;
        transform-origin: center;
      }
      .elo-prop {
        animation: prop-rotate 3s infinite ease-in-out;
        transform-origin: center;
      }
      .elo-star {
        animation: star-spin 6s infinite linear;
        transform-origin: center;
      }
      .elo-wave {
        animation: wave-pulse 2s infinite ease-in-out;
        transform-origin: center;
      }
    `}</style>
  );

  // Default shared robot body SVG definitions
  const RobotBase = ({ children, propOffset = "translate(0,0)" }: { children?: React.ReactNode, propOffset?: string }) => (
    <svg 
      viewBox="0 0 240 280" 
      className="w-full h-full max-w-[220px] md:max-w-[240px] drop-shadow-[0_10px_25px_rgba(59,130,246,0.25)]" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Head Gradient */}
        <linearGradient id="headGrad" x1="0" y1="0" x2="240" y2="280">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="60%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
        {/* Screen / Face Gradient */}
        <linearGradient id="faceGrad" x1="40" y1="50" x2="200" y2="170">
          <stop offset="0%" stopColor="#0B132B" />
          <stop offset="100%" stopColor="#1C2541" />
        </linearGradient>
        {/* Cyan Eye Glow */}
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="70%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0891B2" stopOpacity="0" />
        </radialGradient>
        {/* Metal Limb Gradient */}
        <linearGradient id="limbGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        {/* Gold Trophy/Stars Gradient */}
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
        {/* Globe Blue/Green Gradients */}
        <radialGradient id="oceanGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </radialGradient>
      </defs>

      {/* Background soft glow */}
      <circle cx="120" cy="120" r="80" fill="url(#eyeGlow)" opacity="0.15" className="elo-wave" />

      {/* Floating Arms / Limbs */}
      {/* Left arm - resting */}
      <path d="M40 160 C 25 180, 20 200, 35 210 C 45 205, 50 185, 55 170" fill="url(#limbGrad)" stroke="#334155" strokeWidth="2" />
      {/* Right arm - resting default */}
      {slideType !== 'INTRO' && slideType !== 'REVIEW' && (
        <path d="M200 160 C 215 180, 220 200, 205 210 C 195 205, 190 185, 185 170" fill="url(#limbGrad)" stroke="#334155" strokeWidth="2" />
      )}

      {/* Body / Neck Base */}
      <path d="M100 185 L140 185 L130 220 L110 220 Z" fill="url(#limbGrad)" stroke="#334155" strokeWidth="3" />
      {/* Curved chest segment */}
      <path d="M75 210 C 75 195, 165 195, 165 210 L155 260 C 155 265, 85 265, 85 260 Z" fill="url(#headGrad)" stroke="#334155" strokeWidth="4" />
      
      {/* Glowing heart/core indicator */}
      <circle cx="120" cy="235" r="10" fill="#22D3EE" className="elo-wave" />
      <circle cx="120" cy="235" r="6" fill="#FFFFFF" />

      {/* Main Head */}
      <rect x="50" y="45" width="140" height="135" rx="40" fill="url(#headGrad)" stroke="#334155" strokeWidth="5" />
      
      {/* Screen / Face */}
      <rect x="65" y="60" width="110" height="105" rx="28" fill="url(#faceGrad)" stroke="#1E293B" strokeWidth="3" />

      {/* Glowing Cyan Eyes */}
      <g className="elo-eyes">
        {/* Left eye */}
        <circle cx="98" cy="108" r="18" fill="url(#eyeGlow)" />
        <circle cx="98" cy="108" r="12" fill="#22D3EE" />
        <circle cx="94" cy="104" r="4" fill="#FFFFFF" />
        
        {/* Right eye */}
        <circle cx="142" cy="108" r="18" fill="url(#eyeGlow)" />
        <circle cx="142" cy="108" r="12" fill="#22D3EE" />
        <circle cx="138" cy="104" r="4" fill="#FFFFFF" />
      </g>

      {/* Cheerful blushing cheeks */}
      <circle cx="78" cy="138" r="8" fill="#F43F5E" opacity="0.4" />
      <circle cx="162" cy="138" r="8" fill="#F43F5E" opacity="0.4" />

      {/* Smiling Mouth */}
      <path d="M108 132 Q120 142 132 132" stroke="#22D3EE" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* Custom items & Accessories mapped based on type */}
      {children}
    </svg>
  );

  // Render specific layout based on slide type
  switch (slideType) {
    case 'INTRO':
      return (
        <div className="relative flex flex-col items-center justify-center p-4 h-full">
          {animationStyles}
          <div className="elo-mascot-container flex items-center justify-center w-full h-full">
            <RobotBase>
              {/* Arm waving waving hello */}
              <path 
                d="M200 160 C 220 140, 240 100, 235 90 C 220 85, 205 125, 185 150" 
                fill="url(#limbGrad)" 
                stroke="#334155" 
                strokeWidth="2" 
                className="elo-prop"
              />
              {/* Hand greeting sign "Hey!" */}
              <g className="elo-prop" style={{ transform: 'translate(225px, 75px) scale(0.9)' }}>
                <rect x="-22" y="-20" width="44" height="28" rx="8" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                <text x="0" y="-2" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">Hey! 👋</text>
              </g>
            </RobotBase>
          </div>
        </div>
      );

    case 'VOCAB':
      return (
        <div className="relative flex flex-col items-center justify-center p-4 h-full">
          {animationStyles}
          <div className="elo-mascot-container flex items-center justify-center w-full h-full">
            <RobotBase>
              {/* Pointer stick & Alphabet Blocks */}
              <g className="elo-prop" style={{ transform: 'translate(195px, 155px)' }}>
                {/* Arm holding pointer */}
                <path d="M0 0 C 15 15, 35 -10, 45 -40" stroke="url(#limbGrad)" strokeWidth="8" strokeLinecap="round" fill="none" />
                {/* Pointer stick */}
                <path d="M45 -40 L 70 -90" stroke="#EAB308" strokeWidth="4" strokeLinecap="round" />
                {/* Mini A-B-C alphabet cards */}
                <g style={{ transform: 'translate(60px, -110px)' }}>
                  <rect x="-12" y="-12" width="24" height="24" rx="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="0" y="5" fill="#FFFFFF" fontSize="13" fontWeight="extrabold" textAnchor="middle">A</text>
                </g>
                <g style={{ transform: 'translate(86px, -98px) rotate(15deg)' }}>
                  <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="0" y="4" fill="#FFFFFF" fontSize="11" fontWeight="extrabold" textAnchor="middle">B</text>
                </g>
              </g>
            </RobotBase>
          </div>
        </div>
      );

    case 'CONCEPT':
      return (
        <div className="relative flex flex-col items-center justify-center p-4 h-full">
          {animationStyles}
          <div className="elo-mascot-container flex items-center justify-center w-full h-full">
            <RobotBase>
              {/* Thinking lightbulb accessory */}
              <g className="elo-prop">
                {/* Soft yellow radial bulb glow */}
                <circle cx="120" cy="15" r="28" fill="#FDE047" opacity="0.25" className="elo-wave" />
                {/* Lightbulb stem and glass */}
                <path d="M120 -8 C 108 -8, 102 12, 112 20 L112 28 L128 28 L128 20 C 138 12, 132 -8, 120 -8 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="2.5" />
                <path d="M115 28 L125 28 L125 32 L115 32 Z" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
                {/* Glowing filament */}
                <path d="M116 8 Q120 0 124 8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
                <circle cx="120" cy="15" r="3" fill="#FFFFFF" />
              </g>
              {/* Thinking pose arm (touching chin) */}
              <path d="M40 160 C 25 180, 50 200, 75 160" fill="url(#limbGrad)" stroke="#334155" strokeWidth="2" />
            </RobotBase>
          </div>
        </div>
      );

    case 'CULTURE':
      return (
        <div className="relative flex flex-col items-center justify-center p-4 h-full">
          {animationStyles}
          <div className="elo-mascot-container flex items-center justify-center w-full h-full">
            <RobotBase>
              {/* Safari explorer sunglasses on screen */}
              <g style={{ transform: 'translate(68px, 90px)' }} opacity="0.85">
                {/* Left lens */}
                <rect x="0" y="0" width="46" height="28" rx="8" fill="#CA8A04" stroke="#FDE047" strokeWidth="2" />
                {/* Right lens */}
                <rect x="58" y="0" width="46" height="28" rx="8" fill="#CA8A04" stroke="#FDE047" strokeWidth="2" />
                {/* Bridge */}
                <path d="M46 10 L58 10" stroke="#FDE047" strokeWidth="3" />
              </g>
              {/* Globe in hand */}
              <g className="elo-prop" style={{ transform: 'translate(195px, 165px)' }}>
                <path d="M0 0 C 15 15, 30 -5, 40 -25" stroke="url(#limbGrad)" strokeWidth="7" strokeLinecap="round" fill="none" />
                {/* The Globe */}
                <g style={{ transform: 'translate(45px, -35px)' }}>
                  <circle cx="0" cy="0" r="22" fill="url(#oceanGrad)" stroke="#FFFFFF" strokeWidth="1.5" />
                  {/* Landmass green blobs */}
                  <path d="M-12 -8 C -15 -2, -8 4, -4 0 C 0 -4, 4 -12, -4 -12 Z" fill="#10B981" />
                  <path d="M6 4 C 12 -4, 15 8, 8 12 C 2 10, -4 8, 6 4 Z" fill="#10B981" />
                </g>
              </g>
            </RobotBase>
          </div>
        </div>
      );

    case 'DRILL':
      return (
        <div className="relative flex flex-col items-center justify-center p-4 h-full">
          {animationStyles}
          <div className="elo-mascot-container flex items-center justify-center w-full h-full">
            <RobotBase>
              {/* Over-ear headphones on head */}
              <path d="M50 110 C 50 30, 190 30, 190 110" stroke="#334155" strokeWidth="10" strokeLinecap="round" fill="none" />
              {/* Headphone ear pads */}
              <rect x="38" y="90" width="18" height="36" rx="8" fill="#1E293B" stroke="#60A5FA" strokeWidth="2" />
              <rect x="184" y="90" width="18" height="36" rx="8" fill="#1E293B" stroke="#60A5FA" strokeWidth="2" />
              
              {/* Floating audio wave lines in the background */}
              <g style={{ transform: 'translate(200px, 120px)' }} className="elo-wave">
                <rect x="5" y="-15" width="4" height="30" rx="2" fill="#22D3EE" />
                <rect x="13" y="-25" width="4" height="50" rx="2" fill="#60A5FA" />
                <rect x="21" y="-8" width="4" height="16" rx="2" fill="#3B82F6" />
              </g>
              <g style={{ transform: 'translate(10px, 120px)' }} className="elo-wave">
                <rect x="-5" y="-15" width="4" height="30" rx="2" fill="#22D3EE" />
                <rect x="-13" y="-8" width="4" height="16" rx="2" fill="#60A5FA" />
                <rect x="-21" y="-22" width="4" height="44" rx="2" fill="#3B82F6" />
              </g>
            </RobotBase>
          </div>
        </div>
      );

    case 'ROLEPLAY':
      return (
        <div className="relative flex flex-col items-center justify-center p-4 h-full">
          {animationStyles}
          <div className="elo-mascot-container flex items-center justify-center w-full h-full">
            <RobotBase>
              {/* Speaking headset mic */}
              <path d="M50 110 C 40 140, 75 160, 105 145" stroke="#475569" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="108" cy="144" r="5" fill="#22D3EE" className="elo-wave" />
              
              {/* Speaking bubble on top right */}
              <g className="elo-prop" style={{ transform: 'translate(205px, 50px)' }}>
                {/* Speech Bubble Tail */}
                <path d="M-8 15 L-22 24 L-15 10 Z" fill="#22D3EE" />
                {/* Bubble Body */}
                <rect x="-10" y="-18" width="60" height="32" rx="10" fill="#22D3EE" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="20" y="2" fill="#0B132B" fontSize="10" fontWeight="extrabold" textAnchor="middle">YOUR TURN!</text>
              </g>
            </RobotBase>
          </div>
        </div>
      );

    case 'REVIEW':
      return (
        <div className="relative flex flex-col items-center justify-center p-4 h-full">
          {animationStyles}
          <div className="elo-mascot-container flex items-center justify-center w-full h-full">
            <RobotBase>
              {/* Graduation Cap on top of head */}
              <g style={{ transform: 'translate(120px, 46px)' }}>
                {/* Diamond top */}
                <polygon points="0,-18 52,-2 -2,-2 -52,-2" fill="#1E293B" stroke="#FFFFFF" strokeWidth="2.5" />
                <polygon points="0,-18 54,-2 0,14 -54,-2" fill="#1E293B" />
                {/* Cap base skullcap */}
                <path d="M-22 -2 L-22 8 C-22 14, 22 14, 22 8 L22 -2" fill="#0F172A" />
                {/* Golden hanging tassel */}
                <path d="M12 -2 L28 4 L30 18" stroke="#EAB308" strokeWidth="2" fill="none" />
                <circle cx="30" cy="19" r="3.5" fill="#EAB308" />
              </g>

              {/* Gold Trophy in right arm */}
              <g className="elo-prop" style={{ transform: 'translate(195px, 160px)' }}>
                {/* Raised arm holding cup */}
                <path d="M0 0 C 15 -15, 30 -30, 45 -45" stroke="url(#limbGrad)" strokeWidth="8" strokeLinecap="round" fill="none" />
                {/* The Golden Trophy */}
                <g style={{ transform: 'translate(45px, -55px)' }}>
                  <path d="M-14 -18 L14 -18 L10 5 C10 12, -10 12, -10 5 Z" fill="url(#goldGrad)" stroke="#FFFFFF" strokeWidth="1" />
                  {/* Stem and Base */}
                  <path d="M-4 10 L4 10 L4 16 L-4 16 Z" fill="url(#goldGrad)" />
                  <rect x="-10" y="16" width="20" height="6" rx="1" fill="#CA8A04" />
                  {/* Handles */}
                  <path d="M-14 -10 Q-22 -10 -14 -4" stroke="url(#goldGrad)" strokeWidth="2.5" fill="none" />
                  <path d="M14 -10 Q22 -10 14 -4" stroke="url(#goldGrad)" strokeWidth="2.5" fill="none" />
                </g>
              </g>

              {/* Sparkle stars around */}
              <g className="elo-star" style={{ transform: 'translate(40px, 40px)' }}>
                <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#FDE047" />
              </g>
              <g className="elo-star" style={{ transform: 'translate(210px, 140px) scale(0.7)' }}>
                <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#FDE047" />
              </g>
            </RobotBase>
          </div>
        </div>
      );

    default:
      return (
        <div className="relative flex flex-col items-center justify-center p-4 h-full">
          {animationStyles}
          <div className="elo-mascot-container flex items-center justify-center w-full h-full">
            <RobotBase />
          </div>
        </div>
      );
  }
};
