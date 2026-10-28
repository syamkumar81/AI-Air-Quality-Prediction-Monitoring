import React, { useState, useEffect, useMemo } from 'react';
import { 
  HeartPulse, 
  ShieldAlert, 
  ShieldCheck, 
  Wind, 
  Footprints, 
  Bike, 
  Car, 
  Home, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  Sparkles, 
  Activity, 
  Gauge, 
  Layers, 
  Info,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChevronRight,
  TrendingUp,
  MapPin,
  Compass
} from 'lucide-react';
import AqiBadge from './AqiBadge';
import { getAqiAdvisory } from '../../services/api';

// Official Indian CPCB NAQI Categories & Curated Premium Color Tokens
const CPCB_CATEGORY_THEMES = {
  "Good": {
    color: "#10B981", // Green
    borderAccent: "border-emerald-500/40",
    bgSoft: "bg-[#13253B]/90",
    textDark: "text-white",
    badgeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    heroGradient: "from-emerald-500/15 via-[#0D9B76]/10 to-transparent",
    primaryPrecautionBg: "bg-[#0B1724]/90 border-emerald-500/30 text-emerald-200",
    highlightIcon: ShieldCheck,
    outdoorBadge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    outdoorStatus: "Safe & Encouraged",
    travelStatus: "Normal Commute",
    indoorStatus: "Open Natural Ventilation"
  },
  "Satisfactory": {
    color: "#22C55E", // Light Green
    borderAccent: "border-green-500/40",
    bgSoft: "bg-[#13253B]/90",
    textDark: "text-white",
    badgeBg: "bg-green-500/15 text-green-300 border-green-500/40",
    heroGradient: "from-green-500/15 via-emerald-500/10 to-transparent",
    primaryPrecautionBg: "bg-[#0B1724]/90 border-green-500/30 text-green-200",
    highlightIcon: ShieldCheck,
    outdoorBadge: "bg-green-500/15 text-green-300 border-green-500/30",
    outdoorStatus: "Generally Suitable",
    travelStatus: "Normal Commute",
    indoorStatus: "Maintain Natural Ventilation"
  },
  "Moderately Polluted": {
    color: "#EAB308", // Yellow / Amber
    borderAccent: "border-amber-500/40",
    bgSoft: "bg-[#13253B]/90",
    textDark: "text-white",
    badgeBg: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    heroGradient: "from-amber-500/15 via-yellow-500/10 to-transparent",
    primaryPrecautionBg: "bg-[#0B1724]/90 border-amber-500/30 text-amber-200",
    highlightIcon: AlertCircle,
    outdoorBadge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    outdoorStatus: "Caution for Sensitive Groups",
    travelStatus: "Reduce Highway Exposure",
    indoorStatus: "Close Windows During Peaks"
  },
  "Poor": {
    color: "#F97316", // Orange
    borderAccent: "border-orange-500/40",
    bgSoft: "bg-[#13253B]/90",
    textDark: "text-white",
    badgeBg: "bg-orange-500/15 text-orange-300 border-orange-500/40",
    heroGradient: "from-orange-500/15 via-amber-500/10 to-transparent",
    primaryPrecautionBg: "bg-[#0B1724]/90 border-orange-500/30 text-orange-200",
    highlightIcon: AlertTriangle,
    outdoorBadge: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    outdoorStatus: "Reduce Outdoor Physical Activity",
    travelStatus: "N95 Mask Recommended",
    indoorStatus: "Operate HEPA Air Filtration"
  },
  "Very Poor": {
    color: "#EF4444", // Red
    borderAccent: "border-rose-500/40",
    bgSoft: "bg-[#13253B]/90",
    textDark: "text-white",
    badgeBg: "bg-rose-500/15 text-rose-300 border-rose-500/40",
    heroGradient: "from-rose-500/15 via-red-500/10 to-transparent",
    primaryPrecautionBg: "bg-[#0B1724]/90 border-rose-500/30 text-rose-200",
    highlightIcon: ShieldAlert,
    outdoorBadge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    outdoorStatus: "Avoid Outdoor Exercise",
    travelStatus: "Essential Travel Only (N95)",
    indoorStatus: "Sealed Rooms & Clean Air"
  },
  "Severe": {
    color: "#DC2626", // Dark Red
    borderAccent: "border-red-600/50",
    bgSoft: "bg-[#13253B]/90",
    textDark: "text-white",
    badgeBg: "bg-red-500/20 text-red-300 border-red-500/40 font-black",
    heroGradient: "from-red-600/20 via-rose-600/15 to-transparent",
    primaryPrecautionBg: "bg-[#0B1724]/95 border-red-500/40 text-red-200",
    highlightIcon: ShieldAlert,
    outdoorBadge: "bg-red-500/20 text-red-300 border-red-500/40",
    outdoorStatus: "Strictly Avoid Outdoor Activities",
    travelStatus: "Avoid Unnecessary Exposure",
    indoorStatus: "Stay Indoors in Filtered Air"
  }
};

// Primary precautionary summaries (Section 3 of requirements)
const CATEGORY_PRIMARY_PRECAUTIONS = {
  "Good": "Minimal pollution-related health risk. Enjoy outdoor activities and maintain normal home and office ventilation.",
  "Satisfactory": "Most people can continue normal activities. Unusually sensitive individuals should monitor respiratory symptoms.",
  "Moderately Polluted": "Sensitive individuals (asthma, COPD, cardiac patients) should reduce prolonged or heavy outdoor exertion.",
  "Poor": "Avoid prolonged outdoor physical activity. Wear a certified N95 respirator during outdoor transit and use indoor air purifiers.",
  "Very Poor": "Increased risk of respiratory illness. Avoid outdoor exercise, minimize outdoor exposure, and keep indoor air filtered.",
  "Severe": "Serious health hazard. Avoid outdoor activities, stay indoors with active air filtration, and seek medical attention for acute symptoms."
};

// Health risk descriptions
const CATEGORY_HEALTH_DESCRIPTIONS = {
  "Good": "Air quality is considered satisfactory, and ambient pollution poses minimal or no health risk to any population group.",
  "Satisfactory": "Air quality is acceptable for the general public. Only extremely sensitive individuals may notice minor irritation.",
  "Moderately Polluted": "Elevated particulate or gaseous concentrations may trigger breathing discomfort in people with pre-existing lung or heart conditions.",
  "Poor": "May cause breathing discomfort to most people on prolonged outdoor exposure. Active precautions are recommended for everyone.",
  "Very Poor": "Significant health hazard. Prolonged exposure can trigger acute respiratory symptoms and aggravate chronic cardiovascular disease.",
  "Severe": "Emergency health hazard. High likelihood of respiratory effects across healthy individuals and serious aggravation in vulnerable groups."
};

export default function SmartAQIAdvisory({
  aqi,
  category = "Satisfactory",
  pollutants = {},
  mode = "live", // "live" | "manual"
  isForecast = false,
  title = "Smart AQI Advisory & Precautionary Intelligence",
  subtitle = "Dynamic CPCB health guidance, outdoor activity suitability, and indoor air safety recommendations",
  timestamp = null,
  station = "Manali, Chennai - CPCB",
  precomputedAdvisory = null,
  isLoading = false
}) {
  const [advisoryData, setAdvisoryData] = useState(precomputedAdvisory);
  const [fetchingAdvisory, setFetchingAdvisory] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'health' | 'outdoor' | 'indoor' | 'pollutants'
  const [checkedItems, setCheckedItems] = useState({});

  // Synchronize or fetch advisory from centralized backend API
  useEffect(() => {
    if (precomputedAdvisory) {
      setAdvisoryData(precomputedAdvisory);
      return;
    }

    if (aqi === null || aqi === undefined || isNaN(Number(aqi))) {
      return;
    }

    let isMounted = true;
    setFetchingAdvisory(true);

    const payload = {
      aqi: Number(aqi),
      mode,
      pollutants: pollutants || {},
      station: station || "Manali, Chennai - CPCB",
      timestamp: timestamp || new Date().toISOString(),
      is_forecast: Boolean(isForecast)
    };

    getAqiAdvisory(payload)
      .then((data) => {
        if (isMounted && data) {
          setAdvisoryData(data);
        }
      })
      .catch((err) => {
        console.warn("Could not retrieve smart advisory from API:", err);
      })
      .finally(() => {
        if (isMounted) setFetchingAdvisory(false);
      });

    return () => { isMounted = false; };
  }, [aqi, category, pollutants, mode, isForecast, timestamp, station, precomputedAdvisory]);

  // Active category & theme tokens
  const currentCategory = advisoryData?.category || category || "Satisfactory";
  const catTheme = CPCB_CATEGORY_THEMES[currentCategory] || CPCB_CATEGORY_THEMES["Satisfactory"];
  const displayAqi = advisoryData?.aqi !== undefined ? advisoryData.aqi : (aqi !== null && !isNaN(Number(aqi)) ? Number(aqi) : 0);
  const roundedAqi = typeof displayAqi === 'number' ? Math.round(displayAqi) : displayAqi;

  // Primary Precaution Callout
  const primaryPrecaution = CATEGORY_PRIMARY_PRECAUTIONS[currentCategory] || CATEGORY_PRIMARY_PRECAUTIONS["Satisfactory"];
  const healthDescription = advisoryData?.health_advisory || CATEGORY_HEALTH_DESCRIPTIONS[currentCategory];

  // Recommendations data with bullet-point formatting
  const recs = advisoryData?.recommendations || {};
  const healthRecs = useMemo(() => {
    if (recs.health && Array.isArray(recs.health) && recs.health.length > 0) {
      return recs.health;
    }
    if (currentCategory === "Good") {
      return [
        "Minimal pollution-related health risk for all demographics.",
        "Ideal conditions for regular cardiovascular conditioning and outdoor routines.",
        "Safe for infants, elderly individuals, and individuals with respiratory conditions."
      ];
    } else if (currentCategory === "Satisfactory") {
      return [
        "Most people can continue standard daily outdoor routines without hindrance.",
        "Sensitive individuals with asthma or COPD should monitor minor cough or throat irritation.",
        "Keep prescribed inhalers or rescue medication accessible if susceptible to urban dust."
      ];
    } else if (currentCategory === "Moderately Polluted") {
      return [
        "Sensitive individuals should reduce prolonged or heavy outdoor physical exertion.",
        "People with asthma may experience increased shortness of breath; keep rescue medication close.",
        "Children and elderly adults should pace outdoor sports and rest periodically."
      ];
    } else if (currentCategory === "Poor") {
      return [
        "Avoid prolonged outdoor physical activity for both general and sensitive populations.",
        "People with heart disease, asthma, or bronchitis should strictly limit outdoor exertion.",
        "Seek medical advice if experiencing tightness in chest, persistent coughing, or wheezing."
      ];
    } else if (currentCategory === "Very Poor") {
      return [
        "Increased risk of respiratory illness across the entire population on outdoor exposure.",
        "Significant health hazard for vulnerable cohorts (cardiac, pediatric, geriatric).",
        "Avoid outdoor exercise; move all physical activities to filtered indoor environments."
      ];
    } else {
      return [
        "Serious health effects possible for all individuals even during brief outdoor exposure.",
        "High risk of acute pulmonary irritation, bronchospasm, and cardiovascular stress.",
        "Follow local public health advisories and consult a physician immediately if severe symptoms arise."
      ];
    }
  }, [recs.health, currentCategory]);

  // Outdoor activity recommendations
  const activityData = useMemo(() => {
    const isGood = currentCategory === "Good" || currentCategory === "Satisfactory";
    const isModerate = currentCategory === "Moderately Polluted";
    const isPoor = currentCategory === "Poor";
    const isSevere = currentCategory === "Very Poor" || currentCategory === "Severe";

    return [
      {
        id: 'walk',
        name: 'Walking',
        icon: Footprints,
        status: isGood ? 'Fully Suitable' : isModerate ? 'Moderate Duration' : isPoor ? 'Limit Duration' : 'Avoid Outdoors',
        badgeColor: isGood ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : isModerate ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200',
        detail: isGood 
          ? 'Walking and brisk strolling are suitable for all durations across morning and evening hours.' 
          : isModerate 
          ? 'Walking is generally suitable; take gentle breaks if experiencing minor throat irritation.' 
          : isPoor 
          ? 'Reduce walking time; restrict to short, necessary transit trips rather than leisure.' 
          : 'Avoid outdoor walks. Relocate light walking workouts to indoor spaces or treadmills.'
      },
      {
        id: 'run',
        name: 'Running & Jogging',
        icon: Activity,
        status: isGood ? 'Fully Suitable' : isModerate ? 'Reduce Intensity' : isPoor ? 'Avoid Outdoor Runs' : 'Strictly Avoid',
        badgeColor: isGood ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : isModerate ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200',
        detail: isGood 
          ? 'Jogging and distance running are suitable. Air dispersion supports healthy pulmonary ventilation.' 
          : isModerate 
          ? 'Lower pace and intensity; avoid running along major highway corridors during peak traffic.' 
          : isPoor 
          ? 'Avoid outdoor running due to high particulate inhalation under increased minute ventilation.' 
          : 'Outdoor jogging strictly discouraged. Use an indoor gym or stationary equipment.'
      },
      {
        id: 'cycle',
        name: 'Cycling & Sports',
        icon: Bike,
        status: isGood ? 'Fully Suitable' : isModerate ? 'Caution on Roads' : isPoor ? 'Minimize Cycling' : 'Avoid Outdoors',
        badgeColor: isGood ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : isModerate ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200',
        detail: isGood 
          ? 'Cycling and competitive outdoor sports are generally suitable and safe.' 
          : isModerate 
          ? 'Prefer low-traffic green corridors. Sensitive athletes should moderate workout length.' 
          : isPoor 
          ? 'Minimize cycling; particulate inhalation increases by 3-5x at cycling respiratory rates.' 
          : 'Avoid all outdoor cycling. Switch to indoor stationary cycling in filtered air.'
      },
      {
        id: 'workout',
        name: 'Outdoor Exercise',
        icon: HeartPulse,
        status: isGood ? 'Suitable' : isModerate ? 'Prefer Indoors' : isPoor ? 'Relocate Indoors' : 'Strictly Suspended',
        badgeColor: isGood ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : isModerate ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200',
        detail: isGood 
          ? 'Normal outdoor bodyweight training, yoga, and athletic conditioning are encouraged.' 
          : isModerate 
          ? 'Prefer indoor exercise if experiencing fatigue, throat dryness, or eye stinging.' 
          : isPoor 
          ? 'Relocate all aerobic and high-intensity conditioning indoors to protect airways.' 
          : 'All outdoor exercise suspended. Keep physical exertion low to reduce particulate intake.'
      }
    ];
  }, [currentCategory]);

  // Travel recommendations in clean bullets
  const travelBullets = useMemo(() => {
    if (recs.travel && Array.isArray(recs.travel) && recs.travel.length > 0) {
      return recs.travel;
    }
    if (currentCategory === "Good" || currentCategory === "Satisfactory") {
      return [
        "Normal outdoor commuting across all public and private transportation modes.",
        "Active commuting by bicycle or walking is safe and environmentally beneficial.",
        "Vehicle windows may be kept open during transit outside of dense traffic jams."
      ];
    } else if (currentCategory === "Moderately Polluted") {
      return [
        "Reduce unnecessary prolonged travel along congested arterial roads and traffic bottlenecks.",
        "Close vehicle windows and switch air conditioning to internal recirculation in heavy traffic.",
        "Sensitive commuters should carry a comfortable mask for open auto-rickshaw or bus transit."
      ];
    } else if (currentCategory === "Poor") {
      return [
        "Minimize unnecessary outdoor commuting during peak traffic and morning temperature inversions.",
        "Wear a well-fitted, certified N95 or FFP2 respirator when walking or waiting at outdoor bus stops.",
        "Keep car windows completely rolled up and run cabin air filtration on continuous recirculation."
      ];
    } else {
      return [
        "Avoid unnecessary outdoor exposure; postpone non-critical travel until air quality improves.",
        "If transit is unavoidable, wear a tightly sealed N95/N99 respirator with proper nose seal.",
        "Avoid two-wheelers and open transport; travel only in sealed vehicles with active cabin filtration."
      ];
    }
  }, [recs.travel, currentCategory]);

  // Indoor protection recommendations in clean bullets
  const indoorBullets = useMemo(() => {
    if (recs.indoor_protection && Array.isArray(recs.indoor_protection) && recs.indoor_protection.length > 0) {
      return recs.indoor_protection;
    }
    if (currentCategory === "Good" || currentCategory === "Satisfactory") {
      return [
        "Maintain normal natural ventilation by opening windows during daytime and evening hours.",
        "Baseline indoor conditions are healthy; no special mechanical air purification is required.",
        "Regular home ventilation helps replenish indoor oxygen and disperse indoor VOCs."
      ];
    } else if (currentCategory === "Moderately Polluted") {
      return [
        "Keep windows closed during high-pollution periods, especially early morning and rush hours.",
        "Ventilate rooms briefly during afternoon hours when atmospheric dispersion is favorable.",
        "Sensitive individuals may operate portable HEPA air purifiers in bedrooms for better sleep."
      ];
    } else if (currentCategory === "Poor") {
      return [
        "Keep windows and exterior doors tightly closed to block infiltration of fine ambient particles.",
        "Use air filtration (HEPA air purifier) where available, maintaining fan speed on medium-high.",
        "Use damp-mopping rather than dry sweeping to prevent resuspending settled dust particles."
      ];
    } else {
      return [
        "Stay indoors in clean air; establish a sealed 'Clean Room' with minimal outdoor air leakage.",
        "Run HEPA air purifiers continuously on high mode; monitor indoor PM2.5 levels if possible.",
        "Avoid all indoor combustion sources including incense, mosquito coils, frying, and smoking."
      ];
    }
  }, [recs.indoor_protection, currentCategory]);

  // Action checklist items
  const checklist = advisoryData?.action_checklist || [
    "Check hourly AQI trends before planning outdoor trips",
    "Pace physical workouts and shift heavy training indoors if needed",
    "Keep vehicle windows closed and set AC to recirculation mode",
    "Ensure sensitive family members have necessary medications available",
    "Maintain clean indoor air by wiping surfaces with a damp cloth"
  ];

  // Pollutant analysis data
  const pollutantAnalysis = advisoryData?.pollutant_analysis || {
    major_contributors: [],
    elevated_pollutants: [],
    pollutant_details: {},
    insights: []
  };

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPct = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  // Format time display
  const timeDisplay = timestamp || (new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST');

  return (
    <div className="bg-[#0F1F33] rounded-3xl p-6 sm:p-7 lg:p-8 border border-[#1E3A5F] shadow-xl shadow-black/25 space-y-7 sm:space-y-8 transition-all duration-300 relative overflow-hidden text-slate-100">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & ADVISORY CONTEXT */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#1E3A5F]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0D9B76]/15 text-[#36C5F0] border border-[#0D9B76]/30">
              <Sparkles size={13} className="text-[#36C5F0]" />
              CPCB Smart Advisory
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#13253B] text-slate-300 border border-[#1E3A5F] font-mono">
              <Clock size={12} className="text-slate-400" />
              {isForecast ? "Forecast (t+1)" : "Live Telemetry (t)"}
            </span>

            {station && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#13253B] text-slate-300 border border-[#1E3A5F]">
                <MapPin size={12} className="text-[#36C5F0]" />
                {station}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-[15px] sm:text-base text-slate-300 font-medium mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Observation / Forecast Timestamp Badge */}
        <div className="flex items-center gap-3 text-sm text-slate-300 self-start lg:self-center font-medium bg-[#13253B] px-4 py-2 rounded-2xl border border-[#1E3A5F]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0D9B76] animate-pulse" />
          <span>Updated: <strong className="text-white font-mono font-bold">{timeDisplay}</strong></span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROMINENT AQI SUMMARY HERO CARD */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-7 rounded-3xl border ${catTheme.borderAccent} ${catTheme.bgSoft} shadow-lg relative overflow-hidden transition-all duration-300`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: AQI Value & Category Display */}
          <div className="lg:col-span-5 flex items-center gap-5 sm:gap-6 pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-[#1E3A5F] pb-5 lg:pb-0">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {isForecast ? "Predicted Next-Hour AQI" : "Current Measured AQI"}
              </span>
              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-5xl sm:text-[54px] font-black tracking-tight" style={{ color: catTheme.color }}>
                  {isLoading || fetchingAdvisory ? "..." : roundedAqi}
                </span>
                <span className="text-sm font-bold text-slate-400">/ 500</span>
              </div>
              <span className="text-xs text-slate-400 font-medium mt-1 block">
                Indian CPCB NAQI Standard
              </span>
            </div>

            <div className="h-14 w-px bg-[#1E3A5F] hidden sm:block" />

            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Category
              </span>
              <AqiBadge aqi={roundedAqi} size="lg" />
              <span className="text-xs text-slate-300 font-bold block pt-1">
                {isForecast ? "Target Horizon: t+1 hour" : "Continuous Ingestion"}
              </span>
            </div>
          </div>

          {/* Right Column: Health Risk Assessment & Primary Precaution */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Health Risk Assessment
              </span>
              <p className="text-[15px] sm:text-base text-slate-200 leading-relaxed font-medium">
                {healthDescription}
              </p>
            </div>

            {/* Primary Precautionary Callout Banner */}
            <div className={`p-4 rounded-2xl border ${catTheme.primaryPrecautionBg} flex items-start gap-3 shadow-md`}>
              <div className="w-8 h-8 rounded-xl bg-[#0F1F33] border border-[#1E3A5F] flex items-center justify-center shrink-0 mt-0.5" style={{ color: catTheme.color }}>
                <catTheme.highlightIcon size={18} />
              </div>
              <div>
                <strong className="text-sm font-bold block text-white mb-0.5">
                  Primary Precautionary Guidance:
                </strong>
                <p className="text-[14px] sm:text-[15px] leading-relaxed font-medium text-slate-200">
                  {primaryPrecaution}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-b border-[#1E3A5F] no-scrollbar">
        {[
          { id: 'all', label: 'All Advisories', icon: Activity },
          { id: 'health', label: 'Health & Medical', icon: HeartPulse },
          { id: 'outdoor', label: 'Outdoor & Travel', icon: Footprints },
          { id: 'indoor', label: 'Indoor Protection', icon: Home },
          { id: 'pollutants', label: 'Pollutant Intelligence', icon: Wind }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive 
                  ? 'bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] text-white shadow-md shadow-[#0D9B76]/30' 
                  : 'bg-[#13253B] text-slate-400 hover:text-white hover:bg-[#182F4B] border border-[#1E3A5F]'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 4. SPACIOUS TWO-COLUMN RESPONSIVE RECOMMENDATION GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7">
        
        {/* CARD 1: HEALTH ADVISORY & MEDICAL PRECAUTIONS */}
        {(activeTab === 'all' || activeTab === 'health') && (
          <div className="bg-[#0F1F33] p-6 sm:p-7 rounded-3xl border border-[#1E3A5F] shadow-md hover:border-[#36C5F0]/40 transition-all flex flex-col justify-between space-y-5 card-hover">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold border border-rose-500/30">
                    <HeartPulse size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Health Advisory & Precautions
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">
                      Physiological guidance for general and vulnerable groups
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${catTheme.badgeBg}`}>
                  {currentCategory}
                </span>
              </div>

              {/* Scannable Bullet Points */}
              <div className="space-y-3 pt-1">
                {healthRecs.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#13253B] border border-[#1E3A5F] text-slate-200">
                    <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: catTheme.color }} />
                    <p className="text-[15px] leading-relaxed font-medium">
                      {bullet}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 text-xs text-slate-400 font-medium border-t border-[#1E3A5F] flex items-center justify-between">
              <span>Applies to: Asthma • COPD • Cardiac • Elderly • Children</span>
              <span className="text-[#36C5F0]">Medical Advisory</span>
            </div>
          </div>
        )}

        {/* CARD 2: OUTDOOR ACTIVITIES GUIDANCE */}
        {(activeTab === 'all' || activeTab === 'outdoor') && (
          <div className="bg-[#0F1F33] p-6 sm:p-7 rounded-3xl border border-[#1E3A5F] shadow-md hover:border-[#36C5F0]/40 transition-all flex flex-col justify-between space-y-5 card-hover">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#36C5F0]/15 text-[#36C5F0] flex items-center justify-center font-bold border border-[#36C5F0]/30">
                    <Footprints size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Outdoor Activity Recommendations
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">
                      Suitability for walking, running, cycling & sports
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${catTheme.outdoorBadge}`}>
                  {catTheme.outdoorStatus}
                </span>
              </div>

              {/* 4 Dedicated Activity Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {activityData.map((act) => {
                  const ActIcon = act.icon;
                  return (
                    <div key={act.id} className="p-4 rounded-2xl bg-[#13253B] border border-[#1E3A5F] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white flex items-center gap-1.5">
                          <ActIcon size={16} className="text-[#36C5F0]" />
                          {act.name}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${act.badgeColor}`}>
                          {act.status}
                        </span>
                      </div>
                      <p className="text-[13.5px] sm:text-[14px] text-slate-300 leading-relaxed font-medium">
                        {act.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 text-xs text-slate-400 font-medium border-t border-[#1E3A5F] flex items-center justify-between">
              <span>Best Window: {currentCategory === "Good" || currentCategory === "Satisfactory" ? "Anytime throughout the day" : "Afternoon dispersion period"}</span>
              <span className="text-[#0D9B76]">Cardio Safety</span>
            </div>
          </div>
        )}

        {/* CARD 3: TRAVEL & COMMUTE ADVISORY */}
        {(activeTab === 'all' || activeTab === 'outdoor') && (
          <div className="bg-[#0F1F33] p-6 sm:p-7 rounded-3xl border border-[#1E3A5F] shadow-md hover:border-[#36C5F0]/40 transition-all flex flex-col justify-between space-y-5 card-hover">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
                    <Car size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Travel & Commute Advisory
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">
                      Transit precautions, masking & vehicle exposure
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {catTheme.travelStatus}
                </span>
              </div>

              {/* Scannable Bullets */}
              <div className="space-y-3 pt-1">
                {travelBullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#13253B] border border-[#1E3A5F] text-slate-200">
                    <span className="w-2 h-2 rounded-full mt-2 shrink-0 bg-[#36C5F0]" />
                    <p className="text-[15px] leading-relaxed font-medium">
                      {bullet}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 text-xs text-slate-400 font-medium border-t border-[#1E3A5F] flex items-center justify-between">
              <span>Mask Guidance: {currentCategory === "Good" || currentCategory === "Satisfactory" ? "Not required" : "N95 / FFP2 certified respirator"}</span>
              <span className="text-[#36C5F0]">Transit Protocols</span>
            </div>
          </div>
        )}

        {/* CARD 4: INDOOR AIR PROTECTION */}
        {(activeTab === 'all' || activeTab === 'indoor') && (
          <div className="bg-[#0F1F33] p-6 sm:p-7 rounded-3xl border border-[#1E3A5F] shadow-md hover:border-[#36C5F0]/40 transition-all flex flex-col justify-between space-y-5 card-hover">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0D9B76]/15 text-[#0D9B76] flex items-center justify-center font-bold border border-[#0D9B76]/30">
                    <Home size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Indoor Air Protection
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">
                      Natural ventilation timing & HEPA air purification
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#0D9B76]/15 text-[#0D9B76] border border-[#0D9B76]/30">
                  {catTheme.indoorStatus}
                </span>
              </div>

              {/* Scannable Bullets */}
              <div className="space-y-3 pt-1">
                {indoorBullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#13253B] border border-[#1E3A5F] text-slate-200">
                    <span className="w-2 h-2 rounded-full mt-2 shrink-0 bg-[#0D9B76]" />
                    <p className="text-[15px] leading-relaxed font-medium">
                      {bullet}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 text-xs text-slate-400 font-medium border-t border-[#1E3A5F] flex items-center justify-between">
              <span>Filtration: {currentCategory === "Good" || currentCategory === "Satisfactory" ? "Natural ventilation" : "Continuous HEPA filtration"}</span>
              <span className="text-[#0D9B76]">Indoor Safety</span>
            </div>
          </div>
        )}

        {/* CARD 5: RECOMMENDED ACTIONS CHECKLIST */}
        {(activeTab === 'all' || activeTab === 'health' || activeTab === 'outdoor' || activeTab === 'indoor') && (
          <div className="bg-[#0F1F33] p-6 sm:p-7 rounded-3xl border border-[#1E3A5F] shadow-md hover:border-[#36C5F0]/40 transition-all flex flex-col justify-between space-y-5 card-hover">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
                    <CheckSquare size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Recommended Action Checklist
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">
                      Actionable steps tailored to current air conditions
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-200 bg-[#13253B] px-3 py-1 rounded-full font-mono border border-[#1E3A5F]">
                  {completedCount}/{checklist.length} Done ({progressPct}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-[#13253B] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Interactive Checklist Items */}
              <div className="space-y-2.5 pt-1">
                {checklist.map((item, idx) => {
                  const isChecked = Boolean(checkedItems[idx]);

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isChecked 
                          ? 'bg-[#0D9B76]/15 border-[#0D9B76]/40 text-emerald-300 line-through opacity-85' 
                          : 'bg-[#13253B] border-[#1E3A5F] text-slate-200 hover:border-[#36C5F0]/50 hover:bg-[#182F4B]'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare size={18} className="text-[#0D9B76] shrink-0 mt-0.5" />
                      ) : (
                        <Square size={18} className="text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className="text-[15px] font-medium leading-snug">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 text-xs text-slate-400 font-medium border-t border-[#1E3A5F] flex items-center justify-between">
              <span>Interactive Checklist • Click to toggle completion</span>
              <span className="text-[#36C5F0]">Action Plan</span>
            </div>
          </div>
        )}

        {/* CARD 6: MAJOR POLLUTANT CONTRIBUTORS */}
        {(activeTab === 'all' || activeTab === 'pollutants') && (
          <div className="bg-[#0F1F33] p-6 sm:p-7 rounded-3xl border border-[#1E3A5F] shadow-md hover:border-[#36C5F0]/40 transition-all flex flex-col justify-between space-y-5 card-hover">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Major Pollutant Contributors
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">
                      Criteria pollutants audited against CPCB NAAQS limits
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-300 bg-purple-500/15 px-3 py-1 rounded-full border border-purple-500/30">
                  NAAQS Audited
                </span>
              </div>

              {/* Major Contributors List */}
              {pollutantAnalysis.major_contributors && pollutantAnalysis.major_contributors.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  {pollutantAnalysis.major_contributors.map((pol) => (
                    <div key={pol.key} className="p-3.5 rounded-2xl bg-[#13253B] border border-[#1E3A5F] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-[15px] font-mono">{pol.name}</span>
                          <span className="text-xs text-slate-400 font-medium">({pol.full_name || pol.name})</span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono font-bold mt-0.5 block">
                          Concentration: {pol.value} {pol.unit} (CPCB Std: {pol.standard} {pol.unit})
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block ${
                          pol.is_elevated ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-[#0B1724] text-slate-300 border border-[#1E3A5F]'
                        }`}>
                          {pol.percentage_of_standard}% limit
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono mt-1 font-semibold">
                          {pol.is_elevated ? "Exceeding Limit" : "Compliant"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#13253B] border border-[#1E3A5F] text-sm text-slate-400 font-medium italic">
                  Criteria pollutant telemetry being compiled from monitoring station.
                </div>
              )}
            </div>

            <div className="pt-3 text-xs text-slate-400 font-medium border-t border-[#1E3A5F] flex items-center justify-between">
              <span>Standards: PM2.5 (60 µg/m³), PM10 (100 µg/m³), NO₂ (80 µg/m³)</span>
              <span className="text-purple-300">Chemical Speciation</span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. FULL CRITERIA POLLUTANT SPECIATION DETAILS */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'pollutants') && pollutantAnalysis.available_count > 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-[#0F1F33] border border-[#1E3A5F] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E3A5F]">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wind size={18} className="text-[#36C5F0]" />
                <span>Criteria Pollutant Concentrations & Biological Relevance</span>
              </h3>
              <p className="text-sm text-slate-400 font-medium mt-0.5">
                Individual chemical species evaluated against National Ambient Air Quality Standards (NAAQS)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-300 bg-[#13253B] px-3 py-1 rounded-full border border-[#1E3A5F] shrink-0">
              {pollutantAnalysis.available_count} Pollutants Monitored
            </span>
          </div>

          {/* 6 Pollutant Metric Cards in clean 2x3 grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {['PM25', 'PM10', 'NO2', 'SO2', 'CO', 'O3'].map((key) => {
              const detail = pollutantAnalysis.pollutant_details?.[key];
              if (!detail) return null;

              return (
                <div key={key} className="p-4 rounded-2xl bg-[#13253B] border border-[#1E3A5F] shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white font-mono">{detail.name}</span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: detail.status_color }} />
                  </div>

                  <div className="text-lg sm:text-xl font-black font-mono text-white">
                    {detail.value} <span className="text-xs font-normal text-slate-400">{detail.unit}</span>
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    Std: {detail.standard} {detail.unit}
                  </div>

                  <div className="pt-2 border-t border-[#1E3A5F] flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Ratio</span>
                    <span style={{ color: detail.status_color }}>{detail.percentage_of_standard}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scientific Insights Callout */}
          {pollutantAnalysis.insights && pollutantAnalysis.insights.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Chemical Speciation & Exposure Insights:
              </span>
              <div className="space-y-2">
                {pollutantAnalysis.insights.map((insight, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#13253B] border border-[#1E3A5F] text-[14px] sm:text-[15px] text-slate-200 leading-relaxed flex items-start gap-3">
                    <Info size={16} className="text-[#36C5F0] shrink-0 mt-0.5" />
                    <span className="font-medium">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. FOOTER DISCLAIMER */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#1E3A5F] text-xs text-slate-400 font-medium">
        <span>
          <strong className="text-slate-300">Advisory Standard:</strong> Indian CPCB National Air Quality Index (NAQI) guidelines & NAAQS thresholds.
        </span>
        <span className="italic text-slate-500">
          Precautionary health guidance • Not individualized medical diagnosis
        </span>
      </div>
    </div>
  );
}
