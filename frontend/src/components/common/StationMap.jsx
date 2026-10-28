import React, { useState, useEffect } from 'react';
import { MapPin, Wind, Navigation, Compass, Layers, Info, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CHENNAI_STATIONS, STATION_INFO } from '../../data/mockData';
import { getAqiCategory } from '../../utils/aqiUtils';
import { getLiveAQI } from '../../services/api';

function getCompassDirection(deg) {
  if (deg === undefined || deg === null || isNaN(deg)) return "N/A";
  const val = Math.floor((deg / 22.5) + 0.5);
  const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return arr[(val % 16)];
}

export default function StationMap({ selectedStationId = "manali", liveAqi = null, weather = null, className = "" }) {
  const [internalLiveAqi, setInternalLiveAqi] = useState(liveAqi);
  const [internalWeather, setInternalWeather] = useState(weather);
  const [activeStationId, setActiveStationId] = useState(selectedStationId);
  const [showWindVectors, setShowWindVectors] = useState(true);
  const [showRadius, setShowRadius] = useState(true);

  useEffect(() => {
    if (liveAqi !== null && liveAqi !== undefined) {
      setInternalLiveAqi(liveAqi);
    }
    if (weather !== null && weather !== undefined) {
      setInternalWeather(weather);
    }
    if (liveAqi !== null && weather !== null) {
      return;
    }
    let isMounted = true;
    getLiveAQI(false)
      .then((res) => {
        if (isMounted && res && res.status !== "error") {
          if (res.aqi !== undefined && (liveAqi === null || liveAqi === undefined)) {
            setInternalLiveAqi(Math.round(res.aqi));
          }
          if (res.weather && (weather === null || weather === undefined)) {
            const w = res.weather;
            setInternalWeather({
              windSpeed: w.Wind_Speed ?? null,
              windSpeedUnit: "m/s",
              windDirection: getCompassDirection(w.Wind_Direction),
              windDegree: w.Wind_Direction ?? null,
              humidity: w.Humidity ?? null
            });
          }
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [liveAqi, weather]);

  const activeWeather = weather || internalWeather;
  const windSpeed = activeWeather?.windSpeed !== undefined && activeWeather?.windSpeed !== null ? activeWeather.windSpeed : null;
  const windDir = activeWeather?.windDirection || (activeWeather?.windDegree !== undefined ? getCompassDirection(activeWeather.windDegree) : "N/A");
  const windDegree = activeWeather?.windDegree !== undefined && activeWeather?.windDegree !== null ? activeWeather.windDegree : null;

  const currentManaliAqi = internalLiveAqi !== null ? internalLiveAqi : "...";
  const currentManaliCategory = internalLiveAqi !== null ? getAqiCategory(internalLiveAqi) : { color: "#10b981", label: "Connecting..." };

  const activeStation = CHENNAI_STATIONS.find(s => s.id === activeStationId) || CHENNAI_STATIONS[0];
  const isManaliActive = activeStation.id === "manali";

  // Approximate relative coordinates for Chennai map visualization
  // Lat: 12.95 to 13.25, Lng: 80.15 to 80.32
  const mapWidth = 800;
  const mapHeight = 520;

  // Projection conversion to SVG coordinates
  const project = (lat, lng) => {
    const minLat = 12.92;
    const maxLat = 13.24;
    const minLng = 80.12;
    const maxLng = 80.34;

    const x = ((lng - minLng) / (maxLng - minLng)) * (mapWidth - 100) + 50;
    // Invert Y since latitude increases northward
    const y = ((maxLat - lat) / (maxLat - minLat)) * (mapHeight - 80) + 40;
    return { x, y };
  };

  const manaliPos = project(13.1673, 80.2608);

  return (
    <div className={`bg-[#0F1F33] rounded-2xl border border-[#1E3A5F] shadow-lg overflow-hidden flex flex-col text-slate-100 ${className}`}>
      {/* Map Header Toolbar */}
      <div className="p-4 bg-[#13253B] border-b border-[#1E3A5F] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0D9B76]/15 text-[#36C5F0] border border-[#0D9B76]/30 flex items-center justify-center">
            <MapPin size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Monitoring Station Spatial Map
            </h3>
            <p className="text-xs text-slate-400">
              Primary CAAQMS: <span className="text-[#36C5F0] font-semibold">{STATION_INFO.name}</span>
            </p>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWindVectors(!showWindVectors)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border cursor-pointer ${
              showWindVectors 
                ? 'bg-[#36C5F0]/15 text-[#36C5F0] border-[#36C5F0]/30 shadow-xs' 
                : 'bg-[#0B1724] text-slate-400 border-[#1E3A5F] hover:bg-[#182F4B]'
            }`}
          >
            <Wind size={13} />
            <span>Wind Vectors {windDir !== "N/A" ? `(${windDir})` : ""}</span>
          </button>
          <button
            onClick={() => setShowRadius(!showRadius)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border cursor-pointer ${
              showRadius 
                ? 'bg-[#0D9B76]/15 text-[#0D9B76] border-[#0D9B76]/30 shadow-xs' 
                : 'bg-[#0B1724] text-slate-400 border-[#1E3A5F] hover:bg-[#182F4B]'
            }`}
          >
            <Layers size={13} />
            <span>Coverage Radius</span>
          </button>
        </div>
      </div>

      {/* Main Map Visualization Area */}
      <div className="relative bg-gradient-to-br from-[#0B1724] via-[#0F1F33] to-[#081018] min-h-[380px] p-4 flex items-center justify-center overflow-hidden">
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Coastal Edge (Bay of Bengal on East) */}
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full max-h-[460px] select-none"
        >
          <defs>
            {/* Water gradient */}
            <linearGradient id="ocean-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0369a1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.65" />
            </linearGradient>

            {/* Industrial buffer radius gradient */}
            <radialGradient id="buffer-radial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </radialGradient>
          </defs>

          {/* Coastal Bay of Bengal shape (Right side) */}
          <path
            d={`M 660 0 C 640 100, 650 200, 680 320 C 700 400, 720 480, 750 ${mapHeight} L ${mapWidth} ${mapHeight} L ${mapWidth} 0 Z`}
            fill="url(#ocean-gradient)"
            stroke="#0284c7"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-70"
          />

          <text x="710" y="240" fill="#38bdf8" fontSize="11" fontWeight="600" opacity="0.6" letterSpacing="0.1em" transform="rotate(70, 710, 240)">
            BAY OF BENGAL
          </text>

          {/* Chennai City District outlines & road networks (Stylized) */}
          <g stroke="#334155" strokeWidth="1.2" opacity="0.6" fill="none">
            {/* Ennore expressway / NH 16 */}
            <path d="M 120 40 L 320 180 L 460 280 L 520 480" />
            {/* Inner Ring Road */}
            <path d="M 280 120 Q 420 220 380 440" strokeDasharray="3 3" />
            {/* Manali industrial zone perimeter */}
            <rect x={manaliPos.x - 55} y={manaliPos.y - 45} width="110" height="90" rx="16" stroke="#059669" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
          </g>

          {/* Coverage Buffer Zone around Manali */}
          {showRadius && (
            <g>
              <circle
                cx={manaliPos.x}
                cy={manaliPos.y}
                r="70"
                fill="url(#buffer-radial)"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="animate-pulse"
              />
              <circle
                cx={manaliPos.x}
                cy={manaliPos.y}
                r="110"
                fill="none"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="2 4"
                opacity="0.3"
              />
            </g>
          )}

          {/* Wind Trajectory Vectors (ENE at 14.2 km/h) */}
          {showWindVectors && (
            <g stroke="#38bdf8" opacity="0.75">
              {[
                { x: 580, y: 120 },
                { x: 540, y: 190 },
                { x: 500, y: 260 },
                { x: 460, y: 330 }
              ].map((pos, i) => (
                <g key={i}>
                  {/* Measured wind vector representation */}
                  <line
                    x1={pos.x}
                    y1={pos.y}
                    x2={pos.x - 45}
                    y2={pos.y + 22}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <polygon
                    points={`${pos.x - 48},${pos.y + 24} ${pos.x - 38},${pos.y + 16} ${pos.x - 40},${pos.y + 28}`}
                    fill="#38bdf8"
                  />
                </g>
              ))}
              <text x="500" y="95" fill="#38bdf8" fontSize="10" fontWeight="600" opacity="0.9">
                {windSpeed !== null ? `Wind: ${windDir} • ${windSpeed} m/s` : (windDir !== "N/A" ? `Wind: ${windDir}` : "Wind Telemetry")}
              </text>
              {windDegree !== null && (
                <text x="500" y="110" fill="#7dd3fc" fontSize="9.5" fontWeight="500" opacity="0.8">
                  Wind direction: {windDegree}°
                </text>
              )}
            </g>
          )}

          {/* Render All Stations */}
          {CHENNAI_STATIONS.map((station) => {
            const pos = project(station.lat, station.lng);
            const isTarget = station.id === "manali";
            const isSelected = activeStationId === station.id;
            const category = isTarget ? currentManaliCategory : { color: "#64748b", label: "Reference Station" };

            return (
              <g
                key={station.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setActiveStationId(station.id)}
              >
                {/* Pulsing radar for target station */}
                {isTarget && (
                  <>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="26"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeOpacity="0.4"
                      className="animate-ping"
                      style={{ animationDuration: '3s' }}
                    />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="18"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeOpacity="0.8"
                    />
                  </>
                )}

                {/* Outer selection ring */}
                {isSelected && !isTarget && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="16"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                )}

                {/* Station Pin dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isTarget ? "11" : "7"}
                  fill={category.color}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="shadow-lg"
                />

                {/* Label Box */}
                <rect
                  x={pos.x + 16}
                  y={pos.y - 14}
                  width={isTarget ? "165" : "130"}
                  height="28"
                  rx="7"
                  fill="#0f172a"
                  fillOpacity="0.94"
                  stroke={isTarget ? "#10b981" : "#475569"}
                  strokeWidth={isTarget ? "1.5" : "1"}
                />

                <text
                  x={pos.x + 24}
                  y={pos.y + 4}
                  fill="#ffffff"
                  fontSize={isTarget ? "10.5" : "9.5"}
                  fontWeight={isTarget ? "700" : "600"}
                >
                  {isTarget ? "● LIVE" : station.name.split(',')[0]}
                  {isTarget ? (
                    <tspan fill="#34d399" fontWeight="800" dx="8">
                      {currentManaliAqi} AQI
                    </tspan>
                  ) : (
                    <tspan fill="#94a3b8" fontWeight="600" dx="6">
                      [Reference]
                    </tspan>
                  )}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend / Overlay details */}
        <div className="absolute top-4 left-4 bg-[#0B1724]/90 backdrop-blur-md border border-[#1E3A5F] p-3 rounded-xl text-white text-xs max-w-xs shadow-xl">
          <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1">
            <Compass size={14} className="text-[#36C5F0]" />
            <span>Chennai CAAQMS Network</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Latitude: <strong className="text-[#36C5F0]">13.1673° N</strong> • Longitude: <strong className="text-[#36C5F0]">80.2608° E</strong>
          </p>
          <div className="mt-2 pt-2 border-t border-[#1E3A5F] flex items-center justify-between text-[10px] text-slate-400">
            <span>Elevation: 7m above MSL</span>
            <span className="text-[#0D9B76] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9B76] animate-pulse" />
              OpenAQ Live Ingestion
            </span>
          </div>
        </div>
      </div>

      {/* Selected Station Bottom Drawer */}
      <div className="p-4 bg-[#0F1F33] border-t border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#13253B] text-white flex items-center justify-center flex-shrink-0 font-extrabold text-sm border border-[#1E3A5F]">
            {isManaliActive ? currentManaliAqi : "REF"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm">{activeStation.name}</h4>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold"
                style={{
                  backgroundColor: isManaliActive ? currentManaliCategory.color + '20' : '#13253B',
                  color: isManaliActive ? currentManaliCategory.color : '#94A3B8'
                }}
              >
                {isManaliActive ? currentManaliCategory.label : "Regional Reference Station"}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              {isManaliActive 
                ? `Station Type: Continuous CAAQMS (Industrial) • OpenAQ Live Ingestion`
                : `Station Type: Regional Reference Benchmark • Baseline comparison station`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 self-end sm:self-auto">
          <ShieldCheck size={16} className={isManaliActive ? "text-[#0D9B76]" : "text-slate-500"} />
          <span className="font-medium text-slate-300">
            {isManaliActive ? "CPCB Monitoring Station" : "Regional Reference Station"}
          </span>
        </div>
      </div>
    </div>
  );
}
