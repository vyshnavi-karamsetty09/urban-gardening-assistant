import "./Dashboard.css";

function Dashboard({ onPageChange }) {

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
            Good Morning, Gardener! <span>🌿</span>
          </h1>

          <p>
            Let's make today a great day for your garden.
          </p>

        </div>


        <div className="dashboard-header-actions">

          <div className="weather-mini">

            <span className="weather-mini-icon">
              ☀️
            </span>

            <div>
              <strong>28°C</strong>
              <small>Today</small>
            </div>

          </div>


          <button
            type="button"
            className="notification-button"
          >
            ♧
            <span>3</span>
          </button>


          <button
            type="button"
            className="profile-button"
          >
            <span className="profile-icon">
              👤
            </span>

            <strong>Gardener</strong>

            <span className="profile-arrow">
             ⌄
            </span>
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

            <strong>12</strong>

            <small>In your garden</small>
          </div>

        </article>


        <article className="summary-card">

          <div className="summary-icon task">
            ✓
          </div>

          <div>
            <span>Tasks Today</span>

            <strong>3</strong>

            <small>Pending tasks</small>
          </div>

        </article>


        <article className="summary-card">

          <div className="summary-icon water">
            💧
          </div>

          <div>
            <span>Needs Water</span>

            <strong>4</strong>

            <small>Plants</small>
          </div>

        </article>


        <article className="summary-card">

          <div className="summary-icon health">
            ♡
          </div>

          <div>
            <span>Plant Health</span>

            <strong>Good</strong>

            <small>Overall status</small>
          </div>

        </article>


        <article className="summary-card">

          <div className="summary-icon suggestion">
            🌱
          </div>

          <div>
            <span>New Suggestions</span>

            <strong>5</strong>

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
                onClick={goToMyGarden}
              >
                Add to My Garden
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
            >
              View All
            </button>

          </div>


          <div className="tasks-list">

            <div className="task-item">

              <div className="task-icon water-task">
                💧
              </div>

              <div className="task-content">

                <strong>
                  Water 4 plants
                </strong>

                <small>
                  Monstera, Tulsi, Aloe Vera & Mint
                </small>

              </div>

              <span className="task-time">
                9:00 AM
              </span>

              <input
                type="checkbox"
                className="task-checkbox"
              />

            </div>


            <div className="task-item">

              <div className="task-icon fertilizer-task">
                🌱
              </div>

              <div className="task-content">

                <strong>
                  Fertilize your plants
                </strong>

                <small>
                  Use organic fertilizer for better growth
                </small>

              </div>

              <span className="task-time">
                11:00 AM
              </span>

              <input
                type="checkbox"
                className="task-checkbox"
              />

            </div>


            <div className="task-item">

              <div className="task-icon prune-task">
                ✂
              </div>

              <div className="task-content">

                <strong>
                  Prune dead leaves
                </strong>

                <small>
                  Remove yellow leaves from your plants
                </small>

              </div>

              <span className="task-time">
                4:00 PM
              </span>

              <input
                type="checkbox"
                className="task-checkbox"
              />

            </div>

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
            <strong>523001</strong>
          </div>

          <div>
            <span>Location</span>
            <strong>Indoor</strong>
          </div>

          <div>
            <span>Available Space</span>
            <strong>Medium</strong>
          </div>

          <div>
            <span>Sunlight</span>
            <strong>Full Sun</strong>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;