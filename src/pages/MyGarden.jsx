import { useEffect, useState } from "react";
import { STORAGE_KEYS, getSavedPlants, savePlants, getPlantGrowthInfo, readStoredEnvironment, readStorage } from "../utils";
import { LIBRARY_PLANTS, getPlantImage, getPlantGrowthMeta } from "../plantData";
import { gardenApi, getAuthToken } from "../api";
import PageHeaderBanner from "../components/PageHeaderBanner";
import CareGuideModal from "../components/CareGuideModal";
import "./MyGarden.css";

import sproutSunbeamImg from "../assets/sprout-sunbeam.jpg";

function MyGarden({ onPageChange }) {
  const [plants, setPlants] = useState(() => getSavedPlants());
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadGarden = async () => {
      if (!getAuthToken()) {
        setBackendReady(true);
        return;
      }
      try {
        const result = await gardenApi.list();
        if (!cancelled && Array.isArray(result.plants)) setPlants(result.plants);
      } catch {
        // Local cache keeps the app usable while the API is unavailable.
      } finally {
        if (!cancelled) setBackendReady(true);
      }
    };
    loadGarden();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (backendReady) savePlants(plants);
  }, [plants, backendReady]);

  const [filter, setFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [guidePlant, setGuidePlant] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Add Modal State
  const [addModalTab, setAddModalTab] = useState("library"); // "library" | "custom"
  const [libSearch, setLibSearch] = useState("");
  const [libCategory, setLibCategory] = useState("All");
  const [toastMsg, setToastMsg] = useState(null);

  // Custom Form State
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("Herb");
  const [formSunlight, setFormSunlight] = useState("4–6 hrs");
  const [formWater, setFormWater] = useState("Daily");
  const [formPlantedDate, setFormPlantedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formGrowthDays, setFormGrowthDays] = useState("30");

 

  // User Name
  const user = readStorage(STORAGE_KEYS.session, null);
  const userName = user?.name || "Gardener";
  const environment = readStoredEnvironment();

  // Calculate Ready to Harvest
  const readyToHarvestCount = plants.filter((p) => getPlantGrowthInfo(p).isReady).length;

  // Filter Plants
  const filteredPlants = plants.filter((plant) => {
    if (filter === "Healthy") return plant.statusType === "healthy";
    if (filter === "Needs Water") return plant.statusType === "warning";
    if (filter === "Ready to Harvest") {
      const g = getPlantGrowthInfo(plant);
      return g.isReady;
    }
    return true;
  });

  // Metrics
  const totalPlants = plants.length;
  const healthyPlantsCount = plants.filter((p) => p.statusType === "healthy").length;
  const needsWaterCount = plants.filter((p) => p.statusType === "warning").length;
  const healthyPercentage = totalPlants > 0 ? Math.round((healthyPlantsCount / totalPlants) * 100) : 0;
  const needsWaterPercentage = totalPlants > 0 ? Math.round((needsWaterCount / totalPlants) * 100) : 0;

  // Filter Library Plants for Add Modal
  const filteredLibPlants = LIBRARY_PLANTS.filter((plant) => {
    const query = libSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      plant.name.toLowerCase().includes(query) ||
      plant.botanicalName.toLowerCase().includes(query) ||
      plant.category.toLowerCase().includes(query);
    const matchesCategory =
      libCategory === "All" || plant.category === libCategory;
    return matchesSearch && matchesCategory;
  });

  const persistGardenUpdate = async (operation) => {
    if (!getAuthToken()) return null;
    try {
      return await operation();
    } catch {
      setToastMsg("⚠️ Saved locally. Backend sync will retry when available.");
      setTimeout(() => setToastMsg(null), 3000);
      return null;
    }
  };

  // Add Library Plant to Garden Handler
  const handleAddLibraryPlant = async (libPlant) => {
    const exists = plants.some(
      (p) => p.name.toLowerCase() === libPlant.name.toLowerCase()
    );
    if (exists) return;

    const newPlant = {
      clientId: String(Date.now()),
      name: libPlant.name,
      botanicalName: libPlant.botanicalName,
      type:
        libPlant.category === "Flowers"
          ? "Flower"
          : libPlant.category === "Vegetables"
          ? "Vegetable"
          : libPlant.category === "Succulents"
          ? "Succulent"
          : "Herb",
      emoji:
        libPlant.category === "Flowers"
          ? "🌹"
          : libPlant.category === "Succulents"
          ? "🌵"
          : libPlant.category === "Vegetables"
          ? "🍅"
          : "🌿",
      status: "Healthy",
      statusType: "healthy",
      sunlight: libPlant.sunlight,
      water: libPlant.water,
      watered: "Watered Today",
      moisture: 85,
      image: libPlant.image,
      description: libPlant.description,
      careTips: libPlant.careTips,
      plantedDate: new Date().toISOString().split("T")[0],
      growthDays: libPlant.growthDays || 60,
      growthTime: libPlant.growthTime || `${libPlant.growthDays || 60} days`,
      harvestAdvice: libPlant.harvestAdvice || "Harvest when fully matured.",
      harvestType: libPlant.harvestType || "continuous",
    };

    const serverResult = await persistGardenUpdate(() => gardenApi.add(newPlant));
    const itemToStore = serverResult?.plant || newPlant;
    const updated = [itemToStore, ...plants];
    setPlants(updated);
    savePlants(updated);
    setToastMsg(`"${libPlant.name}" added to your garden!`);
    setTimeout(() => setToastMsg(null), 3500);
  };


  // Add Custom Plant Handler
  const handleAddCustomPlant = async (e) => {
    e.preventDefault();
    const name = formName.trim();
    if (!name) return;

    const meta = getPlantGrowthMeta(name, formType);
    const growthDays = Number(formGrowthDays) || meta.growthDays || 60;

    const newPlant = {
      clientId: String(Date.now()),
      name,
      type: formType,
      emoji:
        formType === "Flower"
          ? "🌹"
          : formType === "Succulent"
          ? "🌵"
          : formType === "Vegetable"
          ? "🍅"
          : "🌿",
      status: "Healthy",
      statusType: "healthy",
      sunlight: formSunlight,
      water: formWater,
      watered: "Watered Today",
      moisture: 80,
      image: getPlantImage(name),
      plantedDate: formPlantedDate || new Date().toISOString().split("T")[0],
      growthDays,
      growthTime: `${growthDays} days`,
      harvestAdvice: meta.harvestAdvice,
      harvestType: meta.harvestType,
    };

    const serverResult = await persistGardenUpdate(() => gardenApi.add(newPlant));
    const itemToStore = serverResult?.plant || newPlant;
    const updated = [itemToStore, ...plants];
    setPlants(updated);
    savePlants(updated);
    setFormName("");
    setShowAddForm(false);
    setToastMsg(`"${name}" added to your garden!`);
    setTimeout(() => setToastMsg(null), 3500);
  };


  // Update Planted Date Handler
  const handleUpdatePlantedDate = (plantId, newDate) => {
    if (!newDate) return;
    const updated = plants.map((p) =>
      p.id === plantId || p._id === plantId ? { ...p, plantedDate: newDate } : p
    );
    setPlants(updated);
    savePlants(updated);
    persistGardenUpdate(() => gardenApi.update(plantId, { plantedDate: newDate }));
    if (selectedPlant && (selectedPlant.id === plantId || selectedPlant._id === plantId)) {
      setSelectedPlant((prev) => (prev ? { ...prev, plantedDate: newDate } : null));
    }
    setToastMsg(`Planted date updated!`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Water Plant Handler
  const handleWaterPlant = (id) => {
    const updated = plants.map((p) =>
      p.id === id || p._id === id
        ? {
            ...p,
            status: "Healthy",
            statusType: "healthy",
            watered: "Watered Today",
            moisture: 90,
          }
        : p
    );
    setPlants(updated);
    savePlants(updated);
    persistGardenUpdate(() => gardenApi.update(id, { status: "Healthy", statusType: "healthy", watered: "Watered Today", moisture: 90 }));

    if (selectedPlant && (selectedPlant.id === id || selectedPlant._id === id)) {
      setSelectedPlant((prev) =>
        prev
          ? {
              ...prev,
              status: "Healthy",
              statusType: "healthy",
              watered: "Watered Today",
              moisture: 90,
            }
          : null
      );
    }
    setActiveMenuId(null);
  };

  // Remove Plant Handler
  const handleRemovePlant = async (id) => {
    const plant = plants.find((p) => p.id === id || p._id === id);
    if (!plant) return;
    if (window.confirm(`Remove ${plant.name} from your garden?`)) {
      const updated = plants.filter((p) => p.id !== id && p._id !== id);
      setPlants(updated);
      savePlants(updated);
      if (getAuthToken()) {
        await persistGardenUpdate(() => gardenApi.remove(plant._id || plant.id || id));
      }
      if (selectedPlant && (selectedPlant.id === id || selectedPlant._id === id)) {
        setSelectedPlant(null);
      }
    }
    setActiveMenuId(null);
  };


  const healthyCount = plants.filter((p) => p.status === "Healthy").length;

  return (
    <main className="my-garden-page">
      {/* =========================================
          1. HEADER BANNER
          ========================================= */}
      <PageHeaderBanner
        showBackButton={true}
        onPageChange={onPageChange}
        backFallbackPage="dashboard"
        eyebrow="PERSONAL BOTANICAL OASIS & COLLECTION"
        title="My Garden"
        titleAccent="🍃"
        subtitle={`Welcome back, ${userName}! Keep track of your living plants, soil moisture levels, and scheduled care routines.`}
        badgeIcon="🌿"
        badgeTitle={`${plants.length} Plants Growing`}
        badgeSubtitle={`${healthyCount} Healthy • Active Daily Care`}
        extraRight={
          <button
            type="button"
            className="banner-add-btn slow-pop-btn"
            onClick={() => setShowAddForm(true)}
          >
            <span className="add-plus">+</span>
            <strong>Add Plant</strong>
          </button>
        }
      />

      {/* =========================================
          2. METRICS ROW (4 STATS CARDS)
          ========================================= */}
      <section className="garden-metrics-row">
        {/* Total Plants */}
        <div className="garden-metric-card slow-popup animate-slow-pop" style={{ animationDelay: "60ms" }}>
          <div className="metric-icon-circle mint">
            <span>🌱</span>
          </div>
          <div className="metric-text-group">
            <strong className="metric-big-num">{totalPlants}</strong>
            <span className="metric-sub">Total Plants</span>
          </div>
          <div className="metric-sprout-art">🌿</div>
        </div>

        {/* Healthy Plants */}
        <div className="garden-metric-card slow-popup animate-slow-pop" style={{ animationDelay: "120ms" }}>
          <div className="metric-icon-circle green">
            <span>🍃</span>
          </div>
          <div className="metric-text-group">
            <strong className="metric-big-num">{healthyPlantsCount}</strong>
            <span className="metric-sub">Healthy Plants</span>
          </div>
          <div className="metric-circle-progress green">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${healthyPercentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="circle-percentage">
                {healthyPercentage}%
              </text>
            </svg>
          </div>
        </div>

        {/* Needs Water */}
        <div className="garden-metric-card slow-popup animate-slow-pop" style={{ animationDelay: "180ms" }}>
          <div className="metric-icon-circle blue">
            <span>💧</span>
          </div>
          <div className="metric-text-group">
            <strong className="metric-big-num">{needsWaterCount}</strong>
            <span className="metric-sub">Needs Water</span>
          </div>
          <div className="metric-circle-progress blue">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${needsWaterPercentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="circle-percentage">
                {needsWaterPercentage}%
              </text>
            </svg>
          </div>
        </div>

        {/* Harvest Ready Metric Card */}
        <div
          className="garden-metric-card harvest-metric-card slow-popup animate-slow-pop"
          style={{ animationDelay: "240ms" }}
          onClick={() => setFilter("Ready to Harvest")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setFilter("Ready to Harvest")}
          title="Click to view plants ready to harvest"
        >
          <div className="metric-icon-circle harvest-gold">
            <span>🧺</span>
          </div>
          <div className="metric-text-group">
            <strong className="metric-big-num">{readyToHarvestCount}</strong>
            <span className="metric-sub">Ready to Harvest</span>
          </div>
          <div className="metric-sprout-art">🌾</div>
        </div>
      </section>

      {/* =========================================
          3. MAIN SECTION (PLANTS & INSIGHTS)
          ========================================= */}
      <section className="garden-main-grid">
        {/* Left: Plants In Your Garden */}
        <div className="plants-collection-section">
          <div className="plants-collection-header">
            <div>
              <h2 className="section-title">Plants in your garden</h2>
              <span className="section-count">{filteredPlants.length} plants in your garden</span>
            </div>

            {/* Filter Tabs */}
            <div className="garden-filter-tabs">
              <button
                type="button"
                className={`filter-tab ${filter === "All" ? "active" : ""}`}
                onClick={() => setFilter("All")}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-tab ${filter === "Healthy" ? "active" : ""}`}
                onClick={() => setFilter("Healthy")}
              >
                Healthy
              </button>
              <button
                type="button"
                className={`filter-tab ${filter === "Needs Water" ? "active" : ""}`}
                onClick={() => setFilter("Needs Water")}
              >
                Needs Water
              </button>
              <button
                type="button"
                className={`filter-tab harvest-tab ${filter === "Ready to Harvest" ? "active" : ""}`}
                onClick={() => setFilter("Ready to Harvest")}
              >
                🧺 Ready to Harvest ({readyToHarvestCount})
              </button>
            </div>
          </div>

          {/* Plant Cards Grid */}
          <div className="plants-cards-grid">
            {filteredPlants.map((plant) => {
              const plantCardId = plant.id || plant._id;
              const plantImg = plant.image || getPlantImage(plant.name);
              const isWarning = plant.statusType === "warning";
              const growth = getPlantGrowthInfo(plant);

              return (
                <article
                  key={plantCardId}
                  className={`plant-card slow-popup animate-slow-pop ${growth.isReady ? "card-harvest-ready" : ""}`}
                >
                  <div className="plant-card-media">
                    <img src={plantImg} alt={plant.name} className="plant-card-img" />
                    <div className="card-media-badges">
                      <span className={`plant-card-badge ${isWarning ? "warning" : "healthy"}`}>
                        ● {isWarning ? "Needs Water" : "Healthy"}
                      </span>
                      {growth.isReady && (
                        <span className="plant-card-badge ready-badge">
                          🧺 Ready to Harvest
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="plant-card-body">
                    <div className="plant-title-wrap">
                      <h3 className="plant-name">{plant.name}</h3>
                      {plant.botanicalName && (
                        <span className="plant-botanical-sub">{plant.botanicalName}</span>
                      )}
                      <span className="plant-type">{plant.type}</span>
                      {plant.description && (
                        <p className="plant-card-description">{plant.description}</p>
                      )}
                    </div>

                    <div className="plant-card-footer">
                      <span className="water-status-text">
                        {plant.watered || "Ready for care"}
                      </span>

                      <div className="card-actions-group">
                        <div className="card-menu-wrapper">
                          <button
                            type="button"
                            className="card-more-btn"
                            onClick={() =>
                              setActiveMenuId(activeMenuId === plantCardId ? null : plantCardId)
                            }
                            aria-label="More actions"
                          >
                            •••
                          </button>

                          {activeMenuId === plantCardId && (
                            <div className="card-action-menu">
                              <button
                                type="button"
                                className="action-menu-item"
                                onClick={() => handleWaterPlant(plantCardId)}
                              >
                                💧 Water Now
                              </button>
                              <button
                                type="button"
                                className="action-menu-item"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  if (onPageChange) {
                                    onPageChange("diseasedetection", { symptom: `${plant.name} health check` });
                                  }
                                }}
                              >
                                🔍 Health Check
                              </button>
                              <button
                                type="button"
                                className="action-menu-item danger"
                                onClick={() => handleRemovePlant(plantCardId)}
                              >
                                🗑️ Remove
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="card-view-btn slow-pop-btn"
                          onClick={() => setGuidePlant(plant)}
                        >
                          View Care Guide →
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Right: Garden Insights */}
        <aside className="garden-insights-panel slow-popup animate-slow-pop" style={{ animationDelay: "300ms" }}>
          <h2 className="insights-heading">Garden Insights</h2>

          <div className="insights-list">
            {/* Harvest Insight */}
            <div className="insight-item harvest-insight">
              <div className="insight-icon amber">🧺</div>
              <div className="insight-info">
                <strong>
                  {readyToHarvestCount > 0
                    ? `${readyToHarvestCount} plant${readyToHarvestCount !== 1 ? "s" : ""} ready to harvest!`
                    : "Harvest season approaching"}
                </strong>
                <small>
                  {readyToHarvestCount > 0
                    ? "Fresh produce ready for picking"
                    : "Check harvest countdowns below"}
                </small>
              </div>
            </div>

            {/* Insight 1 */}
            <div className="insight-item">
              <div className="insight-icon green">🌱</div>
              <div className="insight-info">
                <strong>Your garden is {healthyPercentage}% healthy</strong>
                <small>Keep going!</small>
              </div>
            </div>

            {/* Insight 2 */}
            <div className="insight-item">
              <div className="insight-icon blue">💧</div>
              <div className="insight-info">
                <strong>
                  {needsWaterCount} plant{needsWaterCount !== 1 ? "s" : ""} need
                  {needsWaterCount === 1 ? "s" : ""} water
                </strong>
                <small>Water them today</small>
              </div>
            </div>

            {/* Insight 3: only show configured environment data. */}
            <div className="insight-item">
              <div className="insight-icon yellow">☀️</div>
              <div className="insight-info">
                <strong>{environment.configured ? (environment.sunlight || "Sunlight set") : "Environment not set"}</strong>
                <small>{environment.configured ? `${environment.location || "Garden"} • real setup data` : "Set up your growing conditions"}</small>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* =========================================
          4. BOTTOM ROW (REAL GARDEN SNAPSHOT + TIP)
          ========================================= */}
      <section className="garden-bottom-grid">
        {/* Real data snapshot: no fabricated growth chart. */}
        <article className="bottom-panel garden-snapshot-panel slow-popup animate-slow-pop" style={{ animationDelay: "360ms" }}>
          <div className="growth-header">
            <div>
              <h3 className="bottom-panel-title">Garden Snapshot</h3>
              <span className="snapshot-subtitle">Live totals from your saved garden</span>
            </div>
            <button type="button" className="view-tips-btn" onClick={() => onPageChange?.("scheduler")}>
              View care →
            </button>
          </div>

          <div className="garden-snapshot-grid">
            <div className="snapshot-stat">
              <span className="snapshot-icon">🌱</span>
              <strong>{totalPlants}</strong>
              <span>Plants</span>
            </div>
            <div className="snapshot-stat">
              <span className="snapshot-icon">🍃</span>
              <strong>{healthyPlantsCount}</strong>
              <span>Healthy</span>
            </div>
            <div className="snapshot-stat">
              <span className="snapshot-icon">💧</span>
              <strong>{needsWaterCount}</strong>
              <span>Need water</span>
            </div>
            <div className="snapshot-stat">
              <span className="snapshot-icon">🧺</span>
              <strong>{readyToHarvestCount}</strong>
              <span>Harvest ready</span>
            </div>
          </div>

          <div className="snapshot-footer">
            <div>
              <span className="snapshot-label">Health</span>
              <div className="snapshot-progress" aria-label={`${healthyPercentage}% of plants marked healthy`}>
                <span style={{ width: `${healthyPercentage}%` }} />
              </div>
            </div>
            <span className="snapshot-health-value">{totalPlants ? `${healthyPercentage}% healthy` : "Add your first plant"}</span>
          </div>
        </article>

        {/* Column 3: Garden Tip */}
        <article className="bottom-panel tip-panel slow-popup animate-slow-pop" style={{ animationDelay: "480ms" }}>
          <div className="tip-header">
            <h3 className="bottom-panel-title">Garden Tip</h3>
          </div>

          <div className="tip-content-flex">
            <div className="tip-details">
              <p className="tip-description">
                Water your plants early in the morning to keep them fresh and healthy.
              </p>
              <button
                type="button"
                className="view-tips-btn slow-pop-btn"
                onClick={() => onPageChange && onPageChange("assistant")}
              >
                View More Tips →
              </button>
            </div>
            <div className="tip-img-container">
              <img
                src={sproutSunbeamImg}
                alt="Seedling sprout in sunlight"
                className="tip-thumbnail-img"
              />
            </div>
          </div>
        </article>
      </section>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="garden-floating-toast slow-popup">
          <span className="toast-text">{toastMsg}</span>
        </div>
      )}

      {/* =========================================
          ADD PLANT MODAL (PLANT LIBRARY + CUSTOM)
          ========================================= */}
      {showAddForm && (
        <div className="garden-modal-backdrop" onClick={() => setShowAddForm(false)}>
          <div
            className="garden-modal-dialog add-plant-modal slow-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="garden-modal-header">
              <div>
                <h3 className="modal-title-main">Add Plants to Your Garden</h3>
                <p className="modal-title-sub">
                  Choose from our verified botanical library or enter a custom plant variety.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddForm(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="modal-tab-bar">
              <button
                type="button"
                className={`modal-tab-btn ${addModalTab === "library" ? "active" : ""}`}
                onClick={() => setAddModalTab("library")}
              >
                <span>📖 Browse Plant Library</span>
                <span className="tab-pill-badge">{filteredLibPlants.length}</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${addModalTab === "custom" ? "active" : ""}`}
                onClick={() => setAddModalTab("custom")}
              >
                <span>✍️ Custom Plant</span>
              </button>
            </div>

            {addModalTab === "library" ? (
              <div className="modal-library-panel">
                {/* Search Bar & Category Filter Pills */}
                <div className="modal-lib-search-row">
                  <div className="modal-lib-search-box">
                    <span className="search-ico">🔍</span>
                    <input
                      type="search"
                      placeholder="Search flowers, vegetables, herbs (e.g. Tomato, Rose, Marigold)..."
                      value={libSearch}
                      onChange={(e) => setLibSearch(e.target.value)}
                      autoFocus
                    />
                    {libSearch && (
                      <button
                        type="button"
                        className="search-clear-btn"
                        onClick={() => setLibSearch("")}
                        aria-label="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <span className="lib-count-indicator">
                    {filteredLibPlants.length} plants found
                  </span>
                </div>

                <div className="modal-cat-pills-row">
                  {["All", "Vegetables", "Flowers", "Herbs", "Succulents"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`cat-pill-btn ${libCategory === cat ? "active" : ""}`}
                      onClick={() => setLibCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Library Plant Cards Grid */}
                <div className="modal-library-grid">
                  {filteredLibPlants.map((libPlant) => {
                    const inGarden = plants.some(
                      (p) => p.name.toLowerCase() === libPlant.name.toLowerCase()
                    );

                    return (
                      <div key={libPlant.id} className="picker-plant-card">
                        <div className="picker-card-media">
                          <img
                            src={libPlant.image}
                            alt={libPlant.name}
                            className="picker-card-img"
                          />
                          <span className={`picker-cat-badge ${libPlant.category.toLowerCase()}`}>
                            {libPlant.category}
                          </span>
                        </div>

                        <div className="picker-card-body">
                          <div className="picker-names-wrap">
                            <h4 className="picker-name">{libPlant.name}</h4>
                            <small className="picker-botanical">{libPlant.botanicalName}</small>
                          </div>

                          <div className="picker-specs-compact">
                            <span>☀️ {libPlant.sunlight.split(" ")[0]}</span>
                            <span>💧 {libPlant.water.split(" ")[0]}</span>
                            <span>⏳ {libPlant.growthTime || `${libPlant.growthDays || 60} days`}</span>
                          </div>

                          <div className="picker-card-footer">
                            {inGarden ? (
                              <span className="picker-in-garden-tag">✓ In Garden</span>
                            ) : (
                              <button
                                type="button"
                                className="picker-add-btn slow-pop-btn"
                                onClick={() => handleAddLibraryPlant(libPlant)}
                              >
                                + Add to Garden
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddCustomPlant} className="garden-modal-form">
                <div className="form-group">
                  <label htmlFor="plant-name">Plant Name</label>
                  <input
                    id="plant-name"
                    type="text"
                    placeholder="e.g. Lavender, Coriander, Petunia"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="plant-type">Plant Category</label>
                  <select
                    id="plant-type"
                    value={formType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFormType(newType);
                      if (newType === "Herb") setFormGrowthDays("30");
                      else if (newType === "Vegetable") setFormGrowthDays("75");
                      else if (newType === "Flower") setFormGrowthDays("50");
                      else if (newType === "Succulent") setFormGrowthDays("75");
                      else setFormGrowthDays("60");
                    }}
                  >
                    <option value="Herb">Herb</option>
                    <option value="Vegetable">Vegetable</option>
                    <option value="Flower">Flower</option>
                    <option value="Succulent">Succulent</option>
                    <option value="Indoor Plant">Indoor Plant</option>
                  </select>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="plant-planted-date">Planted Date</label>
                    <input
                      id="plant-planted-date"
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      value={formPlantedDate}
                      onChange={(e) => setFormPlantedDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="plant-growth-days">Days Needed to Grow</label>
                    <input
                      id="plant-growth-days"
                      type="number"
                      min="5"
                      max="365"
                      value={formGrowthDays}
                      onChange={(e) => setFormGrowthDays(e.target.value)}
                      placeholder="e.g. 60"
                      required
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="plant-sun">Sunlight</label>
                    <select
                      id="plant-sun"
                      value={formSunlight}
                      onChange={(e) => setFormSunlight(e.target.value)}
                    >
                      <option value="2–4 hrs">Low (2–4 hrs)</option>
                      <option value="4–6 hrs">Medium (4–6 hrs)</option>
                      <option value="6–8 hrs">Full Sun (6–8 hrs)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="plant-water">Watering</label>
                    <select
                      id="plant-water"
                      value={formWater}
                      onChange={(e) => setFormWater(e.target.value)}
                    >
                      <option value="Daily">Daily</option>
                      <option value="2–3 times/wk">2–3 times/week</option>
                      <option value="1–2 times/week">1–2 times/week</option>
                      <option value="Weekly">Weekly</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="modal-submit-btn slow-pop-btn">
                    Add Custom Plant
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================
          VIEW PLANT DETAILS MODAL
          ========================================= */}
      {selectedPlant && (() => {
        const selectedGrowth = getPlantGrowthInfo(selectedPlant);

        return (
          <div className="garden-modal-backdrop" onClick={() => setSelectedPlant(null)}>
            <div
              className="garden-modal-dialog plant-detail-modal slow-popup"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="garden-modal-header">
                <div>
                  <h3>{selectedPlant.name}</h3>
                  {selectedPlant.botanicalName && (
                    <small className="detail-botanical-sub">{selectedPlant.botanicalName}</small>
                  )}
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedPlant(null)}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <div className="plant-detail-body">
                <div className="plant-detail-img-wrap">
                  <img
                    src={selectedPlant.image || getPlantImage(selectedPlant.name)}
                    alt={selectedPlant.name}
                    className="plant-detail-hero-img"
                  />
                  <div className="detail-modal-badges">
                    <span
                      className={`plant-card-badge ${
                        selectedPlant.statusType === "warning" ? "warning" : "healthy"
                      }`}
                    >
                      ● {selectedPlant.status}
                    </span>
                    {selectedGrowth.isReady && (
                      <span className="plant-card-badge ready-badge">
                        🧺 Ready to Harvest
                      </span>
                    )}
                  </div>
                </div>

                <div className="plant-detail-meta">
                  <div className="meta-badge-tag">{selectedPlant.type}</div>

                  {selectedPlant.description && (
                    <p className="detail-desc-snippet">{selectedPlant.description}</p>
                  )}

                  {/* Growth & Harvesting Journey Section */}
                  <div className="detail-growth-section">
                    <div className="detail-growth-header">
                      <div className="growth-header-title-wrap">
                        <span className="growth-head-ico">🌱</span>
                        <h4 className="growth-head-text">Growth & Harvesting Journey</h4>
                      </div>
                      <span className={`growth-stage-pill ${selectedGrowth.isReady ? "ready" : ""}`}>
                        {selectedGrowth.harvestStage}
                      </span>
                    </div>

                    {/* 3 Stats Grid */}
                    <div className="modal-growth-stats-row">
                      <div className="modal-growth-stat-card">
                        <span className="stat-card-title">In Garden</span>
                        <strong className="stat-card-main">🌱 {selectedGrowth.daysInGarden} Days</strong>
                        <small className="stat-card-hint">Planted {selectedGrowth.plantedDateFormatted}</small>
                      </div>

                      <div className="modal-growth-stat-card">
                        <span className="stat-card-title">Needs to Grow</span>
                        <strong className="stat-card-main">⏳ {selectedGrowth.growthDays} Days</strong>
                        <small className="stat-card-hint">Cycle: {selectedGrowth.growthTime}</small>
                      </div>

                      <div className={`modal-growth-stat-card ${selectedGrowth.isReady ? "harvest-ready" : ""}`}>
                        <span className="stat-card-title">Harvest Window</span>
                        <strong className="stat-card-main">
                          {selectedGrowth.isReady ? "Ready Now! 🧺" : `In ${selectedGrowth.daysToHarvest} Days`}
                        </strong>
                        <small className="stat-card-hint">
                          {selectedGrowth.isReady ? "Window is open" : `Est. ${selectedGrowth.harvestDateStr}`}
                        </small>
                      </div>
                    </div>

                    {/* 4-Stage Stepper Progress Track */}
                    <div className="modal-milestone-stepper">
                      <div className="stepper-track-bg">
                        <div
                          className={`stepper-track-bar ${selectedGrowth.isReady ? "ready" : ""}`}
                          style={{ width: `${selectedGrowth.progressPct}%` }}
                        />
                      </div>
                      <div className="stepper-points-flex">
                        <div className={`stepper-point ${selectedGrowth.progressPct >= 5 ? "completed" : ""}`}>
                          <div className="point-dot">🌱</div>
                          <span className="point-label">Sprout</span>
                          <span className="point-day">Day 0</span>
                        </div>
                        <div className={`stepper-point ${selectedGrowth.progressPct >= 35 ? "completed" : ""}`}>
                          <div className="point-dot">🌿</div>
                          <span className="point-label">Vegetative</span>
                          <span className="point-day">~Day {Math.round(selectedGrowth.growthDays * 0.35)}</span>
                        </div>
                        <div className={`stepper-point ${selectedGrowth.progressPct >= 70 ? "completed" : ""}`}>
                          <div className="point-dot">🌸</div>
                          <span className="point-label">Fruiting / Bud</span>
                          <span className="point-day">~Day {Math.round(selectedGrowth.growthDays * 0.7)}</span>
                        </div>
                        <div className={`stepper-point ${selectedGrowth.isReady ? "completed ready" : ""}`}>
                          <div className="point-dot">🧺</div>
                          <span className="point-label">Harvest</span>
                          <span className="point-day">Day {selectedGrowth.growthDays}</span>
                        </div>
                      </div>
                    </div>

                    {/* Harvesting Advice Box */}
                    <div className="modal-harvest-advice-box">
                      <div className="advice-header-row">
                        <strong>🧺 Harvesting Advice & Signs of Ripeness:</strong>
                        {selectedGrowth.isReady && (
                          <span className="ready-accent-tag">Ready for Picking!</span>
                        )}
                      </div>
                      <p className="advice-desc-text">{selectedGrowth.harvestAdvice}</p>
                      <span className="harvest-morning-tip">
                        💡 Best practice: Harvest in the morning hours before midday sun evaporates natural oils and moisture.
                      </span>
                    </div>

                    {/* Planted Date Adjuster */}
                    <div className="modal-planted-date-row">
                      <label htmlFor="modal-date-picker">
                        📅 <span>Date Planted in Garden:</span>
                      </label>
                      <input
                        id="modal-date-picker"
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        value={selectedPlant.plantedDate || ""}
                        onChange={(e) => handleUpdatePlantedDate(selectedPlant.id, e.target.value)}
                        className="modal-date-input"
                        title="Change date if you planted this on a different day"
                      />
                    </div>
                  </div>

                  <div className="detail-specs-grid">
                    <div>
                      <span>Sunlight:</span>
                      <strong>{selectedPlant.sunlight}</strong>
                    </div>
                    <div>
                      <span>Watering:</span>
                      <strong>{selectedPlant.water}</strong>
                    </div>
                    <div>
                      <span>Last Watered:</span>
                      <strong>{selectedPlant.watered}</strong>
                    </div>
                    <div>
                      <span>Moisture Level:</span>
                      <strong>{selectedPlant.moisture || 80}% (Optimal)</strong>
                    </div>
                  </div>

                  {selectedPlant.careTips && (
                    <div className="detail-care-tip-box">
                      <strong>💡 Growing Advice:</strong>
                      <p>{selectedPlant.careTips}</p>
                    </div>
                  )}

                <div className="detail-modal-actions">
                  <button
                    type="button"
                    className="care-guide-btn slow-pop-btn"
                    onClick={() => {
                      setGuidePlant(selectedPlant);
                      setSelectedPlant(null);
                    }}
                  >
                    📖 View Care Guide
                  </button>

                  <button
                    type="button"
                    className="water-now-btn slow-pop-btn"
                    onClick={() => handleWaterPlant(selectedPlant.id)}
                  >
                    💧 Water Plant Now
                  </button>

                  <button
                    type="button"
                    className="diagnose-btn slow-pop-btn"
                    onClick={() => {
                      setSelectedPlant(null);
                      if (onPageChange) {
                        onPageChange("diseasedetection", {
                          symptom: `${selectedPlant.name} leaf diagnosis`,
                        });
                      }
                    }}
                  >
                    🔍 Run Disease Check
                  </button>

                  <button
                    type="button"
                    className="remove-plant-btn"
                    onClick={() => handleRemovePlant(selectedPlant.id)}
                  >
                    🗑️ Remove Plant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      <CareGuideModal
        plant={guidePlant}
        onClose={() => setGuidePlant(null)}
        onOpenLibrary={(plant) => {
          setGuidePlant(null);
          onPageChange?.("library", { plantId: plant.id, plant });
        }}
        onDiagnose={(plant) => {
          setGuidePlant(null);
          onPageChange?.("diseasedetection", { symptom: `${plant.name} health check` });
        }}
        onWater={(plant) => {
          const target = plants.find((item) =>
            (item.id || item._id) === (plant.id || plant._id)
            || item.name?.toLowerCase() === plant.name?.toLowerCase()
          );
          if (target) handleWaterPlant(target.id || target._id);
        }}
      />
    </main>
  );
}

export default MyGarden;