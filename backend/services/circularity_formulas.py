def calculate_circularity(energy_kwh, virgin_pct):
    recycled_pct = round(100 - virgin_pct, 2)
    scrap_rate = round((energy_kwh / 100) * 5, 2)

    eol_collection = round(60 + (recycled_pct * 0.2), 2)
    eol_recycling = round(eol_collection * 0.7, 2)
    eol_reuse = round(eol_collection * 0.2, 2)
    eol_landfill = round(100 - (eol_recycling + eol_reuse), 2)

    material_circularity_indicator = round(
        (recycled_pct + eol_recycling + eol_reuse) / 3, 2
    )

    return {
        "recycled_material_pct": recycled_pct,
        "scrap_rate_pct": scrap_rate,
        "eol_collection_rate_pct": eol_collection,
        "eol_recycling_rate_pct": eol_recycling,
        "eol_reuse_rate_pct": eol_reuse,
        "eol_landfill_rate_pct": eol_landfill,
        "material_circularity_indicator": material_circularity_indicator
    }
