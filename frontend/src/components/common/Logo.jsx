import React from 'react';

export default function Logo({ size = "md", showText = true, className = "" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon: Leaf + Wind / Aerated air concept in Emerald Green (#0D9B76) & Cyan Blue (#36C5F0) */}
      <div className={`relative ${sizeClasses[size] || sizeClasses.md} flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0D9B76] via-[#10B981] to-[#36C5F0] p-2 shadow-md shadow-[#0D9B76]/30 border border-white/20`}>
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Environmental White/Cyan Leaf */}
          <path
            d="M10 28C10 28 12 19 20 14C25 10.5 31 8 33 4C30 9.5 27 15 21 20C16 24 10 28 10 28Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
          {/* Leaf Central Vein (Natural oxygen flow) */}
          <path
            d="M14 24C19 20 23 16 28 10"
            stroke="#0D9B76"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Fluid Wind Breeze Curve */}
          <path
            d="M6 13C10 13 14 10 18 10C23 10 27 12 31 12"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-white text-lg leading-tight">
              Ai <span className="bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] bg-clip-text text-transparent font-black">Air Quality</span>
            </span>
          </div>
          <span className="text-[9px] font-bold tracking-widest uppercase text-[#36C5F0]/90">
            MONITOR • PREDICT
          </span>
        </div>
      )}
    </div>
  );
}
