import React from 'react';
import { getAqiCategory } from '../../utils/aqiUtils';

export default function AqiBadge({ aqi, categoryName, size = "md", showDot = true, className = "" }) {
  const cat = aqi !== undefined && aqi !== null ? getAqiCategory(aqi) : (categoryName ? getAqiCategoryByName(categoryName) : getAqiCategory(0));

  function getAqiCategoryByName(name) {
    if (!name) return getAqiCategory(0);
    const n = name.toLowerCase();
    if (n.includes('good')) return getAqiCategory(30);
    if (n.includes('satis')) return getAqiCategory(75);
    if (n.includes('mod')) return getAqiCategory(150);
    if (n.includes('poor') && !n.includes('very')) return getAqiCategory(250);
    if (n.includes('very')) return getAqiCategory(350);
    if (n.includes('severe')) return getAqiCategory(450);
    return getAqiCategory(50);
  }

  const sizeClasses = {
    xs: "px-2 py-0.5 text-[10px] font-bold rounded-full",
    sm: "px-2.5 py-0.5 text-xs font-bold rounded-full",
    md: "px-3 py-1 text-xs font-bold rounded-full",
    lg: "px-4 py-1.5 text-sm font-bold rounded-xl"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 transition-all shadow-2xs font-medium ${sizeClasses[size] || sizeClasses.md} ${cat.tailwindBadgeBg} ${cat.tailwindText} border ${cat.tailwindBorder} ${className}`}
      title={`AQI Range: ${cat.range} - ${cat.description}`}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
          style={{ backgroundColor: cat.color }}
        />
      )}
      <span>{cat.label}</span>
    </span>
  );
}
