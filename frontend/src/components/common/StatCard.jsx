import React from 'react';
import Sparkline from './Sparkline';
import Skeleton from './Skeleton';
import CountUp from './CountUp';

export default function StatCard({
  title,
  value,
  unit,
  standard,
  status = "Normal",
  statusType = "good", // good | warning | danger | neutral
  icon: Icon,
  subtitle,
  progressPercent,
  color = "#147DFF",
  sparklineData = null,
  isLoading = false,
  className = ""
}) {
  const statusStyles = {
    good: "bg-[#0D9B76]/15 text-[#36C5F0] border-[#0D9B76]/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    neutral: "bg-[#13253B] text-slate-300 border-[#1E3A5F]"
  };

  if (isLoading) {
    return (
      <div className={`bg-[#0F1F33] rounded-2xl p-4 border border-[#1E3A5F] shadow-md space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-12 h-5 rounded-full" />
        </div>
        <Skeleton className="w-24 h-7" />
        <Skeleton className="w-full h-2 rounded-full" />
      </div>
    );
  }

  const numValue = Number(value);
  const isValidNum = !isNaN(numValue) && value !== null && value !== undefined;
  
  const calculatedPercent = progressPercent !== undefined 
    ? progressPercent 
    : (standard && isValidNum ? Math.min(150, Math.round((numValue / Number(standard)) * 100)) : null);

  const displayPercent = calculatedPercent !== null ? Math.min(100, calculatedPercent) : null;

  return (
    <div
      className={`card-hover bg-[#0F1F33] rounded-2xl p-4 border border-[#1E3A5F] shadow-md relative group overflow-hidden flex flex-col justify-between text-slate-100 ${className}`}
    >
      {/* Top row: Pollutant Title + Icon + Status Pill */}
      <div>
        <div className="flex items-start justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-2">
            {Icon && (
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                style={{ backgroundColor: `${color}25`, color }}
              >
                <Icon size={14} />
              </div>
            )}
            <div>
              <h4 className="text-xs font-black text-white tracking-tight">
                {title}
              </h4>
              {subtitle && (
                <span className="text-[10px] font-medium text-slate-400 block truncate max-w-[90px]">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {status && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyles[statusType] || statusStyles.neutral}`}>
              {status}
            </span>
          )}
        </div>

        {/* Value + Sparkline Row */}
        <div className="flex items-end justify-between gap-1 my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-white font-mono">
              {isValidNum ? (
                <CountUp value={value} />
              ) : (
                value ?? "..."
              )}
            </span>
            {unit && (
              <span className="text-[10px] font-bold text-slate-400">
                {unit}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end">
            {sparklineData && sparklineData.length > 1 ? (
              <div className="opacity-85 group-hover:opacity-100 transition-opacity">
                <Sparkline data={sparklineData} color={color} width={68} height={22} />
              </div>
            ) : (
              <span className="text-[9px] text-slate-500 font-mono italic">
                Trend unavailable
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar & Regulatory Limit Reference */}
      {calculatedPercent !== null && (
        <div className="mt-2 pt-2 border-t border-[#1E3A5F]">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-medium">
            <span>CPCB limit: <strong className="text-slate-200">{standard} {unit}</strong></span>
            <span className="font-bold font-mono text-[#36C5F0]">{calculatedPercent}%</span>
          </div>
          <div className="w-full bg-[#13253B] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-800 ease-out"
              style={{
                width: `${displayPercent}%`,
                backgroundColor: calculatedPercent > 100 ? '#EF4444' : (calculatedPercent > 70 ? '#F59E0B' : color)
              }}
            />
          </div>
        </div>
      )}

      {/* Subtle indicator bar on hover */}
      <div
        className="absolute inset-x-0 bottom-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
