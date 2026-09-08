import { useEffect, useState } from "react";
import { STORAGE_KEYS, getSavedPlants, getSavedTasks, saveTasks, savePlants } from "../utils";
import PageHeaderBanner from "../components/PageHeaderBanner";
import "./Dashboard.css";

import basilPotImg from "../assets/basil-pot.jpg";
import seedlingHandsImg from "../assets/seedling-hands.jpg";
import wateringSmartlyImg from "../assets/watering-smartly.jpg";
import plantTomatoImg from "../assets/plant-tomato.jpg";
import plantMintImg from "../assets/plant-mint.jpg";
import plantAloeImg from "../assets/plant-aloe.jpg";
import plantCurryImg from "../assets/plant-curry.jpg";

const RECOMMENDED_PLANTS = [
  {
    id: "basil",
    name: "Basil (Tulsi)",
    badge: "Easy to Grow",
    description: "Purifies air, repels insects and perfect for home gardens.",
    sunlight: "Needs 4-6 hours sunlight",
    water: "Water 2-3 times/week",
    season: "Best season: All year",
    image: basilPotImg,
  },
  {
    id: "mint",
    name: "Fresh Mint",
    badge: "Fast Growing",
    description: "Aromatic herb great for teas, garnishing and pest deterrence.",
    sunlight: "Needs 3-5 hours sunlight",
    water: "Water 3-4 times/week",
    season: "Best season: Spring & Summer",
    image: plantMintImg,
  },
  {
    id: "aloe",
    name: "Aloe Vera",
    badge: "Low Maintenance",
    description: "Healing succulent that thrives in warm sunny balcony spots.",
    sunlight: "Needs 4-6 hours sunlight",
    water: "Water once every 7 days",
    season: "Best season: All year",
    image: plantAloeImg,
  },
  {
    id: "tomato",
    name: "Cherry Tomato",
    badge: "High Yield",
    description: "Rewarding container crop producing sweet juicy cherry tomatoes.",
    sunlight: "Needs 6-8 hours direct sun",
    water: "Water daily in mornings",
    season: "Best season: Warm months",
    image: plantTomatoImg,
  },
];

const CARE_TIPS = [
  {
    id: "water",
    title: "Water Smartly",
    desc: "Water early in the morning to keep plants fresh and healthy.",
    image: wateringSmartlyImg,
  },
  {
    id: "sunlight",
    title: "Sunlight Secrets",
    desc: "Rotate your balcony pots every week for even 360-degree growth.",
    image: basilPotImg,
  },
  {
    id: "soil",
    title: "Soil Drainage",
    desc: "Ensure pots have drainage holes so roots get oxygen without rotting.",
    image: seedlingHandsImg,
  },
  {
    id: "pest",
    title: "Natural Pest Defense",
    desc: "Spray diluted neem oil once a fortnight to ward off aphids & mites.",
    image: plantMintImg,
  },
];

function Dashboard({ onPageChange }) {
  /* =========================================
     STATE
     ========================================= */
  const [tasks, setTasks] = useState(() => getSavedTasks());
  const [plants, setPlants] = useState(() => getSavedPlants());
  const [recIndex, setRecIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [addedRecs, setAddedRecs] = useState({});

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    savePlants(plants);
  }, [plants]);

  // Session user
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null");
    } catch {
      return null;
    }
  })();
  const userName = user?.name || "Dattu";

  /* =========================================
     NAVIGATION HANDLERS
     ========================================= */
  const goToRecommendations = () => {
    if (onPageChange) onPageChange("recommendations");
  };

  const goToMyGarden = () => {
    if (onPageChange) onPageChange("mygarden");
  };

  const goToDiseaseDetection = (symptom = "") => {
    if (onPageChange) onPageChange("diseasedetection", symptom ? { symptom } : null);
  };

  /* =========================================
     TASK ACTIONS
     ========================================= */
  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  /* =========================================
     RECOMMENDATIONS CAROUSEL
     ========================================= */
  const activeRec = RECOMMENDED_PLANTS[recIndex];
  const isCurrentRecAdded = addedRecs[activeRec.id];

  const handlePrevRecommendation = () => {
    setRecIndex((prev) => (prev === 0 ? RECOMMENDED_PLANTS.length - 1 : prev - 1));
  };

  const handleNextRecommendation = () => {
    setRecIndex((prev) => (prev === RECOMMENDED_PLANTS.length - 1 ? 0 : prev + 1));
  };

  const handleAddActiveRec = () => {
    if (isCurrentRecAdded) {
      goToMyGarden();
      return;
    }
    const newPlant = {
      id: Date.now(),
      name: activeRec.name,
      type: "Herb",
      emoji: "🌿",
      status: "Healthy",
      statusType: "healthy",
      sunlight: activeRec.sunlight,
      water: activeRec.water,
      watered: "Today",
    };
    setPlants((prev) => [...prev, newPlant]);
    setAddedRecs((prev) => ({ ...prev, [activeRec.id]: true }));
  };

  /* =========================================
     GARDEN PLANTS LIST (BOTTOM ROW)
     ========================================= */
  const gardenPlantsDisplay = [
    { id: 1, name: "Tomato", status: "Healthy", statusType: "healthy", image: plantTomatoImg },
    { id: 2, name: "Mint", status: "Healthy", statusType: "healthy", image: plantMintImg },
    { id: 3, name: "Aloe Vera", status: "Growing", statusType: "growing", image: plantAloeImg },
    { id: 4, name: "Curry Leaf", status: "Healthy", statusType: "healthy", image: plantCurryImg },
  ];

  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const totalPlants = Math.max(5, plants.length);
  const activeTip = CARE_TIPS[tipIndex];

  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="dashboard-page">
      {/* =========================================
          1. HERO BANNER
          ========================================= */}
      <PageHeaderBanner
        eyebrow="URBAN BALCONY INTELLIGENCE & DAILY OVERVIEW"
        title={`${timeGreeting}, ${userName}!`}
        titleAccent="👋"
        subtitle="Your garden is a step closer to a greener tomorrow. Track growth, watering schedules, and microclimate."
        badgeIcon="⛅"
        badgeTitle="28°C • Sunny & Clear"
        badgeSubtitle={`📍 500081 • Balcony • ${totalPlants} Plants Active`}
      />

      {/* =========================================
          2. METRIC CARDS (4 TOP STATS)
          ========================================= */}
      <section className="dash-metrics-grid">
        {/* Card 1: Plants in Garden */}
        <div
          className="metric-card metric-green slow-popup animate-slow-pop"
          style={{ animationDelay: "60ms" }}
          onClick={goToMyGarden}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && goToMyGarden()}
        >
          <div className="metric-icon-circle green">
            <span className="metric-icon">🌱</span>
          </div>
          <div className="metric-details">
            <span className="metric-value">{totalPlants}</span>
            <span className="metric-label">Plants in Garden</span>
          </div>
          <span className="metric-arrow">›</span>
        </div>

        {/* Card 2: Upcoming Tasks */}
        <div
          className="metric-card metric-coral slow-popup animate-slow-pop"
          style={{ animationDelay: "120ms" }}
          onClick={() => onPageChange && onPageChange("scheduler")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onPageChange && onPageChange("scheduler")}
        >
          <div className="metric-icon-circle coral">
            <span className="metric-icon">📅</span>
          </div>
          <div className="metric-details">
            <span className="metric-value">{pendingTasks}</span>
            <span className="metric-label">Upcoming Tasks</span>
          </div>
          <span className="metric-arrow">›</span>
        </div>

        {/* Card 3: Soil Moisture */}
        <div
          className="metric-card metric-blue slow-popup animate-slow-pop"
          style={{ animationDelay: "180ms" }}
          onClick={() => onPageChange && onPageChange("environment")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onPageChange && onPageChange("environment")}
        >
          <div className="metric-icon-circle blue">
            <span className="metric-icon">💧</span>
          </div>
          <div className="metric-details">
            <span className="metric-value">Good</span>
            <span className="metric-label">Soil Moisture</span>
          </div>
          <span className="metric-arrow">›</span>
        </div>

        {/* Card 4: Plant Health */}
        <div
          className="metric-card metric-purple slow-popup animate-slow-pop"
          style={{ animationDelay: "240ms" }}
          onClick={() => goToDiseaseDetection()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && goToDiseaseDetection()}
        >
          <div className="metric-icon-circle purple">
            <span className="metric-icon">💜</span>
          </div>
          <div className="metric-details">
            <span className="metric-value">Healthy</span>
            <span className="metric-label">Plant Health</span>
          </div>
          <span className="metric-arrow">›</span>
        </div>
      </section>

      {/* =========================================
          3. MIDDLE ROW (3 COLUMNS)
          ========================================= */}
      <section className="dash-middle-grid">
        {/* Col 1: Recommended for You */}
        <article className="dash-panel recommended-panel slow-popup animate-slow-pop" style={{ animationDelay: "300ms" }}>
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Recommended for You</h2>
              <p className="panel-subtitle">Based on your location, season and garden conditions.</p>
            </div>
            <button type="button" className="panel-link-btn" onClick={goToRecommendations}>
              View All
            </button>
          </div>

          <div className="recommended-body">
            <div className="rec-image-carousel">
              <button
                type="button"
                className="rec-nav-arrow prev"
                onClick={handlePrevRecommendation}
                aria-label="Previous recommended plant"
              >
                ‹
              </button>
              <img src={activeRec.image} alt={activeRec.name} className="rec-plant-img" />
              <button
                type="button"
                className="rec-nav-arrow next"
                onClick={handleNextRecommendation}
                aria-label="Next recommended plant"
              >
                ›
              </button>
              <div className="rec-dots">
                {RECOMMENDED_PLANTS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`rec-dot ${recIndex === idx ? "active" : ""}`}
                    onClick={() => setRecIndex(idx)}
                    aria-label={`Select recommendation ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="rec-info-col">
              <div className="rec-title-row">
                <h3 className="rec-plant-name">{activeRec.name}</h3>
                <span className="rec-badge">{activeRec.badge}</span>
              </div>
              <p className="rec-description">{activeRec.description}</p>
              <ul className="rec-specs-list">
                <li>
                  <span className="spec-icon">☀️</span> {activeRec.sunlight}
                </li>
                <li>
                  <span className="spec-icon">💧</span> {activeRec.water}
                </li>
                <li>
                  <span className="spec-icon">🌱</span> {activeRec.season}
                </li>
              </ul>
              <button
                type="button"
                className="rec-add-btn slow-pop-btn"
                onClick={handleAddActiveRec}
              >
                {isCurrentRecAdded ? "Added to My Garden ✓" : "Add to My Garden +"}
              </button>
            </div>
          </div>
        </article>

        {/* Col 2: Today's Tasks */}
        <article className="dash-panel tasks-panel slow-popup animate-slow-pop" style={{ animationDelay: "360ms" }}>
          <div className="panel-header">
            <h2 className="panel-title">Today's Tasks</h2>
            <button
              type="button"
              className="panel-link-btn"
              onClick={() => onPageChange && onPageChange("scheduler")}
            >
              View All
            </button>
          </div>

          <div className="tasks-scroll-list">
            {tasks.map((task) => {
              const iconColor =
                task.type === "water"
                  ? "water"
                  : task.type === "fertilizer"
                  ? "fertilizer"
                  : task.type === "prune"
                  ? "prune"
                  : "moisture";

              return (
                <div
                  key={task.id}
                  className={`task-row slow-popup ${task.completed ? "completed" : ""}`}
                  onClick={() => toggleTask(task.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && toggleTask(task.id)}
                >
                  <div className={`task-row-icon ${iconColor}`}>
                    <span>{task.icon || (task.type === "water" ? "💧" : task.type === "fertilizer" ? "🌱" : "✂️")}</span>
                  </div>
                  <div className="task-row-details">
                    <strong className="task-row-title">{task.title}</strong>
                    <span className="task-row-sub">{task.description}</span>
                  </div>
                  <span className="task-row-time">{task.time}</span>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleTask(task.id);
                    }}
                    className="task-row-check"
                    aria-label={`Mark task ${task.title} as completed`}
                  />
                </div>
              );
            })}
          </div>
        </article>

        {/* Col 3: Weather & Inspiration Column */}
        <div className="dash-weather-column animate-slow-pop" style={{ animationDelay: "420ms" }}>
          {/* Dark Forest Weather Card */}
          <article className="dash-panel dark-weather-panel slow-popup">
            <div className="dark-weather-header">
              <h2 className="dark-weather-title">Weather & Environment</h2>
              <span className="dark-weather-location">📍 Hyderabad</span>
            </div>

            <div className="dark-weather-center">
              <div className="dark-temp-block">
                <span className="dark-sun-icon">☀️</span>
                <div>
                  <div className="dark-temp-val">28°C</div>
                  <div className="dark-temp-desc">Mostly Sunny</div>
                </div>
              </div>
              <div className="dark-weather-stats">
                <div className="dark-stat-item">
                  <span className="stat-label">💧 Humidity</span>
                  <span className="stat-val">62%</span>
                </div>
                <div className="dark-stat-item">
                  <span className="stat-label">💨 Wind</span>
                  <span className="stat-val">12 km/h</span>
                </div>
                <div className="dark-stat-item">
                  <span className="stat-label">🍃 Air Quality</span>
                  <span className="stat-val good">Good</span>
                </div>
              </div>
            </div>

            <div
              className="dark-weather-alert slow-popup"
              onClick={() => onPageChange && onPageChange("environment")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onPageChange && onPageChange("environment")}
            >
              <div className="alert-check-icon">✓</div>
              <div className="alert-text-block">
                <strong>Great weather for gardening!</strong>
                <small>Perfect time to water and fertilize your plants.</small>
              </div>
              <span className="alert-chevron">›</span>
            </div>
          </article>

          {/* Inspirational Seedling Card */}
          <article className="inspirational-card slow-popup">
            <div className="inspire-content">
              <span className="inspire-sprout">🌱</span>
              <p className="inspire-text">
                Small steps<br />
                grow big change. 🌿
              </p>
            </div>
            <img
              src={seedlingHandsImg}
              alt="Caring hands holding seedling"
              className="inspire-img"
            />
          </article>
        </div>
      </section>

      {/* =========================================
          4. BOTTOM ROW (3 COLUMNS)
          ========================================= */}
      <section className="dash-bottom-grid">
        {/* Col 1: Your Garden */}
        <article className="dash-panel your-garden-panel slow-popup animate-slow-pop" style={{ animationDelay: "480ms" }}>
          <div className="panel-header">
            <h2 className="panel-title">Your Garden</h2>
            <button type="button" className="panel-link-btn" onClick={goToMyGarden}>
              View Garden →
            </button>
          </div>

          <div className="garden-cards-row">
            {gardenPlantsDisplay.map((plant) => (
              <div
                key={plant.id}
                className="garden-plant-thumb-card slow-popup"
                onClick={goToMyGarden}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && goToMyGarden()}
              >
                <div className="plant-thumb-img-wrapper">
                  <img src={plant.image} alt={plant.name} className="plant-thumb-img" />
                </div>
                <strong className="plant-thumb-name">{plant.name}</strong>
                <span className={`plant-status-badge ${plant.statusType}`}>
                  {plant.status}
                </span>
              </div>
            ))}

            {/* Add Plant Card */}
            <button
              type="button"
              className="garden-add-card slow-popup"
              onClick={goToMyGarden}
              title="Add a new plant to your garden"
            >
              <div className="garden-add-icon">+</div>
              <span className="garden-add-label">Add Plant</span>
            </button>
          </div>
        </article>

        {/* Col 2: Plant Care Tips */}
        <article className="dash-panel care-tips-panel slow-popup animate-slow-pop" style={{ animationDelay: "540ms" }}>
          <div className="panel-header">
            <h2 className="panel-title">Plant Care Tips</h2>
            <button
              type="button"
              className="panel-link-btn"
              onClick={() => onPageChange && onPageChange("assistant")}
            >
              See More
            </button>
          </div>

          <div className="tip-card-body">
            <div className="tip-img-wrapper">
              <img src={activeTip.image} alt={activeTip.title} className="tip-img" />
            </div>
            <div className="tip-text-content">
              <h3 className="tip-title">{activeTip.title}</h3>
              <p className="tip-desc">{activeTip.desc}</p>
            </div>
          </div>
          <div className="tip-dots">
            {CARE_TIPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`tip-dot ${tipIndex === idx ? "active" : ""}`}
                onClick={() => setTipIndex(idx)}
                aria-label={`Select tip ${idx + 1}`}
              />
            ))}
          </div>
        </article>

        {/* Col 3: Quick Actions */}
        <article className="dash-panel quick-actions-panel slow-popup animate-slow-pop" style={{ animationDelay: "600ms" }}>
          <div className="panel-header">
            <h2 className="panel-title">Quick Actions</h2>
            <span className="quick-actions-leaf-decor">🌿</span>
          </div>

          <div className="quick-actions-2x2">
            {/* Action 1: Identify Plant */}
            <button
              type="button"
              className="quick-action-tile slow-popup"
              onClick={() => goToDiseaseDetection()}
              title="Scan image to identify plant & diseases"
            >
              <div className="action-tile-icon green">
                <span>🌱</span>
              </div>
              <div className="action-tile-text">
                <strong>Identify Plant</strong>
                <small>(Scan Image)</small>
              </div>
            </button>

            {/* Action 2: Schedule Care */}
            <button
              type="button"
              className="quick-action-tile slow-popup"
              onClick={() => onPageChange && onPageChange("scheduler")}
              title="Open Daily Watering & Care Scheduler"
            >
              <div className="action-tile-icon coral">
                <span>📅</span>
              </div>
              <div className="action-tile-text">
                <strong>Schedule Care</strong>
              </div>
            </button>

            {/* Action 3: Browse Plants */}
            <button
              type="button"
              className="quick-action-tile slow-popup"
              onClick={goToRecommendations}
              title="Explore Plant Library & Smart Recommendations"
            >
              <div className="action-tile-icon mint">
                <span>📖</span>
              </div>
              <div className="action-tile-text">
                <strong>Browse Plants</strong>
              </div>
            </button>

            {/* Action 4: Join Community */}
            <button
              type="button"
              className="quick-action-tile slow-popup"
              onClick={() => onPageChange && onPageChange("assistant")}
              title="Ask Garden Assistant & Connect with Gardeners"
            >
              <div className="action-tile-icon purple">
                <span>👥</span>
              </div>
              <div className="action-tile-text">
                <strong>Join Community</strong>
              </div>
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;