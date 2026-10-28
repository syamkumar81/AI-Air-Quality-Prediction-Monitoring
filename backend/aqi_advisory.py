"""
Re-export module for aqi_advisory service.
Ensures compatibility with both 'from services.aqi_advisory import ...' and 'import aqi_advisory'.
"""

from services.aqi_advisory import (
    CPCB_CATEGORIES_META,
    POLLUTANT_THRESHOLDS,
    get_aqi_category,
    get_category_recommendations,
    analyze_pollutants,
    generate_smart_advisory
)

__all__ = [
    "CPCB_CATEGORIES_META",
    "POLLUTANT_THRESHOLDS",
    "get_aqi_category",
    "get_category_recommendations",
    "analyze_pollutants",
    "generate_smart_advisory"
]
