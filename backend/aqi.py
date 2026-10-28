"""
AQI Calculation and Unit Conversion Module
National Air Quality Index (NAQI) - CPCB Methodology
For Station: Manali, Chennai - CPCB
"""

import math
from typing import Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np

# Breakpoints specification:
# Format: [B_low, B_high, I_low, I_high]
AQI_BREAKPOINTS = {
    "PM25": [
        (0.0, 30.0, 0.0, 50.0),
        (30.0, 60.0, 50.0, 100.0),
        (60.0, 90.0, 100.0, 200.0),
        (90.0, 120.0, 200.0, 300.0),
        (120.0, 250.0, 300.0, 400.0),
        (250.0, 500.0, 400.0, 500.0),
    ],
    "PM10": [
        (0.0, 50.0, 0.0, 50.0),
        (50.0, 100.0, 50.0, 100.0),
        (100.0, 250.0, 100.0, 200.0),
        (250.0, 350.0, 200.0, 300.0),
        (350.0, 430.0, 300.0, 400.0),
        (430.0, 600.0, 400.0, 500.0),
    ],
    "NO2": [
        (0.0, 40.0, 0.0, 50.0),
        (40.0, 80.0, 50.0, 100.0),
        (80.0, 180.0, 100.0, 200.0),
        (180.0, 280.0, 200.0, 300.0),
        (280.0, 400.0, 300.0, 400.0),
        (400.0, 800.0, 400.0, 500.0),
    ],
    "SO2": [
        (0.0, 40.0, 0.0, 50.0),
        (40.0, 80.0, 50.0, 100.0),
        (80.0, 380.0, 100.0, 200.0),
        (380.0, 800.0, 200.0, 300.0),
        (800.0, 1600.0, 300.0, 400.0),
        (1600.0, 2000.0, 400.0, 500.0),
    ],
    "CO": [
        (0.0, 1.0, 0.0, 50.0),
        (1.0, 2.0, 50.0, 100.0),
        (2.0, 10.0, 100.0, 200.0),
        (10.0, 17.0, 200.0, 300.0),
        (17.0, 34.0, 300.0, 400.0),
        (34.0, 50.0, 400.0, 500.0),
    ],
    "O3": [
        (0.0, 50.0, 0.0, 50.0),
        (50.0, 100.0, 50.0, 100.0),
        (100.0, 168.0, 100.0, 200.0),
        (168.0, 208.0, 200.0, 300.0),
        (208.0, 748.0, 300.0, 400.0),
        (748.0, 1000.0, 400.0, 500.0),
    ],
}

# Unit Conversion Constants
MOLAR_VOLUME = 24.45
MW_NO2 = 46.0055
MW_SO2 = 64.066
MW_CO = 28.01


def convert_no2_ppb_to_ugm3(val_ppb: Optional[float]) -> Optional[float]:
    """Convert NO2 from ppb to µg/m³"""
    if val_ppb is None or np.isnan(val_ppb) or val_ppb < 0:
        return None
    return float(val_ppb * MW_NO2 / MOLAR_VOLUME)


def convert_so2_ppb_to_ugm3(val_ppb: Optional[float]) -> Optional[float]:
    """Convert SO2 from ppb to µg/m³"""
    if val_ppb is None or np.isnan(val_ppb) or val_ppb < 0:
        return None
    return float(val_ppb * MW_SO2 / MOLAR_VOLUME)


# CO concentration is derived from the active OpenAQ CO sensor and its reported unit.
# Sensor/unit metadata should be verified before final academic reporting.
def convert_co_ppb_to_mgm3(val_ppb: Optional[float]) -> Optional[float]:
    """Convert CO from ppb to mg/m³"""
    if val_ppb is None or np.isnan(val_ppb) or val_ppb < 0:
        return None
    return float(val_ppb * MW_CO / MOLAR_VOLUME / 1000.0)


def calculate_sub_index(pollutant: str, conc: Optional[float]) -> Optional[float]:
    """
    Continuous linear interpolation sub-index calculation for a given pollutant concentration.
    Formula:
        I = I_low + ((I_high - I_low) / (B_high - B_low)) * (conc - B_low)
    """
    if conc is None or np.isnan(conc) or conc < 0:
        return None

    brackets = AQI_BREAKPOINTS.get(pollutant)
    if not brackets:
        return None

    # Check brackets
    for b_low, b_high, i_low, i_high in brackets:
        if b_low <= conc <= b_high:
            sub_index = i_low + ((i_high - i_low) / (b_high - b_low)) * (conc - b_low)
            return float(round(sub_index, 2))

    # If concentration exceeds highest breakpoint, extrapolate linearly based on highest bracket
    last_b_low, last_b_high, last_i_low, last_i_high = brackets[-1]
    if conc > last_b_high:
        extrapolated = last_i_low + ((last_i_high - last_i_low) / (last_b_high - last_b_low)) * (conc - last_b_low)
        return float(round(min(extrapolated, 500.0), 2))

    return None


def get_aqi_category(aqi: Optional[float]) -> str:
    """
    CPCB National Air Quality Index (NAQI) Category Classification:
      0–50       Good
      51–100     Satisfactory
      101–200    Moderately Polluted
      201–300    Poor
      301–400    Very Poor
      401–500    Severe
      > 500      Severe
    """
    if aqi is None or np.isnan(aqi):
        return "Unknown"
    try:
        val = float(aqi)
    except (ValueError, TypeError):
        return "Unknown"

    if val <= 50:
        return "Good"
    elif val <= 100:
        return "Satisfactory"
    elif val <= 200:
        return "Moderately Polluted"
    elif val <= 300:
        return "Poor"
    elif val <= 400:
        return "Very Poor"
    else:
        return "Severe"


def calculate_overall_aqi(sub_indices: Dict[str, Optional[float]]) -> Tuple[Optional[float], Optional[str]]:
    """
    CPCB NAQI Rules:
    - At least 3 pollutant sub-indices must be available.
    - PM2.5 or PM10 must be available.
    - Overall AQI is the maximum available pollutant sub-index.
    Returns: (overall_aqi, dominant_pollutant)
    """
    valid_sub_indices = {
        k: v for k, v in sub_indices.items()
        if v is not None and not np.isnan(v)
    }

    if len(valid_sub_indices) < 3:
        return None, None

    pm_available = ("PM25" in valid_sub_indices) or ("PM10" in valid_sub_indices)
    if not pm_available:
        return None, None

    dominant_pollutant = max(valid_sub_indices, key=valid_sub_indices.get)
    overall_aqi = float(round(valid_sub_indices[dominant_pollutant], 2))

    return overall_aqi, dominant_pollutant


def compute_rolling_averages(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute rolling averages according to CPCB standard:
    - PM25, PM10, NO2, SO2: 24-hour rolling average
    - CO, O3: 8-hour rolling average
    Preserves hourly resolution.
    """
    df_rolling = df.copy()

    # 24-hour rolling averages (require at least 12 periods to handle start of window gracefully)
    for col in ["PM25", "PM10", "NO2", "SO2"]:
        if col in df_rolling.columns:
            df_rolling[f"{col}_rolling"] = df_rolling[col].rolling(window=24, min_periods=12).mean()

    # 8-hour rolling averages (require at least 4 periods)
    for col in ["CO", "O3"]:
        if col in df_rolling.columns:
            df_rolling[f"{col}_rolling"] = df_rolling[col].rolling(window=8, min_periods=4).mean()

    return df_rolling
