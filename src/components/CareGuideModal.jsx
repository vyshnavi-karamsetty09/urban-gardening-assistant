import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { getPlantImage, LIBRARY_PLANTS } from "../plantData";
import "./CareGuideModal.css";

function normalizePlant(plant) {
  const source = plant || {};
  const name = String(source.name || "").trim();
  const normalized = name.toLowerCase();
  const library = LIBRARY_PLANTS.find((item) =>
    item.name.toLowerCase() === normalized
    || item.name.toLowerCase().includes(normalized)
    || normalized.includes(item.name.toLowerCase())
  );

  const merged = { ...(library || {}), ...source };
  return {
    id: merged.id || merged._id || name,
    name: merged.name || "Plant Care Guide",
    botanicalName: merged.botanicalName || "",
    category: merged.category || merged.type || "Plant",
    difficulty: merged.difficulty || "Not specified",
    image: merged.image || merged.imageUrl || getPlantImage(merged.name),
    description: merged.description || "A Garden Guide plant profile with practical care guidance.",
    sunlight: merged.sunlight || "Check the plant's light needs and adjust gradually.",
    water: merged.water || "Check soil moisture before watering and allow excess water to drain.",
    soil: merged.soil || merged.medium || "Use a suitable, well-draining growing medium.",
    temp: merged.temp || merged.temperature || "Use the plant's preferred temperature range where available.",
    growthTime: merged.growthTime || (merged.growthDays ? `${merged.growthDays} days` : "See growth notes for this plant."),
    careTips: merged.careTips || "Keep light, watering, drainage and feeding consistent. Watch new growth for changes.",
    harvestAdvice: merged.harvestAdvice || "Harvest only when the plant shows the normal maturity signs for its crop.",
  };
}

function CareGuideModal({ plant, onClose, onWater, onDiagnose, onOpenLibrary, onAdd }) {
  const guide = useMemo(() => normalizePlant(plant), [plant]);

  useEffect(() => {
    if (!plant) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [plant, onClose]);

  if (!plant) return null;

  const modal = (
    <div className="care-guide-backdrop" role="presentation" onClick={onClose}>
      <div
        className="care-guide-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-guide-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="care-guide-header">
          <div>
            <span className="care-guide-kicker">PLANT CARE GUIDE</span>
            <h2 id="care-guide-title">{guide.name}</h2>
            {guide.botanicalName && <p>{guide.botanicalName}</p>}
          </div>
          <button type="button" className="care-guide-close" onClick={onClose} aria-label="Close care guide">×</button>
        </header>

        <div className="care-guide-scroll">
          <div className="care-guide-hero">
            <img src={guide.image} alt={guide.name} />
            <div className="care-guide-hero-copy">
              <div className="care-guide-tags">
                <span>{guide.category}</span>
                <span>{guide.difficulty}</span>
              </div>
              <p>{guide.description}</p>
            </div>
          </div>

          <section className="care-guide-specs" aria-label="Plant care requirements">
            <div><span>☀️ Sunlight</span><strong>{guide.sunlight}</strong></div>
            <div><span>💧 Watering</span><strong>{guide.water}</strong></div>
            <div><span>🌱 Soil / Medium</span><strong>{guide.soil}</strong></div>
            <div><span>🌡️ Ideal Temperature</span><strong>{guide.temp}</strong></div>
            <div><span>⏳ Growth Cycle</span><strong>{guide.growthTime}</strong></div>
          </section>

          <section className="care-guide-section">
            <h3>How to care for it</h3>
            <p>{guide.careTips}</p>
          </section>

          <section className="care-guide-section">
            <h3>Harvest / maturity guidance</h3>
            <p>{guide.harvestAdvice}</p>
          </section>
        </div>

        <footer className="care-guide-actions">
          {onOpenLibrary && (
            <button type="button" className="care-guide-secondary" onClick={() => onOpenLibrary(guide)}>
              Open in Plant Library
            </button>
          )}
          {onDiagnose && (
            <button type="button" className="care-guide-secondary" onClick={() => onDiagnose(guide)}>
              🔍 Check Plant Health
            </button>
          )}
          {onAdd && (
            <button type="button" className="care-guide-primary" onClick={() => onAdd(guide)}>
              🌿 Add to My Garden
            </button>
          )}
          {onWater && (
            <button type="button" className="care-guide-primary" onClick={() => onWater(guide)}>
              💧 Water Plant Now
            </button>
          )}
        </footer>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default CareGuideModal;
