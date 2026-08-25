export const STORAGE_KEYS = {
  session: "gardenGuideSession",
  user: "gardenGuideUser",
  environment: "environmentSetup",
  plants: "gardenGuidePlants",
  tasks: "gardenGuideTasks",
};

export const defaultPlants = [
  { id: 1, name: "Tomato", type: "Vegetable", emoji: "🍅", status: "Healthy", statusType: "healthy", sunlight: "6–8 hrs", water: "Daily", watered: "Today" },
  { id: 2, name: "Mint", type: "Herb", emoji: "🌿", status: "Healthy", statusType: "healthy", sunlight: "4–6 hrs", water: "Daily", watered: "Today" },
  { id: 3, name: "Rose", type: "Flower", emoji: "🌹", status: "Needs Water", statusType: "warning", sunlight: "6–8 hrs", water: "Daily", watered: "Yesterday" },
];

export const defaultTasks = [
  { id: 1, title: "Water 4 plants", description: "Monstera, Tulsi, Aloe Vera & Mint", time: "9:00 AM", completed: false, type: "water" },
  { id: 2, title: "Fertilize your plants", description: "Use organic fertilizer for better growth", time: "11:00 AM", completed: false, type: "fertilizer" },
  { id: 3, title: "Prune dead leaves", description: "Remove yellow leaves from your plants", time: "4:00 PM", completed: false, type: "prune" },
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

export function getSavedPlants() {
  return readStorage(STORAGE_KEYS.plants, defaultPlants);
}

export function savePlants(plants) {
  writeStorage(STORAGE_KEYS.plants, plants);
}

export function getSavedTasks() {
  return readStorage(STORAGE_KEYS.tasks, defaultTasks);
}

export function saveTasks(tasks) {
  writeStorage(STORAGE_KEYS.tasks, tasks);
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
