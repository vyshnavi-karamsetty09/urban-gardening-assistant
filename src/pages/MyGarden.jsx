import { useEffect, useState } from "react";
import { getSavedPlants, savePlants } from "../utils";
import "./MyGarden.css";

function MyGarden({ onPageChange }) {
  const [plants, setPlants] = useState(() => getSavedPlants());
  useEffect(() => { savePlants(plants); }, [plants]);

  const [filter, setFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlantName, setNewPlantName] = useState("");

  const filteredPlants = plants.filter((plant) => {
    if (filter === "Healthy") {
      return plant.statusType === "healthy";
    }

    if (filter === "Needs Water") {
      return plant.statusType === "warning";
    }

    return true;
  });

  const addPlant = () => {
    const name = newPlantName.trim();

    if (!name) {
      return;
    }

    const newPlant = {
      id: Date.now(),
      name,
      type: "Garden Plant",
      emoji: "🌱",
      status: "Healthy",
      statusType: "healthy",
      sunlight: "6–8 hrs",
      water: "Daily",
      watered: "Today",
    };

    setPlants((previousPlants) => [
      ...previousPlants,
      newPlant,
    ]);

    setNewPlantName("");
    setShowAddForm(false);
  };

  const removePlant = (id) => {
    const plant = plants.find((item) => item.id === id);

    if (!plant) {
      return;
    }

    const confirmed = window.confirm(
      `Remove ${plant.name} from your garden?`
    );

    if (confirmed) {
      setPlants((previousPlants) =>
        previousPlants.filter((item) => item.id !== id)
      );
    }
  };

  const viewPlant = (plant) => {
    window.alert(
      `Plant: ${plant.name}\n\n` +
        `Type: ${plant.type}\n` +
        `Sunlight: ${plant.sunlight}\n` +
        `Water: ${plant.water}\n` +
        `Last watered: ${plant.watered}`
    );
  };

  return (
    <main className="my-garden-page">
      {/* Header */}
      <section className="garden-header">
        <div>
          <p className="garden-eyebrow">MY GARDEN</p>

          <h1>My Garden 🌿</h1>

          <p className="garden-subtitle">
            Keep track of your plants and their daily care needs.
          </p>
        </div>

        <button
          type="button"
          className="add-garden-btn"
          onClick={() => setShowAddForm(true)}
        >
          <span>+</span>
          Add Plant
        </button>
      </section>

      {/* Summary */}
      <section className="garden-summary">
        <div className="summary-card">
          <div className="summary-icon">🌱</div>

          <div>
            <div className="summary-number">{plants.length}</div>
            <div className="summary-label">Total Plants</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon healthy-icon">✓</div>

          <div>
            <div className="summary-number">
              {
                plants.filter(
                  (plant) => plant.statusType === "healthy"
                ).length
              }
            </div>

            <div className="summary-label">Healthy Plants</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon warning-icon">💧</div>

          <div>
            <div className="summary-number">
              {
                plants.filter(
                  (plant) => plant.statusType === "warning"
                ).length
              }
            </div>

            <div className="summary-label">Need Water</div>
          </div>
        </div>
      </section>

      {/* Garden heading */}
      <section className="garden-section">
        <div className="garden-heading">
          <div>
            <p className="garden-eyebrow">YOUR PLANTS</p>

            <h2>Plants in your garden</h2>

            <p>
              {plants.length}{" "}
              {plants.length === 1 ? "plant" : "plants"} in your
              garden
            </p>
          </div>

          <div className="filter-controls">
            <button
              type="button"
              className={`filter-btn ${
                filter === "All" ? "active" : ""
              }`}
              onClick={() => setFilter("All")}
            >
              All
            </button>

            <button
              type="button"
              className={`filter-btn ${
                filter === "Healthy" ? "active" : ""
              }`}
              onClick={() => setFilter("Healthy")}
            >
              Healthy
            </button>

            <button
              type="button"
              className={`filter-btn ${
                filter === "Needs Water" ? "active" : ""
              }`}
              onClick={() => setFilter("Needs Water")}
            >
              Needs Water
            </button>
          </div>
        </div>

        {/* Add plant form */}
        {showAddForm && (
          <div className="add-plant-panel">
            <div className="add-plant-panel-content">
              <label htmlFor="plant-name">
                Plant name
              </label>

              <input
                id="plant-name"
                type="text"
                value={newPlantName}
                onChange={(event) =>
                  setNewPlantName(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    addPlant();
                  }
                }}
                placeholder="e.g. Basil"
                autoFocus
              />
            </div>

            <div className="add-plant-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setNewPlantName("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-add-btn"
                onClick={addPlant}
              >
                Add Plant
              </button>
            </div>
          </div>
        )}

        {/* Plant grid */}
        {filteredPlants.length > 0 ? (
          <div className="plant-grid">
            {filteredPlants.map((plant) => (
              <article className="plant-card" key={plant.id}>
                <div className="plant-image">
                  <span className="plant-emoji">
                    {plant.emoji}
                  </span>

                  <span
                    className={`plant-status ${plant.statusType}`}
                  >
                    {plant.statusType === "healthy"
                      ? "✓"
                      : "!"}{" "}
                    {plant.status}
                  </span>
                </div>

                <div className="plant-details">
                  <div className="plant-name">
                    {plant.name}
                  </div>

                  <div className="plant-type">
                    {plant.type}
                  </div>

                  <div className="requirements">
                    <div className="requirement">
                      ☀️ {plant.sunlight}
                    </div>

                    <div className="requirement">
                      💧 {plant.water}
                    </div>
                  </div>

                  <div className="plant-bottom">
                    <span className="last-watered">
                      Watered: {plant.watered}
                    </span>

                    <div className="plant-actions">
                      <button
                        type="button"
                        className="view-btn"
                        onClick={() => viewPlant(plant)}
                      >
                        View →
                      </button>

                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removePlant(plant.id)}
                        aria-label={`Remove ${plant.name}`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-garden">
            <div className="empty-garden-icon">🌱</div>

            <h3>No plants found</h3>

            <p>
              Try another filter, or discover a plant from Smart Recommendations.
            </p>

            <button
              type="button"
              className="empty-add-btn"
              onClick={() => {
                if (onPageChange) {
                  onPageChange("recommendations");
                } else {
                  setFilter("All");
                  setShowAddForm(true);
                }
              }}
            >
              Add Plant
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default MyGarden;