// API Service Layer for AI Air Quality
// Connects React Frontend to FastAPI Backend at VITE_API_BASE_URL
// Communicates with real OpenAQ v3 data service & ML inference backend

import { CURRENT_MONITORING_DATA } from '../data/mockData';
import { getAqiCategory } from '../utils/aqiUtils';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  endpoints: {
    health: "/api/health",
    liveAqi: "/api/live-aqi",
    livePrediction: "/api/live-prediction",
    predict: "/api/predict",
    analytics: "/api/analytics",
    openaqVerification: "/api/openaq-verification"
  }
};

/**
 * OpenAQ Verification endpoint
 * GET /api/openaq-verification
 */
export async function getOpenAqVerification(forceRefresh = false) {
  const url = `${API_BASE_URL}/api/openaq-verification${forceRefresh ? '?refresh=true' : ''}`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`OpenAQ verification failed with status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Health check endpoint
 * GET /api/health
 */
export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Live AQI endpoint
 * GET /api/live-aqi
 */
export async function getLiveAQI(forceRefresh = false) {
  const url = `${API_BASE_URL}/api/live-aqi${forceRefresh ? '?refresh=true' : ''}`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`Live AQI request failed with status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Dedicated Live Prediction endpoint
 * GET /api/live-prediction
 */
export async function getLivePrediction(forceRefresh = false) {
  const url = `${API_BASE_URL}/api/live-prediction${forceRefresh ? '?refresh=true' : ''}`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`Live prediction request failed with status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Analytics endpoint
 * GET /api/analytics
 */
export async function getAnalytics(startDate = null, endDate = null) {
  let url = `${API_BASE_URL}/api/analytics`;
  const params = [];
  if (startDate) params.push(`start_date=${encodeURIComponent(startDate)}`);
  if (endDate) params.push(`end_date=${encodeURIComponent(endDate)}`);
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`Analytics request failed with status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Predict Next-Hour AQI using real FastAPI backend
 * POST /api/predict
 * Sends exactly 16 validated numeric model features
 */
export async function predictAQI(data) {
  // Feature definitions mapping UI/API names to backend expected keys
  const featureDefinitions = [
    { key: "PM25", alts: ["pm25"] },
    { key: "PM10", alts: ["pm10"] },
    { key: "NO2", alts: ["no2"] },
    { key: "SO2", alts: ["so2"] },
    { key: "CO", alts: ["co"] },
    { key: "O3", alts: ["o3"] },
    { key: "Humidity", alts: ["humidity"] },
    { key: "Wind_Speed", alts: ["windSpeed", "wind_speed"] },
    { key: "Wind_Direction", alts: ["windDirection", "wind_direction"] },
    { key: "AQI", alts: ["currentAqi", "current_aqi"] },
    { key: "AQI_lag_1", alts: ["aqiLag1", "aqi_lag_1"] },
    { key: "AQI_lag_2", alts: ["aqiLag2", "aqi_lag_2"] },
    { key: "AQI_lag_3", alts: ["aqiLag3", "aqi_lag_3"] },
    { key: "Hour", alts: ["hour"], isInt: true },
    { key: "Day_of_Week", alts: ["dayOfWeek", "day_of_week"], isInt: true },
    { key: "Month", alts: ["month"], isInt: true }
  ];

  const payload = {};

  for (const def of featureDefinitions) {
    let rawVal = data[def.key];
    if (rawVal === undefined || rawVal === null || String(rawVal).trim() === "") {
      for (const alt of def.alts) {
        if (data[alt] !== undefined && data[alt] !== null && String(data[alt]).trim() !== "") {
          rawVal = data[alt];
          break;
        }
      }
    }

    if (rawVal === undefined || rawVal === null || String(rawVal).trim() === "") {
      throw new Error(`Missing or empty required feature: ${def.key}`);
    }

    // Convert to plain numeric value
    const num = def.isInt ? parseInt(rawVal, 10) : parseFloat(rawVal);
    if (!Number.isFinite(num) || Number.isNaN(num)) {
      throw new Error(`Invalid numeric value for feature ${def.key}: "${rawVal}"`);
    }

    payload[def.key] = num;
  }

  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Prediction request failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();

  if (!result || !Number.isFinite(result.predicted_aqi)) {
    throw new Error("The model returned an invalid prediction.");
  }

  return result;
}

/**
 * Wrapper for Manual Mode Prediction
 * Strictly invokes the real backend ML model via POST /api/predict
 * Never fakes or calculates fallback values in JavaScript
 */
export async function predictManualMode(features) {
  return await predictAQI(features);
}

/**
 * Wrapper for Live Mode Prediction using dedicated GET /api/live-prediction
 */
export async function predictLiveMode(forceRefresh = false) {
  try {
    const res = await getLivePrediction(forceRefresh);
    if (res.status === "error") {
      throw new Error(res.message || "Live prediction unavailable");
    }

    return {
      connected: true,
      currentAqi: res.current_aqi,
      predictedAqi: res.predicted_aqi,
      predictedCategory: res.predicted_category,
      dominantPollutant: res.dominant_pollutant,
      pollutants: res.pollutants || null,
      status: "Inference completed via FastAPI real model (air_quality_lr_model.pkl)",
      timestamp: res.timestamp ? new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST' : new Date().toLocaleTimeString(),
      rawTimestamp: res.timestamp || null,
      modelUsed: res.model || "Linear Regression + AQI Lags",
      source: "OpenAQ Live",
      dataQuality: res.data_quality
    };
  } catch (err) {
    return {
      connected: false,
      endpoint: `${API_BASE_URL}/api/live-prediction`,
      status: `OpenAQ temporarily unavailable (${err.message})`,
      currentAqi: null,
      predictedAqi: null,
      predictedCategory: "Unavailable",
      timestamp: new Date().toLocaleTimeString(),
      modelUsed: "Linear Regression + AQI Lags (air_quality_lr_model.pkl)",
      source: "Unavailable"
    };
  }
}

/**
 * Fetch Live Station Data from GET /api/live-aqi
 */
export async function fetchLiveStationData(forceRefresh = false) {
  try {
    const data = await getLiveAQI(forceRefresh);
    if (data.status === "error") {
      return {
        isLive: false,
        source: "OpenAQ temporarily unavailable",
        error: data.message,
        data: null
      };
    }
    return {
      isLive: true,
      source: "OpenAQ Live",
      data
    };
  } catch (err) {
    return {
      isLive: false,
      source: "OpenAQ temporarily unavailable",
      error: err.message,
      data: null
    };
  }
}

/**
 * Smart AQI Advisory endpoint
 * POST /api/aqi/advisory
 */
export async function getAqiAdvisory(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/aqi/advisory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Advisory request failed with status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn("Failed to fetch smart advisory:", err);
    return null;
  }
}

/**
 * Live AQI Advisory endpoint
 * GET /api/aqi/advisory
 */
export async function getLiveAqiAdvisory(isForecast = false) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/aqi/advisory?mode=live&is_forecast=${isForecast}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Live advisory request failed: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn("Failed to fetch live advisory:", err);
    return null;
  }
}

