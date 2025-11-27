import React from "react";

function GaugeMeter({ value }) {
  // Clamp value between 0 and 100
  const percentage = Math.min(100, Math.max(0, value));

  // Determine color based on value
  const getColor = () => {
    if (percentage < 40) return "#ef4444"; // red
    if (percentage < 70) return "#facc15"; // yellow
    return "#22c55e"; // green
  };

  const rotation = (percentage / 100) * 180;

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h3 style={{ marginBottom: "10px" }}>Circularity Gauge</h3>

      <div style={{ position: "relative", width: "200px", height: "100px", margin: "0 auto" }}>
        <div
          style={{
            width: "200px",
            height: "100px",
            borderRadius: "200px 200px 0 0",
            background: "#e5e7eb",
            position: "absolute"
          }}
        />

        <div
          style={{
            width: "200px",
            height: "100px",
            borderRadius: "200px 200px 0 0",
            background: getColor(),
            position: "absolute",
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "bottom center",
            transition: "0.6s ease"
          }}
        />
      </div>

      <p style={{ fontSize: "24px", fontWeight: "bold", color: getColor() }}>
        {percentage}%
      </p>
    </div>
  );
}

export default GaugeMeter;
