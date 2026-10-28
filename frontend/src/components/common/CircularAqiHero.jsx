import React, { useState, useEffect } from 'react';
import { getAqiCategory } from '../../utils/aqiUtils';
import CountUp from './CountUp';

export default function CircularAqiHero({ aqi, size = 195, className = "" }) {
  const currentAqi = aqi !== null && aqi !== undefined && !isNaN(Number(aqi)) ? Number(aqi) : null;
  const clampedAqi = currentAqi !== null ? Math.max(0, Math.min(500, currentAqi)) : 0;
  const category = getAqiCategory(clampedAqi);

  // SVG circle calculations
  const strokeWidth = 13;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Angle / percent around the circle (0 to 500 AQI -> 0% to 100%)
  const percentage = Math.min(100, Math.max(0, (clampedAqi / 500) * 100));
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  // One-time smooth draw-in animation on mount/load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedOffset(strokeDashoffset);
    }, 120);
    return () => clearTimeout(timer);
  }, [strokeDashoffset, circumference]);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Outer ambient glow ring */}
      <div 
        className="absolute inset-1 rounded-full opacity-25 filter blur-xl transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: category.color }}
      />

      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="heroCircularGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9B76" />
            <stop offset="50%" stopColor="#36C5F0" />
            <stop offset="100%" stopColor={category.color} />
          </linearGradient>
        </defs>

        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#13253B"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated colored progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#heroCircularGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center inner card with subtle glass background */}
      <div className="absolute inset-4 rounded-full bg-[#0B1724]/90 backdrop-blur-md border border-[#1E3A5F] shadow-inner flex flex-col items-center justify-center text-center p-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
          Current AQI
        </span>

        <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight leading-none mb-2">
          {currentAqi !== null ? <CountUp value={currentAqi} /> : "..."}
        </span>

        {currentAqi !== null ? (
          <span 
            className="text-[11px] font-bold px-3 py-0.5 rounded-full border shadow-sm leading-snug"
            style={{ 
              backgroundColor: `${category.color}20`, 
              color: category.color,
              borderColor: `${category.color}50`
            }}
          >
            {category.label}
          </span>
        ) : (
          <span className="w-16 h-5 rounded-full bg-[#13253B] animate-pulse" />
        )}

        {/* Live pulse dot */}
        <div className="absolute top-2.5 right-3.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0D9B76] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0D9B76]" />
        </div>
      </div>
    </div>
  );
}
