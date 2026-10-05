import { getPlantImage, getPlantGrowthMeta } from "./plantData";

export const STORAGE_KEYS = {
  session: "gardenGuideSession",
  user: "gardenGuideUser",
  environment: "environmentSetup",
  plants: "gardenGuidePlants",
  tasks: "gardenGuideTasks",
  notificationInbox: "gardenGuideNotificationInbox",
  notificationPrefs: "gardenGuideNotifications",
  preferences: "gardenGuidePreferences",
  assistantChat: "gardenGuideAssistantChat",
  activeUserId: "gardenGuideActiveUserId",
  theme: "gardenGuideTheme",
};

// Workspace data is namespaced by the authenticated user's id. This keeps
// browser caches isolated without forcing us to wipe the user's data on logout.
const USER_SCOPED_STORAGE_KEYS = new Set([
  STORAGE_KEYS.user,
  STORAGE_KEYS.environment,
  STORAGE_KEYS.plants,
  STORAGE_KEYS.tasks,
  STORAGE_KEYS.notificationInbox,
  STORAGE_KEYS.notificationPrefs,
  STORAGE_KEYS.preferences,
  STORAGE_KEYS.assistantChat,
]);

export function getActiveUserId() {
  try {
    return String(localStorage.getItem(STORAGE_KEYS.activeUserId) || "").trim();
  } catch {
    return "";
  }
}

export function getUserStorageKey(key, userId = getActiveUserId()) {
  if (!USER_SCOPED_STORAGE_KEYS.has(key)) return key;
  const normalizedId = String(userId || "").trim();
  return normalizedId ? `${key}:${normalizedId}` : null;
}

function readJsonValue(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJsonValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const DEMO_ACCOUNT_EMAIL = "demo@gardenguide.local";

export const EMPTY_ENVIRONMENT = {
  pincode: "",
  location: "",
  space: "",
  soil: "",
  medium: "",
  watering: "",
  sunlight: "",
  temperature: "",
  climate: "",
  humidity: "",
  locationConfidence: "",
  locationLabel: "",
  configured: false,
};

export const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    title: "Watering Reminder",
    message: "4 plants need soil moisture checks this morning.",
    time: "Just now",
    icon: "💧",
    page: "scheduler",
    read: false,
  },
  {
    id: 2,
    title: "Fungal Spore Alert",
    message: "High balcony humidity. Check leaf undersides for Powdery Mildew.",
    time: "1h ago",
    icon: "🔍",
    page: "diseasedetection",
    payload: { symptom: "White powdery coating" },
    read: false,
  },
  {
    id: 3,
    title: "Smart Recommendation",
    message: "Snake Plant & Aloe Vera match your low-light indoor profile.",
    time: "3h ago",
    icon: "✦",
    page: "recommendations",
    read: false,
  },
];

export function isDemoAccount(user) {
  return String(user?.email || "").trim().toLowerCase() === DEMO_ACCOUNT_EMAIL;
}

export function isEnvironmentConfigured(env) {
  return Boolean(env && env.configured === true);
}

export function readStoredEnvironment() {
  const parsed = readStorage(STORAGE_KEYS.environment, null);
  if (!parsed || typeof parsed !== "object" || parsed.configured !== true) {
    return { ...EMPTY_ENVIRONMENT };
  }
  return { ...EMPTY_ENVIRONMENT, ...parsed, configured: true };
}

export function markEnvironmentConfigured(env) {
  return { ...EMPTY_ENVIRONMENT, ...env, configured: true };
}

// Logout clears legacy unscoped keys and transient identity state, but leaves
// each user's namespaced garden cache intact for the next login.
export function clearClientWorkspace({ clearSession = false } = {}) {
  // Remove the currently active account's scoped session first so a later
  // login cannot inherit stale profile identity from this account.
  try {
    const activeUserId = getActiveUserId();
    const scopedSession = getUserStorageKey(STORAGE_KEYS.session, activeUserId);
    if (scopedSession) localStorage.removeItem(scopedSession);
    localStorage.removeItem(STORAGE_KEYS.activeUserId);
  } catch {
    // Ignore storage failures.
  }

  [
    STORAGE_KEYS.user,
    STORAGE_KEYS.environment,
    STORAGE_KEYS.plants,
    STORAGE_KEYS.tasks,
    STORAGE_KEYS.notificationInbox,
    STORAGE_KEYS.notificationPrefs,
    STORAGE_KEYS.preferences,
  ].forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage failures.
    }
  });

  if (clearSession) {
    try {
      localStorage.removeItem(STORAGE_KEYS.session);
    } catch {
      // Remove any legacy unscoped session left by older versions.
    }
  }
}

export function ensureWorkspaceForUser(userOrId) {
  const id = userOrId && typeof userOrId === "object"
    ? (userOrId.id || userOrId._id || userOrId.email || "")
    : userOrId;
  const normalizedId = id ? String(id) : "";
  const previousId = getActiveUserId();

  // Migrate legacy browser cache only when we can prove it belonged to the
  // same active user. Never copy ambiguous data into another account.
  if (normalizedId && previousId === normalizedId) {
    [
      STORAGE_KEYS.user,
      STORAGE_KEYS.environment,
      STORAGE_KEYS.plants,
      STORAGE_KEYS.tasks,
      STORAGE_KEYS.notificationInbox,
      STORAGE_KEYS.notificationPrefs,
      STORAGE_KEYS.preferences,
      STORAGE_KEYS.assistantChat,
    ].forEach((key) => {
      const scopedKey = getUserStorageKey(key, normalizedId);
      try {
        if (scopedKey && localStorage.getItem(scopedKey) == null) {
          const legacy = localStorage.getItem(key);
          if (legacy != null) {
            localStorage.setItem(scopedKey, legacy);
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Ignore migration failures; the API remains authoritative.
      }
    });
  }

  try {
    if (normalizedId) localStorage.setItem(STORAGE_KEYS.activeUserId, normalizedId);
    else localStorage.removeItem(STORAGE_KEYS.activeUserId);
  } catch {
    // Ignore storage failures.
  }
}

export function getNotificationInbox() {
  const items = readStorage(STORAGE_KEYS.notificationInbox, []);
  return Array.isArray(items) ? items : [];
}

export function saveNotificationInbox(items) {
  writeStorage(STORAGE_KEYS.notificationInbox, Array.isArray(items) ? items : []);
}

export const recommendationPlants = [
  { name: "Snake Plant", type: "Indoor Plant", emoji: "🌿", sunlight: "Low Light", water: "1–2 times/week", difficulty: "Easy", minSun: 0, maxSun: 5, spaces: ["Small", "Medium", "Large"], locations: ["Indoor", "Balcony"], climates: ["Tropical", "Subtropical", "Temperate", "Arid / Dry"] },
  { name: "Tulsi", type: "Herb", emoji: "🌱", sunlight: "High Light", water: "3–4 times/week", difficulty: "Easy", minSun: 4, maxSun: 8, spaces: ["Small", "Medium", "Large"], locations: ["Balcony", "Terrace", "Indoor"], climates: ["Tropical", "Subtropical"] },
  { name: "Mint", type: "Herb", emoji: "🌿", sunlight: "Medium Light", water: "Daily", difficulty: "Easy", minSun: 2, maxSun: 6, spaces: ["Small", "Medium", "Large"], locations: ["Balcony", "Terrace", "Indoor"], climates: ["Tropical", "Subtropical", "Temperate"] },
  { name: "Aloe Vera", type: "Succulent", emoji: "🌵", sunlight: "High Light", water: "1–2 times/week", difficulty: "Easy", minSun: 4, maxSun: 8, spaces: ["Small", "Medium", "Large"], locations: ["Balcony", "Terrace", "Indoor"], climates: ["Tropical", "Arid / Dry", "Subtropical"] },
  { name: "Tomato", type: "Vegetable", emoji: "🍅", sunlight: "Full Sun", water: "Daily", difficulty: "Moderate", minSun: 6, maxSun: 8, spaces: ["Medium", "Large"], locations: ["Balcony", "Terrace"], climates: ["Tropical", "Subtropical", "Temperate"] },
  { name: "Marigold", type: "Flower", emoji: "🌼", sunlight: "Full Sun", water: "3–4 times/week", difficulty: "Easy", minSun: 5, maxSun: 8, spaces: ["Small", "Medium", "Large"], locations: ["Balcony", "Terrace"], climates: ["Tropical", "Subtropical", "Temperate"] },
];

export function readStorage(key, fallback) {
  const scopedKey = getUserStorageKey(key);
  if (USER_SCOPED_STORAGE_KEYS.has(key) && !scopedKey) return fallback;
  return readJsonValue(scopedKey || key, fallback);
}

export function writeStorage(key, value) {
  const scopedKey = getUserStorageKey(key);
  if (USER_SCOPED_STORAGE_KEYS.has(key) && !scopedKey) return false;
  return writeJsonValue(scopedKey || key, value);
}

export function removeStorage(key) {
  const scopedKey = getUserStorageKey(key);
  try {
    localStorage.removeItem(scopedKey || key);
    return true;
  } catch {
    return false;
  }
}

export function getPlantGrowthInfo(plant) {
  if (!plant) {
    return {
      daysInGarden: 0,
      growthDays: 60,
      growthTime: "60 days",
      daysToHarvest: 30,
      progressPct: 50,
      harvestDateStr: "In 30 days",
      plantedDateFormatted: "Recently",
      harvestAdvice: "Harvest when fully grown.",
      harvestType: "continuous",
      isReady: false,
      harvestStage: "Vegetative Growth",
      stageColor: "#2563eb",
    };
  }

  const meta = getPlantGrowthMeta(plant.name || "", plant.type || "");
  const growthDays = Number(plant.growthDays) || meta.growthDays || 60;
  const growthTime = plant.growthTime || meta.growthTime || `${growthDays} days`;
  const harvestAdvice = plant.harvestAdvice || meta.harvestAdvice || "Harvest when plant reaches maturity.";
  const harvestType = plant.harvestType || meta.harvestType || "continuous";

  // Calculate days in garden
  let daysInGarden = 0;
  if (plant.plantedDate) {
    const plantedMs = new Date(plant.plantedDate).getTime();
    if (!isNaN(plantedMs)) {
      const diffMs = Date.now() - plantedMs;
      daysInGarden = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }
  } else if (typeof plant.daysPlanted === "number") {
    daysInGarden = plant.daysPlanted;
  }

  const daysToHarvest = Math.max(0, growthDays - daysInGarden);
  const progressPct = daysInGarden > 0
    ? Math.min(100, Math.max(0, Math.round((daysInGarden / growthDays) * 100)))
    : 0;

  const harvestDate = new Date();
  harvestDate.setDate(harvestDate.getDate() + daysToHarvest);
  const harvestDateStr = harvestDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  let plantedDateFormatted = "Recently";
  if (plant.plantedDate) {
    const pDate = new Date(plant.plantedDate);
    if (!isNaN(pDate.getTime())) {
      plantedDateFormatted = pDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  const isReady = daysInGarden >= growthDays || daysToHarvest <= 0;

  let harvestStage = "Sprout / Seedling";
  let stageColor = "#16a34a"; // green
  if (isReady) {
    harvestStage = "Ready for Harvest! 🧺";
    stageColor = "#ea580c";
  } else if (progressPct >= 70) {
    harvestStage = "Budding / Fruiting";
    stageColor = "#d97706";
  } else if (progressPct >= 30) {
    harvestStage = "Vegetative Growth";
    stageColor = "#2563eb";
  } else {
    harvestStage = "Sprout / Seedling";
    stageColor = "#16a34a";
  }

  return {
    daysInGarden,
    growthDays,
    growthTime,
    daysToHarvest,
    progressPct,
    harvestDateStr,
    plantedDateFormatted,
    harvestAdvice,
    harvestType,
    isReady,
    harvestStage,
    stageColor,
  };
}

export function getSavedPlants() {
  const plants = readStorage(STORAGE_KEYS.plants, []);

  if (Array.isArray(plants) && plants.length > 0) {
    return plants.map((p) => {
      const meta = getPlantGrowthMeta(p.name || "", p.type || "");
      const growthDays = Number(p.growthDays) || meta.growthDays || 60;
      const growthTime = p.growthTime || meta.growthTime || `${growthDays} days`;
      const plantedDate = p.plantedDate || null;
      const harvestAdvice = p.harvestAdvice || meta.harvestAdvice || "Harvest when mature.";
      const harvestType = p.harvestType || meta.harvestType || "continuous";

      return {
        ...p,
        image: p.image && !p.image.includes("blob:") ? p.image : getPlantImage(p.name),
        plantedDate,
        growthDays,
        growthTime,
        harvestAdvice,
        harvestType,
      };
    });
  }
  return Array.isArray(plants) ? plants : [];
}

export function savePlants(plants) {
  writeStorage(STORAGE_KEYS.plants, plants);
}

export function getSavedTasks() {
  const tasks = readStorage(STORAGE_KEYS.tasks, null);
  if (Array.isArray(tasks) && tasks.length > 0) {
    // If older tasks stored without enriched understanding fields, enrich them
    return tasks.map((t) => ({
      ...t,
      plantName: t.plantName || "Garden Plant",
      plantEmoji: t.plantEmoji || (t.type === "water" ? "💧" : t.type === "fertilizer" ? "🌱" : "🌿"),
      plantImage: t.plantImage || (t.plantName ? getPlantImage(t.plantName) : undefined),
      why: t.why || "Consistent botanical care prevents stress, builds natural pest resistance, and promotes steady growth.",
      how: Array.isArray(t.how) && t.how.length > 0 ? t.how : [
        "Inspect soil moisture and foliage health.",
        "Perform care carefully adhering to root and light requirements.",
        "Check drainage to ensure no root rot occurs."
      ],
      tools: t.tools || "Standard garden care tools",
      priority: t.priority || "Medium",
      frequency: t.frequency || "Regular Cadence",
    }));
  }
  return [];
}

export function saveTasks(tasks) {
  writeStorage(STORAGE_KEYS.tasks, tasks);
}

export function generateTasksFromPlants(plants) {
  if (!Array.isArray(plants) || plants.length === 0) {
    return [];
  }
  const generated = [];
  let idCounter = Date.now();

  plants.forEach((plant) => {
    const name = plant.name || "Plant";
    const type = (plant.type || "").toLowerCase();
    const img = plant.image || getPlantImage(name);

    if (type.includes("veg") || name.toLowerCase().includes("tomato") || name.toLowerCase().includes("pepper") || name.toLowerCase().includes("chilli")) {
      generated.push({
        id: ++idCounter,
        title: `Deep Root Watering for ${name}`,
        plantName: name,
        plantType: plant.type || "Vegetable",
        plantEmoji: plant.emoji || "🍅",
        plantImage: img,
        description: `Pour 350–500ml water directly at stem base; keep leaves dry to prevent fungal blight.`,
        time: "07:30 AM",
        completed: false,
        type: "water",
        icon: "💧",
        priority: "High",
        frequency: "Daily (Morning)",
        why: `${name} demands consistent moisture during flowering and fruiting. Wet foliage causes early blight and blossom-end rot.`,
        how: [
          "Check top 2 inches of soil: water if dry to touch.",
          "Target water strictly at soil level; avoid splashing wet soil on foliage.",
          "Empty saucer runoff after 15 minutes to keep root zones aerated."
        ],
        tools: "Narrow-spout watering can, moisture meter",
        weatherNote: "Perform early morning before hot sunshine accelerates evaporation."
      });
      generated.push({
        id: ++idCounter,
        title: `Organic Compost Feed for ${name}`,
        plantName: name,
        plantType: plant.type || "Vegetable",
        plantEmoji: plant.emoji || "🌱",
        plantImage: img,
        description: `Work 2 handfuls of rich vermicompost or seaweed feed into topsoil around root drip-line.`,
        time: "10:00 AM",
        completed: false,
        type: "fertilizer",
        icon: "🌱",
        priority: "Medium",
        frequency: "Every 2 Weeks",
        why: `Fruiting crops deplete potassium and calcium fast. Organic feeding promotes sweet, plentiful harvests.`,
        how: [
          "Gently loosen top 1 inch of soil with a trowel, keeping clear of main stem.",
          "Spread 2 tablespoons of vermicompost or organic compost evenly.",
          "Water thoroughly to wash nutrients down to feeder roots."
        ],
        tools: "Hand trowel, vermicompost or seaweed extract",
        weatherNote: "Feed on mild overcast days or during morning hours."
      });
    } else if (type.includes("flower") || name.toLowerCase().includes("rose") || name.toLowerCase().includes("marigold") || name.toLowerCase().includes("hibiscus")) {
      generated.push({
        id: ++idCounter,
        title: `Deadheading & Grooming for ${name}`,
        plantName: name,
        plantType: plant.type || "Flower",
        plantEmoji: plant.emoji || "🌹",
        plantImage: img,
        description: `Snip wilted or spent flowers 1/4 inch above the first healthy outward leaf node.`,
        time: "09:00 AM",
        completed: false,
        type: "prune",
        icon: "✂️",
        priority: "Medium",
        frequency: "Every 3–4 Days",
        why: `Removing old blooms stops seed formation, redirecting vital sugars into continuous, vibrant flowers.`,
        how: [
          "Sterilize pruners with rubbing alcohol before cutting.",
          "Locate the first healthy outward-facing 5-leaflet leaf node below spent bloom.",
          "Make a clean 45-degree angle cut slanting away from new growth bud."
        ],
        tools: "Bypass pruners, gardening gloves",
        weatherNote: "Prune on clear dry mornings to let cuts callus quickly."
      });
      generated.push({
        id: ++idCounter,
        title: `Soil Hydration for ${name}`,
        plantName: name,
        plantType: plant.type || "Flower",
        plantEmoji: plant.emoji || "🌸",
        plantImage: img,
        description: `Soak soil gently until moisture reaches 3 inches depth. Avoid wetting petals.`,
        time: "08:15 AM",
        completed: false,
        type: "water",
        icon: "💧",
        priority: "High",
        frequency: "Daily",
        why: `Flowering shrubs have active transpiration and demand consistent hydration to sustain crisp blossoms.`,
        how: [
          "Feel soil around the plant perimeter.",
          "Water gently at the base without soaking delicate petals.",
          "Ensure pot drainage holes are clear."
        ],
        tools: "Watering can with rosette spreader",
        weatherNote: "Water early in the morning so surface moisture dissipates before evening."
      });
    } else if (type.includes("succulent") || name.toLowerCase().includes("aloe")) {
      generated.push({
        id: ++idCounter,
        title: `Dryness & Drainage Inspection for ${name}`,
        plantName: name,
        plantType: plant.type || "Succulent",
        plantEmoji: plant.emoji || "🌵",
        plantImage: img,
        description: `Verify soil is 100% dry through entire container before considering watering.`,
        time: "04:30 PM",
        completed: false,
        type: "moisture",
        icon: "🪣",
        priority: "Low",
        frequency: "Every 10–14 Days",
        why: `Succulents store water in flesh. Any soggy soil quickly rots fragile roots and leads to collapsed leaves.`,
        how: [
          "Insert a wooden skewer down to the bottom third of the pot.",
          "Pull it out: if damp soil clings, wait 4–6 more days.",
          "If completely dry, give a thorough soak until water flows out the bottom, then drain saucer."
        ],
        tools: "Wooden skewer or digital soil moisture probe",
        weatherNote: "Requires bright sunlight and excellent air circulation."
      });
    } else {
      // Herbs & Foliage
      generated.push({
        id: ++idCounter,
        title: `Morning Hydration for ${name}`,
        plantName: name,
        plantType: plant.type || "Herb",
        plantEmoji: plant.emoji || "🌿",
        plantImage: img,
        description: `Provide steady 200ml drink to keep potting mix evenly moist like a wrung-out sponge.`,
        time: "08:00 AM",
        completed: false,
        type: "water",
        icon: "💧",
        priority: "High",
        frequency: "Daily",
        why: `Herbs produce delicate root hair systems that quickly wilt under dry surface conditions.`,
        how: [
          "Check soil moisture by touching top inch.",
          "Water evenly around the rim of the pot.",
          "Avoid puddling or waterlogging."
        ],
        tools: "Watering can, spray mister",
        weatherNote: "Morning watering maximizes daylight absorption and metabolic growth."
      });
      generated.push({
        id: ++idCounter,
        title: `Pinch Shoot Tips for ${name}`,
        plantName: name,
        plantType: plant.type || "Herb",
        plantEmoji: plant.emoji || "✂️",
        plantImage: img,
        description: `Pinch the top central growth tip with fingertips to encourage dense side branches.`,
        time: "04:00 PM",
        completed: false,
        type: "prune",
        icon: "✂️",
        priority: "Medium",
        frequency: "Weekly",
        why: `Pinching suppresses apical dominance, forcing the herb to branch out bushy instead of tall and leggy.`,
        how: [
          "Find the top set of leaves on each main stem.",
          "Use clean fingernails or small shears to snip just above the next pair of leaves.",
          "Save the pinched leaves for fresh cooking!"
        ],
        tools: "Clean shears or fingertip pinch",
        weatherNote: "Best done in late afternoon or evening."
      });
    }
  });

  return generated;
}

export function getPlantRecommendations(environment) {
  if (!isEnvironmentConfigured(environment)) return [];
  const sunlight = String(environment.sunlight || "").toLowerCase();
  const sunHours = sunlight.includes("low") ? 1 : sunlight.includes("medium") ? 4 : sunlight.includes("full") ? 8 : 6;

  return recommendationPlants
    .map((plant) => {
      let score = 0;
      if (plant.locations.includes(environment.location)) score += 3;
      if (plant.spaces.includes(environment.space)) score += 3;
      if (plant.climates.includes(environment.climate)) score += 2;
      if (sunHours >= plant.minSun && sunHours <= plant.maxSun) score += 4;
      if (environment.medium === "Hydroponics" && plant.name === "Mint") score += 2;
      return { ...plant, matchScore: score };
    })
    .filter((plant) => plant.matchScore >= 5)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}
