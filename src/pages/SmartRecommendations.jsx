import { useState, useMemo } from "react";
import { LIBRARY_PLANTS, getPlantImage } from "../plantData";
import { getSavedPlants, savePlants, STORAGE_KEYS } from "../utils";
import PageHeaderBanner from "../components/PageHeaderBanner";
import "./SmartRecommendations.css";

const LOCATION_OPTIONS = [
  { value: "Balcony", icon: "🏡", desc: "Sunny or shaded outdoor balcony" },
  { value: "Terrace", icon: "🪴", desc: "Spacious open rooftop or terrace" },
  { value: "Indoor", icon: "🪟", desc: "Bright windowsill or room interior" },
];

const SPACE_OPTIONS = [
  { value: "Small", icon: "🌱", desc: "A few compact pots (1–5 plants)" },
  { value: "Medium", icon: "🌿", desc: "Planter boxes & railing pots (6–15 plants)" },
  { value: "Large", icon: "🌳", desc: "Spacious garden or multi-tier racks" },
];

const SUNLIGHT_OPTIONS = [
  { value: "Low Light", icon: "☁️", desc: "0–2 hours indirect daylight" },
  { value: "Medium Light", icon: "⛅", desc: "3–5 hours morning or filtered sun" },
  { value: "High Light", icon: "☀️", desc: "6+ hours bright direct sunlight" },
  { value: "Full Sun", icon: "🌞", desc: "6–8+ hours open intense sun" },
];

const MEDIUM_OPTIONS = [
  { value: "Soil", icon: "🌱", desc: "Traditional nutrient-rich garden soil" },
  { value: "Potting Mix", icon: "🪴", desc: "Aerated, well-draining container mix" },
  { value: "Cocopeat", icon: "🥥", desc: "Moisture-retentive organic coconut coir" },
  { value: "Hydroponics", icon: "💧", desc: "Soilless liquid nutrient culture" },
];

function SmartRecommendations({ onPageChange, initialTab = "matches" }) {
  // Tab state: "matches" (AI recommendations) or "weather" (Weather & Environment)
  const [activeTab, setActiveTab] = useState(
    initialTab === "environment" ? "weather" : "matches"
  );

  // Environment Settings State
  const [environment, setEnvironment] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.environment);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return {
      pincode: "500081",
      location: "Balcony",
      space: "Medium",
      sunlight: "Full Sun",
      temperature: "20°C - 30°C",
      climate: "Tropical",
      humidity: "Medium",
      medium: "Potting Mix",
    };
  });

  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState(null);
  const [envSaved, setEnvSaved] = useState(false);
  const [savedPlants, setSavedPlants] = useState(() => getSavedPlants());

  // Show temporary toast notification
  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Update a single environment field & auto-save to localStorage
  const handleUpdateField = (field, value) => {
    setEnvironment((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem(STORAGE_KEYS.environment, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    setEnvSaved(false);
  };

  // Explicit Save Handler
  const handleSaveEnvironment = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.environment, JSON.stringify(environment));
      setEnvSaved(true);
      showToast("🌿 Environment settings saved successfully!");
      setTimeout(() => setEnvSaved(false), 2500);
    } catch {
      // ignore
    }
  };

  // Compute AI Match Score and personalized reason for each library plant
  const scoredRecommendations = useMemo(() => {
    const sun = (environment.sunlight || "").toLowerCase();
    const loc = (environment.location || "").toLowerCase();
    const space = (environment.space || "").toLowerCase();
    const med = (environment.medium || "").toLowerCase();

    return LIBRARY_PLANTS.map((plant) => {
      let score = 75; // base compatibility
      let reasons = [];

      // Sunlight scoring
      const plantSun = plant.sunlight.toLowerCase();
      if (sun.includes("full") || sun.includes("high")) {
        if (plantSun.includes("full") || plantSun.includes("direct") || plantSun.includes("bright")) {
          score += 15;
          reasons.push(`Flourishes under your ${environment.sunlight} exposure`);
        } else {
          score += 6;
        }
      } else if (sun.includes("medium")) {
        if (plantSun.includes("partial") || plantSun.includes("morning") || plantSun.includes("4–6")) {
          score += 16;
          reasons.push(`Perfect for moderate ${environment.sunlight}`);
        } else {
          score += 7;
        }
      } else {
        // Low light
        if (plant.category === "Herbs" || plant.category === "Succulents" || plant.name.includes("Spinach")) {
          score += 14;
          reasons.push("Tolerates low light and shaded corners");
        } else {
          score -= 6;
        }
      }

      // Space scoring
      if (space.includes("small")) {
        if (plant.category === "Herbs" || plant.category === "Succulents") {
          score += 6;
          reasons.push(`Compact root system ideal for ${environment.space} spaces`);
        }
      } else {
        score += 5;
      }

      // Location scoring
      if (loc.includes("indoor")) {
        if (plant.name.includes("Aloe") || plant.name.includes("Basil") || plant.name.includes("Mint") || plant.name.includes("Jasmine")) {
          score += 5;
          reasons.push("Adapts cleanly to indoor container microclimates");
        } else {
          score -= 4;
        }
      } else {
        score += 4;
      }

      // Medium scoring
      if (med.includes("hydroponics") && (plant.name.includes("Mint") || plant.name.includes("Spinach"))) {
        score += 5;
        reasons.push("Exceptional candidate for soilless hydroponics");
      }

      const finalScore = Math.min(98, Math.max(74, score));
      const reasonText = reasons.length > 0
        ? reasons.join(" • ")
        : `Well-suited for your ${environment.location} setup in ${environment.climate} conditions`;

      return {
        ...plant,
        matchScore: finalScore,
        matchReason: reasonText,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [environment]);

  // Filter recommendations by category & search query
  const filteredMatches = useMemo(() => {
    return scoredRecommendations.filter((plant) => {
      const matchesCat =
        filterCategory === "All" || plant.category === filterCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        plant.name.toLowerCase().includes(query) ||
        plant.botanicalName.toLowerCase().includes(query) ||
        plant.category.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [scoredRecommendations, filterCategory, searchQuery]);

  // Add Recommended Plant to My Garden
  const handleAddToGarden = (plant) => {
    const current = getSavedPlants();
    const alreadyInGarden = current.some(
      (p) => p.name.toLowerCase() === plant.name.toLowerCase()
    );

    if (alreadyInGarden) {
      showToast(`ℹ️ "${plant.name}" is already in your garden!`);
      return;
    }

    const newGardenPlant = {
      id: Date.now() + Math.floor(Math.random() * 1000),
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
      sunlight: plant.sunlight,
      water: plant.water,
      watered: "Watered Today",
      moisture: 85,
      image: plant.image || getPlantImage(plant.name),
      description: plant.description,
      careTips: plant.careTips,
    };

    const updated = [newGardenPlant, ...current];
    savePlants(updated);
    setSavedPlants(updated);
    showToast(`🌿 "${plant.name}" added to My Garden!`);
  };

  return (
    <main className="smart-rec-page">
      {/* =========================================
          1. HERO HEADER BANNER
          ========================================= */}
      <PageHeaderBanner
        eyebrow="AI BOTANICAL ENGINE & ENVIRONMENT INTELLIGENCE"
        title="Smart Recommendations"
        titleAccent="✦"
        subtitle="Personalized plant matches calibrated to your balcony, sunlight exposure, and real-time microclimate."
        badgeIcon="⛅"
        badgeTitle="28°C • Sunny & Clear"
        badgeSubtitle={`📍 ${environment.pincode || "500081"} • ${environment.climate} • ${environment.sunlight}`}
      />

      {/* =========================================
          2. UNIFIED TAB SWITCHER BAR
          ========================================= */}
      <nav className="smart-tab-bar slow-popup animate-slow-pop" style={{ animationDelay: "60ms" }}>
        <button
          type="button"
          className={`smart-tab-btn ${activeTab === "matches" ? "active" : ""}`}
          onClick={() => setActiveTab("matches")}
        >
          <span className="tab-ico">✦</span>
          <strong>AI Plant Matches</strong>
          <span className="tab-counter">{filteredMatches.length}</span>
        </button>

        <button
          type="button"
          className={`smart-tab-btn ${activeTab === "weather" ? "active" : ""}`}
          onClick={() => setActiveTab("weather")}
        >
          <span className="tab-ico">⛅</span>
          <strong>Weather & Environment Setup</strong>
          <span className="tab-status-pill">Active Profile</span>
        </button>
      </nav>

      {/* =========================================
          TAB 1: AI PLANT MATCHES
          ========================================= */}
      {activeTab === "matches" && (
        <div className="matches-view-container">
          {/* Quick Environment Snapshot Strip */}
          <div className="env-snapshot-strip slow-popup animate-slow-pop" style={{ animationDelay: "100ms" }}>
            <div className="snapshot-chips">
              <div className="snapshot-chip">
                <span className="chip-ico">📍</span>
                <div>
                  <small>Pincode</small>
                  <strong>{environment.pincode || "500081"}</strong>
                </div>
              </div>

              <div className="snapshot-chip">
                <span className="chip-ico">🏡</span>
                <div>
                  <small>Location</small>
                  <strong>{environment.location}</strong>
                </div>
              </div>

              <div className="snapshot-chip">
                <span className="chip-ico">📐</span>
                <div>
                  <small>Growing Space</small>
                  <strong>{environment.space} Space</strong>
                </div>
              </div>

              <div className="snapshot-chip">
                <span className="chip-ico">☀️</span>
                <div>
                  <small>Sunlight</small>
                  <strong>{environment.sunlight}</strong>
                </div>
              </div>

              <div className="snapshot-chip">
                <span className="chip-ico">🌱</span>
                <div>
                  <small>Medium</small>
                  <strong>{environment.medium}</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="modify-env-btn slow-pop-btn"
              onClick={() => setActiveTab("weather")}
            >
              ⚙ Edit Environment
            </button>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="matches-filter-row animate-slow-pop" style={{ animationDelay: "140ms" }}>
            <div className="rec-search-box">
              <span className="rec-search-ico">🔍</span>
              <input
                type="search"
                placeholder="Search recommended vegetables, flowers, herbs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

            <div className="rec-category-pills">
              {["All", "Vegetables", "Flowers", "Herbs", "Succulents"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`rec-cat-btn ${filterCategory === cat ? "active" : ""}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat === "All" ? "All Matches" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Real Photo Recommendations Grid */}
          <section className="recommendations-real-grid">
            {filteredMatches.map((plant, idx) => {
              const inGarden = savedPlants.some(
                (p) => p.name.toLowerCase() === plant.name.toLowerCase()
              );

              return (
                <article
                  key={plant.id}
                  className="rec-plant-card slow-popup animate-slow-pop"
                  style={{ animationDelay: `${160 + idx * 35}ms` }}
                >
                  <div className="rec-card-media">
                    <img
                      src={plant.image || getPlantImage(plant.name)}
                      alt={plant.name}
                      className="rec-card-img"
                    />
                    <div className="rec-badges-overlay">
                      <span className="match-score-badge">
                        ★ {plant.matchScore}% Match
                      </span>
                      <span className={`cat-pill-badge ${plant.category.toLowerCase()}`}>
                        {plant.category}
                      </span>
                    </div>
                  </div>

                  <div className="rec-card-body">
                    <div className="rec-name-block">
                      <h3 className="rec-plant-name">{plant.name}</h3>
                      <span className="rec-botanical-name">{plant.botanicalName}</span>
                    </div>

                    <div className="rec-match-reason">
                      <span className="reason-spark">💡</span>
                      <p>{plant.matchReason}</p>
                    </div>

                    <div className="rec-specs-chips">
                      <span className="spec-chip">
                        ☀️ {plant.sunlight.split(" ")[0]}
                      </span>
                      <span className="spec-chip">
                        💧 {plant.water.split(" ")[0]}
                      </span>
                      <span className="spec-chip">
                        🌡️ {plant.temp}
                      </span>
                      <span className="spec-chip difficulty">
                        {plant.difficulty}
                      </span>
                    </div>

                    <div className="rec-card-footer">
                      {inGarden ? (
                        <span className="in-garden-status">
                          ✓ In Your Garden
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="add-to-garden-btn slow-pop-btn"
                          onClick={() => handleAddToGarden(plant)}
                        >
                          + Add to My Garden
                        </button>
                      )}

                      <button
                        type="button"
                        className="rec-view-guide-btn"
                        onClick={() => {
                          if (onPageChange) {
                            onPageChange("library");
                          }
                        }}
                      >
                        Care Guide →
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      )}

      {/* =========================================
          TAB 2: WEATHER & ENVIRONMENT SETUP
          ========================================= */}
      {activeTab === "weather" && (
        <div className="weather-env-view-container animate-slow-pop">
          {/* Live Microclimate Dashboard */}
          <section className="live-weather-card slow-popup">
            <div className="weather-card-header">
              <div className="weather-header-text">
                <span className="weather-kicker">LIVE MICROCLIMATE SENSOR</span>
                <h2>Garden Weather Conditions</h2>
                <p>Real-time atmospheric readings tailored to pincode {environment.pincode || "500081"}.</p>
              </div>
              <div className="weather-condition-tag">
                <span>☀️ Sunny & Optimal Growing Day</span>
              </div>
            </div>

            <div className="weather-metrics-grid">
              <div className="weather-metric-box">
                <div className="metric-box-icon yellow">☀️</div>
                <div>
                  <span className="metric-val">28°C / 82°F</span>
                  <small>Ambient Temperature</small>
                </div>
              </div>

              <div className="weather-metric-box">
                <div className="metric-box-icon blue">💧</div>
                <div>
                  <span className="metric-val">62% Humidity</span>
                  <small>Ideal Transpiration</small>
                </div>
              </div>

              <div className="weather-metric-box">
                <div className="metric-box-icon green">⛅</div>
                <div>
                  <span className="metric-val">7.2 hrs Daylight</span>
                  <small>Strong Photosynthesis</small>
                </div>
              </div>

              <div className="weather-metric-box">
                <div className="metric-box-icon mint">🍃</div>
                <div>
                  <span className="metric-val">AQI 42 (Good)</span>
                  <small>Clean Oxygen Flow</small>
                </div>
              </div>
            </div>

            <div className="weather-advice-banner">
              <span className="advice-ico">💡</span>
              <p>
                <strong>Pro Weather Tip:</strong> Warm midday sun forecasted. Water your container pots early before 9:00 AM or after 5:30 PM to minimize moisture evaporation and guard against root stress.
              </p>
            </div>
          </section>

          {/* Interactive Environment Configurator */}
          <section className="env-configurator-card slow-popup">
            <div className="config-card-header">
              <div>
                <h2>Your Growing Environment Setup</h2>
                <p>Customize your space, sunlight, and climate settings to instantly calibrate AI plant matches.</p>
              </div>

              <button
                type="button"
                className="save-env-top-btn slow-pop-btn"
                onClick={handleSaveEnvironment}
              >
                {envSaved ? "Saved ✓" : "Save Settings"}
              </button>
            </div>

            {/* Pincode Row */}
            <div className="config-group">
              <label htmlFor="pincode-input" className="config-label">
                📍 Garden Location Pincode (India)
              </label>
              <div className="pincode-input-wrap">
                <input
                  id="pincode-input"
                  type="text"
                  maxLength={6}
                  value={environment.pincode}
                  placeholder="e.g. 500081, 560001, 110001"
                  onChange={(e) =>
                    handleUpdateField("pincode", e.target.value.replace(/\D/g, ""))
                  }
                  className="config-text-input"
                />
                <span className="pincode-badge">Region Calibrated ✓</span>
              </div>
            </div>

            {/* 1. Garden Location */}
            <div className="config-group">
              <span className="config-label">1. Where is your garden located?</span>
              <div className="options-selection-grid">
                {LOCATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`env-opt-card ${environment.location === opt.value ? "selected" : ""}`}
                    onClick={() => handleUpdateField("location", opt.value)}
                  >
                    {environment.location === opt.value && (
                      <span className="opt-check">✓</span>
                    )}
                    <span className="opt-ico">{opt.icon}</span>
                    <strong className="opt-title">{opt.value}</strong>
                    <span className="opt-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Growing Space */}
            <div className="config-group">
              <span className="config-label">2. How much growing space do you have?</span>
              <div className="options-selection-grid">
                {SPACE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`env-opt-card ${environment.space === opt.value ? "selected" : ""}`}
                    onClick={() => handleUpdateField("space", opt.value)}
                  >
                    {environment.space === opt.value && (
                      <span className="opt-check">✓</span>
                    )}
                    <span className="opt-ico">{opt.icon}</span>
                    <strong className="opt-title">{opt.value} Space</strong>
                    <span className="opt-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Sunlight Exposure */}
            <div className="config-group">
              <span className="config-label">3. How much natural sunlight does the space receive?</span>
              <div className="options-selection-grid cols-4">
                {SUNLIGHT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`env-opt-card ${environment.sunlight === opt.value ? "selected" : ""}`}
                    onClick={() => handleUpdateField("sunlight", opt.value)}
                  >
                    {environment.sunlight === opt.value && (
                      <span className="opt-check">✓</span>
                    )}
                    <span className="opt-ico">{opt.icon}</span>
                    <strong className="opt-title">{opt.value}</strong>
                    <span className="opt-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Climate & Temperature */}
            <div className="config-group">
              <span className="config-label">4. Local Climate & Atmospheric Range</span>
              <div className="dropdowns-triple-grid">
                <div className="dropdown-box">
                  <label htmlFor="temp-select">Temperature Range</label>
                  <select
                    id="temp-select"
                    value={environment.temperature}
                    onChange={(e) => handleUpdateField("temperature", e.target.value)}
                  >
                    <option value="10°C - 20°C">Cool (10°C – 20°C)</option>
                    <option value="20°C - 30°C">Warm (20°C – 30°C)</option>
                    <option value="30°C - 40°C">Hot (30°C – 40°C)</option>
                  </select>
                </div>

                <div className="dropdown-box">
                  <label htmlFor="climate-select">Climate Type</label>
                  <select
                    id="climate-select"
                    value={environment.climate}
                    onChange={(e) => handleUpdateField("climate", e.target.value)}
                  >
                    <option value="Tropical">Tropical (Humid & Warm)</option>
                    <option value="Subtropical">Subtropical (Mild Winters)</option>
                    <option value="Arid / Dry">Arid / Dry (Low Moisture)</option>
                    <option value="Temperate">Temperate (Moderate Seasons)</option>
                  </select>
                </div>

                <div className="dropdown-box">
                  <label htmlFor="humidity-select">Humidity Level</label>
                  <select
                    id="humidity-select"
                    value={environment.humidity}
                    onChange={(e) => handleUpdateField("humidity", e.target.value)}
                  >
                    <option value="Low">Low Humidity (&lt; 40%)</option>
                    <option value="Medium">Medium Humidity (40% – 70%)</option>
                    <option value="High">High Humidity (&gt; 70%)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 5. Growing Medium */}
            <div className="config-group">
              <span className="config-label">5. Growing Medium & Substrate</span>
              <div className="options-selection-grid cols-4">
                {MEDIUM_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`env-opt-card ${environment.medium === opt.value ? "selected" : ""}`}
                    onClick={() => handleUpdateField("medium", opt.value)}
                  >
                    {environment.medium === opt.value && (
                      <span className="opt-check">✓</span>
                    )}
                    <span className="opt-ico">{opt.icon}</span>
                    <strong className="opt-title">{opt.value}</strong>
                    <span className="opt-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="config-footer-actions">
              <button
                type="button"
                className="save-and-generate-btn slow-pop-btn"
                onClick={() => {
                  handleSaveEnvironment();
                  setActiveTab("matches");
                }}
              >
                Save & View AI Matches (✦ {scoredRecommendations.length}) →
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Floating Notification Toast */}
      {toastMsg && (
        <div className="rec-floating-toast slow-popup">
          <span className="toast-ico">✨</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </main>
  );
}

export default SmartRecommendations;