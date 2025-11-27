import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Download, Edit3, Send } from "lucide-react";
import ScenarioChart from "./ScenarioChart";
import GaugeMeter from "./GaugeMeter";
import AIChatPanel from "./AIChatPanel";

export default function ProfessionalLCADashboard() {
  const [showForm, setShowForm] = useState(true);
  const [editMode, setEditMode] = useState(true);
  const [previousInputs, setPreviousInputs] = useState(null);

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
      setPreviousInputs(formData);
      setEditMode(false);
      setShowForm(false);
    } catch (error) {
      alert("Backend connection error. Please check server.");
    }

    setLoading(false);
  };

  const handleEdit = () => {
    setEditMode(true);
    setShowForm(true);
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-8"
      >
        <h1 className="text-4xl font-bold text-center text-green-700 mb-2">
          Circularity Intelligence Dashboard
        </h1>
        <p className="text-center text-gray-500 mb-8">
          AI-powered sustainability analysis using Gemini Intelligence
        </p>

        {/* INPUT FORM */}
        {showForm && editMode && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Metal Type" name="metal_type" value={formData.metal_type} onChange={handleChange} />
            <Input label="Process Route" name="process_type" value={formData.process_type} onChange={handleChange} />
            <Input label="Region" name="region" value={formData.region} onChange={handleChange} />
            <Input label="Transport Mode" name="transport_mode" value={formData.transport_mode} onChange={handleChange} />
            <Input
              label="Production Quantity (tons)"
              name="production_quantity_tons"
              value={formData.production_quantity_tons}
              onChange={handleChange}
              full
            />

            <div className="col-span-full flex gap-4 mt-4">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Send size={18} /> Analyze
              </button>

              {previousInputs && (
                <button
                  type="button"
                  onClick={() => setFormData(previousInputs)}
                  className="btn-secondary"
                >
                  Restore Previous
                </button>
              )}
            </div>
          </form>
        )}

        {loading && <p className="text-center mt-6 text-lg">Processing AI analysis...</p>}

        {/* RESULT VIEW */}
        {result && !editMode && (
          <div className="mt-10 space-y-8">

            {/* ACTION BAR */}
            <div className="flex justify-end gap-4">
              <button onClick={handleEdit} className="btn-secondary flex gap-2">
                <Edit3 size={18} /> Modify Inputs
              </button>
              <button onClick={downloadPDF} className="btn-primary flex gap-2">
                <Download size={18} /> Download Report
              </button>
            </div>

            {/* MAIN KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title="CO₂ Emissions" value={`${result.co2_emissions_kg} kg`} color="text-red-600" />
              <Card
                title="Circularity Score"
                value={result.circularity?.material_circularity_indicator || "N/A"}
                color="text-green-600"
              />
              <Card
                title="Best Scenario"
                value={result.scenarios?.best_scenario || "Optimized"}
              />
            </div>

            {/* ✅ ML PREDICTED VALUES */}
            <section className="bg-gray-50 p-6 rounded-2xl shadow-inner">
              <h2 className="text-xl font-semibold mb-3">ML Predicted Parameters</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SmallCard label="Energy (kWh/ton)" value={result.autofill_ml?.energy_kwh_per_ton} />
                <SmallCard label="Water (m³/ton)" value={result.autofill_ml?.water_m3_per_ton} />
                <SmallCard label="Transport Distance (km)" value={result.autofill_ml?.distance_km} />
                <SmallCard label="Virgin Material (%)" value={result.autofill_ml?.virgin_material_pct} />
              </div>
            </section>

            {/* GAUGE */}
            <GaugeMeter value={result.circularity?.material_circularity_indicator || 0} />

            {/* SCENARIOS */}
            {result.scenarios && (
              <ScenarioChart scenarios={result.scenarios} />
            )}

            {/* GEMINI RESPONSE */}
            <section className="bg-slate-50 p-6 rounded-2xl shadow-inner">
              <h2 className="text-2xl font-semibold mb-3">Gemini AI Explanation</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {formatGeminiText(result.ai_explanation)}
              </div>
            </section>

            {/* AI CHAT */}
            <section className="rounded-2xl shadow-lg border p-4">
              <h2 className="text-xl font-semibold mb-2">Ask Gemini Follow-up Questions</h2>
              <AIChatPanel context={result} />
            </section>
          </div>
        )}
      </motion.div>

      <style>{`
        .btn-primary {
          background: linear-gradient(to right, #16a34a, #22c55e);
          color: white;
          padding: 12px 22px;
          border-radius: 14px;
          font-weight: 600;
        }
        .btn-secondary {
          background: #475569;
          color: white;
          padding: 12px 22px;
          border-radius: 14px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

function Input({ label, name, value, onChange, full }) {
  return (
    <div className={full ? "col-span-full" : ""}>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <input
        className="w-full border border-gray-300 p-3 rounded-xl"
        name={name}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-md text-center">
      <p className="text-gray-500">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function SmallCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow text-center">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-bold text-lg">{value || "N/A"}</p>
    </div>
  );
}

function formatGeminiText(text) {
  if (!text) return null;
  return text.split("\n").map((line, i) => (
    <p key={i} className="mb-2">• {line}</p>
  ));
}
