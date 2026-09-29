import { useState } from "react";
import { getSavedPlants, savePlants } from "../utils";
import { gardenApi } from "../api";
import { LIBRARY_PLANTS } from "../plantData";
import PageHeaderBanner from "../components/PageHeaderBanner";
import "./PlantLibrary.css";

function PlantLibrary({ onPageChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [inspectPlant, setInspectPlant] = useState(null);
  const [addedIds, setAddedIds] = useState(() => {
    const saved = getSavedPlants();
    const map = {};
    saved.forEach((p) => {
      const match = LIBRARY_PLANTS.find((lp) => lp.name.toLowerCase() === p.name.toLowerCase());
      if (match) map[match.id] = true;
    });
    return map;
  });

  const categories = ["All", "Herbs", "Vegetables", "Flowers", "Succulents"];
  const difficulties = ["All", "Very Easy", "Easy", "Moderate"];

  // Filter logic
  const filteredPlants = LIBRARY_PLANTS.filter((plant) => {
    const matchesSearch =
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.botanicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || plant.category === selectedCategory;

    const matchesDifficulty =
      selectedDifficulty === "All" || plant.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Add Plant to Garden
  const handleAddToGarden = async (plant) => {
    const saved = getSavedPlants();

    if (
      saved.some(
        (p) => p.name.toLowerCase() === plant.name.toLowerCase()
      )
    ) {
      setAddedIds((prev) => ({ ...prev, [plant.id]: true }));
      return;
    }

    const sunlightShort = plant.sunlight.replace(/\s*\([^)]*\)/g, "").trim() || plant.sunlight;
    const waterShort = plant.water.replace(/\s*\([^)]*\)/g, "").trim() || plant.water;

    const newPlant = {
      id: Date.now(),
      clientId: String(Date.now()),
      name: plant.name,
      botanicalName: plant.botanicalName,
      type:
        plant.category === "Flowers"
          ? "Flower"
          : plant.category === "Vegetables"
          ? "Vegetable"
          : plant.category === "Succulents"
          ? "Succulent"
          : "Herb",
      emoji:
        plant.category === "Flowers"
          ? "🌹"
          : plant.category === "Succulents"
          ? "🌵"
          : plant.category === "Vegetables"
          ? "🍅"
          : "🌿",
      status: "Healthy",
      statusType: "healthy",
      sunlight: sunlightShort,
      water: waterShort,
      watered: "Watered Today",
      moisture: 85,
      plantedDate: new Date().toISOString().split("T")[0],
      growthDays: plant.growthDays || 60,
      growthTime: plant.growthTime || `${plant.growthDays || 60} days`,
      harvestAdvice: plant.harvestAdvice || "Harvest when mature.",
      harvestType: plant.harvestType || "continuous",
      image: plant.image,
    };

    let itemToStore = newPlant;

    try {
      const result = await gardenApi.add(newPlant);
      itemToStore = result.plant || newPlant;
    } catch (error) {
      console.error("Failed to save plant to backend:", error);
    }

    savePlants([...saved, itemToStore]);

    setAddedIds((prev) => ({
      ...prev,
      [plant.id]: true,
    }));
  };
  return (
    <main className="plant-library-page">
      {/* Header */}
      <PageHeaderBanner
        showBackButton={true}
        onPageChange={onPageChange}
        backFallbackPage="dashboard"
        eyebrow="BOTANICAL ENCYCLOPEDIA & GROWING GUIDES"
        title="Plant Library"
        titleAccent="📖"
        subtitle="Explore comprehensive growing guides, light & water requirements, and care essentials for your garden."
        badgeIcon="📚"
        badgeTitle={`${LIBRARY_PLANTS.length} Botanical Species`}
        badgeSubtitle="Vegetables • Flowers • Herbs • Succulents"
      />

      {/* Filter and Search Bar Row */}
      <section className="library-filters-bar animate-slow-pop" style={{ animationDelay: "60ms" }}>
        <div className="library-search-box">
          <span className="library-search-ico">🔍</span>
          <input
            type="search"
            placeholder="Search by plant name, botanical species..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search plant library"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Category:</span>
          <div className="filter-pills-row">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`library-pill-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Difficulty:</span>
          <div className="filter-pills-row">
            {difficulties.map((diff) => (
              <button
                key={diff}
                type="button"
                className={`library-pill-btn ${selectedDifficulty === diff ? "active" : ""}`}
                onClick={() => setSelectedDifficulty(diff)}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="library-catalog-grid">
        {filteredPlants.map((plant, idx) => {
          const isAdded = addedIds[plant.id];

          return (
            <article
              key={plant.id}
              className="library-plant-card slow-popup animate-slow-pop"
              style={{ animationDelay: `${100 + idx * 40}ms` }}
            >
              <div className="lib-card-media">
                <img src={plant.image} alt={plant.name} className="lib-card-img" />
                <span className={`lib-diff-badge ${plant.difficulty.toLowerCase().replace(" ", "-")}`}>
                  {plant.difficulty}
                </span>
              </div>

              <div className="lib-card-body">
                <div className="lib-card-names">
                  <h3 className="lib-plant-name">{plant.name}</h3>
                  <small className="lib-botanical-name">{plant.botanicalName}</small>
                </div>

                <p className="lib-desc-snippet">{plant.description}</p>

                <div className="lib-specs-grid">
                  <div className="lib-spec-item">
                    <span className="spec-ico">☀️</span>
                    <div>
                      <small>Sunlight</small>
                      <strong>{plant.sunlight}</strong>
                    </div>
                  </div>

                  <div className="lib-spec-item">
                    <span className="spec-ico">💧</span>
                    <div>
                      <small>Water</small>
                      <strong>{plant.water}</strong>
                    </div>
                  </div>

                  <div className="lib-spec-item">
                    <span className="spec-ico">🌡️</span>
                    <div>
                      <small>Ideal Temp</small>
                      <strong>{plant.temp}</strong>
                    </div>
                  </div>

                  <div className="lib-spec-item">
                    <span className="spec-ico">⏳</span>
                    <div>
                      <small>Growth Cycle</small>
                      <strong>{plant.growthTime}</strong>
                    </div>
                  </div>
                </div>

                <div className="lib-card-actions">
                  <button
                    type="button"
                    className="lib-details-btn slow-pop-btn"
                    onClick={() => setInspectPlant(plant)}
                  >
                    View Care Guide →
                  </button>

                  <button
                    type="button"
                    className={`lib-add-btn slow-pop-btn ${isAdded ? "added" : ""}`}
                    onClick={() => handleAddToGarden(plant)}
                  >
                    {isAdded ? "In Garden ✓" : "+ Add to Garden"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Inspect Care Guide Modal */}
      {inspectPlant && (
        <div className="library-modal-backdrop" onClick={() => setInspectPlant(null)}>
          <div
            className="library-modal-dialog slow-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top-bar">
              <div>
                <h2>{inspectPlant.name}</h2>
                <small className="botanical-sub">{inspectPlant.botanicalName}</small>
              </div>
              <button
                type="button"
                className="modal-close-ico"
                onClick={() => setInspectPlant(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-guide-body">
              <div className="guide-hero-img-wrap">
                <img
                  src={inspectPlant.image}
                  alt={inspectPlant.name}
                  className="guide-hero-img"
                />
              </div>

              <div className="guide-content-area">
                <div className="guide-badge-row">
                  <span className="guide-category-tag">{inspectPlant.category}</span>
                  <span className="guide-difficulty-tag">{inspectPlant.difficulty} to grow</span>
                </div>

                <p className="guide-overview">{inspectPlant.description}</p>

                <div className="guide-vital-specs">
                  <div>
                    <span>☀️ Sunlight</span>
                    <strong>{inspectPlant.sunlight}</strong>
                  </div>
                  <div>
                    <span>💧 Watering</span>
                    <strong>{inspectPlant.water}</strong>
                  </div>
                  <div>
                    <span>🌱 Soil Type</span>
                    <strong>{inspectPlant.soil}</strong>
                  </div>
                  <div>
                    <span>🌡️ Temperature</span>
                    <strong>{inspectPlant.temp}</strong>
                  </div>
                </div>

                <div className="guide-expert-tip">
                  <strong>💡 Pro Growing Advice:</strong>
                  <p>{inspectPlant.careTips}</p>
                </div>

                <div className="guide-modal-actions">
                  <button
                    type="button"
                    className="guide-add-garden-btn slow-pop-btn"
                    onClick={() => {
                      handleAddToGarden(inspectPlant);
                      if (onPageChange) onPageChange("mygarden");
                    }}
                  >
                    Add to My Garden 🌿
                  </button>
                  <button
                    type="button"
                    className="guide-diagnose-btn slow-pop-btn"
                    onClick={() => {
                      setInspectPlant(null);
                      if (onPageChange) {
                        onPageChange("diseasedetection", {
                          symptom: `${inspectPlant.name} care check`,
                        });
                      }
                    }}
                  >
                    🔍 AI Disease Scanner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default PlantLibrary;

