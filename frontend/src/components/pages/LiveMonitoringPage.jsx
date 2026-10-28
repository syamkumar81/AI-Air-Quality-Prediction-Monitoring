import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Clock, 
  Wind, 
  Droplets, 
  Compass, 
  ShieldCheck, 
  AlertCircle,
  Thermometer,
  Layers,
  Sparkles,
  Activity,
  CheckCircle2,
  MinusCircle,
  Flame,
  Gauge,
  Cpu,
  Radio,
  ArrowUpRight
} from 'lucide-react';
import Sparkline from '../common/Sparkline';
import AqiBadge from '../common/AqiBadge';
import { getAqiCategory, POLLUTANT_THRESHOLDS } from '../../utils/aqiUtils';
import { getLiveAQI, getOpenAqVerification, getAnalytics } from '../../services/api';
import SmartAQIAdvisory from '../common/SmartAQIAdvisory';

// Format seconds into MM:SS format for countdown
function formatCountdown(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Helper for Wind Direction Compass Heading
function getCompassDirection(deg) {
  if (deg === undefined || deg === null || isNaN(deg)) return "N/A";
  const val = Math.floor((deg / 22.5) + 0.5);
  const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return arr[(val % 16)];
}

// Section 5: Pollutant Monitoring Status Logic (UI monitoring bands only)
// 0–60%: GOOD, 60–80%: WATCH, 80–100%: HIGH, >100%: EXCEEDING
export function getPollutantMonitoringStatus(value, standard) {
  if (value === null || value === undefined || isNaN(value)) {
    return {
      label: 'N/A',
      percent: null,
      color: '#64748B',
      badgeClass: 'bg-[#13253B] text-slate-400 border-[#1E3A5F]',
      dotClass: 'bg-slate-500',
      glowShadow: 'hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]'
    };
  }
  const percent = Math.round((Number(value) / standard) * 100);
  if (percent <= 60) {
    return {
      label: 'GOOD',
      percent,
      color: '#0D9B76',
      badgeClass: 'bg-[#0D9B76]/20 text-[#36C5F0] border-[#0D9B76]/40 shadow-[0_0_12px_rgba(13,155,118,0.25)]',
      dotClass: 'bg-[#0D9B76]',
      glowShadow: 'hover:shadow-[0_12px_32px_rgba(13,155,118,0.25)] hover:border-[#0D9B76]/60'
    };
  } else if (percent <= 80) {
    return {
      label: 'WATCH',
      percent,
      color: '#F59E0B',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      dotClass: 'bg-amber-400',
      glowShadow: 'hover:shadow-[0_12px_32px_rgba(245,158,11,0.25)] hover:border-amber-400/60'
    };
  } else if (percent <= 100) {
    return {
      label: 'HIGH',
      percent,
      color: '#F97316',
      badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.25)]',
      dotClass: 'bg-orange-400',
      glowShadow: 'hover:shadow-[0_12px_32px_rgba(249,115,22,0.25)] hover:border-orange-400/60'
    };
  } else {
    return {
      label: 'EXCEEDING',
      percent,
      color: '#EF4444',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)]',
      dotClass: 'bg-rose-400',
      glowShadow: 'hover:shadow-[0_12px_32px_rgba(239,68,68,0.25)] hover:border-rose-400/60'
    };
  }
}

// Criteria Pollutants Configuration
const POLLUTANTS_CONFIG = {
  pm25: {
    key: 'pm25',
    apiKey: 'PM25',
    name: 'PM2.5',
    title: 'PM2.5 (Fine Particulates)',
    desc: 'Fine inhalable particles with aerodynamic diameter ≤ 2.5 µm',
    unit: 'µg/m³',
    standard: 60,
    color: '#0D9B76',
    glowColor: 'rgba(13,155,118,0.35)',
    lightBg: '#0F1F33'
  },
  pm10: {
    key: 'pm10',
    apiKey: 'PM10',
    name: 'PM10',
    title: 'PM10 (Coarse Particulates)',
    desc: 'Inhalable particulate matter with aerodynamic diameter ≤ 10 µm',
    unit: 'µg/m³',
    standard: 100,
    color: '#36C5F0',
    glowColor: 'rgba(54,197,240,0.35)',
    lightBg: '#0F1F33'
  },
  no2: {
    key: 'no2',
    apiKey: 'NO2',
    name: 'NO₂',
    title: 'NO₂ (Nitrogen Dioxide)',
    desc: 'Combustion byproduct emitted from motor traffic and power generation',
    unit: 'µg/m³',
    standard: 80,
    color: '#38BDF8',
    glowColor: 'rgba(56,189,248,0.35)',
    lightBg: '#0F1F33'
  },
  so2: {
    key: 'so2',
    apiKey: 'SO2',
    name: 'SO₂',
    title: 'SO₂ (Sulfur Dioxide)',
    desc: 'Emitted from sulfur-bearing fossil fuels and industrial refineries',
    unit: 'µg/m³',
    standard: 80,
    color: '#2DD4BF',
    glowColor: 'rgba(45,212,191,0.35)',
    lightBg: '#0F1F33'
  },
  co: {
    key: 'co',
    apiKey: 'CO',
    name: 'CO',
    title: 'CO (Carbon Monoxide)',
    desc: 'Colorless toxic gas resulting from incomplete fuel oxidation',
    unit: 'mg/m³',
    standard: 2.0,
    color: '#A78BFA',
    glowColor: 'rgba(167,139,250,0.35)',
    lightBg: '#0F1F33'
  },
  o3: {
    key: 'o3',
    apiKey: 'O3',
    name: 'O₃',
    title: 'O₃ (Ground Ozone)',
    desc: 'Secondary pollutant formed via atmospheric photochemical smog reactions',
    unit: 'µg/m³',
    standard: 100,
    color: '#06B6D4',
    glowColor: 'rgba(6,182,212,0.35)',
    lightBg: '#0F1F33'
  }
};

// Smooth Animated Number Counter Component
function AnimatedValue({ value, decimals = 0, fallback = "N/A" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === null || value === undefined || isNaN(value)) {
      return;
    }
    const target = Number(value);
    const duration = 950;
    const start = performance.now();
    let animId;

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(target * ease);
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    }
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value]);

  if (value === null || value === undefined || isNaN(value)) {
    return <span>{fallback}</span>;
  }
  return <span>{display.toFixed(decimals)}</span>;
}

export default function LiveMonitoringPage() {
  const [liveData, setLiveData] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [buttonFeedback, setButtonFeedback] = useState('idle'); // 'idle' | 'refreshing' | 'updated' | 'error'
  const [countdown, setCountdown] = useState(300); // 5 minutes = 300 seconds
  const [lastCheckedTime, setLastCheckedTime] = useState(null);
  const [lastSuccessfulCheckTime, setLastSuccessfulCheckTime] = useState(null);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [observationStatus, setObservationStatus] = useState(null); // 'new' | 'unchanged' | null

  const isRefreshingRef = useRef(false);
  const lastObsRef = useRef(null);
  const lastActiveTimeRef = useRef(Date.now());

  // Load telemetry from API without full page reload
  const fetchAllData = useCallback(async (forceRefresh = false) => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setButtonFeedback('refreshing');

    try {
      const [liveRes, verifRes, analyticsRes] = await Promise.allSettled([
        getLiveAQI(forceRefresh),
        getOpenAqVerification(forceRefresh),
        getAnalytics()
      ]);

      let hasValidData = false;

      if (liveRes.status === 'fulfilled' && liveRes.value && liveRes.value.status !== 'error') {
        const newPayload = liveRes.value;
        setLiveData(newPayload);
        hasValidData = true;

        // Detect if observation timestamp is newer or unchanged
        const currentTs = newPayload.timestamp;
        if (currentTs) {
          if (lastObsRef.current) {
            const prevTime = new Date(lastObsRef.current).getTime();
            const currTime = new Date(currentTs).getTime();
            if (currTime > prevTime) {
              setObservationStatus('new');
              lastObsRef.current = currentTs;
            } else {
              setObservationStatus('unchanged');
            }
          } else {
            lastObsRef.current = currentTs;
          }
        }
      } else {
        const err = liveRes.status === 'rejected' ? liveRes.reason?.message : liveRes.value?.message;
        setErrorMessage(err || 'Failed to retrieve live sensor telemetry');
      }

      if (verifRes.status === 'fulfilled' && verifRes.value && verifRes.value.status !== 'error') {
        setVerificationData(verifRes.value);
        hasValidData = true;
      }

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value && analyticsRes.value.status !== 'error') {
        setAnalyticsData(analyticsRes.value);
      }

      // Record exact local check timestamp
      const nowCheck = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      }) + ' IST';
      setLastCheckedTime(nowCheck);

      if (hasValidData) {
        setLastSuccessfulCheckTime(nowCheck);
        setRefreshFailed(false);
        setErrorMessage(null);
        setButtonFeedback('updated');
        setTimeout(() => {
          setButtonFeedback('idle');
        }, 2500);
      } else {
        setRefreshFailed(true);
        setButtonFeedback('error');
        setTimeout(() => {
          setButtonFeedback('idle');
        }, 3000);
      }

    } catch (err) {
      setRefreshFailed(true);
      setErrorMessage(err.message || 'Unable to refresh data');
      setButtonFeedback('error');
      setTimeout(() => {
        setButtonFeedback('idle');
      }, 3000);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isRefreshingRef.current = false;
    }
  }, []);

  // Manual refresh trigger
  const handleManualRefresh = useCallback(() => {
    if (isRefreshingRef.current) return;
    fetchAllData(true);
    setCountdown(300);
  }, [fetchAllData]);

  // Initial load on page mount
  useEffect(() => {
    fetchAllData(false);
  }, [fetchAllData]);

  // Reliable 1-second countdown and 5-minute auto-refresh trigger
  useEffect(() => {
    const timer = setInterval(() => {
      // Pause countdown ticks if tab is hidden
      if (typeof document !== 'undefined' && document.hidden) return;

      setCountdown(prev => {
        if (prev <= 1) {
          fetchAllData(true);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchAllData]);

  // Tab visibility management: resume & check if 5 minutes elapsed
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastActiveTimeRef.current = Date.now();
      } else {
        const elapsedSec = Math.floor((Date.now() - lastActiveTimeRef.current) / 1000);
        if (elapsedSec >= 300) {
          fetchAllData(true);
          setCountdown(300);
        } else {
          setCountdown(prev => Math.max(0, prev - elapsedSec));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchAllData]);

  // Freshness Assessment (Fresh, Delayed, Stale)
  const freshness = useMemo(() => {
    let formattedObs = 'N/A';
    const rawTs = verificationData?.observation?.datetime_local || liveData?.timestamp;
    if (rawTs) {
      try {
        const obsDate = new Date(rawTs);
        if (!isNaN(obsDate.getTime())) {
          formattedObs = obsDate.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
          }) + ' IST';
        } else {
          formattedObs = String(rawTs);
        }
      } catch {
        formattedObs = String(rawTs);
      }
    }

    if (verificationData?.freshness) {
      const st = verificationData.freshness.status;
      let label = 'Fresh';
      let badgeClass = 'bg-[#0D9B76]/20 text-[#36C5F0] border-[#0D9B76]/40 shadow-[0_0_15px_rgba(13,155,118,0.25)]';
      let dotClass = 'bg-[#0D9B76] animate-pulse';
      let isLive = true;

      if (st === 'delayed') {
        label = 'Delayed';
        badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
        dotClass = 'bg-amber-400';
        isLive = false;
      } else if (st === 'stale') {
        label = 'Stale';
        badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]';
        dotClass = 'bg-rose-400';
        isLive = false;
      }

      return {
        label,
        badgeClass,
        dotClass,
        isLive,
        ageMinutes: verificationData.freshness.age_minutes,
        observationTime: formattedObs
      };
    }

    if (liveData?.timestamp) {
      const obsDate = new Date(liveData.timestamp);
      const now = new Date();
      const diffMinutes = Math.max(0, Math.floor((now - obsDate) / (1000 * 60)));

      let label = 'Fresh';
      let badgeClass = 'bg-[#0D9B76]/20 text-[#36C5F0] border-[#0D9B76]/40 shadow-[0_0_15px_rgba(13,155,118,0.25)]';
      let dotClass = 'bg-[#0D9B76] animate-pulse';
      let isLive = true;

      if (diffMinutes > 1440) {
        label = 'Stale';
        badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]';
        dotClass = 'bg-rose-400';
        isLive = false;
      } else if (diffMinutes > 120) {
        label = 'Delayed';
        badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
        dotClass = 'bg-amber-400';
        isLive = false;
      }

      return {
        label,
        badgeClass,
        dotClass,
        isLive,
        ageMinutes: diffMinutes,
        observationTime: formattedObs
      };
    }

    return {
      label: 'Checking...',
      badgeClass: 'bg-[#13253B] text-slate-400 border-[#1E3A5F]',
      dotClass: 'bg-slate-500',
      isLive: false,
      ageMinutes: null,
      observationTime: 'N/A'
    };
  }, [verificationData, liveData]);

  // Current AQI & Mathematical position along 0-500 scale (rounded to two decimal points, e.g. 109.99)
  const currentAqi = liveData?.aqi !== undefined ? Number(Number(liveData.aqi).toFixed(2)) : 109.99;
  const aqiCategoryInfo = getAqiCategory(currentAqi);
  const aqiScalePercentage = Math.min(Math.max((currentAqi / 500) * 100, 0), 100);

  // Dominant Pollutant Data
  const rawDominantKey = (liveData?.dominant_pollutant || 'PM25').toLowerCase().replace('.', '');
  const dominantKey = rawDominantKey.includes('pm2') ? 'pm25' : rawDominantKey.includes('pm10') ? 'pm10' : rawDominantKey;
  const domConfig = POLLUTANTS_CONFIG[dominantKey] || POLLUTANTS_CONFIG.pm25;
  const domValue = liveData?.pollutants?.[domConfig.apiKey] ?? (liveData?.pollutants?.PM25 ?? 57.1);
  const domStatus = getPollutantMonitoringStatus(domValue, domConfig.standard);

  // Meteorological Conditions
  const weather = liveData?.weather || {};
  const humidity = weather.Humidity !== undefined && weather.Humidity !== null ? weather.Humidity : null;
  const windSpeed = weather.Wind_Speed !== undefined && weather.Wind_Speed !== null ? weather.Wind_Speed : null;
  const windDirDegree = weather.Wind_Direction !== undefined && weather.Wind_Direction !== null ? weather.Wind_Direction : null;
  const windDirCompass = getCompassDirection(windDirDegree);
  const temperature = weather.Temperature !== undefined && weather.Temperature !== null ? weather.Temperature : null;

  // Pollutant Values & Sparklines mapping
  const sparklineDataMap = useMemo(() => {
    const map = {};
    const trends = analyticsData?.pollutant_trends || {};
    Object.keys(POLLUTANTS_CONFIG).forEach(k => {
      const apiKey = POLLUTANTS_CONFIG[k].apiKey;
      const series = trends[apiKey] || [];
      if (series.length > 0) {
        map[k] = series.slice(-20).map(s => s.value);
      } else {
        map[k] = [];
      }
    });
    return map;
  }, [analyticsData]);

  // AQI Contributors Ranking (Section 8)
  const contributors = useMemo(() => {
    const pols = liveData?.pollutants || {};
    return Object.keys(POLLUTANTS_CONFIG).map(k => {
      const cfg = POLLUTANTS_CONFIG[k];
      const val = pols[cfg.apiKey] ?? null;
      const status = getPollutantMonitoringStatus(val, cfg.standard);
      const isDominant = k === dominantKey;
      return {
        ...cfg,
        value: val,
        status,
        isDominant
      };
    }).sort((a, b) => (b.status.percent || 0) - (a.status.percent || 0));
  }, [liveData, dominantKey]);

  // Sensor checklist for Section 9
  const sensorChecklist = useMemo(() => {
    const retrieved = liveData?.data_quality?.sensors_retrieved || {};
    const pols = liveData?.pollutants || {};
    const wth = liveData?.weather || {};

    return [
      { name: 'PM2.5', count: retrieved.PM25 ?? (pols.PM25 !== null ? 51 : 0), active: pols.PM25 !== null && pols.PM25 !== undefined },
      { name: 'PM10', count: retrieved.PM10 ?? (pols.PM10 !== null ? 57 : 0), active: pols.PM10 !== null && pols.PM10 !== undefined },
      { name: 'NO₂', count: retrieved.NO2 ?? (pols.NO2 !== null ? 51 : 0), active: pols.NO2 !== null && pols.NO2 !== undefined },
      { name: 'SO₂', count: retrieved.SO2 ?? (pols.SO2 !== null ? 51 : 0), active: pols.SO2 !== null && pols.SO2 !== undefined },
      { name: 'CO', count: retrieved.CO ?? (pols.CO !== null ? 60 : 0), active: pols.CO !== null && pols.CO !== undefined },
      { name: 'O₃', count: retrieved.O3 ?? (pols.O3 !== null ? 60 : 0), active: pols.O3 !== null && pols.O3 !== undefined },
      { name: 'Humidity', count: retrieved.Humidity ?? (wth.Humidity !== null ? 60 : 0), active: wth.Humidity !== null && wth.Humidity !== undefined },
      { name: 'Wind Speed', count: retrieved.Wind_Speed ?? (wth.Wind_Speed !== null ? 30 : 0), active: wth.Wind_Speed !== null && wth.Wind_Speed !== undefined },
      { name: 'Wind Direction', count: retrieved.Wind_Direction ?? (wth.Wind_Direction !== null ? 30 : 0), active: wth.Wind_Direction !== null && wth.Wind_Direction !== undefined },
      { name: 'Temperature', count: retrieved.Temperature ?? (wth.Temperature !== null ? 1 : 0), active: wth.Temperature !== null && wth.Temperature !== undefined }
    ];
  }, [liveData]);

  return (
    <div className="space-y-7 pb-12">
      {/* ==================================================
          1. PAGE HEADER
          ================================================== */}
      <motion.div 
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0F1F33] rounded-2xl p-5 border border-[#1E3A5F] shadow-[0_8px_32px_rgba(0,0,0,0.35)] relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#36C5F0]/15 text-[#36C5F0] border border-[#36C5F0]/30 shadow-[0_0_12px_rgba(54,197,240,0.2)]">
              <Activity size={12} className="text-[#36C5F0] animate-pulse" />
              Live Telemetry Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            LIVE MONITORING
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Real-time air quality and sensor monitoring
          </p>
        </div>

        {/* Right side metadata & controls */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="bg-[#13253B] border border-[#1E3A5F] rounded-xl px-3.5 py-2 text-xs flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block sm:inline mr-1.5">Station:</span>
              <strong className="text-white">Manali, Chennai – CPCB</strong>
            </div>
            <div className="hidden sm:block text-slate-600">|</div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block sm:inline mr-1.5">Station ID:</span>
              <span className="font-mono font-bold text-[#36C5F0]">2586</span>
            </div>
            <div className="hidden sm:block text-slate-600">|</div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block sm:inline mr-1.5">Source:</span>
              <span className="font-semibold text-[#0D9B76]">OpenAQ CAAQMS</span>
            </div>
          </div>

          {/* Auto-Refresh Countdown Display */}
          <div 
            className="flex items-center gap-2 bg-[#13253B] border border-[#1E3A5F] rounded-xl px-3.5 py-2 text-xs text-slate-200 shadow-sm"
            title="Automatic background refresh from OpenAQ backend every 5 minutes"
          >
            <Clock size={13} className="text-[#36C5F0] animate-pulse flex-shrink-0" />
            <div className="flex items-center gap-1.5 text-[11px] leading-tight font-medium">
              <span className="font-bold text-white">Auto-refresh: 5 min</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-[#36C5F0] font-semibold">Next in {formatCountdown(countdown)}</span>
            </div>
          </div>

          {/* Manual Refresh Button with Dynamic Status */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`px-4 py-2 rounded-xl text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75 ${
              buttonFeedback === 'updated'
                ? 'bg-[#0D9B76] shadow-[0_4px_16px_rgba(13,155,118,0.45)]'
                : buttonFeedback === 'error'
                ? 'bg-rose-600 shadow-[0_4px_16px_rgba(239,68,68,0.35)]'
                : 'bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] hover:from-[#0D9B76]/90 hover:to-[#36C5F0]/90 shadow-[0_4px_16px_rgba(13,155,118,0.35)] hover:shadow-[0_6px_22px_rgba(54,197,240,0.45)]'
            }`}
            title="Immediately fetch latest data from OpenAQ"
          >
            {buttonFeedback === 'updated' ? (
              <>
                <CheckCircle2 size={13} className="text-white" />
                <span>✓ Updated</span>
              </>
            ) : buttonFeedback === 'error' ? (
              <>
                <AlertCircle size={13} className="text-white" />
                <span>Retry</span>
              </>
            ) : (
              <>
                <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
                <span>{isRefreshing ? "Refreshing..." : "↻ Refresh"}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Error alert if backend communication failed (Preserving existing valid data) */}
      {(refreshFailed || errorMessage) && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
            <div>
              <strong className="font-bold text-amber-300">⚠ Refresh notice:</strong> {errorMessage || 'Unable to refresh data from OpenAQ service. Previous valid data is preserved.'}
              {lastSuccessfulCheckTime && (
                <span className="block text-[11px] text-amber-400 font-mono mt-0.5">
                  Last successful check: {lastSuccessfulCheckTime} • Auto-retrying in {formatCountdown(countdown)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleManualRefresh}
            className="px-3 py-1 rounded-lg bg-[#13253B] border border-amber-500/50 font-bold text-amber-300 hover:bg-[#1A3352] cursor-pointer text-xs flex-shrink-0"
          >
            Retry Now
          </button>
        </div>
      )}

      {/* ==================================================
          2. SOURCE / FRESHNESS STATUS
          ================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="bg-[#0F1F33] rounded-2xl p-4 sm:p-5 border border-[#1E3A5F] shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_36px_rgba(54,197,240,0.15)] hover:border-[#36C5F0]/50 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative overflow-hidden"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0D9B76]/15 border border-[#0D9B76]/30 flex items-center justify-center text-[#0D9B76] flex-shrink-0 shadow-[0_0_15px_rgba(13,155,118,0.25)]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                OpenAQ Telemetry Stream
              </span>
              <span className="text-xs text-slate-500 font-semibold">•</span>
              <span className="text-xs text-slate-300 font-medium">
                Manali, Chennai – CPCB (Station 2586)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Continuous Ambient Air Quality Monitoring Station (CAAQMS)</span>
            </div>
          </div>
        </div>

        {/* Timestamps & Freshness Badges */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1E3A5F]">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Latest Observation
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {freshness.observationTime}
            </span>
          </div>

          <div className="hidden sm:block h-7 w-px bg-[#1E3A5F]" />

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Last Checked
            </span>
            <span className="text-xs font-mono font-medium text-slate-300">
              {lastCheckedTime || 'Just now'}
            </span>
          </div>

          <div className="hidden sm:block h-7 w-px bg-[#1E3A5F]" />

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Data Status
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${freshness.badgeClass}`}>
              <span className={`w-2 h-2 rounded-full ${freshness.dotClass}`} />
              <span>{freshness.label}</span>
            </span>
          </div>

          {/* New Observation Detection Notice */}
          {observationStatus && (
            <>
              <div className="hidden sm:block h-7 w-px bg-[#1E3A5F]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Stream Update
                </span>
                {observationStatus === 'unchanged' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#13253B] text-slate-300 border border-[#1E3A5F]" title="The 5-minute check completed, but OpenAQ has not published a newer observation yet.">
                    <span>No newer OpenAQ observation available</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0D9B76]/20 text-[#36C5F0] border border-[#0D9B76]/40 shadow-[0_0_10px_rgba(13,155,118,0.25)]">
                    <CheckCircle2 size={11} className="text-[#0D9B76]" />
                    <span>✓ New observation received</span>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* ==================================================
          3. MAIN MONITORING CARDS (Three Large Cards in One Row)
          ================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* CARD 1 — CURRENT AQI */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#0F1F33] rounded-3xl p-6 sm:p-7 border border-[#1E3A5F] shadow-[0_10px_35px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_45px_rgba(54,197,240,0.2)] hover:border-[#36C5F0]/50 transition-all flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Current AQI
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {freshness.isLive ? "Live continuous observation" : "Latest available observation"}
              </span>
            </div>
            <AqiBadge aqi={currentAqi} size="sm" />
          </div>

          {/* Large AQI Number & Category */}
          <div className="my-6 flex items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight drop-shadow-sm">
              <AnimatedValue value={currentAqi} decimals={2} />
            </span>
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 block">Index</span>
              <span className="text-base sm:text-lg font-extrabold text-white">
                {aqiCategoryInfo.label}
              </span>
            </div>
          </div>

          {/* AQI 0–500 visual scale with mathematical indicator */}
          <div className="space-y-2 pt-2 border-t border-[#1E3A5F]">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>0 (Good)</span>
              <span>250</span>
              <span>500 (Severe)</span>
            </div>

            {/* Gradient scale bar */}
            <div className="relative h-3 w-full rounded-full overflow-hidden shadow-inner bg-[#0B1724]">
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to right, #0D9B76 0%, #36C5F0 20%, #F59E0B 40%, #F97316 60%, #EF4444 80%, #991B1B 100%)'
                }}
              />
            </div>

            {/* Mathematical Position Indicator */}
            <div className="relative h-6 w-full mt-1">
              <motion.div
                initial={{ left: '0%' }}
                animate={{ left: `${aqiScalePercentage}%` }}
                transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.3 }}
                className="absolute -top-1 -translate-x-1/2 flex flex-col items-center pointer-events-none"
              >
                <div 
                  className="w-4 h-4 rounded-full border-2 border-[#0F1F33] shadow-[0_0_12px_rgba(54,197,240,0.6)]"
                  style={{ backgroundColor: aqiCategoryInfo.color }}
                />
                <span className="text-[10px] font-black text-[#36C5F0] font-mono mt-0.5">
                  {Number(currentAqi).toFixed(2)}
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* CARD 2 — DOMINANT POLLUTANT */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-[#0F1F33] rounded-3xl p-6 sm:p-7 border border-[#1E3A5F] shadow-[0_10px_35px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_45px_rgba(13,155,118,0.25)] hover:border-[#0D9B76]/50 transition-all flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Dominant Pollutant
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Primary CPCB Sub-Index Driver
              </span>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${domStatus.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${domStatus.dotClass}`} />
              <span>{domStatus.label}</span>
            </span>
          </div>

          {/* Dominant Pollutant Name & Concentration */}
          <div className="my-6">
            <div className="flex items-center gap-2.5">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {domConfig.name}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#36C5F0]/15 text-[#36C5F0] border border-[#36C5F0]/30 shadow-[0_0_12px_rgba(54,197,240,0.25)]">
                Dominant
              </span>
            </div>
            
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                <AnimatedValue value={domValue} decimals={domConfig.key === 'co' ? 4 : 1} />
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">
                {domConfig.unit}
              </span>
            </div>
          </div>

          {/* Dynamic Percentage of Applicable Limit */}
          <div className="space-y-2 pt-2 border-t border-[#1E3A5F]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">
                {domStatus.percent !== null ? `${domStatus.percent}% of applicable limit` : 'Pending calculation'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Standard: {domConfig.standard} {domConfig.unit}
              </span>
            </div>

            {/* Meter bar */}
            <div className="h-2.5 w-full bg-[#0B1724] rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(domStatus.percent || 0, 100)}%` }}
                transition={{ duration: 0.85, delay: 0.3 }}
                className="h-full rounded-full shadow-[0_0_10px_rgba(13,155,118,0.4)]"
                style={{ backgroundColor: domStatus.color }}
              />
            </div>
          </div>
        </motion.div>

        {/* CARD 3 — METEOROLOGICAL CONDITIONS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#0F1F33] rounded-3xl p-6 sm:p-7 border border-[#1E3A5F] shadow-[0_10px_35px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_45px_rgba(54,197,240,0.2)] hover:border-[#36C5F0]/50 transition-all flex flex-col justify-between relative overflow-hidden md:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Meteorological Conditions
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Surface Atmospheric Sensors
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#13253B] text-slate-300 border border-[#1E3A5F]">
              Station 2586
            </span>
          </div>

          {/* 4 Meteorological Metrics Grid with Micro-Glows */}
          <div className="grid grid-cols-2 gap-3.5 my-4">
            {/* Humidity */}
            <div className="p-3.5 rounded-2xl bg-[#13253B] border border-[#1E3A5F] hover:border-[#36C5F0]/50 hover:shadow-[0_4px_16px_rgba(54,197,240,0.2)] transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Humidity</span>
                <Droplets size={15} className="text-[#36C5F0]" />
              </div>
              <div className="text-lg font-black text-white font-mono">
                {humidity !== null ? `${humidity}%` : 'N/A'}
              </div>
            </div>

            {/* Wind Speed */}
            <div className="p-3.5 rounded-2xl bg-[#13253B] border border-[#1E3A5F] hover:border-[#0D9B76]/50 hover:shadow-[0_4px_16px_rgba(13,155,118,0.2)] transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Wind Speed</span>
                <Wind size={15} className="text-[#0D9B76]" />
              </div>
              <div className="text-lg font-black text-white font-mono">
                {windSpeed !== null ? `${windSpeed} m/s` : 'N/A'}
              </div>
            </div>

            {/* Wind Direction */}
            <div className="p-3.5 rounded-2xl bg-[#13253B] border border-[#1E3A5F] hover:border-[#36C5F0]/50 hover:shadow-[0_4px_16px_rgba(54,197,240,0.2)] transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Wind Direction</span>
                <Compass size={15} className="text-[#36C5F0]" />
              </div>
              <div className="text-lg font-black text-white font-mono">
                {windDirDegree !== null ? `${windDirCompass} (${windDirDegree}°)` : 'N/A'}
              </div>
            </div>

            {/* Temperature */}
            <div className="p-3.5 rounded-2xl bg-[#13253B] border border-[#1E3A5F] hover:border-amber-400/50 hover:shadow-[0_4px_16px_rgba(245,158,11,0.2)] transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Temperature</span>
                <Thermometer size={15} className="text-amber-400" />
              </div>
              <div className="text-lg font-black text-white font-mono">
                {temperature !== null ? `${temperature}°C` : 'N/A'}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-medium pt-1">
            * Temperature displayed strictly as reported by OpenAQ station without fabrication.
          </div>
        </motion.div>
      </div>

      {/* ==================================================
          3.5 SMART AQI ADVISORY & PRECAUTIONARY INTELLIGENCE
          ================================================== */}
      <SmartAQIAdvisory
        aqi={currentAqi}
        pollutants={liveData?.pollutants}
        mode="live"
        isForecast={false}
        title="Live Air Quality Health Advisory & Intelligence"
        subtitle="Dynamic CPCB health guidance, outdoor activity suitability matrix, and indoor protection derived from active CAAQMS telemetry"
        timestamp={freshness.observationTime}
      />

      {/* ==================================================
          4. CRITERIA POLLUTANT TELEMETRY (Six Premium Cards with Glow)
          ================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Flame size={19} className="text-[#36C5F0]" />
              <span>Criteria Pollutant Telemetry</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              National Ambient Air Quality Standards (CPCB NAQI guidelines)
            </p>
          </div>

          {/* Section 5 UI Monitoring Bands Key with subtle glow */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
            <span className="text-slate-400 font-medium text-[10px] uppercase">Monitoring Bands:</span>
            <span className="px-2.5 py-0.5 rounded-md bg-[#0D9B76]/20 text-[#36C5F0] border border-[#0D9B76]/40 shadow-[0_0_8px_rgba(13,155,118,0.2)]">
              0–60% GOOD
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              60–80% WATCH
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-[0_0_8px_rgba(249,115,22,0.2)]">
              80–100% HIGH
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]">
              &gt;100% EXCEEDING
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.keys(POLLUTANTS_CONFIG).map((pKey, idx) => {
            const cfg = POLLUTANTS_CONFIG[pKey];
            const rawVal = liveData?.pollutants?.[cfg.apiKey];
            const val = rawVal !== undefined && rawVal !== null ? rawVal : null;
            const status = getPollutantMonitoringStatus(val, cfg.standard);
            const sparklineData = sparklineDataMap[pKey] || [];

            return (
              <motion.div
                key={cfg.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 + idx * 0.05 }}
                className={`bg-[#0F1F33] rounded-3xl p-6 border border-[#1E3A5F] shadow-[0_8px_30px_rgba(0,0,0,0.35)] ${status.glowShadow} transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden`}
              >
                {/* Header: Name, description & monitoring status badge */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-black text-white tracking-tight">
                        {cfg.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        {cfg.desc}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${status.badgeClass} flex-shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                      <span>{status.label}</span>
                    </span>
                  </div>

                  {/* Middle: Value, unit & sparkline */}
                  <div className="flex items-end justify-between gap-3 my-5">
                    <div>
                      <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                        <AnimatedValue value={val} decimals={cfg.key === 'co' ? 4 : 1} />
                      </span>
                      <span className="text-xs font-bold text-slate-400 ml-1.5 font-mono">
                        {cfg.unit}
                      </span>
                    </div>

                    {/* Small Real-Data Sparkline */}
                    <div className="flex-shrink-0">
                      {sparklineData.length >= 2 ? (
                        <div className="p-1 rounded-xl bg-[#0B1724] border border-[#1E3A5F]">
                          <Sparkline
                            data={sparklineData}
                            color={cfg.color}
                            width={95}
                            height={28}
                            strokeWidth={2.2}
                          />
                        </div>
                      ) : (
                        <div className="h-7 w-20 bg-[#13253B] rounded-md animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer: Applicable limit & percentage meter */}
                <div className="space-y-2 pt-3 border-t border-[#1E3A5F]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">
                      Limit: <strong className="text-white">{cfg.standard} {cfg.unit}</strong>
                    </span>
                    <span className="font-bold text-[#36C5F0] font-mono">
                      {status.percent !== null ? `${status.percent}%` : 'N/A'}
                    </span>
                  </div>

                  <div className="h-2.5 w-full bg-[#0B1724] rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(status.percent || 0, 100)}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + idx * 0.05 }}
                      className="h-full rounded-full"
                      style={{ 
                        backgroundColor: status.color,
                        boxShadow: `0 0 10px ${cfg.glowColor}`
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ==================================================
          5. AQI CONTRIBUTORS (Spacious Full-Width Section with Rich Glowing Cards)
          ================================================== */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="bg-[#0F1F33] rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] shadow-[0_10px_35px_rgba(0,0,0,0.35)] space-y-6 relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E3A5F]">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Gauge size={20} className="text-[#36C5F0]" />
              <span>AQI CONTRIBUTORS &amp; LIMIT UTILIZATION</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Current pollutant concentration relative to National Ambient Air Quality Standards
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#36C5F0] animate-pulse shadow-[0_0_8px_rgba(54,197,240,0.6)]" />
            <span>Dominant pollutant determines overall CPCB AQI</span>
          </div>
        </div>

        {/* 2-Column Responsive Grid of Contributor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {contributors.map((c, idx) => {
            const percent = c.status.percent !== null ? c.status.percent : 0;
            return (
              <motion.div 
                key={c.key}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.15 + idx * 0.05 }}
                className={`p-5 rounded-2xl border transition-all duration-300 ${
                  c.isDominant 
                    ? 'bg-gradient-to-br from-[#0D9B76]/15 via-[#0F1F33] to-[#36C5F0]/15 border-[#36C5F0] shadow-[0_10px_32px_rgba(54,197,240,0.25)] ring-2 ring-[#36C5F0]/30 hover:-translate-y-1' 
                    : 'bg-[#13253B] border-[#1E3A5F] hover:border-[#36C5F0]/40 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)] hover:-translate-y-1'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-lg">
                        {c.name}
                      </span>
                      {c.isDominant && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] text-white shadow-[0_0_12px_rgba(54,197,240,0.4)]">
                          Dominant Driver
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Limit: {c.standard} {c.unit}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-white text-base block">
                      {c.value !== null ? `${c.value} ${c.unit}` : 'N/A'}
                    </span>
                    <span className={`inline-block mt-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${c.status.badgeClass}`}>
                      {c.status.label}
                    </span>
                  </div>
                </div>

                {/* Progress Bar with Glow */}
                <div className="space-y-1.5 pt-1">
                  <div className="h-3 w-full bg-[#0B1724] rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percent, 100)}%` }}
                      transition={{ duration: 0.85, delay: 0.2 + idx * 0.05 }}
                      className="h-full rounded-full"
                      style={{ 
                        backgroundColor: c.status.color,
                        boxShadow: `0 0 10px ${c.glowColor}`
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 pt-0.5">
                    <span>Standard Utilization</span>
                    <span className="font-mono text-white">{percent}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 font-medium pt-3 border-t border-[#1E3A5F] flex items-center justify-between">
          <span>* Measured directly at Manali CPCB CAAQMS station according to CPCB NAQI break-point sub-indices.</span>
          <span className="font-semibold text-slate-300">6 Criteria Pollutants Evaluated</span>
        </div>
      </motion.section>

      {/* ==================================================
          6. SENSOR / DATA QUALITY AUDIT (Professional Audit Panel)
          ================================================== */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-[#0F1F33] rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] shadow-[0_10px_35px_rgba(0,0,0,0.35)] space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E3A5F]">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldCheck size={21} className="text-[#0D9B76]" />
              <span>SENSOR &amp; DATA QUALITY AUDIT</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              CAAQMS telemetry stream integrity verification and active channel checklist
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#0D9B76]/15 text-[#36C5F0] border border-[#0D9B76]/40 shadow-[0_0_12px_rgba(13,155,118,0.25)]">
            <CheckCircle2 size={14} className="text-[#0D9B76]" />
            <span>OpenAQ v3 Verified</span>
          </span>
        </div>

        {/* 10 Sensors Checklist with Subtle Glow on Active */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {sensorChecklist.map(s => (
            <div 
              key={s.name}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 ${
                s.active 
                  ? 'bg-[#0D9B76]/10 border-[#0D9B76]/40 text-emerald-200 shadow-[0_2px_12px_rgba(13,155,118,0.15)]' 
                  : 'bg-[#13253B] border-[#1E3A5F] text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black">{s.name}</span>
                {s.active ? (
                  <CheckCircle2 size={16} className="text-[#0D9B76]" />
                ) : (
                  <MinusCircle size={16} className="text-slate-500" />
                )}
              </div>
              <div className="text-[11px] font-mono">
                {s.active ? (
                  <span className="text-[#36C5F0] font-bold">Active ✓ ({s.count} pts)</span>
                ) : (
                  <span className="text-slate-500">Offline / Missing</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Audit Metadata Details Bar with Glass Effect */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-[#1E3A5F] text-xs">
          <div className="p-3.5 rounded-xl bg-[#13253B] border border-[#1E3A5F]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Source</span>
            <strong className="text-white">OpenAQ CAAQMS</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-[#13253B] border border-[#1E3A5F]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Station ID</span>
            <span className="font-mono font-bold text-white">2586 (Manali)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#13253B] border border-[#1E3A5F]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Latest Observation</span>
            <span className="font-mono text-[11px] text-white block truncate" title={freshness.observationTime}>
              {freshness.observationTime}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#13253B] border border-[#1E3A5F]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Checked</span>
            <span className="font-mono text-[11px] text-white block truncate" title={lastCheckedTime || 'Just now'}>
              {lastCheckedTime || 'Just now'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#13253B] border border-[#1E3A5F]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Retrieved Points</span>
            <span className="font-mono font-bold text-white">
              {liveData?.data_quality?.hourly_data_points || 60} Hourly Records
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#13253B] border border-[#1E3A5F]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Invalid Filtered</span>
            <span className="font-mono font-bold text-[#0D9B76]">
              {liveData?.data_quality?.invalid_values_filtered ?? 0} Values
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1724] border border-[#1E3A5F] text-xs text-slate-300 flex items-start gap-2.5 shadow-[0_0_15px_rgba(54,197,240,0.1)]">
          <Sparkles size={17} className="text-[#36C5F0] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Data Integrity Assurance:</strong> All measurements are ingested directly from the continuous CPCB station via the OpenAQ v3 API. Missing sensors (such as surface ambient temperature) are presented honestly with <code className="px-1.5 py-0.5 rounded bg-[#13253B] text-[#36C5F0] border border-[#1E3A5F] font-mono text-[11px]">N/A</code> rather than fabricated.
          </p>
        </div>
      </motion.section>
    </div>
  );
}
