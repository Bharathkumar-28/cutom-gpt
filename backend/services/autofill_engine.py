import pandas as pd

def run_autofill_models(data, models):
    autofill_df = pd.DataFrame([{
        "metal_type": data.metal_type,
        "process_type": data.process_type,
        "region": data.region,
        "transport_mode": data.transport_mode,
        "input_mass_kg": data.production_quantity_tons * 1000,
        "recycled_material_pct": 50
    }])

    energy_kwh = float(models["energy"].predict(autofill_df)[0])
    water_m3 = float(models["water"].predict(autofill_df)[0])
    distance_km = float(models["distance"].predict(autofill_df)[0])
    virgin_pct = float(models["virgin"].predict(autofill_df)[0])

    return energy_kwh, water_m3, distance_km, virgin_pct
