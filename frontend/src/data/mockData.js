// Mock and baseline reference datasets for AI Air Quality platform
// Monitoring Station: Manali, Chennai - CPCB (Dataset: January 2026 - June 2026)

export const STATION_INFO = {
  id: "CPCB-TN-MANALI-01",
  name: "Manali, Chennai - CPCB",
  agency: "Central Pollution Control Board (CPCB) / TNPCB",
  state: "Tamil Nadu",
  city: "Chennai",
  zone: "Industrial & Petrochemical Corridor",
  coordinates: {
    lat: 13.1673,
    lng: 80.2608
  },
  elevation: "7 meters",
  samplingInterval: "1 Hour (Continuous Continuous Ambient Air Quality Monitoring - CAAQMS)",
  status: "Active / Online"
};

export const CURRENT_MONITORING_DATA = {
  station: "Manali, Chennai - CPCB",
  lastUpdated: "Latest Available OpenAQ Observation",
  currentAqi: 94,
  currentCategory: "Satisfactory",
  nextHourPredictedAqi: 94,
  predictedCategory: "Satisfactory",
  mainPollutant: "PM10",
  pollutants: {
    pm25: { value: 46.9, unit: "µg/m³", standard: 60, status: "Normal", subIndex: 78 },
    pm10: { value: 104.0, unit: "µg/m³", standard: 100, status: "Moderate", subIndex: 94 },
    no2: { value: 15.5, unit: "µg/m³", standard: 80, status: "Good", subIndex: 19 },
    so2: { value: 9.1, unit: "µg/m³", standard: 80, status: "Good", subIndex: 11 },
    co: { value: 0.0, unit: "mg/m³", standard: 2.0, status: "Optimal", subIndex: 0 },
    o3: { value: 10.8, unit: "µg/m³", standard: 100, status: "Good", subIndex: 11 }
  },
  weather: {
    temperature: 28.5,
    tempUnit: "°C",
    humidity: 75,
    humidityUnit: "%",
    windSpeed: 2.8,
    windSpeedUnit: "m/s",
    windDirection: "SSE",
    windDegree: 160,
    pressure: 1011.2,
    pressureUnit: "hPa",
    visibility: 6.5,
    visibilityUnit: "km"
  },
  laggedAqi: {
    t_minus_1: 94,
    t_minus_2: 94,
    t_minus_3: 94
  }
};

// 24-hour hourly trend (past 24h)
export const HOURLY_24H_DATA = [
  { time: "20:00", actual: 64, predicted: 65, pm25: 28, pm10: 58, no2: 21, humidity: 72, wind: 12 },
  { time: "22:00", actual: 69, predicted: 68, pm25: 31, pm10: 64, no2: 23, humidity: 74, wind: 10 },
  { time: "00:00", actual: 72, predicted: 71, pm25: 33, pm10: 66, no2: 25, humidity: 76, wind: 9 },
  { time: "02:00", actual: 78, predicted: 76, pm25: 36, pm10: 71, no2: 28, humidity: 80, wind: 8 },
  { time: "04:00", actual: 82, predicted: 80, pm25: 38, pm10: 74, no2: 30, humidity: 82, wind: 7 },
  { time: "06:00", actual: 89, predicted: 87, pm25: 42, pm10: 82, no2: 35, humidity: 79, wind: 9 },
  { time: "08:00", actual: 105, predicted: 102, pm25: 52, pm10: 98, no2: 44, humidity: 73, wind: 11 },
  { time: "10:00", actual: 98, predicted: 99, pm25: 48, pm10: 92, no2: 39, humidity: 66, wind: 13 },
  { time: "12:00", actual: 86, predicted: 87, pm25: 41, pm10: 80, no2: 32, humidity: 60, wind: 16 },
  { time: "14:00", actual: 79, predicted: 81, pm25: 37, pm10: 73, no2: 27, humidity: 58, wind: 18 },
  { time: "16:00", actual: 73, predicted: 75, pm25: 33, pm10: 67, no2: 24, humidity: 62, wind: 17 },
  { time: "18:00", actual: 72, predicted: 73, pm25: 33, pm10: 66, no2: 24, humidity: 65, wind: 15 },
  { time: "19:00", actual: 74, predicted: 74, pm25: 34, pm10: 68, no2: 25, humidity: 68, wind: 14 },
  { time: "20:00 (Next)", actual: null, predicted: 78, pm25: 36, pm10: 72, no2: 26, humidity: 70, wind: 13 }
];

// Model Comparison Metrics as explicitly verified in project criteria
export const MODEL_PERFORMANCE_DATA = [
  {
    model: "Persistence Baseline",
    mae: 0.785,
    rmse: 1.424,
    r2: 0.991,
    isFinal: false,
    notes: "Assumes AQI(t+1) = AQI(t). Strong baseline due to temporal AQI autocorrelation."
  },
  {
    model: "Linear Regression",
    mae: 0.879,
    rmse: 1.341,
    r2: 0.992,
    isFinal: false,
    notes: "Basic meteorological + contemporaneous pollutant features without temporal lag autoregression."
  },
  {
    model: "Random Forest",
    mae: 2.234,
    rmse: 3.543,
    r2: 0.944,
    isFinal: false,
    notes: "Ensemble of decision trees. Suffers from discontinuous step splits and slight overfitting on high gradients."
  },
  {
    model: "XGBoost",
    mae: 1.819,
    rmse: 2.693,
    r2: 0.968,
    isFinal: false,
    notes: "Gradient boosted trees. Better regularization than RF, but lacks continuous autoregressive lag extrapolation."
  },
  {
    model: "Linear Regression + AQI Lags",
    mae: 0.691,
    rmse: 1.156,
    r2: 0.994,
    isFinal: true,
    badge: "Selected Best Model",
    notes: "Combines multivariable linear formulation with autoregressive lag terms [t-1, t-2, t-3]. Outperforms all tree models with lowest MAE (0.691) and highest R² (0.994)."
  }
];

// Actual vs Predicted AQI test sample sequence (demonstrates R2 = 0.994 alignment)
export const ACTUAL_VS_PREDICTED_SAMPLES = [
  { step: 1, actual: 64, predicted: 63.8, error: 0.2 },
  { step: 2, actual: 68, predicted: 67.4, error: 0.6 },
  { step: 3, actual: 72, predicted: 71.8, error: 0.2 },
  { step: 4, actual: 80, predicted: 79.1, error: 0.9 },
  { step: 5, actual: 88, predicted: 87.2, error: 0.8 },
  { step: 6, actual: 95, predicted: 94.6, error: 0.4 },
  { step: 7, actual: 110, predicted: 108.9, error: 1.1 },
  { step: 8, actual: 104, predicted: 104.3, error: 0.3 },
  { step: 9, actual: 98, predicted: 97.5, error: 0.5 },
  { step: 10, actual: 91, predicted: 90.7, error: 0.3 },
  { step: 11, actual: 84, predicted: 84.1, error: 0.1 },
  { step: 12, actual: 79, predicted: 78.4, error: 0.6 },
  { step: 13, actual: 75, predicted: 74.8, error: 0.2 },
  { step: 14, actual: 72, predicted: 72.3, error: 0.3 },
  { step: 15, actual: 74, predicted: 73.9, error: 0.1 }
];

// Monthly comparison across dataset period (January 2026 - June 2026)
export const MONTHLY_DATA = [
  { month: "Jan 2026", avgAqi: 112, maxAqi: 184, minAqi: 58, goodDays: 4, satisfactoryDays: 14, moderateDays: 13 },
  { month: "Feb 2026", avgAqi: 98, maxAqi: 155, minAqi: 52, goodDays: 7, satisfactoryDays: 16, moderateDays: 5 },
  { month: "Mar 2026", avgAqi: 86, maxAqi: 138, minAqi: 48, goodDays: 10, satisfactoryDays: 18, moderateDays: 3 },
  { month: "Apr 2026", avgAqi: 79, maxAqi: 122, minAqi: 44, goodDays: 12, satisfactoryDays: 16, moderateDays: 2 },
  { month: "May 2026", avgAqi: 73, maxAqi: 110, minAqi: 41, goodDays: 15, satisfactoryDays: 15, moderateDays: 1 },
  { month: "Jun 2026", avgAqi: 68, maxAqi: 96, minAqi: 36, goodDays: 19, satisfactoryDays: 11, moderateDays: 0 }
];

// Category distribution over the 6-month research period
export const CATEGORY_DISTRIBUTION = [
  { name: "Good (0-50)", value: 24, color: "#10B981" },
  { name: "Satisfactory (51-100)", value: 58, color: "#F59E0B" },
  { name: "Moderately Polluted (101-200)", value: 16, color: "#F97316" },
  { name: "Poor (201-300)", value: 2, color: "#EF4444" },
  { name: "Very Poor (301-400)", value: 0, color: "#8B5CF6" },
  { name: "Severe (401-500)", value: 0, color: "#78350F" }
];

// Surrounding Chennai air quality monitoring stations for context
export const CHENNAI_STATIONS = [
  {
    id: "manali",
    name: "Manali, Chennai - CPCB (Target Station)",
    lat: 13.1673,
    lng: 80.2608,
    aqi: 94,
    category: "Satisfactory",
    type: "Continuous CAAQMS (Industrial)",
    primary: true
  },
  {
    id: "alandur",
    name: "Alandur, Chennai - CPCB",
    lat: 13.0034,
    lng: 80.2015,
    category: "Regional Reference",
    type: "Continuous CAAQMS (Urban/Traffic)",
    primary: false,
    isReference: true
  },
  {
    id: "velachery",
    name: "Velachery Res. Area - CPCB",
    lat: 12.9759,
    lng: 80.2212,
    category: "Regional Reference",
    type: "Continuous CAAQMS (Residential)",
    primary: false,
    isReference: true
  },
  {
    id: "royapuram",
    name: "Royapuram, Chennai - TNPCB",
    lat: 13.1118,
    lng: 80.2941,
    category: "Regional Reference",
    type: "Manual / Automated (Coastal/Commercial)",
    primary: false,
    isReference: true
  }
];

export const TEAM_MEMBERS = [
  {
    name: "K. Syam Kumar",
    role: "Lead ML Researcher & Full Stack Engineer",
    department: "Department of Computer Science & Engineering",
    contribution: "Feature engineering, AQI lag autocorrelation pipeline, and React dashboard architecture."
  },
  {
    name: "K. Venkata Charan Teja",
    role: "Data Engineering & Model Training",
    department: "Department of Computer Science & Engineering",
    contribution: "CPCB data cleaning, baseline regression comparative study, and model metrics validation."
  },
  {
    name: "S. Vishnu Vardhan",
    role: "FastAPI Backend & Atmospheric Physics Integration",
    department: "Department of Computer Science & Engineering",
    contribution: "RESTful API schema design, meteorological parameter fusion, and testing."
  }
];

export const MENTOR_INFO = {
  name: "Selvarengan",
  designation: "Project Mentor & Guide",
  department: "Department of Computer Science & Engineering",
  institution: "B.Tech Final Year Academic Project"
};
