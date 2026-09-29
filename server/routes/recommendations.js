import express from "express";
import { Plant } from "../models/Plant.js";
import { PLANT_SEED_DATA } from "../data/plants.js";
import { analyzePincode } from "../data/pincodes.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* =========================================================
   PINCODE / LOCATION ANALYSIS
   ========================================================= */

router.post("/analyze-location", requireAuth, async (req, res) => {
  const pincode = String(req.body?.pincode || "").replace(/\D/g, "");

  if (pincode.length !== 6) {
    return res.status(400).json({
      message: "Enter a valid 6-digit Indian pincode.",
    });
  }

  const profile = analyzePincode(pincode);

  return res.json({
    profile: {
      ...profile,
      pincode,
      source: profile.matched
        ? "curated pincode mapping"
        : "zone estimate",
    },
  });
});

/* =========================================================
   HELPERS
   ========================================================= */

const normalize = (value) => String(value || "").trim().toLowerCase();

const parseRange = (value) => {
  const text = String(value || "")
    .replace(/,/g, ".")
    .replace(/−/g, "-")
    .replace(/–/g, "-");

  const match = text.match(
    /(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)/
  );

  if (!match) return null;

  return {
    min: Number(match[1]),
    max: Number(match[2]),
  };
};

const parseFirstNumber = (value) => {
  const match = String(value || "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const clamp = (value, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

/* =========================================================
   SUNLIGHT MATCHING
   ========================================================= */

function scoreSunlight(plant, requestedSunlight) {
  const desired = normalize(requestedSunlight);
  const plantSun = normalize(plant.sunlight);

  const plantRange = parseRange(plant.sunlight);
  const plantMax = plantRange?.max ?? parseFirstNumber(plant.sunlight);

  const hasLow =
    plantSun.includes("low") ||
    plantSun.includes("indirect") ||
    plantSun.includes("shade");

  const hasPartial =
    plantSun.includes("partial") ||
    plantSun.includes("morning");

  const hasFull =
    plantSun.includes("full") ||
    plantSun.includes("direct") ||
    plantSun.includes("bright");

  if (desired.includes("full")) {
    if (hasFull || (plantRange && plantRange.min >= 5)) return 100;
    if (plantRange && plantRange.max >= 6) return 88;
    if (hasPartial) return 58;
    if (hasLow) return 30;
    return 55;
  }

  if (desired.includes("high")) {
    if (hasFull || (plantRange && plantRange.min >= 5)) return 100;
    if (plantRange && plantRange.max >= 6) return 90;
    if (hasPartial) return 60;
    if (hasLow) return 30;
    return 55;
  }

  if (desired.includes("medium")) {
    if (
      hasPartial ||
      (plantRange && plantRange.min <= 5 && plantRange.max >= 3)
    ) {
      return 100;
    }

    if (plantRange && plantRange.max >= 4) return 82;
    if (hasFull) return 58;
    if (hasLow && plantMax != null && plantMax >= 2) return 55;

    return 50;
  }

  // Low light
  if (hasLow) return 100;

  if (plantRange && plantRange.max <= 3) return 92;

  if (
    plantRange &&
    plantRange.min <= 2 &&
    plantRange.max >= 2
  ) {
    return 78;
  }

  if (hasPartial) return 55;
  if (hasFull) return 35;

  return 50;
}

/* =========================================================
   TEMPERATURE MATCHING
   ========================================================= */

function scoreTemperature(plant, environment) {
  const numericTemp = Number(environment.numericTemp);
  const requestedRange = String(environment.temperature || "");

  let targetTemp = Number.isFinite(numericTemp)
    ? numericTemp
    : null;

  if (targetTemp === null) {
    const parsedRequested = parseRange(requestedRange);

    if (parsedRequested) {
      targetTemp = (parsedRequested.min + parsedRequested.max) / 2;
    }
  }

  if (targetTemp === null) {
    return 60;
  }

  const plantRange = parseRange(plant.temp);

  if (!plantRange) {
    return 60;
  }

  if (targetTemp >= plantRange.min && targetTemp <= plantRange.max) {
    return 100;
  }

  const distance =
    targetTemp < plantRange.min
      ? plantRange.min - targetTemp
      : targetTemp - plantRange.max;

  if (distance <= 2) return 88;
  if (distance <= 5) return 68;
  if (distance <= 8) return 45;

  return 25;
}

/* =========================================================
   SOIL / GROWING MEDIUM
   ========================================================= */

function scoreSoil(plant, environment) {
  const requested = normalize(
    environment.medium || environment.soil || "Potting Mix"
  );

  const plantSoil = normalize(plant.soil);

  if (requested.includes("hydroponics")) {
    if (plantSoil.includes("hydro")) return 100;

    // Current plant dataset does not have hydroponic soil entries.
    return 25;
  }

  if (requested.includes("cocopeat")) {
    if (
      plantSoil.includes("coco") ||
      plantSoil.includes("coir") ||
      plantSoil.includes("moisture")
    ) {
      return 100;
    }

    if (
      plantSoil.includes("potting") ||
      plantSoil.includes("well-draining")
    ) {
      return 72;
    }

    return 50;
  }

  if (requested.includes("potting")) {
    if (
      plantSoil.includes("potting") ||
      plantSoil.includes("compost") ||
      plantSoil.includes("well-draining")
    ) {
      return 100;
    }

    if (plantSoil.includes("loamy")) return 82;

    return 50;
  }

  // Traditional soil
  if (
    plantSoil.includes("soil") ||
    plantSoil.includes("loam") ||
    plantSoil.includes("loamy")
  ) {
    return 100;
  }

  if (plantSoil.includes("potting")) return 72;

  return 55;
}

/* =========================================================
   WATERING CAPACITY
   ========================================================= */

function scoreWatering(plant, requestedWatering) {
  const requested = String(requestedWatering || "Moderate");
  const plantNeed = String(plant.wateringNeed || "Moderate");

  if (plantNeed === requested) return 100;

  if (
    requested === "Moderate" &&
    (plantNeed === "Low" || plantNeed === "High")
  ) {
    return 75;
  }

  if (
    requested === "High" &&
    plantNeed === "Moderate"
  ) {
    return 78;
  }

  if (
    requested === "Low" &&
    plantNeed === "Moderate"
  ) {
    return 48;
  }

  if (
    requested === "Low" &&
    plantNeed === "High"
  ) {
    return 25;
  }

  return 60;
}

/* =========================================================
   SOIL MOISTURE
   ========================================================= */

function scoreSoilMoisture(plant, requestedMoisture) {
  const requested = normalize(requestedMoisture || "Moderate");
  const soil = normalize(plant.soil);
  const water = normalize(plant.water);

  const prefersDry =
    soil.includes("very well-draining") ||
    soil.includes("free-draining") ||
    water.includes("once a week") ||
    water.includes("every 10") ||
    water.includes("every 14");

  const prefersMoist =
    soil.includes("moist") ||
    water.includes("daily") ||
    water.includes("2-3 times") ||
    plant.wateringNeed === "High";

  if (requested === "dry") {
    if (prefersDry) return 100;
    if (prefersMoist) return 35;
    return 65;
  }

  if (requested === "moist") {
    if (prefersMoist) return 100;
    if (prefersDry) return 35;
    return 65;
  }

  // Moderate
  if (prefersDry || prefersMoist) return 72;

  return 90;
}

/* =========================================================
   RAINFALL
   ========================================================= */

function scoreRainfall(plant, rainfall) {
  const requested = normalize(rainfall || "Moderate");
  const waterNeed = plant.wateringNeed;

  if (requested.includes("high")) {
    if (waterNeed === "Low") return 92;
    if (waterNeed === "Moderate") return 82;
    return 68;
  }

  if (requested.includes("low")) {
    if (waterNeed === "Low") return 95;
    if (waterNeed === "Moderate") return 80;
    return 60;
  }

  // Moderate rainfall
  return 82;
}

/* =========================================================
   HUMIDITY
   NOTE:
   Plant model does not currently contain a dedicated humidity
   field, so humidity is represented indirectly using soil,
   watering, and moisture characteristics.
   ========================================================= */

function scoreHumidity(plant, environment) {
  const humidity = Number(environment.numericHumidity);

  if (!Number.isFinite(humidity)) {
    const level = normalize(environment.humidity);

    if (level.includes("high")) return 65;
    if (level.includes("low")) return 65;

    return 70;
  }

  const soil = normalize(plant.soil);
  const water = normalize(plant.water);

  const moistureFriendly =
    soil.includes("moist") ||
    water.includes("daily") ||
    plant.wateringNeed === "High";

  const dryFriendly =
    soil.includes("very well-draining") ||
    soil.includes("free-draining") ||
    plant.wateringNeed === "Low";

  if (humidity >= 70) {
    if (moistureFriendly) return 92;
    if (dryFriendly) return 45;
    return 70;
  }

  if (humidity <= 35) {
    if (dryFriendly) return 92;
    if (moistureFriendly) return 52;
    return 70;
  }

  return 82;
}

/* =========================================================
   SPACE
   ========================================================= */

function scoreSpace(plant, requestedSpace) {
  const space = String(requestedSpace || "Medium");

  if (Array.isArray(plant.spaces) && plant.spaces.includes(space)) {
    return 100;
  }

  // If no exact match, compare nearby capacities.
  if (space === "Small" && plant.spaces?.includes("Medium")) {
    return 55;
  }

  if (
    space === "Medium" &&
    (plant.spaces?.includes("Small") || plant.spaces?.includes("Large"))
  ) {
    return 70;
  }

  if (space === "Large" && plant.spaces?.includes("Medium")) {
    return 72;
  }

  return 30;
}

/* =========================================================
   CLIMATE
   ========================================================= */

function scoreClimate(plant, climate) {
  const requested = String(climate || "").trim();

  if (
    Array.isArray(plant.climates) &&
    plant.climates.includes(requested)
  ) {
    return 100;
  }

  return 35;
}

/* =========================================================
   GARDENING EXPERIENCE / DIFFICULTY
   ========================================================= */

function scoreExperience(plant, experience) {
  const exp = normalize(experience || "Beginner");
  const difficulty = normalize(plant.difficulty);

  if (exp === "beginner") {
    if (difficulty.includes("very easy")) return 100;
    if (difficulty.includes("easy")) return 94;
    if (difficulty.includes("moderate")) return 65;
    if (difficulty.includes("hard")) return 35;
    return 70;
  }

  if (exp === "intermediate") {
    if (difficulty.includes("moderate")) return 100;
    if (difficulty.includes("easy")) return 88;
    if (difficulty.includes("very easy")) return 78;
    return 70;
  }

  // Advanced
  if (difficulty.includes("hard")) return 100;
  if (difficulty.includes("moderate")) return 92;
  if (difficulty.includes("easy")) return 82;
  return 75;
}

/* =========================================================
   LOCATION
   Plant data does not have a dedicated location field.
   Use description + space information as a light signal.
   ========================================================= */

function scoreLocation(plant, location) {
  const requested = normalize(location);
  const description = normalize(plant.description);

  if (!requested) return 70;

  if (requested.includes("indoor")) {
    if (
      description.includes("indoor") ||
      description.includes("windowsill") ||
      description.includes("shaded")
    ) {
      return 100;
    }

    if (
      description.includes("balcon") ||
      description.includes("terrace")
    ) {
      return 60;
    }

    return 70;
  }

  if (requested.includes("terrace")) {
    if (
      description.includes("terrace") ||
      description.includes("open-sky") ||
      description.includes("sunny")
    ) {
      return 100;
    }

    return 72;
  }

  // Balcony
  if (
    description.includes("balcon") ||
    description.includes("container")
  ) {
    return 100;
  }

  return 75;
}

/* =========================================================
   SEASON
   NOTE:
   Plant model currently has no seasons field.
   We therefore use season only as a very small signal through
   the plant's temperature compatibility.
   ========================================================= */

function scoreSeason(plant, environment) {
  const season = normalize(environment.season);

  if (!season || season === "all year") {
    return 80;
  }

  const plantRange = parseRange(plant.temp);

  if (!plantRange) return 70;

  if (season === "summer") {
    if (plantRange.max >= 30) return 95;
    if (plantRange.max >= 26) return 82;
    return 55;
  }

  if (season === "winter") {
    if (plantRange.min <= 20) return 95;
    if (plantRange.min <= 24) return 82;
    return 55;
  }

  if (season === "monsoon") {
    if (
      plant.wateringNeed === "High" ||
      normalize(plant.soil).includes("moist")
    ) {
      return 90;
    }

    return 72;
  }

  return 75;
}

/* =========================================================
   FINAL PLANT SCORING
   ========================================================= */

function scorePlant(plant, env, profile) {
  /*
   * USER ENVIRONMENT VALUES TAKE PRIORITY.
   * PINCODE PROFILE fills only information that is missing.
   *
   * This means:
   * Pincode -> regional baseline
   * Manual selection -> final personalized preference
   */

  const effective = {
    ...profile,
    ...env,
  };

  const components = [
    {
      key: "space",
      score: scoreSpace(plant, effective.space),
      weight: 18,
      reason:
        Array.isArray(plant.spaces) &&
        plant.spaces.includes(effective.space)
          ? `${effective.space} space compatible`
          : null,
    },

    {
      key: "sunlight",
      score: scoreSunlight(plant, effective.sunlight),
      weight: 16,
      reason: null,
    },

    {
      key: "watering",
      score: scoreWatering(plant, effective.watering),
      weight: 14,
      reason:
        plant.wateringNeed === effective.watering
          ? `${effective.watering.toLowerCase()} watering fit`
          : null,
    },

    {
      key: "soil",
      score: scoreSoil(plant, effective),
      weight: 12,
      reason: null,
    },

    {
      key: "temperature",
      score: scoreTemperature(plant, effective),
      weight: 12,
      reason: null,
    },

    {
      key: "climate",
      score: scoreClimate(plant, effective.climate),
      weight: 10,
      reason:
        Array.isArray(plant.climates) &&
        plant.climates.includes(effective.climate)
          ? `${effective.climate} climate compatible`
          : null,
    },

    {
      key: "soilMoisture",
      score: scoreSoilMoisture(
        plant,
        effective.soilMoisture
      ),
      weight: 6,
      reason: null,
    },

    {
      key: "humidity",
      score: scoreHumidity(plant, effective),
      weight: 4,
      reason: null,
    },

    {
      key: "rainfall",
      score: scoreRainfall(
        plant,
        effective.rainfall
      ),
      weight: 3,
      reason: null,
    },

    {
      key: "experience",
      score: scoreExperience(
        plant,
        effective.experience
      ),
      weight: 3,
      reason:
        normalize(effective.experience) === "beginner" &&
        normalize(plant.difficulty).includes("easy")
          ? "Beginner-friendly care level"
          : null,
    },

    {
      key: "location",
      score: scoreLocation(
        plant,
        effective.location
      ),
      weight: 1,
      reason: null,
    },

    {
      key: "season",
      score: scoreSeason(
        plant,
        effective
      ),
      weight: 1,
      reason: null,
    },
  ];

  const weightedTotal = components.reduce(
    (total, component) =>
      total +
      (component.score * component.weight) / 100,
    0
  );

  const finalScore = Math.round(
    clamp(weightedTotal, 40, 99)
  );

  const positiveComponents = components
    .filter((component) => component.score >= 82)
    .sort((a, b) => b.score - a.score);

  const reasons = positiveComponents
    .map((component) => component.reason)
    .filter(Boolean);

  const fallbackReasons = [];

  if (components.find((c) => c.key === "sunlight")?.score >= 82) {
    fallbackReasons.push(
      `sunlight aligns with ${effective.sunlight || "your setup"}`
    );
  }

  if (
    components.find((c) => c.key === "temperature")?.score >= 82
  ) {
    fallbackReasons.push(
      `temperature is suitable for ${effective.numericTemp || effective.temperature || "your region"}`
    );
  }

  if (
    components.find((c) => c.key === "soil")?.score >= 82
  ) {
    fallbackReasons.push(
      `compatible with your ${effective.medium || effective.soil || "growing medium"}`
    );
  }

  if (
    components.find((c) => c.key === "experience")?.score >= 82
  ) {
    fallbackReasons.push(
      `${effective.experience || "your"} experience level is a good fit`
    );
  }

  const finalReasons = [
    ...reasons,
    ...fallbackReasons,
  ];

  return {
    score: finalScore,
    reasons: [...new Set(finalReasons)].slice(0, 3),
  };
}

/* =========================================================
   RECOMMENDATION ENDPOINT
   ========================================================= */

router.post("/", requireAuth, async (req, res) => {
  try {
    const env = req.body || {};

    const pincode = String(env.pincode || "")
      .replace(/\D/g, "");

    const hasProfile =
      env.configured === true ||
      pincode.length === 6;

    if (!hasProfile) {
      return res.json({
        profile: {
          pincode,
          configured: false,
        },
        recommendations: [],
      });
    }

    /*
     * Pincode profile provides regional baseline information.
     * Manual environment values from the frontend override it
     * wherever the user has supplied them.
     */
    const profile =
      pincode.length === 6
        ? analyzePincode(pincode)
        : {
            climate: "",
            sunlight: "",
            temperature: "",
            humidity: "",
            matched: false,
            label: env.locationLabel || "",
            city: "",
            state: "",
          };

    const stored = await Plant.find().lean();

    /*
     * Use database plants when available.
     * Fall back to the project's seed data if the database
     * does not contain plants yet.
     */
    const plants =
      stored.length > 0
        ? stored
        : PLANT_SEED_DATA;

    const recommendations = plants
      .map((plant) => {
        const { score, reasons } = scorePlant(
          plant,
          env,
          profile
        );

        return {
          ...plant,

          /*
           * Frontend expects matchScore.
           */
          matchScore: score,

          /*
           * Frontend displays matchReason.
           */
          matchReason:
            reasons.length > 0
              ? reasons.join(" • ")
              : `Balanced match for ${
                  env.location ||
                  profile.label ||
                  "your garden"
                } under ${
                  env.climate ||
                  profile.climate ||
                  "regional"
                } conditions.`,
        };
      })
      .sort(
        (a, b) => b.matchScore - a.matchScore
      )
      .slice(0, 12);

    return res.json({
      profile: {
        ...profile,
        pincode,
      },
      recommendations,
    });
  } catch (error) {
    console.error("recommendations", error);

    return res.status(500).json({
      message: "Unable to generate recommendations.",
    });
  }
});

export default router;