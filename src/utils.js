import { getPlantImage, getPlantGrowthMeta } from "./plantData";

export const STORAGE_KEYS = {
  session: "gardenGuideSession",
  user: "gardenGuideUser",
  environment: "environmentSetup",
  plants: "gardenGuidePlants",
  tasks: "gardenGuideTasks",
};

export function getPastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

export const defaultPlants = [
  {
    id: 1,
    name: "Tomato",
    type: "Vegetable",
    emoji: "🍅",
    status: "Healthy",
    statusType: "healthy",
    sunlight: "6–8 hrs",
    water: "Daily",
    watered: "Watered Today",
    moisture: 80,
    plantedDate: getPastDate(38),
    growthDays: 75,
    growthTime: "60–85 days",
    harvestAdvice: "Harvest when tomatoes turn uniformly rich red and yield slightly to a gentle squeeze.",
    harvestType: "single",
    image: getPlantImage("Tomato"),
  },
  {
    id: 2,
    name: "Mint",
    type: "Herb",
    emoji: "🌿",
    status: "Healthy",
    statusType: "healthy",
    sunlight: "4–6 hrs",
    water: "Daily",
    watered: "Watered Today",
    moisture: 85,
    plantedDate: getPastDate(20),
    growthDays: 25,
    growthTime: "20–30 days",
    harvestAdvice: "Snip sprigs 1 inch above soil level. Fresh shoots regenerate rapidly within 10–14 days.",
    harvestType: "continuous",
    image: getPlantImage("Mint"),
  },
  {
    id: 3,
    name: "Rose",
    type: "Flower",
    emoji: "🌹",
    status: "Needs Water",
    statusType: "warning",
    sunlight: "6–8 hrs",
    water: "Daily",
    watered: "Water last: 2 days ago",
    moisture: 30,
    plantedDate: getPastDate(42),
    growthDays: 50,
    growthTime: "45–60 days",
    harvestAdvice: "Cut flower stems early morning at 45° angle when outer petals begin loosening.",
    harvestType: "repeat-bloom",
    image: getPlantImage("Rose"),
  },
  {
    id: 4,
    name: "Basil (Tulsi)",
    type: "Herb",
    emoji: "🌱",
    status: "Healthy",
    statusType: "healthy",
    sunlight: "4–6 hrs",
    water: "2–3 times/wk",
    watered: "Watered Today",
    moisture: 75,
    plantedDate: getPastDate(28),
    growthDays: 35,
    growthTime: "30–45 days",
    harvestAdvice: "Pinch top 2-3 leaf pairs regularly. Stimulates continuous bushiness and fresh medicinal leaves.",
    harvestType: "continuous",
    image: getPlantImage("Basil"),
  },
  {
    id: 5,
    name: "Aloe Vera",
    type: "Succulent",
    emoji: "🌵",
    status: "Healthy",
    statusType: "healthy",
    sunlight: "4–6 hrs",
    water: "1–2 times/week",
    watered: "Watered Yesterday",
    moisture: 90,
    plantedDate: getPastDate(65),
    growthDays: 75,
    growthTime: "60–90 days",
    harvestAdvice: "Slice thick, fleshy bottom outer leaves flush with trunk using a clean sharp knife for soothing gel.",
    harvestType: "continuous",
    image: getPlantImage("Aloe Vera"),
  },
  {
    id: 6,
    name: "Curry Leaf",
    type: "Herb",
    emoji: "🍃",
    status: "Healthy",
    statusType: "healthy",
    sunlight: "6–8 hrs",
    water: "Daily",
    watered: "Watered Today",
    moisture: 70,
    plantedDate: getPastDate(42),
    growthDays: 45,
    growthTime: "40–60 days",
    harvestAdvice: "Snip entire compound leaflets at stem base. Regular pruning keeps shrub bushy and aromatic.",
    harvestType: "continuous",
    image: getPlantImage("Curry Leaf"),
  },
];

export const defaultTasks = [
  {
    id: 1,
    title: "Deep Root Watering for Tomato",
    plantName: "Tomato",
    plantType: "Vegetable",
    plantEmoji: "🍅",
    plantImage: getPlantImage("Tomato"),
    description: "Pour 400ml lukewarm water at the stem base, keeping foliage dry to prevent blight.",
    time: "07:30 AM",
    completed: false,
    type: "water",
    icon: "💧",
    iconClass: "water",
    priority: "High",
    frequency: "Daily (Morning)",
    why: "Tomatoes need deep consistent moisture during flowering & fruiting to prevent blossom-end rot and fruit cracking. Wet leaves encourage fungal blight.",
    how: [
      "Check top 2 inches of soil: if dry to the touch, water deeply.",
      "Direct water gently around the stem base; avoid splashing soil onto leaves.",
      "Stop when water begins trickling out of bottom drainage holes."
    ],
    tools: "Narrow-spout watering can, moisture meter or finger test",
    weatherNote: "Best completed before 9:00 AM before afternoon sun causes rapid evaporation."
  },
  {
    id: 2,
    title: "Deadheading Spent Blooms on Rose",
    plantName: "Rose",
    plantType: "Flower",
    plantEmoji: "🌹",
    plantImage: getPlantImage("Rose"),
    description: "Snip faded flowers 1/4 inch above the first 5-leaflet outward-facing leaf node.",
    time: "09:00 AM",
    completed: false,
    type: "prune",
    icon: "✂️",
    iconClass: "prune",
    priority: "Medium",
    frequency: "Every 3–4 Days",
    why: "Removing spent flowers redirects the plant's metabolic energy from seed/hip production back into forming vibrant new flower buds and strong cane growth.",
    how: [
      "Sterilize pruning shears with rubbing alcohol or dilute soapy water.",
      "Locate a healthy leaf node with 5 leaflets that points outward from the bush center.",
      "Cut at a 45-degree angle slanting away from the bud, roughly 6mm (1/4\") above it."
    ],
    tools: "Bypass pruning shears, gardening gloves",
    weatherNote: "Prune on dry sunny mornings so the cut seals quickly against spores."
  },
  {
    id: 3,
    title: "Liquid Organic Feed for Mint",
    plantName: "Mint",
    plantType: "Herb",
    plantEmoji: "🌿",
    plantImage: getPlantImage("Mint"),
    description: "Apply 1/2 strength seaweed extract or vermicompost tea to stimulate leafy foliage.",
    time: "10:30 AM",
    completed: false,
    type: "fertilizer",
    icon: "🌱",
    iconClass: "fertilizer",
    priority: "Medium",
    frequency: "Bi-weekly",
    why: "Mint is a fast-growing vegetative herb. Nitrogen-rich organic liquid feed boosts essential oil production and lush green leaf development without burning tender feeder roots.",
    how: [
      "Dilute seaweed or compost tea to half recommended strength (light amber color).",
      "Moisten the soil lightly with plain water first (never fertilize bone-dry soil).",
      "Drench the soil evenly around the pot rim."
    ],
    tools: "Liquid organic seaweed extract / compost tea, measuring cap",
    weatherNote: "Avoid midday heat during fertilization to prevent root shock."
  },
  {
    id: 4,
    title: "Drought & Drainage Check on Aloe Vera",
    plantName: "Aloe Vera",
    plantType: "Succulent",
    plantEmoji: "🌵",
    plantImage: getPlantImage("Aloe Vera"),
    description: "Test bottom soil dryness with a wooden skewer. Do NOT water if moisture is detected.",
    time: "04:30 PM",
    completed: false,
    type: "moisture",
    icon: "🪣",
    iconClass: "moisture",
    priority: "Low",
    frequency: "Once every 10–14 Days",
    why: "Aloe vera stores abundant gel in its fleshy leaves. Overwatering causes root rot, fungal collar rot, and soft translucent leaves. Soil must dry out 100% between waterings.",
    how: [
      "Insert a wooden chopstick or skewer 3 inches deep near the root zone.",
      "Withdraw the stick: if dry and clean with no soil clinging, it's ready for water.",
      "If cool or damp, postpone watering for another 4–5 days."
    ],
    tools: "Wooden moisture skewer or probe",
    weatherNote: "Aloes thrive in warm, well-ventilated dry air. Ensure drainage saucer is empty."
  },
  {
    id: 5,
    title: "Neem Oil Spray & Foliar Inspect on Curry Leaf",
    plantName: "Curry Leaf",
    plantType: "Herb",
    plantEmoji: "🍃",
    plantImage: getPlantImage("Curry Leaf"),
    description: "Inspect leaf undersides for psyllids or mites; spray dilute neem oil solution.",
    time: "05:30 PM",
    completed: false,
    type: "prune",
    icon: "🌿",
    iconClass: "prune",
    priority: "High",
    frequency: "Weekly",
    why: "Curry leaf shrubs are prone to citrus psyllids and scale insects. Regular inspection and organic neem mist keep leaves pest-free and fragrant for culinary use.",
    how: [
      "Mix 5ml cold-pressed neem oil + 2 drops mild dish soap into 1 liter warm water.",
      "Shake bottle thoroughly to emulsify.",
      "Spray undersides of leaves and young shoot tips until lightly dripping."
    ],
    tools: "Fine-mist spray bottle, cold-pressed organic neem oil",
    weatherNote: "Apply exclusively in late evening/sunset so sun does not scorch wet oiled leaves."
  }
];

export const recommendationPlants = [
  { name: "Snake Plant", type: "Indoor Plant", emoji: "🌿", sunlight: "Low Light", water: "1–2 times/week", difficulty: "Easy", minSun: 0, maxSun: 5, spaces: ["Small", "Medium", "Large"], locations: ["Indoor", "Balcony"], climates: ["Tropical", "Subtropical", "Temperate", "Arid / Dry"] },
  { name: "Tulsi", type: "Herb", emoji: "🌱", sunlight: "High Light", water: "3–4 times/week", difficulty: "Easy", minSun: 4, maxSun: 8, spaces: ["Small", "Medium", "Large"], locations: ["Balcony", "Terrace", "Indoor"], climates: ["Tropical", "Subtropical"] },
  { name: "Mint", type: "Herb", emoji: "🌿", sunlight: "Medium Light", water: "Daily", difficulty: "Easy", minSun: 2, maxSun: 6, spaces: ["Small", "Medium", "Large"], locations: ["Balcony", "Terrace", "Indoor"], climates: ["Tropical", "Subtropical", "Temperate"] },
  { name: "Aloe Vera", type: "Succulent", emoji: "🌵", sunlight: "High Light", water: "1–2 times/week", difficulty: "Easy", minSun: 4, maxSun: 8, spaces: ["Small", "Medium", "Large"], locations: ["Balcony", "Terrace", "Indoor"], climates: ["Tropical", "Arid / Dry", "Subtropical"] },
  { name: "Tomato", type: "Vegetable", emoji: "🍅", sunlight: "Full Sun", water: "Daily", difficulty: "Moderate", minSun: 6, maxSun: 8, spaces: ["Medium", "Large"], locations: ["Balcony", "Terrace"], climates: ["Tropical", "Subtropical", "Temperate"] },
  { name: "Marigold", type: "Flower", emoji: "🌼", sunlight: "Full Sun", water: "3–4 times/week", difficulty: "Easy", minSun: 5, maxSun: 8, spaces: ["Small", "Medium", "Large"], locations: ["Balcony", "Terrace"], climates: ["Tropical", "Subtropical", "Temperate"] },
];

export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
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
  } else {
    daysInGarden = Math.min(growthDays - 5, (Number(plant.id || 1) % 30) + 15);
  }

  const daysToHarvest = Math.max(0, growthDays - daysInGarden);
  const progressPct = Math.min(100, Math.max(5, Math.round((daysInGarden / growthDays) * 100)));

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
  } else {
    const pDate = new Date();
    pDate.setDate(pDate.getDate() - daysInGarden);
    plantedDateFormatted = pDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
  const plants = readStorage(STORAGE_KEYS.plants, defaultPlants);
  if (Array.isArray(plants) && plants.length > 0) {
    return plants.map((p, idx) => {
      const meta = getPlantGrowthMeta(p.name || "", p.type || "");
      const def = defaultPlants.find(
        (dp) => dp.id === p.id || dp.name.toLowerCase() === (p.name || "").toLowerCase()
      );
      const growthDays = Number(p.growthDays) || def?.growthDays || meta.growthDays || 60;
      const growthTime = p.growthTime || def?.growthTime || meta.growthTime || `${growthDays} days`;
      const plantedDate = p.plantedDate || def?.plantedDate || getPastDate(Math.min(growthDays - 5, 20 + ((idx * 7) % 35)));
      const harvestAdvice = p.harvestAdvice || def?.harvestAdvice || meta.harvestAdvice || "Harvest when mature.";
      const harvestType = p.harvestType || def?.harvestType || meta.harvestType || "continuous";

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
  return defaultPlants;
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
  return defaultTasks;
}

export function saveTasks(tasks) {
  writeStorage(STORAGE_KEYS.tasks, tasks);
}

export function generateTasksFromPlants(plants) {
  if (!Array.isArray(plants) || plants.length === 0) {
    return defaultTasks;
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
  if (!environment) return [];
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
