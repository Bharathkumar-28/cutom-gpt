from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.responses import FileResponse
from services.pdf_generator import generate_pdf_report
from fastapi import Body



# Import internal services
from services.autofill_engine import run_autofill_models
from services.circularity_formulas import calculate_circularity
from services.scenario_engine import generate_scenarios
from services.ai_explanation import generate_explanation

app = FastAPI(title="LCA & Circularity AI Engine")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= LOAD ML MODELS =================

energy_model = joblib.load(
    r"C:\Users\Bharath\OneDrive\Desktop\sihloopify\models\autofill_energy_consumption_kwh_per_ton_model.pkl"
)

distance_model = joblib.load(
    r"C:\Users\Bharath\OneDrive\Desktop\sihloopify\models\autofill_transport_distance_km_model.pkl"
)

virgin_model = joblib.load(
    r"C:\Users\Bharath\OneDrive\Desktop\sihloopify\models\autofill_virgin_material_pct_model.pkl"
)

water_model = joblib.load(
    r"C:\Users\Bharath\OneDrive\Desktop\sihloopify\models\autofill_water_usage_m3_per_ton_model.pkl"
)

co2_model = joblib.load(
    r"C:\Users\Bharath\OneDrive\Desktop\sihloopify\models\models\co2_eq_emissions_kg_per_ton_best_model.joblib"
)

models = {
    "energy": energy_model,
    "distance": distance_model,
    "virgin": virgin_model,
    "water": water_model
}


# ================= INPUT SCHEMA =================

class InputData(BaseModel):
    metal_type: str
    process_type: str
    region: str
    transport_mode: str
    production_quantity_tons: float


# ================= MAIN ANALYZE ENDPOINT =================

@app.post("/analyze")
def analyze(data: InputData):

    # 1. ML AUTOFILL STAGE
    energy_kwh, water_m3, distance_km, virgin_pct = run_autofill_models(data, models)

    # 2. CIRCULARITY CALCULATION STAGE
    circularity_data = calculate_circularity(energy_kwh, virgin_pct)

    # 3. CO2 MODEL INPUT PREPARATION
    input_mass_kg = data.production_quantity_tons * 1000

    co2_input_df = pd.DataFrame([{
        "product_name": "Metal Product",
        "metal_type": data.metal_type,
        "process_type": data.process_type,
        "region": data.region,
        "transport_mode": data.transport_mode,
        "input_mass_kg": input_mass_kg,
        "energy_consumption_kwh_per_ton": energy_kwh,
        "water_usage_m3_per_ton": water_m3,
        "transport_distance_km": distance_km,
        "virgin_material_pct": virgin_pct,
        "recycled_material_pct": circularity_data["recycled_material_pct"],
        "eol_collection_rate_pct": circularity_data["eol_collection_rate_pct"],
        "eol_recycling_rate_pct": circularity_data["eol_recycling_rate_pct"],
        "eol_reuse_rate_pct": circularity_data["eol_reuse_rate_pct"],
        "eol_landfill_rate_pct": circularity_data["eol_landfill_rate_pct"],
        "material_circularity_indicator": circularity_data["material_circularity_indicator"]
    }])

    co2_value = float(co2_model.predict(co2_input_df)[0])

    # 4. SCENARIO ENGINE
    scenarios = generate_scenarios(
        co2_value,
        circularity_data["material_circularity_indicator"]
    )

    # 5. VECTOR-RAG + GEMINI EXPLANATION
    explanation_text = generate_explanation({
        "metal_type": data.metal_type,
        "process_type": data.process_type,
        "region": data.region,
        "transport_mode": data.transport_mode,
        "co2_emissions": co2_value,
        "circularity_score": circularity_data["material_circularity_indicator"],
        "scenarios": scenarios
    })

    # 6. FINAL RESPONSE JSON
    return {
        "input_summary": {
            "metal_type": data.metal_type,
            "process_type": data.process_type,
            "region": data.region,
            "transport_mode": data.transport_mode,
            "production_quantity_tons": data.production_quantity_tons
        },
        "autofill_ml": {
            "energy_kwh_per_ton": energy_kwh,
            "water_m3_per_ton": water_m3,
            "distance_km": distance_km,
            "virgin_material_pct": virgin_pct
        },
        "circularity": circularity_data,
        "co2_emissions_kg": round(co2_value, 2),
        "scenarios": scenarios,
        "ai_explanation": explanation_text
    }
@app.post("/download-report")
def download_report(data: dict):
    file_path = generate_pdf_report(data)
    return FileResponse(
        path=file_path,
        filename="sustainability_report.pdf",
        media_type="application/pdf"
    )


# ================= HEALTH CHECK =================

@app.get("/")
def root():
    return {"status": "LCA AI Engine Running ✅"}
from fastapi import Body

@app.post("/chat")
def chat_with_ai(
    question: str = Body(...),
    context: dict = Body(...)
):
    response = generate_explanation({
        "question": question,
        "context": context
    })
    return {"answer": response}

