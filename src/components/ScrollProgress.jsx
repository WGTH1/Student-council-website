'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { settings } = useTheme();

  useEffect(() => {
    const updateScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const currentProgress = (window.scrollY / scrollHeight) * 100;
        setProgress(Math.round(currentProgress));
      }
      
      // Show only when scrolled a bit
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', updateScroll);
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  return (
    <div 
      className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative w-16 h-16 flex items-center justify-center group">
        {/* Glowing Background Ring */}
        <div 
          className="absolute inset-0 rounded-full blur-md opacity-20 transition-all duration-500 group-hover:opacity-40"
          style={{ backgroundColor: settings.theme_color }}
        ></div>
        
        {/* SVG Progress Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="text-zinc-800"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={175.9}
            strokeDashoffset={175.9 - (175.9 * progress) / 100}
            strokeLinecap="round"
            style={{ color: settings.theme_color }}
            className="transition-all duration-200 ease-out"
          />
        </svg>

        {/* Percentage Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-full border border-white/5">
          <span className="text-[11px] font-black italic tracking-tighter leading-none">
            {progress}%
          </span>
          <span className="text-[6px] font-black uppercase text-zinc-500 tracking-[0.2em] mt-0.5">
            Load
          </span>
        </div>

        {/* Hover Effect: Pulse */}
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-0 group-hover:opacity-10 pointer-events-none"
          style={{ backgroundColor: settings.theme_color }}
        ></div>
      </div>
    </div>
  );
}
