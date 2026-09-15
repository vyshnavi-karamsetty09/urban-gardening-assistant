import plantTomatoImg from "./assets/plant-tomato.jpg";
import plantMintImg from "./assets/plant-mint.jpg";
import plantRoseImg from "./assets/plant-rose.jpg";
import plantMarigoldImg from "./assets/plant-marigold.jpg";
import basilPotImg from "./assets/basil-pot.jpg";
import plantAloeImg from "./assets/plant-aloe.jpg";
import plantCurryImg from "./assets/plant-curry.jpg";

// Real recognizable plant images sourced from authentic botanical photography
export const PLANT_REAL_IMAGES = {
  tomato: plantTomatoImg,
  bellPepper: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Green-Yellow-Red-Pepper-2009.jpg/1280px-Green-Yellow-Red-Pepper-2009.jpg",
  spinach: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80",
  cucumber: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/ARS_cucumber.jpg/960px-ARS_cucumber.jpg",
  chilli: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80",
  rose: plantRoseImg,
  marigold: plantMarigoldImg,
  sunflower: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/1280px-Sunflower_sky_backdrop.jpg",
  hibiscus: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Hibiscus_Brilliant.jpg/1280px-Hibiscus_Brilliant.jpg",
  jasmine: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Arabian_jasmin%2C_Tunisia_2010.jpg/1280px-Arabian_jasmin%2C_Tunisia_2010.jpg",
  lavender: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Single_lavender_flower02.jpg/1280px-Single_lavender_flower02.jpg",
  basil: basilPotImg,
  mint: plantMintImg,
  curry: plantCurryImg,
  coriander: "https://images.unsplash.com/photo-1588879460618-9249e7d947d1?auto=format&fit=crop&w=800&q=80",
  aloe: plantAloeImg,
  snakePlant: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg/1280px-Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg",
};

export const LIBRARY_PLANTS = [
  // --- Vegetables ---
  {
    id: "tomato",
    name: "Tomato",
    botanicalName: "Solanum lycopersicum",
    category: "Vegetables",
    difficulty: "Moderate",
    sunlight: "6–8 hrs (Full Sun)",
    water: "Daily in mornings",
    temp: "20–32°C",
    soil: "Well-draining, rich loamy",
    growthTime: "60–85 days",
    growthDays: 75,
    harvestAdvice: "Harvest when tomatoes turn uniformly rich red and feel slightly tender to gentle touch. Snip with short stem attached.",
    harvestType: "single",
    image: PLANT_REAL_IMAGES.tomato,
    description: "Rewarding container vegetable producing clusters of sweet, juicy red tomatoes in sunny balconies and gardens.",
    careTips: "Support heavy fruiting branches with trellises or garden stakes. Water near roots to prevent leaf blight.",
  },
  {
    id: "bell-pepper",
    name: "Bell Pepper / Capsicum",
    botanicalName: "Capsicum annuum",
    category: "Vegetables",
    difficulty: "Easy",
    sunlight: "6–8 hrs (Full Sun)",
    water: "Daily in warm weather",
    temp: "22–34°C",
    soil: "Compost-rich, moist loam",
    growthTime: "70–90 days",
    growthDays: 80,
    harvestAdvice: "Cut with shears when peppers reach firm full size and turn deep glossy green, red, or yellow. Leave short stalk intact.",
    harvestType: "single",
    image: PLANT_REAL_IMAGES.bellPepper,
    description: "Vibrant sweet peppers that thrive in pots on sunny terraces, providing crunchy, colorful red, green, and yellow harvests.",
    careTips: "Ensure regular watering during flowering and fruit setting. Fertilize with organic compost every two weeks.",
  },
  {
    id: "spinach",
    name: "Spinach / Palak",
    botanicalName: "Spinacia oleracea",
    category: "Vegetables",
    difficulty: "Very Easy",
    sunlight: "3–5 hrs (Partial Sun)",
    water: "Daily (Keep moist)",
    temp: "15–26°C",
    soil: "Loose, nutrient-dense soil",
    growthTime: "30–40 days",
    growthDays: 35,
    harvestAdvice: "Harvest outer mature leaves near base, allowing inner tender hearts to keep producing fresh flushes.",
    harvestType: "continuous",
    image: PLANT_REAL_IMAGES.spinach,
    description: "Fast-growing leafy superfood with tender crinkly dark-green leaves packed with iron and vitamins. Thrives in shallow window boxes.",
    careTips: "Harvest outer leaves continuously to encourage new flushes. Avoid hot midday sun to prevent premature bolting.",
  },
  {
    id: "cucumber",
    name: "Cucumber",
    botanicalName: "Cucumis sativus",
    category: "Vegetables",
    difficulty: "Moderate",
    sunlight: "6–8 hrs (Full Sun)",
    water: "Daily (High moisture)",
    temp: "22–32°C",
    soil: "Rich, fertile, well-draining",
    growthTime: "50–65 days",
    growthDays: 55,
    harvestAdvice: "Pick when 6-8 inches long, firm and uniformly green before they turn yellow or over-seed.",
    harvestType: "single",
    image: PLANT_REAL_IMAGES.cucumber,
    description: "Crisp and refreshing vining vegetable producing long straight green cucumbers along balcony trellises.",
    careTips: "Provide a vertical net or trellis to keep fruit off the soil, resulting in cleaner, straighter cucumbers.",
  },
  {
    id: "chilli",
    name: "Green Chilli (Mirchi)",
    botanicalName: "Capsicum frutescens",
    category: "Vegetables",
    difficulty: "Easy",
    sunlight: "6–8 hrs (Full Sun)",
    water: "Daily in warm seasons",
    temp: "20–35°C",
    soil: "Light, well-drained loamy",
    growthTime: "60–75 days",
    growthDays: 65,
    harvestAdvice: "Clip green chilies using scissors when firm and crisp, or leave longer on plant for hot red peppers.",
    harvestType: "single",
    image: PLANT_REAL_IMAGES.chilli,
    description: "Prolific spicy chili pepper plant yielding abundant slender green pods on sunny balconies and container gardens.",
    careTips: "Allow soil surface to dry slightly between waterings to encourage pungent flavor and abundant flowering.",
  },

  // --- Flowers ---
  {
    id: "rose",
    name: "Garden Rose",
    botanicalName: "Rosa rubiginosa",
    category: "Flowers",
    difficulty: "Moderate",
    sunlight: "6–8 hrs (Direct Sun)",
    water: "Daily during blooming",
    temp: "18–28°C",
    soil: "Rich, well-aerated with compost",
    growthTime: "45–60 days",
    growthDays: 50,
    harvestAdvice: "Cut early morning at 45° angle when outer petals begin loosening. Regular deadheading triggers continuous blooms.",
    harvestType: "repeat-bloom",
    image: PLANT_REAL_IMAGES.rose,
    description: "Timeless classic flowering plant bringing vibrant red blooms, delicate fragrance, and beauty to balconies and patios.",
    careTips: "Deadhead spent blossoms promptly to stimulate flush blooming cycles. Prune dead or crisscrossed canes annually.",
  },
  {
    id: "marigold",
    name: "Marigold (Genda)",
    botanicalName: "Tagetes erecta",
    category: "Flowers",
    difficulty: "Easy",
    sunlight: "6–8 hrs (Full Sun)",
    water: "3–4 times/week",
    temp: "18–35°C",
    soil: "Standard potting mix",
    growthTime: "45–60 days",
    growthDays: 50,
    harvestAdvice: "Pluck full blooming flower heads right above the stem junction for festive decor or natural insect repelling.",
    harvestType: "repeat-bloom",
    image: PLANT_REAL_IMAGES.marigold,
    description: "Cheery golden-orange flowers beloved in festive celebrations and natural companion planting to repel garden pests.",
    careTips: "Drought-tolerant once established. Pinch back young growing tips early on to induce bushier branching and more buds.",
  },
  {
    id: "sunflower",
    name: "Dwarf Sunflower",
    botanicalName: "Helianthus annuus",
    category: "Flowers",
    difficulty: "Very Easy",
    sunlight: "6–8 hrs (Maximum Sun)",
    water: "Daily during summer",
    temp: "21–35°C",
    soil: "Nutrient-rich, well-drained",
    growthTime: "55–70 days",
    growthDays: 60,
    harvestAdvice: "Harvest flower heads when petals start drooping and back of seedhead turns golden brownish-yellow.",
    harvestType: "single",
    image: PLANT_REAL_IMAGES.sunflower,
    description: "Radiant golden-yellow blooms that track the sun throughout the day, attracting honeybees and cheerful terrace vibes.",
    careTips: "Ensure deep watering so the taproot develops strongly in pots at least 10–12 inches deep.",
  },
  {
    id: "hibiscus",
    name: "Tropical Hibiscus (Gudhal)",
    botanicalName: "Hibiscus rosa-sinensis",
    category: "Flowers",
    difficulty: "Easy",
    sunlight: "6–8 hrs (Bright Sun)",
    water: "Daily in summer",
    temp: "20–35°C",
    soil: "Well-draining, slightly acidic",
    growthTime: "50–65 days",
    growthDays: 55,
    harvestAdvice: "Harvest vibrant blooms in the morning when fully open for edible hibiscus tea or botanical beauty.",
    harvestType: "repeat-bloom",
    image: PLANT_REAL_IMAGES.hibiscus,
    description: "Stunning large tropical crimson-red blossoms with prominent golden stamens that bring a resort-like floral ambiance.",
    careTips: "Thrives with potassium-rich organic fertilizers. Spray with neem oil occasionally to guard against whiteflies and aphids.",
  },
  {
    id: "jasmine",
    name: "Jasmine / Mogra",
    botanicalName: "Jasminum sambac",
    category: "Flowers",
    difficulty: "Easy",
    sunlight: "4–6 hrs (Morning Sun)",
    water: "2–3 times/week",
    temp: "20–32°C",
    soil: "Loamy, well-draining",
    growthTime: "45–60 days",
    growthDays: 50,
    harvestAdvice: "Pick tightly closed or slightly unfurled white flower buds at dusk when their aroma peaks.",
    harvestType: "repeat-bloom",
    image: PLANT_REAL_IMAGES.jasmine,
    description: "Intensely fragrant star-shaped pristine white blossoms that perfume the evening air and make relaxing botanical teas.",
    careTips: "Prune lightly after blooming cycles to stimulate fresh flowering lateral shoots for the next season.",
  },
  {
    id: "lavender",
    name: "English Lavender",
    botanicalName: "Lavandula angustifolia",
    category: "Flowers",
    difficulty: "Moderate",
    sunlight: "6–8 hrs (Direct Sun)",
    water: "Once a week (Drought tolerant)",
    temp: "15–28°C",
    soil: "Gritty, alkaline, free-draining",
    growthTime: "70–90 days",
    growthDays: 75,
    harvestAdvice: "Snip flower spikes just as lower third of flower buds begin opening; hang upside down in dry shade.",
    harvestType: "repeat-bloom",
    image: PLANT_REAL_IMAGES.lavender,
    description: "Aromatic soothing purple flower spikes known for calming essential oils, natural sleep aid, and pollinator attraction.",
    careTips: "Never overwater lavender. Ensure the container has ample drainage holes and gritty potting gravel.",
  },

  // --- Herbs ---
  {
    id: "basil",
    name: "Holy Basil (Tulsi)",
    botanicalName: "Ocimum tenuiflorum",
    category: "Herbs",
    difficulty: "Easy",
    sunlight: "4–6 hrs (Morning Sun)",
    water: "2–3 times/week",
    temp: "20–35°C",
    soil: "Well-drained porous soil",
    growthTime: "30–45 days",
    growthDays: 35,
    harvestAdvice: "Pinch top 2-3 leaf pairs above a node regularly. Stimulates continuous bushiness and fresh medicinal leaves.",
    harvestType: "continuous",
    image: PLANT_REAL_IMAGES.basil,
    description: "Revered medicinal and aromatic herb known for its therapeutic qualities, stress-relieving aroma, and air-purifying prowess.",
    careTips: "Pinch off flowering seed tips to encourage bushy, dense foliage instead of leggy flowering stems.",
  },
  {
    id: "mint",
    name: "Spearmint / Pudina",
    botanicalName: "Mentha spicata",
    category: "Herbs",
    difficulty: "Very Easy",
    sunlight: "4–6 hrs (Partial Sun)",
    water: "Daily (Keep soil moist)",
    temp: "15–30°C",
    soil: "Moist, fertile potting mix",
    growthTime: "20–30 days",
    growthDays: 25,
    harvestAdvice: "Cut sprigs with scissors 1 inch above soil level. Fresh shoots regenerate rapidly within 10–14 days.",
    harvestType: "continuous",
    image: PLANT_REAL_IMAGES.mint,
    description: "Fast-spreading, refreshingly aromatic herb ideal for teas, chutneys, cooling beverages, and natural pest deterrence.",
    careTips: "Grows vigorously via runners. Best planted in isolated containers so its aggressive roots do not overtake other pots.",
  },
  {
    id: "curry",
    name: "Curry Leaf (Kadi Patta)",
    botanicalName: "Murraya koenigii",
    category: "Herbs",
    difficulty: "Easy",
    sunlight: "6–8 hrs (Warm Sun)",
    water: "Daily in summer",
    temp: "20–35°C",
    soil: "Rich, slightly acidic loam",
    growthTime: "40–60 days",
    growthDays: 45,
    harvestAdvice: "Snip entire compound leaflets at stem base with scissors. Regular pruning keeps plant bushy and aromatic.",
    harvestType: "continuous",
    image: PLANT_REAL_IMAGES.curry,
    description: "Essential culinary shrub across Indian cooking, producing highly fragrant compound leaves packed with antioxidants.",
    careTips: "Feed once a month with sour buttermilk diluted in water or organic compost for glossy, emerald-green leaf flushes.",
  },
  {
    id: "coriander",
    name: "Coriander / Cilantro",
    botanicalName: "Coriandrum sativum",
    category: "Herbs",
    difficulty: "Very Easy",
    sunlight: "3–5 hrs (Mild Sun)",
    water: "Daily in small amounts",
    temp: "15–25°C",
    soil: "Moist, light, well-drained",
    growthTime: "25–35 days",
    growthDays: 30,
    harvestAdvice: "Harvest outer lower leaves individually, or snip entire stems at soil line before flowering shoots appear.",
    harvestType: "continuous",
    image: PLANT_REAL_IMAGES.coriander,
    description: "Fresh essential culinary herb with delicate citrusy green serrated leaves, quick to harvest from container window boxes.",
    careTips: "Keep in partial shade during peak hot afternoons to delay seed bolting and yield multiple fresh cuttings.",
  },

  // --- Succulents ---
  {
    id: "aloe",
    name: "Aloe Vera",
    botanicalName: "Aloe barbadensis miller",
    category: "Succulents",
    difficulty: "Very Easy",
    sunlight: "4–6 hrs (Bright Indirect)",
    water: "Once every 7–10 days",
    temp: "15–35°C",
    soil: "Cactus / gritty succulent mix",
    growthTime: "60–90 days",
    growthDays: 75,
    harvestAdvice: "Slice thick, fleshy bottom outer leaves flush with trunk using a clean sharp knife; harvest clear soothing gel.",
    harvestType: "continuous",
    image: PLANT_REAL_IMAGES.aloe,
    description: "Tough, drought-hardy succulent with thick fleshy spiky leaves loaded with soothing medicinal gel for skin hydration and burns.",
    careTips: "Sensitive to overwatering. Always let the potting soil dry out completely between watering sessions.",
  },
  {
    id: "snake-plant",
    name: "Snake Plant (Sansevieria)",
    botanicalName: "Dracaena trifasciata",
    category: "Succulents",
    difficulty: "Very Easy",
    sunlight: "Low Light to Full Sun",
    water: "Once every 2–3 weeks",
    temp: "15–35°C",
    soil: "Free-draining gritty cactus mix",
    growthTime: "75–90 days",
    growthDays: 80,
    harvestAdvice: "Propagate mature healthy leaves by cutting a clean 3-4 inch section and rooting in potting mix.",
    harvestType: "continuous",
    image: PLANT_REAL_IMAGES.snakePlant,
    description: "Indestructible air-purifying architectural houseplant with upright sword-shaped leaves with yellow margins. Tolerates low light and drought.",
    careTips: "Water only when soil is completely dry to prevent rhizome rot. Tolerates almost any lighting condition from dim corners to bright sun.",
  },
];

export const getPlantImage = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("sunflower") || lower.includes("surajmukhi")) {
    return PLANT_REAL_IMAGES.sunflower;
  }
  if (lower.includes("marigold") || lower.includes("genda")) {
    return PLANT_REAL_IMAGES.marigold;
  }
  if (lower.includes("hibiscus") || lower.includes("gudhal")) {
    return PLANT_REAL_IMAGES.hibiscus;
  }
  if (lower.includes("jasmine") || lower.includes("mogra")) {
    return PLANT_REAL_IMAGES.jasmine;
  }
  if (lower.includes("lavender")) {
    return PLANT_REAL_IMAGES.lavender;
  }
  if (lower.includes("rose") || lower.includes("gulab")) {
    return PLANT_REAL_IMAGES.rose;
  }
  if (lower.includes("pepper") || lower.includes("capsicum") || lower.includes("shimla")) {
    return PLANT_REAL_IMAGES.bellPepper;
  }
  if (lower.includes("chilli") || lower.includes("chili") || lower.includes("mirch")) {
    return PLANT_REAL_IMAGES.chilli;
  }
  if (lower.includes("tomato") || lower.includes("tamatar")) {
    return PLANT_REAL_IMAGES.tomato;
  }
  if (lower.includes("cucumber") || lower.includes("kheera")) {
    return PLANT_REAL_IMAGES.cucumber;
  }
  if (lower.includes("spinach") || lower.includes("palak")) {
    return PLANT_REAL_IMAGES.spinach;
  }
  if (lower.includes("coriander") || lower.includes("cilantro") || lower.includes("dhania")) {
    return PLANT_REAL_IMAGES.coriander;
  }
  if (lower.includes("snake") || lower.includes("sansevieria")) {
    return PLANT_REAL_IMAGES.snakePlant;
  }
  if (lower.includes("mint") || lower.includes("pudina")) {
    return PLANT_REAL_IMAGES.mint;
  }
  if (lower.includes("basil") || lower.includes("tulsi")) {
    return PLANT_REAL_IMAGES.basil;
  }
  if (lower.includes("aloe")) {
    return PLANT_REAL_IMAGES.aloe;
  }
  if (lower.includes("curry") || lower.includes("kadi")) {
    return PLANT_REAL_IMAGES.curry;
  }
  return PLANT_REAL_IMAGES.tomato;
};

export const getPlantGrowthMeta = (name = "", type = "") => {
  const lower = name.toLowerCase();
  const match = LIBRARY_PLANTS.find(
    (p) =>
      p.id.toLowerCase() === lower ||
      p.name.toLowerCase() === lower ||
      lower.includes(p.name.toLowerCase().split(" ")[0].toLowerCase())
  );
  if (match) {
    return {
      growthDays: match.growthDays,
      growthTime: match.growthTime,
      harvestAdvice: match.harvestAdvice,
      harvestType: match.harvestType,
    };
  }

  // Category & heuristic fallbacks for custom plants
  const t = (type || "").toLowerCase();
  if (t.includes("veg") || lower.includes("veg") || lower.includes("fruit")) {
    return {
      growthDays: 70,
      growthTime: "60–80 days",
      harvestAdvice: "Harvest when vegetables are firm, full-sized, and vibrantly colored.",
      harvestType: "single",
    };
  }
  if (t.includes("herb") || lower.includes("herb")) {
    return {
      growthDays: 30,
      growthTime: "25–35 days",
      harvestAdvice: "Pinch top healthy leaf clusters regularly for continuous flushes.",
      harvestType: "continuous",
    };
  }
  if (t.includes("flower") || lower.includes("flower")) {
    return {
      growthDays: 50,
      growthTime: "45–60 days",
      harvestAdvice: "Cut blossoms in early morning when buds start unfurling.",
      harvestType: "repeat-bloom",
    };
  }
  if (t.includes("succulent")) {
    return {
      growthDays: 75,
      growthTime: "60–90 days",
      harvestAdvice: "Trim outer mature bottom leaves cleanly near the soil base.",
      harvestType: "continuous",
    };
  }
  return {
    growthDays: 60,
    growthTime: "50–70 days",
    harvestAdvice: "Harvest when plant reaches healthy mature foliage.",
    harvestType: "continuous",
  };
};
