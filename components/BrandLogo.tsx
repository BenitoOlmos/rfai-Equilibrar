import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
}

export const BrandLogo: React.FC<LogoProps> = ({ className = "w-32", variant = 'color' }) => {
  const textColor = variant === 'light' ? 'fill-white' : variant === 'dark' ? 'fill-slate-800' : 'fill-[#00839b]';
  const strokeColor = variant === 'light' ? '#ffffff' : '#0097b2';

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Brush Strokes Circle */}
        <defs>
          <filter id="brush-texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
          </filter>
        </defs>
        
        <g filter="url(#brush-texture)" className="opacity-90">
          {/* Top Arc */}
          <path 
            d="M 40 100 A 60 60 0 1 1 170 80" 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="8" 
            strokeLinecap="round"
            strokeDasharray="200 40"
            className="drop-shadow-sm"
          />
          {/* Bottom Arc Accent */}
          <path 
            d="M 45 130 A 65 65 0 0 0 160 140" 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="6" 
            strokeLinecap="round"
            className="opacity-70"
          />
        </g>
        
        {/* Text Center */}
        <text x="100" y="95" textAnchor="middle" className={`text-[10px] font-medium tracking-[0.2em] uppercase ${textColor} opacity-70`} style={{fontFamily: 'Montserrat'}}>
          Centro Clínico
        </text>
        <text x="100" y="115" textAnchor="middle" className={`text-[24px] font-bold tracking-widest uppercase ${textColor}`} style={{fontFamily: 'Montserrat'}}>
          Equilibrar
        </text>
      </svg>
    </div>
  );
};