import React from "react";

export default function ProgramsList({ programs }) {
  if (!programs?.length) return <p className="muted">No problems returned.</p>;
  return (
    <div>
      {programs.map((p, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <h4>{p.title || `Problem ${i + 1}`} <small style={{ color: "#6b7280" }}>{p.difficulty || ""}</small></h4>
          <p>{p.description || p.problem || ""}</p>
          {p.solution && (
            <details>
              <summary>Solution</summary>
              <pre className="code">{p.solution}</pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}
