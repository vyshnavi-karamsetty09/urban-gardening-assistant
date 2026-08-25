import { useState } from "react";
import "./SimpleTools.css";

const checks = [
  { key: "yellow", label: "Yellowing leaves", icon: "🍃", advice: "Check watering first. Let the top layer of soil dry before watering again and make sure the pot drains well." },
  { key: "spots", label: "Brown or black spots", icon: "🟤", advice: "Remove badly affected leaves, improve airflow and avoid keeping foliage wet for long periods." },
  { key: "droop", label: "Drooping leaves", icon: "🥀", advice: "Check soil moisture and light. Both under-watering and root problems can cause drooping." },
  { key: "pests", label: "Visible pests", icon: "🐛", advice: "Isolate the plant, wipe leaves and inspect the undersides. A mild soap solution can help with common soft-bodied pests." },
];

function PlantHealth() {
  const [selected, setSelected] = useState("");
  const result = checks.find((item) => item.key === selected);
  return <main className="tool-page"><header className="tool-header"><div><p className="tool-eyebrow">PLANT CARE</p><h1>Plant Health ♡</h1><p>A simple local health checker for common symptoms. This is guidance, not a medical or agricultural diagnosis.</p></div></header><section className="tool-card"><h2>What are you noticing?</h2><div className="health-grid">{checks.map(item => <button key={item.key} className={`health-option ${selected === item.key ? "selected" : ""}`} onClick={() => setSelected(item.key)}><span>{item.icon}</span><strong>{item.label}</strong></button>)}</div>{result && <div className="health-result"><span>🌱</span><div><p className="tool-eyebrow">SUGGESTED FIRST STEP</p><h3>{result.label}</h3><p>{result.advice}</p></div></div>}</section></main>;
}
export default PlantHealth;
