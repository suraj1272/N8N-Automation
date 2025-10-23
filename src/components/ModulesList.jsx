import React from "react";

export default function ModulesList({ modules }) {
  if (!modules?.length) return <p className="muted">No modules returned.</p>;
  return (
    <div>
      {modules.map((m, i) => (
        <div key={i} className="module">
          <h4>{m.title || `Module ${i+1}`}</h4>
          <p>{m.content || m.summary || m.description || ""}</p>
        </div>
      ))}
    </div>
  );
}
