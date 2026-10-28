// Utility functions for AQI calculations and category styling
// Updated with Emerald Green (#0D9B76) and Deep Navy (#0B1724) high-contrast theme styling

export const AQI_CATEGORIES = {
  GOOD: {
    label: "Good",
    range: "0 - 50",
    color: "#0D9B76", // Emerald Green
    tailwindBg: "bg-[#0D9B76]",
    tailwindText: "text-[#36C5F0]",
    tailwindBorder: "border-[#0D9B76]/40",
    tailwindBadgeBg: "bg-[#0D9B76]/20",
    description: "Air quality is considered satisfactory, and air pollution poses little or no risk.",
    recommendation: "Ideal condition for outdoor sports and activities. No precautions necessary."
  },
  SATISFACTORY: {
    label: "Satisfactory",
    range: "51 - 100",
    color: "#22C55E", // Light Green
    tailwindBg: "bg-emerald-500",
    tailwindText: "text-emerald-300",
    tailwindBorder: "border-emerald-500/40",
    tailwindBadgeBg: "bg-emerald-950/50",
    description: "Minor breathing discomfort to sensitive people.",
    recommendation: "Sensitive individuals should consider reducing intense prolonged outdoor exertion."
  },
  MODERATE: {
    label: "Moderately Polluted",
    range: "101 - 200",
    color: "#EAB308", // Yellow/Amber
    tailwindBg: "bg-yellow-500",
    tailwindText: "text-yellow-300",
    tailwindBorder: "border-yellow-500/40",
    tailwindBadgeBg: "bg-yellow-950/50",
    description: "Breathing discomfort to people with lung disease, asthma and heart conditions.",
    recommendation: "People with respiratory or cardiac conditions should limit outdoor physical exertion."
  },
  POOR: {
    label: "Poor",
    range: "201 - 300",
    color: "#F97316", // Orange
    tailwindBg: "bg-orange-500",
    tailwindText: "text-orange-300",
    tailwindBorder: "border-orange-500/40",
    tailwindBadgeBg: "bg-orange-950/50",
    description: "Breathing discomfort to most people on prolonged exposure.",
    recommendation: "Wear anti-pollution masks outdoors; avoid morning jogs or high-intensity exercise."
  },
  VERY_POOR: {
    label: "Very Poor",
    range: "301 - 400",
    color: "#EF4444", // Red
    tailwindBg: "bg-red-500",
    tailwindText: "text-red-300",
    tailwindBorder: "border-red-500/40",
    tailwindBadgeBg: "bg-red-950/50",
    description: "Respiratory illness on prolonged exposure. Pronounced effect on vulnerable groups.",
    recommendation: "Stay indoors when possible. Run indoor air purifiers and close outdoor ventilation."
  },
  SEVERE: {
    label: "Severe",
    range: "401 - 500+",
    color: "#991B1B", // Dark Red
    tailwindBg: "bg-red-800",
    tailwindText: "text-red-200",
    tailwindBorder: "border-red-600/50",
    tailwindBadgeBg: "bg-red-950/80",
    description: "Affects healthy people and seriously impacts those with existing diseases.",
    recommendation: "Emergency conditions. Avoid all outdoor activity. Keep doors and windows tightly shut."
  }
};

export function getAqiCategory(aqi) {
  const val = Number(aqi);
  if (isNaN(val) || val < 0) return AQI_CATEGORIES.GOOD;
  if (val <= 50) return AQI_CATEGORIES.GOOD;
  if (val <= 100) return AQI_CATEGORIES.SATISFACTORY;
  if (val <= 200) return AQI_CATEGORIES.MODERATE;
  if (val <= 300) return AQI_CATEGORIES.POOR;
  if (val <= 400) return AQI_CATEGORIES.VERY_POOR;
  return AQI_CATEGORIES.SEVERE;
}

export const POLLUTANT_THRESHOLDS = {
  pm25: { name: "PM2.5", unit: "µg/m³", standard: 60, optimal: 30, desc: "Fine Particulate Matter (≤ 2.5 µm)" },
  pm10: { name: "PM10", unit: "µg/m³", standard: 100, optimal: 50, desc: "Respirable Suspended Particulate Matter" },
  no2: { name: "NO2", unit: "µg/m³", standard: 80, optimal: 40, desc: "Nitrogen Dioxide" },
  so2: { name: "SO2", unit: "µg/m³", standard: 80, optimal: 40, desc: "Sulfur Dioxide" },
  co: { name: "CO", unit: "mg/m³", standard: 2.0, optimal: 1.0, desc: "Carbon Monoxide" },
  o3: { name: "O3", unit: "µg/m³", standard: 100, optimal: 50, desc: "Surface Ozone" }
};
