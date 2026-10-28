import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-[#0B1724] border-t border-[#1E3A5F] mt-auto select-none py-6 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          {/* Brand & Tagline */}
          <div className="text-center md:text-left">
            <span className="font-extrabold text-white text-sm tracking-tight block">
              Ai <span className="text-[#36C5F0]">Air Quality</span>
            </span>
            <span className="text-[#0D9B76] font-semibold text-xs">
              Monitor Today. Predict Tomorrow.
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-5 text-xs font-semibold text-slate-400 flex-wrap justify-center">
            <button onClick={() => onNavigate && onNavigate('home')} className="hover:text-[#36C5F0] transition-colors cursor-pointer">
              Home
            </button>
            <button onClick={() => onNavigate && onNavigate('monitoring')} className="hover:text-[#36C5F0] transition-colors cursor-pointer">
              Live Monitoring
            </button>
            <button onClick={() => onNavigate && onNavigate('prediction')} className="hover:text-[#36C5F0] transition-colors cursor-pointer">
              AQI Prediction
            </button>
            <button onClick={() => onNavigate && onNavigate('analytics')} className="hover:text-[#36C5F0] transition-colors cursor-pointer">
              Analytics
            </button>
            <button onClick={() => onNavigate && onNavigate('about')} className="hover:text-[#36C5F0] transition-colors cursor-pointer">
              About Project
            </button>
          </div>

          {/* Team, Mentor & Copyright */}
          <div className="text-center md:text-right space-y-0.5">
            <p className="text-slate-300 font-medium">
              Team: <strong className="text-white">Syam Kumar</strong> • <strong className="text-white">Venkata Charan Teja</strong> • <strong className="text-white">Vishnu Vardhan</strong>
            </p>
            <p className="text-slate-400 text-[11px]">
              Mentor: <strong className="text-slate-200">Selvarengan</strong>
            </p>
            <p className="text-slate-500 text-[10px] pt-1">
              © 2026 AI Air Quality • Environmental Monitoring & Forecasting
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
