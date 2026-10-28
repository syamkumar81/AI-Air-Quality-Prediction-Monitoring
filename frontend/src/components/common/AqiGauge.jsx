import React, { useState, useEffect } from 'react';
import { getAqiCategory, AQI_CATEGORIES } from '../../utils/aqiUtils';

export default function AqiGauge({ aqi = 0, size = 300, showDetails = true, className = "" }) {
  const currentAqi = aqi !== null && aqi !== undefined && !isNaN(Number(aqi)) ? Number(aqi) : null;
  const clampedAqi = currentAqi !== null ? Math.max(0, Math.min(500, currentAqi)) : 0;
  const category = getAqiCategory(clampedAqi);

  // Convert AQI (0 to 500) to gauge angle (0 to 180 degrees)
  const aqiToAngle = (val) => {
    return Math.min(180, Math.max(0, (val / 500) * 180));
  };

  const targetAngle = aqiToAngle(clampedAqi);
  const [animatedAngle, setAnimatedAngle] = useState(0);
  const [displayNumber, setDisplayNumber] = useState(0);

  // Smooth needle animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedAngle(targetAngle);
    }, 120);
    return () => clearTimeout(timer);
  }, [targetAngle]);

  // Smooth numeric count-up animation for the SVG center text
  useEffect(() => {
    if (currentAqi === null) return;
    let startTimestamp = null;
    const startVal = 0;
    const endVal = currentAqi;
    let rafId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / 800, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = startVal + (endVal - startVal) * ease;

      if (Number.isInteger(endVal)) {
        setDisplayNumber(Math.round(val));
      } else {
        setDisplayNumber(Number(val.toFixed(2)));
      }

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        setDisplayNumber(endVal);
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [currentAqi]);

  const radius = 110;
  const strokeWidth = 16;
  const center = { x: 150, y: 145 };

  const polarToCartesian = (centerX, centerY, rad, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
      x: centerX + rad * Math.cos(angleInRadians),
      y: centerY + rad * Math.sin(angleInRadians)
    };
  };

  const describeArc = (x, y, rad, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, rad, endAngle);
    const end = polarToCartesian(x, y, rad, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", rad, rad, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const segments = [
    { start: 0, end: 50, color: AQI_CATEGORIES.GOOD.color, label: "Good" },
    { start: 50, end: 100, color: AQI_CATEGORIES.SATISFACTORY.color, label: "Satisfactory" },
    { start: 100, end: 200, color: AQI_CATEGORIES.MODERATE.color, label: "Moderate" },
    { start: 200, end: 300, color: AQI_CATEGORIES.POOR.color, label: "Poor" },
    { start: 300, end: 400, color: AQI_CATEGORIES.VERY_POOR.color, label: "Very Poor" },
    { start: 400, end: 500, color: AQI_CATEGORIES.SEVERE.color, label: "Severe" }
  ];

  const needleLength = radius - 15;
  const needleRadian = ((animatedAngle - 180) * Math.PI) / 180.0;
  const needleTipX = center.x + needleLength * Math.cos(needleRadian);
  const needleTipY = center.y + needleLength * Math.sin(needleRadian);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative" style={{ width: size, height: size * 0.72 }}>
        <svg
          viewBox="0 0 300 190"
          className="w-full h-full overflow-visible"
        >
          {/* Background track */}
          <path
            d={describeArc(center.x, center.y, radius, 0, 180)}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth + 4}
            strokeLinecap="round"
          />

          {/* 6 Category Segments */}
          {segments.map((seg, idx) => {
            const startAng = aqiToAngle(seg.start);
            const endAng = aqiToAngle(seg.end);
            return (
              <path
                key={idx}
                d={describeArc(center.x, center.y, radius, startAng, endAng)}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="opacity-85 hover:opacity-100 transition-opacity"
              />
            );
          })}

          {/* Ticks and Numerical Markers */}
          {[0, 50, 100, 200, 300, 400, 500].map((tickVal) => {
            const angle = aqiToAngle(tickVal);
            const posInner = polarToCartesian(center.x, center.y, radius - strokeWidth / 2 - 3, angle);
            const posOuter = polarToCartesian(center.x, center.y, radius + strokeWidth / 2 + 3, angle);
            const textPos = polarToCartesian(center.x, center.y, radius - 26, angle);

            return (
              <g key={tickVal}>
                <line
                  x1={posInner.x}
                  y1={posInner.y}
                  x2={posOuter.x}
                  y2={posOuter.y}
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                  className="opacity-75"
                />
                <text
                  x={textPos.x}
                  y={textPos.y + 3}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontWeight="600"
                  fill="#64748b"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Dynamic Needle with smooth easing */}
          <g style={{ transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <line
              x1={center.x}
              y1={center.y}
              x2={needleTipX}
              y2={needleTipY}
              stroke="#0f172a"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle
              cx={center.x}
              cy={center.y}
              r="8"
              fill="#0f172a"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <circle
              cx={center.x}
              cy={center.y}
              r="3"
              fill={category.color}
            />
          </g>

          {/* Primary Numeric Display in Gauge Center */}
          <g>
            <text
              x={center.x}
              y={center.y - 12}
              textAnchor="middle"
              fontSize="38"
              fontWeight="900"
              fill="#0f172a"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
            >
              {currentAqi !== null ? displayNumber : '...'}
            </text>
            <text
              x={center.x}
              y={center.y + 4}
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="800"
              fill="#64748b"
              letterSpacing="0.09em"
            >
              AQI INDEX
            </text>
          </g>
        </svg>

        {/* Ambient shadow pulse */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-5 blur-xl rounded-full opacity-25 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: category.color }}
        />
      </div>

      {showDetails && (
        <div className="flex flex-col items-center mt-1 text-center">
          <div
            className="px-3.5 py-1 rounded-full text-xs font-bold shadow-xs border transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: category.color + '15',
              color: category.color,
              borderColor: category.color + '40'
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
            <span>{category.label}</span>
            <span className="text-[11px] opacity-75 font-normal">({category.range})</span>
          </div>

          <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
            {category.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
