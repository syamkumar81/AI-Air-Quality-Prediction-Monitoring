import React from 'react';
import { 
  CloudRain, 
  Activity, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  ArrowRight, 
  Wind, 
  Droplets, 
  Compass, 
  ShieldCheck, 
  ShieldAlert,
  Sparkles,
  Zap,
  Layers
} from 'lucide-react';

export const PREDICTION_SCENARIOS = [
  {
    id: 'favorable',
    presetKey: 'clean',
    scenarioNumber: '1',
    scenarioType: 'Best-Case',
    badgeClass: 'bg-[#0D9B76]/15 text-[#36C5F0] border-[#0D9B76]/40 shadow-xs',
    title: 'Favorable Dispersion & Sea Breeze',
    subtitle: 'Maritime ventilation & aerosol washout',
    icon: CloudRain,
    iconColor: 'text-[#36C5F0]',
    iconBg: 'bg-[#0D9B76]/20',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    gradientBg: 'from-[#13253B] via-[#0F1F33] to-[#0B1724]',
    headerAccent: 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent',
    projectedAqi: '35 – 48',
    projectedCategory: 'Good',
    categoryColor: '#10B981',
    trendIcon: TrendingDown,
    trendText: '↓ Sharp Drop (−35 to −50 AQI)',
    trendClass: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
    metrics: [
      { label: 'Wind Speed', value: '18.5 km/h', note: 'Maritime Sea Breeze' },
      { label: 'Wind Direction', value: '90° (East)', note: 'Onshore Wind' },
      { label: 'Humidity', value: '62.0%', note: 'Moderate' },
      { label: 'PM2.5 / PM10', value: '12.4 / 28.5', note: 'µg/m³' }
    ],
    mechanism: 'Strong coastal onshore winds elevate planetary boundary layer mixing height (>1,200m). Rapid advection and precipitation scavenging flush criteria aerosols seaward.',
    healthAdvisory: 'Air quality is optimal. Safe for unrestricted outdoor athletics, running, and natural room ventilation.',
    buttonText: 'Simulate Best-Case Scenario',
    buttonClass: 'bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] text-white shadow-md shadow-[#0D9B76]/30'
  },
  {
    id: 'baseline',
    presetKey: 'baseline',
    scenarioNumber: '2',
    scenarioType: 'Baseline (Realistic)',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-xs',
    title: 'Diurnal Persistence & Steady Flow',
    subtitle: 'Typical seasonal meteorology & urban equilibrium',
    icon: Activity,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    borderColor: 'border-blue-500/40 hover:border-blue-400',
    gradientBg: 'from-[#13253B] via-[#0F1F33] to-[#0B1724]',
    headerAccent: 'bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-transparent',
    projectedAqi: '85 – 105',
    projectedCategory: 'Satisfactory / Moderate',
    categoryColor: '#3B82F6',
    trendIcon: ArrowRight,
    trendText: '→ Steady Diurnal Drift (±5 to 12 AQI)',
    trendClass: 'text-blue-300 bg-blue-500/15 border-blue-500/30',
    metrics: [
      { label: 'Wind Speed', value: '2.8 m/s', note: 'Moderate urban breeze' },
      { label: 'Wind Direction', value: '160° (SSE)', note: 'Seasonal prevailing' },
      { label: 'Humidity', value: '75.0%', note: 'Seasonal normal' },
      { label: 'PM2.5 / PM10', value: '46.9 / 104.0', note: 'µg/m³' }
    ],
    mechanism: 'Emission rates from local transport balance natural atmospheric dispersion. Model autoregressive lag coefficients (t−1, t−2, t−3) maintain temporal inertia with diurnal rhythm.',
    healthAdvisory: 'Acceptable for healthy individuals. Unusually sensitive individuals with asthma or COPD should consider pacing strenuous outdoor activities.',
    buttonText: 'Simulate Baseline Scenario',
    buttonClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
  },
  {
    id: 'inversion',
    presetKey: 'inversion',
    scenarioNumber: '3',
    scenarioType: 'Worst-Case',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs',
    title: 'Thermal Inversion & Stagnant Smog',
    subtitle: 'Nocturnal boundary layer capping trap & calm wind',
    icon: AlertTriangle,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/20',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    gradientBg: 'from-[#13253B] via-[#0F1F33] to-[#0B1724]',
    headerAccent: 'bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent',
    projectedAqi: '180 – 230+',
    projectedCategory: 'Moderate / Poor',
    categoryColor: '#EF4444',
    trendIcon: TrendingUp,
    trendText: '↑ Severe Smog Spike (+45 to +85 AQI)',
    trendClass: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
    metrics: [
      { label: 'Wind Speed', value: '0.8 m/s', note: 'Near-calm stagnation' },
      { label: 'Wind Direction', value: '45° (NE)', note: 'Inversion drainage' },
      { label: 'Humidity', value: '88.0%', note: 'High hygroscopic growth' },
      { label: 'PM2.5 / PM10', value: '142.5 / 235.0', note: 'µg/m³' }
    ],
    mechanism: 'A warm atmospheric capping layer traps ground emissions within a shallow boundary layer (<250m). High moisture accelerates secondary aerosol nucleation with zero ventilation.',
    healthAdvisory: 'Air pollution alert. Sensitive groups should stay indoors and run HEPA filtration; general population should wear N95 particulate respirators outdoors.',
    buttonText: 'Simulate Worst-Case Scenario',
    buttonClass: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
  }
];

export default function PredictionScenariosSection({ onSelectScenario, currentMode = 'live', currentAqi = null }) {
  return (
    <div className="bg-[#0F1F33] rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] shadow-xl space-y-6 text-slate-100">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1E3A5F]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#0D9B76]/15 text-[#36C5F0] border border-[#0D9B76]/30">
              <Sparkles size={12} className="text-[#36C5F0]" />
              Meteorological Sensitivity Analysis
            </span>
            <span className="text-xs text-slate-400 font-medium font-mono hidden sm:inline">
              3 Benchmark Cases
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Next-Hour AQI Prediction Scenarios
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Atmospheric conditions strongly modulate the next-hour forecast. Below are three representative meteorological scenarios evaluated against our Linear Regression autoregressive model.
          </p>
        </div>

        {currentAqi !== null && (
          <div className="shrink-0 bg-[#13253B] p-3 rounded-2xl border border-[#1E3A5F] flex items-center gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Live Reference (t)
              </span>
              <span className="text-lg font-black text-white font-mono">
                {currentAqi} AQI
              </span>
            </div>
            <div className="w-px h-8 bg-[#1E3A5F]" />
            <div className="text-[11px] text-slate-400 font-medium">
              Station 2586<br />
              <strong className="text-slate-200">Manali, Chennai</strong>
            </div>
          </div>
        )}
      </div>

      {/* 3 Scenario Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PREDICTION_SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          const TrendIcon = scenario.trendIcon;

          return (
            <div
              key={scenario.id}
              className={`rounded-2xl border bg-gradient-to-b ${scenario.gradientBg} ${scenario.borderColor} p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative group card-hover`}
            >
              <div className="space-y-4">
                {/* Card Top: Badges & Scenario Number */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${scenario.badgeClass}`}>
                    Scenario {scenario.scenarioNumber}: {scenario.scenarioType}
                  </span>
                  <div className={`w-8 h-8 rounded-xl ${scenario.iconBg} ${scenario.iconColor} flex items-center justify-center shrink-0`}>
                    <Icon size={16} />
                  </div>
                </div>

                {/* Scenario Title & Subtitle */}
                <div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-[#36C5F0] transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {scenario.subtitle}
                  </p>
                </div>

                {/* Forecast Outcome Box */}
                <div className="p-3.5 rounded-xl bg-[#0B1724]/80 border border-[#1E3A5F] shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Forecasted AQI
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: `${scenario.categoryColor}20`, color: scenario.categoryColor }}>
                      {scenario.projectedCategory}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight" style={{ color: scenario.categoryColor }}>
                      {scenario.projectedAqi}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${scenario.trendClass}`}>
                      <TrendIcon size={12} />
                      <span>{scenario.trendText}</span>
                    </span>
                  </div>
                </div>

                {/* Meteorological Drivers Grid */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Atmospheric Drivers & Parameters
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {scenario.metrics.map((m, idx) => (
                      <div key={idx} className="bg-[#0B1724]/70 p-2 rounded-lg border border-[#1E3A5F]">
                        <span className="text-[10px] text-slate-400 block font-medium">{m.label}</span>
                        <span className="font-extrabold text-white font-mono text-xs">{m.value}</span>
                        <span className="text-[9px] text-slate-400 block">{m.note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dispersion Physics & Mechanism */}
                <div className="text-xs text-slate-300 bg-[#0B1724]/70 p-3 rounded-xl border border-[#1E3A5F] leading-relaxed">
                  <strong className="text-white font-bold block mb-1 flex items-center gap-1.5 text-[11px]">
                    <Layers size={12} className="text-[#36C5F0]" />
                    Atmospheric Mechanism:
                  </strong>
                  {scenario.mechanism}
                </div>

                {/* Health & Public Guidance */}
                <div className="text-[11px] text-slate-300 bg-[#0B1724]/70 p-3 rounded-xl border border-[#1E3A5F] leading-relaxed">
                  <strong className="text-white font-bold block mb-0.5 flex items-center gap-1.5">
                    {scenario.id === 'favorable' ? (
                      <ShieldCheck size={13} className="text-[#0D9B76]" />
                    ) : scenario.id === 'baseline' ? (
                      <ShieldCheck size={13} className="text-[#36C5F0]" />
                    ) : (
                      <ShieldAlert size={13} className="text-rose-400" />
                    )}
                    Advisory:
                  </strong>
                  {scenario.healthAdvisory}
                </div>
              </div>

              {/* Action Button to Simulate Scenario */}
              <div className="pt-4 mt-4 border-t border-[#1E3A5F]">
                <button
                  type="button"
                  onClick={() => onSelectScenario && onSelectScenario(scenario.presetKey)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md ${scenario.buttonClass}`}
                >
                  <Zap size={14} />
                  <span>{currentMode === 'manual' ? `Load ${scenario.scenarioType} Inputs` : scenario.buttonText}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Insight Footer Callout */}
      <div className="p-4 rounded-2xl bg-[#13253B] border border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#36C5F0]" />
          <span>
            <strong className="text-white">Model Physics Note:</strong> Autoregressive terms (<code className="bg-[#0B1724] px-1 py-0.5 rounded font-mono text-[11px] text-[#36C5F0] border border-[#1E3A5F]">AQI_lag_1</code>, <code className="bg-[#0B1724] px-1 py-0.5 rounded font-mono text-[11px] text-[#36C5F0] border border-[#1E3A5F]">lag_2</code>, <code className="bg-[#0B1724] px-1 py-0.5 rounded font-mono text-[11px] text-[#36C5F0] border border-[#1E3A5F]">lag_3</code>) establish inertia, while wind speed and relative humidity dictate dispersion scale.
          </span>
        </div>
        <span className="text-slate-400 font-mono text-[11px] shrink-0">
          Linear Regression • CPCB NAQI
        </span>
      </div>
    </div>
  );
}
