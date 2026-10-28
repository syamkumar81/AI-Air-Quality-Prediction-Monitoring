import React from 'react';
import {
  Home,
  Activity,
  Sparkles,
  BarChart3,
  BookOpen,
  ChevronRight,
  Leaf
} from 'lucide-react';
import Logo from '../common/Logo';

export default function Sidebar({ activePage, setActivePage, isMobileOpen, setIsMobileOpen }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, badge: null },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity, badge: 'LIVE' },
    { id: 'prediction', label: 'AQI Prediction', icon: Sparkles, badge: 'AI' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'about', label: 'About Project', icon: BookOpen, badge: null },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <aside className="h-full flex flex-col justify-between bg-[#0B1724] border-r border-[#1B3554] w-64 lg:w-72 flex-shrink-0 select-none shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
      {/* Background: Environmental City Illustration with Deep Navy Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-0 overflow-hidden">
        <img
          src="/eco_city_backdrop.jpg"
          alt="Environmental Skyline Background"
          className="w-full h-full object-cover object-bottom opacity-20 filter saturate-150 transition-transform duration-700"
        />
        {/* Deep Navy soft gradient blend */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1724] via-[#0B1724]/80 to-[#0B1724]" />
      </div>

      {/* Top Brand & Navigation Area (z-10 to stay above background) */}
      <div className="z-10 flex flex-col">
        {/* Brand Area */}
        <div className="p-6 pb-4">
          <Logo size="md" />

          {/* Clean Tagline Box with Deep Navy & Cyan/Emerald Highlights */}
          <div className="mt-4 px-3.5 py-2.5 rounded-xl bg-[#0F1F33]/90 backdrop-blur-md border border-[#1E3A5F] shadow-sm">
            <p className="text-xs font-bold text-[#0D9B76] leading-snug">
              Monitor Today.
            </p>
            <p className="text-xs font-semibold text-[#36C5F0] leading-snug">
              Predict Tomorrow.
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3.5 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group cursor-pointer relative border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] text-white border-white/20 shadow-lg shadow-[#0D9B76]/25 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-[#13253B] hover:border-[#1E3A5F] border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={`transition-transform duration-200 ${
                      isActive
                        ? 'text-white translate-x-0.5'
                        : 'text-slate-400 group-hover:text-[#36C5F0] group-hover:translate-x-0.5'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider transition-colors ${
                        isActive
                          ? 'bg-white/25 text-white border border-white/40'
                          : item.badge === 'LIVE'
                          ? 'bg-[#0D9B76]/20 text-[#36C5F0] border border-[#0D9B76]/40'
                          : 'bg-[#36C5F0]/20 text-[#36C5F0] border border-[#36C5F0]/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight size={15} className="text-white/90" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Environmental Footer Banner */}
      <div className="relative z-10 mt-auto p-4 pt-6">
        <div className="p-3.5 rounded-2xl bg-[#0F1F33]/90 backdrop-blur-md border border-[#1E3A5F] shadow-md flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0D9B76] to-[#36C5F0] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#0D9B76]/30">
            <Leaf size={15} />
          </div>
          <div className="leading-tight">
            <span className="text-xs font-black text-white block tracking-tight">
              Cleaner Air
            </span>
            <span className="text-[11px] font-bold text-[#36C5F0] block">
              Greener Tomorrow
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
