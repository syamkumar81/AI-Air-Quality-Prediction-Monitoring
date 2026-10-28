import React from 'react';

export default function Skeleton({ className = '', variant = 'rect' }) {
  const variantStyles = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded-md h-4 w-full'
  };

  return (
    <div
      className={`relative overflow-hidden bg-slate-200/70 animate-pulse ${variantStyles[variant] || 'rounded-xl'} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}
