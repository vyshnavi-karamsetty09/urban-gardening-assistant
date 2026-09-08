import { useEffect, useState } from "react";
import { STORAGE_KEYS, getSavedPlants, savePlants, defaultPlants } from "../utils";
import { LIBRARY_PLANTS, getPlantImage } from "../plantData";
import PageHeaderBanner from "../components/PageHeaderBanner";
import "./MyGarden.css";

import sproutSunbeamImg from "../assets/sprout-sunbeam.jpg";

function MyGarden({ onPageChange }) {
  const [plants, setPlants] = useState(() => {
    const saved = getSavedPlants();
    return Array.isArray(saved) && saved.length > 0 ? saved : defaultPlants;
  });

  useEffect(() => {
    savePlants(plants);
  }, [plants]);

  const [filter, setFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
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

  // Care tasks state
  const [careTasks, setCareTasks] = useState([
    { id: 1, title: "Water Rose", plant: "Rose", time: "Today, 5:00 PM", completed: false, icon: "💧" },
    { id: 2, title: "Check soil moisture", plant: "Tomato, Mint", time: "Today, 6:00 PM", completed: false, icon: "🌱" },
    { id: 3, title: "Remove dead leaves", plant: "Mint", time: "Today, 7:00 PM", completed: false, icon: "✂️" },
  ]);

  const toggleCareTask = (id) => {
    setCareTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // User Name
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null");
    } catch {
      return null;
    }
  })();
  const userName = user?.name || "Dattu";

  // Filter Plants
  const filteredPlants = plants.filter((plant) => {
    if (filter === "Healthy") return plant.statusType === "healthy";
    if (filter === "Needs Water") return plant.statusType === "warning";
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

  // Add Library Plant to Garden Handler
  const handleAddLibraryPlant = (libPlant) => {
    const exists = plants.some(
      (p) => p.name.toLowerCase() === libPlant.name.toLowerCase()
    );
    if (exists) return;

    const newPlant = {
      id: Date.now() + Math.floor(Math.random() * 1000),
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
    };

    const updated = [newPlant, ...plants];
    setPlants(updated);
    savePlants(updated);
    setToastMsg(`🌿 "${libPlant.name}" added to your garden!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Add Custom Plant Handler
  const handleAddCustomPlant = (e) => {
    e.preventDefault();
    const name = formName.trim();
    if (!name) return;

    const newPlant = {
      id: Date.now(),
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
    };

    const updated = [newPlant, ...plants];
    setPlants(updated);
    savePlants(updated);
    setFormName("");
    setShowAddForm(false);
    setToastMsg(`🌿 "${name}" added to your garden!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Water Plant Handler
  const handleWaterPlant = (id) => {
    const updated = plants.map((p) =>
      p.id === id
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

    if (selectedPlant && selectedPlant.id === id) {
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
  const handleRemovePlant = (id) => {
    const plant = plants.find((p) => p.id === id);
    if (!plant) return;
    if (window.confirm(`Remove ${plant.name} from your garden?`)) {
      const updated = plants.filter((p) => p.id !== id);
      setPlants(updated);
      savePlants(updated);
      if (selectedPlant && selectedPlant.id === id) {
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

        {/* Quote Card */}
        <div className="garden-metric-card quote-metric slow-popup animate-slow-pop" style={{ animationDelay: "240ms" }}>
          <div className="quote-metric-icon">🌿</div>
          <p className="quote-metric-text">
            "A well-cared garden brings peace to your mind."
          </p>
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
            </div>
          </div>

          {/* Plant Cards Grid */}
          <div className="plants-cards-grid">
            {filteredPlants.map((plant) => {
              const plantImg = plant.image || getPlantImage(plant.name);
              const isWarning = plant.statusType === "warning";

              return (
                <article
                  key={plant.id}
                  className="plant-card slow-popup animate-slow-pop"
                >
                  <div className="plant-card-media">
                    <img src={plantImg} alt={plant.name} className="plant-card-img" />
                    <span className={`plant-card-badge ${isWarning ? "warning" : "healthy"}`}>
                      ● {isWarning ? "Needs Water" : "Healthy"}
                    </span>
                  </div>

                  <div className="plant-card-body">
                    <div className="plant-title-wrap">
                      <h3 className="plant-name">{plant.name}</h3>
                      {plant.botanicalName && (
                        <span className="plant-botanical-sub">{plant.botanicalName}</span>
                      )}
                      <span className="plant-type">{plant.type}</span>
                    </div>

                    <div className="plant-specs-row">
                      <span className="spec-item">
                        <span className="spec-ico">☀️</span> {plant.sunlight}
                      </span>
                      <span className="spec-item">
                        <span className="spec-ico">💧</span> {plant.water}
                      </span>
                    </div>

                    {/* Moisture Progress Bar */}
                    <div className="moisture-track">
                      <div
                        className={`moisture-fill ${isWarning ? "warning" : "healthy"}`}
                        style={{ width: `${plant.moisture || (isWarning ? 30 : 80)}%` }}
                      />
                    </div>

                    <div className="plant-card-footer">
                      <span className="water-status-text">
                        {plant.watered || "Watered Today"}
                      </span>

                      <div className="card-actions-group">
                        <div className="card-menu-wrapper">
                          <button
                            type="button"
                            className="card-more-btn"
                            onClick={() =>
                              setActiveMenuId(activeMenuId === plant.id ? null : plant.id)
                            }
                            aria-label="More actions"
                          >
                            •••
                          </button>

                          {activeMenuId === plant.id && (
                            <div className="card-action-menu">
                              <button
                                type="button"
                                className="action-menu-item"
                                onClick={() => handleWaterPlant(plant.id)}
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
                                onClick={() => handleRemovePlant(plant.id)}
                              >
                                🗑️ Remove
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="card-view-btn slow-pop-btn"
                          onClick={() => setSelectedPlant(plant)}
                        >
                          View →
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
          <h2 className="insights-heading">📈 Garden Insights</h2>

          <div className="insights-list">
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

            {/* Insight 3 */}
            <div className="insight-item">
              <div className="insight-icon yellow">☀️</div>
              <div className="insight-info">
                <strong>Good sunlight conditions</strong>
                <small>Perfect for plant growth</small>
              </div>
            </div>

            {/* Insight 4 */}
            <div className="insight-item">
              <div className="insight-icon mint">🌿</div>
              <div className="insight-info">
                <strong>Keep adding more plants</strong>
                <small>A greener space awaits!</small>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* =========================================
          4. BOTTOM ROW (GROWTH, TODAY'S CARE, TIP)
          ========================================= */}
      <section className="garden-bottom-grid">
        {/* Column 1: Garden Growth Chart */}
        <article className="bottom-panel growth-panel slow-popup animate-slow-pop" style={{ animationDelay: "360ms" }}>
          <div className="growth-header">
            <h3 className="bottom-panel-title">Garden Growth</h3>
            <div className="growth-badge">
              <span className="growth-dot">●</span>
              <span>{totalPlants} plants</span>
              <span className="growth-rate">+50% this month</span>
            </div>
          </div>

          <div className="growth-chart-wrap">
            <div className="chart-y-axis">
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>
            <div className="chart-bars-area">
              <div className="chart-col">
                <div className="chart-bar" style={{ height: "20%" }} />
                <span className="chart-label">Apr</span>
              </div>
              <div className="chart-col">
                <div className="chart-bar" style={{ height: "35%" }} />
                <span className="chart-label">May</span>
              </div>
              <div className="chart-col">
                <div className="chart-bar" style={{ height: "45%" }} />
                <span className="chart-label">Jun</span>
              </div>
              <div className="chart-col">
                <div className="chart-bar" style={{ height: "60%" }} />
                <span className="chart-label">Jul</span>
              </div>
              <div className="chart-col">
                <div className="chart-bar" style={{ height: "75%" }} />
                <span className="chart-label">Aug</span>
              </div>
              <div className="chart-col current">
                <div className="chart-bar current-bar" style={{ height: "92%" }} />
                <span className="chart-label">Sep</span>
              </div>
            </div>
          </div>
        </article>

        {/* Column 2: Today's Care */}
        <article className="bottom-panel care-panel slow-popup animate-slow-pop" style={{ animationDelay: "420ms" }}>
          <div className="care-header">
            <h3 className="bottom-panel-title">🌱 Today's Care</h3>
          </div>

          <div className="care-tasks-list">
            {careTasks.map((task) => (
              <div
                key={task.id}
                className={`care-task-row ${task.completed ? "completed" : ""}`}
                onClick={() => toggleCareTask(task.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && toggleCareTask(task.id)}
              >
                <span className="care-task-icon">{task.icon}</span>
                <div className="care-task-info">
                  <strong className="care-task-name">{task.title}</strong>
                  <span className="care-task-desc">{task.plant}</span>
                </div>
                <span className="care-task-time">{task.time}</span>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleCareTask(task.id);
                  }}
                  className="care-task-checkbox"
                  aria-label={`Complete task ${task.title}`}
                />
              </div>
            ))}
          </div>
        </article>

        {/* Column 3: Garden Tip */}
        <article className="bottom-panel tip-panel slow-popup animate-slow-pop" style={{ animationDelay: "480ms" }}>
          <div className="tip-header">
            <h3 className="bottom-panel-title">💡 Garden Tip</h3>
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
          <span className="toast-icon">✨</span>
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
                <h3 className="modal-title-main">Add Plants to Your Garden 🌱</h3>
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
                    onChange={(e) => setFormType(e.target.value)}
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
                    Add Custom Plant 🌱
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
      {selectedPlant && (
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
                <span
                  className={`plant-card-badge ${
                    selectedPlant.statusType === "warning" ? "warning" : "healthy"
                  }`}
                >
                  ● {selectedPlant.status}
                </span>
              </div>

              <div className="plant-detail-meta">
                <div className="meta-badge-tag">{selectedPlant.type}</div>

                {selectedPlant.description && (
                  <p className="detail-desc-snippet">{selectedPlant.description}</p>
                )}

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
      )}
    </main>
  );
}

export default MyGarden;