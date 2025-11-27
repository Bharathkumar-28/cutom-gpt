import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ScenarioChart from "./ScenarioChart";
import GaugeMeter from "./GaugeMeter";
import AIChatPanel from "./AIChatPanel";


export default function ProfessionalLCADashboard() {
  const [formData, setFormData] = useState({
    metal_type: "",
    process_type: "",
    region: "",
    transport_mode: "",
    production_quantity_tons: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/analyze", {
        ...formData,
        production_quantity_tons: Number(formData.production_quantity_tons)
      });
      setResult(response.data);
    } catch (error) {
      alert("Backend error. Check API connection.");
    }
    setLoading(false);
  };

  // ✅ PDF DOWNLOAD FUNCTION
  const downloadPDF = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/download-report",
        result,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "sustainability_report.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert("PDF download failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-green-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6"
      >
        <h1 className="text-3xl font-bold mb-6 text-green-700 text-center">
          AI Circularity Intelligence Dashboard
        </h1>

        {/* INPUT PANEL */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-3 rounded-xl" name="metal_type" placeholder="Metal Type" onChange={handleChange} />
          <input className="border p-3 rounded-xl" name="process_type" placeholder="Process Route" onChange={handleChange} />
          <input className="border p-3 rounded-xl" name="region" placeholder="Region" onChange={handleChange} />
          <input className="border p-3 rounded-xl" name="transport_mode" placeholder="Transport Mode" onChange={handleChange} />
          <input className="border p-3 rounded-xl col-span-full" name="production_quantity_tons" placeholder="Production Quantity (tons)" onChange={handleChange} />
          <button className="col-span-full bg-green-600 text-white py-3 rounded-2xl hover:bg-green-700 transition">
            Analyze Sustainability
          </button>
        </form>

        {loading && <p className="mt-6 text-center">Analyzing data...</p>}

        {/* RESULTS SECTION */}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* KPI CARDS */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h3 className="text-gray-500">CO₂ Emissions</h3>
              <p className="text-2xl font-bold text-red-600">
                {result.co2_emissions_kg} kg
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-4">
              <h3 className="text-gray-500">Circularity Score</h3>
              <p className="text-2xl font-bold text-green-600">
                {result.circularity.material_circularity_indicator}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-4">
              <h3 className="text-gray-500">Material Efficiency</h3>
              <p className="text-xl font-semibold">Optimized</p>
            </div>

            {/* AI Explanation */}
            <div className="col-span-full bg-gray-50 p-6 rounded-2xl shadow-inner">
              <h2 className="text-xl font-semibold mb-3">AI Sustainability Insight</h2>
              <p className="whitespace-pre-line text-gray-700">{result.ai_explanation}</p>
              {result.scenarios && <ScenarioChart scenarios={result.scenarios} />}
            </div>

            {/* Circularity Gauge */}
            <div className="bg-white rounded-2xl shadow p-4 col-span-full">
              <GaugeMeter value={result.circularity.material_circularity_indicator} />
            </div>

            {/* DOWNLOAD BUTTON */}
            <div className="col-span-full text-center mt-6">
              <button
                onClick={downloadPDF}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
              >
                📄 Download Sustainability Report
              </button>
            </div>
            <AIChatPanel context={result} />


          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
