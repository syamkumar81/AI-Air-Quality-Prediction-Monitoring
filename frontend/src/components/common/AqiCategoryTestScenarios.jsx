import React from 'react';
import { 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Gauge, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export const CPCB_TEST_SCENARIOS = [
  {
    id: 1,
    number: "Scenario 1",
    category: "Good",
    range: "0–50",
    expectedAqi: 35,
    healthImpact: "Minimal impact. Clean ambient air with negligible health risk.",
    theme: {
      color: "#0D9B76", // Emerald Green
      cardBorder: "border-[#0D9B76]/40 hover:border-[#0D9B76]",
      cardBg: "bg-gradient-to-b from-[#0D9B76]/15 via-[#0F1F33] to-[#13253B]",
      badgeClass: "bg-[#0D9B76]/20 text-[#36C5F0] border-[#0D9B76]/40 font-bold",
      buttonClass: "bg-[#0D9B76] hover:bg-[#0D9B76]/90 text-white shadow-[0_0_12px_rgba(13,155,118,0.3)]",
      accentDot: "bg-[#0D9B76]",
      textClass: "text-[#36C5F0]",
      ringColor: "ring-2 ring-[#0D9B76] border-[#0D9B76] shadow-lg shadow-[#0D9B76]/20"
    },
    features: {
      pm25: "18.5",
      pm10: "34.0",
      no2: "9.2",
      so2: "4.5",
      co: "0.0005",
      o3: "24.0",
      humidity: "60.0",
      windSpeed: "14.5",
      windDirection: "90.0",
      currentAqi: "35.0",
      aqiLag1: "36.0",
      aqiLag2: "38.0",
      aqiLag3: "40.0",
      hour: "14",
      dayOfWeek: "3",
      month: "7"
    }
  },
  {
    id: 2,
    number: "Scenario 2",
    category: "Satisfactory",
    range: "51–100",
    expectedAqi: 85,
    healthImpact: "Minor breathing discomfort may occur in sensitive individuals.",
    theme: {
      color: "#22C55E", // Light Green
      cardBorder: "border-green-500/40 hover:border-green-400",
      cardBg: "bg-gradient-to-b from-green-950/40 via-[#0F1F33] to-[#13253B]",
      badgeClass: "bg-green-500/20 text-green-300 border-green-500/40 font-bold",
      buttonClass: "bg-green-600 hover:bg-green-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.3)]",
      accentDot: "bg-green-500",
      textClass: "text-green-300",
      ringColor: "ring-2 ring-green-500 border-green-500 shadow-lg shadow-green-500/20"
    },
    features: {
      pm25: "48.0",
      pm10: "88.0",
      no2: "18.5",
      so2: "9.8",
      co: "0.0012",
      o3: "15.0",
      humidity: "72.0",
      windSpeed: "3.5",
      windDirection: "160.0",
      currentAqi: "85.0",
      aqiLag1: "84.0",
      aqiLag2: "86.0",
      aqiLag3: "85.0",
      hour: "11",
      dayOfWeek: "2",
      month: "9"
    }
  },
  {
    id: 3,
    number: "Scenario 3",
    category: "Moderately Polluted",
    range: "101–200",
    expectedAqi: 150,
    healthImpact: "Breathing discomfort to people with asthma, lung, and heart diseases.",
    theme: {
      color: "#EAB308", // Yellow
      cardBorder: "border-yellow-500/40 hover:border-yellow-400",
      cardBg: "bg-gradient-to-b from-yellow-950/40 via-[#0F1F33] to-[#13253B]",
      badgeClass: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-bold",
      buttonClass: "bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(234,179,8,0.3)]",
      accentDot: "bg-yellow-500",
      textClass: "text-yellow-300",
      ringColor: "ring-2 ring-yellow-500 border-yellow-500 shadow-lg shadow-yellow-500/20"
    },
    features: {
      pm25: "82.0",
      pm10: "165.0",
      no2: "38.0",
      so2: "16.5",
      co: "0.0022",
      o3: "18.0",
      humidity: "78.0",
      windSpeed: "2.0",
      windDirection: "190.0",
      currentAqi: "150.0",
      aqiLag1: "148.0",
      aqiLag2: "146.0",
      aqiLag3: "142.0",
      hour: "9",
      dayOfWeek: "1",
      month: "10"
    }
  },
  {
    id: 4,
    number: "Scenario 4",
    category: "Poor",
    range: "201–300",
    expectedAqi: 250,
    healthImpact: "Breathing discomfort to most people on prolonged outdoor exposure.",
    theme: {
      color: "#F97316", // Orange
      cardBorder: "border-orange-500/40 hover:border-orange-400",
      cardBg: "bg-gradient-to-b from-orange-950/40 via-[#0F1F33] to-[#13253B]",
      badgeClass: "bg-orange-500/20 text-orange-300 border-orange-500/40 font-bold",
      buttonClass: "bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]",
      accentDot: "bg-orange-500",
      textClass: "text-orange-300",
      ringColor: "ring-2 ring-orange-500 border-orange-500 shadow-lg shadow-orange-500/20"
    },
    features: {
      pm25: "115.0",
      pm10: "280.0",
      no2: "62.0",
      so2: "25.0",
      co: "0.0038",
      o3: "22.0",
      humidity: "82.0",
      windSpeed: "1.2",
      windDirection: "45.0",
      currentAqi: "250.0",
      aqiLag1: "245.0",
      aqiLag2: "238.0",
      aqiLag3: "230.0",
      hour: "8",
      dayOfWeek: "1",
      month: "11"
    }
  },
  {
    id: 5,
    number: "Scenario 5",
    category: "Very Poor",
    range: "301–400",
    expectedAqi: 350,
    healthImpact: "Respiratory illness on prolonged exposure. Significant hazard to vulnerable groups.",
    theme: {
      color: "#EF4444", // Red
      cardBorder: "border-rose-500/40 hover:border-rose-400",
      cardBg: "bg-gradient-to-b from-rose-950/40 via-[#0F1F33] to-[#13253B]",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold",
      buttonClass: "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]",
      accentDot: "bg-rose-500",
      textClass: "text-rose-300",
      ringColor: "ring-2 ring-rose-500 border-rose-500 shadow-lg shadow-rose-500/20"
    },
    features: {
      pm25: "185.0",
      pm10: "380.0",
      no2: "85.0",
      so2: "36.0",
      co: "0.0055",
      o3: "28.0",
      humidity: "86.0",
      windSpeed: "0.7",
      windDirection: "30.0",
      currentAqi: "350.0",
      aqiLag1: "342.0",
      aqiLag2: "335.0",
      aqiLag3: "320.0",
      hour: "7",
      dayOfWeek: "4",
      month: "12"
    }
  },
  {
    id: 6,
    number: "Scenario 6",
    category: "Severe",
    range: "401–500+",
    expectedAqi: 450,
    healthImpact: "Affects healthy individuals and severely impacts those with existing disease.",
    theme: {
      color: "#991B1B", // Dark Red
      cardBorder: "border-red-700/50 hover:border-red-500",
      cardBg: "bg-gradient-to-b from-red-950/60 via-[#0F1F33] to-[#13253B]",
      badgeClass: "bg-red-900/40 text-red-300 border-red-700/60 font-bold",
      buttonClass: "bg-red-800 hover:bg-red-700 text-white shadow-[0_0_12px_rgba(153,27,27,0.4)]",
      accentDot: "bg-red-600",
      textClass: "text-red-300",
      ringColor: "ring-2 ring-red-600 border-red-600 shadow-lg shadow-red-700/30"
    },
    features: {
      pm25: "320.0",
      pm10: "480.0",
      no2: "120.0",
      so2: "52.0",
      co: "0.0080",
      o3: "35.0",
      humidity: "90.0",
      windSpeed: "0.4",
      windDirection: "20.0",
      currentAqi: "450.0",
      aqiLag1: "445.0",
      aqiLag2: "438.0",
      aqiLag3: "425.0",
      hour: "6",
      dayOfWeek: "0",
      month: "1"
    }
  }
];

export default function AqiCategoryTestScenarios({
  selectedScenario,
  onSelectScenario,
  isPredicting,
  manualResult,
  onRunPrediction
}) {
  return (
    <div className="bg-[#0F1F33] rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] shadow-[0_10px_35px_rgba(0,0,0,0.35)] space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1E3A5F]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#0D9B76]/15 text-[#36C5F0] border border-[#0D9B76]/30 shadow-[0_0_12px_rgba(13,155,118,0.2)]">
              <Sparkles size={12} className="text-[#36C5F0]" />
              CPCB Official Classification
            </span>
            <span className="text-xs text-slate-400 font-medium font-mono hidden sm:inline">
              6 Standardized Test Scenarios
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            AQI Category Test Scenarios
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Select any predefined scenario based on the official Indian CPCB AQI scale. Clicking <strong>"Test This Scenario"</strong> will automatically populate all 16 model feature inputs with realistic pollutant & atmospheric values.
          </p>
        </div>

        {selectedScenario && (
          <div className="shrink-0 bg-[#13253B] p-3 rounded-2xl border border-[#1E3A5F] flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#36C5F0] animate-pulse shadow-[0_0_8px_rgba(54,197,240,0.6)]" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Test Target
                </span>
                <span className="text-sm font-extrabold text-white font-mono">
                  {selectedScenario.number}: {selectedScenario.category} (Expected: {selectedScenario.expectedAqi})
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isPredicting}
              onClick={onRunPrediction}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] hover:from-[#0D9B76]/90 hover:to-[#36C5F0]/90 text-white font-bold text-xs shadow-md shadow-[#0D9B76]/30 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Zap size={13} className={isPredicting ? "animate-spin" : ""} />
              <span>{isPredicting ? "Predicting..." : "⚡ Run Prediction"}</span>
            </button>
          </div>
        )}
      </div>

      {/* 6 Responsive Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CPCB_TEST_SCENARIOS.map((scenario) => {
          const isSelected = selectedScenario?.id === scenario.id;

          return (
            <div
              key={scenario.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 relative group hover:shadow-md hover:-translate-y-1 ${scenario.theme.cardBg} ${scenario.theme.cardBorder} ${
                isSelected ? scenario.theme.ringColor : ''
              }`}
            >
              {/* Card Top: Number & Category Badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {scenario.number}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${scenario.theme.badgeClass}`}>
                    {scenario.category}
                  </span>
                </div>

                {/* Expected AQI display */}
                <div className="flex items-baseline justify-between mb-2 pb-2 border-b border-[#1E3A5F]">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Expected AQI
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span 
                      className="text-3xl font-black font-mono tracking-tight"
                      style={{ color: scenario.theme.color }}
                    >
                      {scenario.expectedAqi}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium font-mono">
                      ({scenario.range})
                    </span>
                  </div>
                </div>

                {/* Short health impact */}
                <p className="text-xs text-slate-300 leading-relaxed min-h-[38px] my-2">
                  {scenario.healthImpact}
                </p>

                {/* Key parameters preview */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-[#0B1724]/70 p-2.5 rounded-xl border border-[#1E3A5F] my-3 font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">PM2.5 / PM10:</span>
                    <span className="font-bold text-white">{scenario.features.pm25} / {scenario.features.pm10}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Wind / Humid:</span>
                    <span className="font-bold text-white">{scenario.features.windSpeed}m/s / {scenario.features.humidity}%</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Test This Scenario */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isPredicting}
                  onClick={() => {
                    if (isSelected && onRunPrediction) {
                      onRunPrediction();
                    } else {
                      onSelectScenario(scenario);
                    }
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-sm ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] text-white shadow-md shadow-[#0D9B76]/30' 
                      : scenario.theme.buttonClass
                  }`}
                >
                  <Zap size={14} className={isPredicting && isSelected ? "animate-spin" : isSelected ? "text-amber-300" : ""} />
                  <span>
                    {isPredicting && isSelected 
                      ? "Running Model Inference..." 
                      : isSelected 
                      ? "⚡ Run Prediction for Scenario" 
                      : "Test This Scenario"}
                  </span>
                  {!isPredicting && <ArrowRight size={13} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expected vs Actual Comparison Section */}
      {selectedScenario && manualResult && Number.isFinite(manualResult.predicted_aqi) && (
        <div className="mt-8 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0B1724] via-[#0F1F33] to-[#13253B] border border-[#1E3A5F] text-white shadow-xl space-y-6 animate-fadeIn">
          {/* Comparison Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E3A5F]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0D9B76] animate-pulse shadow-[0_0_8px_rgba(13,155,118,0.6)]" />
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Model Verification: Expected vs Actual AQI</span>
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Inference tested via trained Linear Regression model
            </span>
          </div>

          {/* Metrics comparison cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Expected AQI */}
            <div className="p-4 rounded-2xl bg-[#13253B] border border-[#1E3A5F] space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Expected AQI (Target)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                  {selectedScenario.expectedAqi}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: `${selectedScenario.theme.color}30`, color: selectedScenario.theme.color }}>
                  {selectedScenario.category}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">
                CPCB Standard Benchmark
              </span>
            </div>

            {/* 2. Actual Predicted AQI */}
            <div className="p-4 rounded-2xl bg-[#36C5F0]/15 border border-[#36C5F0]/40 space-y-1.5 shadow-[0_0_15px_rgba(54,197,240,0.15)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#36C5F0] block">
                Actual Predicted AQI
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-cyan-300">
                  {manualResult.predicted_aqi.toFixed(2)}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#13253B] text-white border border-[#1E3A5F]">
                  {manualResult.predicted_category || "Inferred"}
                </span>
              </div>
              <span className="text-[10px] text-cyan-200 block font-mono">
                ML Model Output (t+1)
              </span>
            </div>

            {/* 3. Prediction Error */}
            {(() => {
              const diff = Math.abs(manualResult.predicted_aqi - selectedScenario.expectedAqi);
              const isMinimal = diff <= 5;

              return (
                <div className={`p-4 rounded-2xl backdrop-blur-md border space-y-1.5 ${
                  isMinimal 
                    ? 'bg-emerald-500/15 border-emerald-400/30' 
                    : 'bg-amber-500/15 border-amber-400/30'
                }`}>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                    Prediction Error (|Δ|)
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-3xl sm:text-4xl font-black font-mono ${isMinimal ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {diff.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-slate-400">AQI pts</span>
                  </div>
                  <span className="text-[10px] text-slate-300 block font-mono">
                    |Predicted − Expected|
                  </span>
                </div>
              );
            })()}

            {/* 4. Category Alignment */}
            {(() => {
              const expectedCat = selectedScenario.category.toLowerCase().replace(/\s+/g, '');
              const predictedCat = (manualResult.predicted_category || '').toLowerCase().replace(/\s+/g, '');
              const isMatch = expectedCat.includes(predictedCat) || predictedCat.includes(expectedCat) || Math.abs(manualResult.predicted_aqi - selectedScenario.expectedAqi) < 15;

              return (
                <div className={`p-4 rounded-2xl backdrop-blur-md border space-y-1.5 ${
                  isMatch ? 'bg-emerald-500/15 border-emerald-400/30' : 'bg-rose-500/15 border-rose-400/30'
                }`}>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                    Category Concordance
                  </span>
                  <div className="flex items-center gap-2 my-1">
                    {isMatch ? (
                      <>
                        <CheckCircle2 size={24} className="text-emerald-400" />
                        <span className="text-lg font-black text-emerald-300">Category Matched</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={24} className="text-amber-400" />
                        <span className="text-lg font-black text-amber-300">Boundary Drift</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-300 block font-mono">
                    {selectedScenario.category} vs {manualResult.predicted_category || "Output"}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Visual Comparison Bar (0 to 500 CPCB Scale) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Gauge size={14} className="text-cyan-400" />
                <span>CPCB Visual Range Scale (0 – 500)</span>
              </span>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
                  <span>Expected: <strong>{selectedScenario.expectedAqi}</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                  <span>Predicted: <strong>{manualResult.predicted_aqi.toFixed(1)}</strong></span>
                </span>
              </div>
            </div>

            {/* Scale Bar */}
            <div className="relative w-full h-4 rounded-full overflow-hidden flex bg-slate-700/80 p-0.5 border border-white/20">
              <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: '10%' }} title="Good (0–50)" />
              <div className="h-full bg-green-500" style={{ width: '10%' }} title="Satisfactory (51–100)" />
              <div className="h-full bg-yellow-500" style={{ width: '20%' }} title="Moderately Polluted (101–200)" />
              <div className="h-full bg-orange-500" style={{ width: '20%' }} title="Poor (201–300)" />
              <div className="h-full bg-red-500" style={{ width: '20%' }} title="Very Poor (301–400)" />
              <div className="h-full bg-rose-900 rounded-r-full" style={{ width: '20%' }} title="Severe (401–500)" />
            </div>

            {/* Pointer Markers for Expected and Actual */}
            <div className="relative w-full h-7 text-[10px] font-mono">
              {/* Expected Marker */}
              <div 
                className="absolute -top-1 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-500"
                style={{ left: `${Math.min(98, Math.max(2, (selectedScenario.expectedAqi / 500) * 100))}%` }}
              >
                <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-900 shadow-md" />
                <span className="text-[9px] font-black text-white mt-0.5 bg-slate-800 px-1 py-0.2 rounded border border-white/30">
                  Exp:{selectedScenario.expectedAqi}
                </span>
              </div>

              {/* Actual Predicted Marker */}
              <div 
                className="absolute -top-1 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-500"
                style={{ left: `${Math.min(98, Math.max(2, (manualResult.predicted_aqi / 500) * 100))}%` }}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-white shadow-lg shadow-cyan-400/80 animate-pulse" />
                <span className="text-[9px] font-black text-cyan-300 mt-0.5 bg-slate-900 px-1 py-0.2 rounded border border-cyan-400/60">
                  Pred:{manualResult.predicted_aqi.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Breakpoint labels */}
            <div className="relative w-full text-[9px] font-mono text-slate-400 flex justify-between px-1">
              <span>0 (Good)</span>
              <span>50</span>
              <span>100 (Sat.)</span>
              <span>200 (Mod.)</span>
              <span>300 (Poor)</span>
              <span>400 (V.Poor)</span>
              <span>500 (Severe)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
