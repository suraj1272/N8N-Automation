import React from "react";

export default function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <div className="spinner" style={{ 
        width: "40px", height: "40px", border: "4px solid #ddd", 
        borderTop: "4px solid #007bff", borderRadius: "50%", 
        margin: "auto", animation: "spin 1s linear infinite" 
      }}></div>
      <p>Generating content...</p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
