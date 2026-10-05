import { useEffect, useState } from "react";
import { getPlantImage, LIBRARY_PLANTS } from "../plantData";
import { getSavedPlants, savePlants } from "../utils";
import { gardenApi } from "../api";
import PageHeaderBanner from "../components/PageHeaderBanner";
import CareGuideModal from "../components/CareGuideModal";
import "./PlantLibrary.css";

function PlantLibrary({ onPageChange, initialPlantId, initialPlant }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [inspectPlant, setInspectPlant] = useState(null);

  useEffect(() => {
    if (!initialPlantId && !initialPlant) return;

    const match = LIBRARY_PLANTS.find((plant) => String(plant.id) === String(initialPlantId))
      || LIBRARY_PLANTS.find((plant) => plant.name.toLowerCase() === String(initialPlant?.name || "").trim().toLowerCase())
      || LIBRARY_PLANTS.find((plant) => String(initialPlant?.name || "").trim() && plant.name.toLowerCase().includes(String(initialPlant?.name || "").trim().toLowerCase()));

    if (match) {
      setInspectPlant(match);
      return;
    }

    if (initialPlant) {
      setInspectPlant({
        ...initialPlant,
        id: initialPlant.id || initialPlant._id || initialPlant.name,
        image: initialPlant.image || initialPlant.imageUrl || getPlantImage(initialPlant.name),
        botanicalName: initialPlant.botanicalName || "",
        category: initialPlant.category || initialPlant.type || "Plant",
        difficulty: initialPlant.difficulty || "Not specified",
        sunlight: initialPlant.sunlight || "Not listed",
        water: initialPlant.water || "Not listed",
        soil: initialPlant.soil || initialPlant.medium || "Not listed",
        temp: initialPlant.temp || initialPlant.temperature || "Not listed",
        growthTime: initialPlant.growthTime || (initialPlant.growthDays ? `${initialPlant.growthDays} days` : "Not listed"),
        description: initialPlant.description || "A Garden Guide plant recommendation.",
        careTips: initialPlant.careTips || "Follow the plant's light, watering and drainage needs and monitor new growth.",
      });
    }
  }, [initialPlantId, initialPlant]);
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

      <CareGuideModal
        plant={inspectPlant}
        onClose={() => setInspectPlant(null)}
        onAdd={async (plant) => {
          await handleAddToGarden(plant);
          setInspectPlant(null);
        }}
        onOpenLibrary={(plant) => setInspectPlant(plant)}
        onDiagnose={(plant) => {
          setInspectPlant(null);
          onPageChange?.("diseasedetection", { symptom: `${plant.name} health check` });
        }}
      />
    </main>
  );
}

export default PlantLibrary;

