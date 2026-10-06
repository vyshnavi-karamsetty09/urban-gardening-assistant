import { LIBRARY_PLANTS } from "./plantData";

const PLANT_ALIASES = [
  ["tomato", "Tomato"],
  ["cherry tomato", "Tomato"],
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
  ["curry leaf", "Curry Leaf (Kadi Patta)"],
  ["curry", "Curry Leaf (Kadi Patta)"],
  ["aloe", "Aloe Vera"],
  ["snake plant", "Snake Plant (Sansevieria)"],
  ["rose", "Garden Rose"],
  ["marigold", "Marigold (Genda)"],
  ["genda", "Marigold (Genda)"],
  ["sunflower", "Dwarf Sunflower"],
  ["hibiscus", "Tropical Hibiscus (Gudhal)"],
  ["gudhal", "Tropical Hibiscus (Gudhal)"],
  ["jasmine", "Jasmine / Mogra"],
  ["mogra", "Jasmine / Mogra"],
  ["lavender", "English Lavender"],
];

const normalize = (value) => String(value || "").trim().toLowerCase();

function plantByName(name) {
  const query = normalize(name);
  if (!query) return null;
  return LIBRARY_PLANTS.find((plant) => normalize(plant.name) === query)
    || LIBRARY_PLANTS.find((plant) => normalize(plant.name).includes(query) || query.includes(normalize(plant.name)))
    || LIBRARY_PLANTS.find((plant) => normalize(plant.botanicalName || "").includes(query));
}

function findMentionedLibraryPlant(message) {
  const text = normalize(message);
  if (!text) return null;

  const exact = LIBRARY_PLANTS.find((plant) => {
    const name = normalize(plant.name);
    const botanical = normalize(plant.botanicalName);
    return (name && text.includes(name)) || (botanical && text.includes(botanical));
  });
  if (exact) return exact;

  // Match the most specific plant name first so multi-word names win over
  // shorter aliases (for example, "bell pepper" before "pepper").
  return [...LIBRARY_PLANTS]
    .sort((a, b) => normalize(b.name).length - normalize(a.name).length)
    .find((plant) => {
      const nameTokens = normalize(plant.name).split(/\s+|\//).filter((token) => token.length > 2);
      const tokenHits = nameTokens.filter((token) => text.includes(token)).length;
      return nameTokens.length > 0 && tokenHits >= Math.min(2, nameTokens.length);
    }) || null;
}

function isFollowUpReference(message, conversation = []) {
  const text = normalize(message);
  if (!text || !Array.isArray(conversation) || conversation.length === 0) return false;
  return /^(what about|how about|and what about|then what|what if|during|in|for|after|before|now|today|tomorrow)\b/.test(text)
    || /\b(it|its|this plant|that plant|the plant|this one|that one)\b/.test(text);
}

function findPlant(message, plantNames = [], conversation = [], savedPlants = []) {
  const lower = normalize(message);
  const savedPlantList = Array.isArray(savedPlants) ? savedPlants.filter(Boolean) : [];

  const exactSavedPlant = savedPlantList.find((plant) => {
    const name = normalize(plant?.name);
    return name && lower.includes(name);
  });
  if (exactSavedPlant) return exactSavedPlant;

  for (const [alias, name] of PLANT_ALIASES) {
    if (lower.includes(alias)) {
      const savedAliasPlant = savedPlantList.find((plant) => normalize(plant?.name).includes(alias));
      return savedAliasPlant || plantByName(name) || { name };
    }
  }

  const libraryMention = findMentionedLibraryPlant(message);
  if (libraryMention) {
    const savedMatch = savedPlantList.find((saved) => normalize(saved?.name) === normalize(libraryMention.name));
    return savedMatch || libraryMention;
  }

  const savedNames = Array.isArray(plantNames) ? plantNames.filter(Boolean) : [];
  for (const name of savedNames) {
    if (lower.includes(normalize(name))) {
      return savedPlantList.find((plant) => normalize(plant?.name) === normalize(name)) || plantByName(name) || { name };
    }
  }

  if (isFollowUpReference(message, conversation)) {
    const recentText = Array.isArray(conversation)
      ? conversation.slice(-8).map((item) => String(item?.text || item?.content || "")).join(" ")
      : "";

    for (const name of savedNames) {
      if (normalize(recentText).includes(normalize(name))) {
        return savedPlantList.find((plant) => normalize(plant?.name) === normalize(name)) || plantByName(name) || { name };
      }
    }

    for (const [alias, name] of PLANT_ALIASES) {
      if (normalize(recentText).includes(alias)) {
        return savedPlantList.find((plant) => normalize(plant?.name).includes(alias)) || plantByName(name) || { name };
      }
    }

    if (/\b(my plant|this plant|the plant)\b/.test(lower) && savedNames.length === 1) {
      return savedPlantList.find((plant) => normalize(plant?.name) === normalize(savedNames[0])) || plantByName(savedNames[0]) || { name: savedNames[0] };
    }
  }

  if (/\b(my plant|the plant in my garden|this plant)\b/.test(lower) && savedPlantList.length === 1) {
    return savedPlantList[0];
  }

  return null;
}

function environmentSummary(environment = {}) {
  return [
    ["place", environment.location],
    ["space", environment.space],
    ["sunlight", environment.sunlight],
    ["medium", environment.medium || environment.soil],
    ["watering", environment.watering],
    ["soil moisture", environment.soilMoisture],
    ["climate", environment.climate],
    ["temperature", environment.temperature || environment.numericTemp],
    ["humidity", environment.humidity || environment.numericHumidity],
  ]
    .filter(([, value]) => String(value || "").trim())
    .map(([label, value]) => `${label}: ${value}`)
    .join(" · ");
}

function answerForGreeting() {
  return [
    "Hi! I’m your Garden Guide assistant.",
    "Tell me the plant and what you want to solve—watering, light, soil, pests, symptoms, feeding, growth, or harvest.",
    "Example: “My mint leaves are turning yellow. What should I check first?”",
  ].join("\n");
}

function isRoseTopic(message, conversation = []) {
  const text = normalize(message);
  if (/\brose(?:s)?\b/.test(text)) return true;
  return Array.isArray(conversation) && conversation.slice(-6).some((turn) => /\brose(?:s)?\b/i.test(String(turn?.content || turn?.text || "")));
}

function isAmbiguousRoseQuestion(message) {
  const text = normalize(message);
  return /^\s*(?:which|what)\s+(?:rose|roses)\s*[?.!]*\s*$/i.test(text);
}

function recommendRoseType(environment = {}) {
  const required = [
    environment.pincode,
    environment.location,
    environment.space,
    environment.sunlight,
    environment.medium || environment.soil,
    environment.watering,
    environment.soilMoisture,
    environment.experience,
  ];
  if (environment.configured !== true && required.some((value) => !String(value || "").trim())) {
    return "I can recommend a rose for your garden, but I do not have a complete saved garden setup yet. A good general starting choice is a Floribunda Rose for a sunny home garden. Open Settings → Environment and save your space, sunlight, growing medium, watering availability and experience if you want a recommendation matched to your actual garden.";
  }

  const space = normalize(environment.space);
  const location = normalize(environment.location);
  const sunlight = normalize(environment.sunlight);

  if (space === "small") {
    return "For a small garden or container, I’d choose a Miniature Rose. It stays compact while still giving you rose blooms, provided it gets several hours of good light and the pot drains well.";
  }
  if (space === "large" || /\b(terrace|garden|yard)\b/.test(location)) {
    return "For a larger garden, I’d start with a Shrub Rose. It is a practical, bushy choice when you want repeat flowering without needing a climbing support. Give it strong light, airflow and well-drained soil.";
  }
  if (sunlight.includes("full") || sunlight.includes("direct") || sunlight.includes("high")) {
    return "For a sunny home garden, I’d start with a Floribunda Rose. It is a versatile choice with clusters of repeat blooms, and it suits a sunny planting spot with good drainage and airflow.";
  }
  return "For a general home garden, I’d start with a Floribunda Rose because it is a versatile repeat-blooming option. Tell me your garden space, sunlight and whether you have a trellis if you want a more exact match.";
}

function recommendPlants(environment = {}) {
  const required = [environment.location, environment.space, environment.sunlight, environment.medium || environment.soil, environment.watering, environment.experience];
  if (required.some((value) => !String(value || "").trim())) {
    return "I can recommend plants more accurately after your Environment Setup is complete. Your choices for space, sunlight, medium, watering, and experience are the most useful starting inputs.";
  }

  const sun = normalize(environment.sunlight);
  const space = normalize(environment.space);
  const watering = normalize(environment.watering);
  const medium = normalize(environment.medium || environment.soil);
  const candidates = LIBRARY_PLANTS.map((plant) => {
    let score = 0;
    const reasons = [];
    const plantSun = normalize(plant.sunlight);
    const plantWater = normalize(plant.water);
    const plantSoil = normalize(plant.soil);

    if (sun.includes("full") || sun.includes("high")) {
      if (plantSun.includes("full") || plantSun.includes("direct") || plantSun.includes("bright sun")) { score += 3; reasons.push("good light match"); }
    } else if (sun.includes("low")) {
      if (plantSun.includes("indirect") || plantSun.includes("low") || plantSun.includes("partial")) { score += 3; reasons.push("lower-light friendly"); }
    } else if (plantSun.includes("partial") || plantSun.includes("morning") || plantSun.includes("bright")) { score += 2; reasons.push("fits your light level"); }

    if (space.includes("small") && !/large|tree|vigorous|vining/i.test(`${plant.description} ${plant.careTips}`)) score += 1;
    if (watering.includes("high") && /daily|moist|regular/i.test(plantWater)) { score += 2; reasons.push("works with frequent watering"); }
    if (watering.includes("low") && /low|dry|allow soil/i.test(plantWater)) { score += 2; reasons.push("more forgiving of less frequent watering"); }
    if (medium.includes("potting") && /well-draining|potting|loam|mix/i.test(plantSoil)) { score += 1; }

    return { plant, score, reasons };
  }).sort((a, b) => b.score - a.score || a.plant.difficulty.localeCompare(b.plant.difficulty));

  return [
    "Based on your saved garden setup, I’d start with:",
    ...candidates.slice(0, 3).map(({ plant, reasons }) => `• ${plant.name} — ${reasons.slice(0, 2).join(", ") || "a generally good container option"}.`),
    "These are compatibility suggestions, not a guarantee; check the plant guide before buying seeds or plants.",
  ].join("\n");
}

function carePlan(message, plant, environment = {}) {
  const lower = normalize(message);
  if (!plant) return null;
  if (/\b(today|now|routine|care plan|what should i do)\b/.test(lower)) {
    return [
      `For ${plant.name}:`,
      `• Light: ${plant.sunlight || "use the plant guide"}.`,
      `• Water: ${plant.water || "check soil moisture before watering"}.`,
      `• Soil: ${plant.soil || "use a well-draining mix"}.`,
      `• Growth: ${plant.growthTime || "follow the plant guide"}.`,
      environment?.space ? `• Your space: ${environment.space}. Keep the plant in the best-lit suitable spot available.` : "• Keep conditions stable and check new growth for changes.",
    ].join("\n");
  }
  if (/\b(harvest|ready|flower|bloom|fruit|yield)\b/.test(lower)) {
    return [
      `For ${plant.name}:`,
      `• Growth window: ${plant.growthTime || "not listed"}.`,
      `• Harvest/bloom note: ${plant.harvestAdvice || "monitor mature growth and harvest gradually"}.`,
      `• Keep light and watering consistent while the plant develops.`
    ].join("\n");
  }
  return null;
}


function choosePlantForConversation(message, plant, plantNames = [], plants = [], conversation = []) {
  if (plant) return plant;
  const names = Array.isArray(plantNames) ? plantNames.filter(Boolean) : [];
  const savedPlantList = Array.isArray(plants) ? plants.filter(Boolean) : [];
  if (!isFollowUpReference(message, conversation)) return null;
  if (names.length === 1) return savedPlantList[0] || plantByName(names[0]) || { name: names[0] };
  return null;
}

function plantOverviewAnswer(plant, environment = {}) {
  if (!plant) return null;
  const lines = [
    `Here’s the Garden Guide profile for ${plant.name}:`,
    plant.description ? `• What it is: ${plant.description}` : "• A useful choice for a home/container garden when its light and space needs are met.",
    `• Light: ${plant.sunlight || "see the plant guide"}.`,
    `• Water: ${plant.water || "check the soil before watering"}.`,
    `• Soil: ${plant.soil || "use a light, well-draining mix"}.`,
    `• Temperature: ${plant.temp || "see the plant guide"}.`,
    `• Growth cycle: ${plant.growthTime || "see the plant guide"}.`,
  ];
  if (plant.careTips) lines.push(`• Care tip: ${plant.careTips}`);
  if (plant.harvestAdvice) lines.push(`• Harvest/maturity: ${plant.harvestAdvice}`);
  if (environment.space || environment.location) {
    lines.push(`• Your saved setup: ${[environment.location, environment.space].filter(Boolean).join(" · ")}.`);
  }
  return lines.join("\n");
}

function generalGardenAnswer(message, plant, environment = {}) {
  const text = normalize(message);
  const intro = plant ? `For ${plant.name}:` : "For your garden:";

  if (/\b(start|begin|beginner).*(garden|gardening)|how to start.*garden|set up.*garden/.test(text)) {
    return [
      "A reliable beginner Garden Guide setup:",
      "1. Choose the growing space and note how many hours of direct/indirect light it gets.",
      "2. Pick 2–3 plants with similar light and watering needs instead of mixing everything together.",
      "3. Use containers with drainage holes and a suitable potting mix rather than dense garden soil.",
      "4. Label plants, track watering, and change one variable at a time when troubleshooting.",
      "5. Watch new growth; it is usually a better signal of plant health than one old leaf.",
    ].join("\n");
  }

  if (/\b(best time|when should i plant|when to plant|planting season|season to plant)\b/.test(text)) {
    return [
      intro,
      "• Planting time depends on the crop and your local temperature rather than a single universal month.",
      "• Warm-season crops prefer consistently warm conditions; cool-season greens prefer milder temperatures.",
      environment?.climate ? `• Your saved climate is ${environment.climate}; use that as a starting point and watch local heat/cold extremes.` : "• Tell me your city/climate and the plant name for a more specific seasonal recommendation.",
    ].join("\n");
  }

  if (/\b(summer|hot weather|heat|heatwave)\b/.test(text)) {
    return [
      intro,
      "• Water deeply enough to moisten the root zone, but check the soil before repeating it.",
      "• Protect sensitive plants from harsh afternoon sun with appropriate shade rather than moving every plant indoors.",
      "• Mulch the soil surface lightly to slow moisture loss while keeping the stem/base clear.",
      "• Avoid heavy feeding during heat stress; stabilize water and root conditions first.",
    ].join("\n");
  }

  if (/\b(winter|cold weather|cold|frost|chilly)\b/.test(text)) {
    return [
      intro,
      "• Reduce watering frequency only when the soil actually dries more slowly; do not follow a calendar blindly.",
      "• Protect tropical plants from cold drafts and sudden temperature drops.",
      "• Keep foliage dry overnight when possible and monitor for slower growth rather than adding extra fertilizer.",
    ].join("\n");
  }

  if (/\b(indoor|inside|room|window|balcony|terrace|rooftop)\b/.test(text) && !plant) {
    return [
      "For a small urban garden:",
      "• Start by measuring the real light at the growing spot rather than choosing plants by appearance alone.",
      "• Use containers with drainage and leave room for airflow between plants.",
      "• On balconies and terraces, account for wind, heat from walls/floors, and the weight of wet containers.",
      "• Indoors, bright windows often work best for plants that need strong light; shade-tolerant plants can go farther from the window.",
    ].join("\n");
  }

  if (/\bhow (do i|to) plant|planting|plant this|plant a (seed|sapling|seedling)|transplant/.test(text)) {
    return [
      intro,
      "1. Choose a container or bed with drainage and enough root space for the plant's mature size.",
      `2. Use ${plant?.soil || "a clean, airy, well-draining potting mix"}; avoid compacted garden soil in small containers.`,
      "3. Plant at the correct depth: seeds are usually shallow, while seedlings should sit around the original soil line unless the crop specifically benefits from deeper planting.",
      `4. Water thoroughly after planting and place it in ${plant?.sunlight || "the appropriate light"}.`,
      "5. Watch new growth for the first 1–2 weeks and adjust watering or light gradually rather than making several changes at once.",
    ].join("\n");
  }

  if (/\b(pot size|container size|how big.*pot|what pot|grow bag)/.test(text)) {
    return [
      intro,
      "• Choose a pot with drainage holes and enough depth for the root system.",
      "• For a young plant, moving up one pot size at a time is safer than using a very large container that stays wet for too long.",
      plant?.name ? `• ${plant.name}: check the plant guide before choosing a final container size.` : "• Tell me the plant name and I can make the recommendation more specific.",
    ].join("\n");
  }

  if (/\b(ph|acidic|alkaline|soil ph|p(h)? level)/.test(text)) {
    return [
      intro,
      "• Soil pH affects nutrient availability; most common vegetables and herbs prefer a mildly acidic to near-neutral root zone.",
      "• Do not change pH blindly. Test the soil or mix first, then adjust gradually using a product made for horticultural use.",
      "• Compost improves structure, but it is not a universal pH correction.",
    ].join("\n");
  }

  if (/\b(npk|nitrogen|phosphorus|potassium)\b/.test(text)) {
    return [
      "NPK is the fertilizer label for nitrogen, phosphorus and potassium.",
      "• Nitrogen mainly supports leafy growth.",
      "• Phosphorus is involved in roots, flowering and energy transfer.",
      "• Potassium supports overall plant function, water regulation and stress tolerance.",
      "Use the label rate for the crop and avoid assuming more fertilizer will fix a light, root, pest or watering problem.",
    ].join("\n");
  }

  if (/\b(compost|organic matter|manure|vermicompost|cocopeat|perlite|vermiculite)\b/.test(text)) {
    return [
      "For container gardening, the goal is a mix that holds enough moisture while still draining and containing air around roots.",
      "• Compost or mature vermicompost can add organic matter and nutrients.",
      "• Coco coir helps moisture retention; perlite improves aeration and drainage.",
      "• Avoid using fresh manure or dense pure garden soil in a small pot; both can create root problems.",
    ].join("\n");
  }

  if (/\b(pollinat|pollinator|flowering|no fruit|flowers but no fruit|blossom drop)/.test(text)) {
    return [
      intro,
      "• Check light first; many fruiting crops need strong direct light to flower well.",
      "• Avoid excessive nitrogen if the plant is producing leaves but few flowers.",
      "• Protect flowers from severe heat, water stress and abrupt environmental changes.",
      "• For crops that need pollination help, gentle hand-pollination at the right flower stage can improve fruit set.",
    ].join("\n");
  }

  if (/\b(root rot|rotting roots|mushy roots|bad smell from soil)\b/.test(text)) {
    return [
      intro,
      "• Root rot is strongly associated with prolonged waterlogging and poor drainage.",
      "1. Stop routine watering and check how wet the root zone is.",
      "2. Confirm the container actually drains; empty standing water.",
      "3. If roots are soft or decayed, remove damaged tissue with clean tools and repot into fresh, airy mix when appropriate.",
      "4. Resume watering only after the plant is recovering and the mix has reached the plant's normal moisture level.",
    ].join("\n");
  }

  if (/\b(brown tips|crispy leaves|leaf edges|scorch|sunburn)/.test(text)) {
    return [
      intro,
      "• Brown or crispy edges can come from inconsistent watering, low humidity, salt buildup, heat, or excessive direct sun.",
      "• Check soil moisture, drainage, recent fertilizer use and the intensity of the light before treating it as a disease.",
      "• Remove only badly damaged tissue and correct the growing conditions first; new growth is the better indicator of recovery.",
    ].join("\n");
  }

  if (/\b(leggy|stretched|stretching|leaning toward light)/.test(text)) {
    return [
      intro,
      "• Leggy growth usually means the plant is not receiving enough usable light.",
      "• Move it toward brighter appropriate light gradually rather than placing a shade-grown plant suddenly in harsh midday sun.",
      "• Rotate containers periodically and prune or pinch according to the plant's normal growth habit once light is corrected.",
    ].join("\n");
  }

  if (/\b(spider mite|spider mites|whitefly|whiteflies|scale insect|scale insects|fungus gnat|fungus gnats|thrips|mealybug)/.test(text)) {
    return [
      intro,
      "• Inspect leaf undersides, tender shoots and the soil surface carefully; pest damage patterns matter.",
      "• Isolate the affected plant when practical and physically remove obvious pests before choosing treatment.",
      "• Improve airflow and correct overwatering or other stress that can make infestations harder to manage.",
      "• Use a product only according to its label and verify that it is appropriate for the crop you are treating.",
    ].join("\n");
  }

  if (/\b(harvest time|when should i harvest|when to harvest|ready to harvest|pick my)/.test(text) && plant) {
    return [
      intro,
      `• Typical growth cycle: ${plant.growthTime || "see the plant guide"}.`,
      `• Harvest cue: ${plant.harvestAdvice || "Harvest when the crop reaches its normal size, color, firmness or flowering stage."}`,
      "• Harvesting in the cooler part of the day is often gentle on the plant and produce.",
    ].join("\n");
  }

  if (/\b(humidity|humidifier|dry air|humidity for plants)/.test(text)) {
    return [
      intro,
      "• Humidity should match the plant; many tropical plants tolerate or prefer higher humidity, while succulents generally prefer drier air and very free drainage.",
      "• Improve humidity gradually and maintain airflow. Stagnant, very humid foliage can increase disease pressure.",
      environment?.humidity ? `• Your saved profile currently lists humidity as ${environment.humidity}.` : "• Tell me your room or garden humidity if you want a more specific comparison.",
    ].join("\n");
  }

  if (/\b(photosynthesis|chlorophyll|transpiration|plant respiration|why do plants need light)\b/.test(text)) {
    return [
      "Photosynthesis is the process by which green plants use light energy to convert carbon dioxide and water into chemical energy, producing oxygen as a by-product.",
      "• Chlorophyll captures much of the usable light.",
      "• Water comes mainly through the roots; carbon dioxide enters through leaf stomata.",
      "• Light, temperature, water supply and leaf health all affect how efficiently a plant grows.",
    ].join("\n");
  }

  if (/\b(garden|gardening|plants|plant care|grow plants|start a garden|balcony garden|terrace garden|container garden)\b/.test(text)) {
    return [
      "A healthy garden is mostly about matching a plant to its conditions and then keeping those conditions reasonably stable.",
      "• Start with light, drainage, container/root space and the plant's normal watering needs.",
      "• Feed during active growth according to the product label rather than using a stronger dose.",
      "• Monitor new growth for pests, nutrient stress, watering problems and disease symptoms.",
      plant ? `• For ${plant.name}, I can make these steps specific using its Garden Guide profile.` : "• Give me the plant name and your growing space for a more specific plan.",
    ].join("\n");
  }

  return null;
}

function practicalChecklist(topic, plant, environment) {
  const p = plant ? ` for ${plant.name}` : "";
  if (topic === "repot") {
    return [
      `A good repot check${p}:`,
      "1. Look for roots circling the pot, stalled growth, or soil that dries unusually fast.",
      "2. Move up only one pot size and use a drainage hole.",
      `3. Use ${plant?.soil || "a light, well-draining container mix"}.`,
      "4. Water in, then keep the plant in its normal light while it settles.",
    ].join("\n");
  }
  if (topic === "prune") {
    return [
      `Pruning guide${p}:`,
      "1. Start with dead, damaged, diseased, or badly crossing growth.",
      "2. Use clean, sharp shears and make clean cuts just above a healthy node.",
      "3. Avoid removing a large share of healthy foliage in one session.",
      plant?.careTips ? `4. Plant-specific note: ${plant.careTips}` : "4. Watch the next flush of growth before pruning again.",
    ].join("\n");
  }
  if (topic === "propagate") {
    return [
      `Propagation guide${p}:`,
      "• Choose healthy, non-flowering growth when possible.",
      "• Keep cuttings clean, lightly moist, and warm with bright indirect light.",
      "• Wait for new roots/new growth before moving the young plant into stronger light.",
      environment?.space ? `• Your setup is ${environment.space}; protect new cuttings from harsh direct sun.` : "",
    ].filter(Boolean).join("\n");
  }
  return null;
}

function profileEmailAnswer(user = {}) {
  const email = String(user?.email || "").trim();
  return email
    ? `Your account email is ${email}.`
    : "I don’t have your email saved in the current account profile yet. You can check it under Settings → Profile.";
}

function gardenInventoryAnswer(plants = []) {
  const items = Array.isArray(plants) ? plants.filter(Boolean) : [];
  if (!items.length) return "You currently have no plants saved in your Garden Guide garden.";
  return [
    `You currently have ${items.length} saved plant${items.length === 1 ? "" : "s"}:`,
    ...items.slice(0, 12).map((plant) => `• ${plant.name || "Unnamed plant"}`),
  ].join("\n");
}

function environmentAnswer(environment = {}) {
  const values = [
    ["place", environment.location],
    ["space", environment.space],
    ["sunlight", environment.sunlight],
    ["medium", environment.medium || environment.soil],
    ["watering", environment.watering],
    ["soil moisture", environment.soilMoisture],
    ["climate", environment.climate],
    ["temperature", environment.temperature || environment.numericTemp],
    ["humidity", environment.humidity || environment.numericHumidity],
  ].filter(([, value]) => String(value || "").trim());
  return values.length
    ? `Your saved Garden Guide environment is: ${values.map(([label, value]) => `${label}: ${value}`).join(" · ")}.`
    : "Your Garden Guide environment has not been configured yet. Open Settings → Environment to save it.";
}

function isGenericRoseInformationQuestion(message) {
  const text = normalize(message);
  if (!/\brose(?:s)?\b/.test(text)) return false;
  return /\b(tell me about|about|information|facts|types?|kinds?|varieties|categories|different)\b/.test(text)
    && !/\b(my garden|my setup|suitable|best|recommend|suggest|which one|what would you choose)\b/.test(text);
}

function findConversationPlant(conversation = [], savedPlants = []) {
  if (!Array.isArray(conversation) || !conversation.length) return null;
  const saved = Array.isArray(savedPlants) ? savedPlants.filter(Boolean) : [];
  const recentUserTurns = conversation.slice(-10).reverse().filter((turn) => !turn?.role || turn.role === "user");
  for (const turn of recentUserTurns) {
    const text = normalize(turn?.content || turn?.text || "");
    if (!text) continue;
    const namedSaved = saved.find((plant) => {
      const name = normalize(plant?.name);
      return name && text.includes(name);
    });
    if (namedSaved) return namedSaved;
    for (const [alias, name] of PLANT_ALIASES) {
      if (new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\b`, "i").test(text)) {
        return saved.find((plant) => normalize(plant?.name).includes(alias)) || plantByName(name) || { name };
      }
    }
  }
  return null;
}

export function getLocalAssistantAnswer(
  message,
  { environment = {}, plantNames = [], plants = [], conversation = [], user = {} } = {},
) {
  const text = normalize(message);

  // Identity and general-knowledge intents must be resolved before plant matching.
  // Otherwise a generic question can inherit whichever plant happens to be saved.
  if (/\b(what(?: is|\'s) my name|do you know my name|who am i)\b/i.test(text)) {
    const name = String(user?.name || user?.firstName || "").trim();
    return name
      ? `Your name is ${name}. I can also use the garden information saved in your Garden Guide account.`
      : "I don’t have your name saved in the current account profile yet. Add it under Settings → Profile.";
  }

  if (/\b(what(?: is|\'s) my email|what is my e-mail|what email do i use|which email is my account)\b/i.test(text)) {
    return profileEmailAnswer(user);
  }

  if (/\b(what plants do i have|my plants|plants in my garden|what(?: is|\'s) in my garden|show my garden)\b/i.test(text)) {
    return gardenInventoryAnswer(plants);
  }

  if (/\b(my environment|garden environment|my garden setup|what(?: is|\'s) my growing space|what settings did i save)\b/i.test(text)) {
    return environmentAnswer(environment);
  }

  if (isRoseTopic(message, conversation) && isAmbiguousRoseQuestion(message)) {
    return "Which rose do you mean? I can explain rose types, help you choose one for your garden, or compare specific roses. Tell me a little about your garden or the roses you are considering.";
  }

  // Suitability/recommendation must win over the generic rose-type list matcher.
  if (isRoseTopic(message, conversation) && /\b(recommend|suggest|best|suitable|good choice|which one|what would you choose|for my garden|for my setup|to grow|grow in my|grow well|will grow|good for|good in|one type)\b/.test(text)) {
    return recommendRoseType(environment);
  }

  if (isGenericRoseInformationQuestion(message)) {
    return [
      "There are several major rose groups, and each has a different growth habit:",
      "• Hybrid Tea — large, classic blooms, often grown for individual flowers.",
      "• Floribunda — clusters of flowers and repeated blooming, useful for fuller displays.",
      "• Grandiflora — tall roses that combine large blooms with clustered flowering.",
      "• Climbing Roses — long canes that can be trained over a trellis or support.",
      "• Shrub Roses — bushier plants that are generally useful for landscape-style planting.",
      "• Miniature Roses — compact plants and flowers that can work well in containers with enough light.",
      "• Old Garden Roses — historic groups valued for fragrance and distinctive forms.",
      "Choose the type based on your available sunlight, space, climate, fragrance preference, and whether you want individual blooms or repeated clusters."
    ].join("\n");
  }

  const plant = findPlant(message, plantNames, conversation, plants) || findConversationPlant(conversation, plants);
  const envText = environmentSummary(environment);
  const intro = plant ? `For ${plant.name}:` : "For your garden:";

  if (/^(hi|hello|hey|good morning|good afternoon|good evening|help|what can you do)[!.?\s]*$/i.test(text)) {
    return answerForGreeting();
  }

  if (/^(thanks|thank you|thx|okay|ok|got it|great|nice)[!.?\s]*$/i.test(text)) {
    return "You’re welcome! Tell me what you’re growing or what changed, and we’ll work through it together.";
  }

  if (/\b(what can you help me with|what do you know about gardening|are you a garden ai|what are you)\b/i.test(text)) {
    return [
      "I’m Garden Guide — a gardening assistant focused on practical plant care.",
      "I can help with planting, soil, watering, sunlight, fertilizer, pests, diseases, pruning, propagation, repotting, seasonal care, container gardening, harvesting, and questions about the plants saved in your garden.",
      "For a plant-specific answer, give me the plant name and what you want to know or what changed."
    ].join("\n");
  }

  if (/\b(recommend|suggest|what should i grow|which plant|best plant|what can i plant)\b/.test(text)) {
    return recommendPlants(environment);
  }

  if (plant && /\b(tell me about|about|care for|care of|take care|requirements|needs|profile|details|overview|how do i grow)\b/.test(text)) {
    return plantOverviewAnswer(plant, environment);
  }

  const planned = carePlan(message, plant, environment);
  if (planned) return planned;

  if (/\b(water|watering|dry soil|overwater|underwater|moisture|thirst)\b/.test(text)) {
    return [
      intro,
      plant ? `• Water guide: ${plant.water || "check soil moisture before watering"}.` : "• Check the top 1–2 inches of soil before watering.",
      "• Water at the soil line and let excess drain freely.",
      plant?.careTips ? `• Care note: ${plant.careTips}` : "• Recheck the soil before watering again instead of following a rigid calendar.",
    ].join("\n");
  }

  if (/\b(sun|sunlight|light|shade|bright|dark room|window)\b/.test(text)) {
    return [
      intro,
      plant ? `• Light target: ${plant.sunlight || "use bright, plant-appropriate light"}.` : "• Fruiting vegetables usually need several hours of direct light; many foliage plants prefer bright indirect light.",
      "• Move plants toward stronger light gradually to avoid sudden stress.",
    ].join("\n");
  }

  if (/\b(soil|potting|mix|drainage|pot|container)\b/.test(text) && !/\b(repot|repotting|root bound|rootbound|new pot|bigger pot)\b/.test(text)) {
    return [
      intro,
      plant ? `• Suitable medium: ${plant.soil || "a light, well-draining container mix"}.` : "• Use a light, well-draining container mix matched to the plant.",
      "• Use a container with drainage holes and avoid compacted soil.",
    ].join("\n");
  }

  if (/\b(pest|aphid|mite|whitefly|mealybug|thrips|insect|bug)\b/.test(text)) {
    return [
      intro,
      "• Inspect new growth and the undersides of leaves first.",
      "• Isolate a clearly affected plant when practical and remove visible pests gently.",
      "• Improve airflow and monitor fresh growth for several days before deciding on treatment.",
    ].join("\n");
  }

  const resolvedPlant = choosePlantForConversation(message, plant, plantNames, plants, conversation);

  if (/\b(repot|repotting|root bound|rootbound|new pot|bigger pot)\b/.test(text)) {
    return practicalChecklist("repot", resolvedPlant, environment) || practicalChecklist("repot", null, environment);
  }

  if (/\b(prune|pruning|trim|trimming|deadhead)\b/.test(text)) {
    return practicalChecklist("prune", resolvedPlant, environment) || practicalChecklist("prune", null, environment);
  }

  if (/\b(propagat|cutting|rooting|clone|multiply|from cutting)\b/.test(text)) {
    return practicalChecklist("propagate", resolvedPlant, environment) || practicalChecklist("propagate", null, environment);
  }

  if (/\b(plant|planting|how do i plant|how to plant|sow|sowing|transplant|transplanting|seedling|start a plant)\b/.test(text)) {
    const subject = resolvedPlant || plant;
    return [
      subject ? `Planting ${subject.name}:` : "A good planting sequence:",
      "1. Choose a container or bed with enough root space and reliable drainage.",
      subject?.soil ? `2. Use ${subject.soil}, or a similar airy medium suited to the plant.` : "2. Use a clean, airy growing medium matched to the crop.",
      subject?.sunlight ? `3. Place it where it receives ${subject.sunlight}.` : "3. Place the new plant in the light level it normally needs.",
      "4. Water thoroughly once after planting, let excess drain, and then follow the plant's normal moisture needs.",
      subject?.careTips ? `5. Plant-specific tip: ${subject.careTips}` : "5. Watch new growth for transplant stress and increase strong light gradually if the plant was raised in shade.",
    ].join("\n");
  }

  if (/\b(seed|sowing|germinat|germination|seedling|plant seeds)\b/.test(text)) {
    return [
      resolvedPlant ? `Starting ${resolvedPlant.name} from seed:` : "Starting plants from seed:",
      "• Use a clean, airy seed-starting medium and keep it evenly moist rather than saturated.",
      "• Give seedlings bright light as soon as they emerge so they do not become leggy.",
      resolvedPlant?.growthTime ? `• The guide lists roughly ${resolvedPlant.growthTime} for its growth cycle.` : "• Check the plant guide for its growth window.",
      "• Harden seedlings gradually before moving them into strong outdoor sun.",
    ].join("\n");
  }

  if (/\b(companion|companion planting|what grows with|pair with)\b/.test(text)) {
    return [
      "For companion planting, use it as a practical spacing and pest-management strategy rather than a guarantee.",
      resolvedPlant ? `• Start with ${resolvedPlant.name} and keep enough airflow around both plants.` : "• Tell me the main crop and I can suggest compatible container partners from the library.",
      "• Avoid crowding plants with very different water or light needs in the same container.",
    ].join("\n");
  }

  if (/\b(disease|blight|mildew|rot|fungal|bacterial|infection)\b/.test(text)) {
    return [
      intro,
      "• Treat the diagnosis as a screening question first; a photo and a few details are more reliable than one symptom word.",
      "• Check whether the problem is concentrated on old leaves, new growth, stems, or roots, and note how quickly it is spreading.",
      "• Also inspect watering, drainage, airflow, light, and recent fertilizer changes because these can mimic disease symptoms.",
      "• Use Leaf Detection as a screening aid and avoid using a chemical treatment until the likely cause is clearer.",
    ].join("\n");
  }

  if (/\b(yellow|wilting|droop|brown|spot|mold|fungus|powder|curl|leaf|leaves|symptom|sick)\b/.test(text)) {
    return [
      intro,
      "• First check soil moisture, drainage, and recent changes in care.",
      "• Then check light, pests, fertilizer use, and airflow.",
      plant ? `• ${plant.name}: ${plant.careTips || "Keep conditions stable and watch new growth."}` : "• Use the Leaf Scanner with a clear photo when the cause is uncertain.",
      "• A symptom by itself does not confirm a disease.",
    ].join("\n");
  }

  if (/\b(fertil|feed|feeding|compost|nutrient)\b/.test(text)) {
    return [
      intro,
      "• Feed according to the product label and the plant’s active growth stage.",
      "• Do not increase the dose just because growth is weak; light, roots, drainage, and pests can also be involved.",
      plant?.growthTime ? `• Guide growth window: ${plant.growthTime}.` : "",
    ].filter(Boolean).join("\n");
  }

  if (/\b(temp|temperature|climate|humidity|humid|weather)\b/.test(text)) {
    return [
      intro,
      plant ? `• Guide temperature: ${plant.temp || "not specified"}.` : "• I can use the environmental values saved in Garden Guide.",
      envText ? `• Saved setup: ${envText}` : "• Your environment profile does not contain every regional reading yet.",
      "• I will not invent live weather; use a current weather source for today's conditions.",
    ].join("\n");
  }

  if (/\b(compare|versus|vs\.)\b/.test(text)) {
    return [
      "I can compare plants using the Garden Guide library.",
      "• Compare their light, watering, container size, soil/drainage, growth cycle, and difficulty.",
      "• Give me the two plant names, for example: “mint vs tulsi for a sunny balcony”.",
    ].join("\n");
  }

  if (plant && /\b(grow|growth|harvest|ready|flower|bloom|days)\b/.test(text)) {
    return [
      intro,
      `• Growth window: ${plant.growthTime || "see the plant guide"}.`,
      `• Care/harvest note: ${plant.harvestAdvice || "Monitor mature growth and harvest gradually."}`,
      `• Difficulty: ${plant.difficulty || "not specified"}.`,
    ].join("\n");
  }

  const broadAnswer = generalGardenAnswer(message, plant, environment);
  if (broadAnswer) return broadAnswer;

  return [
    plant ? `Let’s work on ${plant.name}.` : "Absolutely — let’s troubleshoot your garden.",
    resolvedPlant ? `• I can use the ${resolvedPlant.name} guide: ${resolvedPlant.sunlight || "light not listed"}; ${resolvedPlant.water || "check soil moisture before watering"}.` : "• Tell me the plant name, what you see, where it is growing, and what changed recently.",
    envText ? `• Your saved setup is available to me: ${envText}.` : "• Your environment profile is not fully configured, so I’ll avoid inventing conditions.",
    "• Example: “My mint is in a balcony pot and its lower leaves are yellow. What should I check first?”",
  ].join("\n");
}
