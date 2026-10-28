import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Sparkles, 
  ArrowRight, 
  BarChart2, 
  Leaf, 
  Wind, 
  TrendingUp, 
  CloudFog, 
  Droplets, 
  Flame, 
  Zap 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  LabelList, 
  CartesianGrid 
} from 'recharts';
import AqiBadge from '../common/AqiBadge';
import CountUp from '../common/CountUp';
import Skeleton from '../common/Skeleton';
import Sparkline from '../common/Sparkline';
import { getAqiCategory, POLLUTANT_THRESHOLDS } from '../../utils/aqiUtils';
import { getLiveAQI, getAnalytics } from '../../services/api';
import { motion } from 'framer-motion';

// Data-driven pollutant status & progress percentage based on applicable standard limit
function getPollutantStatusAndPercent(val, limit) {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return {
      label: "...",
      color: "#94a3b8",
      dotBg: "bg-slate-500",
      textColor: "text-slate-400",
      badgeBg: "bg-slate-800/60",
      badgeBorder: "border-slate-700",
      percent: 0,
      displayPercent: 0
    };
  }
  const num = Number(val);
  const rawPct = (num / limit) * 100;
  const clampedPercent = Math.min(100, Math.max(0, rawPct));
  const roundedPercent = Math.round(rawPct * 10) / 10;

  let label = "Good";
  let color = "#0D9B76"; // Emerald Green
  let dotBg = "bg-[#0D9B76]";
  let textColor = "text-[#36C5F0]";
  let badgeBg = "bg-[#0D9B76]/15";
  let badgeBorder = "border-[#0D9B76]/40";

  if (rawPct > 100) {
    label = "Exceeding";
    color = "#EF4444";
    dotBg = "bg-rose-500";
    textColor = "text-rose-400";
    badgeBg = "bg-rose-950/50";
    badgeBorder = "border-rose-500/40";
  } else if (rawPct > 85) {
    label = "Watch";
    color = "#F97316";
    dotBg = "bg-orange-500";
    textColor = "text-orange-400";
    badgeBg = "bg-orange-950/50";
    badgeBorder = "border-orange-500/40";
  } else if (rawPct > 50) {
    label = "Moderate";
    color = "#EAB308";
    dotBg = "bg-yellow-500";
    textColor = "text-yellow-400";
    badgeBg = "bg-yellow-950/50";
    badgeBorder = "border-yellow-500/40";
  }

  return {
    label,
    color,
    dotBg,
    textColor,
    badgeBg,
    badgeBorder,
    percent: clampedPercent,
    displayPercent: roundedPercent
  };
}

export default function HomePage({ onNavigate }) {
  const [liveData, setLiveData] = useState({
    currentAqi: null,
    nextHourAqi: null,
    dominantPollutant: 'PM2.5',
    dominantValue: null,
    dominantUnit: 'µg/m³',
    station: 'Manali, Chennai - CPCB',
    timestamp: 'Just now',
    connected: false
  });

  const [pollutants, setPollutants] = useState({
    pm25: null,
    pm10: null,
    no2: null,
    so2: null,
    co: null,
    o3: null
  });

  const [pollutantHistory, setPollutantHistory] = useState({});
  const [trendData, setTrendData] = useState([]);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getLiveAQI(false)
      .then((res) => {
        if (isMounted && res) {
          const aqiVal = res.aqi !== undefined ? Math.round(res.aqi) : null;
          const predVal = res.prediction?.predicted_aqi ? Math.round(res.prediction.predicted_aqi) : null;
          const p = res.pollutants || {};

          setLiveData({
            currentAqi: aqiVal,
            nextHourAqi: predVal,
            dominantPollutant: res.dominant_pollutant || 'PM2.5',
            dominantValue: p[res.dominant_pollutant ? res.dominant_pollutant.replace('.', '') : 'PM25'] || p.PM25 || null,
            dominantUnit: res.dominant_pollutant === 'CO' ? 'mg/m³' : 'µg/m³',
            station: res.station || 'Manali, Chennai - CPCB',
            timestamp: res.timestamp ? new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST' : 'Live',
            connected: !res.demo_mode
          });

          setPollutants({
            pm25: p.PM25 !== undefined ? p.PM25 : null,
            pm10: p.PM10 !== undefined ? p.PM10 : null,
            no2: p.NO2 !== undefined ? p.NO2 : null,
            so2: p.SO2 !== undefined ? p.SO2 : null,
            co: p.CO !== undefined ? p.CO : null,
            o3: p.O3 !== undefined ? p.O3 : null
          });
        }
      })
      .catch(() => {});

    getAnalytics()
      .then((res) => {
        if (isMounted && res) {
          if (res.aqi_trend && res.aqi_trend.length > 0) {
            setTrendData(res.aqi_trend);
          }
          if (res.pollutant_trends) {
            const hist = {};
            for (const [key, vals] of Object.entries(res.pollutant_trends)) {
              hist[key] = (vals || []).slice(-8);
            }
            setPollutantHistory(hist);
          }
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  const currentAqi = liveData.currentAqi;
  const nextHourAqi = liveData.nextHourAqi;
  const currentCategory = currentAqi !== null ? getAqiCategory(currentAqi) : null;

  const domKey = liveData.dominantPollutant ? liveData.dominantPollutant.toLowerCase().replace('.', '') : 'pm25';
  const domThreshold = POLLUTANT_THRESHOLDS[domKey] || POLLUTANT_THRESHOLDS.pm25;
  const domStatus = getPollutantStatusAndPercent(liveData.dominantValue, domThreshold.standard);
  const domSparkline = domKey === 'pm25' 
    ? pollutantHistory.PM25 
    : (domKey === 'pm10' ? pollutantHistory.PM10 : (pollutantHistory[domKey.toUpperCase()] || []));

  // 6 Criteria Pollutant Telemetry Cards
  const telemetryCards = [
    {
      key: 'pm25',
      name: 'PM2.5',
      desc: 'Fine particles',
      value: pollutants.pm25,
      unit: 'µg/m³',
      standard: 60,
      decimals: 1,
      icon: Wind,
      iconColor: 'text-[#0D9B76]',
      iconBg: 'bg-[#0D9B76]/15',
      color: '#0D9B76',
      hoverGlow: 'hover:shadow-[0_12px_28px_-4px_rgba(13,155,118,0.35)] hover:border-[#0D9B76]/80',
      historyKey: 'PM25'
    },
    {
      key: 'pm10',
      name: 'PM10',
      desc: 'Coarse dust',
      value: pollutants.pm10,
      unit: 'µg/m³',
      standard: 100,
      decimals: 1,
      icon: CloudFog,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-950/40',
      color: '#EAB308',
      hoverGlow: 'hover:shadow-[0_12px_28px_-4px_rgba(234,179,8,0.35)] hover:border-amber-400/80',
      historyKey: 'PM10'
    },
    {
      key: 'no2',
      name: 'NO₂',
      desc: 'Nitrogen dioxide',
      value: pollutants.no2,
      unit: 'µg/m³',
      standard: 80,
      decimals: 2,
      icon: Activity,
      iconColor: 'text-[#36C5F0]',
      iconBg: 'bg-[#36C5F0]/15',
      color: '#36C5F0',
      hoverGlow: 'hover:shadow-[0_12px_28px_-4px_rgba(54,197,240,0.35)] hover:border-[#36C5F0]/80',
      historyKey: 'NO2'
    },
    {
      key: 'so2',
      name: 'SO₂',
      desc: 'Sulfur dioxide',
      value: pollutants.so2,
      unit: 'µg/m³',
      standard: 80,
      decimals: 2,
      icon: Droplets,
      iconColor: 'text-cyan-300',
      iconBg: 'bg-cyan-950/40',
      color: '#22D3EE',
      hoverGlow: 'hover:shadow-[0_12px_28px_-4px_rgba(34,211,238,0.35)] hover:border-cyan-300/80',
      historyKey: 'SO2'
    },
    {
      key: 'co',
      name: 'CO',
      desc: 'Carbon monoxide',
      value: pollutants.co,
      unit: 'mg/m³',
      standard: 2.0,
      decimals: 4,
      icon: Flame,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-950/40',
      color: '#A855F7',
      hoverGlow: 'hover:shadow-[0_12px_28px_-4px_rgba(168,85,247,0.35)] hover:border-purple-400/80',
      historyKey: 'CO'
    },
    {
      key: 'o3',
      name: 'O₃',
      desc: 'Surface ozone',
      value: pollutants.o3,
      unit: 'µg/m³',
      standard: 100,
      decimals: 2,
      icon: Zap,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-950/40',
      color: '#14B8A6',
      hoverGlow: 'hover:shadow-[0_12px_28px_-4px_rgba(20,184,166,0.35)] hover:border-emerald-400/80',
      historyKey: 'O3'
    },
  ];

  // Full-width Pollutant Comparison Bar Data
  const pollutantComparisonData = [
    {
      name: "PM2.5",
      fullName: "Fine Particulate Matter",
      value: pollutants.pm25 !== null ? Number(pollutants.pm25) : 0,
      unit: "µg/m³",
      displayLabel: pollutants.pm25 !== null ? `${pollutants.pm25} µg/m³` : "0",
      limit: 60,
      color: "#0D9B76",
      gradientId: "pm25Grad"
    },
    {
      name: "PM10",
      fullName: "Respirable Coarse Dust",
      value: pollutants.pm10 !== null ? Number(pollutants.pm10) : 0,
      unit: "µg/m³",
      displayLabel: pollutants.pm10 !== null ? `${pollutants.pm10} µg/m³` : "0",
      limit: 100,
      color: "#EAB308",
      gradientId: "pm10Grad"
    },
    {
      name: "NO₂",
      fullName: "Nitrogen Dioxide",
      value: pollutants.no2 !== null ? Number(pollutants.no2) : 0,
      unit: "µg/m³",
      displayLabel: pollutants.no2 !== null ? `${pollutants.no2} µg/m³` : "0",
      limit: 80,
      color: "#36C5F0",
      gradientId: "no2Grad"
    },
    {
      name: "SO₂",
      fullName: "Sulfur Dioxide",
      value: pollutants.so2 !== null ? Number(pollutants.so2) : 0,
      unit: "µg/m³",
      displayLabel: pollutants.so2 !== null ? `${pollutants.so2} µg/m³` : "0",
      limit: 80,
      color: "#22D3EE",
      gradientId: "so2Grad"
    },
    {
      name: "CO",
      fullName: "Carbon Monoxide",
      value: pollutants.co !== null ? Number(pollutants.co) : 0,
      unit: "mg/m³",
      displayLabel: pollutants.co !== null ? `${pollutants.co} mg/m³` : "0",
      limit: 2.0,
      color: "#A855F7",
      gradientId: "coGrad"
    },
    {
      name: "O₃",
      fullName: "Surface Ozone",
      value: pollutants.o3 !== null ? Number(pollutants.o3) : 0,
      unit: "µg/m³",
      displayLabel: pollutants.o3 !== null ? `${pollutants.o3} µg/m³` : "0",
      limit: 100,
      color: "#14B8A6",
      gradientId: "o3Grad"
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ================================================== */}
      {/* 1. HERO SECTION                                   */}
      {/* ================================================== */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-3xl relative overflow-hidden border border-[#1E3A5F] bg-[#0B1724] shadow-2xl"
      >
        {/* Full environmental background with dark navy tint and cyan/emerald ambient glows */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/eco_city_backdrop.jpg"
            alt="Environmental Eco City"
            className="w-full h-full object-cover object-center opacity-25 filter saturate-150 animate-slow-pan pointer-events-none"
          />
          {/* Ambient cyan/emerald pulsing glows behind content */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-[#36C5F0]/15 blur-3xl pointer-events-none animate-ambient-pulse" />
          <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-[#0D9B76]/20 blur-3xl pointer-events-none animate-ambient-pulse" />
          {/* Deep Navy gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1724] via-[#0B1724]/75 to-transparent pointer-events-none" />
        </div>

        {/* Floating animated decorative leaves */}
        <div className="absolute top-5 right-1/3 w-6 h-6 text-[#0D9B76] opacity-80 animate-float-slow pointer-events-none z-10 drop-shadow-sm">
          <Leaf size={22} />
        </div>
        <div className="absolute bottom-6 right-1/4 w-5 h-5 text-[#36C5F0] opacity-80 animate-float-slow pointer-events-none z-10 drop-shadow-sm">
          <Leaf size={18} />
        </div>

        {/* Content container */}
        <div className="relative z-10 p-5 sm:p-7 lg:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
            {/* Left Column: Hero Mission Card */}
            <div className="xl:col-span-5 space-y-4 bg-[#0F1F33]/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-[#1E3A5F] shadow-xl hover:shadow-[0_15px_35px_rgba(0,0,0,0.6)] transition-all duration-300">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D9B76]/15 border border-[#0D9B76]/40 text-[#36C5F0] text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#0D9B76] animate-pulse" />
                <span>CPCB Station 2586 • {liveData.station}</span>
              </div>

              <div className="space-y-1.5">
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-white tracking-tight leading-[1.12]">
                  AI Air Quality <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D9B76] via-[#22C55E] to-[#36C5F0]">
                    Prediction & Monitoring
                  </span>
                </h1>
                <p className="text-sm sm:text-base font-semibold text-slate-300 pt-0.5">
                  Monitor current air quality. Predict the next hour.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => onNavigate('monitoring')}
                  className="relative overflow-hidden group px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] hover:from-[#0FB388] hover:to-[#52CEF4] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#0D9B76]/30 hover:shadow-[#0D9B76]/50 hover:-translate-y-0.5 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
                  <Activity size={16} />
                  <span>Live Monitoring</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                </button>

                <button
                  onClick={() => onNavigate('analytics')}
                  className="px-5 py-2.5 rounded-xl bg-[#13253B] hover:bg-[#18304B] text-[#36C5F0] font-bold text-xs sm:text-sm border border-[#1E3A5F] shadow-sm hover:border-[#36C5F0]/60 hover:shadow-[0_0_15px_rgba(54,197,240,0.2)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BarChart2 size={16} className="text-[#36C5F0]" />
                  <span>View Analytics</span>
                </button>
              </div>
            </div>

            {/* Right Column: Three Distinct Dark Navy Summary Cards */}
            <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-stretch">
              {/* Card A: Current AQI */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="p-4 sm:p-5 rounded-3xl bg-[#0F1F33]/90 backdrop-blur-md border border-[#1E3A5F] shadow-xl flex flex-col justify-between hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:border-[#36C5F0]/50 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Current AQI
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#36C5F0] bg-[#0D9B76]/15 px-2 py-0.5 rounded-full border border-[#0D9B76]/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0D9B76] animate-pulse" />
                      Live
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                      {currentAqi !== null ? <CountUp value={currentAqi} duration={1.2} /> : "..."}
                    </span>
                  </div>

                  <div className="mt-1.5">
                    {currentAqi !== null ? (
                      <AqiBadge aqi={currentAqi} size="sm" showDot={true} />
                    ) : (
                      <Skeleton className="w-24 h-5" />
                    )}
                  </div>
                </div>

                {/* Mathematically Accurate AQI Scale: 0 - 500 */}
                <div className="mt-4 pt-3 border-t border-[#1E3A5F]/70 space-y-2">
                  <div className="relative w-full h-2 rounded-full overflow-hidden flex bg-[#0B1724]">
                    <div className="h-full bg-[#0D9B76]" style={{ width: '10%' }} title="Good (0-50)" />
                    <div className="h-full bg-emerald-500" style={{ width: '10%' }} title="Satisfactory (50-100)" />
                    <div className="h-full bg-yellow-500" style={{ width: '20%' }} title="Moderate (100-200)" />
                    <div className="h-full bg-orange-500" style={{ width: '20%' }} title="Poor (200-300)" />
                    <div className="h-full bg-red-500" style={{ width: '20%' }} title="Very Poor (300-400)" />
                    <div className="h-full bg-red-800" style={{ width: '20%' }} title="Severe (400-500)" />
                  </div>

                  {/* Dynamic Marker Position */}
                  {currentAqi !== null && (
                    <div className="relative w-full h-2">
                      <motion.div
                        initial={{ left: '0%' }}
                        animate={{ left: `${Math.min(98, Math.max(2, (Number(currentAqi) / 500) * 100))}%` }}
                        transition={{ duration: 1.0, ease: "easeOut" }}
                        className="absolute -top-3.5 -ml-1.5 flex flex-col items-center pointer-events-none z-10"
                      >
                        <div 
                          className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transition-shadow duration-500"
                          style={{ 
                            backgroundColor: currentCategory?.color || '#F97316',
                            boxShadow: `0 0 10px 2px ${currentCategory?.color || '#F97316'}`
                          }}
                        />
                      </motion.div>
                    </div>
                  )}

                  <div className="relative w-full h-3 text-[9px] font-semibold text-slate-400 font-mono">
                    <span className="absolute left-0">0</span>
                    <span className="absolute left-[10%] -translate-x-1/2">50</span>
                    <span className="absolute left-[20%] -translate-x-1/2">100</span>
                    <span className="absolute left-[40%] -translate-x-1/2">200</span>
                    <span className="absolute left-[60%] -translate-x-1/2">300</span>
                    <span className="absolute right-0">500</span>
                  </div>
                </div>
              </motion.div>

              {/* Card B: Next Hour */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="p-4 sm:p-5 rounded-3xl bg-[#0F1F33]/90 backdrop-blur-md border border-[#1E3A5F] shadow-xl flex flex-col justify-between hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:border-[#36C5F0]/50 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#36C5F0]">
                      <Sparkles size={12} />
                      <span>Next Hour</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#36C5F0] bg-[#36C5F0]/15 px-2 py-0.5 rounded-full border border-[#36C5F0]/30">
                      ML Model
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-[#36C5F0] font-mono tracking-tight drop-shadow-[0_2px_8px_rgba(54,197,240,0.3)]">
                      {nextHourAqi !== null ? <CountUp value={nextHourAqi} duration={1.2} /> : "..."}
                    </span>
                  </div>

                  <div className="mt-1.5">
                    {nextHourAqi !== null ? (
                      <AqiBadge aqi={nextHourAqi} size="sm" showDot={true} />
                    ) : (
                      <Skeleton className="w-24 h-5" />
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E3A5F]/70 flex items-center justify-between">
                  <div className="text-[10.5px] text-slate-300 font-medium">
                    {currentAqi !== null && nextHourAqi !== null ? (
                      nextHourAqi < currentAqi ? (
                        <span className="text-[#0D9B76] font-bold flex items-center gap-1">
                          <span>↓ {currentAqi - nextHourAqi} pts</span>
                          <span className="font-normal text-slate-400">improving</span>
                        </span>
                      ) : nextHourAqi > currentAqi ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <span>↑ {nextHourAqi - currentAqi} pts</span>
                          <span className="font-normal text-slate-400">increasing</span>
                        </span>
                      ) : (
                        <span className="text-slate-300 font-bold">Stable</span>
                      )
                    ) : (
                      <span>Calculating trend...</span>
                    )}
                  </div>

                  <div className="w-20">
                    {pollutantHistory.PM25 && pollutantHistory.PM25.length > 1 ? (
                      <Sparkline data={pollutantHistory.PM25} color="#36C5F0" width={78} height={20} />
                    ) : (
                      <span className="text-[9px] text-slate-500 font-mono italic">Trend...</span>
                    )}
                  </div>
                </div>

                {/* 3 Atmospheric Scenarios Indicator */}
                <div 
                  onClick={() => onNavigate && onNavigate('prediction')}
                  className="mt-3 pt-2.5 border-t border-[#1E3A5F]/70 flex items-center justify-between text-[10px] cursor-pointer group/scenarios"
                  title="Click to view 3 detailed atmospheric scenarios under AQI Prediction"
                >
                  <span className="font-bold text-slate-400 group-hover/scenarios:text-[#36C5F0] transition-colors flex items-center gap-1">
                    <span>3 Scenarios:</span>
                  </span>
                  <div className="flex items-center gap-1 font-mono font-bold">
                    <span className="text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40 hover:scale-105 transition-transform" title="Scenario 1: Favorable Dispersion (Good: 35-48)">
                      35–48
                    </span>
                    <span className="text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/40 hover:scale-105 transition-transform" title="Scenario 2: Baseline Diurnal Persistence (Moderate: 85-105)">
                      ~95
                    </span>
                    <span className="text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/40 hover:scale-105 transition-transform" title="Scenario 3: Atmospheric Inversion (Poor: 180-230+)">
                      185+
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Card C: Dominant Pollutant */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="p-4 sm:p-5 rounded-3xl bg-[#0F1F33]/90 backdrop-blur-md border border-[#1E3A5F] shadow-xl flex flex-col justify-between hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:border-[#36C5F0]/50 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <Wind size={13} className="text-[#36C5F0]" />
                      <span>Dominant Pollutant</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${domStatus.badgeBg} ${domStatus.textColor} border ${domStatus.badgeBorder}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${domStatus.dotBg}`} />
                      {domStatus.label}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                      {liveData.dominantPollutant}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-300 font-mono">
                      {liveData.dominantValue !== null ? `${liveData.dominantValue} ${liveData.dominantUnit}` : "..."}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">
                      Limit: {domThreshold.standard} {domThreshold.unit}
                    </span>
                    <span className="font-bold font-mono text-[#36C5F0]">
                      {domStatus.displayPercent}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#1E3A5F]/70 space-y-1.5">
                  <div className="w-full h-2 bg-[#0B1724] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${domStatus.percent}%` }}
                      transition={{ duration: 1.0, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: domStatus.color }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>CPCB Standard</span>
                    <div className="w-16">
                      {domSparkline && domSparkline.length > 1 ? (
                        <Sparkline data={domSparkline} color={domStatus.color} width={64} height={16} />
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ================================================== */}
      {/* 2. CRITERIA POLLUTANT TELEMETRY                   */}
      {/* ================================================== */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#0D9B76]/15 text-[#36C5F0] flex items-center justify-center border border-[#0D9B76]/30">
              <Activity size={15} />
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Criteria Pollutant Telemetry
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            CPCB Station 2586 Sensors • Real-Time Sub-Indices
          </span>
        </div>

        {/* 6 Equal Cards in One Row on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {telemetryCards.map((c, idx) => {
            const statusInfo = getPollutantStatusAndPercent(c.value, c.standard);
            const val = c.value !== null && c.value !== undefined ? Number(c.value) : null;
            const spark = pollutantHistory[c.historyKey] || [];
            const Icon = c.icon;

            return (
              <motion.div
                key={c.key}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className={`p-4 rounded-3xl bg-[#0F1F33] border border-[#1E3A5F] shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${c.hoverGlow}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-xl ${c.iconBg} ${c.iconColor} flex items-center justify-center flex-shrink-0 border border-white/5`}>
                      <Icon size={16} />
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.badgeBg} ${statusInfo.textColor} border ${statusInfo.badgeBorder}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotBg}`} />
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-base font-black text-white tracking-tight font-mono">
                      {c.name}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400 truncate">
                      {c.desc}
                    </p>
                  </div>

                  <div className="mt-2.5 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white font-mono tracking-tight">
                      {val !== null ? <CountUp value={val} decimals={c.decimals} duration={1.2} /> : "..."}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {c.unit}
                    </span>
                  </div>
                </div>

                <div className="my-3 py-1">
                  {spark && spark.length > 1 ? (
                    <Sparkline data={spark} color={c.color} width={130} height={24} />
                  ) : (
                    <div className="h-6 flex items-center">
                      <span className="text-[9px] text-slate-500 font-mono italic">Trend loading...</span>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[#1E3A5F]/70 space-y-1.5">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-slate-400 font-medium">
                      Limit: {c.standard} {c.unit}
                    </span>
                    <span className="font-bold font-mono text-[#36C5F0]">
                      {statusInfo.displayPercent}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0B1724] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${statusInfo.percent}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.0, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: statusInfo.color }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ================================================== */}
      {/* 3. HISTORICAL AQI TREND — FULL WIDTH              */}
      {/* ================================================== */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-[#0F1F33] rounded-3xl p-6 sm:p-7 border border-[#1E3A5F] shadow-xl space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E3A5F]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D9B76]/15 text-[#36C5F0] flex items-center justify-center flex-shrink-0 border border-[#0D9B76]/30">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Historical AQI Trend
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-400">
                Jan – Jun 2026 | Daily Average AQI
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#13253B] border border-[#1E3A5F] text-[#36C5F0] font-semibold font-mono">
              <span className="w-2 h-2 rounded-full bg-[#36C5F0]" />
              123 Daily Observations
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#13253B] border border-[#1E3A5F] text-slate-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#0D9B76]" />
              Station 2586 Continuous Telemetry
            </span>
          </div>
        </div>

        {/* Designed Deep Navy Analytics Canvas */}
        <div className="w-full bg-[#0B1724] border border-[#1E3A5F] rounded-2xl p-3 sm:p-5 shadow-inner">
          <div className="h-88 sm:h-[390px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 18, right: 18, left: -20, bottom: 6 }}>
                <defs>
                  <linearGradient id="historicalAqiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#36C5F0" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0D9B76" stopOpacity={0.0} />
                  </linearGradient>
                  <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#36C5F0" floodOpacity="0.5" />
                    <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#0D9B76" floodOpacity="0.3" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} 
                  tickLine={false} 
                  axisLine={{ stroke: '#1E3A5F' }}
                  minTickGap={28}
                  tickFormatter={(d) => {
                    if (!d) return '';
                    const parts = d.split('-');
                    if (parts.length === 3) {
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const m = parseInt(parts[1], 10) - 1;
                      return `${months[m]} ${parts[2]}`;
                    }
                    return d;
                  }}
                />
                <YAxis 
                  domain={[0, 'auto']} 
                  tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip
                  cursor={{ stroke: '#36C5F0', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      const aqiVal = Math.round(d.actual ?? d.aqi);
                      const cat = getAqiCategory(aqiVal);
                      let formattedDate = d.date;
                      if (d.date) {
                        const parts = d.date.split('-');
                        if (parts.length === 3) {
                          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                          const m = parseInt(parts[1], 10) - 1;
                          formattedDate = `${months[m]} ${parseInt(parts[2], 10)}, ${parts[0]}`;
                        }
                      }
                      return (
                        <div className="bg-[#0F1F33]/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-[#1E3A5F] text-xs min-w-[170px] space-y-2">
                          <div className="text-[11px] font-semibold text-slate-400 font-mono">
                            {formattedDate}
                          </div>
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">AQI</span>
                            <span className="font-mono text-2xl font-black text-[#36C5F0]">{aqiVal}</span>
                          </div>
                          <div className="pt-1.5 border-t border-[#1E3A5F] flex items-center justify-between">
                            <span className="text-[10.5px] text-slate-400 font-medium">Category</span>
                            <span 
                              className="text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                              style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                              {cat.label}
                            </span>
                          </div>
                          {d.min_aqi !== undefined && d.max_aqi !== undefined && (
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1E3A5F] font-mono flex justify-between">
                              <span>Daily Range:</span>
                              <span>{Math.round(d.min_aqi)} – {Math.round(d.max_aqi)}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="AQI"
                  stroke="#36C5F0"
                  strokeWidth={3}
                  fill="url(#historicalAqiGrad)"
                  filter="url(#lineGlow)"
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: '#36C5F0',
                    stroke: '#0B1724',
                    strokeWidth: 3,
                  }}
                  isAnimationActive={true}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.section>

      {/* ================================================== */}
      {/* 4. POLLUTANT COMPARISON — FULL WIDTH              */}
      {/* ================================================== */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-[#0F1F33] rounded-3xl p-6 sm:p-7 border border-[#1E3A5F] shadow-xl space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E3A5F]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D9B76]/15 text-[#36C5F0] flex items-center justify-center flex-shrink-0 border border-[#0D9B76]/30">
              <BarChart2 size={18} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Pollutant Comparison
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-400">
                Current Criteria Concentrations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D9B76]/15 border border-[#0D9B76]/40 text-[#36C5F0] text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9B76] animate-pulse" />
              Live Sensor Ingestion
            </span>
          </div>
        </div>

        {/* Designed Deep Navy Analytics Canvas */}
        <div className="w-full bg-[#0B1724] border border-[#1E3A5F] rounded-2xl p-3 sm:p-5 shadow-inner">
          <div className="h-88 sm:h-[390px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={pollutantComparisonData} 
                margin={{ top: 32, right: 18, left: -20, bottom: 8 }}
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                <defs>
                  <linearGradient id="pm25Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0D9B76" />
                    <stop offset="100%" stopColor="#097055" />
                  </linearGradient>
                  <linearGradient id="pm10Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EAB308" />
                    <stop offset="100%" stopColor="#CA8A04" />
                  </linearGradient>
                  <linearGradient id="no2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#36C5F0" />
                    <stop offset="100%" stopColor="#1E9DC4" />
                  </linearGradient>
                  <linearGradient id="so2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="100%" stopColor="#0891B2" />
                  </linearGradient>
                  <linearGradient id="coGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#7E22CE" />
                  </linearGradient>
                  <linearGradient id="o3Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#0F766E" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 13, fill: '#CBD5E1', fontWeight: 'bold' }} 
                  tickLine={false} 
                  axisLine={{ stroke: '#1E3A5F' }} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip
                  cursor={{ fill: 'rgba(54, 197, 240, 0.08)', radius: 8 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      const status = getPollutantStatusAndPercent(d.value, d.limit);
                      return (
                        <div className="bg-[#0F1F33]/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-[#1E3A5F] text-xs min-w-[210px] space-y-2.5">
                          <div className="flex items-center justify-between gap-3 border-b border-[#1E3A5F] pb-2">
                            <div>
                              <h4 className="font-black text-white text-sm font-mono">{d.name}</h4>
                              <span className="text-[10.5px] text-slate-400 font-medium">{d.fullName}</span>
                            </div>
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-baseline justify-between">
                              <span className="text-slate-400 font-medium">Concentration:</span>
                              <span className="font-mono text-base font-black text-white">
                                {d.value} {d.unit}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Limit:</span>
                              <span className="text-[#36C5F0] font-mono font-bold">
                                {d.limit} {d.unit}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">% of limit:</span>
                              <span className="font-mono font-bold text-white">
                                {status.displayPercent}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#1E3A5F]">
                              <span className="text-slate-400">Status:</span>
                              <span 
                                className={`font-bold px-2 py-0.5 rounded-full ${status.badgeBg} ${status.textColor} border ${status.badgeBorder}`}
                              >
                                {status.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={56}
                  isAnimationActive={true}
                  animationDuration={900}
                  animationEasing="ease-out"
                  onMouseEnter={(_, index) => setHoveredBarIndex(index)}
                >
                  <LabelList 
                    content={(props) => {
                      const { x, y, width, index } = props;
                      const item = pollutantComparisonData[index];
                      if (!item || item.value === undefined || item.value === null) return null;
                      return (
                        <text
                          x={x + width / 2}
                          y={y - 8}
                          fill="#CBD5E1"
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {item.value} {item.unit}
                        </text>
                      );
                    }}
                  />
                  {pollutantComparisonData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#${entry.gradientId})`} 
                      opacity={hoveredBarIndex === null || hoveredBarIndex === index ? 1 : 0.45}
                      className="transition-all duration-200 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
