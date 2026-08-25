import { useMemo, useState } from "react";
import "./EnvironmentSetup.css";

const locationOptions = [
  {
    value: "Balcony",
    icon: "🏡",
    description: "Small outdoor space",
  },
  {
    value: "Terrace",
    icon: "🪴",
    description: "Open terrace garden",
  },
  {
    value: "Indoor",
    icon: "🪟",
    description: "Inside your home",
  },
];

const spaceOptions = [
  {
    value: "Small",
    icon: "🌱",
    description: "A few pots",
  },
  {
    value: "Medium",
    icon: "🌿",
    description: "Several plants",
  },
  {
    value: "Large",
    icon: "🌳",
    description: "Lots of growing space",
  },
];

const sunlightOptions = [
  {
    value: "Low Light",
    icon: "☁️",
    description: "0 - 2 hours",
  },
  {
    value: "Medium Light",
    icon: "⛅",
    description: "3 - 5 hours",
  },
  {
    value: "High Light",
    icon: "☀️",
    description: "6+ hours",
  },
  {
    value: "Full Sun",
    icon: "🌞",
    description: "Direct sunlight",
  },
];

const mediumOptions = [
  {
    value: "Soil",
    icon: "🌱",
    description: "Traditional garden soil",
  },
  {
    value: "Potting Mix",
    icon: "🪴",
    description: "Potting soil mix",
  },
  {
    value: "Cocopeat",
    icon: "🥥",
    description: "Coconut coir based",
  },
  {
    value: "Hydroponics",
    icon: "💧",
    description: "Soilless water culture",
  },
];

function OptionCards({ options, value, onChange }) {
  return (
    <div className="cards-grid">
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={`option-card ${
            value === option.value ? "selected" : ""
          }`}
          onClick={() => onChange(option.value)}
        >
          {value === option.value && (
            <span className="check-badge">✓</span>
          )}

          <span className="card-icon">{option.icon}</span>

          <span className="option-title">
            {option.value}
          </span>

          <span className="option-description">
            {option.description}
          </span>
        </button>
      ))}
    </div>
  );
}

function EnvironmentSetup({ onPageChange }) {
  const [environment, setEnvironment] = useState(() => {
    try {
      const savedData = localStorage.getItem("environmentSetup");

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        return {
          pincode: parsedData.pincode || "",
          location: parsedData.location || "Balcony",
          space: parsedData.space || "Small",
          sunlight: parsedData.sunlight || "Medium Light",
          temperature:
            parsedData.temperature || "20°C - 30°C",
          climate: parsedData.climate || "Tropical",
          humidity: parsedData.humidity || "Medium",
          medium: parsedData.medium || "Soil",
        };
      }
    } catch (error) {
      console.error(
        "Could not load environment settings:",
        error
      );
    }

    return {
      pincode: "",
      location: "Balcony",
      space: "Small",
      sunlight: "Medium Light",
      temperature: "20°C - 30°C",
      climate: "Tropical",
      humidity: "Medium",
      medium: "Soil",
    };
  });

  const [saved, setSaved] = useState(false);

  const updateEnvironment = (field, value) => {
    setEnvironment((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);
  };

  const progress = useMemo(() => {
    let completed = 0;

    if (/^[0-9]{6}$/.test(environment.pincode)) completed++;
    if (environment.location) completed++;
    if (environment.space) completed++;
    if (environment.sunlight) completed++;
    if (environment.temperature) completed++;
    if (environment.climate) completed++;
    if (environment.humidity) completed++;
    if (environment.medium) completed++;

    return Math.round((completed / 8) * 100);
  }, [environment]);

  const handleSave = () => {
    if (!/^[0-9]{6}$/.test(environment.pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    if (
      !environment.location ||
      !environment.space ||
      !environment.sunlight ||
      !environment.temperature ||
      !environment.climate ||
      !environment.humidity ||
      !environment.medium
    ) {
      alert("Please complete all steps before continuing.");
      return;
    }

    try {
      localStorage.setItem(
        "environmentSetup",
        JSON.stringify(environment)
      );

      setSaved(true);

      setTimeout(() => {
        if (onPageChange) {
          onPageChange("recommendations");
        }
      }, 700);
    } catch (error) {
      console.error(
        "Could not save environment settings:",
        error
      );

      alert("Could not save your environment settings.");
    }
  };

  return (
    <div className="environment-page">

      {/* Heading */}
      <div className="page-heading">
        <div className="heading-left">
          <p className="page-eyebrow">
            GARDEN PROFILE
          </p>

          <h1>
            Environment Setup <span>🌱</span>
          </h1>

          <p className="heading-description">
            Tell us about your gardening environment so we can
            give you personalized plant recommendations and care
            tips.
          </p>
        </div>

        <div className="progress-box">
          <div className="progress-circle">
            <svg
              viewBox="0 0 36 36"
              className="circular-chart"
            >
              <path
                className="circle-bg"
                d="
                  M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831
                "
              />

              <path
                className="circle"
                strokeDasharray={`${progress}, 100`}
                d="
                  M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831
                "
              />
            </svg>
          </div>

          <div>
            <span className="progress-label">
              SETUP PROGRESS
            </span>

            <strong className="progress-text">
              {progress}% Complete
            </strong>
          </div>
        </div>
      </div>

      {/* Pincode */}
      <section className="form-section">
        <div className="section-heading">
          <div className="section-number">📍</div>

          <div>
            <h3>Where is your garden located?</h3>
            <p>
              Your pincode helps us understand your local
              environment.
            </p>
          </div>
        </div>

        <div className="pincode-group">
          <label htmlFor="pincode">
            Pincode
          </label>

          <input
            id="pincode"
            type="text"
            inputMode="numeric"
            maxLength="6"
            value={environment.pincode}
            placeholder="Enter your 6-digit pincode"
            onChange={(e) =>
              updateEnvironment(
                "pincode",
                e.target.value.replace(/\D/g, "")
              )
            }
          />

          <span className="input-hint">
            Enter a valid 6-digit Indian pincode.
          </span>
        </div>
      </section>

      {/* Location */}
      <section className="form-section">
        <h3>1. Where is your garden?</h3>

        <OptionCards
          options={locationOptions}
          value={environment.location}
          onChange={(value) =>
            updateEnvironment("location", value)
          }
        />
      </section>

      {/* Space */}
      <section className="form-section">
        <h3>2. How much growing space do you have?</h3>

        <OptionCards
          options={spaceOptions}
          value={environment.space}
          onChange={(value) =>
            updateEnvironment("space", value)
          }
        />
      </section>

      {/* Sunlight */}
      <section className="form-section">
        <h3>
          3. How much sunlight does your garden receive?
        </h3>

        <OptionCards
          options={sunlightOptions}
          value={environment.sunlight}
          onChange={(value) =>
            updateEnvironment("sunlight", value)
          }
        />
      </section>

      {/* Climate */}
      <section className="form-section">
        <h3>4. What is your local climate like?</h3>

        <div className="dropdowns-row">

          <div className="dropdown-group">
            <label htmlFor="temperature">
              Temperature Range
            </label>

            <select
              id="temperature"
              value={environment.temperature}
              onChange={(e) =>
                updateEnvironment(
                  "temperature",
                  e.target.value
                )
              }
            >
              <option>20°C - 30°C</option>
              <option>10°C - 20°C</option>
              <option>30°C - 40°C</option>
            </select>
          </div>

          <div className="dropdown-group">
            <label htmlFor="climate">
              Climate Type
            </label>

            <select
              id="climate"
              value={environment.climate}
              onChange={(e) =>
                updateEnvironment(
                  "climate",
                  e.target.value
                )
              }
            >
              <option>Tropical</option>
              <option>Subtropical</option>
              <option>Arid / Dry</option>
              <option>Temperate</option>
            </select>
          </div>

          <div className="dropdown-group">
            <label htmlFor="humidity">
              Humidity Level
            </label>

            <select
              id="humidity"
              value={environment.humidity}
              onChange={(e) =>
                updateEnvironment(
                  "humidity",
                  e.target.value
                )
              }
            >
              <option>Medium</option>
              <option>Low</option>
              <option>High</option>
            </select>
          </div>

        </div>
      </section>

      {/* Medium */}
      <section className="form-section">
        <h3>5. What is your growing medium?</h3>

        <OptionCards
          options={mediumOptions}
          value={environment.medium}
          onChange={(value) =>
            updateEnvironment("medium", value)
          }
        />
      </section>

      {/* Footer */}
      <div className="form-footer">
        <button
          type="button"
          className="btn-primary"
          onClick={handleSave}
        >
          {saved
            ? "Environment Saved ✓"
            : "Save Environment →"}
        </button>
      </div>

    </div>
  );
}

export default EnvironmentSetup;