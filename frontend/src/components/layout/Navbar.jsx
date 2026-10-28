import React, { useState, useEffect } from 'react';
import { Menu, X, Clock, MapPin, Bell, User } from 'lucide-react';
import Logo from '../common/Logo';
import AqiBadge from '../common/AqiBadge';
import CountUp from '../common/CountUp';
import { STATION_INFO } from '../../data/mockData';
import { getLiveAQI } from '../../services/api';

export default function Navbar({ onMenuToggle, isMobileOpen, activePage, setActivePage }) {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [liveAqi, setLiveAqi] = useState(null);
  const [stationName, setStationName] = useState(STATION_INFO.name);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST'
      );
      setDateStr(
        now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchAqi = async () => {
      try {
        const res = await getLiveAQI(false);
        if (isMounted && res && res.status !== "error" && res.aqi !== undefined) {
          setLiveAqi(Math.round(res.aqi));
          if (res.station) setStationName(res.station);
        }
      } catch (err) {
        // preserve current state or null
      }
    };
    fetchAqi();
    const pollInterval = setInterval(fetchAqi, 60000); // 1-minute sync
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#0B1724]/90 backdrop-blur-md border-b border-[#1B3554] px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between transition-colors shadow-[0_2px_20px_rgba(0,0,0,0.45)]">
      {/* Left: Mobile Menu Toggle + Station Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-[#36C5F0] hover:bg-[#0F1F33] transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="lg:hidden">
          <Logo size="sm" showText={true} />
        </div>

        {/* Global Station Information */}
        <div className="hidden lg:flex items-center gap-3 bg-[#0F1F33]/90 px-3.5 py-1.5 rounded-2xl border border-[#1E3A5F]">
          <div className="w-8 h-8 rounded-xl bg-[#0D9B76]/15 text-[#36C5F0] flex items-center justify-center flex-shrink-0 border border-[#36C5F0]/30 shadow-sm">
            <MapPin size={16} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Station: {stationName}
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400">
              CPCB Station 2586 | Manali, Chennai
            </span>
          </div>
        </div>
      </div>

      {/* Right: Time + Live AQI Capsule + Icons */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Clock & Date Capsule */}
        <div
          className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-300 bg-[#0F1F33]/90 px-3 py-1.5 rounded-2xl border border-[#1E3A5F] shadow-sm"
          title="Current Indian Standard Time"
        >
          <Clock size={15} className="text-[#36C5F0]" />
          <div className="flex flex-col text-right leading-tight">
            <span className="font-bold text-[#36C5F0] font-mono text-[11px]">{timeStr || 'IST'}</span>
            <span className="text-[10px] text-slate-400 font-mono">{dateStr}</span>
          </div>
        </div>

        {/* Dynamic LIVE AQI Capsule */}
        <div
          className="flex items-center gap-2.5 bg-[#0F1F33] px-3.5 py-1.5 rounded-2xl border border-[#1E3A5F] shadow-sm hover:border-[#36C5F0]/60 hover:shadow-[0_0_15px_rgba(54,197,240,0.25)] transition-all cursor-pointer"
          onClick={() => setActivePage && setActivePage('monitoring')}
          title="Click to view live monitoring"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0D9B76] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0D9B76]" />
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              LIVE AQI
            </span>
            <span className="text-base font-black text-white font-mono">
              {liveAqi !== null ? <CountUp value={liveAqi} /> : "..."}
            </span>
          </div>
          {liveAqi !== null ? (
            <AqiBadge aqi={liveAqi} size="sm" showDot={false} />
          ) : (
            <span className="w-16 h-5 rounded-full bg-[#13253B] animate-pulse" />
          )}
        </div>

        {/* Notifications Icon Button */}
        <button
          className="w-9 h-9 rounded-2xl bg-[#0F1F33] border border-[#1E3A5F] text-slate-300 hover:text-[#36C5F0] hover:border-[#36C5F0]/50 flex items-center justify-center transition-all shadow-sm cursor-pointer"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>

        {/* User Profile Button */}
        <button
          className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#0D9B76]/20 to-[#36C5F0]/30 border border-[#36C5F0]/40 text-[#36C5F0] hover:border-[#36C5F0] flex items-center justify-center transition-all shadow-sm cursor-pointer"
          title="User Profile"
          aria-label="User Profile"
        >
          <User size={16} />
        </button>
      </div>
    </header>
  );
}
