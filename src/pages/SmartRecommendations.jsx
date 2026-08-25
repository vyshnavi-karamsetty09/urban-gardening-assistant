import { useEffect, useState } from "react";
import "./SmartRecommendations.css";
import { getPlantRecommendations, getSavedPlants, savePlants } from "../utils";

function SmartRecommendations({ onPageChange }) {
  const [environment, setEnvironment] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  /*
   * Load saved environment information.
   */
  useEffect(() => {
    loadEnvironment();
  }, []);

  const loadEnvironment = () => {
    try {
      const savedData = localStorage.getItem("environmentSetup");

      if (!savedData) {
        setEnvironment(null);
        return;
      }

      const parsedData = JSON.parse(savedData);

      setEnvironment({
        pincode: parsedData.pincode || "",
        location: parsedData.location || "",
        space: parsedData.space || "",
        sunlight: parsedData.sunlight || "",
        temperature: parsedData.temperature || "",
        climate: parsedData.climate || "",
        humidity: parsedData.humidity || "",
        medium: parsedData.medium || "",
      });
    } catch (err) {
      console.error("Could not load environment settings:", err);
      setEnvironment(null);
    }
  };

  /*
   * Navigate to Environment Setup.
   */
  const handleUpdateEnvironment = () => {
    if (onPageChange) {
      onPageChange("environment");
    }
  };

  /*
   * Get recommendations from the backend.
   */
  const handleGetRecommendations = async () => {
    if (!environment) {
      setError("Please complete your environment setup first.");
      return;
    }
    if (!/^[0-9]{6}$/.test(String(environment.pincode))) {
      setError("Please add a valid 6-digit pincode in Environment Setup.");
      return;
    }

    setLoading(true);
    setError("");
    setRecommendations([]);
    setHasSearched(true);

    try {
      let results = [];
      try {
        const response = await fetch("/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pincode: String(environment.pincode),
            location: environment.location,
            space: environment.space,
            sunlight: environment.sunlight,
          }),
        });
        const text = await response.text();
        if (response.ok && text.trim()) {
          const data = JSON.parse(text);
          results = Array.isArray(data.recommendations) ? data.recommendations : [];
        }
      } catch (backendError) {
        console.info("Recommendation API unavailable; using local matching.", backendError);
      }

      if (results.length === 0) {
        results = getPlantRecommendations(environment);
      }

      setRecommendations(results);
    } catch (err) {
      console.error("Recommendation error:", err);
      setError("We couldn't generate recommendations. Please review your environment and try again.");
    } finally {
      setLoading(false);
    }
  };

  const addToMyGarden = (plant) => {
    const plants = getSavedPlants();
    const name = plant.name || plant.plant_name || "Recommended Plant";
    if (plants.some((item) => item.name.toLowerCase() === name.toLowerCase())) return;
    const next = [...plants, {
      id: Date.now(),
      name,
      type: plant.type || plant.category || "Garden Plant",
      emoji: plant.emoji || plant.icon || "🌱",
      status: "Healthy",
      statusType: "healthy",
      sunlight: plant.sunlight || plant.sun || "Suitable sunlight",
      water: plant.water || plant.watering || "Regular",
      watered: "Not yet",
    }];
    savePlants(next);
    setRecommendations((current) => current.map((item) =>
      item === plant ? { ...item, _added: true } : item
    ));
  };

  /*
   * If no environment has been saved yet.
   */
  if (!environment) {
    return (
      <main className="recommendations-page">
        <section className="recommendations-header">
          <div>
            <p className="recommendations-eyebrow">
              PERSONALIZED GARDENING
            </p>

            <h1>
              Smart Recommendations <span>✦</span>
            </h1>

            <p className="recommendations-subtitle">
              Find plants that are suited to your garden
              environment and available space.
            </p>
          </div>
        </section>

        <section className="setup-empty-card">
          <div className="setup-empty-icon">🌱</div>

          <div className="setup-empty-content">
            <p className="card-eyebrow">GET STARTED</p>

            <h2>Set up your garden environment</h2>

            <p>
              Tell us about your location, available space,
              sunlight, climate, and growing conditions.
              We'll use this information to find suitable
              plants for you.
            </p>

            <button
              type="button"
              className="primary-action-btn"
              onClick={handleUpdateEnvironment}
            >
              Set Up Environment →
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="recommendations-page">

      {/* =========================================
          HEADER
          ========================================= */}

      <section className="recommendations-header">
        <div>
          <p className="recommendations-eyebrow">
            PERSONALIZED GARDENING
          </p>

          <h1>
            Smart Recommendations <span>✦</span>
          </h1>

          <p className="recommendations-subtitle">
            Find plants that are suited to your garden
            environment and available space.
          </p>
        </div>

        <div className="environment-status">
          <span className="status-check">✓</span>
          Environment ready
        </div>
      </section>


      {/* =========================================
          ENVIRONMENT PROFILE
          ========================================= */}

      <section className="profile-card">

        <div className="profile-header">

          <div className="profile-heading">
            <p className="card-eyebrow">
              YOUR GARDEN PROFILE
            </p>

            <h2>Your Environment</h2>

            <p>
              These settings will be used to find plants
              suitable for your garden.
            </p>
          </div>

          <button
            type="button"
            className="update-environment-btn"
            onClick={handleUpdateEnvironment}
          >
            <span>⚙</span>
            Update Environment
          </button>

        </div>


        <div className="environment-grid">

          <EnvironmentItem
            icon="📍"
            label="Pincode"
            value={environment.pincode}
          />

          <EnvironmentItem
            icon="🏡"
            label="Location"
            value={environment.location}
          />

          <EnvironmentItem
            icon="📐"
            label="Available Space"
            value={environment.space}
          />

          <EnvironmentItem
            icon="☀️"
            label="Sunlight"
            value={environment.sunlight}
          />

          <EnvironmentItem
            icon="🌡️"
            label="Temperature"
            value={environment.temperature}
          />

          <EnvironmentItem
            icon="🌿"
            label="Climate"
            value={environment.climate}
          />

          <EnvironmentItem
            icon="💧"
            label="Humidity"
            value={environment.humidity}
          />

          <EnvironmentItem
            icon="🪴"
            label="Growing Medium"
            value={environment.medium}
          />

        </div>

      </section>


      {/* =========================================
          RECOMMENDATION ACTION
          ========================================= */}

      <section className="recommendation-action">

        <div className="action-icon">
          ✦
        </div>

        <div className="action-content">

          <p className="card-eyebrow">
            READY TO GROW?
          </p>

          <h2>
            Find plants made for your garden.
          </h2>

          <p>
            We'll use your saved environment to find
            plants that are a good match for your space
            and growing conditions.
          </p>

        </div>

        <button
          type="button"
          className="get-recommendations-btn"
          onClick={handleGetRecommendations}
          disabled={loading}
        >
          {loading
            ? "Finding Plants..."
            : "Get Plant Recommendations →"}
        </button>

      </section>


      {/* =========================================
          ERROR
          ========================================= */}

      {error && (
        <section className="recommendation-error">

          <div className="error-icon">
            ⚠
          </div>

          <div>
            <strong>
              Couldn't get recommendations
            </strong>

            <p>{error}</p>
          </div>

          <button
            type="button"
            className="retry-btn"
            onClick={handleGetRecommendations}
            disabled={loading}
          >
            Try Again
          </button>

        </section>
      )}


      {/* =========================================
          RESULTS
          ========================================= */}

      {hasSearched &&
        !loading &&
        !error &&
        recommendations.length > 0 && (
          <section className="results-section">

            <div className="results-header">
              <div>
                <p className="card-eyebrow">
                  PERSONALIZED FOR YOU
                </p>

                <h2>
                  Recommended for Your Garden
                </h2>

                <p>
                  These plants match the environment
                  information you provided.
                </p>
              </div>

              <span className="results-count">
                {recommendations.length} plants
              </span>
            </div>


            <div className="recommendation-grid">

              {recommendations.map((plant, index) => (
                <RecommendationCard
                  key={`${plant.name || "plant"}-${index}`}
                  plant={plant}
                  onAdd={addToMyGarden}
                />
              ))}

            </div>

          </section>
        )}


      {/* =========================================
          EMPTY RESULTS
          ========================================= */}

      {hasSearched &&
        !loading &&
        !error &&
        recommendations.length === 0 && (
          <section className="no-results-card">

            <div className="no-results-icon">
              🌱
            </div>

            <h2>
              No matching plants found
            </h2>

            <p>
              We couldn't find suitable recommendations
              for the current environment settings.
              Try updating your environment and searching
              again.
            </p>

            <button
              type="button"
              className="secondary-action-btn"
              onClick={handleUpdateEnvironment}
            >
              Update Environment
            </button>

          </section>
        )}


      {/* =========================================
          WHY RECOMMENDATIONS
          ========================================= */}

      {!hasSearched && (
        <section className="why-section">

          <div className="why-header">
            <p className="card-eyebrow">
              SMART MATCHING
            </p>

            <h2>
              Why these recommendations?
            </h2>

            <p>
              Your environment information helps us
              find plants that are more likely to thrive
              in your garden.
            </p>
          </div>

          <div className="why-grid">

            <WhyItem
              icon="☀️"
              title="Sunlight match"
              text="Considers how much sunlight your garden receives."
            />

            <WhyItem
              icon="📐"
              title="Space match"
              text="Considers the amount of growing space available."
            />

            <WhyItem
              icon="🌡️"
              title="Climate match"
              text="Uses your temperature and climate conditions."
            />

            <WhyItem
              icon="🌱"
              title="Growing match"
              text="Considers your growing medium and humidity."
            />

          </div>

        </section>
      )}

    </main>
  );
}


/* =========================================
   ENVIRONMENT ITEM
   ========================================= */

function EnvironmentItem({ icon, label, value }) {
  return (
    <div className="environment-item">

      <div className="environment-item-icon">
        {icon}
      </div>

      <div className="environment-item-content">

        <span>
          {label}
        </span>

        <strong>
          {value || "Not set"}
        </strong>

      </div>

    </div>
  );
}


/* =========================================
   RECOMMENDATION CARD
   ========================================= */

function RecommendationCard({ plant, onAdd }) {
  const name =
    plant.name ||
    plant.plant_name ||
    "Recommended Plant";

  const type =
    plant.type ||
    plant.category ||
    plant.plant_type ||
    "Garden Plant";

  const sunlight =
    plant.sunlight ||
    plant.sun ||
    "Suitable sunlight";

  const water =
    plant.water ||
    plant.watering ||
    plant.water_requirement ||
    "Regular";

  const difficulty =
    plant.difficulty ||
    plant.level ||
    "Easy";

  const emoji =
    plant.emoji ||
    plant.icon ||
    "🌱";

  return (
    <article className="recommendation-card">

      <div className="recommendation-plant-icon">
        {emoji}
      </div>

      <div className="recommendation-card-body">

        <div className="recommendation-card-top">

          <div>
            <h3>{name}</h3>

            <p>{type}</p>
          </div>

          <span className="difficulty-badge">
            {difficulty}
          </span>

        </div>


        <div className="plant-requirements">

          <span>
            ☀️ {sunlight}
          </span>

          <span>
            💧 {water}
          </span>

        </div>


        <button
          type="button"
          className="add-plant-result-btn"
          onClick={() => onAdd(plant)}
          disabled={plant._added}
        >
          {plant._added ? "Added to My Garden ✓" : "Add to My Garden"}
        </button>

      </div>

    </article>
  );
}


/* =========================================
   WHY ITEM
   ========================================= */

function WhyItem({ icon, title, text }) {
  return (
    <div className="why-item">

      <div className="why-icon">
        {icon}
      </div>

      <div>
        <h3>{title}</h3>

        <p>{text}</p>
      </div>

    </div>
  );
}


export default SmartRecommendations;