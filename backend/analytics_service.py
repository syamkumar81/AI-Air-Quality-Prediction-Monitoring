"""
Analytics Service Module for AI Air Quality
Processes historical dataset: backend/data/air_quality_jan_jun_2026_final.csv
Station: Manali, Chennai - CPCB (Location ID: 2586)
Period: January 2026 – June 2026
"""

import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
import pandas as pd
import numpy as np

logger = logging.getLogger("ai_air_quality.analytics")

# Dataset Path relative to this file
DATASET_PATH = Path(__file__).resolve().parent / "data" / "air_quality_jan_jun_2026_final.csv"

# In-memory cached dataset and file modification tracker
_CACHE = {
    "df": None,
    "mtime": 0
}

# Standard Model Comparison Benchmark from project research
MODEL_PERFORMANCE_DATA = [
    {
        "model": "Persistence Baseline",
        "mae": 0.785,
        "rmse": 1.424,
        "r2": 0.991,
        "isFinal": False,
        "role": "Baseline",
        "notes": "Assumes AQI(t+1) = AQI(t). Strong baseline due to temporal AQI autocorrelation."
    },
    {
        "model": "Linear Regression",
        "mae": 0.879,
        "rmse": 1.341,
        "r2": 0.992,
        "isFinal": False,
        "role": "Baseline",
        "notes": "Multivariable regression using contemporaneous pollutant and meteorological factors without lags."
    },
    {
        "model": "Random Forest",
        "mae": 2.234,
        "rmse": 3.543,
        "r2": 0.944,
        "isFinal": False,
        "role": "Tree Ensemble",
        "notes": "Ensemble of orthogonal decision trees. Discontinuous split boundaries on atmospheric gradients."
    },
    {
        "model": "XGBoost",
        "mae": 1.819,
        "rmse": 2.693,
        "r2": 0.968,
        "isFinal": False,
        "role": "Gradient Boosted",
        "notes": "Gradient boosted trees. Better regularization than RF but lacks continuous autoregressive lag extrapolation."
    },
    {
        "model": "Linear Regression + AQI Lags",
        "mae": 0.691,
        "rmse": 1.156,
        "r2": 0.994,
        "isFinal": True,
        "role": "Selected Model",
        "notes": "Combines multivariable linear formulation with autoregressive lag terms [t-1, t-2, t-3]. Highest accuracy (R² 0.994, MAE 0.691)."
    }
]

MONTH_NAMES = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June"
}

CATEGORY_COLORS = {
    "Good": "#10B981",
    "Satisfactory": "#F59E0B",
    "Moderately Polluted": "#F97316",
    "Poor": "#EF4444",
    "Very Poor": "#8B5CF6",
    "Severe": "#78350F"
}


def load_dataset() -> pd.DataFrame:
    """
    Load dataset from backend/data/air_quality_jan_jun_2026_final.csv with caching.
    Automatically reloads if file modification time changes.
    """
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at expected path: {DATASET_PATH}")

    mtime = os.path.getmtime(DATASET_PATH)
    if _CACHE["df"] is not None and _CACHE["mtime"] == mtime:
        return _CACHE["df"]

    logger.info(f"Loading analytics dataset from: {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)
    df["dt"] = pd.to_datetime(df["datetime"])
    
    _CACHE["df"] = df
    _CACHE["mtime"] = mtime
    return df


def get_analytics_data(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Compute full analytics response from the historical CSV dataset.
    Supports optional date filtering.
    """
    df = load_dataset().copy()

    # Apply date range filter if provided (matching Asia/Kolkata timezone)
    if start_date:
        try:
            start_dt = pd.to_datetime(start_date)
            if start_dt.tzinfo is None:
                start_dt = start_dt.tz_localize("Asia/Kolkata")
            else:
                start_dt = start_dt.tz_convert("Asia/Kolkata")
            df = df[df["dt"] >= start_dt]
        except Exception as e:
            logger.warning(f"Invalid start_date '{start_date}': {e}")

    if end_date:
        try:
            end_dt = pd.to_datetime(end_date)
            if len(end_date.strip()) == 10:
                end_dt = end_dt + pd.Timedelta(days=1) - pd.Timedelta(seconds=1)
            if end_dt.tzinfo is None:
                end_dt = end_dt.tz_localize("Asia/Kolkata")
            else:
                end_dt = end_dt.tz_convert("Asia/Kolkata")
            df = df[df["dt"] <= end_dt]
        except Exception as e:
            logger.warning(f"Invalid end_date '{end_date}': {e}")

    total_rows = len(df)
    valid_aqi_df = df.dropna(subset=["AQI"])
    valid_aqi_rows = len(valid_aqi_df)

    if valid_aqi_rows == 0:
        return {
            "status": "empty",
            "message": "No valid AQI observations found for the specified period.",
            "dataset": {
                "file": DATASET_PATH.name,
                "station": "Manali, Chennai - CPCB",
                "location_id": 2586,
                "period": "January 2026 – June 2026",
                "rows": total_rows,
                "valid_aqi_rows": 0
            }
        }

    # 1. AQI Overview
    avg_aqi = round(float(valid_aqi_df["AQI"].mean()), 2)
    max_aqi = round(float(valid_aqi_df["AQI"].max()), 2)
    min_aqi = round(float(valid_aqi_df["AQI"].min()), 2)

    overview = {
        "average_aqi": avg_aqi,
        "maximum_aqi": max_aqi,
        "minimum_aqi": min_aqi,
        "valid_observations": valid_aqi_rows,
        "total_rows": total_rows
    }

    # 2. AQI Category Distribution
    category_order = [
        ("Good (0-50)", "Good", 0, 50),
        ("Satisfactory (51-100)", "Satisfactory", 51, 100),
        ("Moderately Polluted (101-200)", "Moderately Polluted", 101, 200),
        ("Poor (201-300)", "Poor", 201, 300),
        ("Very Poor (301-400)", "Very Poor", 301, 400),
        ("Severe (401-500)", "Severe", 401, 500)
    ]

    category_counts = valid_aqi_df["AQI_Category"].value_counts().to_dict() if "AQI_Category" in valid_aqi_df else {}
    category_distribution = []

    for name, cat, low, high in category_order:
        cnt = int(category_counts.get(cat, 0))
        pct = round(float(cnt / valid_aqi_rows * 100.0), 2) if valid_aqi_rows > 0 else 0.0
        category_distribution.append({
            "name": name,
            "category": cat,
            "count": cnt,
            "percentage": pct,
            "value": pct,  # For Recharts Pie value
            "color": CATEGORY_COLORS[cat]
        })

    # 3. Monthly AQI Comparison
    monthly_comparison = []
    months_present = sorted(valid_aqi_df["Month"].unique())

    for m in months_present:
        m_df = valid_aqi_df[valid_aqi_df["Month"] == m]
        m_name = MONTH_NAMES.get(m, f"Month {m}")
        
        # Categorical counts in this month
        m_cats = m_df["AQI_Category"].value_counts().to_dict() if "AQI_Category" in m_df else {}

        monthly_comparison.append({
            "month": f"{m_name[:3]} 2026",
            "month_name": m_name,
            "month_num": int(m),
            "avgAqi": round(float(m_df["AQI"].mean()), 2),
            "maxAqi": round(float(m_df["AQI"].max()), 2),
            "minAqi": round(float(m_df["AQI"].min()), 2),
            "observations": int(len(m_df)),
            "goodDays": int(m_cats.get("Good", 0)),
            "satisfactoryDays": int(m_cats.get("Satisfactory", 0)),
            "moderateDays": int(m_cats.get("Moderately Polluted", 0)),
            "poorDays": int(m_cats.get("Poor", 0)),
            "veryPoorDays": int(m_cats.get("Very Poor", 0)),
            "severeDays": int(m_cats.get("Severe", 0))
        })

    # 4. AQI Trend (Daily downsampled to preserve speed and smoothness)
    daily_aqi = valid_aqi_df.groupby(valid_aqi_df["dt"].dt.date).agg(
        avg_aqi=("AQI", "mean"),
        min_aqi=("AQI", "min"),
        max_aqi=("AQI", "max"),
        count=("AQI", "count")
    ).reset_index()

    aqi_trend = []
    for _, r in daily_aqi.iterrows():
        aqi_trend.append({
            "date": str(r["dt"]),
            "datetime": str(r["dt"]),
            "time": str(r["dt"])[5:],  # MM-DD
            "actual": round(float(r["avg_aqi"]), 2),
            "aqi": round(float(r["avg_aqi"]), 2),
            "min_aqi": round(float(r["min_aqi"]), 2),
            "max_aqi": round(float(r["max_aqi"]), 2),
            "observations": int(r["count"])
        })

    # 5. Pollutant Trends (Chronological daily average for PM25, PM10, NO2, SO2, CO, O3)
    pollutant_cols = ["PM25", "PM10", "NO2", "SO2", "CO", "O3"]
    daily_pol = df.groupby(df["dt"].dt.date)[pollutant_cols].mean().reset_index()

    pollutant_trends: Dict[str, List[Dict[str, Any]]] = {p: [] for p in pollutant_cols}
    pollutant_combined_trend = []

    for _, r in daily_pol.iterrows():
        d_str = str(r["dt"])
        t_label = d_str[5:]
        row_obj = {"date": d_str, "time": t_label}
        
        for p in pollutant_cols:
            val = round(float(r[p]), 2) if not np.isnan(r[p]) else None
            row_obj[p.lower()] = val
            row_obj[p] = val
            pollutant_trends[p].append({
                "date": d_str,
                "time": t_label,
                "value": val
            })
        pollutant_combined_trend.append(row_obj)

    # 6. Actual vs Predicted AQI (Chronological comparisons from dataset AQI and AQI_next_hour)
    valid_both = df.dropna(subset=["AQI", "AQI_next_hour"]).copy()
    actual_vs_predicted = []

    # Provide daily average convergence curve
    daily_pred = valid_both.groupby(valid_both["dt"].dt.date).agg(
        actual=("AQI", "mean"),
        predicted=("AQI_next_hour", "mean")
    ).reset_index()

    for idx, r in daily_pred.iterrows():
        act = round(float(r["actual"]), 2)
        prd = round(float(r["predicted"]), 2)
        err = round(abs(act - prd), 2)
        actual_vs_predicted.append({
            "step": idx + 1,
            "date": str(r["dt"]),
            "time": str(r["dt"])[5:],
            "actual": act,
            "predicted": prd,
            "error": err
        })

    # Sequential test sample sequence (last 20 sequential test hours for fine-grained inspection)
    sample_slice = valid_both.tail(20)
    sample_sequence = []
    step_num = 1
    for _, r in sample_slice.iterrows():
        act = round(float(r["AQI"]), 2)
        prd = round(float(r["AQI_next_hour"]), 2)
        sample_sequence.append({
            "step": step_num,
            "datetime": str(r["datetime"]),
            "time": str(r["dt"].strftime("%m-%d %H:%M")),
            "actual": act,
            "predicted": prd,
            "error": round(abs(act - prd), 2)
        })
        step_num += 1

    return {
        "status": "ok",
        "dataset": {
            "file": DATASET_PATH.name,
            "station": "Manali, Chennai - CPCB",
            "location_id": 2586,
            "period": "January 2026 – June 2026",
            "date_range": {
                "start": str(df["datetime"].min()),
                "end": str(df["datetime"].max())
            },
            "rows": total_rows,
            "valid_aqi_rows": valid_aqi_rows,
            "is_downsampled": True,
            "downsample_method": "daily_average",
            "prediction_target": "Next-hour AQI (AQI_next_hour)",
            "data_source": "OpenAQ / CPCB"
        },
        "overview": overview,
        "aqi_trend": aqi_trend,
        "pollutant_trends": pollutant_trends,
        "pollutant_combined_trend": pollutant_combined_trend,
        "category_distribution": category_distribution,
        "monthly_comparison": monthly_comparison,
        "actual_vs_predicted": actual_vs_predicted,
        "actual_vs_predicted_samples": sample_sequence,
        "model_performance": MODEL_PERFORMANCE_DATA
    }
