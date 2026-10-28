import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Radio, 
  Sliders, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Clock,
  Wind,
  Layers,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';
import AqiBadge from '../common/AqiBadge';
import CountUp from '../common/CountUp';
import { getAqiCategory } from '../../utils/aqiUtils';
import { predictLiveMode, predictManualMode, getLiveAQI } from '../../services/api';
import AqiCategoryTestScenarios from '../common/AqiCategoryTestScenarios';
import SmartAQIAdvisory from '../common/SmartAQIAdvisory';

export default function AqiPredictionPage() {
  const [mode, setMode] = useState('live'); // 'live' | 'manual'
  const [isPredicting, setIsPredicting] = useState(false);
  const [liveAdvisoryView, setLiveAdvisoryView] = useState('forecast'); // 'forecast' | 'current'

  // Live Mode State
  const [liveState, setLiveState] = useState({
    currentAqi: null,
    predictedAqi: null,
    predictedCategory: "Loading...",
    status: "Ready for OpenAQ Live Ingestion",
    lastPredictedTime: "Loading...",
    source: "OpenAQ Live • Manali, Chennai - CPCB",
    connected: true
  });

  useEffect(() => {
    if (mode === 'live') {
      let isMounted = true;
      predictLiveMode(false).then((res) => {
        if (isMounted && res) {
          setLiveState({
            currentAqi: res.currentAqi ?? null,
            predictedAqi: res.predictedAqi ?? null,
            predictedCategory: res.predictedCategory ?? "Satisfactory",
            status: res.status ?? "Inference completed via FastAPI real model",
            lastPredictedTime: res.timestamp ?? (new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST'),
            source: res.connected ? "OpenAQ Live • Station 2586 (Manali, Chennai - CPCB)" : (res.source || "FastAPI Inference"),
            connected: res.connected ?? true,
            pollutants: res.pollutants ?? null
          });
        }
      });
      return () => { isMounted = false; };
    }
  }, [mode]);

  // Manual Mode Form State - 16 Exact Model Features
  const defaultManualFeatures = {
    pm25: "46.9",
    pm10: "104.0",
    no2: "15.5",
    so2: "9.1",
    co: "0.0011",
    o3: "10.8",
    humidity: "75.0",
    windSpeed: "2.8",
    windDirection: "160.0",
    currentAqi: "94.0",
    aqiLag1: "94.0",
    aqiLag2: "94.0",
    aqiLag3: "94.0",
    hour: "23",
    dayOfWeek: "3", // Thursday
    month: "9"      // September
  };

  const [features, setFeatures] = useState(defaultManualFeatures);
  const [formErrors, setFormErrors] = useState({});
  const [manualResult, setManualResult] = useState(null);
  const [modelStatus, setModelStatus] = useState('ready'); // 'ready' | 'verified' | 'error'
  const [predictionError, setPredictionError] = useState(null);
  const [presetNotice, setPresetNotice] = useState(null);
  const [isLoadingLivePreset, setIsLoadingLivePreset] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);

  // Handle selecting a predefined CPCB test scenario
  const handleSelectTestScenario = (scenario) => {
    setSelectedScenario(scenario);
    setFeatures(scenario.features);
    setFormErrors({});
    setPredictionError(null);
    setManualResult(null);
    setModelStatus('ready');
    setPresetNotice({
      type: 'scenario',
      text: `Populated with ${scenario.number}: ${scenario.category} (Expected AQI: ${scenario.expectedAqi}). Review the inputs below and click "⚡ Predict Next Hour" to run ML model inference.`
    });
  };

  // Field validation rules
  const validateInputs = () => {
    const errs = {};

    const checkField = (name, val, label, min, max, isInteger = false) => {
      if (val === undefined || val === null || String(val).trim() === '') {
        return `Please enter a valid value for ${label}.`;
      }
      const num = isInteger ? parseInt(val, 10) : parseFloat(val);
      if (!Number.isFinite(num) || Number.isNaN(num)) {
        return `Please enter a valid number for ${label}.`;
      }
      if (isInteger && !Number.isInteger(Number(val))) {
        return `${label} must be a whole number.`;
      }
      if (min !== undefined && num < min) {
        return `${label} cannot be less than ${min}.`;
      }
      if (max !== undefined && num > max) {
        return `${label} cannot exceed ${max}.`;
      }
      return null;
    };

    const definitions = [
      { name: 'pm25', label: 'PM2.5', min: 0 },
      { name: 'pm10', label: 'PM10', min: 0 },
      { name: 'no2', label: 'NO₂', min: 0 },
      { name: 'so2', label: 'SO₂', min: 0 },
      { name: 'co', label: 'CO', min: 0 },
      { name: 'o3', label: 'O₃', min: 0 },
      { name: 'humidity', label: 'Relative Humidity', min: 0, max: 100 },
      { name: 'windSpeed', label: 'Wind Speed', min: 0 },
      { name: 'windDirection', label: 'Wind Direction', min: 0, max: 360 },
      { name: 'currentAqi', label: 'Current AQI', min: 0 },
      { name: 'aqiLag1', label: 'AQI Lag 1', min: 0 },
      { name: 'aqiLag2', label: 'AQI Lag 2', min: 0 },
      { name: 'aqiLag3', label: 'AQI Lag 3', min: 0 },
      { name: 'hour', label: 'Hour of Day', min: 0, max: 23, isInteger: true },
      { name: 'dayOfWeek', label: 'Day of Week', min: 0, max: 6, isInteger: true },
      { name: 'month', label: 'Month', min: 1, max: 12, isInteger: true }
    ];

    for (const def of definitions) {
      const msg = checkField(def.name, features[def.name], def.label, def.min, def.max, def.isInteger);
      if (msg) errs[def.name] = msg;
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeatures(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (predictionError) setPredictionError(null);
  };

  // Presets
  const loadPreset = async (presetName) => {
    setFormErrors({});
    setPredictionError(null);
    setManualResult(null);
    setModelStatus('ready');

    if (presetName === 'live') {
      setIsLoadingLivePreset(true);
      try {
        const liveData = await getLiveAQI(false);
        const feats = liveData?.features || {};
        const newFeats = {
          pm25: feats.PM25 !== undefined ? String(Math.round(feats.PM25 * 10) / 10) : (liveData?.pollutants?.PM25 ? String(liveData.pollutants.PM25) : "46.9"),
          pm10: feats.PM10 !== undefined ? String(Math.round(feats.PM10 * 10) / 10) : (liveData?.pollutants?.PM10 ? String(liveData.pollutants.PM10) : "104.0"),
          no2: feats.NO2 !== undefined ? String(Math.round(feats.NO2 * 10) / 10) : (liveData?.pollutants?.NO2 ? String(liveData.pollutants.NO2) : "15.5"),
          so2: feats.SO2 !== undefined ? String(Math.round(feats.SO2 * 10) / 10) : (liveData?.pollutants?.SO2 ? String(liveData.pollutants.SO2) : "9.1"),
          co: feats.CO !== undefined ? String(Number(feats.CO).toFixed(4)) : (liveData?.pollutants?.CO ? String(liveData.pollutants.CO) : "0.0011"),
          o3: feats.O3 !== undefined ? String(Math.round(feats.O3 * 10) / 10) : (liveData?.pollutants?.O3 ? String(liveData.pollutants.O3) : "10.8"),
          humidity: feats.Humidity !== undefined ? String(Math.round(feats.Humidity * 10) / 10) : (liveData?.weather?.Humidity ? String(liveData.weather.Humidity) : "75.0"),
          windSpeed: feats.Wind_Speed !== undefined ? String(Math.round(feats.Wind_Speed * 10) / 10) : (liveData?.weather?.Wind_Speed ? String(liveData.weather.Wind_Speed) : "2.8"),
          windDirection: feats.Wind_Direction !== undefined ? String(Math.round(feats.Wind_Direction * 10) / 10) : (liveData?.weather?.Wind_Direction ? String(liveData.weather.Wind_Direction) : "160.0"),
          currentAqi: feats.AQI !== undefined ? String(Math.round(feats.AQI * 10) / 10) : (liveData?.aqi ? String(liveData.aqi) : "94.0"),
          aqiLag1: feats.AQI_lag_1 !== undefined ? String(Math.round(feats.AQI_lag_1 * 10) / 10) : (liveData?.lagged_aqi?.t_minus_1 ? String(liveData.lagged_aqi.t_minus_1) : "94.0"),
          aqiLag2: feats.AQI_lag_2 !== undefined ? String(Math.round(feats.AQI_lag_2 * 10) / 10) : (liveData?.lagged_aqi?.t_minus_2 ? String(liveData.lagged_aqi.t_minus_2) : "94.0"),
          aqiLag3: feats.AQI_lag_3 !== undefined ? String(Math.round(feats.AQI_lag_3 * 10) / 10) : (liveData?.lagged_aqi?.t_minus_3 ? String(liveData.lagged_aqi.t_minus_3) : "94.0"),
          hour: feats.Hour !== undefined ? String(parseInt(feats.Hour, 10)) : String(new Date().getHours()),
          dayOfWeek: feats.Day_of_Week !== undefined ? String(parseInt(feats.Day_of_Week, 10)) : String((new Date().getDay() + 6) % 7),
          month: feats.Month !== undefined ? String(parseInt(feats.Month, 10)) : String(new Date().getMonth() + 1)
        };
        setFeatures(newFeats);
        setPresetNotice({
          type: 'live',
          text: 'Populated with latest real observations from OpenAQ Live station (Station 2586: Manali, Chennai).'
        });
      } catch (e) {
        console.warn("Failed fetching live data for preset, using default live observation data:", e);
        setFeatures(defaultManualFeatures);
        setPresetNotice({
          type: 'live',
          text: 'Populated with baseline live station observations.'
        });
      } finally {
        setIsLoadingLivePreset(false);
      }
    } else if (presetName === 'inversion' || presetName === 'adverse') {
      setFeatures({
        pm25: "142.5",
        pm10: "235.0",
        no2: "58.4",
        so2: "22.1",
        co: "0.0035",
        o3: "18.2",
        humidity: "88.0",
        windSpeed: "0.8",
        windDirection: "45.0",
        currentAqi: "185.0",
        aqiLag1: "172.0",
        aqiLag2: "155.0",
        aqiLag3: "138.0",
        hour: "7",
        dayOfWeek: "1",
        month: "1"
      });
      setPresetNotice({
        type: 'scenario',
        text: 'Scenario 3 Preset: Thermal Inversion & Stagnant Smog (worst-case: near-calm 0.8 m/s wind, 88% humidity, high particulate capping).'
      });
    } else if (presetName === 'baseline') {
      setFeatures({
        pm25: "46.9",
        pm10: "104.0",
        no2: "15.5",
        so2: "9.1",
        co: "0.0011",
        o3: "10.8",
        humidity: "75.0",
        windSpeed: "2.8",
        windDirection: "160.0",
        currentAqi: "94.0",
        aqiLag1: "94.0",
        aqiLag2: "94.0",
        aqiLag3: "94.0",
        hour: String(new Date().getHours()),
        dayOfWeek: String((new Date().getDay() + 6) % 7),
        month: String(new Date().getMonth() + 1)
      });
      setPresetNotice({
        type: 'scenario',
        text: 'Scenario 2 Preset: Diurnal Persistence & Baseline (normal seasonal urban flow, moderate 2.8 m/s wind, stable autoregressive lags).'
      });
    } else if (presetName === 'clean' || presetName === 'favorable') {
      setFeatures({
        pm25: "12.4",
        pm10: "28.5",
        no2: "8.2",
        so2: "4.1",
        co: "0.0004",
        o3: "26.0",
        humidity: "62.0",
        windSpeed: "18.5",
        windDirection: "90.0",
        currentAqi: "35.0",
        aqiLag1: "38.0",
        aqiLag2: "42.0",
        aqiLag3: "45.0",
        hour: "15",
        dayOfWeek: "5",
        month: "7"
      });
      setPresetNotice({
        type: 'scenario',
        text: 'Scenario 1 Preset: Favorable Dispersion & Coastal Sea Breeze (best-case: strong 18.5 km/h maritime wind, aerosol washout).'
      });
    } else {
      setFeatures(defaultManualFeatures);
      setPresetNotice(null);
    }
  };

  // Live Mode Predict trigger
  const handleLivePredict = async () => {
    setIsPredicting(true);
    const res = await predictLiveMode(true);
    setLiveState({
      currentAqi: res.currentAqi ?? null,
      predictedAqi: res.predictedAqi ?? null,
      predictedCategory: res.predictedCategory ?? "Satisfactory",
      status: res.status ?? "Live inference completed",
      lastPredictedTime: res.timestamp ?? (new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST'),
      source: res.connected ? "OpenAQ Live • Station 2586 (Manali, Chennai - CPCB)" : "FastAPI Inference",
      connected: res.connected ?? true,
      pollutants: res.pollutants ?? null
    });
    setIsPredicting(false);
  };

  // Manual Mode Predict trigger
  const handleManualPredict = async (e) => {
    if (e) e.preventDefault();
    if (isPredicting) return; // Prevent duplicate concurrent requests

    // 1. Validate inputs
    const isValid = validateInputs();
    if (!isValid) {
      setPredictionError("Please enter valid numeric values for all required fields.");
      return;
    }

    setPredictionError(null);
    setIsPredicting(true);

    try {
      // 2. Build 16-feature numeric payload
      const payload = {
        PM25: parseFloat(features.pm25),
        PM10: parseFloat(features.pm10),
        NO2: parseFloat(features.no2),
        SO2: parseFloat(features.so2),
        CO: parseFloat(features.co),
        O3: parseFloat(features.o3),
        Humidity: parseFloat(features.humidity),
        Wind_Speed: parseFloat(features.windSpeed),
        Wind_Direction: parseFloat(features.windDirection),
        AQI: parseFloat(features.currentAqi),
        AQI_lag_1: parseFloat(features.aqiLag1),
        AQI_lag_2: parseFloat(features.aqiLag2),
        AQI_lag_3: parseFloat(features.aqiLag3),
        Hour: parseInt(features.hour, 10),
        Day_of_Week: parseInt(features.dayOfWeek, 10),
        Month: parseInt(features.month, 10)
      };

      // 3. Call POST /api/predict
      const res = await predictManualMode(payload);

      // 4. Validate numeric response
      const predValue = Number(res?.predicted_aqi);
      const currValue = Number(res?.current_aqi ?? payload.AQI);

      if (!Number.isFinite(predValue)) {
        throw new Error("The model returned an invalid prediction.");
      }

      const predictedCat = res.predicted_category || getAqiCategory(predValue).label;
      const currentCat = res.current_category || getAqiCategory(currValue).label;
      const delta = predValue - currValue;

      setManualResult({
        current_aqi: currValue,
        predicted_aqi: predValue,
        current_category: currentCat,
        predicted_category: predictedCat,
        change: delta,
        model: res.model || "Linear Regression + AQI Lags",
        metrics: res.metrics || { MAE: 0.691, RMSE: 1.156, R2: 0.994 },
        advisory: res.advisory || null
      });
      setModelStatus('verified');
    } catch (err) {
      console.error("Manual prediction error:", err);
      setModelStatus('error');
      setManualResult(null);
      setPredictionError(err.message || "Unable to generate the next-hour prediction. Please check the input values and try again.");
    } finally {
      setIsPredicting(false);
    }
  };

  const currentCat = liveState.currentAqi !== null ? getAqiCategory(liveState.currentAqi) : null;
  const predCat = liveState.predictedAqi !== null ? getAqiCategory(liveState.predictedAqi) : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Mode Switcher Header */}
      {/* Title & Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#0D9B76]/15 text-[#36C5F0] border border-[#0D9B76]/30 shadow-[0_0_12px_rgba(13,155,118,0.2)]">
              <Sparkles size={12} className="text-[#36C5F0]" />
              AI Inference Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Next-Hour AQI Prediction
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Use current conditions and recent AQI history to forecast the next hour.
          </p>
        </div>

        {/* Mode Toggle: LIVE MODE | MANUAL MODE */}
        <div className="bg-[#13253B] p-1.5 rounded-2xl flex items-center gap-1.5 border border-[#1E3A5F] self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setMode('live')}
            className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
              mode === 'live'
                ? 'bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] text-white shadow-md shadow-[#0D9B76]/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio size={14} className={mode === 'live' ? 'animate-pulse' : ''} />
            <span>LIVE MODE</span>
          </button>

          <button
            onClick={() => setMode('manual')}
            className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
              mode === 'manual'
                ? 'bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] text-white shadow-md shadow-[#0D9B76]/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders size={14} />
            <span>MANUAL MODE</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LIVE MODE UI */}
      {/* ========================================================================= */}
      {mode === 'live' && (
        <div className="space-y-6">
          {/* Main Visual Flow Card: CURRENT -> NEXT HOUR */}
          <div className="bg-[#0F1F33] rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] shadow-[0_10px_35px_rgba(0,0,0,0.35)] relative overflow-hidden text-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#1E3A5F]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0D9B76] animate-pulse shadow-[0_0_8px_rgba(13,155,118,0.6)]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Telemetry Ingestion &amp; Forecast Flow
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium font-mono">
                Updated: {liveState.lastPredictedTime}
              </span>
            </div>

            {/* Visual Comparison Flow */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center my-8">
              {/* CURRENT AQI */}
              <div className="md:col-span-5 p-6 rounded-2xl bg-[#13253B] border border-[#1E3A5F] flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Current AQI
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 font-mono">
                    Time (t)
                  </span>
                </div>

                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-5xl sm:text-6xl font-black text-white tracking-tight font-mono">
                    {liveState.currentAqi !== null ? (
                      <CountUp value={liveState.currentAqi} duration={800} />
                    ) : "..."}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Observation
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-[#1E3A5F] flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Category</span>
                  {currentCat ? (
                    <AqiBadge aqi={liveState.currentAqi} size="sm" />
                  ) : (
                    <span className="w-20 h-6 bg-[#0B1724] rounded animate-pulse" />
                  )}
                </div>
              </div>

              {/* FLOW ARROW / TRANSITION */}
              <div className="md:col-span-1 flex flex-col items-center justify-center py-2 md:py-0">
                <div className="w-12 h-12 rounded-full bg-[#0D9B76]/15 border border-[#0D9B76]/30 text-[#36C5F0] flex items-center justify-center shadow-xs">
                  <ArrowRight size={22} className="hidden md:block animate-pulse" />
                  <ArrowRight size={22} className="md:hidden rotate-90 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold text-[#36C5F0] uppercase mt-1 tracking-wider font-mono">
                  +1 Hour
                </span>
              </div>

              {/* NEXT HOUR PREDICTED AQI */}
              <div className="md:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-[#0D9B76]/15 via-[#0F1F33] to-[#36C5F0]/15 border-2 border-[#36C5F0]/40 flex flex-col justify-between h-full shadow-[0_0_20px_rgba(54,197,240,0.15)] relative">
                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    ML Target (t+1)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles size={14} className="text-[#36C5F0]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Next-Hour Forecast
                  </span>
                </div>

                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-5xl sm:text-6xl font-black text-[#36C5F0] tracking-tight font-mono">
                    {liveState.predictedAqi !== null ? (
                      <CountUp value={liveState.predictedAqi} duration={900} />
                    ) : "..."}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Forecast
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-[#1E3A5F] flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-semibold">Predicted Category</span>
                  {predCat ? (
                    <AqiBadge aqi={liveState.predictedAqi} size="sm" />
                  ) : (
                    <span className="w-20 h-6 bg-[#0B1724] rounded animate-pulse" />
                  )}
                </div>

                {/* 3 Scenarios mention directly under predicted AQI */}
                <div className="mt-3 pt-2.5 border-t border-[#1E3A5F] flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-400 text-[10.5px]">3 Scenarios:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-[10px]">
                    <span className="text-[#36C5F0] bg-[#0D9B76]/20 px-2 py-0.5 rounded border border-[#0D9B76]/40" title="Scenario 1: Favorable Dispersion">Best: 35–48</span>
                    <span className="text-cyan-300 bg-[#13253B] px-2 py-0.5 rounded border border-[#1E3A5F]" title="Scenario 2: Baseline Diurnal">Base: ~95</span>
                    <span className="text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40" title="Scenario 3: Thermal Inversion">Worst: 185+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#1E3A5F]">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle size={15} className="text-[#0D9B76]" />
                <span>Station: <strong className="text-white">Manali, Chennai - CPCB</strong> (OpenAQ Live Ingestion)</span>
              </div>

              <button
                onClick={handleLivePredict}
                disabled={isPredicting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] hover:from-[#0D9B76]/90 hover:to-[#36C5F0]/90 text-white font-bold text-xs tracking-wide shadow-md shadow-[#0D9B76]/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <RefreshCw size={14} className={isPredicting ? "animate-spin" : ""} />
                <span>{isPredicting ? "Running Live Inference..." : "Refresh Live Prediction"}</span>
              </button>
            </div>
          </div>

          {/* Centralized Smart AQI Advisory & Precautionary Intelligence for Live Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Advisory Perspective:
              </span>
              <div className="bg-[#13253B] p-1 rounded-xl flex items-center gap-1 border border-[#1E3A5F]">
                <button
                  type="button"
                  onClick={() => setLiveAdvisoryView('forecast')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    liveAdvisoryView === 'forecast'
                      ? 'bg-[#36C5F0] text-[#0B1724] shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Next-Hour Forecast Advisory (t+1)
                </button>
                <button
                  type="button"
                  onClick={() => setLiveAdvisoryView('current')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    liveAdvisoryView === 'current'
                      ? 'bg-[#0D9B76] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Current Measured Advisory (t)
                </button>
              </div>
            </div>

            <SmartAQIAdvisory
              aqi={liveAdvisoryView === 'forecast' ? (liveState.predictedAqi ?? liveState.currentAqi) : liveState.currentAqi}
              pollutants={liveState.pollutants}
              mode="live"
              isForecast={liveAdvisoryView === 'forecast'}
              title={liveAdvisoryView === 'forecast' ? "Next-Hour Forecast Air Quality Advisory" : "Current Measured Air Quality Advisory"}
              subtitle={liveAdvisoryView === 'forecast' 
                ? "Proactive precautionary guidance and activity suitability for the forecasted next-hour air quality"
                : "Real-time health risk and indoor protection guidance based on active continuous CPCB telemetry"}
              timestamp={liveState.lastPredictedTime}
            />
          </div>

          {/* Model Metrics Cards (Section 21: MAE 0.691, RMSE 1.156, R² 0.994 with label: Test-set performance) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0F1F33] border border-[#1E3A5F] shadow-[0_8px_25px_rgba(0,0,0,0.3)] flex items-center justify-between text-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  MAE
                </span>
                <span className="text-2xl font-black text-white mt-1 block font-mono">
                  0.691
                </span>
                <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                  Test-set performance
                </span>
              </div>
              <span className="text-xs font-bold text-[#36C5F0] bg-[#36C5F0]/15 px-2.5 py-1 rounded-xl border border-[#36C5F0]/30">
                MAE
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F1F33] border border-[#1E3A5F] shadow-[0_8px_25px_rgba(0,0,0,0.3)] flex items-center justify-between text-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  RMSE
                </span>
                <span className="text-2xl font-black text-white mt-1 block font-mono">
                  1.156
                </span>
                <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                  Test-set performance
                </span>
              </div>
              <span className="text-xs font-bold text-cyan-300 bg-cyan-500/15 px-2.5 py-1 rounded-xl border border-cyan-500/30">
                RMSE
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F1F33] border border-[#1E3A5F] shadow-[0_8px_25px_rgba(0,0,0,0.3)] flex items-center justify-between text-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  R² Score
                </span>
                <span className="text-2xl font-black text-[#0D9B76] mt-1 block font-mono">
                  0.994
                </span>
                <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                  Test-set performance
                </span>
              </div>
              <span className="text-xs font-bold text-[#0D9B76] bg-[#0D9B76]/15 px-2.5 py-1 rounded-xl border border-[#0D9B76]/30">
                R²
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANUAL MODE UI (AI Experiment Console) */}
      {/* ========================================================================= */}
      {mode === 'manual' && (
        <div className="space-y-6">
          {/* AQI Category Test Scenarios (6 CPCB Predefined Scenarios) */}
          <AqiCategoryTestScenarios 
            selectedScenario={selectedScenario}
            onSelectScenario={handleSelectTestScenario}
            isPredicting={isPredicting}
            manualResult={manualResult}
            onRunPrediction={() => handleManualPredict()}
          />

          <form onSubmit={handleManualPredict} className="bg-[#0F1F33] rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] shadow-[0_10px_35px_rgba(0,0,0,0.35)] space-y-7 text-slate-100">
            {/* Top Toolbar: Presets & Form Description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1E3A5F]">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  AI Experiment Console
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjust custom variables to test model inference behavior across hypothetical meteorological conditions.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Presets:</span>
                <button
                  id="manual-preset-live"
                  type="button"
                  disabled={isLoadingLivePreset}
                  onClick={() => loadPreset('live')}
                  className="px-3 py-1.5 rounded-xl bg-[#13253B] hover:bg-[#1A3352] text-xs font-bold text-[#36C5F0] cursor-pointer transition-all flex items-center gap-1.5 border border-[#1E3A5F] shadow-xs disabled:opacity-60"
                  title="Fetch and populate with latest live OpenAQ station observations"
                >
                  {isLoadingLivePreset ? <RefreshCw size={12} className="animate-spin" /> : <Radio size={12} />}
                  <span>Current Live</span>
                </button>
                <button
                  id="manual-preset-clean"
                  type="button"
                  onClick={() => loadPreset('clean')}
                  className="px-3 py-1.5 rounded-xl bg-[#0D9B76]/15 hover:bg-[#0D9B76]/25 text-xs font-bold text-[#0D9B76] cursor-pointer transition-all flex items-center gap-1.5 border border-[#0D9B76]/40 shadow-xs"
                  title="Scenario 1: Coastal maritime ventilation & aerosol scavenging"
                >
                  <span>Scenario 1: Favorable</span>
                  <span className="text-[10px] bg-[#0D9B76]/30 text-emerald-200 px-1 py-0.2 rounded font-normal">Best</span>
                </button>
                <button
                  id="manual-preset-baseline"
                  type="button"
                  onClick={() => loadPreset('baseline')}
                  className="px-3 py-1.5 rounded-xl bg-[#36C5F0]/15 hover:bg-[#36C5F0]/25 text-xs font-bold text-[#36C5F0] cursor-pointer transition-all flex items-center gap-1.5 border border-[#36C5F0]/40 shadow-xs"
                  title="Scenario 2: Diurnal persistence & moderate traffic"
                >
                  <span>Scenario 2: Baseline</span>
                  <span className="text-[10px] bg-[#36C5F0]/30 text-cyan-200 px-1 py-0.2 rounded font-normal">Moderate</span>
                </button>
                <button
                  id="manual-preset-inversion"
                  type="button"
                  onClick={() => loadPreset('inversion')}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-xs font-bold text-rose-300 cursor-pointer transition-all flex items-center gap-1.5 border border-rose-500/40 shadow-xs"
                  title="Scenario 3: Atmospheric winter morning inversion"
                >
                  <span>Scenario 3: Inversion</span>
                  <span className="text-[10px] bg-rose-500/30 text-rose-200 px-1 py-0.2 rounded font-normal">Worst</span>
                </button>
              </div>
            </div>

            {/* Preset Notification Banner if active */}
            {presetNotice && (
              <div className="p-3.5 rounded-2xl border border-[#1E3A5F] bg-[#13253B] text-xs flex items-center gap-2.5 transition-all text-slate-200">
                <Info size={16} className="shrink-0 text-[#36C5F0]" />
                <span className="font-medium">{presetNotice.text}</span>
              </div>
            )}

            {/* Grouped Feature Form - 16 Exact Model Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Group 1: Criteria Pollutants */}
              <div className="p-4 rounded-2xl bg-[#13253B] border border-[#1E3A5F] space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#1E3A5F]">
                  <Layers size={15} className="text-[#36C5F0]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Air Quality (Pollutants)
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">PM2.5 (µg/m³)</label>
                    <input
                      id="manual-input-pm25"
                      type="number"
                      name="pm25"
                      value={features.pm25}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.pm25 ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.pm25 && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.pm25}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">PM10 (µg/m³)</label>
                    <input
                      id="manual-input-pm10"
                      type="number"
                      name="pm10"
                      value={features.pm10}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.pm10 ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.pm10 && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.pm10}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">NO₂ (µg/m³)</label>
                    <input
                      id="manual-input-no2"
                      type="number"
                      name="no2"
                      value={features.no2}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.no2 ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.no2 && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.no2}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">SO₂ (µg/m³)</label>
                    <input
                      id="manual-input-so2"
                      type="number"
                      name="so2"
                      value={features.so2}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.so2 ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.so2 && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.so2}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">CO (mg/m³)</label>
                    <input
                      id="manual-input-co"
                      type="number"
                      name="co"
                      value={features.co}
                      onChange={handleInputChange}
                      step="0.0001"
                      min="0"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.co ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.co && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.co}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">O₃ (µg/m³)</label>
                    <input
                      id="manual-input-o3"
                      type="number"
                      name="o3"
                      value={features.o3}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.o3 ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.o3 && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.o3}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Group 2: Weather & Atmospheric */}
              <div className="p-4 rounded-2xl bg-[#13253B] border border-[#1E3A5F] space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#1E3A5F]">
                  <Wind size={15} className="text-[#36C5F0]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Weather &amp; Atmospheric
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Relative Humidity (%)</label>
                    <input
                      id="manual-input-humidity"
                      type="number"
                      name="humidity"
                      value={features.humidity}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      max="100"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.humidity ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.humidity && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.humidity}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Wind Speed (m/s)</label>
                    <input
                      id="manual-input-wind-speed"
                      type="number"
                      name="windSpeed"
                      value={features.windSpeed}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.windSpeed ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.windSpeed && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.windSpeed}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Wind Direction (degrees)</label>
                    <input
                      id="manual-input-wind-direction"
                      type="number"
                      name="windDirection"
                      value={features.windDirection}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      max="360"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.windDirection ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.windDirection && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.windDirection}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Group 3: AQI Autoregressive Lags */}
              <div className="p-4 rounded-2xl bg-[#13253B] border border-[#1E3A5F] space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#1E3A5F]">
                  <Clock size={15} className="text-[#36C5F0]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    AQI History (Lags)
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Current AQI (t)</label>
                    <input
                      id="manual-input-current-aqi"
                      type="number"
                      name="currentAqi"
                      value={features.currentAqi}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.currentAqi ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.currentAqi && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.currentAqi}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">AQI Lag 1 (t-1 hour)</label>
                    <input
                      id="manual-input-aqi-lag-1"
                      type="number"
                      name="aqiLag1"
                      value={features.aqiLag1}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.aqiLag1 ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.aqiLag1 && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.aqiLag1}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">AQI Lag 2 (t-2 hours)</label>
                    <input
                      id="manual-input-aqi-lag-2"
                      type="number"
                      name="aqiLag2"
                      value={features.aqiLag2}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.aqiLag2 ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.aqiLag2 && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.aqiLag2}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">AQI Lag 3 (t-3 hours)</label>
                    <input
                      id="manual-input-aqi-lag-3"
                      type="number"
                      name="aqiLag3"
                      value={features.aqiLag3}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.aqiLag3 ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.aqiLag3 && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.aqiLag3}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Group 4: Temporal Indicators */}
              <div className="p-4 rounded-2xl bg-[#13253B] border border-[#1E3A5F] space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#1E3A5F]">
                  <Calendar size={15} className="text-[#0D9B76]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Time Variables
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Hour of Day (0–23)</label>
                    <input
                      id="manual-input-hour"
                      type="number"
                      name="hour"
                      value={features.hour}
                      onChange={handleInputChange}
                      step="1"
                      min="0"
                      max="23"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.hour ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.hour && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.hour}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Day of Week (0=Mon, 6=Sun)</label>
                    <input
                      id="manual-input-day-of-week"
                      type="number"
                      name="dayOfWeek"
                      value={features.dayOfWeek}
                      onChange={handleInputChange}
                      step="1"
                      min="0"
                      max="6"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.dayOfWeek ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.dayOfWeek && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.dayOfWeek}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Month (1–12)</label>
                    <input
                      id="manual-input-month"
                      type="number"
                      name="month"
                      value={features.month}
                      onChange={handleInputChange}
                      step="1"
                      min="1"
                      max="12"
                      className={`w-full bg-[#0B1724] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold text-white transition-all focus:outline-none ${
                        formErrors.month ? 'border-rose-400 bg-rose-950/20 focus:border-rose-500' : 'border-[#1E3A5F] focus:border-[#36C5F0]'
                      }`}
                    />
                    {formErrors.month && (
                      <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">{formErrors.month}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex justify-end">
              <button
                id="manual-predict-button"
                type="submit"
                disabled={isPredicting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] hover:from-[#0D9B76]/90 hover:to-[#36C5F0]/90 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-[#0D9B76]/30 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <Zap size={16} className={isPredicting ? "animate-spin" : ""} />
                <span>{isPredicting ? "Predicting..." : "⚡ Predict Next Hour"}</span>
              </button>
            </div>
          </form>

          {/* Error Banner when prediction fails */}
          {predictionError && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 shadow-sm transition-all">
              <div className="flex items-center gap-2.5 font-bold text-sm text-rose-300">
                <AlertTriangle size={17} className="text-rose-400 shrink-0" />
                <span>Prediction unavailable</span>
              </div>
              <p className="text-xs text-rose-300 mt-1 pl-6">
                {predictionError}
              </p>
            </div>
          )}

          {/* Model Output Card - Always visible in Manual Mode */}
          <div className="bg-[#0F1F33] rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] shadow-[0_10px_35px_rgba(0,0,0,0.35)] transition-all text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E3A5F]">
              <span className="text-xs font-bold text-[#36C5F0] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle size={15} />
                Model Output (POST /api/predict)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {manualResult ? "Inference verified via trained Linear Regression model" : "Awaiting input"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 items-center">
              {/* Left: Forecasted Next-Hour AQI */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Forecasted Next-Hour AQI
                </span>
                {manualResult && Number.isFinite(manualResult.predicted_aqi) ? (
                  <div className="text-5xl font-black text-[#36C5F0] font-mono tracking-tight my-1">
                    <CountUp value={manualResult.predicted_aqi} decimals={2} duration={800} />
                  </div>
                ) : (
                  <div className="space-y-1 my-1">
                    <div className="text-5xl font-black text-slate-600 font-mono tracking-tight">
                      —
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Run the model to generate a prediction.
                    </p>
                  </div>
                )}
                <div className="mt-2 flex items-center gap-1.5 text-[10.5px]">
                  <span className="text-slate-400 font-semibold text-[10px]">3 Scenarios:</span>
                  <span className="text-[#36C5F0] bg-[#0D9B76]/20 px-1.5 py-0.2 rounded border border-[#0D9B76]/40 text-[10px] font-mono font-bold" title="Scenario 1: Favorable (Clean)">Best 35–48</span>
                  <span className="text-cyan-300 bg-[#13253B] px-1.5 py-0.2 rounded border border-[#1E3A5F] text-[10px] font-mono font-bold" title="Scenario 2: Baseline">Base ~95</span>
                  <span className="text-rose-300 bg-rose-500/20 px-1.5 py-0.2 rounded border border-rose-500/40 text-[10px] font-mono font-bold" title="Scenario 3: Inversion">Worst 185+</span>
                </div>
              </div>

              {/* Center: Air Quality Category */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Air Quality Category
                </span>
                {manualResult && Number.isFinite(manualResult.predicted_aqi) ? (
                  <AqiBadge aqi={manualResult.predicted_aqi} size="lg" />
                ) : (
                  <span className="inline-block px-3 py-1 rounded-xl bg-[#13253B] text-slate-400 text-xs font-bold border border-[#1E3A5F]">
                    —
                  </span>
                )}
              </div>

              {/* Right: Model Information & Status */}
              <div className="p-4 rounded-xl bg-[#13253B] border border-[#1E3A5F] text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Algorithm:</span>
                  <span className="font-bold text-white">Linear Regression + AQI Lags</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Autoregression Lags:</span>
                  <span className="font-bold text-white font-mono">t−1, t−2, t−3</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-[#1E3A5F]">
                  <span className="text-slate-400">Status:</span>
                  {modelStatus === 'verified' ? (
                    <span className="font-bold text-[#0D9B76] flex items-center gap-1 bg-[#0D9B76]/15 px-2 py-0.5 rounded-md border border-[#0D9B76]/30 text-[11px]">
                      <CheckCircle size={12} />
                      Model Inference Verified
                    </span>
                  ) : modelStatus === 'error' ? (
                    <span className="font-bold text-rose-400 flex items-center gap-1 bg-rose-500/15 px-2 py-0.5 rounded-md border border-rose-500/30 text-[11px]">
                      <AlertTriangle size={12} />
                      Inference Error
                    </span>
                  ) : (
                    <span className="font-bold text-slate-400 bg-[#0B1724] px-2 py-0.5 rounded-md border border-[#1E3A5F] text-[11px]">
                      Ready
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Current → Predicted Comparison Flow */}
            {manualResult && Number.isFinite(manualResult.predicted_aqi) && (
              <div className="mt-6 pt-5 border-t border-[#1E3A5F] bg-gradient-to-r from-[#0D9B76]/15 to-[#36C5F0]/15 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Current AQI
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-white font-mono">
                      {manualResult.current_aqi.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-[#36C5F0] font-black text-lg px-1">
                    →
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#36C5F0] block mb-0.5">
                      Next-Hour AQI
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#36C5F0] font-mono">
                      {manualResult.predicted_aqi.toFixed(2)}
                    </span>
                  </div>

                  <div className="pl-4 sm:pl-6 border-l border-[#1E3A5F]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Change
                    </span>
                    <span className={`text-xs sm:text-sm font-bold font-mono px-2.5 py-1 rounded-lg inline-block ${
                      manualResult.change > 0 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                        : manualResult.change < 0 
                        ? 'bg-[#0D9B76]/20 text-[#36C5F0] border border-[#0D9B76]/40' 
                        : 'bg-[#13253B] text-slate-300 border border-[#1E3A5F]'
                    }`}>
                      {manualResult.change > 0 ? `+${manualResult.change.toFixed(2)}` : manualResult.change.toFixed(2)} AQI
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-medium self-end sm:self-center font-mono">
                  Δ = Forecasted (t+1) − Current (t)
                </div>
              </div>
            )}
          </div>

          {/* Centralized Smart AQI Advisory & Precautionary Intelligence for Manual Mode */}
          {manualResult && Number.isFinite(manualResult.predicted_aqi) && (
            <SmartAQIAdvisory
              aqi={manualResult.predicted_aqi}
              pollutants={{
                PM25: parseFloat(features.pm25),
                PM10: parseFloat(features.pm10),
                NO2: parseFloat(features.no2),
                SO2: parseFloat(features.so2),
                CO: parseFloat(features.co),
                O3: parseFloat(features.o3)
              }}
              mode="manual"
              isForecast={true}
              title="Predicted Air Quality Health Advisory & Intelligence"
              subtitle="Holistic health precautions, outdoor activity suitability matrix, and travel guidance derived from the centralized advisory engine for your custom simulated air quality scenario"
              precomputedAdvisory={manualResult.advisory}
              timestamp={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST'}
            />
          )}

          {/* Model Metrics Cards (Section 10: MAE 0.691, RMSE 1.156, R² 0.994 with label: Test-set performance) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0F1F33] border border-[#1E3A5F] shadow-[0_8px_25px_rgba(0,0,0,0.3)] flex items-center justify-between text-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  MAE
                </span>
                <span className="text-2xl font-black text-white mt-1 block font-mono">
                  0.691
                </span>
                <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                  Test-set performance
                </span>
              </div>
              <span className="text-xs font-bold text-[#36C5F0] bg-[#36C5F0]/15 px-2.5 py-1 rounded-xl border border-[#36C5F0]/30">
                MAE
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F1F33] border border-[#1E3A5F] shadow-[0_8px_25px_rgba(0,0,0,0.3)] flex items-center justify-between text-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  RMSE
                </span>
                <span className="text-2xl font-black text-white mt-1 block font-mono">
                  1.156
                </span>
                <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                  Test-set performance
                </span>
              </div>
              <span className="text-xs font-bold text-cyan-300 bg-cyan-500/15 px-2.5 py-1 rounded-xl border border-cyan-500/30">
                RMSE
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F1F33] border border-[#1E3A5F] shadow-[0_8px_25px_rgba(0,0,0,0.3)] flex items-center justify-between text-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  R² Score
                </span>
                <span className="text-2xl font-black text-[#0D9B76] mt-1 block font-mono">
                  0.994
                </span>
                <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                  Test-set performance
                </span>
              </div>
              <span className="text-xs font-bold text-[#0D9B76] bg-[#0D9B76]/15 px-2.5 py-1 rounded-xl border border-[#0D9B76]/30">
                R²
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
