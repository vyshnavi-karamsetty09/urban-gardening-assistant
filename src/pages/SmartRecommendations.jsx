import { useState, useEffect, useMemo } from "react";
import { LIBRARY_PLANTS, getPlantImage } from "../plantData";
import { getSavedPlants, savePlants, STORAGE_KEYS } from "../utils";
import {
  environmentApi,
  gardenApi,
  getAuthToken,
  recommendationApi,
} from "../api";
import PageHeaderBanner from "../components/PageHeaderBanner";
import envBalconyImg from "../assets/env-balcony.jpg";
import envTerraceImg from "../assets/env-terrace.jpg";
import envIndoorImg from "../assets/env-indoor.jpg";
import envWeatherSunnyImg from "../assets/env-weather-sunny.jpg";
import "./SmartRecommendations.css";

const LOCATION_OPTIONS = [
  {
    value: "Balcony",
    icon: "🏡",
    desc: "Sunny or shaded outdoor balcony",
    image: envBalconyImg,
    tagline: "Railing planters, vertical racks & containers",
  },
  {
    value: "Terrace",
    icon: "🪴",
    desc: "Spacious open rooftop or terrace",
    image: envTerraceImg,
    tagline: "Raised garden beds, large grow bags & full solar sky",
  },
  {
    value: "Indoor",
    icon: "🪟",
    desc: "Bright windowsill or room interior",
    image: envIndoorImg,
    tagline: "Filtered ambient daylight & sheltered plant shelves",
  },
];

const SPACE_OPTIONS = [
  {
    value: "Small",
    icon: "🌱",
    desc: "A few compact pots (1–5 plants)",
  },
  {
    value: "Medium",
    icon: "🌿",
    desc: "Planter boxes & railing pots (6–15 plants)",
  },
  {
    value: "Large",
    icon: "🌳",
    desc: "Spacious garden or multi-tier racks",
  },
];

const SUNLIGHT_OPTIONS = [
  {
    value: "Low Light",
    icon: "☁️",
    desc: "0–2 hours indirect daylight",
  },
  {
    value: "Medium Light",
    icon: "⛅",
    desc: "3–5 hours morning or filtered sun",
  },
  {
    value: "High Light",
    icon: "☀️",
    desc: "6+ hours bright direct sunlight",
  },
  {
    value: "Full Sun",
    icon: "🌞",
    desc: "6–8+ hours open intense sun",
  },
];

const MEDIUM_OPTIONS = [
  {
    value: "Soil",
    icon: "🌱",
    desc: "Traditional nutrient-rich garden soil",
  },
  {
    value: "Potting Mix",
    icon: "🪴",
    desc: "Aerated, well-draining container mix",
  },
  {
    value: "Cocopeat",
    icon: "🥥",
    desc: "Moisture-retentive organic coconut coir",
  },
  {
    value: "Hydroponics",
    icon: "💧",
    desc: "Soilless liquid nutrient culture",
  },
];

const WATERING_OPTIONS = [
  {
    value: "Low",
    icon: "💧",
    desc: "I can water occasionally",
  },
  {
    value: "Moderate",
    icon: "🌿",
    desc: "I can water a few times each week",
  },
  {
    value: "High",
    icon: "🌱",
    desc: "I can water frequently",
  },
];

const MOISTURE_OPTIONS = [
  {
    value: "Dry",
    icon: "🏜️",
    desc: "Well-drained, dries out completely between waterings",
  },
  {
    value: "Moderate",
    icon: "🌱",
    desc: "Evenly moist, balanced moisture retention",
  },
  {
    value: "Moist",
    icon: "💧",
    desc: "Consistently damp or high moisture substrate",
  },
];

const RAINFALL_OPTIONS = [
  {
    value: "Low / Scanty",
    icon: "☀️",
    desc: "Dry climate or covered / sheltered from rain",
  },
  {
    value: "Moderate",
    icon: "🌦️",
    desc: "Average seasonal showers & precipitation",
  },
  {
    value: "High / Abundant",
    icon: "🌧️",
    desc: "Heavy monsoon & high rainfall",
  },
];

const SEASON_OPTIONS = [
  {
    value: "All Year",
    icon: "🌿",
    desc: "Year-round planting & evergreen",
  },
  {
    value: "Summer",
    icon: "☀️",
    desc: "Warm and bright growing season",
  },
  {
    value: "Monsoon",
    icon: "🌧️",
    desc: "Humid rainy growing season",
  },
  {
    value: "Winter",
    icon: "❄️",
    desc: "Cool and mild growing season",
  },
];

const EXPERIENCE_OPTIONS = [
  {
    value: "Beginner",
    icon: "🌱",
    desc: "New to gardening, low-maintenance plants preferred",
  },
  {
    value: "Intermediate",
    icon: "🌿",
    desc: "Familiar with potting, feeding & simple pruning",
  },
  {
    value: "Advanced",
    icon: "🌳",
    desc: "Experienced with fruiting crops, grafting & pests",
  },
];

/* =========================================================
   EMPTY / UNCONFIGURED ENVIRONMENT
   ========================================================= */

const EMPTY_ENVIRONMENT = {
  pincode: "",
  location: "",
  space: "",
  sunlight: "",
  temperature: "",
  climate: "",
  humidity: "",
  medium: "",
  soil: "",
  watering: "",
  soilMoisture: "",
  rainfall: "",
  season: "",
  experience: "",
  numericTemp: "",
  numericHumidity: "",
  locationLabel: "",
  configured: false,
};

function readStoredEnvironment() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.environment);

    if (!raw) {
      return { ...EMPTY_ENVIRONMENT };
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return { ...EMPTY_ENVIRONMENT };
    }

    return {
      ...EMPTY_ENVIRONMENT,
      ...parsed,
      configured: parsed.configured === true,
    };
  } catch {
    return { ...EMPTY_ENVIRONMENT };
  }
}

function SmartRecommendations({
  onPageChange,
  initialTab = "matches",
}) {
  /* =========================================================
     ENVIRONMENT STATE
     ========================================================= */

  const [environment, setEnvironment] = useState(() =>
    readStoredEnvironment()
  );

  const [environmentConfigured, setEnvironmentConfigured] =
    useState(() => {
      const saved = readStoredEnvironment();
      return saved.configured === true;
    });

  const [activeTab, setActiveTab] = useState(() => {
    const saved = readStoredEnvironment();

    if (saved.configured !== true) {
      return "weather";
    }

    return initialTab === "environment"
      ? "weather"
      : "matches";
  });

  /* =========================================================
     OTHER STATE
     ========================================================= */

  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState(null);
  const [envSaved, setEnvSaved] = useState(false);
  const [savedPlants, setSavedPlants] = useState(() =>
    getSavedPlants()
  );
  const [backendRecommendations, setBackendRecommendations] =
    useState([]);
  const [locationSource, setLocationSource] =
    useState("estimated");
  const [recommendationLoading, setRecommendationLoading] =
    useState(false);

  const [tempError, setTempError] = useState("");
  const [humidityError, setHumidityError] = useState("");
  const [pincodeError, setPincodeError] = useState("");

  /* =========================================================
     LOAD EXISTING GARDEN PLANTS
     ========================================================= */

  useEffect(() => {
    if (!getAuthToken()) return;

    gardenApi
      .list()
      .then((result) => {
        if (Array.isArray(result.plants)) {
          setSavedPlants(result.plants);
          savePlants(result.plants);
        }
      })
      .catch(() => {
        // Cached garden remains available if the API is offline.
      });
  }, []);

  /* =========================================================
     TOAST
     ========================================================= */

  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 3500);
  };

  /* =========================================================
     LOAD ENVIRONMENT FROM BACKEND
     ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadEnvironment = async () => {
      if (!getAuthToken()) return;

      try {
        const result = await environmentApi.get();

        if (cancelled) return;

        const savedEnvironment = result?.environment;

        /*
         * IMPORTANT:
         * A backend response is considered a real profile only
         * when configured === true.
         */
        if (savedEnvironment?.configured === true) {
          const mergedEnvironment = {
            ...EMPTY_ENVIRONMENT,
            ...savedEnvironment,
            configured: true,
          };

          setEnvironment(mergedEnvironment);
          setEnvironmentConfigured(true);

          try {
            localStorage.setItem(
              STORAGE_KEYS.environment,
              JSON.stringify(mergedEnvironment)
            );
          } catch {
            // Ignore storage failures.
          }

          setLocationSource(
            savedEnvironment.locationConfidence || "estimated"
          );

          /*
           * Keep the user's currently requested tab if their
           * profile is configured.
           */
          setActiveTab((currentTab) => {
            if (initialTab === "environment") {
              return "weather";
            }

            return currentTab;
          });
        } else {
          /*
           * New account / unconfigured account:
           * do NOT accept backend defaults as a completed profile.
           */
          setEnvironment((current) => ({
            ...EMPTY_ENVIRONMENT,
            ...current,
            configured: false,
          }));

          setEnvironmentConfigured(false);
          setBackendRecommendations([]);
          setActiveTab("weather");
        }
      } catch {
        /*
         * If the API is unavailable, keep the current local state.
         * Recommendations will still be blocked unless configured.
         */
      }
    };

    loadEnvironment();

    return () => {
      cancelled = true;
    };
  }, [initialTab]);

  /* =========================================================
     REQUEST BACKEND RECOMMENDATIONS
     ========================================================= */

  const requestRecommendations = async (
    nextEnvironment = environment
  ) => {
    /*
     * NEVER generate recommendations for an unconfigured account.
     */
    if (
      !getAuthToken() ||
      !environmentConfigured ||
      nextEnvironment?.configured !== true
    ) {
      setBackendRecommendations([]);
      return;
    }

    setRecommendationLoading(true);

    try {
      const result = await recommendationApi.recommend(
        nextEnvironment
      );

      const localByName = new Map(
        LIBRARY_PLANTS.map((plant) => [
          plant.name.toLowerCase(),
          plant,
        ])
      );

      const merged = (result.recommendations || []).map(
        (plant) => ({
          ...localByName.get(
            String(plant.name).toLowerCase()
          ),
          ...plant,
          image:
            localByName.get(
              String(plant.name).toLowerCase()
            )?.image ||
            plant.image ||
            plant.imageUrl ||
            "",
        })
      );

      setBackendRecommendations(merged);

      if (result.profile) {
        setLocationSource(
          result.profile.source || "estimated"
        );
      }
    } catch {
      /*
       * Local scoring remains available only after the user
       * has configured the environment.
       */
    } finally {
      setRecommendationLoading(false);
    }
  };

  /* =========================================================
     AUTOMATIC RECOMMENDATION REQUEST
     ========================================================= */

  useEffect(() => {
    if (
      !getAuthToken() ||
      !environmentConfigured ||
      environment.configured !== true
    ) {
      setBackendRecommendations([]);
      return undefined;
    }

    const timer = setTimeout(() => {
      requestRecommendations(environment);
    }, 500);

    return () => clearTimeout(timer);
  }, [environment, environmentConfigured]);

  /* =========================================================
     UPDATE ENVIRONMENT FIELD
     ========================================================= */

  const handleUpdateField = (field, value) => {
    setEnvironment((prev) => {
      const linkedFields =
        field === "medium"
          ? {
              medium: value,
              soil: value,
            }
          : field === "soil"
          ? {
              soil: value,
              medium: value,
            }
          : {
              [field]: value,
            };

      const updated = {
        ...prev,
        ...linkedFields,
      };

      /*
       * Save the user's current form locally, but DO NOT mark
       * the environment as configured just because a field changed.
       */
      try {
        localStorage.setItem(
          STORAGE_KEYS.environment,
          JSON.stringify(updated)
        );
      } catch {
        // Ignore storage failures.
      }

      /*
       * Only sync changes to backend after the user has actually
       * completed and saved the environment profile once.
       */
      if (
        getAuthToken() &&
        environmentConfigured &&
        prev.configured === true
      ) {
        environmentApi
          .save({
            ...updated,
            configured: true,
          })
          .catch(() => null);
      }

      return updated;
    });

    setEnvSaved(false);
  };

  /* =========================================================
     PINCODE CHANGE / REGION ANALYSIS
     ========================================================= */

  const handlePincodeChange = async (value) => {
    const rawDigits = value
      .replace(/\D/g, "")
      .slice(0, 6);

    setEnvironment((prev) => ({
      ...prev,
      pincode: rawDigits,
      configured: prev.configured === true,
    }));

    setEnvSaved(false);

    if (
      value.trim().length > 0 &&
      rawDigits.length < 6
    ) {
      setPincodeError(
        "Please enter a valid 6-digit Indian postal code."
      );
    } else {
      setPincodeError("");
    }

    if (
      rawDigits.length !== 6 ||
      !getAuthToken()
    ) {
      return;
    }

    try {
      const result =
        await recommendationApi.analyzeLocation(
          rawDigits
        );

      if (result?.profile) {
        setEnvironment((prev) => ({
          ...prev,
          pincode: rawDigits,

          /*
           * Pincode provides regional baseline information,
           * but does NOT complete the user's environment setup.
           */
          sunlight:
            result.profile.sunlight ||
            prev.sunlight ||
            "",
          climate:
            result.profile.climate ||
            prev.climate ||
            "",
          temperature:
            result.profile.temperature ||
            prev.temperature ||
            "",
          humidity:
            result.profile.humidity ||
            prev.humidity ||
            "",

          /*
           * Keep the user's garden location choice.
           */
          location: prev.location || "",
          locationLabel:
            result.profile.label ||
            prev.locationLabel ||
            "",

          configured: false,
        }));

        setLocationSource(
          result.profile.source || "estimated"
        );

        showToast(
          `📍 Environment estimated for ${
            result.profile.label || "your region"
          }.`
        );
      }
    } catch {
      showToast(
        "⚠️ Pincode analysis is unavailable. You can continue with manual environment settings."
      );
    }
  };

  /* =========================================================
     NUMERIC TEMPERATURE VALIDATION
     ========================================================= */

  const handleNumericTempChange = (val) => {
    handleUpdateField("numericTemp", val);

    if (!val || val.trim() === "") {
      setTempError("");
      return;
    }

    const num = parseFloat(val);

    if (
      Number.isNaN(num) ||
      num < -10 ||
      num > 55
    ) {
      setTempError(
        "Please enter a realistic ambient temperature between -10°C and 55°C."
      );
    } else {
      setTempError("");
    }
  };

  /* =========================================================
     NUMERIC HUMIDITY VALIDATION
     ========================================================= */

  const handleNumericHumidityChange = (val) => {
    handleUpdateField("numericHumidity", val);

    if (!val || val.trim() === "") {
      setHumidityError("");
      return;
    }

    const num = parseFloat(val);

    if (
      Number.isNaN(num) ||
      num < 0 ||
      num > 100
    ) {
      setHumidityError(
        "Humidity must be between 0% and 100%."
      );
    } else {
      setHumidityError("");
    }
  };

  /* =========================================================
     SAVE ENVIRONMENT
     ========================================================= */

  const handleSaveEnvironment = async () => {
    const requiredFields = [
      ["pincode", "Garden pincode"],
      ["location", "Garden location"],
      ["space", "Growing space"],
      ["sunlight", "Sunlight"],
      ["temperature", "Temperature"],
      ["climate", "Climate"],
      ["humidity", "Humidity"],
      ["medium", "Growing medium"],
      ["watering", "Watering availability"],
      ["soilMoisture", "Soil moisture"],
      ["rainfall", "Rainfall"],
      ["season", "Growing season"],
      ["experience", "Gardening experience"],
    ];

    const missingFields = requiredFields
      .filter(
        ([field]) =>
          !String(environment[field] || "").trim()
      )
      .map(([, label]) => label);

    if (
      !/^\d{6}$/.test(
        String(environment.pincode || "")
      )
    ) {
      setPincodeError(
        "Please enter a valid 6-digit Indian postal code."
      );

      showToast(
        "⚠️ Please enter a valid 6-digit pincode."
      );

      return;
    }

    if (missingFields.length > 0) {
      showToast(
        `⚠️ Please complete: ${missingFields
          .slice(0, 3)
          .join(", ")}${
          missingFields.length > 3 ? "…" : ""
        }`
      );

      return;
    }

    if (tempError || humidityError) {
      showToast(
        "⚠️ Please correct the environment values before saving."
      );

      return;
    }

    /*
     * Only NOW do we mark the profile as configured.
     */
    const updatedEnvironment = {
      ...environment,
      configured: true,
    };

    try {
      localStorage.setItem(
        STORAGE_KEYS.environment,
        JSON.stringify(updatedEnvironment)
      );

      if (getAuthToken()) {
        const result = await environmentApi.save(
          updatedEnvironment
        );

        if (result?.environment) {
          const serverEnvironment = {
            ...updatedEnvironment,
            ...result.environment,
            configured: true,
          };

          setEnvironment(serverEnvironment);

          try {
            localStorage.setItem(
              STORAGE_KEYS.environment,
              JSON.stringify(serverEnvironment)
            );
          } catch {
            // Ignore storage failures.
          }
        } else {
          setEnvironment(updatedEnvironment);
        }
      } else {
        setEnvironment(updatedEnvironment);
      }

      setEnvironmentConfigured(true);
      setEnvSaved(true);

      showToast(
        "🌿 Environment settings saved successfully!"
      );

      setTimeout(
        () => setEnvSaved(false),
        2500
      );

      /*
       * After configuration, switch to matches.
       */
      setActiveTab("matches");

      /*
       * Immediately generate personalized recommendations.
       */
      await requestRecommendations({
        ...updatedEnvironment,
        configured: true,
      });
    } catch {
      showToast(
        "⚠️ Environment was saved locally, but the backend could not be reached."
      );
    }
  };

  /* =========================================================
     ENVIRONMENT IMAGE
     ========================================================= */

  const currentEnvImage = useMemo(() => {
    if (environment.location === "Terrace") {
      return envTerraceImg;
    }

    if (environment.location === "Indoor") {
      return envIndoorImg;
    }

    return envBalconyImg;
  }, [environment.location]);

  /* =========================================================
     ENVIRONMENT INSIGHT
     ========================================================= */

  const envInsight = useMemo(() => {
    if (!environmentConfigured) {
      return {
        badge: "🌱 Environment Setup Required",
        title: "Tell us about your growing environment",
        tag: "Personalized Plant Matching",
        summary:
          "Complete your garden environment setup so Garden Guide can calculate plant recommendations specifically for your space, sunlight, climate, soil, watering routine, and growing conditions.",
        bestPlants:
          "Your personalized plant matches will appear after setup.",
      };
    }

    if (environment.location === "Indoor") {
      return {
        badge: "🪟 Sheltered Indoor Ecosystem",
        title:
          "Indoor Windowsill & Plant Shelf Microclimate",
        tag: "Protected Light Zone",
        summary:
          "Sheltered from outdoor thermal extremes and gusty winds. Excellent for humidity-tolerant culinary herbs (Spearmint), lush foliage (Ferns, Pothos), and drought-hardy succulents (Aloe Vera) receiving bright indirect daylight.",
        bestPlants:
          "Spearmint, Aloe Vera, Ferns, Snake Plant",
      };
    }

    if (environment.location === "Terrace") {
      return {
        badge: "🪴 Expansive Rooftop Terrace",
        title: "High-Capacity Solar Growing Zone",
        tag: "Unrestricted Sunlight Zone",
        summary:
          "Uninhibited 360° solar reception and broad aeration. Outstanding for high-demand fruiting vegetables (Tomatoes, Bell Peppers), vigorous climbing gourds, and heat-loving blooms (Marigolds, Roses). Deep morning watering recommended.",
        bestPlants:
          "Tomato, Bell Pepper, Marigold, Rose",
      };
    }

    if (environment.location === "Balcony") {
      return {
        badge: "🏡 Urban Apartment Balcony",
        title:
          "Potted Balcony & Railing Microclimate",
        tag: "Optimized Container Space",
        summary:
          "Balanced urban microclimate with natural airflow. Optimal for compact container gardening: Sweet Basil, Cherry Tomatoes, Curry Leaf, and trailing climbers. Railing planters maximize morning sun effectively.",
        bestPlants:
          "Cherry Tomato, Sweet Basil, Mint, Curry Leaf",
      };
    }

    return {
      badge: "🌱 Growing Environment",
      title:
        "Complete your growing environment profile",
      tag: "Personalized Plant Matching",
      summary:
        "Your saved environmental conditions will be used to calculate personalized plant compatibility.",
      bestPlants:
        "Your personalized plant matches will appear after setup.",
    };
  }, [environment, environmentConfigured]);

  /* =========================================================
     LOCAL FALLBACK SCORING
     ========================================================= */

  const scoredRecommendations = useMemo(() => {
    if (!environmentConfigured) {
      return [];
    }

    const sun = (
      environment.sunlight || ""
    ).toLowerCase();

    const loc = (
      environment.location || ""
    ).toLowerCase();

    const space = (
      environment.space || ""
    ).toLowerCase();

    const med = (
      environment.medium ||
      environment.soil ||
      ""
    ).toLowerCase();

    const moisture = (
      environment.soilMoisture || "Moderate"
    ).toLowerCase();

    const rainfall = (
      environment.rainfall || "Moderate"
    ).toLowerCase();

    const season = (
      environment.season || "All Year"
    ).toLowerCase();

    const exp = (
      environment.experience || "Beginner"
    ).toLowerCase();

    const temp = (
      environment.temperature || ""
    ).toLowerCase();

    return LIBRARY_PLANTS.map((plant) => {
      let score = 70;
      const reasons = [];

      /* -----------------------------------------------------
         1. SUNLIGHT
         ----------------------------------------------------- */

      const plantSun = (
        plant.sunlight || ""
      ).toLowerCase();

      if (
        sun.includes("full") ||
        sun.includes("high")
      ) {
        if (
          plantSun.includes("full") ||
          plantSun.includes("direct") ||
          plantSun.includes("bright") ||
          plantSun.includes("6–8") ||
          plantSun.includes("6+")
        ) {
          score += 12;

          reasons.push(
            `Flourishes under ${environment.sunlight} exposure`
          );
        } else if (
          plantSun.includes("shade") ||
          plantSun.includes("low")
        ) {
          score -= 6;
        } else {
          score += 5;
        }
      } else if (sun.includes("medium")) {
        if (
          plantSun.includes("partial") ||
          plantSun.includes("morning") ||
          plantSun.includes("4–6") ||
          plantSun.includes("3–5")
        ) {
          score += 12;

          reasons.push(
            `Thrives in moderate ${environment.sunlight}`
          );
        } else {
          score += 4;
        }
      } else {
        if (
          plant.category === "Herbs" ||
          plant.category === "Succulents" ||
          plant.name
            .toLowerCase()
            .includes("spinach") ||
          plant.name
            .toLowerCase()
            .includes("snake")
        ) {
          score += 10;

          reasons.push(
            "Tolerates lower light and shaded corners"
          );
        } else {
          score -= 8;
        }
      }

      /* -----------------------------------------------------
         2. LOCATION
         ----------------------------------------------------- */

      if (loc.includes("indoor")) {
        if (
          plant.name.includes("Aloe") ||
          plant.name.includes("Snake") ||
          plant.name.includes("Mint") ||
          plant.name.includes("Basil") ||
          plant.name.includes("Jasmine")
        ) {
          score += 6;

          reasons.push(
            "Adapts cleanly to indoor container microclimates"
          );
        } else if (
          plant.category === "Vegetables"
        ) {
          score -= 5;
        }
      } else if (loc.includes("terrace")) {
        if (
          plant.category === "Vegetables" ||
          plant.category === "Flowers"
        ) {
          score += 6;

          reasons.push(
            "Benefits from full open-sky terrace aeration"
          );
        }
      } else {
        score += 5;

        reasons.push(
          "Ideal container candidate for balcony planters"
        );
      }

      /* -----------------------------------------------------
         3. SPACE
         ----------------------------------------------------- */

      if (space.includes("small")) {
        if (
          plant.category === "Herbs" ||
          plant.category === "Succulents" ||
          (plant.growthDays &&
            plant.growthDays <= 45)
        ) {
          score += 5;

          reasons.push(
            `Compact root system suited for ${environment.space} spaces`
          );
        }
      } else {
        score += 4;
      }

      /* -----------------------------------------------------
         4. GROWING MEDIUM
         ----------------------------------------------------- */

      const plantSoil = (
        plant.soil || ""
      ).toLowerCase();

      if (
        med.includes("potting mix") &&
        (plantSoil.includes("well-draining") ||
          plantSoil.includes("loam") ||
          plantSoil.includes("compost"))
      ) {
        score += 6;

        reasons.push(
          `Roots love well-aerated ${environment.medium}`
        );
      } else if (
        med.includes("cocopeat") &&
        (
          plant.water || ""
        )
          .toLowerCase()
          .includes("moist")
      ) {
        score += 6;

        reasons.push(
          `Retentive ${environment.medium} satisfies moisture demand`
        );
      } else if (
        med.includes("hydroponics") &&
        (
          plant.name.includes("Mint") ||
          plant.name.includes("Spinach")
        )
      ) {
        score += 7;

        reasons.push(
          "Exceptional candidate for soilless hydroponics"
        );
      } else {
        score += 3;
      }

      /* -----------------------------------------------------
         5. HUMIDITY
         ----------------------------------------------------- */

      const plantWater = (
        plant.water || ""
      ).toLowerCase();

      const parsedHumidity = parseFloat(
        environment.numericHumidity
      );

      if (
        !Number.isNaN(parsedHumidity) &&
        parsedHumidity >= 0 &&
        parsedHumidity <= 100
      ) {
        if (parsedHumidity >= 70) {
          if (
            plant.category === "Succulents" ||
            plant.name.includes("Aloe")
          ) {
            score -= 6;
          } else if (
            plantWater.includes("moist") ||
            plant.name.includes("Mint") ||
            plant.name.includes("Spinach")
          ) {
            score += 7;

            reasons.push(
              `Loves your humid ${parsedHumidity}% air`
            );
          }
        } else if (parsedHumidity <= 35) {
          if (
            plant.category === "Succulents" ||
            plant.name.includes("Aloe") ||
            plant.name.includes("Snake")
          ) {
            score += 7;

            reasons.push(
              `Drought-adapted for ${parsedHumidity}% dry humidity`
            );
          } else if (
            plantWater.includes("moist")
          ) {
            score -= 5;
          }
        } else {
          score += 4;
        }
      }

      /* -----------------------------------------------------
         6. SOIL MOISTURE
         ----------------------------------------------------- */

      if (moisture === "dry") {
        if (
          plant.category === "Succulents" ||
          plantWater.includes("weekly") ||
          plantWater.includes("occasional")
        ) {
          score += 6;

          reasons.push(
            "Drought-tolerant roots excel in drier substrate"
          );
        } else if (
          plantWater.includes("daily") ||
          plantWater.includes("moist")
        ) {
          score -= 5;
        }
      } else if (moisture === "moist") {
        if (
          plantWater.includes("moist") ||
          plantWater.includes("daily") ||
          plant.name.includes("Mint") ||
          plant.name.includes("Spinach")
        ) {
          score += 6;

          reasons.push(
            "Thrives with regular moisture and humid root zone"
          );
        } else if (
          plant.category === "Succulents"
        ) {
          score -= 7;
        }
      } else {
        score += 4;
      }

      /* -----------------------------------------------------
         7. RAINFALL
         ----------------------------------------------------- */

      if (
        rainfall.includes("high") &&
        (
          plant.category === "Succulents" ||
          plant.name.includes("Aloe")
        )
      ) {
        score -= 5;
      }

      /* -----------------------------------------------------
         8. TEMPERATURE
         ----------------------------------------------------- */

      const plantTemp = (
        plant.temp || ""
      ).toLowerCase();

      const parsedTemp = parseFloat(
        environment.numericTemp
      );

      if (
        !Number.isNaN(parsedTemp) &&
        parsedTemp >= -10 &&
        parsedTemp <= 55
      ) {
        if (parsedTemp >= 32) {
          if (
            plantTemp.includes("32") ||
            plantTemp.includes("34") ||
            plantTemp.includes("35") ||
            plant.category === "Succulents"
          ) {
            score += 7;

            reasons.push(
              `Heat tolerant at measured ${parsedTemp}°C`
            );
          } else if (
            plant.name.includes("Spinach") ||
            plantTemp.includes("26")
          ) {
            score -= 8;
          }
        } else if (parsedTemp <= 20) {
          if (
            plant.name.includes("Spinach") ||
            plant.name.includes("Coriander") ||
            plant.category === "Herbs"
          ) {
            score += 7;

            reasons.push(
              `Flourishes in your cool ${parsedTemp}°C climate`
            );
          } else {
            score -= 5;
          }
        } else {
          score += 5;

          reasons.push(
            `Optimal growth around ${parsedTemp}°C`
          );
        }
      } else if (
        temp.includes("30°c - 40°c") ||
        temp.includes("hot")
      ) {
        if (
          plantTemp.includes("32") ||
          plantTemp.includes("34") ||
          plantTemp.includes("35") ||
          plant.category === "Succulents"
        ) {
          score += 5;

          reasons.push(
            "High heat tolerance during warm spells"
          );
        } else if (
          plant.name.includes("Spinach") ||
          plantTemp.includes("26")
        ) {
          score -= 6;
        }
      } else if (
        temp.includes("10°c - 20°c") ||
        temp.includes("cool")
      ) {
        if (
          plant.name.includes("Spinach") ||
          plant.name.includes("Coriander") ||
          plant.category === "Herbs"
        ) {
          score += 5;

          reasons.push(
            "Thrives in crisp cooler temperatures"
          );
        }
      } else {
        score += 4;
      }

      /* -----------------------------------------------------
         9. SEASON
         ----------------------------------------------------- */

      if (
        season === "winter" &&
        (
          plant.name.includes("Spinach") ||
          plant.name.includes("Coriander") ||
          plant.name.includes("Rose")
        )
      ) {
        score += 4;

        reasons.push(
          "Optimal seasonal planting window"
        );
      } else if (
        season === "summer" &&
        (
          plant.name.includes("Tomato") ||
          plant.name.includes("Pepper") ||
          plant.name.includes("Sunflower")
        )
      ) {
        score += 4;

        reasons.push(
          "Loves summer warmth and direct solar energy"
        );
      }

      /* -----------------------------------------------------
         10. EXPERIENCE
         ----------------------------------------------------- */

      const diff = (
        plant.difficulty || ""
      ).toLowerCase();

      if (exp === "beginner") {
        if (
          diff.includes("very easy") ||
          diff.includes("easy")
        ) {
          score += 5;

          reasons.push(
            "Forgiving, beginner-friendly plant"
          );
        } else {
          score -= 4;
        }
      } else {
        score += 3;
      }

      const finalScore = Math.min(
        99,
        Math.max(62, score)
      );

      const reasonText =
        reasons.length > 0
          ? reasons.slice(0, 2).join(" • ")
          : `Well-suited for your ${environment.location} setup in ${environment.climate} conditions`;

      return {
        ...plant,
        matchScore: finalScore,
        matchReason: reasonText,
      };
    }).sort(
      (a, b) => b.matchScore - a.matchScore
    );
  }, [environment, environmentConfigured]);

  /* =========================================================
     AVAILABLE RECOMMENDATIONS
     ========================================================= */

  const availableRecommendations =
    environmentConfigured &&
    backendRecommendations.length > 0
      ? backendRecommendations
      : environmentConfigured
      ? scoredRecommendations
      : [];

  /* =========================================================
     FILTERED MATCHES
     ========================================================= */

  const filteredMatches = useMemo(() => {
    return availableRecommendations.filter(
      (plant) => {
        const matchesCat =
          filterCategory === "All" ||
          plant.category === filterCategory;

        const query =
          searchQuery.toLowerCase().trim();

        const matchesSearch =
          !query ||
          String(plant.name || "")
            .toLowerCase()
            .includes(query) ||
          String(plant.botanicalName || "")
            .toLowerCase()
            .includes(query) ||
          String(plant.category || "")
            .toLowerCase()
            .includes(query);

        return matchesCat && matchesSearch;
      }
    );
  }, [
    availableRecommendations,
    filterCategory,
    searchQuery,
  ]);

  /* =========================================================
     ADD RECOMMENDED PLANT
     ========================================================= */

  const handleAddToGarden = async (plant) => {
    const current = savedPlants.length
      ? savedPlants
      : getSavedPlants();

    const alreadyInGarden = current.some(
      (p) =>
        p.name.toLowerCase() ===
        plant.name.toLowerCase()
    );

    if (alreadyInGarden) {
      showToast(
        `ℹ️ "${plant.name}" is already in your garden!`
      );

      return;
    }

    const newGardenPlant = {
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

      sunlight: plant.sunlight,
      water: plant.water,

      watered: "Watered Today",
      moisture: 85,

      image:
        plant.image ||
        plant.imageUrl ||
        getPlantImage(plant.name),

      description: plant.description,
      careTips: plant.careTips,

      plantedDate:
        new Date()
          .toISOString()
          .split("T")[0],

      growthDays:
        plant.growthDays || 60,

      growthTime:
        plant.growthTime || "60 days",

      harvestAdvice:
        plant.harvestAdvice ||
        "Harvest when fully mature.",

      harvestType:
        plant.harvestType ||
        "continuous",
    };

    let itemToStore = newGardenPlant;

    if (getAuthToken()) {
      try {
        const result =
          await gardenApi.add(newGardenPlant);

        itemToStore =
          result.plant ||
          newGardenPlant;
      } catch {
        showToast(
          "⚠️ Plant saved locally because the backend is unavailable."
        );
      }
    }

    const updated = [
      itemToStore,
      ...current,
    ];

    savePlants(updated);
    setSavedPlants(updated);

    showToast(
      `🌿 "${plant.name}" added to My Garden!`
    );
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <main className="smart-rec-page">
      {/* =====================================================
          1. HERO HEADER BANNER
          ===================================================== */}

      <PageHeaderBanner
        showBackButton={true}
        onPageChange={onPageChange}
        backFallbackPage="dashboard"
        eyebrow="BOTANICAL MATCHING & ENVIRONMENT INTELLIGENCE"
        title="Smart Recommendations"
        titleAccent="✦"
        subtitle="Personalized plant matches using your pincode-based environment profile, available space, soil, sunlight, climate, moisture, season, and care preferences."
        badgeIcon="⛅"
        badgeTitle={
          environmentConfigured
            ? "Pincode Profile"
            : "Environment Setup"
        }
        badgeSubtitle={
          environmentConfigured
            ? `📍 ${environment.pincode} • ${environment.climate} • ${environment.sunlight}`
            : "📍 Complete your environment setup first"
        }
      />

      {/* =====================================================
          2. TAB SWITCHER
          ===================================================== */}

      <nav
        className="smart-tab-bar slow-popup animate-slow-pop"
        style={{
          animationDelay: "60ms",
        }}
      >
        <button
          type="button"
          className={`smart-tab-btn ${
            activeTab === "matches"
              ? "active"
              : ""
          }`}
          onClick={() => {
            if (environmentConfigured) {
              setActiveTab("matches");
            } else {
              setActiveTab("weather");

              showToast(
                "🌱 Please complete your Environment Setup first."
              );
            }
          }}
        >
          <span className="tab-ico">
            ✦
          </span>

          <strong>
            {recommendationLoading
              ? "Generating Matches…"
              : "Smart Plant Matches"}
          </strong>

          <span className="tab-counter">
            {filteredMatches.length}
          </span>
        </button>

        <button
          type="button"
          className={`smart-tab-btn ${
            activeTab === "weather"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveTab("weather")
          }
        >
          <span className="tab-ico">
            ⛅
          </span>

          <strong>
            Weather & Environment Setup
          </strong>

          <span className="tab-status-pill">
            {environmentConfigured
              ? "Active Profile"
              : "Setup Required"}
          </span>
        </button>
      </nav>

      {/* =====================================================
          TAB 1: SMART PLANT MATCHES
          ===================================================== */}

      {activeTab === "matches" &&
        environmentConfigured && (
          <div className="matches-view-container">
            {/* Environment Snapshot */}

            <div
              className="env-snapshot-strip slow-popup animate-slow-pop"
              style={{
                animationDelay: "100ms",
              }}
            >
              <div className="snapshot-chips">
                <div className="snapshot-chip">
                  <span className="chip-ico">
                    📍
                  </span>

                  <div>
                    <small>Pincode</small>

                    <strong>
                      {environment.pincode}
                    </strong>
                  </div>
                </div>

                <div className="snapshot-chip">
                  <span className="chip-ico">
                    🏡
                  </span>

                  <div>
                    <small>Location</small>

                    <strong>
                      {environment.location}
                    </strong>
                  </div>
                </div>

                <div className="snapshot-chip">
                  <span className="chip-ico">
                    📐
                  </span>

                  <div>
                    <small>Growing Space</small>

                    <strong>
                      {environment.space} Space
                    </strong>
                  </div>
                </div>

                <div className="snapshot-chip">
                  <span className="chip-ico">
                    ☀️
                  </span>

                  <div>
                    <small>Sunlight</small>

                    <strong>
                      {environment.sunlight}
                    </strong>
                  </div>
                </div>

                <div className="snapshot-chip">
                  <span className="chip-ico">
                    🌱
                  </span>

                  <div>
                    <small>Medium</small>

                    <strong>
                      {environment.medium}
                    </strong>
                  </div>
                </div>

                <div className="snapshot-chip">
                  <span className="chip-ico">
                    💧
                  </span>

                  <div>
                    <small>Moisture</small>

                    <strong>
                      {environment.soilMoisture}
                    </strong>
                  </div>
                </div>

                <div className="snapshot-chip">
                  <span className="chip-ico">
                    🗓️
                  </span>

                  <div>
                    <small>Season</small>

                    <strong>
                      {environment.season}
                    </strong>
                  </div>
                </div>

                <div className="snapshot-chip">
                  <span className="chip-ico">
                    👨‍🌾
                  </span>

                  <div>
                    <small>Experience</small>

                    <strong>
                      {environment.experience}
                    </strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="modify-env-btn slow-pop-btn"
                onClick={() =>
                  setActiveTab("weather")
                }
              >
                ⚙ Edit Environment
              </button>
            </div>

            {/* Search / Categories */}

            <div
              className="matches-filter-row animate-slow-pop"
              style={{
                animationDelay: "140ms",
              }}
            >
              <div className="rec-search-box">
                <span className="rec-search-ico">
                  🔍
                </span>

                <input
                  type="search"
                  placeholder="Search recommended vegetables, flowers, herbs..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                />

                {searchQuery && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() =>
                      setSearchQuery("")
                    }
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="rec-category-pills">
                {[
                  "All",
                  "Vegetables",
                  "Flowers",
                  "Herbs",
                  "Succulents",
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`rec-cat-btn ${
                      filterCategory === cat
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setFilterCategory(
                        cat
                      )
                    }
                  >
                    {cat === "All"
                      ? "All Matches"
                      : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendation Cards */}

            <section className="recommendations-real-grid">
              {filteredMatches.map(
                (plant, idx) => {
                  const inGarden =
                    savedPlants.some(
                      (p) =>
                        p.name
                          .toLowerCase() ===
                        plant.name
                          .toLowerCase()
                    );

                  return (
                    <article
                      key={
                        plant.id ||
                        plant._id ||
                        plant.name
                      }
                      className="rec-plant-card slow-popup animate-slow-pop"
                      style={{
                        animationDelay: `${
                          160 + idx * 35
                        }ms`,
                      }}
                    >
                      <div className="rec-card-media">
                        <img
                          src={
                            plant.image ||
                            plant.imageUrl ||
                            getPlantImage(
                              plant.name
                            )
                          }
                          alt={plant.name}
                          className="rec-card-img"
                        />

                        <div className="rec-badges-overlay">
                          <span className="match-score-badge">
                            ★{" "}
                            {
                              plant.matchScore
                            }
                            % Match
                          </span>

                          <span
                            className={`cat-pill-badge ${String(
                              plant.category ||
                                ""
                            ).toLowerCase()}`}
                          >
                            {
                              plant.category
                            }
                          </span>
                        </div>
                      </div>

                      <div className="rec-card-body">
                        <div className="rec-name-block">
                          <h3 className="rec-plant-name">
                            {plant.name}
                          </h3>

                          <span className="rec-botanical-name">
                            {
                              plant.botanicalName
                            }
                          </span>
                        </div>

                        <div className="rec-match-reason">
                          <span className="reason-spark">
                            💡
                          </span>

                          <p>
                            {
                              plant.matchReason
                            }
                          </p>
                        </div>

                        <div className="rec-specs-chips">
                          <span
                            className="spec-chip"
                            title="Sunlight Requirement"
                          >
                            ☀️{" "}
                            {
                              plant.sunlight
                            }
                          </span>

                          <span
                            className="spec-chip"
                            title="Water Requirement"
                          >
                            💧{" "}
                            {
                              plant.water
                            }
                          </span>

                          <span
                            className="spec-chip"
                            title="Temperature Range"
                          >
                            🌡️{" "}
                            {plant.temp}
                          </span>

                          {plant.soil && (
                            <span
                              className="spec-chip"
                              title="Soil / Growing Medium"
                            >
                              🪴{" "}
                              {
                                plant.soil
                              }
                            </span>
                          )}

                          <span
                            className="spec-chip difficulty"
                            title="Growing Difficulty"
                          >
                            🌱{" "}
                            {
                              plant.difficulty
                            }
                          </span>
                        </div>

                        {plant.careTips && (
                          <div className="rec-care-tips-box">
                            <span className="care-tip-label">
                              💡 Care Tip:
                            </span>

                            <span className="care-tip-text">
                              {
                                plant.careTips
                              }
                            </span>
                          </div>
                        )}

                        <div className="rec-card-footer">
                          {inGarden ? (
                            <span className="in-garden-status">
                              ✓ In Your Garden
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="add-to-garden-btn slow-pop-btn"
                              onClick={() =>
                                handleAddToGarden(
                                  plant
                                )
                              }
                            >
                              + Add to My Garden
                            </button>
                          )}

                          <button
                            type="button"
                            className="rec-view-guide-btn"
                            onClick={() => {
                              if (
                                onPageChange
                              ) {
                                onPageChange(
                                  "library"
                                );
                              }
                            }}
                          >
                            Care Guide →
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </section>
          </div>
        )}

      {/* =====================================================
          TAB 2: WEATHER & ENVIRONMENT SETUP
          ===================================================== */}

      {activeTab === "weather" && (
        <div className="weather-env-view-container animate-slow-pop">
          {/* Environment Profile */}

          <section className="live-weather-card slow-popup">
            <div
              className="weather-banner-visual"
              style={{
                backgroundImage: `url(${envWeatherSunnyImg})`,
              }}
            >
              <div className="weather-banner-overlay"></div>

              <div className="weather-banner-content">
                <span className="weather-banner-badge">
                  ☀️{" "}
                  {environmentConfigured
                    ? "PINCODE ENVIRONMENT ESTIMATE"
                    : "ENVIRONMENT SETUP REQUIRED"}
                </span>

                <h3>
                  {environmentConfigured
                    ? `${environment.climate} regional growing profile`
                    : "Tell us about your garden environment"}
                </h3>

                <p>
                  {environmentConfigured
                    ? "Your pincode profile provides an estimated regional sunlight and climate baseline for plant matching."
                    : "Complete your environment profile so Garden Guide can create personalized plant recommendations for you."}
                </p>
              </div>
            </div>

            <div className="weather-card-header">
              <div className="weather-header-text">
                <span className="weather-kicker">
                  {environmentConfigured
                    ? "PINCODE ENVIRONMENT PROFILE"
                    : "PERSONALIZED ENVIRONMENT SETUP"}
                </span>

                <h2>
                  {environmentConfigured
                    ? "Garden Atmospheric Readings"
                    : "Configure Your Growing Environment"}
                </h2>

                <p>
                  {environmentConfigured
                    ? `Regional environment estimates are calibrated from pincode ${environment.pincode} and your saved garden settings.`
                    : "Tell us where and how you grow your plants. These details will be used by the recommendation engine."}
                </p>
              </div>

              <div className="weather-condition-tag">
                <span>
                  ☀️{" "}
                  {environmentConfigured
                    ? environment.sunlight
                    : "Not configured"}
                </span>
              </div>
            </div>

            {environmentConfigured && (
              <>
                <div className="weather-metrics-grid">
                  <div className="weather-metric-box">
                    <div className="metric-box-icon yellow">
                      ☀️
                    </div>

                    <div>
                      <span className="metric-val">
                        {
                          environment.sunlight
                        }
                      </span>

                      <small>
                        Sunlight profile
                      </small>
                    </div>
                  </div>

                  <div className="weather-metric-box">
                    <div className="metric-box-icon blue">
                      💧
                    </div>

                    <div>
                      <span className="metric-val">
                        {
                          environment.humidity
                        }
                      </span>

                      <small>
                        Regional humidity
                      </small>
                    </div>
                  </div>

                  <div className="weather-metric-box">
                    <div className="metric-box-icon green">
                      🌡️
                    </div>

                    <div>
                      <span className="metric-val">
                        {
                          environment.temperature
                        }
                      </span>

                      <small>
                        Regional temperature range
                      </small>
                    </div>
                  </div>

                  <div className="weather-metric-box">
                    <div className="metric-box-icon mint">
                      💧
                    </div>

                    <div>
                      <span className="metric-val">
                        {
                          environment.watering
                        }
                      </span>

                      <small>
                        Your watering capacity
                      </small>
                    </div>
                  </div>
                </div>

                <div className="weather-advice-banner">
                  <span className="advice-ico">
                    💡
                  </span>

                  <p>
                    <strong>
                      Garden Tip:
                    </strong>{" "}
                    Use your soil moisture and watering routine to decide when to water; container plants generally benefit from consistent moisture without waterlogging.
                  </p>
                </div>
              </>
            )}
          </section>

          {/* Dynamic Environment Visual */}

          <section className="env-visual-showcase-card slow-popup">
            <div className="env-showcase-image-wrap">
              <img
                src={currentEnvImage}
                alt={
                  environment.location ||
                  "Garden environment"
                }
                className="env-showcase-img"
              />

              <div className="env-showcase-overlay">
                <span className="env-showcase-badge">
                  {
                    envInsight.badge
                  }
                </span>
              </div>
            </div>

            <div className="env-showcase-content">
              <div className="env-showcase-tag">
                <span>✦</span>{" "}
                {envInsight.tag}
              </div>

              <h3 className="env-showcase-title">
                {envInsight.title}
              </h3>

              {environmentConfigured ? (
                <div className="env-showcase-chips">
                  <span className="env-chip">
                    📍{" "}
                    {environment.location}
                  </span>

                  <span className="env-chip">
                    📐{" "}
                    {environment.space}{" "}
                    Space
                  </span>

                  <span className="env-chip">
                    ☀️{" "}
                    {environment.sunlight}
                  </span>

                  <span className="env-chip">
                    🌡️{" "}
                    {environment.temperature}
                  </span>

                  <span className="env-chip">
                    🪴{" "}
                    {environment.medium}
                  </span>
                </div>
              ) : (
                <div className="env-best-suited">
                  <strong>
                    Setup needed:
                  </strong>{" "}
                  Complete the environment form below to unlock personalized plant matching.
                </div>
              )}

              <p className="env-showcase-desc">
                {envInsight.summary}
              </p>

              <div className="env-best-suited">
                <strong>
                  Recommended Plants for this Setup:
                </strong>{" "}
                {
                  envInsight.bestPlants
                }
              </div>
            </div>
          </section>

          {/* Environment Configurator */}

          <section className="env-configurator-card slow-popup">
            <div className="config-card-header">
              <div>
                <h2>
                  Your Growing Environment Setup
                </h2>

                <p>
                  Customize your pincode, space, soil, sunlight, climate, and watering settings to refine plant matches.
                </p>
              </div>

              <button
                type="button"
                className="save-env-top-btn slow-pop-btn"
                onClick={
                  handleSaveEnvironment
                }
              >
                {envSaved
                  ? "Saved ✓"
                  : "Save Settings"}
              </button>
            </div>

            {/* Pincode */}

            <div className="config-group">
              <label
                htmlFor="pincode-input"
                className="config-label"
              >
                📍 Garden Location Pincode (India) *
              </label>

              <div className="pincode-input-wrap">
                <input
                  id="pincode-input"
                  type="text"
                  maxLength={6}
                  value={
                    environment.pincode
                  }
                  placeholder="e.g. 500081, 560001, 110001"
                  onChange={(e) =>
                    handlePincodeChange(
                      e.target.value
                    )
                  }
                  className={`config-text-input ${
                    pincodeError
                      ? "input-invalid"
                      : ""
                  }`}
                />

                <span className="pincode-badge">
                  {locationSource ===
                  "curated pincode mapping"
                    ? "Region Calibrated ✓"
                    : "Estimated Region ✓"}
                </span>
              </div>

              {pincodeError && (
                <div
                  className="field-validation-error"
                  role="alert"
                  style={{
                    marginTop: "0.4rem",
                  }}
                >
                  ⚠️ {pincodeError}
                </div>
              )}

              {environment.locationLabel &&
                !pincodeError && (
                  <div className="pincode-detected-note">
                    📍 Detected region:{" "}
                    <strong>
                      {
                        environment.locationLabel
                      }
                    </strong>{" "}
                    • sunlight/climate estimated automatically from pincode.
                  </div>
                )}
            </div>

            {/* 1. Garden Location */}

            <div className="config-group">
              <span className="config-label">
                1. Where is your garden located?
              </span>

              <div className="options-selection-grid cols-3">
                {LOCATION_OPTIONS.map(
                  (opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`env-opt-photo-card ${
                        environment.location ===
                        opt.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleUpdateField(
                          "location",
                          opt.value
                        )
                      }
                    >
                      {environment.location ===
                        opt.value && (
                        <span className="opt-check">
                          ✓
                        </span>
                      )}

                      <div className="env-opt-photo-wrap">
                        <img
                          src={opt.image}
                          alt={opt.value}
                          className="env-opt-thumb"
                        />

                        <span className="env-opt-icon-floating">
                          {opt.icon}
                        </span>
                      </div>

                      <div className="env-opt-photo-body">
                        <strong className="opt-title">
                          {opt.value}
                        </strong>

                        <span className="opt-desc">
                          {opt.desc}
                        </span>

                        <small className="opt-tagline">
                          {opt.tagline}
                        </small>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 2. Growing Space */}

            <div className="config-group">
              <span className="config-label">
                2. How much growing space do you have?
              </span>

              <div className="options-selection-grid">
                {SPACE_OPTIONS.map(
                  (opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`env-opt-card ${
                        environment.space ===
                        opt.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleUpdateField(
                          "space",
                          opt.value
                        )
                      }
                    >
                      {environment.space ===
                        opt.value && (
                        <span className="opt-check">
                          ✓
                        </span>
                      )}

                      <span className="opt-ico">
                        {opt.icon}
                      </span>

                      <strong className="opt-title">
                        {opt.value} Space
                      </strong>

                      <span className="opt-desc">
                        {opt.desc}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 3. Sunlight */}

            <div className="config-group">
              <span className="config-label">
                3. How much natural sunlight does the space receive?
              </span>

              <div className="options-selection-grid cols-4">
                {SUNLIGHT_OPTIONS.map(
                  (opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`env-opt-card ${
                        environment.sunlight ===
                        opt.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleUpdateField(
                          "sunlight",
                          opt.value
                        )
                      }
                    >
                      {environment.sunlight ===
                        opt.value && (
                        <span className="opt-check">
                          ✓
                        </span>
                      )}

                      <span className="opt-ico">
                        {opt.icon}
                      </span>

                      <strong className="opt-title">
                        {opt.value}
                      </strong>

                      <span className="opt-desc">
                        {opt.desc}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 4. Climate / Temperature */}

            <div className="config-group">
              <span className="config-label">
                4. Local Climate & Atmospheric Range *
              </span>

              <div className="dropdowns-triple-grid">
                <div className="dropdown-box">
                  <label htmlFor="temp-select">
                    Temperature Category *
                  </label>

                  <select
                    id="temp-select"
                    value={
                      environment.temperature
                    }
                    onChange={(e) =>
                      handleUpdateField(
                        "temperature",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select temperature
                    </option>

                    <option value="10°C - 20°C">
                      Cool (10°C – 20°C)
                    </option>

                    <option value="20°C - 30°C">
                      Warm (20°C – 30°C)
                    </option>

                    <option value="30°C - 40°C">
                      Hot (30°C – 40°C)
                    </option>
                  </select>
                </div>

                <div className="dropdown-box">
                  <label htmlFor="climate-select">
                    Climate Type *
                  </label>

                  <select
                    id="climate-select"
                    value={
                      environment.climate
                    }
                    onChange={(e) =>
                      handleUpdateField(
                        "climate",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select climate
                    </option>

                    <option value="Tropical">
                      Tropical (Humid & Warm)
                    </option>

                    <option value="Subtropical">
                      Subtropical (Mild Winters)
                    </option>

                    <option value="Arid / Dry">
                      Arid / Dry (Low Moisture)
                    </option>

                    <option value="Temperate">
                      Temperate (Moderate Seasons)
                    </option>
                  </select>
                </div>

                <div className="dropdown-box">
                  <label htmlFor="humidity-select">
                    Humidity Level *
                  </label>

                  <select
                    id="humidity-select"
                    value={
                      environment.humidity
                    }
                    onChange={(e) =>
                      handleUpdateField(
                        "humidity",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select humidity
                    </option>

                    <option value="Low">
                      Low Humidity (&lt; 40%)
                    </option>

                    <option value="Medium">
                      Medium Humidity (40% – 70%)
                    </option>

                    <option value="High">
                      High Humidity (&gt; 70%)
                    </option>
                  </select>
                </div>
              </div>

              {/* Numeric Readings */}

              <div className="numeric-microclimate-subpanel">
                <div className="numeric-panel-heading">
                  <span>🌡️</span>

                  <strong>
                    Specific Microclimate Readings (Optional Fine-Tuning)
                  </strong>
                </div>

                <div className="numeric-inputs-dual-grid">
                  <div className="numeric-input-box">
                    <label htmlFor="numeric-temp-input">
                      Exact Ambient Temperature (°C)
                      <span className="valid-range-hint">
                        (Allowed: -10°C to 55°C)
                      </span>
                    </label>

                    <div className="input-with-unit-wrap">
                      <input
                        id="numeric-temp-input"
                        type="number"
                        min="-10"
                        max="55"
                        step="0.5"
                        value={
                          environment.numericTemp ||
                          ""
                        }
                        placeholder="e.g. 26"
                        onChange={(e) =>
                          handleNumericTempChange(
                            e.target.value
                          )
                        }
                        className={`config-num-input ${
                          tempError
                            ? "input-invalid"
                            : ""
                        }`}
                      />

                      <span className="input-unit-label">
                        °C
                      </span>
                    </div>

                    {tempError && (
                      <span
                        className="field-validation-error"
                        role="alert"
                      >
                        ⚠️ {tempError}
                      </span>
                    )}
                  </div>

                  <div className="numeric-input-box">
                    <label htmlFor="numeric-humidity-input">
                      Exact Relative Humidity (%)
                      <span className="valid-range-hint">
                        (Allowed: 0% to 100%)
                      </span>
                    </label>

                    <div className="input-with-unit-wrap">
                      <input
                        id="numeric-humidity-input"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={
                          environment.numericHumidity ||
                          ""
                        }
                        placeholder="e.g. 55"
                        onChange={(e) =>
                          handleNumericHumidityChange(
                            e.target.value
                          )
                        }
                        className={`config-num-input ${
                          humidityError
                            ? "input-invalid"
                            : ""
                        }`}
                      />

                      <span className="input-unit-label">
                        %
                      </span>
                    </div>

                    {humidityError && (
                      <span
                        className="field-validation-error"
                        role="alert"
                      >
                        ⚠️ {humidityError}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Growing Medium */}

            <div className="config-group">
              <span className="config-label">
                5. Growing Medium & Substrate
              </span>

              <div className="options-selection-grid cols-4">
                {MEDIUM_OPTIONS.map(
                  (opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`env-opt-card ${
                        environment.medium ===
                        opt.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleUpdateField(
                          "medium",
                          opt.value
                        )
                      }
                    >
                      {environment.medium ===
                        opt.value && (
                        <span className="opt-check">
                          ✓
                        </span>
                      )}

                      <span className="opt-ico">
                        {opt.icon}
                      </span>

                      <strong className="opt-title">
                        {opt.value}
                      </strong>

                      <span className="opt-desc">
                        {opt.desc}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 6. Watering */}

            <div className="config-group">
              <span className="config-label">
                6. How much time can you give to watering?
              </span>

              <div className="options-selection-grid cols-3">
                {WATERING_OPTIONS.map(
                  (opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`env-opt-card ${
                        environment.watering ===
                        opt.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleUpdateField(
                          "watering",
                          opt.value
                        )
                      }
                    >
                      {environment.watering ===
                        opt.value && (
                        <span className="opt-check">
                          ✓
                        </span>
                      )}

                      <span className="opt-ico">
                        {opt.icon}
                      </span>

                      <strong className="opt-title">
                        {opt.value} Watering
                      </strong>

                      <span className="opt-desc">
                        {opt.desc}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 7. Soil Moisture */}

            <div className="config-group">
              <span className="config-label">
                7. Soil Moisture Condition
              </span>

              <div className="options-selection-grid cols-3">
                {MOISTURE_OPTIONS.map(
                  (opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`env-opt-card ${
                        environment.soilMoisture ===
                        opt.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleUpdateField(
                          "soilMoisture",
                          opt.value
                        )
                      }
                    >
                      {environment.soilMoisture ===
                        opt.value && (
                        <span className="opt-check">
                          ✓
                        </span>
                      )}

                      <span className="opt-ico">
                        {opt.icon}
                      </span>

                      <strong className="opt-title">
                        {opt.value} Soil
                      </strong>

                      <span className="opt-desc">
                        {opt.desc}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 8. Rainfall */}

            <div className="config-group">
              <span className="config-label">
                8. Rainfall & Water Availability
              </span>

              <div className="options-selection-grid cols-3">
                {RAINFALL_OPTIONS.map(
                  (opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`env-opt-card ${
                        environment.rainfall ===
                        opt.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleUpdateField(
                          "rainfall",
                          opt.value
                        )
                      }
                    >
                      {environment.rainfall ===
                        opt.value && (
                        <span className="opt-check">
                          ✓
                        </span>
                      )}

                      <span className="opt-ico">
                        {opt.icon}
                      </span>

                      <strong className="opt-title">
                        {opt.value}
                      </strong>

                      <span className="opt-desc">
                        {opt.desc}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 9. Season */}

            <div className="config-group">
              <span className="config-label">
                9. Target Growing Season
              </span>

              <div className="options-selection-grid cols-4">
                {SEASON_OPTIONS.map(
                  (opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`env-opt-card ${
                        environment.season ===
                        opt.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleUpdateField(
                          "season",
                          opt.value
                        )
                      }
                    >
                      {environment.season ===
                        opt.value && (
                        <span className="opt-check">
                          ✓
                        </span>
                      )}

                      <span className="opt-ico">
                        {opt.icon}
                      </span>

                      <strong className="opt-title">
                        {opt.value}
                      </strong>

                      <span className="opt-desc">
                        {opt.desc}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 10. Experience */}

            <div className="config-group">
              <span className="config-label">
                10. Your Gardening Experience
              </span>

              <div className="options-selection-grid cols-3">
                {EXPERIENCE_OPTIONS.map(
                  (opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`env-opt-card ${
                        environment.experience ===
                        opt.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleUpdateField(
                          "experience",
                          opt.value
                        )
                      }
                    >
                      {environment.experience ===
                        opt.value && (
                        <span className="opt-check">
                          ✓
                        </span>
                      )}

                      <span className="opt-ico">
                        {opt.icon}
                      </span>

                      <strong className="opt-title">
                        {opt.value} Level
                      </strong>

                      <span className="opt-desc">
                        {opt.desc}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Bottom Action */}

            <div className="config-footer-actions">
              <button
                type="button"
                className="save-and-generate-btn slow-pop-btn"
                onClick={handleSaveEnvironment}
                disabled={recommendationLoading}
              >
                Save & View AI Matches
                {" "}
                (✦ {scoredRecommendations.length})
                {" "}
                →
              </button>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================
          TOAST
          ===================================================== */}

      {toastMsg && (
        <div className="rec-floating-toast slow-popup">
          <span className="toast-ico">
            ✨
          </span>

          <span>
            {toastMsg}
          </span>
        </div>
      )}
    </main>
  );
}

export default SmartRecommendations;