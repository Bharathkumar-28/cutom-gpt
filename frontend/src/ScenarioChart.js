import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function ScenarioChart({ scenarios }) {
  if (!scenarios) return null;

  const data = {
    labels: ["Current", "Optimised", "Future Circular"],
    datasets: [
      {
        label: "CO₂ Emissions (kg)",
        data: [
          scenarios.current.co2,
          scenarios.optimised.co2,
          scenarios.future.co2
        ],
        backgroundColor: ["#ef4444", "#facc15", "#22c55e"]
      },
      {
        label: "Circularity Score",
        data: [
          scenarios.current.circularity,
          scenarios.optimised.circularity,
          scenarios.future.circularity
        ],
        backgroundColor: ["#3b82f6", "#6366f1", "#10b981"]
      }
    ]
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h3>Scenario Comparison</h3>
      <Bar data={data} />
    </div>
  );
}

export default ScenarioChart;
