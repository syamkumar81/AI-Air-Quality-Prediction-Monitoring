"""
Smart AQI Advisory & Recommendation Service
Centralized recommendation engine for both Manual Prediction Mode and Live Monitoring Mode.
Based on official Indian CPCB NAQI classification and national ambient air quality standards.
"""

from typing import Dict, Any, List, Optional
import math
import numpy as np


# ---------------------------------------------------------------------------
# CPCB AQI CATEGORIES & RANGES
# ---------------------------------------------------------------------------
# Ranges:
# 0–50: Good
# 51–100: Satisfactory
# 101–200: Moderately Polluted
# 201–300: Poor
# 301–400: Very Poor
# 401–500+: Severe

CPCB_CATEGORIES_META = {
    "Good": {
        "range": "0–50",
        "min": 0,
        "max": 50,
        "color": "#10B981",  # Green
        "light_bg": "bg-emerald-50",
        "border": "border-emerald-200",
        "text": "text-emerald-700",
        "risk_level": "Minimal Health Risk",
        "summary": "Air quality is clean and poses little or no risk to human health."
    },
    "Satisfactory": {
        "range": "51–100",
        "min": 51,
        "max": 100,
        "color": "#22C55E",  # Light Green
        "light_bg": "bg-green-50",
        "border": "border-green-200",
        "text": "text-green-700",
        "risk_level": "Minor Risk to Sensitive Groups",
        "summary": "Acceptable air quality; minor breathing discomfort possible for unusually sensitive individuals."
    },
    "Moderately Polluted": {
        "range": "101–200",
        "min": 101,
        "max": 200,
        "color": "#EAB308",  # Yellow
        "light_bg": "bg-yellow-50",
        "border": "border-yellow-200",
        "text": "text-yellow-800",
        "risk_level": "Moderate Respiratory Concern",
        "summary": "May cause breathing discomfort to individuals with lung diseases, asthma, and heart conditions."
    },
    "Poor": {
        "range": "201–300",
        "min": 201,
        "max": 300,
        "color": "#F97316",  # Orange
        "light_bg": "bg-orange-50",
        "border": "border-orange-200",
        "text": "text-orange-800",
        "risk_level": "Unhealthy for General Population",
        "summary": "Breathing discomfort to most people on prolonged outdoor exposure."
    },
    "Very Poor": {
        "range": "301–400",
        "min": 301,
        "max": 400,
        "color": "#EF4444",  # Red
        "light_bg": "bg-red-50",
        "border": "border-red-200",
        "text": "text-red-700",
        "risk_level": "Significant Health Alert",
        "summary": "Respiratory illness on prolonged exposure; severe effects on vulnerable cohorts."
    },
    "Severe": {
        "range": "401–500+",
        "min": 401,
        "max": 500,
        "color": "#991B1B",  # Dark Red
        "light_bg": "bg-rose-100",
        "border": "border-rose-400",
        "text": "text-rose-900",
        "risk_level": "Emergency Health Hazard",
        "summary": "Serious health impacts on healthy individuals; life-threatening hazard for vulnerable groups."
    }
}


# ---------------------------------------------------------------------------
# CPCB NAAQS STANDARD THRESHOLDS FOR 6 CRITERIA POLLUTANTS
# ---------------------------------------------------------------------------
POLLUTANT_THRESHOLDS = {
    "PM25": {
        "name": "PM2.5",
        "full_name": "Fine Particulate Matter (≤ 2.5 µm)",
        "unit": "µg/m³",
        "standard": 60.0,    # CPCB 24-hr NAAQS standard
        "optimal": 30.0,
        "period": "24-hour average",
        "source": "Vehicular combustion, industrial emissions, secondary aerosols",
        "mechanism": "Penetrates deep into alveolar gas-exchange regions and can enter the systemic circulatory system."
    },
    "PM10": {
        "name": "PM10",
        "full_name": "Respirable Particulate Matter (≤ 10 µm)",
        "unit": "µg/m³",
        "standard": 100.0,   # CPCB 24-hr NAAQS standard
        "optimal": 50.0,
        "period": "24-hour average",
        "source": "Road dust, construction activity, mechanical abrasion, biomass burning",
        "mechanism": "Deposits throughout the upper tracheobronchial tract, irritating mucosal linings and aggravating asthma."
    },
    "NO2": {
        "name": "NO2",
        "full_name": "Nitrogen Dioxide",
        "unit": "µg/m³",
        "standard": 80.0,    # CPCB 24-hr NAAQS standard
        "optimal": 40.0,
        "period": "24-hour average",
        "source": "High-temperature internal combustion engines, industrial boilers",
        "mechanism": "Induces airway hyperresponsiveness, lowers resistance to respiratory infections, and forms photochemical smog."
    },
    "SO2": {
        "name": "SO2",
        "full_name": "Sulfur Dioxide",
        "unit": "µg/m³",
        "standard": 80.0,    # CPCB 24-hr NAAQS standard
        "optimal": 40.0,
        "period": "24-hour average",
        "source": "Thermal power plants, oil refineries, sulfur-bearing fuel combustion",
        "mechanism": "Triggers rapid reflex bronchoconstriction, throat stinging, and severe coughing in asthmatic individuals."
    },
    "CO": {
        "name": "CO",
        "full_name": "Carbon Monoxide",
        "unit": "mg/m³",
        "standard": 2.0,     # CPCB 8-hr standard is 2.0 mg/m³ (1-hr standard is 4.0 mg/m³)
        "optimal": 1.0,
        "period": "8-hour average",
        "source": "Incomplete hydrocarbon combustion from congested vehicular traffic",
        "mechanism": "Competitively binds with blood hemoglobin (carboxyhemoglobin), reducing vital oxygen transport to organs."
    },
    "O3": {
        "name": "O3",
        "full_name": "Ground-Level Ozone",
        "unit": "µg/m³",
        "standard": 100.0,   # CPCB 8-hr standard is 100 µg/m³ (1-hr standard is 180 µg/m³)
        "optimal": 50.0,
        "period": "8-hour average",
        "source": "Photochemical reaction between NOx and VOCs under solar irradiance",
        "mechanism": "Powerful oxidant that inflames lung tissue, accelerates premature cellular aging, and reduces vital lung capacity."
    }
}


def get_aqi_category(aqi: Optional[float]) -> str:
    """
    Classify AQI value strictly per Indian CPCB NAQI standards.
    Handles boundaries and edge cases correctly.
    """
    if aqi is None:
        return "Unknown"
    try:
        val = float(aqi)
        if math.isnan(val) or val < 0:
            return "Good"
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


def get_category_recommendations(category: str) -> Dict[str, Any]:
    """
    Generate category-based health, outdoor, travel, indoor, and action recommendations
    based on the official CPCB classification.
    """
    cat = category.strip()

    if cat == "Good":
        return {
            "health_risk": "Minimal pollution-related health risk.",
            "health": [
                "Air quality is optimal; general population and sensitive groups face virtually zero pollution hazard.",
                "Safe for deep breathing, unhindered athletic conditioning, and prolonged outdoor exertion.",
                "No medical respiratory precautions necessary."
            ],
            "outdoor_activity": [
                "Walking, jogging, running, and cycling are fully suitable and encouraged.",
                "Ideal conditions for outdoor school activities, sports competitions, and aerobic exercise.",
                "Unrestricted outdoor recreation for children, elderly, and athletes."
            ],
            "travel": [
                "Normal outdoor commuting across all transport modes.",
                "Active travel (walking, bicycling) is highly recommended.",
                "No masks or face coverings required for ambient air protection."
            ],
            "indoor_protection": [
                "Normal natural ventilation; open windows and doors to refresh interior air.",
                "Air purifiers are not needed under these ambient conditions.",
                "Standard household air exchange is sufficient."
            ],
            "general": "Enjoy outdoor activities. Air quality is at the cleanest baseline.",
            "checklist": [
                "Open windows to circulate clean outdoor air",
                "Enjoy outdoor jogging, cycling, or recreational sports",
                "Safe for all population cohorts without precautions"
            ]
        }

    elif cat == "Satisfactory":
        return {
            "health_risk": "Most people can continue normal activities; minor discomfort possible in unusually sensitive individuals.",
            "health": [
                "General public can safely engage in regular daily routines without health restrictions.",
                "Individuals with extreme respiratory hypersensitivity should monitor for minor throat irritation.",
                "Cardiac and asthmatic patients can follow their standard medical management plan."
            ],
            "outdoor_activity": [
                "Normal outdoor activities, walking, and jogging are generally suitable.",
                "Outdoor sporting events and training sessions can proceed as scheduled.",
                "Sensitive individuals experiencing slight discomfort should take brief pauses."
            ],
            "travel": [
                "Normal daily commuting with standard transport options.",
                "Pedestrians and cyclists can commute as usual.",
                "No special transit precautions required for healthy commuters."
            ],
            "indoor_protection": [
                "Maintain normal natural ventilation during morning and daytime hours.",
                "Standard indoor environment; air purifiers optional for sensitive individuals.",
                "Ensure standard indoor humidity and air movement."
            ],
            "general": "Sensitive individuals should monitor symptoms and check regional AQI trends.",
            "checklist": [
                "Continue standard daily and outdoor routines",
                "Hypersensitive individuals monitor for mild respiratory irritation",
                "Check hourly air quality trend updates"
            ]
        }

    elif cat == "Moderately Polluted":
        return {
            "health_risk": "Sensitive individuals should reduce prolonged outdoor exertion; breathing discomfort possible for lung and heart patients.",
            "health": [
                "People with asthma, COPD, and cardiovascular conditions should limit prolonged outdoor physical strain.",
                "General population is less likely to experience immediate acute symptoms, but mild eye or throat irritation may occur.",
                "Asthmatic individuals should carry emergency relief inhalers during outdoor activities."
            ],
            "outdoor_activity": [
                "Prefer indoor workouts or reduce outdoor training intensity if experiencing chest or throat discomfort.",
                "Schedule intense aerobic exercise for early mornings or post-breeze hours when pollution disperses.",
                "Children and seniors should take frequent hydration breaks during outdoor play."
            ],
            "travel": [
                "Reduce unnecessary prolonged exposure along congested roads and heavy diesel corridors.",
                "Vulnerable commuters should consider wearing lightweight barrier masks in congested transit hubs.",
                "Keep personal vehicle windows rolled up in stationary traffic."
            ],
            "indoor_protection": [
                "Keep windows and ventilation dampers closed during high-pollution rush-hour periods.",
                "Operate indoor air purifiers in bedrooms or heavily occupied rooms if available.",
                "Avoid indoor dust generation and indoor combustion (incense, unvented frying)."
            ],
            "general": "Monitor symptoms, track live AQI updates, and pace outdoor physical activities.",
            "checklist": [
                "Close exterior windows during morning/evening traffic spikes",
                "Sensitive groups reduce vigorous outdoor cardio",
                "Keep rescue inhalers accessible for asthma patients",
                "Monitor hourly AQI updates before outdoor excursions"
            ]
        }

    elif cat == "Poor":
        return {
            "health_risk": "Increased risk of breathing discomfort for the general public and aggravated illness for vulnerable groups.",
            "health": [
                "Avoid prolonged outdoor physical activity; general public may experience coughing, airway tightness, and throat irritation.",
                "Persons with pre-existing cardiopulmonary disorders face heightened risk of symptom flare-ups.",
                "Children, pregnant women, and the elderly should avoid sustained outdoor exposure."
            ],
            "outdoor_activity": [
                "Significantly reduce outdoor exercise, jogging, and strenuous athletic activities.",
                "Relocate school sports and team workouts into well-ventilated indoor facilities.",
                "Replace outdoor cardio with light indoor walking or stretching."
            ],
            "travel": [
                "Minimize unnecessary outdoor exposure and lengthy walking commutes along arterial roads.",
                "Wear a well-fitted particulate respirator (N95 or FFP2 certified) during outdoor travel.",
                "Keep vehicle ventilation switched to internal recirculation mode."
            ],
            "indoor_protection": [
                "Keep all exterior windows and doors closed to prevent ambient particulate ingress.",
                "Continuously operate HEPA-grade air purifiers in occupied living spaces.",
                "Avoid vacuuming without sealed HEPA exhaust to prevent particulate re-suspension."
            ],
            "general": "Consider wearing a well-fitted N95 respirator outdoors and relocate workouts inside.",
            "checklist": [
                "Wear a certified N95 mask for all outdoor pedestrian commutes",
                "Suspend intense outdoor jogging, cycling, and running",
                "Keep residential windows and doors closed",
                "Run indoor HEPA air purifiers continuously",
                "Vulnerable cohorts remain strictly in filtered indoor spaces"
            ]
        }

    elif cat == "Very Poor":
        return {
            "health_risk": "High risk of respiratory illness on prolonged exposure; severe effects on people with lung or heart disease.",
            "health": [
                "Respiratory illness risk increases substantially across the entire population on sustained exposure.",
                "Vulnerable groups (children, seniors, asthmatics) must stay strictly in clean indoor environments.",
                "Anyone experiencing persistent coughing, wheezing, or chest tightness should seek prompt medical guidance."
            ],
            "outdoor_activity": [
                "Avoid outdoor exercise entirely; cease all outdoor athletic events, marathon runs, and sports.",
                "Schools should suspend outdoor recess and community outdoor gatherings.",
                "Keep physical activity strictly indoors within air-conditioned or air-purified rooms."
            ],
            "travel": [
                "Minimize outdoor exposure and cancel non-essential travel.",
                "Wearing a properly fitted N95 or N99 respirator is strongly advised whenever stepping outdoors.",
                "Keep automobile windows tightly sealed with cabin air filtration active."
            ],
            "indoor_protection": [
                "Stay in cleaner indoor air environments and run HEPA air filtration at higher fan speeds.",
                "Designate a sealed 'clean room' with minimal outdoor drafts and air leakage.",
                "Damp-mop indoor surfaces rather than dry-sweeping to trap settled dust."
            ],
            "general": "Follow official public-health guidance, use HEPA filtration indoors, and wear N95 respirators outdoors.",
            "checklist": [
                "Strictly avoid all outdoor exercise and athletic activities",
                "Wear N95/N99 respirator for any essential outdoor transit",
                "Keep home and office windows sealed completely",
                "Operate HEPA filtration units at medium-to-high speeds",
                "Consult physician if respiratory symptoms or chest tightness worsen"
            ]
        }

    else:  # Severe (401–500+)
        return {
            "health_risk": "Emergency conditions. Serious health effects are possible for healthy individuals; acute hazard for vulnerable groups.",
            "health": [
                "Serious systemic health effects and acute respiratory distress possible even in healthy individuals.",
                "Extremely dangerous for children, elderly, and individuals with cardiopulmonary illness.",
                "Seek immediate emergency medical attention for severe shortness of breath, palpitations, or persistent coughing."
            ],
            "outdoor_activity": [
                "Avoid all outdoor activities completely; zero outdoor exposure.",
                "All outdoor events, work activities, and school outdoor programs should be cancelled or postponed.",
                "Remain strictly within filtered indoor structures."
            ],
            "travel": [
                "Avoid unnecessary outdoor exposure and non-essential travel entirely.",
                "If outdoor transit is unavoidable, a tightly sealed N95/N99 respirator is mandatory.",
                "Use closed motorized transit with recirculated internal air; avoid open-air auto-rickshaws or walking."
            ],
            "indoor_protection": [
                "Stay indoors in clean, sealed environments with continuous HEPA air filtration.",
                "Keep all doors, windows, and balcony vents shut; seal drafty window gaps with weather-stripping if needed.",
                "Completely eliminate indoor smoke, cooking fumes, candles, and incense."
            ],
            "general": "Follow local emergency health advisories, stay indoors with air purifiers, and seek medical attention for serious symptoms.",
            "checklist": [
                "Emergency health alert: remain indoors in sealed clean rooms",
                "Cancel all outdoor transit and non-essential travel",
                "Wear sealed N95/N99 respirator if outdoor exposure is unavoidable",
                "Run multiple indoor HEPA air purifiers continuously",
                "Contact healthcare provider immediately for acute respiratory distress"
            ]
        }


def normalize_pollutant_key(raw_key: str) -> Optional[str]:
    """Map various key formats (pm25, PM2.5, PM_25, etc.) to canonical keys."""
    k = str(raw_key).upper().replace(".", "").replace("-", "").replace("_", "").strip()
    if k in ["PM25", "PM2"]:
        return "PM25"
    elif k in ["PM10"]:
        return "PM10"
    elif k in ["NO2"]:
        return "NO2"
    elif k in ["SO2"]:
        return "SO2"
    elif k in ["CO"]:
        return "CO"
    elif k in ["O3", "OZONE"]:
        return "O3"
    return None


def analyze_pollutants(pollutants: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Scientifically analyze criteria pollutant concentrations against CPCB NAAQS standards.
    Identifies elevated pollutants, ranks major pollution contributors, and generates
    targeted physiological and environmental insights.
    """
    if not pollutants or not isinstance(pollutants, dict):
        return {
            "available_count": 0,
            "major_contributors": [],
            "elevated_pollutants": [],
            "pollutant_details": {},
            "insights": ["No criteria pollutant telemetry data available for chemical speciation analysis."]
        }

    canonical_pollutants: Dict[str, float] = {}
    for raw_k, raw_v in pollutants.items():
        can_k = normalize_pollutant_key(raw_k)
        if can_k and raw_v is not None:
            try:
                val = float(raw_v)
                if not math.isnan(val) and val >= 0:
                    canonical_pollutants[can_k] = round(val, 4)
            except (ValueError, TypeError):
                continue

    if not canonical_pollutants:
        return {
            "available_count": 0,
            "major_contributors": [],
            "elevated_pollutants": [],
            "pollutant_details": {},
            "insights": ["Telemetry contains missing or unparseable pollutant concentrations."]
        }

    pollutant_details: Dict[str, Any] = {}
    elevated_pollutants: List[Dict[str, Any]] = []
    ranked_list: List[Dict[str, Any]] = []

    for key, spec in POLLUTANT_THRESHOLDS.items():
        if key in canonical_pollutants:
            val = canonical_pollutants[key]
            std = spec["standard"]
            ratio = round(val / std, 3)
            pct = round(ratio * 100, 1)

            if ratio <= 0.5:
                level_status = "Good"
                level_color = "#10B981"
            elif ratio <= 1.0:
                level_status = "Moderate (Within Standard)"
                level_color = "#22C55E"
            elif ratio <= 1.5:
                level_status = "Elevated (Exceeding Standard)"
                level_color = "#F59E0B"
            elif ratio <= 2.5:
                level_status = "High (Severe Exceedance)"
                level_color = "#EF4444"
            else:
                level_status = "Hazardous"
                level_color = "#991B1B"

            detail = {
                "key": key,
                "name": spec["name"],
                "full_name": spec["full_name"],
                "value": val,
                "unit": spec["unit"],
                "standard": std,
                "optimal": spec["optimal"],
                "ratio": ratio,
                "percentage_of_standard": pct,
                "status": level_status,
                "status_color": level_color,
                "period": spec["period"],
                "is_elevated": ratio > 1.0
            }
            pollutant_details[key] = detail

            ranked_list.append({
                "key": key,
                "name": spec["name"],
                "ratio": ratio,
                "percentage_of_standard": pct,
                "value": val,
                "unit": spec["unit"],
                "is_elevated": ratio > 1.0
            })

            if ratio > 1.0:
                elevated_pollutants.append(detail)

    # Sort pollutants by exceedance ratio descending
    ranked_list.sort(key=lambda x: x["ratio"], reverse=True)
    major_contributors = ranked_list[:3]

    # Generate specific pollutant insights
    insights: List[str] = []

    if elevated_pollutants:
        top_elevated = elevated_pollutants[0]
        insights.append(
            f"{top_elevated['name']} is the primary elevated pollutant at {top_elevated['value']} {top_elevated['unit']} "
            f"({top_elevated['percentage_of_standard']}% of the CPCB 24-hr standard of {top_elevated['standard']} {top_elevated['unit']}). "
            f"{POLLUTANT_THRESHOLDS[top_elevated['key']]['mechanism']}"
        )

        if len(elevated_pollutants) > 1:
            sec_elevated = elevated_pollutants[1]
            insights.append(
                f"Secondary elevated contributor: {sec_elevated['name']} at {sec_elevated['value']} {sec_elevated['unit']} "
                f"({sec_elevated['percentage_of_standard']}% of standard). "
                f"Source: {POLLUTANT_THRESHOLDS[sec_elevated['key']]['source']}."
            )
    else:
        # All pollutants within NAAQS standard
        if ranked_list:
            top_pol = ranked_list[0]
            insights.append(
                f"All measured criteria pollutants are currently within CPCB national ambient standards. "
                f"The highest relative constituent is {top_pol['name']} at {top_pol['percentage_of_standard']}% of permissible limits."
            )
        else:
            insights.append("Measured criteria pollutants comply with standard ambient thresholds.")

    # Specific insights for fine particulates if available
    if "PM25" in canonical_pollutants and "PM10" in canonical_pollutants:
        pm25_val = canonical_pollutants["PM25"]
        pm10_val = canonical_pollutants["PM10"]
        if pm10_val > 0:
            pm_ratio = round(pm25_val / pm10_val, 2)
            if pm_ratio > 0.6:
                insights.append(
                    f"PM2.5/PM10 ratio is elevated at {pm_ratio}, indicating dominance of fine combustion-derived aerosols "
                    f"over mechanical coarse dust."
                )
            elif pm_ratio < 0.4:
                insights.append(
                    f"PM2.5/PM10 ratio is {pm_ratio}, suggesting coarse fugitive dust or road re-suspension dominates over fine combustion aerosols."
                )

    return {
        "available_count": len(canonical_pollutants),
        "major_contributors": major_contributors,
        "elevated_pollutants": elevated_pollutants,
        "pollutant_details": pollutant_details,
        "insights": insights
    }


def generate_smart_advisory(
    aqi: Optional[float],
    pollutants: Optional[Dict[str, Any]] = None,
    mode: str = "live",
    station: Optional[str] = "Manali, Chennai - CPCB",
    timestamp: Optional[str] = None,
    is_forecast: bool = False
) -> Dict[str, Any]:
    """
    Centralized recommendation engine generating a comprehensive, commercial-grade
    smart AQI advisory. Used identically by Manual Prediction Mode and Live Monitoring Mode.
    """
    # 1. Determine exact CPCB category
    category = get_aqi_category(aqi)
    meta = CPCB_CATEGORIES_META.get(category, CPCB_CATEGORIES_META["Good"])

    # 2. Retrieve standardized recommendations
    recs = get_category_recommendations(category)

    # 3. Analyze available pollutant concentrations
    pol_analysis = analyze_pollutants(pollutants)

    # 4. Formulate contextual header
    rounded_aqi = round(float(aqi), 2) if aqi is not None and not math.isnan(float(aqi)) else 0.0

    if is_forecast:
        status_label = "Next-Hour ML Forecast (t+1)"
        headline = f"Predicted AQI {rounded_aqi:.0f} falls into '{category}' category. Plan ahead for upcoming conditions."
    else:
        status_label = "Current Measured Telemetry (t)"
        headline = f"Current air quality is {rounded_aqi:.0f} ({category}). {recs['health_risk']}"

    return {
        "aqi": rounded_aqi,
        "category": category,
        "category_meta": meta,
        "mode": mode,  # "manual" | "live"
        "is_forecast": is_forecast,
        "status_label": status_label,
        "headline": headline,
        "station": station,
        "timestamp": timestamp,
        "health_risk": recs["health_risk"],
        "recommendations": {
            "health": recs["health"],
            "outdoor_activity": recs["outdoor_activity"],
            "travel": recs["travel"],
            "indoor_protection": recs["indoor_protection"],
            "general": recs["general"]
        },
        "pollutant_analysis": pol_analysis,
        "action_checklist": recs["checklist"],
        "disclaimer": "These advisories are general precautionary health guidelines based on CPCB standards and do not substitute individualized medical treatment."
    }
