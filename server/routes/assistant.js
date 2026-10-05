import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { PLANT_SEED_DATA } from "../data/plants.js";
import { GardenPlant } from "../models/GardenPlant.js";
import { Environment } from "../models/Environment.js";
import { CareTask } from "../models/CareTask.js";

const router = express.Router();

const ALIASES = [
  ["cherry tomato", "Cherry Tomato"],
  ["tomato", "Tomato"],
  ["bell pepper", "Bell Pepper / Capsicum"],
  ["capsicum", "Bell Pepper / Capsicum"],
  ["spinach", "Spinach / Palak"],
  ["palak", "Spinach / Palak"],
  ["cucumber", "Cucumber"],
  ["chilli", "Green Chilli (Mirchi)"],
  ["chili", "Green Chilli (Mirchi)"],
  ["mirchi", "Green Chilli (Mirchi)"],
  ["mint", "Spearmint / Pudina"],
  ["pudina", "Spearmint / Pudina"],
  ["tulsi", "Holy Basil (Tulsi)"],
  ["holy basil", "Holy Basil (Tulsi)"],
  ["basil", "Holy Basil (Tulsi)"],
  ["curry leaf", "Curry Leaf"],
  ["aloe", "Aloe Vera"],
  ["snake plant", "Snake Plant"],
  ["rose", "Rose"],
  ["marigold", "Marigold (Genda)"],
  ["genda", "Marigold (Genda)"],
  ["sunflower", "Dwarf Sunflower"],
  ["hibiscus", "Hibiscus (Gudhal)"],
  ["gudhal", "Hibiscus (Gudhal)"],
  ["jasmine", "Jasmine / Mogra"],
  ["mogra", "Jasmine / Mogra"],
  ["lavender", "Lavender"],
];

const ROSE_TYPES = [
  ["Hybrid Tea", "large, classic individual blooms; commonly grown for cut flowers"],
  ["Floribunda", "clusters of blooms with repeat flowering; useful for fuller displays"],
  ["Grandiflora", "taller plants combining large blooms with clustered flowering"],
  ["Climbing Roses", "long canes that can be trained on a trellis or support"],
  ["Shrub Roses", "bushy, landscape-friendly plants that can flower repeatedly"],
  ["Miniature Roses", "compact roses suited to containers when light and root space are adequate"],
  ["Polyantha Roses", "compact plants producing small clusters of flowers"],
  ["Old Garden Roses", "historic groups often valued for fragrance and distinctive forms"],
];

const ROSE_RECOMMENDATIONS = {
  compact: {
    name: "Miniature Rose",
    reason: "best fit when space is limited and you want a compact container rose",
  },
  sunny: {
    name: "Floribunda Rose",
    reason: "a strong all-round choice for a sunny home garden because it produces clusters of repeat blooms",
  },
  large: {
    name: "Shrub Rose",
    reason: "a practical choice for a larger garden when you want a bushy plant and do not need a climbing support",
  },
  climber: {
    name: "Climbing Rose",
    reason: "best when you have a sturdy trellis or other support and enough vertical space",
  },
};

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compact(value, fallback = "") {
  return String(value || fallback).replace(/\s+/g, " ").trim();
}

function findLibraryPlantByName(name) {
  const query = normalize(name);
  if (!query) return null;
  return PLANT_SEED_DATA.find((plant) => normalize(plant?.name) === query)
    || PLANT_SEED_DATA.find((plant) => normalize(plant?.name).includes(query) || query.includes(normalize(plant?.name)))
    || null;
}

function isExplicitPlantQuestion(message) {
  const lower = normalize(message);
  if (!lower) return false;
  if (/\b(types?|kinds?|varieties|categories)\b.*\b(rose|roses)\b/.test(lower)) return false;
  if (/^\s*(?:which|what)\s+(?:rose|roses|one)\s*[?.!]*\s*$/.test(lower)) return false;
  if (/\b(suitable|best|recommend|recommendation|suggest|which type|which one|what type)\b/.test(lower)) return false;
  if (/\b(my plant|our plant|the plant in my garden|this plant|that plant|my garden)\b/.test(lower)) return true;
  const careWords = /\b(tell me about|about|care for|care of|water|watering|sunlight|light|soil|fertil|prune|pruning|propagat|repot|plant|planting|grow|growing|harvest|harvesting|disease|pest|symptom|temperature|humidity)\b/;
  const plantWords = /\b(rose|roses|tomato|mint|basil|tulsi|coriander|money plant|hibiscus|jasmine|aloe|marigold|sunflower|lavender|spinach|cucumber|capsicum|pepper|chilli|chili|curry leaf|snake plant)\b/;
  return careWords.test(lower) && plantWords.test(lower);
}

function findMentionedPlant(message, context = {}) {
  const lower = normalize(message);
  if (!lower || !isExplicitPlantQuestion(message)) return null;

  const savedPlants = Array.isArray(context?.plants) ? context.plants.filter(Boolean) : [];
  const saved = savedPlants.find((plant) => {
    const name = normalize(plant?.name);
    return name && lower.includes(name);
  });
  if (saved) return saved;

  for (const [alias, canonical] of ALIASES) {
    const aliasPattern = new RegExp(`\\b${escapeRegExp(alias)}\\b`, "i");
    if (!aliasPattern.test(lower)) continue;
    return savedPlants.find((plant) => normalize(plant?.name) === normalize(canonical))
      || findLibraryPlantByName(canonical)
      || { name: canonical };
  }

  if (/\b(my plant|our plant|the plant in my garden|this plant|that plant)\b/.test(lower) && savedPlants.length === 1) {
    return savedPlants[0];
  }
  return null;
}
function isFollowUpMessage(message, conversation = []) {
  const lower = normalize(message);

  if (!lower || !Array.isArray(conversation) || conversation.length === 0) {
    return false;
  }

  // Explicit follow-up phrasing.
  if (
    /^(what about|how about|and what about|then what|what if)\b/.test(lower)
  ) {
    return true;
  }

  // Short follow-up questions that depend on the previous message.
  if (
    /^(can it|can i do that|is that okay|is it okay|what about it|how about it)\b/.test(lower)
  ) {
    return true;
  }

  // Pronouns only count as follow-ups when they refer to the topic
  // at the beginning of a short question, not merely because the
  // word "it" appears somewhere in a normal sentence.
  if (
    /^(it|its|this plant|that plant|the plant|this one|that one)\b/.test(lower)
  ) {
    return true;
  }

  // Short time/context follow-ups such as "during summer?" or "today?"
  if (
    /^(during|in|for|after|before|now|today|tomorrow|in summer|in winter)\b/.test(lower)
    && lower.split(/\s+/).length <= 7
  ) {
    return true;
  }

  return false;
}

function inferConversationPlant(message, conversation = [], context = {}) {
  if (!isFollowUpMessage(message, conversation)) return null;
  const savedPlants = Array.isArray(context?.plants) ? context.plants : [];
  const savedByName = new Map(savedPlants.map((plant) => [normalize(plant?.name), plant]));
  const turns = Array.isArray(conversation) ? conversation.slice(-10).reverse() : [];

  for (const turn of turns) {
    // Only trust recent USER turns as topic establishment. Assistant-generated
    // lists such as a generic rose-types answer must not establish Garden Rose.
    if (turn?.role && turn.role !== "user") continue;
    const text = String(turn?.content || turn?.text || "");
    if (!text) continue;
    const priorIntent = classifyIntent(text, []);
    if (["rose-types", "recommendation", "rose-recommendation", "comparison", "garden-inventory"].includes(priorIntent)) continue;

    const explicit = findMentionedPlant(text, context);
    if (explicit) return explicit;

    const lower = normalize(text);
    for (const [alias, canonical] of ALIASES) {
      const aliasPattern = new RegExp(`\\b${escapeRegExp(alias)}\\b`, "i");
      if (!aliasPattern.test(lower)) continue;
      return savedByName.get(normalize(canonical)) || findLibraryPlantByName(canonical) || { name: canonical };
    }
  }
  return null;
}
function isRoseTopic(message, conversation = []) {
  const lower = normalize(message);
  if (/\brose(?:s)?\b/.test(lower)) return true;
  return Array.isArray(conversation) && conversation.slice(-6).some((turn) => /\brose(?:s)?\b/i.test(String(turn?.content || turn?.text || "")));
}

function recommendRoseType(environment = {}, message = "", conversation = []) {
  const text = normalize(message);
  const configured = environment?.configured === true || [
    environment.pincode,
    environment.location,
    environment.space,
    environment.sunlight,
    environment.medium || environment.soil,
    environment.watering,
    environment.soilMoisture,
    environment.experience,
  ].every((value) => String(value || "").trim());

  if (!configured) {
    return "I can recommend a rose for your garden, but I do not have a complete saved garden setup yet. A good general starting choice is a Floribunda Rose for a sunny home garden. Open Settings → Environment and save your space, sunlight, growing medium, watering availability and experience if you want a recommendation matched to your actual garden.";
  }
  const space = normalize(environment.space);
  const location = normalize(environment.location);
  const light = normalize(environment.sunlight);
  const hasSupport = /\b(trellis|support|wall|fence|climber|climbing)\b/.test(text);

  if (hasSupport) {
    const option = ROSE_RECOMMENDATIONS.climber;
    return `For your garden, I’d start with a ${option.name}. ${option.reason}. ${environment.space ? `Your saved space is ${environment.space}, so give it enough room to train without crowding other plants.` : "Make sure you have a strong support before planting."}`;
  }

  if (space === "small") {
    const option = ROSE_RECOMMENDATIONS.compact;
    return `For your garden, I’d choose a ${option.name}. ${option.reason}. It still needs several hours of good light and a container with reliable drainage.`;
  }

  if (space === "large" || /\b(terrace|garden|yard)\b/.test(location)) {
    const option = ROSE_RECOMMENDATIONS.large;
    return `For your garden, I’d start with a ${option.name}. ${option.reason}. ${light ? `With your ${environment.sunlight} setting, place it where it receives the strongest suitable light.` : "Aim for a bright, sunny location."}`;
  }

  if (light.includes("full") || light.includes("direct") || light.includes("high")) {
    const option = ROSE_RECOMMENDATIONS.sunny;
    return `For your garden, I’d start with a ${option.name}. ${option.reason}. Give it strong light, good airflow, and regular watering without keeping the roots waterlogged.`;
  }

  return "For a general home garden, I’d start with a Floribunda Rose because it is a versatile repeat-blooming option. If you tell me your space size, sunlight and whether you have a trellis, I can narrow it down further.";
}

function shouldLoadGardenData(intent, message, conversation = []) {
  const lower = normalize(message);
  if (intent === "rose-recommendation") return false;
  if (["garden-inventory", "garden-plant-care"].includes(intent)) return true;
  if (/\b(my|our)\b/.test(lower) && /\b(plant|garden|tomato|mint|basil|rose|hibiscus|jasmine|aloe|curry|pepper|cucumber|spinach|marigold|sunflower|lavender)\b/.test(lower)) return true;
  if (intent === "follow-up" && /\b(my|our)\b/.test(Array.isArray(conversation) ? conversation.map((item) => String(item?.content || item?.text || "")).join(" ").toLowerCase() : "")) return true;
  return false;
}

function shouldLoadEnvironmentData(intent, message) {
  if (["environment", "environment-care", "recommendation", "rose-recommendation"].includes(intent)) return true;
  return /\b(my|our)\b.*\b(environment|setup|growing space|sunlight|medium|watering)\b/.test(normalize(message));
}

function classifyIntent(message, conversation = []) {
  const lower = normalize(message);

  if (/^(hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you|thx|okay|ok|got it|great|nice)[!.?\s]*$/.test(lower)) {
    return "conversation";
  }
  if (/\b(what(?: is|'s) my name|do you know my name|who am i)\b/.test(lower)) return "profile-name";
  if (/\b(my email|what(?: is|'s) my email|which email|my account email)\b/.test(lower)) return "profile-email";
  if (/\b(what plants do i have|my plants|plants in my garden|what(?:'s| is) in my garden|show my garden)\b/.test(lower)) return "garden-inventory";
  if (/\b(my environment|garden environment|what settings did i save|what is my growing space|what(?:'s| is) my garden setup)\b/.test(lower)) return "environment";
  // A bare "which rose?" is ambiguous. Never bind it to a saved/catalog rose.
  if (isRoseTopic(message, conversation) && /^\s*(?:which|what)\s+(?:rose|roses)\s*[?.!]*\s*$/.test(lower)) {
    return "rose-clarification";
  }
  // Suitability/recommendation must run before the generic type-list matcher.
  if (isRoseTopic(message, conversation)
    && /\b(recommend|recommendation|suggest|best|suitable|good choice|which one|what would you choose|for my garden|for my setup|to grow|grow in my|grow well|will grow|good for|good in|one type)\b/.test(lower)) {
    return "rose-recommendation";
  }
  if (/\b(types?|kinds?|varieties|categories)\b.*\b(rose|roses)\b/.test(lower) || /\b(rose|roses)\b.*\b(types?|kinds?|varieties|categories)\b/.test(lower)) return "rose-types";
  if (/\b(my plant|the plant in my garden|my garden plant)\b/.test(lower)) return "garden-plant-care";
  if (isFollowUpMessage(lower, conversation)) return "follow-up";
  if (/\b(compare|versus|vs\.?|difference between)\b/.test(lower)) return "comparison";
  if (/\b(recommend|recommendation|suggest|what should i grow|which plant|best plant|what can i plant)\b/.test(lower)) return "recommendation";
  if (/\b(how often|when should i water|water|watering|thirst|dry soil|overwater|underwater|moisture)\b/.test(lower)) return "watering";
  if (/\b(sun|sunlight|light|shade|bright|dark room|window)\b/.test(lower)) return "light";
  if (/\b(soil|potting mix|potting|drainage|container|pot)\b/.test(lower)) return "soil";
  if (/\b(fertil|feed|feeding|compost|nutrient|npk)\b/.test(lower)) return "feeding";
  if (/\b(pest|aphid|mite|whitefly|mealybug|thrips|insect|bug|scale)\b/.test(lower)) return "pests";
  if (/\b(disease|blight|mildew|rot|fungal|bacterial|infection|yellow leaves|wilting|leaf spot|powdery)\b/.test(lower)) return "disease";
  if (/\b(prune|pruning|trim|trimming|deadhead)\b/.test(lower)) return "pruning";
  if (/\b(propagat|cutting|rooting|clone|multiply)\b/.test(lower)) return "propagation";
  if (/\b(seed|sowing|germinat|seedling|from seed)\b/.test(lower)) return "seeds";
  if (/\b(repot|repotting|root bound|rootbound|bigger pot|new pot)\b/.test(lower)) return "repotting";
  if (/\b(harvest|ready to harvest|when to harvest|pick|bloom|flowering|fruiting|yield)\b/.test(lower)) return "harvest";
  if (/\b(temperature|temp|climate|humidity|humid|weather|summer|winter|heatwave|cold snap)\b/.test(lower)) return "environment-care";
  if (/\b(grow|plant|planting|care for|care of|requirements|tell me about|about the plant)\b/.test(lower)) return "plant-care";
  if (/\b(garden|gardening|balcony|terrace|indoor|outdoor|urban garden)\b/.test(lower)) return "general-gardening";
  return "general";
}

function buildPlantSnapshot(plant) {
  if (!plant) return null;
  return {
    name: compact(plant.name),
    botanicalName: compact(plant.botanicalName),
    type: compact(plant.type || plant.category),
    description: compact(plant.description),
    sunlight: compact(plant.sunlight),
    water: compact(plant.water),
    soil: compact(plant.soil),
    temp: compact(plant.temp),
    growthTime: compact(plant.growthTime),
    growthDays: Number(plant.growthDays) || undefined,
    careTips: compact(plant.careTips),
    harvestAdvice: compact(plant.harvestAdvice),
    difficulty: compact(plant.difficulty),
    status: compact(plant.status),
    moisture: compact(plant.moisture),
    plantedDate: plant.plantedDate || undefined,
  };
}

function buildRelevantContext(intent, message, conversation, base) {
  const explicitPlant = findMentionedPlant(message, base);
  const followUpPlant = inferConversationPlant(message, conversation, base);
  const plant = explicitPlant || followUpPlant;

  const relevant = {
    intent,
    currentMessage: message,
  };

  switch (intent) {
    case "profile-name":
      relevant.user = {
        name: compact(base?.user?.name || base?.user?.firstName),
      };
      break;
    case "profile-email":
      relevant.user = {
        email: compact(base?.user?.email),
      };
      break;
    case "garden-inventory":
      relevant.user = { name: compact(base?.user?.name || base?.user?.firstName) };
      relevant.garden = {
        plants: (base?.plants || []).map(buildPlantSnapshot).filter(Boolean),
        tasks: (base?.tasks || []).slice(0, 20).map((task) => ({
          title: compact(task?.title),
          plantName: compact(task?.plantName),
          type: compact(task?.type),
          frequency: compact(task?.frequency),
          completed: Boolean(task?.completed),
        })),
      };
      break;
    case "environment":
    case "environment-care":
    case "recommendation":
    case "rose-recommendation":
      relevant.environment = base?.environment || {};
      break;
    case "rose-clarification":
      break;
    case "plant-care":
    case "watering":
    case "light":
    case "soil":
    case "feeding":
    case "pests":
    case "disease":
    case "pruning":
    case "propagation":
    case "seeds":
    case "repotting":
    case "harvest":
    case "comparison":
    case "follow-up":
    case "garden-plant-care":
      if (plant) relevant.plant = buildPlantSnapshot(plant);
      if (/\b(summer|winter|temperature|humidity|climate|weather|balcony|terrace|indoor|outside|setup|environment)\b/.test(normalize(message))) {
        relevant.environment = base?.environment || {};
      }
      break;
    default:
      // General questions intentionally receive no saved garden data.
      break;
  }

  return { relevant, plant };
}

function environmentSummary(environment = {}) {
  const fields = [
    ["place", environment.location],
    ["space", environment.space],
    ["sunlight", environment.sunlight],
    ["medium", environment.medium || environment.soil],
    ["watering", environment.watering],
    ["soil moisture", environment.soilMoisture],
    ["climate", environment.climate],
    ["temperature", environment.temperature],
    ["humidity", environment.humidity],
  ];
  return fields
    .filter(([, value]) => String(value || "").trim())
    .map(([label, value]) => `${label}: ${value}`)
    .join(", ");
}

function roseTypesAnswer() {
  return [
    "There are several major types of roses, each suited to a different growing style:",
    ...ROSE_TYPES.map(([name, detail]) => `• ${name} — ${detail}.`),
    "For a home garden, choose based on your available sunlight, space, climate, fragrance preference, and whether you want cut flowers, climbers, or a compact container rose.",
  ].join("\n");
}

function localAnswer(message, context = {}, conversation = []) {
  const lower = normalize(message);
  const intent = classifyIntent(message, conversation);
  const { relevant, plant } = buildRelevantContext(intent, message, conversation, context);
  const env = context?.environment || {};
  const envText = environmentSummary(env);

  if (intent === "profile-name") {
    const name = compact(context?.user?.name || context?.user?.firstName);
    return name
      ? `Your name is ${name}.`
      : "I don’t have your name in the authenticated profile yet. You can add it under Settings → Profile.";
  }

  if (intent === "profile-email") {
    const email = compact(context?.user?.email);
    return email
      ? `Your account email is ${email}.`
      : "I don’t have an email address available in the authenticated profile.";
  }

  if (intent === "rose-types") return roseTypesAnswer();

  if (intent === "rose-clarification") {
    return "Which rose do you mean? I can explain rose types, help you choose a rose for your garden, or compare specific roses. If you mean a rose for your own garden, tell me your space and light or ask me to use your saved garden setup.";
  }

  if (intent === "conversation") {
    if (/^(thanks|thank you|thx|okay|ok|got it|great|nice)[!.?\s]*$/.test(lower)) {
      return "You’re welcome! 🌿 Ask me about a plant, a gardening problem, or your Garden Guide setup whenever you like.";
    }
    return [
      "Hi! 🌱 I’m your Garden Guide assistant.",
      "You can ask me about planting, watering, sunlight, soil, fertilizer, pests, diseases, pruning, propagation, repotting, seasonal care, harvesting, or the plants saved in your own garden.",
      "You can also ask follow-up questions and I’ll keep track of the current plant/topic when the context is clear.",
    ].join("\n");
  }

  if (intent === "garden-inventory") {
    const plants = Array.isArray(context?.plants) ? context.plants : [];
    const tasks = Array.isArray(context?.tasks) ? context.tasks : [];
    const lines = [
      plants.length
        ? `You currently have ${plants.length} plant${plants.length === 1 ? "" : "s"} saved in your garden:`
        : "You currently have no plants saved in your Garden Guide garden.",
    ];
    if (plants.length) lines.push(...plants.slice(0, 10).map((item) => `• ${item.name || "Unnamed plant"}`));
    if (tasks.length) lines.push(`You also have ${tasks.length} saved care task${tasks.length === 1 ? "" : "s"}.`);
    return lines.join("\n");
  }

  if (intent === "environment") {
    return envText
      ? `Your saved Garden Guide environment is: ${envText}.`
      : "Your Garden Guide environment has not been configured yet. Open Settings → Environment to save it.";
  }

  if (intent === "rose-recommendation") {
    return recommendRoseType(env, message, conversation);
  }

  if (intent === "recommendation") {
    if (!env.location || !env.space || !env.sunlight || !(env.medium || env.soil) || !env.watering || !env.experience) {
      return "I can make a useful plant recommendation once your required garden setup is configured: location, growing space, sunlight, growing medium, watering availability, and gardening experience. Optional regional readings are not required.";
    }
    const candidates = PLANT_SEED_DATA.map((candidate) => {
      const scoreParts = [];
      const sun = normalize(candidate.sunlight);
      const space = normalize(env.space);
      const light = normalize(env.sunlight);
      if (light.includes("full") && sun.includes("full")) scoreParts.push(3);
      else if (light.includes("partial") && (sun.includes("partial") || sun.includes("indirect"))) scoreParts.push(3);
      else if (light.includes("low") && (sun.includes("low") || sun.includes("indirect"))) scoreParts.push(3);
      else scoreParts.push(1);
      if (space === "small" && !/large|tree|vigorous|vining/i.test(`${candidate.description || ""} ${candidate.careTips || ""}`)) scoreParts.push(1);
      return { candidate, score: scoreParts.reduce((a, b) => a + b, 0) };
    }).sort((a, b) => b.score - a.score);
    return [
      "Based on the garden settings you saved, these are reasonable starting options:",
      ...candidates.slice(0, 3).map(({ candidate }) => `• ${candidate.name} — ${candidate.description || "a suitable home-garden option when its light and water needs are met"}.`),
      "This is a compatibility suggestion, not a guarantee; check the plant's guide before planting.",
    ].join("\n");
  }

  const plantIntro = plant ? `For ${plant.name}:` : "For general gardening:";

  if (intent === "follow-up") {
    if (!plant) {
      return "I understand that you’re continuing the previous topic, but I can’t reliably tell which plant you mean. Mention the plant name once and I’ll keep the conversation focused from there.";
    }
  }

  if (intent === "watering") {
    return [
      plantIntro,
      plant?.water ? `• Water guide: ${plant.water}.` : "• Check the top 1–2 inches of soil before watering rather than following a rigid calendar.",
      "• Water at the soil line until the root zone is evenly moist, then let excess drain freely.",
      plant?.careTips ? `• Plant-specific note: ${plant.careTips}` : "• Avoid keeping roots continuously waterlogged.",
    ].join("\n");
  }

  if (intent === "light") {
    return [
      plantIntro,
      plant?.sunlight ? `• Light target: ${plant.sunlight}.` : "• Match the plant to the light it normally needs; fruiting vegetables usually need strong direct light, while many foliage plants prefer bright indirect light.",
      "• Increase light gradually when moving a shade-grown plant outdoors.",
    ].join("\n");
  }

  if (intent === "soil") {
    return [
      plantIntro,
      plant?.soil ? `• Suitable medium: ${plant.soil}.` : "• Use a light, well-draining mix matched to the crop; moisture-loving plants need more water retention than succulents.",
      "• Use containers with drainage holes and avoid compacted soil.",
    ].join("\n");
  }

  if (intent === "feeding") {
    return [
      plantIntro,
      "• Feed during active growth according to the fertilizer product label.",
      "• Do not increase the dose just because growth is weak; check light, roots, drainage, watering and pests first.",
      plant?.careTips ? `• Plant guide note: ${plant.careTips}` : "• Compost can improve organic matter, but it does not replace all plant nutrients in every container.",
    ].join("\n");
  }

  if (intent === "pests") {
    return [
      plantIntro,
      "• Inspect tender shoots and the undersides of leaves carefully.",
      "• Isolate a clearly affected plant when practical and remove visible pests gently before choosing treatment.",
      "• Correct overcrowding, stagnant air or excessive nitrogen feeding that may encourage some pest problems.",
      "• Use any treatment strictly according to its product label and crop suitability.",
    ].join("\n");
  }

  if (intent === "disease") {
    return [
      plantIntro,
      "• A symptom alone does not confirm a disease. First check watering, drainage, light, airflow and recent feeding changes.",
      "• Note whether symptoms affect old leaves, new growth, stems or roots and how quickly they are spreading.",
      "• Use Leaf Detection as a screening aid when appropriate rather than treating a guessed diagnosis as certain.",
    ].join("\n");
  }

  if (intent === "repotting") {
    return [
      plant ? `Repotting ${plant.name}:` : "Repotting guide:",
      "• Check for circling roots, compacted soil, poor drainage or roots filling the container.",
      `• Move up only one pot size and use ${plant?.soil || "a light, well-draining container mix"}.`,
      "• Water after repotting, let excess drain, and keep the plant in its normal light while it settles.",
    ].join("\n");
  }

  if (intent === "pruning") {
    return [
      plant ? `Pruning ${plant.name}:` : "Pruning guide:",
      "• Remove dead, damaged, diseased or badly crossing growth first.",
      "• Use clean, sharp shears and make clean cuts suited to the plant's normal growth habit.",
      plant?.careTips ? `• Plant-specific note: ${plant.careTips}` : "• Avoid removing a large share of healthy foliage in one session.",
    ].join("\n");
  }

  if (intent === "propagation") {
    return [
      plant ? `Propagation for ${plant.name}:` : "Propagation guide:",
      "• Choose healthy material and clean tools.",
      "• Keep new cuttings warm, lightly moist and in bright indirect light while roots develop.",
      "• Increase light and watering gradually after the young plant establishes.",
    ].join("\n");
  }

  if (intent === "seeds") {
    return [
      plant ? `Starting ${plant.name} from seed:` : "Starting plants from seed:",
      "• Use a clean, airy seed-starting medium and keep it evenly moist rather than saturated.",
      "• Give seedlings bright light as soon as they emerge so they do not become weak and stretched.",
      plant?.growthTime ? `• The guide lists a growth cycle of about ${plant.growthTime}.` : "• Check the plant guide for the expected growth window and transplant timing.",
    ].join("\n");
  }

  if (intent === "harvest") {
    return [
      plant ? `For ${plant.name}:` : "Harvesting guide:",
      plant?.growthTime ? `• Typical growth cycle: ${plant.growthTime}.` : "• Harvest timing depends on crop, variety and the maturity signs of the specific plant.",
      plant?.harvestAdvice ? `• Harvest cue: ${plant.harvestAdvice}` : "• Use size, color, firmness or flowering stage as the crop's maturity cue rather than a single calendar date.",
    ].join("\n");
  }

  if (intent === "environment-care") {
    return [
      plant ? `For ${plant.name}:` : "For your garden:",
      plant?.temp ? `• Plant temperature guide: ${plant.temp}.` : "• Match temperature and humidity to the plant rather than assuming every crop has the same range.",
      envText ? `• Your saved setup: ${envText}.` : "• Your garden environment is not fully configured yet, so I will not invent regional conditions.",
      "• I will not invent live weather; use a current weather source for today's conditions.",
    ].join("\n");
  }

  if (intent === "garden-plant-care") {
    if (plant) {
      return [
        `Here’s the Garden Guide profile for your ${plant.name}:`,
        plant.description ? `• What it is: ${plant.description}` : "• I can use the saved plant's care information.",
        `• Sunlight: ${plant.sunlight || "see the plant guide"}.`,
        `• Watering: ${plant.water || "check soil moisture before watering"}.`,
        `• Soil: ${plant.soil || "use a light, well-draining mix"}.`,
        `• Temperature: ${plant.temp || "see the plant guide"}.`,
        `• Growth cycle: ${plant.growthTime || "see the plant guide"}.`,
      ].join("\n");
    }
    return "I can use your saved garden, but I need to know which plant you mean because your garden contains more than one plant.";
  }

  if (intent === "plant-care") {
    if (plant) {
      return [
        `Here’s the Garden Guide profile for ${plant.name}:`,
        plant.description ? `• What it is: ${plant.description}` : "• A home-garden plant with care needs that should be matched to its light and container conditions.",
        `• Sunlight: ${plant.sunlight || "see the plant guide"}.`,
        `• Watering: ${plant.water || "check soil moisture before watering"}.`,
        `• Soil: ${plant.soil || "use a light, well-draining mix"}.`,
        `• Temperature: ${plant.temp || "see the plant guide"}.`,
        `• Growth cycle: ${plant.growthTime || "see the plant guide"}.`,
        plant.careTips ? `• Care tip: ${plant.careTips}` : "• Watch new growth and change one care variable at a time when troubleshooting.",
      ].join("\n");
    }
    return "Tell me the plant name and what you want to know about it, and I’ll give you plant-specific guidance.";
  }

  if (intent === "comparison") {
    return "I can compare two plants by sunlight, watering, soil/drainage, temperature, container suitability, growth cycle and difficulty. Tell me the two plant names, such as “mint vs tulsi for a balcony”.";
  }

  if (intent === "general-gardening") {
    return [
      "A reliable starting approach for home gardening:",
      "• Measure the actual light at the growing spot before choosing plants.",
      "• Use containers with drainage holes and a suitable growing medium.",
      "• Match plants with similar light and watering requirements.",
      "• Change one care variable at a time when troubleshooting so you can see what helped.",
    ].join("\n");
  }

  return [
    "I can help with your gardening question, but I need one useful detail to make the answer specific.",
    "Tell me the plant (if there is one), what you want to do or what changed, and where it is growing.",
  ].join("\n");
}

function buildModelContext(intent, relevantContext) {
  const promptContext = { intent };
  if (relevantContext?.user) promptContext.user = relevantContext.user;
  if (relevantContext?.environment) promptContext.environment = relevantContext.environment;
  if (relevantContext?.plant) promptContext.plant = relevantContext.plant;
  if (relevantContext?.garden) promptContext.garden = relevantContext.garden;
  return promptContext;
}

async function callOpenAICompatible(message, context, intent, relevantContext, apiKey, baseUrl, model) {
  const conversation = Array.isArray(context?.conversation)
    ? context.conversation.filter((item) => item?.role && item?.content).slice(-10)
    : [];

  const modelContext = buildModelContext(intent, relevantContext);
  const system = [
    "You are Garden Guide, a genuine conversational gardening assistant for an urban gardening application.",
    "Answer naturally and directly, like a knowledgeable human gardening coach.",
    "Answer the user's current question first. Do not force a saved plant or garden setting into an unrelated question.",
    "Think about intent before context: profile questions use profile data; garden questions may use garden data; general gardening questions should be answered generally.",
    "For follow-up questions, resolve references such as it, this plant, that plant, or during summer using recent conversation context when the referent is clear.",
    "Use only the supplied authenticated account data for personalized facts. Never invent profile, plant, task, environment, weather, diagnosis, or measurement data.",
    "When the user asks for a recommendation, explain the trade-offs and make a clear recommendation when enough information exists; otherwise ask for the smallest missing detail.",
    "For plant problems, give practical troubleshooting and distinguish likely causes from confirmed diagnosis.",
    "Do not claim live weather or certainty from an image unless such information is actually supplied.",
    "Write naturally, like a helpful human garden coach. Avoid repeating the same boilerplate context in every answer.",
    "Prefer a direct answer followed by concise steps or bullets. Use short paragraphs and useful headings when they improve clarity.",
    `Relevant Garden Guide context: ${JSON.stringify(modelContext)}`,
  ].join("\n");

  const messages = [
    { role: "system", content: system },
    ...conversation.map((item) => ({
      role: item.role === "user" ? "user" : "assistant",
      content: String(item.content),
    })),
    { role: "user", content: String(message) },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
  const detail = await response.text().catch(() => "");

  const error = new Error(
    `AI provider returned ${response.status}${
      detail ? `: ${detail.slice(0, 240)}` : ""
    }`,
  );

  error.status = response.status;
  throw error;
} 
 

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    const content = Array.isArray(rawContent)
      ? rawContent.map((part) => (typeof part === "string" ? part : part?.text || "")).join("\n").trim()
      : String(rawContent || "").trim();
    return content || null;
  } finally {
    clearTimeout(timeout);
  }
}
async function callAI(message, context, intent, relevantContext) {
  const geminiKey = process.env.GEMINI_API_KEY;

  const apiKey =
    process.env.AI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.GARDEN_AI_API_KEY ||
    geminiKey;

  if (!apiKey) return null;

  const defaultBaseUrl = geminiKey
    ? "https://generativelanguage.googleapis.com/v1beta/openai"
    : "https://api.openai.com/v1";

  const baseUrl = (
    process.env.AI_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    defaultBaseUrl
  ).replace(/\/$/, "");

  const model =
    process.env.AI_MODEL ||
    process.env.OPENAI_MODEL ||
    (geminiKey ? "gemini-3.6-flash" : "gpt-4o-mini");

  const modelsToTry =
    geminiKey && apiKey === geminiKey
      ? ["gemini-3.6-flash", "gemini-3.7-flash"]
      : [model];

  let lastError = null;

  for (const candidateModel of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        return await callOpenAICompatible(
          message,
          context,
          intent,
          relevantContext,
          apiKey,
          baseUrl,
          candidateModel,
        );
      } catch (error) {
        lastError = error;

        console.warn(
          `Garden AI attempt failed (${candidateModel}, attempt ${attempt}):`,
          error?.message || error,
        );

        // Retry temporary provider availability failures.
        if (error?.status !== 503) {
          throw error;
        }
      }
    }
  }

  throw lastError || new Error("Garden AI request failed.");
}

async function loadAuthoritativeContext(userId, intent, message, conversation = []) {
  const wantsGarden = shouldLoadGardenData(intent, message, conversation);
  const wantsEnvironment = shouldLoadEnvironmentData(intent, message);

  const [gardenPlants, environmentDoc, tasks] = await Promise.all([
    wantsGarden ? GardenPlant.find({ user: userId }).sort({ createdAt: -1 }).limit(20).lean() : Promise.resolve([]),
    wantsEnvironment ? Environment.findOne({ user: userId }).lean() : Promise.resolve(null),
    intent === "garden-inventory" ? CareTask.find({ user: userId }).sort({ createdAt: -1 }).limit(20).lean() : Promise.resolve([]),
  ]);

  return {
    plants: Array.isArray(gardenPlants) ? gardenPlants : [],
    environment: environmentDoc ? { ...environmentDoc, user: undefined } : {},
    tasks: Array.isArray(tasks) ? tasks : [],
  };
}

function hasAiProvider() {
  return Boolean(process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GARDEN_AI_API_KEY || process.env.GEMINI_API_KEY);
}

router.post("/chat", requireAuth, async (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) return res.status(400).json({ message: "Enter a gardening question." });

  const conversation = Array.isArray(req.body?.context?.conversation)
    ? req.body.context.conversation.slice(-10)
    : [];
  const intent = classifyIntent(message, conversation);

  // Greetings are deterministic and should never wait for MongoDB/provider.
  if (intent === "conversation") {
    return res.json({
      answer: localAnswer(message, { user: req.user }, conversation),
      source: "garden-knowledge",
      intent,
    });
  }

  // Account facts are safest when answered directly from the authenticated user.
  if (["profile-name", "profile-email"].includes(intent)) {
    return res.json({
      answer: localAnswer(message, { user: req.user }, conversation),
      source: "garden-knowledge",
      intent,
    });
  }

  // Common general-knowledge questions can answer immediately when no external
  // provider is configured. They do not need garden/account database queries.
  if (!hasAiProvider() && !shouldLoadGardenData(intent, message, conversation) && !shouldLoadEnvironmentData(intent, message)) {
    return res.json({
      answer: localAnswer(message, { user: req.user }, conversation),
      source: "garden-knowledge",
      intent,
    });
  }

  try {
    const authoritative = await loadAuthoritativeContext(req.user._id, intent, message, conversation);
    const context = {
      conversation,
      user: {
        id: String(req.user._id),
        name: req.user.name || "",
        firstName: req.user.firstName || "",
        lastName: req.user.lastName || "",
        email: req.user.email || "",
      },
      ...authoritative,
      plantNames: authoritative.plants.map((plant) => plant.name).filter(Boolean),
    };

    const { relevant } = buildRelevantContext(intent, message, conversation, context);

    if (["rose-recommendation", "recommendation", "garden-inventory", "environment"].includes(intent) && !hasAiProvider()) {
      return res.json({
        answer: localAnswer(message, context, conversation),
        source: "garden-knowledge",
        intent,
      });
    }

    const aiAnswer = await callAI(message, context, intent, relevant);
    return res.json({
      answer: aiAnswer || localAnswer(message, context, conversation),
      source: aiAnswer ? "ai" : "garden-knowledge",
      intent,
    });
  } catch (error) {
        try {
          const authoritative = await loadAuthoritativeContext(req.user._id, intent, message, conversation);
          const fallbackContext = {
            conversation,
            user: {
              name: req.user?.name || "",
              firstName: req.user?.firstName || "",
              email: req.user?.email || "",
            },
            ...authoritative,
            plantNames: authoritative.plants.map((plant) => plant.name).filter(Boolean),
          };
          return res.json({
            answer: localAnswer(message, fallbackContext, conversation),
            source: "garden-knowledge",
            intent,
          });
        } catch (fallbackError) {
          console.error("assistant fallback context failed:", fallbackError?.message || fallbackError);
          return res.status(503).json({ message: "The Garden Assistant is temporarily unavailable." });
        }
      }
    });

export { classifyIntent, localAnswer, findMentionedPlant };
export default router;
