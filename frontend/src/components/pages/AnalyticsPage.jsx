import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Clock, 
  Database, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  Filter, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import CountUp from '../common/CountUp';
import AqiBadge from '../common/AqiBadge';
import { getAnalytics } from '../../services/api';
import { getAqiCategory } from '../../utils/aqiUtils';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Controls
  const [selectedPollutant, setSelectedPollutant] = useState('PM25');
  const [activePreset, setActivePreset] = useState('all'); // 'all' | 'q1' | 'q2' | 'custom'
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-06-30');

  const fetchAnalyticsData = useCallback(async (start = null, end = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAnalytics(start, end);
      if (res.status === "error" || res.status === "dataset_required") {
        setError(res.message || "Historical analytics dataset is unavailable on the server.");
        setData(null);
      } else {
        setData(res);
      }
    } catch (err) {
      setError("Analytics data unavailable: " + (err.message || "Failed to connect to backend server"));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Handle Preset Filter Clicks
  const handlePresetChange = (preset) => {
    setActivePreset(preset);
    if (preset === 'all') {
      setStartDate('2026-01-01');
      setEndDate('2026-06-30');
      fetchAnalyticsData(null, null);
    } else if (preset === 'q1') {
      setStartDate('2026-01-01');
      setEndDate('2026-03-31');
      fetchAnalyticsData('2026-01-01', '2026-03-31');
    } else if (preset === 'q2') {
      setStartDate('2026-04-01');
      setEndDate('2026-06-30');
      fetchAnalyticsData('2026-04-01', '2026-06-30');
    }
  };

  const handleApplyCustomFilter = (e) => {
    e.preventDefault();
    setActivePreset('custom');
    fetchAnalyticsData(startDate, endDate);
  };

  const pollutantConfigs = {
    PM25: { label: "PM2.5", name: "Fine Particulate Matter", unit: "µg/m³", color: "#0D9B76", threshold: 60 },
    PM10: { label: "PM10", name: "Coarse Particulate Matter", unit: "µg/m³", color: "#36C5F0", threshold: 100 },
    NO2: { label: "NO2", name: "Nitrogen Dioxide", unit: "ppb", color: "#38BDF8", threshold: 40 },
    SO2: { label: "SO2", name: "Sulfur Dioxide", unit: "ppb", color: "#818CF8", threshold: 40 },
    CO: { label: "CO", name: "Carbon Monoxide", unit: "ppb", color: "#A78BFA", threshold: 2 },
    O3: { label: "O3", name: "Ground-level Ozone", unit: "µg/m³", color: "#F472B6", threshold: 100 },
  };

  // Loading Skeleton
  if (isLoading && !data) {
    return (
      <div className="space-y-8 pb-12 text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="h-6 w-36 bg-[#13253B] rounded-full animate-pulse mb-2 border border-[#1E3A5F]" />
            <div className="h-8 w-72 bg-[#13253B] rounded-xl animate-pulse border border-[#1E3A5F]" />
          </div>
          <div className="h-10 w-44 bg-[#13253B] rounded-xl animate-pulse border border-[#1E3A5F]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#0F1F33] rounded-2xl border border-[#1E3A5F] p-5 animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-[#0F1F33] rounded-3xl border border-[#1E3A5F] p-8 animate-pulse flex items-center justify-center text-slate-400 font-semibold text-sm">
          <RefreshCw size={22} className="animate-spin text-[#36C5F0] mr-2.5" />
          <span>Processing Historical Dataset...</span>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !data) {
    return (
      <div className="space-y-6 pb-12 text-slate-100">
        <div className="p-8 rounded-3xl bg-[#0F1F33] border border-rose-500/40 shadow-xl text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <AlertCircle size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Analytics Data Unavailable
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {error}
            </p>
          </div>
          <button
            onClick={() => fetchAnalyticsData()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] text-white font-bold text-xs shadow-md shadow-[#0D9B76]/30 inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <RefreshCw size={14} />
            <span>Retry Loading Analytics</span>
          </button>
        </div>
      </div>
    );
  }

  const {
    dataset = {},
    overview = {},
    aqi_trend = [],
    pollutant_trends = {},
    category_distribution = [],
    monthly_comparison = [],
    actual_vs_predicted = [],
    model_performance = []
  } = data || {};

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      {/* Header & Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0D9B76]/15 text-[#36C5F0] border border-[#0D9B76]/30">
              Station Analytics Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Air Quality Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Interactive exploration of historical trends, model validation, and criteria pollutants.
          </p>
        </div>

        {/* Dataset Reference Tag */}
        <div className="flex items-center gap-2.5 bg-[#0F1F33] px-3.5 py-2 rounded-2xl border border-[#1E3A5F] shadow-md self-start sm:self-auto text-xs">
          <Database size={15} className="text-[#36C5F0]" />
          <span className="font-bold text-white">{dataset.period || "Jan – Jun 2026"}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{dataset.station || "Manali, Chennai - CPCB"}</span>
        </div>
      </div>

      {/* Modern Filter Strip */}
      <div className="bg-[#0F1F33] rounded-2xl p-3 sm:p-4 border border-[#1E3A5F] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={13} className="text-[#36C5F0]" />
            Period:
          </span>
          <button
            onClick={() => handlePresetChange('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePreset === 'all'
                ? 'bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] text-white shadow-md shadow-[#0D9B76]/30'
                : 'bg-[#13253B] text-slate-300 hover:text-white hover:bg-[#182F4B] border border-[#1E3A5F]'
            }`}
          >
            Jan–Jun 2026
          </button>
          <button
            onClick={() => handlePresetChange('q1')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePreset === 'q1'
                ? 'bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] text-white shadow-md shadow-[#0D9B76]/30'
                : 'bg-[#13253B] text-slate-300 hover:text-white hover:bg-[#182F4B] border border-[#1E3A5F]'
            }`}
          >
            Q1 (Jan–Mar)
          </button>
          <button
            onClick={() => handlePresetChange('q2')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePreset === 'q2'
                ? 'bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] text-white shadow-md shadow-[#0D9B76]/30'
                : 'bg-[#13253B] text-slate-300 hover:text-white hover:bg-[#182F4B] border border-[#1E3A5F]'
            }`}
          >
            Q2 (Apr–Jun)
          </button>
        </div>

        {/* Custom Date Range Picker */}
        <form onSubmit={handleApplyCustomFilter} className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#13253B] px-2.5 py-1.5 rounded-xl border border-[#1E3A5F]">
            <Calendar size={13} className="text-[#36C5F0]" />
            <input
              type="date"
              value={startDate}
              min="2026-01-01"
              max="2026-06-30"
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-slate-200 font-semibold focus:outline-none"
            />
          </div>
          <span className="text-slate-400 font-bold">to</span>
          <div className="flex items-center gap-1.5 bg-[#13253B] px-2.5 py-1.5 rounded-xl border border-[#1E3A5F]">
            <Calendar size={13} className="text-[#36C5F0]" />
            <input
              type="date"
              value={endDate}
              min="2026-01-01"
              max="2026-06-30"
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-slate-200 font-semibold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] hover:opacity-90 text-white font-bold text-xs transition-all cursor-pointer shadow-sm shadow-[#0D9B76]/30"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Top KPI Row with CountUp Animations */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average AQI */}
        <div className="bg-[#0F1F33] rounded-2xl p-5 border border-[#1E3A5F] shadow-md flex flex-col justify-between card-hover">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average AQI</span>
            <div className="w-8 h-8 rounded-lg bg-[#0D9B76]/15 text-[#36C5F0] border border-[#0D9B76]/30 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <div>
            <div className="my-1">
              <span className="text-4xl font-black text-white font-mono tracking-tight block">
                {overview.average_aqi !== undefined && overview.average_aqi !== null ? (
                  <CountUp value={overview.average_aqi} decimals={2} duration={750} />
                ) : "97.40"}
              </span>
            </div>
            <div className="mt-2.5">
              <AqiBadge aqi={overview.average_aqi ?? 97.40} size="sm" />
            </div>
          </div>
        </div>

        {/* Peak AQI */}
        <div className="bg-[#0F1F33] rounded-2xl p-5 border border-[#1E3A5F] shadow-md flex flex-col justify-between card-hover">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Peak AQI</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <div className="my-1">
              <span className="text-4xl font-black text-amber-400 font-mono tracking-tight block">
                {overview.maximum_aqi !== undefined && overview.maximum_aqi !== null ? (
                  <CountUp value={overview.maximum_aqi} decimals={2} duration={850} />
                ) : "370.78"}
              </span>
            </div>
            <div className="mt-2.5">
              <AqiBadge aqi={overview.maximum_aqi ?? 370.78} size="sm" />
            </div>
          </div>
        </div>

        {/* Minimum AQI */}
        <div className="bg-[#0F1F33] rounded-2xl p-5 border border-[#1E3A5F] shadow-md flex flex-col justify-between card-hover">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Minimum AQI</span>
            <div className="w-8 h-8 rounded-lg bg-[#0D9B76]/15 text-[#0D9B76] border border-[#0D9B76]/30 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div>
            <div className="my-1">
              <span className="text-4xl font-black text-[#0D9B76] font-mono tracking-tight block">
                {overview.minimum_aqi !== undefined && overview.minimum_aqi !== null ? (
                  <CountUp value={overview.minimum_aqi} decimals={2} duration={750} />
                ) : "35.31"}
              </span>
            </div>
            <div className="mt-2.5">
              <AqiBadge aqi={overview.minimum_aqi ?? 35.31} size="sm" />
            </div>
          </div>
        </div>

        {/* Valid Observations */}
        <div className="bg-[#0F1F33] rounded-2xl p-5 border border-[#1E3A5F] shadow-md flex flex-col justify-between card-hover">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Valid Observations</span>
            <div className="w-8 h-8 rounded-lg bg-[#36C5F0]/15 text-[#36C5F0] border border-[#36C5F0]/30 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <div className="my-1">
              <span className="text-4xl font-black text-white font-mono tracking-tight block">
                {overview.valid_observations !== undefined && overview.valid_observations !== null ? (
                  <CountUp value={overview.valid_observations} decimals={0} duration={900} />
                ) : "1,891"}
              </span>
            </div>
            <div className="mt-2.5 text-[11px] font-medium text-slate-400 leading-tight">
              Valid AQI records: {overview.valid_observations?.toLocaleString() ?? "1,891"} of {overview.total_rows?.toLocaleString() ?? "3,609"} historical hourly records
            </div>
          </div>
        </div>
      </section>

      {/* Row 1: Primary AQI Trend (Area Chart) & Actual vs Predicted (Line Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary AQI Trend Chart */}
        <div className="bg-[#0F1F33] rounded-3xl p-6 sm:p-7 border border-[#1E3A5F] shadow-md flex flex-col justify-between card-hover">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Historical AQI Trajectory
              </h3>
              <p className="text-xs text-slate-400">
                Daily aggregated AQI timeline ({aqi_trend.length} observations)
              </p>
            </div>
            <span className="text-xs font-bold text-[#36C5F0] bg-[#36C5F0]/15 px-2.5 py-1 rounded-lg border border-[#36C5F0]/30">
              Daily Aggregation
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aqi_trend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsAqiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9B76" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#36C5F0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                <XAxis dataKey="time" stroke="#1E3A5F" tick={{ fontSize: 10, fill: '#94A3B8' }} minTickGap={25} />
                <YAxis domain={['auto', 'auto']} stroke="#1E3A5F" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  labelFormatter={(val, items) => {
                    const d = items?.[0]?.payload?.date || val;
                    return `Date: ${d}`;
                  }}
                  formatter={(val) => [
                    `${val} AQI (${getAqiCategory(val).label})`, 
                    'Daily Avg AQI'
                  ]}
                  contentStyle={{
                    backgroundColor: '#0F1F33',
                    border: '1px solid #1E3A5F',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -3px rgba(0,0,0,0.5)'
                  }}
                />
                <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Satisfactory (100)', position: 'insideTopRight', fill: '#f59e0b', fontSize: 10 }} />
                <Area type="monotone" dataKey="aqi" stroke="#36C5F0" strokeWidth={2.4} fill="url(#analyticsAqiGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Insight Chip */}
          <div className="mt-4 pt-3 border-t border-[#1E3A5F] flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#13253B] text-slate-300 font-medium border border-[#1E3A5F]">
              <Sparkles size={12} className="text-[#36C5F0]" />
              Peak AQI: 370.78 · Lowest monthly average: May
            </span>
            <span className="text-slate-400 font-medium">Continuous Trend</span>
          </div>
        </div>

        {/* Actual vs Predicted AQI Chart */}
        <div className="bg-[#0F1F33] rounded-3xl p-6 sm:p-7 border border-[#1E3A5F] shadow-md flex flex-col justify-between card-hover">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Actual vs. Predicted AQI
              </h3>
              <p className="text-xs text-slate-400">
                Model target (<code className="font-mono text-[#36C5F0]">t+1</code>) validation comparison
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0D9B76] bg-[#0D9B76]/15 px-2.5 py-1 rounded-lg border border-[#0D9B76]/30">
                R² = 0.994
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={actual_vs_predicted} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                <XAxis dataKey="time" stroke="#1E3A5F" tick={{ fontSize: 10, fill: '#94A3B8' }} minTickGap={25} />
                <YAxis domain={['auto', 'auto']} stroke="#1E3A5F" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  labelFormatter={(val, items) => {
                    const d = items?.[0]?.payload?.date || val;
                    return `Date: ${d}`;
                  }}
                  formatter={(val, name, item) => {
                    const actualVal = item?.payload?.actual;
                    const predVal = item?.payload?.predicted;
                    const err = (actualVal && predVal) ? Math.abs(actualVal - predVal).toFixed(2) : "0.00";
                    return [`${val} AQI (Abs Error: ${err})`, name];
                  }}
                  contentStyle={{
                    backgroundColor: '#0F1F33',
                    border: '1px solid #1E3A5F',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -3px rgba(0,0,0,0.5)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: '#94A3B8' }} />
                <Line type="monotone" dataKey="actual" name="Actual CPCB AQI" stroke="#36C5F0" strokeWidth={2.4} dot={false} />
                <Line type="monotone" dataKey="predicted" name="Predicted Next-Hour AQI" stroke="#0D9B76" strokeWidth={2.2} strokeDasharray="3 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Error Metrics Strip at Bottom */}
          <div className="mt-4 pt-3 border-t border-[#1E3A5F] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-300">MAE: <strong className="text-[#36C5F0]">0.691</strong></span>
              <span className="text-[#1E3A5F]">|</span>
              <span className="font-semibold text-slate-300">RMSE: <strong className="text-[#36C5F0]">1.156</strong></span>
              <span className="text-[#1E3A5F]">|</span>
              <span className="font-semibold text-slate-300">R²: <strong className="text-[#0D9B76]">0.994</strong></span>
            </div>
            <span className="text-[#0D9B76] font-bold bg-[#0D9B76]/15 px-2 py-0.5 rounded border border-[#0D9B76]/30">High Fidelity</span>
          </div>
        </div>
      </div>

      {/* Row 2: Pollutant Explorer (7 cols) & Category Distribution Donut (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pollutant Dynamics Explorer */}
        <div className="lg:col-span-7 bg-[#0F1F33] rounded-3xl p-6 sm:p-7 border border-[#1E3A5F] shadow-md flex flex-col justify-between card-hover">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Criteria Pollutant Dynamics
              </h3>
              <p className="text-xs text-slate-400">
                {pollutantConfigs[selectedPollutant].name} ({pollutantConfigs[selectedPollutant].unit})
              </p>
            </div>
            {/* Pollutant Tabs */}
            <div className="flex items-center gap-1 bg-[#13253B] p-1 rounded-xl self-start sm:self-auto flex-wrap border border-[#1E3A5F]">
              {Object.keys(pollutantConfigs).map((polKey) => (
                <button
                  key={polKey}
                  onClick={() => setSelectedPollutant(polKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedPollutant === polKey
                      ? 'bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {pollutantConfigs[polKey].label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={pollutant_trends[selectedPollutant] || []} 
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                <XAxis dataKey="time" stroke="#1E3A5F" tick={{ fontSize: 10, fill: '#94A3B8' }} minTickGap={25} />
                <YAxis stroke="#1E3A5F" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  labelFormatter={(val, items) => {
                    const d = items?.[0]?.payload?.date || val;
                    return `Date: ${d}`;
                  }}
                  formatter={(val) => [`${val} ${pollutantConfigs[selectedPollutant].unit}`, pollutantConfigs[selectedPollutant].name]}
                  contentStyle={{
                    backgroundColor: '#0F1F33',
                    border: '1px solid #1E3A5F',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name={`${pollutantConfigs[selectedPollutant].label}`} 
                  stroke={pollutantConfigs[selectedPollutant].color} 
                  strokeWidth={2.4} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E3A5F] text-xs flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#13253B] text-slate-300 font-medium border border-[#1E3A5F]">
              Dominant pollutant in valid observations: PM2.5
            </span>
            <span className="text-slate-400">Standard: CPCB NAAQS</span>
          </div>
        </div>

        {/* AQI Category Distribution Donut */}
        <div className="lg:col-span-5 bg-[#0F1F33] rounded-3xl p-6 sm:p-7 border border-[#1E3A5F] shadow-md flex flex-col justify-between card-hover">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                AQI Category Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Percentage breakdown of 1,891 valid observations
              </p>
            </div>
            <PieChartIcon size={18} className="text-[#36C5F0]" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={category_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {category_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, item) => [
                    `${value}% (${item?.payload?.count?.toLocaleString() || 0} observations)`,
                    item?.payload?.category || name
                  ]}
                  contentStyle={{
                    backgroundColor: '#0F1F33',
                    border: '1px solid #1E3A5F',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Compact Category Breakdown Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#1E3A5F]">
            {category_distribution.map((cat, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-400 truncate">{cat.category}:</span>
                <strong className="text-white">{cat.percentage}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Monthly Comparison Grouped Bar Chart */}
      <section className="bg-[#0F1F33] rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] shadow-md space-y-4 card-hover">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h3 className="text-base font-bold text-white">
              Monthly Air Quality Comparison
            </h3>
            <p className="text-xs text-slate-400">
              Average vs. peak AQI by month (January 2026 – June 2026)
            </p>
          </div>
          <span className="text-xs font-bold text-slate-300 bg-[#13253B] px-3 py-1 rounded-full border border-[#1E3A5F]">
            Manali CPCB Telemetry
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly_comparison} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="month" stroke="#1E3A5F" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis stroke="#1E3A5F" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip
                formatter={(val, name, item) => [
                  `${val} AQI (${item?.payload?.observations || 0} valid hours)`, 
                  name
                ]}
                contentStyle={{
                  backgroundColor: '#0F1F33',
                  border: '1px solid #1E3A5F',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#94A3B8' }} />
              <Bar dataKey="avgAqi" name="Average Monthly AQI" fill="#0D9B76" radius={[6, 6, 0, 0]} />
              <Bar dataKey="maxAqi" name="Maximum Peak Day AQI" fill="#36C5F0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#13253B] border border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <span className="font-medium">
            Insight: Highest monthly average occurred in February (131.7 AQI); lowest in May (77.8 AQI).
          </span>
          <span className="font-bold text-[#0D9B76]">Validated 6-Month Record</span>
        </div>
      </section>

      {/* Model Benchmark Table */}
      <section className="bg-[#0F1F33] rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] shadow-md space-y-5 card-hover">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E3A5F]">
          <div>
            <div className="flex items-center gap-2">
              <Award size={18} className="text-[#36C5F0]" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Model Evaluation Benchmarks
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical comparison of 5 predictive architectures evaluated on the Manali dataset
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-[#0D9B76]/15 text-[#36C5F0] font-bold text-xs border border-[#0D9B76]/30 flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 size={13} />
            Champion: Linear Regression + AQI Lags
          </span>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E3A5F] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Predictive Model</th>
                <th className="py-2.5 px-3">MAE</th>
                <th className="py-2.5 px-3">RMSE</th>
                <th className="py-2.5 px-3">R²</th>
                <th className="py-2.5 px-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A5F]">
              {model_performance.map((row, idx) => {
                const isSelected = row.isFinal;
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-[#0D9B76]/10 font-semibold'
                        : 'hover:bg-[#13253B] text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#0D9B76]" />}
                        <span className={`font-bold ${isSelected ? 'text-[#36C5F0] font-extrabold' : 'text-slate-200'}`}>
                          {row.model}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-300">
                      {Number(row.mae).toFixed(3)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-300">
                      {Number(row.rmse).toFixed(3)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded ${
                        isSelected ? 'bg-gradient-to-r from-[#0D9B76] to-[#36C5F0] text-white font-extrabold' : 'bg-[#13253B] text-slate-300 border border-[#1E3A5F]'
                      }`}>
                        {Number(row.r2).toFixed(3)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {isSelected ? (
                        <span className="text-[#36C5F0] font-bold bg-[#36C5F0]/15 px-2 py-0.5 rounded text-[11px] border border-[#36C5F0]/30">
                          Production Model
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Benchmark</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
