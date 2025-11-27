# services/scenario_engine.py

def generate_scenarios(co2_value: float, circularity_score: float):

    current = {
        "co2": round(co2_value, 2),
        "circularity": round(circularity_score, 2)
    }

    optimised = {
        "co2": round(co2_value * 0.75, 2),          # 25% reduction
        "circularity": round(circularity_score * 1.25, 2)
    }

    future = {
        "co2": round(co2_value * 0.4, 2),           # 60% reduction
        "circularity": round(circularity_score * 1.6, 2)
    }

    return {
        "current": current,
        "optimised": optimised,
        "future": future
    }
