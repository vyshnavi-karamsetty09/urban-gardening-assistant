import { useEffect, useState } from "react";
import { STORAGE_KEYS, getSavedPlants, getSavedTasks, saveTasks, savePlants } from "../utils";
import "./Dashboard.css";
import earlyBlightThumb from "../assets/diseases/early-blight.jpg";
import powderyMildewThumb from "../assets/diseases/powdery-mildew.jpg";
import spiderMitesThumb from "../assets/diseases/spider-mites.jpg";
import aphidsThumb from "../assets/diseases/aphids.jpg";

function Dashboard({ onPageChange }) {

  /* =========================================
     DASHBOARD STATE
     ========================================= */

  const [tasks, setTasks] = useState(() => getSavedTasks());
  const [plants, setPlants] = useState(() => getSavedPlants());
  const [recommendationAdded, setRecommendationAdded] = useState(() =>
    getSavedPlants().some((plant) => plant.name === "Snake Plant")
  );

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    savePlants(plants);
  }, [plants]);

  const environment = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.environment) || "null");
    } catch {
      return null;
    }
  })();



  /* =========================================
     NAVIGATION
     ========================================= */

  const goToRecommendations = () => {
    if (onPageChange) {
      onPageChange("recommendations");
    }
  };

  const goToMyGarden = () => {
    if (onPageChange) {
      onPageChange("mygarden");
    }
  };

  const goToEnvironment = () => {
    if (onPageChange) {
      onPageChange("environment");
    }
  };

  const goToDiseaseDetection = (symptom = "") => {
    if (onPageChange) {
      onPageChange("diseasedetection", symptom ? { symptom } : null);
    }
  };


  /* =========================================
     TASK HANDLERS
     ========================================= */

  const toggleTask = (taskId) => {

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
  };


  /* =========================================
     RECOMMENDATION HANDLER
     ========================================= */

  const addRecommendedPlant = () => {
    if (recommendationAdded) {
      goToMyGarden();
      return;
    }
    const plant = {
      id: Date.now(),
      name: "Snake Plant",
      type: "Indoor Plant",
      emoji: "🌿",
      status: "Healthy",
      statusType: "healthy",
      sunlight: "Low Light",
      water: "1–2 times/week",
      watered: "Not yet",
    };
    if (!plants.some((item) => item.name.toLowerCase() === plant.name.toLowerCase())) {
      setPlants((current) => [...current, plant]);
    }
    setRecommendationAdded(true);
  };


  /* =========================================
     DYNAMIC DASHBOARD VALUES
     ========================================= */

  const totalPlants = plants.length;

  const newSuggestions = recommendationAdded ? 4 : 5;

  const pendingTasks = tasks.filter(
    (task) => !task.completed
  ).length;


  const wateringTaskCompleted = tasks.some(
    (task) =>
      task.type === "water" &&
      task.completed
  );


  const needsWater = wateringTaskCompleted ? 0 : 4;


  return (
    <div className="dashboard-page">

      {/* =========================================
          TOP HEADER
          ========================================= */}

      <header className="dashboard-header">

        <div className="dashboard-heading">

          <span className="dashboard-eyebrow">
            YOUR GARDEN DASHBOARD
          </span>

          <h1>
            Good Morning, {(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null")?.name || "Gardener"; } catch { return "Gardener"; } })()}! <span>🌿</span>
          </h1>

          <p>
            Let's make today a great day for your garden.
          </p>

        </div>


        <div className="dashboard-header-actions">
          <button
            type="button"
            className="dash-action-btn scan"
            onClick={() => goToDiseaseDetection()}
            title="Scan a plant leaf with AI"
          >
            <span>📷</span>
            <strong>Quick Scan Leaf</strong>
          </button>

          <button
            type="button"
            className="dash-action-btn add"
            onClick={goToMyGarden}
            title="Add or view garden plants"
          >
            <span>➕</span>
            <strong>Add Plant</strong>
          </button>
        </div>

      </header>


      {/* =========================================
          SUMMARY CARDS
          ========================================= */}

      <section className="dashboard-summary">

        <article className="summary-card">

          <div className="summary-icon plant">
            🌿
          </div>

          <div>
            <span>Total Plants</span>

            <strong>{totalPlants}</strong>

            <small>In your garden</small>
          </div>

        </article>


        <article className="summary-card">

          <div className="summary-icon task">
            ✓
          </div>

          <div>
            <span>Tasks Today</span>

            <strong>{pendingTasks}</strong>

            <small>Pending tasks</small>
          </div>

        </article>


        <article className="summary-card">

          <div className="summary-icon water">
            💧
          </div>

          <div>
            <span>Needs Water</span>

            <strong>{needsWater}</strong>

            <small>Plants</small>
          </div>

        </article>


        <article
          className="summary-card summary-card-clickable"
          onClick={() => goToDiseaseDetection()}
          title="Open Disease Detection & Plant Health"
        >

          <div className="summary-icon health">
            🔍
          </div>

          <div>
            <span>Plant Health</span>

            <strong>Good</strong>

            <small className="summary-card-link">Diagnose →</small>
          </div>

        </article>


        <article className="summary-card">

          <div className="summary-icon suggestion">
            🌱
          </div>

          <div>
            <span>New Suggestions</span>

            <strong>{newSuggestions}</strong>

            <small>For your garden</small>
          </div>

        </article>

      </section>


      {/* =========================================
          MAIN DASHBOARD GRID
          ========================================= */}

      <section className="dashboard-grid">


        {/* =====================================
            RECOMMENDED PLANT
            ===================================== */}

        <article className="dashboard-card recommended-card">

          <div className="card-heading">

            <h2>
              Recommended For You
            </h2>

            <button
              type="button"
              onClick={goToRecommendations}
              className="text-button"
            >
              View All
            </button>

          </div>


          <div className="recommended-content">

            <div className="recommended-image">
              🌿
            </div>


            <div className="recommended-details">

              <h3>
                Snake Plant
              </h3>

              <span className="easy-tag">
                Easy to Grow
              </span>

              <p>
                Perfect for your environment.
                Low-light tolerant and easy to
                maintain.
              </p>


              <div className="plant-info">

                <span>
                  ☀️ &nbsp;Low Light
                </span>

                <span>
                  💧 &nbsp;Water 1–2 times/week
                </span>

                <span>
                  🌡️ &nbsp;20–30°C
                </span>

              </div>


              <button
                type="button"
                className="dashboard-action-button"
                onClick={addRecommendedPlant}
              >
                {recommendationAdded
                  ? "Added to My Garden ✓"
                  : "Add to My Garden"}
              </button>

            </div>

          </div>

        </article>


        {/* =====================================
            TODAY'S TASKS
            ===================================== */}

        <article className="dashboard-card tasks-card">

          <div className="card-heading">

            <h2>
              Today's Tasks
            </h2>

            <button
              type="button"
              className="text-button"
              onClick={() => onPageChange && onPageChange("scheduler")}
            >
              View All
            </button>

          </div>


          <div className="tasks-list">

            {tasks.map((task) => (

              <div
                className="task-item"
                key={task.id}
              >

                <div
                  className={`task-icon ${
                    task.type === "water"
                      ? "water-task"
                      : task.type === "fertilizer"
                      ? "fertilizer-task"
                      : "prune-task"
                  }`}
                >
                  {task.type === "water"
                    ? "💧"
                    : task.type === "fertilizer"
                    ? "🌱"
                    : "✂"}
                </div>


                <div
                  className="task-content"
                  style={{
                    opacity: task.completed ? 0.55 : 1,
                  }}
                >

                  <strong
                    style={{
                      textDecoration: task.completed
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {task.title}
                  </strong>

                  <small
                    style={{
                      textDecoration: task.completed
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {task.description}
                  </small>

                </div>


                <span
                  className="task-time"
                  style={{
                    textDecoration: task.completed
                      ? "line-through"
                      : "none",
                  }}
                >
                  {task.time}
                </span>


                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />

              </div>

            ))}

          </div>

        </article>

        {/* =====================================
            WEATHER
            ===================================== */}

        <article className="dashboard-card weather-card">

          <div className="card-heading">

            <h2>
              Weather & Environment
            </h2>

            <button
              type="button"
              onClick={goToEnvironment}
              className="text-button"
            >
              View Details
            </button>

          </div>


          <div className="weather-main">

            <div className="weather-temperature">

              <span>
                ☀️
              </span>

              <strong>
                28°C
              </strong>

              <small>
                Partly Cloudy
              </small>

            </div>


            <div className="weather-details">

              <div>
                <span>Humidity</span>
                <strong>65%</strong>
              </div>

              <div>
                <span>Sunlight</span>
                <strong>Good</strong>
              </div>

              <div>
                <span>Wind</span>
                <strong>12 km/h</strong>
              </div>

            </div>

          </div>


          <div className="weather-tip">

            <strong>
              Great weather for your plants!
            </strong>

            <span>
              Perfect time for watering in the morning.
            </span>

            <span className="weather-tip-icon">
              🌱
            </span>

          </div>

        </article>

      </section>


      {/* =========================================
          DISEASE DETECTION & HEALTH CHECK
          ========================================= */}

      <section className="disease-dashboard-card">

        <div className="disease-dashboard-header">

          <div>

            <span className="dashboard-eyebrow">
              PLANT CARE & DIAGNOSTICS
            </span>

            <h2>
              Disease Detection & Health Check 🔍
            </h2>

            <p>
              Spot yellow leaves, brown spots, powdery mold, or pests? Run an AI leaf scan or select symptoms to get organic remedies.
            </p>

          </div>

          <button
            type="button"
            className="disease-action-btn"
            onClick={() => goToDiseaseDetection()}
          >
            📷 Open AI Scanner →
          </button>

        </div>


        <div className="disease-dashboard-body">

          {/* Visual disease preview thumbnails */}
          <div className="dashboard-disease-gallery">
            <button
              type="button"
              className="disease-thumb-card"
              onClick={() => goToDiseaseDetection("Brown or black spots")}
            >
              <img src={earlyBlightThumb} alt="Early Blight" className="dash-disease-thumb" />
              <div className="dash-disease-thumb-info">
                <strong>Early Blight</strong>
                <small>Leaf Spots</small>
              </div>
            </button>

            <button
              type="button"
              className="disease-thumb-card"
              onClick={() => goToDiseaseDetection("White powdery coating")}
            >
              <img src={powderyMildewThumb} alt="Powdery Mildew" className="dash-disease-thumb" />
              <div className="dash-disease-thumb-info">
                <strong>Powdery Mildew</strong>
                <small>White Coating</small>
              </div>
            </button>

            <button
              type="button"
              className="disease-thumb-card"
              onClick={() => goToDiseaseDetection("Fine webbing on undersides")}
            >
              <img src={spiderMitesThumb} alt="Spider Mites" className="dash-disease-thumb" />
              <div className="dash-disease-thumb-info">
                <strong>Spider Mites</strong>
                <small>Webs & Spots</small>
              </div>
            </button>

            <button
              type="button"
              className="disease-thumb-card"
              onClick={() => goToDiseaseDetection("Clusters of tiny green/black bugs")}
            >
              <img src={aphidsThumb} alt="Aphids" className="dash-disease-thumb" />
              <div className="dash-disease-thumb-info">
                <strong>Aphids & Pests</strong>
                <small>Sap Suckers</small>
              </div>
            </button>
          </div>

          <div className="quick-symptoms-section">

            <span className="quick-label">
              Quick Diagnose by Symptom:
            </span>

            <div className="symptom-chips-row">

              <button
                type="button"
                className="dashboard-symptom-chip"
                onClick={() => goToDiseaseDetection("Yellowing leaves")}
              >
                🍃 Yellowing leaves
              </button>

              <button
                type="button"
                className="dashboard-symptom-chip"
                onClick={() => goToDiseaseDetection("Brown or black spots")}
              >
                🟤 Brown or black spots
              </button>

              <button
                type="button"
                className="dashboard-symptom-chip"
                onClick={() => goToDiseaseDetection("White powdery coating")}
              >
                ❄️ White powdery mold
              </button>

              <button
                type="button"
                className="dashboard-symptom-chip"
                onClick={() => goToDiseaseDetection("Fine webbing on undersides")}
              >
                🕸️ Spider mite webbing
              </button>

              <button
                type="button"
                className="dashboard-symptom-chip"
                onClick={() => goToDiseaseDetection("Clusters of tiny green/black bugs")}
              >
                🐛 Aphids & pests
              </button>

            </div>

          </div>


          <div className="disease-alert-badge">

            <span className="alert-badge-icon">
              💡
            </span>

            <div>

              <strong>
                Balcony Gardening Health Tip:
              </strong>

              <span>
                Avoid overhead watering in the evening. Wet foliage overnight encourages fungal leaf spots and powdery mildew.
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          ENVIRONMENT SETUP
          ========================================= */}

      <section className="environment-dashboard-card">

        <div className="environment-dashboard-header">

          <div>

            <span className="dashboard-eyebrow">
              YOUR GARDEN ENVIRONMENT
            </span>

            <h2>
              Environment Setup 🌱
            </h2>

            <p>
              Your saved environment is being used for
              personalized plant recommendations.
            </p>

          </div>

          <button
            type="button"
            className="outline-action-button"
            onClick={goToEnvironment}
          >
            Edit Setup
          </button>

        </div>


        <div className="environment-info-grid">

          <div>
            <span>Pincode</span>
            <strong>{environment?.pincode || "Not set"}</strong>
          </div>

          <div>
            <span>Location</span>
            <strong>{environment?.location || "Not set"}</strong>
          </div>

          <div>
            <span>Available Space</span>
            <strong>{environment?.space || "Not set"}</strong>
          </div>

          <div>
            <span>Sunlight</span>
            <strong>{environment?.sunlight || "Not set"}</strong>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;