import { useState, useEffect } from "react";
import { getSavedPlants, getSavedTasks, saveTasks } from "../utils";
import PageHeaderBanner from "../components/PageHeaderBanner";
import "./DiseaseDetection.css";

// Import local disease leaf images
import earlyBlightImg from "../assets/diseases/early-blight.jpg";
import powderyMildewImg from "../assets/diseases/powdery-mildew.jpg";
import spiderMitesImg from "../assets/diseases/spider-mites.jpg";
import ironChlorosisImg from "../assets/diseases/iron-chlorosis.jpg";
import bacterialLeafSpotImg from "../assets/diseases/bacterial-leaf-spot.jpg";
import aphidsImg from "../assets/diseases/aphids.jpg";
import rootRotImg from "../assets/diseases/root-rot.svg";
import healthyPlantImg from "../assets/diseases/healthy-plant.svg";

// Comprehensive disease knowledge base with disease-specific images and highlighted treatments
const DISEASES_DATABASE = [
  {
    id: "early-blight",
    name: "Early Blight (Alternaria Solani)",
    commonName: "Leaf Spot & Blight",
    category: "Fungal",
    severity: "Moderate",
    image: earlyBlightImg,
    plants: ["Tomato", "Potato", "Eggplant", "General"],
    plantParts: ["Leaves", "Stem", "Flowers/Fruit"],
    symptoms: ["Brown or black spots", "Yellowing leaves", "Concentric target rings", "Lower leaves dying"],
    causes: "Warm, humid conditions (24–30°C) with persistent leaf moisture or splashing soil water.",
    immediateAction: "🚨 Prune off and discard heavily infected bottom leaves immediately. Sanitize pruners with 70% rubbing alcohol between each cut to avoid spreading spores.",
    organicTreatment: "🌿 NEEM & BAKING SODA PROTOCOL:\n• Mix 5ml cold-pressed organic Neem oil + 1 tsp mild castile soap + 1 tsp baking soda in 1 liter of warm water.\n• Spray thoroughly on both leaf tops and undersides early in the morning every 5 to 7 days until new growth is clean.",
    chemicalTreatment: "🧪 Apply liquid copper fungicide (copper octanoate) or chlorothalonil spray at 7-day intervals during warm, wet weather.",
    prevention: "🛡️ Water strictly at the soil base with a watering wand. Never wet foliage. Mulch soil around stems with clean straw or bark to stop soil splashing.",
    badgeColor: "#d97706",
  },
  {
    id: "powdery-mildew",
    name: "Powdery Mildew (Podosphaera / Erysiphe)",
    commonName: "White Leaf Mold",
    category: "Fungal",
    severity: "Mild to Moderate",
    image: powderyMildewImg,
    plants: ["Rose", "Mint", "Zucchini", "Cucumber", "Indoor Plant", "General"],
    plantParts: ["Leaves", "Stem", "Flowers/Fruit"],
    symptoms: ["White powdery coating", "Curling or distorted leaves", "Dull foliage", "Bud drop"],
    causes: "Moderate temperatures (15–27°C) combined with high relative humidity and poor air circulation in shaded corners.",
    immediateAction: "🚨 Wipe mildly affected leaves with a damp cloth or prune off heavily coated branch tips. Immediately move the plant to an airy location with morning sunlight.",
    organicTreatment: "🌿 MILK & POTASSIUM BICARBONATE CURE:\n• Mix 1 part whole or skim milk with 9 parts water. Spray in direct morning sunlight; the protein acts as a natural sun-activated anti-fungal agent.\n• Alternatively, mix 1 tbsp potassium bicarbonate + 1/2 tsp vegetable oil in 1 liter of water and spray weekly.",
    chemicalTreatment: "🧪 Apply wettable micronized sulfur spray or myclobutanil fungicide (do not apply sulfur when temperatures exceed 30°C to avoid leaf burn).",
    prevention: "🛡️ Prune dense interior stems to promote ventilation. Avoid high-nitrogen fertilizers that generate weak, tender leaves prone to spore attachment.",
    badgeColor: "#8b5cf6",
  },
  {
    id: "spider-mites",
    name: "Spider Mites (Tetranychus urticae)",
    commonName: "Two-Spotted Spider Mites",
    category: "Pest",
    severity: "Moderate",
    image: spiderMitesImg,
    plants: ["Mint", "Tulsi", "Rose", "Tomato", "Indoor Plant", "General"],
    plantParts: ["Leaves", "Stem"],
    symptoms: ["Fine webbing on undersides", "Yellow stippling or pinprick dots", "Bronzed or dry leaves", "Curling leaves"],
    causes: "Hot, dry, and dusty indoor or balcony conditions. Low humidity triggers explosive mite breeding.",
    immediateAction: "🚨 Take plant to sink or balcony and wash leaf undersides with a firm spray of lukewarm water to knock off mites and destroy webbing.",
    organicTreatment: "🌿 INSECTICIDAL SOAP & NEEM ROTATION:\n• Spray natural insecticidal soap (or 1 tsp mild liquid soap in 1L water) directly onto leaf undersides where mites hide.\n• Alternate with 100% pure neem oil spray every 3 to 4 days for 2 consecutive weeks to disrupt egg hatching cycles.",
    chemicalTreatment: "🧪 Apply abamectin or bifenazate miticide for resistant ornamental plant infestations.",
    prevention: "🛡️ Mist plants regularly to maintain 55–65% humidity. Wipe dust off leaves weekly with a damp microfiber cloth.",
    badgeColor: "#dc2626",
  },
  {
    id: "iron-chlorosis",
    name: "Iron Chlorosis (Nutrient Deficiency)",
    commonName: "Interveinal Leaf Yellowing",
    category: "Nutritional",
    severity: "Mild",
    image: ironChlorosisImg,
    plants: ["Citrus", "Rose", "Hibiscus", "Indoor Plant", "General"],
    plantParts: ["Leaves"],
    symptoms: ["Yellowing leaves with dark green veins", "Pale new foliage", "Slow growth"],
    causes: "Alkaline soil pH (>7.0), heavy compacted waterlogged soil, or root distress inhibiting iron absorption.",
    immediateAction: "🚨 Pause watering and let top 2 inches dry out. Stop using hard tap water if possible; switch to filtered or rainwater.",
    organicTreatment: "🌿 CHELATED IRON & COMPOST RESTORATION:\n• Apply chelated iron (Fe-EDDHA for alkaline soil or Fe-EDTA for neutral soil) as a foliar spray (diluted 1g per liter) for rapid greening within 5 days.\n• Topdress pot with 1 inch of decomposed organic compost or worm castings to naturally balance soil pH.",
    chemicalTreatment: "🧪 Apply water-soluble micronutrient tonic containing chelated iron, manganese, and zinc at 2-week intervals.",
    prevention: "🛡️ Repot in loose potting mix with 20% peat moss or coco peat. Flush pots with plain water quarterly to prevent fertilizer salt encrustation.",
    badgeColor: "#ca8a04",
  },
  {
    id: "bacterial-leaf-spot",
    name: "Bacterial Leaf Spot (Xanthomonas spp.)",
    commonName: "Bacterial Spot",
    category: "Bacterial",
    severity: "Moderate to Severe",
    image: bacterialLeafSpotImg,
    plants: ["Tulsi", "Pepper", "Tomato", "General"],
    plantParts: ["Leaves", "Stem", "Flowers/Fruit"],
    symptoms: ["Water-soaked dark lesions", "Brown spots with yellow halos", "Premature leaf fall"],
    causes: "Splashing rain or sprinkler water spreading bacteria across damp foliage in warm weather.",
    immediateAction: "🚨 Remove and discard all infected spotted leaves into trash (do not compost). Strictly keep foliage dry.",
    organicTreatment: "🌿 COPPER SOAP & BIO-BACTERICIDE:\n• Spray copper octanoate (copper soap bactericide) at first sign of spots on cool mornings.\n• Alternatively, apply beneficial bio-fungicide containing Bacillus subtilis to outcompete pathogenic bacteria on leaf surfaces.",
    chemicalTreatment: "🧪 Fixed copper hydroxide bactericide applied every 7 to 10 days during rainy or high-humidity periods.",
    prevention: "🛡️ Never work with plants when leaves are wet. Disinfect pruning tools with rubbing alcohol between plants. Water strictly at soil line.",
    badgeColor: "#b45309",
  },
  {
    id: "root-rot",
    name: "Root Rot (Pythium / Phytophthora)",
    commonName: "Overwatering Root Decay",
    category: "Fungal",
    severity: "Severe",
    image: rootRotImg,
    plants: ["Snake Plant", "Monstera", "Aloe Vera", "Indoor Plant", "General"],
    plantParts: ["Roots/Soil", "Leaves", "Stem"],
    symptoms: ["Wilting despite wet soil", "Yellowing, mushy leaves", "Dark soft stems at soil line", "Stunted growth"],
    causes: "Poor drainage holes, heavy waterlogged potting soil, and frequent watering depriving roots of oxygen.",
    immediateAction: "🚨 EMERGENCY SURGERY: Unpot the plant immediately! Gently wash away all soggy soil from roots under lukewarm water. Use sterilized shears to snip away ALL black, brown, slimy, or foul-smelling roots until only firm white/cream root tissue remains.",
    organicTreatment: "🌿 3-STEP ROOT RESCUE & DISINFECTION CURE:\n1. Soak cleaned root ball for 10–15 minutes in a 3% hydrogen peroxide solution (1 part H2O2 to 4 parts water) to oxidize and kill anaerobic fungal spores.\n2. Dust cut root ends generously with natural cinnamon powder or activated charcoal powder (potent natural anti-fungal sealants).\n3. Repot into a clean pot with fresh, completely dry potting mix amended with 30–40% coarse perlite or pumice. DO NOT water for 3 to 4 days to allow root calluses to heal.",
    chemicalTreatment: "🧪 Drench soil with systemic anti-rot fungicide containing Potassium Phosphite (Agri-Fos) or Mefenoxam to halt pathogen spread.",
    prevention: "🛡️ Always use pots with open drainage holes. Apply the 'Two-Inch Rule': never water until the top 2 inches of soil feel dry to the touch. Never leave standing water in saucers.",
    badgeColor: "#991b1b",
  },
  {
    id: "aphids",
    name: "Aphids / Greenfly & Blackfly",
    commonName: "Sap-Sucking Plant Lice",
    category: "Pest",
    severity: "Mild to Moderate",
    image: aphidsImg,
    plants: ["Rose", "Tomato", "Mint", "Tulsi", "General"],
    plantParts: ["Leaves", "Stem", "Flowers/Fruit"],
    symptoms: ["Clusters of tiny green/black bugs", "Sticky honeydew on leaves", "Curling new shoot growth", "Ants crawling on plant"],
    causes: "Tender new spring or monsoon growth attracting migrating winged aphids.",
    immediateAction: "🚨 Blast aphids off with a strong jet of tap water or wipe off colonies with a damp cloth soaked in mild soapy water.",
    organicTreatment: "🌿 SOAP & NEEM FOLIAR KNOCKDOWN:\n• Mix 1 tsp pure liquid castile soap + 5ml pure neem oil in 1 liter of warm water.\n• Spray thoroughly on stem tips and leaf undersides every 3 to 4 days until the infestation is completely gone.",
    chemicalTreatment: "🧪 Spray natural pyrethrin or acetamiprid systemic insecticide for persistent outdoor infestations.",
    prevention: "🛡️ Companion plant with marigold, garlic, or chives to deter aphids; encourage beneficial insects like ladybugs.",
    badgeColor: "#15803d",
  },
  {
    id: "healthy-plant",
    name: "Healthy Plant Status",
    commonName: "No Disease Detected",
    category: "Healthy",
    severity: "Healthy",
    image: healthyPlantImg,
    plants: ["Tomato", "Rose", "Mint", "Tulsi", "Snake Plant", "General"],
    plantParts: ["Leaves", "Stem", "Roots/Soil", "Flowers/Fruit"],
    symptoms: ["Vibrant green foliage", "Firm erect stems", "Active new bud growth"],
    causes: "Optimal balance of sunlight, soil drainage, watering cadence, and nutrition.",
    immediateAction: "✓ No emergency action needed! Keep maintaining your current plant care routine.",
    organicTreatment: "🌿 ROUTINE WELLNESS CARE:\n• Feed plants with balanced organic vermicompost or seaweed extract once every 3 to 4 weeks during active growth.\n• Wipe leaves with a damp microfiber cloth monthly to keep pores open for photosynthesis.",
    chemicalTreatment: "None needed.",
    prevention: "🛡️ Inspect leaf undersides weekly to catch pests before they spread. Rotate pots monthly for even light exposure.",
    badgeColor: "#16a34a",
  },
];

// Sample test cases for one-click testing with visual leaf thumbnails
const SAMPLE_TEST_CASES = [
  {
    title: "Overwatered Root Rot",
    diseaseId: "root-rot",
    plant: "Indoor Plant",
    confidence: 97,
    icon: "🥀",
    image: rootRotImg,
  },
  {
    title: "Tomato Early Blight",
    diseaseId: "early-blight",
    plant: "Tomato",
    confidence: 96,
    icon: "🍅",
    image: earlyBlightImg,
  },
  {
    title: "Rose Powdery Mildew",
    diseaseId: "powdery-mildew",
    plant: "Rose",
    confidence: 94,
    icon: "🌹",
    image: powderyMildewImg,
  },
  {
    title: "Mint Spider Mites",
    diseaseId: "spider-mites",
    plant: "Mint",
    confidence: 92,
    icon: "🌿",
    image: spiderMitesImg,
  },
  {
    title: "Citrus Iron Yellowing",
    diseaseId: "iron-chlorosis",
    plant: "Citrus",
    confidence: 95,
    icon: "🍋",
    image: ironChlorosisImg,
  },
  {
    title: "Tulsi Bacterial Spot",
    diseaseId: "bacterial-leaf-spot",
    plant: "Tulsi",
    confidence: 89,
    icon: "🌱",
    image: bacterialLeafSpotImg,
  },
  {
    title: "Aphids Infestation",
    diseaseId: "aphids",
    plant: "Garden Plant",
    confidence: 93,
    icon: "🐛",
    image: aphidsImg,
  },
  {
    title: "Healthy Leaf Check",
    diseaseId: "healthy-plant",
    plant: "Monstera / Houseplant",
    confidence: 98,
    icon: "🪴",
    image: healthyPlantImg,
  },
];

const SYMPTOM_OPTIONS = [
  "Yellowing leaves",
  "Brown or black spots",
  "White powdery coating",
  "Curling or distorted leaves",
  "Fine webbing on undersides",
  "Yellow stippling or pinprick dots",
  "Water-soaked dark lesions",
  "Wilting despite wet soil",
  "Clusters of tiny green/black bugs",
  "Sticky honeydew on leaves",
  "Dark soft stems at soil line",
];

const PLANT_PARTS = ["All Parts", "Leaves", "Stem", "Roots/Soil", "Flowers/Fruit"];

const SYMPTOM_CATEGORIES = {
  leaf: [
    "Yellowing leaves",
    "Brown or black spots",
    "White powdery coating",
    "Curling or distorted leaves",
    "Yellow stippling or pinprick dots",
    "Water-soaked dark lesions",
  ],
  pest: [
    "Fine webbing on undersides",
    "Clusters of tiny green/black bugs",
    "Sticky honeydew on leaves",
    "Yellow stippling or pinprick dots",
  ],
  root: [
    "Wilting despite wet soil",
    "Dark soft stems at soil line",
    "Yellowing leaves",
  ],
};

const SYMPTOM_PRESETS = [
  {
    id: "mildew",
    name: "Powdery Coating",
    icon: "🍄",
    symptoms: ["White powdery coating", "Curling or distorted leaves"],
    part: "Leaves",
    target: "Fungal",
  },
  {
    id: "rot",
    name: "Stem Rot & Wilt",
    icon: "💧",
    symptoms: ["Wilting despite wet soil", "Dark soft stems at soil line"],
    part: "Roots/Soil",
    target: "Fungal / Oomycete",
  },
  {
    id: "mites",
    name: "Mite Webbing & Dots",
    icon: "🕷️",
    symptoms: ["Fine webbing on undersides", "Yellow stippling or pinprick dots"],
    part: "Leaves",
    target: "Pest",
  },
  {
    id: "blight",
    name: "Dark Spots & Halos",
    icon: "🍂",
    symptoms: ["Brown or black spots", "Yellowing leaves"],
    part: "Leaves",
    target: "Fungal / Bacterial",
  },
  {
    id: "aphids",
    name: "Tiny Bugs & Sticky Leaf",
    icon: "🐛",
    symptoms: ["Clusters of tiny green/black bugs", "Sticky honeydew on leaves"],
    part: "Leaves",
    target: "Pest",
  },
  {
    id: "chlorosis",
    name: "Iron Chlorosis",
    icon: "🧪",
    symptoms: ["Yellowing leaves", "Yellow stippling or pinprick dots"],
    part: "Leaves",
    target: "Nutritional",
  },
];

function DiseaseDetection({ onPageChange, initialSymptom = "" }) {
  // Navigation tabs: 'scanner', 'wizard', 'library'
  const [activeTab, setActiveTab] = useState("scanner");

  // Scanner state
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [selectedSavedPlant, setSelectedSavedPlant] = useState("");
  const [taskAddedNotice, setTaskAddedNotice] = useState(false);

  // Wizard state
  const [wizardPart, setWizardPart] = useState("All Parts");
  const [selectedSymptoms, setSelectedSymptoms] = useState(() => (initialSymptom ? [initialSymptom] : []));
  const [wizardPlantType, setWizardPlantType] = useState("All");
  const [wizardDiagnosisCategory, setWizardDiagnosisCategory] = useState("All");
  const [wizardDiagnosisSort, setWizardDiagnosisSort] = useState("confidence");
  const [wizardViewMode, setWizardViewMode] = useState("grid");
  const [wizardSearch, setWizardSearch] = useState("");
  const [symptomCategoryTab, setSymptomCategoryTab] = useState("all");
  const [symptomFilterQuery, setSymptomFilterQuery] = useState("");

  // Library state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // User's saved plants from localStorage
  const [savedPlants, setSavedPlants] = useState([]);

  useEffect(() => {
    try {
      const plants = getSavedPlants();
      setSavedPlants(plants || []);
      if (plants && plants.length > 0) {
        setSelectedSavedPlant(plants[0].name);
      }
    } catch {
      setSavedPlants([]);
    }
  }, []);

  // Handle initial symptom prop from Dashboard
  useEffect(() => {
    if (initialSymptom) {
      setActiveTab("wizard");
      setSelectedSymptoms([initialSymptom]);
    }
  }, [initialSymptom]);

  /* =========================================
     IMAGE SCANNER SIMULATION
     ========================================= */

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      setSelectedCase(null);
      setScanResult(null);
      setTaskAddedNotice(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleCaseClick = (sample) => {
    setSelectedCase(sample);
    setImagePreview(sample.image);
    setScanResult(null);
    setTaskAddedNotice(false);
  };

  const runScan = () => {
    if (!imagePreview) return;

    setIsScanning(true);
    setScanResult(null);
    setScanStep(1);

    const timer1 = setTimeout(() => setScanStep(2), 700);
    const timer2 = setTimeout(() => setScanStep(3), 1500);
    const timer3 = setTimeout(() => {
      setIsScanning(false);
      setScanStep(0);

      // Determine result based on sample or fallback algorithm
      let matchedDisease;
      let confidenceScore = 94;

      if (selectedCase) {
        matchedDisease = DISEASES_DATABASE.find((d) => d.id === selectedCase.diseaseId);
        confidenceScore = selectedCase.confidence;
      } else {
        // Deterministic matching based on image string length
        const hash = imagePreview.length % (DISEASES_DATABASE.length - 1);
        matchedDisease = DISEASES_DATABASE[hash] || DISEASES_DATABASE[0];
        confidenceScore = 88 + (imagePreview.length % 11);
      }

      setScanResult({
        disease: matchedDisease,
        confidence: confidenceScore,
        analyzedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }, 2300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const addTreatmentToScheduler = () => {
    if (!scanResult) return;

    const disease = scanResult.disease;
    const plantLabel = selectedSavedPlant || "Garden Plant";

    const newTask = {
      id: Date.now(),
      title: `Treat ${plantLabel}: ${disease.commonName}`,
      description: disease.organicTreatment,
      time: "8:00 AM",
      completed: false,
      type: "prune",
    };

    const currentTasks = getSavedTasks();
    const updated = [newTask, ...currentTasks];
    saveTasks(updated);

    setTaskAddedNotice(true);
    setTimeout(() => setTaskAddedNotice(false), 4500);
  };

  /* =========================================
     SYMPTOM WIZARD LOGIC
     ========================================= */

  const toggleSymptom = (sym) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const clearWizard = () => {
    setSelectedSymptoms([]);
    setWizardPart("All Parts");
    setWizardPlantType("All");
    setWizardDiagnosisCategory("All");
    setWizardSearch("");
    setSymptomFilterQuery("");
  };

  const applyPreset = (preset) => {
    setSelectedSymptoms(preset.symptoms);
    if (preset.part) {
      setWizardPart(preset.part);
    }
  };

  const visibleSymptoms = SYMPTOM_OPTIONS.filter((sym) => {
    if (symptomCategoryTab !== "all" && symptomCategoryTab !== "presets") {
      const allowed = SYMPTOM_CATEGORIES[symptomCategoryTab] || [];
      if (!allowed.includes(sym)) return false;
    }
    if (symptomFilterQuery.trim() !== "") {
      return sym.toLowerCase().includes(symptomFilterQuery.toLowerCase());
    }
    return true;
  });

  const wizardMatches = DISEASES_DATABASE.filter((disease) => {
    if (disease.id === "healthy-plant") return false;

    // Part filter
    if (wizardPart !== "All Parts" && !disease.plantParts.includes(wizardPart)) {
      return false;
    }

    // Plant filter
    if (wizardPlantType !== "All" && !disease.plants.includes(wizardPlantType) && !disease.plants.includes("General")) {
      return false;
    }

    // Symptom filter
    if (selectedSymptoms.length > 0) {
      const hasAnySymptom = selectedSymptoms.some((s) =>
        disease.symptoms.some((ds) => ds.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ds.toLowerCase()))
      );
      if (!hasAnySymptom) return false;
    }

    return true;
  }).map((disease) => {
    let matchScore = 50;
    selectedSymptoms.forEach((s) => {
      const match = disease.symptoms.find((ds) => ds.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ds.toLowerCase()));
      if (match) matchScore += 25;
    });
    return {
      ...disease,
      matchConfidence: Math.min(matchScore, 98),
    };
  }).sort((a, b) => b.matchConfidence - a.matchConfidence);

  // Category counts for the diagnosis sub-navbar
  const wizardCategoryCounts = {
    All: wizardMatches.length,
    Fungal: wizardMatches.filter((d) => d.category === "Fungal").length,
    Bacterial: wizardMatches.filter((d) => d.category === "Bacterial").length,
    Pest: wizardMatches.filter((d) => d.category === "Pest").length,
    Nutritional: wizardMatches.filter((d) => d.category === "Nutritional").length,
  };

  // Filtered and sorted matches based on the diagnosis navbar controls
  const filteredWizardMatches = wizardMatches.filter((disease) => {
    if (wizardDiagnosisCategory !== "All" && disease.category !== wizardDiagnosisCategory) {
      return false;
    }
    if (wizardSearch.trim() !== "") {
      const q = wizardSearch.toLowerCase();
      const match =
        disease.name.toLowerCase().includes(q) ||
        disease.commonName.toLowerCase().includes(q) ||
        disease.symptoms.some((s) => s.toLowerCase().includes(q)) ||
        disease.causes.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    if (wizardDiagnosisSort === "confidence") {
      return b.matchConfidence - a.matchConfidence;
    }
    if (wizardDiagnosisSort === "severity") {
      const rank = { "Severe": 4, "Moderate to Severe": 3, "Moderate": 2, "Mild": 1 };
      return (rank[b.severity] || 0) - (rank[a.severity] || 0);
    }
    if (wizardDiagnosisSort === "name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  /* =========================================
     LIBRARY FILTER LOGIC
     ========================================= */

  const filteredLibrary = DISEASES_DATABASE.filter((disease) => {
    const matchesCategory = selectedCategory === "All" || disease.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      disease.plants.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="disease-detection-page">
      {/* Top Header */}
      <PageHeaderBanner
        eyebrow="AI PLANT HEALTH & SYMPTOM DIAGNOSIS"
        title="Disease Detection"
        titleAccent="🔍"
        subtitle="Scan affected leaves with AI, diagnose visible symptoms with reference images, and access highlighted treatment protocols to cure plant ailments."
        badgeIcon="🔬"
        badgeTitle="AI Scanner Active"
        badgeSubtitle="7 Pathogen Detectors • Instant Cures"
        extraRight={
          <div className="detection-header-actions">
            {onPageChange && (
              <button
                type="button"
                className="secondary-btn"
                onClick={() => onPageChange("dashboard")}
              >
                ← Dashboard
              </button>
            )}
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setActiveTab("scanner");
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
            >
              📷 Scan Leaf
            </button>
          </div>
        }
      />

      {/* Feature Navigation Tabs */}
      <nav className="detection-nav-tabs" aria-label="Disease detection sections">
        <button
          type="button"
          className={`tab-btn ${activeTab === "scanner" ? "active" : ""}`}
          onClick={() => setActiveTab("scanner")}
        >
          <span>📷</span> AI Leaf Scanner
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "wizard" ? "active" : ""}`}
          onClick={() => setActiveTab("wizard")}
        >
          <span>📋</span> Symptom Diagnostic Wizard
          {selectedSymptoms.length > 0 && <span className="tab-count">{selectedSymptoms.length}</span>}
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "library" ? "active" : ""}`}
          onClick={() => setActiveTab("library")}
        >
          <span>📚</span> Disease & Pest Library
          <span className="tab-count">{DISEASES_DATABASE.length}</span>
        </button>
      </nav>

      {/* =========================================================================
          TAB 1: AI LEAF SCANNER
          ========================================================================= */}
      {activeTab === "scanner" && (
        <section className="scanner-section">
          <div className="scanner-grid">
            {/* Upload & Image Preview Box */}
            <div className="scanner-card upload-card">
              <div className="card-top-bar">
                <h3>1. Select or Upload Leaf Photo</h3>
                {imagePreview && (
                  <button
                    type="button"
                    className="clear-link-btn"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedCase(null);
                      setScanResult(null);
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>

              {!imagePreview ? (
                <label className="dropzone-area">
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input-hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="dropzone-content">
                    <span className="dropzone-icon">🍃</span>
                    <strong>Upload a Leaf Image</strong>
                    <p>Drag and drop or browse from your phone / computer</p>
                    <span className="dropzone-btn">Choose File</span>
                    <small>Supports JPG, PNG, WEBP, SVG</small>
                  </div>
                </label>
              ) : (
                <div className="preview-container">
                  <div className="image-viewport">
                    <img src={imagePreview} alt="Leaf preview" className="leaf-preview-img" />

                    {/* Scanning animation laser line */}
                    {isScanning && (
                      <div className="scan-overlay">
                        <div className="scan-laser-line"></div>
                        <div className="scan-grid-effect"></div>
                        <div className="scan-status-badge">
                          {scanStep === 1 && "🔬 Detecting leaf geometry & pigmentation..."}
                          {scanStep === 2 && "🔍 Analyzing lesion texture & fungal patterns..."}
                          {scanStep === 3 && "⚡ Matching against 50+ plant disease models..."}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="scanner-actions">
                    <button
                      type="button"
                      className="primary-btn scan-run-btn"
                      disabled={isScanning}
                      onClick={runScan}
                    >
                      {isScanning ? "Analyzing Leaf..." : "✨ Run AI Diagnosis"}
                    </button>

                    <label className="change-photo-btn">
                      <input
                        type="file"
                        accept="image/*"
                        className="file-input-hidden"
                        onChange={handleFileUpload}
                      />
                      Upload Different Photo
                    </label>
                  </div>
                </div>
              )}

              {/* Sample test cases with visual leaf thumbnails */}
              <div className="sample-cases-bar">
                <p className="sample-title">Or test with ready disease specimens:</p>
                <div className="sample-chips">
                  {SAMPLE_TEST_CASES.map((sample) => (
                    <button
                      key={sample.diseaseId}
                      type="button"
                      className={`sample-chip ${selectedCase?.diseaseId === sample.diseaseId ? "active" : ""}`}
                      onClick={() => handleSampleCaseClick(sample)}
                    >
                      <img src={sample.image} alt={sample.title} className="sample-chip-img" />
                      <div className="sample-chip-text">
                        <strong>{sample.title}</strong>
                        <small>{sample.icon} {sample.plant}</small>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Diagnosis Result Box */}
            <div className="scanner-card result-card">
              <h3>2. Diagnostic Results &amp; Treatment</h3>

              {!scanResult && !isScanning && (
                <div className="empty-result-placeholder">
                  <span className="placeholder-icon">🌱</span>
                  <h4>Ready for Diagnosis</h4>
                  <p>
                    Upload a clear photo of your plant's leaf showing spots, yellowing, or discoloration, or click any sample leaf on the left.
                  </p>
                  <div className="tip-box">
                    <strong>💡 Photo Tips for High Accuracy:</strong>
                    <ul>
                      <li>Ensure bright, natural daylight without harsh flash.</li>
                      <li>Hold camera 10–15 cm away to focus clearly on the spots.</li>
                      <li>Capture both the upper surface and underside of the leaf.</li>
                    </ul>
                  </div>
                </div>
              )}

              {isScanning && (
                <div className="scanning-loading-state">
                  <div className="spinner"></div>
                  <h4>Deep Learning AI Analysis in Progress</h4>
                  <p>Checking leaf pigmentation, necrotic tissue, and fungal spores...</p>
                </div>
              )}

              {scanResult && !isScanning && (
                <div className="diagnostic-report">
                  {/* Top Status Header */}
                  <div className="report-header">
                    <div>
                      <span
                        className="category-pill"
                        style={{ backgroundColor: scanResult.disease.badgeColor + "20", color: scanResult.disease.badgeColor }}
                      >
                        {scanResult.disease.category}
                      </span>
                      <h2>{scanResult.disease.name}</h2>
                      <p className="common-subtitle">Also known as: <strong>{scanResult.disease.commonName}</strong></p>
                    </div>

                    <div className="confidence-badge">
                      <strong>{scanResult.confidence}%</strong>
                      <small>AI Match</small>
                    </div>
                  </div>

                  {/* Disease Image Reference Banner */}
                  <div className="report-visual-banner">
                    <div className="report-visual-img-wrap">
                      <img
                        src={scanResult.disease.image}
                        alt={scanResult.disease.name}
                        className="report-disease-image"
                      />
                      <span className="visual-badge">📸 Pathogen Visual Specimen</span>
                    </div>
                    <div className="report-visual-info">
                      <h4>Visual Identification Guide:</h4>
                      <div className="visual-symptoms-chips">
                        {scanResult.disease.symptoms.map((s, idx) => (
                          <span key={idx} className="visual-symptom-tag">
                            ⚠️ {s}
                          </span>
                        ))}
                      </div>
                      <small className="visual-caption">
                        Confirmed diagnostic reference for <em>{scanResult.disease.commonName}</em> on {scanResult.disease.plants.join(", ")}.
                      </small>
                    </div>
                  </div>

                  {/* Quick Metadata Grid */}
                  <div className="meta-stats-grid">
                    <div className="meta-stat">
                      <span>Severity</span>
                      <strong
                        className={`severity-tag ${
                          scanResult.disease.severity.toLowerCase().includes("severe")
                            ? "severe"
                            : scanResult.disease.severity.toLowerCase().includes("moderate")
                            ? "moderate"
                            : "mild"
                        }`}
                      >
                        {scanResult.disease.severity}
                      </strong>
                    </div>

                    <div className="meta-stat">
                      <span>Common Host Plants</span>
                      <strong>{scanResult.disease.plants.join(", ")}</strong>
                    </div>

                    <div className="meta-stat">
                      <span>Identified At</span>
                      <strong>{scanResult.analyzedAt}</strong>
                    </div>
                  </div>

                  {/* Causes */}
                  <div className="report-section">
                    <h4>🔍 Cause of Infection</h4>
                    <p>{scanResult.disease.causes}</p>
                  </div>

                  {/* =========================================================
                      HIGHLIGHTED TREATMENT PROTOCOL SECTION
                      ========================================================= */}
                  <div className="treatment-protocol-card">
                    <div className="treatment-protocol-header">
                      <div>
                        <span className="treatment-protocol-tag">💊 RX CARE PLAN</span>
                        <h3>Highlighted Treatment Protocol</h3>
                        <p>Follow these steps immediately to cure the pathogen and revitalize plant vigor.</p>
                      </div>
                      <span className="treatment-priority-badge">
                        {scanResult.disease.severity.toLowerCase().includes("severe")
                          ? "⚡ Urgent Treatment Required"
                          : "🌿 Curable With Prompt Care"}
                      </span>
                    </div>

                    {/* Step 1: Emergency First Aid */}
                    <div className="treatment-step-card step-emergency">
                      <div className="step-badge">
                        <span className="step-num">Step 1</span>
                        <span className="step-type">🚨 Emergency First Aid &amp; Containment</span>
                      </div>
                      <div className="step-body">
                        <p>{scanResult.disease.immediateAction}</p>
                      </div>
                    </div>

                    {/* Step 2: Primary Organic & Natural Remedy (HIGHLIGHTED) */}
                    <div className="treatment-step-card step-organic highlighted-remedy">
                      <div className="step-badge">
                        <span className="step-num">Step 2</span>
                        <span className="step-type">🌿 Primary Organic Treatment (Non-Toxic &amp; Safe)</span>
                      </div>
                      <div className="step-body">
                        <p className="remedy-highlight-text">{scanResult.disease.organicTreatment}</p>
                        <div className="remedy-highlight-pill">
                          <span>✓ 100% Safe for balcony herbs, vegetables, indoor pets &amp; pollinators</span>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Chemical Option */}
                    <div className="treatment-step-card step-chemical">
                      <div className="step-badge">
                        <span className="step-num">Step 3</span>
                        <span className="step-type">🧪 Horticultural / Fungicide Alternative</span>
                      </div>
                      <div className="step-body">
                        <p>{scanResult.disease.chemicalTreatment}</p>
                      </div>
                    </div>

                    {/* Step 4: Prevention */}
                    <div className="treatment-step-card step-prevention">
                      <div className="step-badge">
                        <span className="step-num">Step 4</span>
                        <span className="step-type">🛡️ Prevention &amp; Relapse Avoidance</span>
                      </div>
                      <div className="step-body">
                        <p>{scanResult.disease.prevention}</p>
                      </div>
                    </div>
                  </div>

                  {/* Connect to My Garden & Scheduler Actions */}
                  <div className="integration-action-card">
                    <h4>Add Treatment to Care Scheduler</h4>
                    <p>Schedule this treatment protocol in your checklist so you never miss application days:</p>

                    <div className="assign-row">
                      {savedPlants.length > 0 && (
                        <div className="plant-select-wrap">
                          <label htmlFor="select-saved-plant">Affected Plant:</label>
                          <select
                            id="select-saved-plant"
                            value={selectedSavedPlant}
                            onChange={(e) => setSelectedSavedPlant(e.target.value)}
                          >
                            {savedPlants.map((p) => (
                              <option key={p.id} value={p.name}>
                                {p.emoji} {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <button
                        type="button"
                        className="primary-btn add-task-btn"
                        onClick={addTreatmentToScheduler}
                      >
                        + Add Remedy to Tasks
                      </button>
                    </div>

                    {taskAddedNotice && (
                      <div className="success-toast">
                        ✓ Treatment protocol added to your <strong>Care Scheduler</strong>! Check your Daily Checklist and Dashboard to track treatment.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 2: SYMPTOM DIAGNOSTIC WIZARD
          ========================================================================= */}
      {activeTab === "wizard" && (
        <section className="wizard-section">
          <div className="wizard-layout">
            {/* Filter Sidebar */}
            {/* Filter Sidebar with Dedicated Symptom Navbar */}
            <aside className="wizard-sidebar" aria-label="Symptom Selection Panel">
              {/* Symptom Navbar */}
              <nav className="symptom-navbar" aria-label="Symptom Selector Controls">
                <div className="symptom-nav-head">
                  <div className="symptom-nav-title-group">
                    <span className="symptom-nav-eyebrow">CRITERIA</span>
                    <div className="symptom-nav-title-row">
                      <h4>Select Symptoms</h4>
                      <span className="symptom-counter-badge">
                        {selectedSymptoms.length} Selected
                      </span>
                    </div>
                  </div>

                  {selectedSymptoms.length > 0 && (
                    <button
                      type="button"
                      className="symptom-reset-btn"
                      onClick={clearWizard}
                      title="Clear all selected symptoms"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Symptom Search Filter Bar */}
                <div className="symptom-search-box">
                  <span className="symptom-search-icon">🔍</span>
                  <input
                    type="search"
                    placeholder="Search symptoms (e.g. spots, wilting)..."
                    value={symptomFilterQuery}
                    onChange={(e) => setSymptomFilterQuery(e.target.value)}
                    aria-label="Filter symptoms list"
                  />
                  {symptomFilterQuery && (
                    <button
                      type="button"
                      className="symptom-search-clear"
                      onClick={() => setSymptomFilterQuery("")}
                      aria-label="Clear symptom search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Symptom Category Navbar Tabs */}
                <div className="symptom-category-navbar" role="tablist">
                  {[
                    { key: "all", label: "All", icon: "🌱" },
                    { key: "leaf", label: "Leaves", icon: "🍃" },
                    { key: "pest", label: "Pests", icon: "🐛" },
                    { key: "root", label: "Roots", icon: "🪴" },
                    { key: "presets", label: "Presets", icon: "⚡" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={symptomCategoryTab === tab.key}
                      className={`symptom-nav-tab ${symptomCategoryTab === tab.key ? "active" : ""}`}
                      onClick={() => setSymptomCategoryTab(tab.key)}
                    >
                      <span className="symptom-tab-icon">{tab.icon}</span>
                      <span className="symptom-tab-label">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </nav>

              {/* Presets View */}
              {symptomCategoryTab === "presets" ? (
                <div className="symptom-presets-container">
                  <p className="presets-hint">Click a preset to quickly apply symptoms:</p>
                  <div className="presets-list">
                    {SYMPTOM_PRESETS.map((preset) => {
                      const isApplied = preset.symptoms.every((s) => selectedSymptoms.includes(s));
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          className={`preset-card ${isApplied ? "applied" : ""}`}
                          onClick={() => applyPreset(preset)}
                        >
                          <div className="preset-card-head">
                            <span className="preset-icon">{preset.icon}</span>
                            <div className="preset-info">
                              <strong>{preset.name}</strong>
                              <small>{preset.target} • {preset.part}</small>
                            </div>
                            <span className="preset-badge">{isApplied ? "Active ✓" : "Apply"}</span>
                          </div>
                          <div className="preset-symptoms">
                            {preset.symptoms.map((s, idx) => (
                              <span key={idx} className="preset-tag">
                                {s}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  {/* Plant Part Selector */}
                  <div className="wizard-filter-group">
                    <label className="filter-label">Affected Plant Part:</label>
                    <div className="chips-row">
                      {PLANT_PARTS.map((part) => (
                        <button
                          key={part}
                          type="button"
                          className={`chip-btn ${wizardPart === part ? "active" : ""}`}
                          onClick={() => setWizardPart(part)}
                        >
                          {part}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plant Type Selector */}
                  <div className="wizard-filter-group">
                    <label className="filter-label">Plant Category:</label>
                    <select
                      value={wizardPlantType}
                      onChange={(e) => setWizardPlantType(e.target.value)}
                      className="wizard-select"
                    >
                      <option value="All">All Plants / General</option>
                      <option value="Tomato">Tomato</option>
                      <option value="Rose">Rose</option>
                      <option value="Mint">Mint</option>
                      <option value="Tulsi">Tulsi</option>
                      <option value="Snake Plant">Snake Plant</option>
                      <option value="Indoor Plant">Indoor Foliage</option>
                    </select>
                  </div>

                  {/* Visible Symptoms Multi-Select */}
                  <div className="wizard-filter-group">
                    <div className="filter-label-row">
                      <label className="filter-label">What do you observe? ({visibleSymptoms.length}):</label>
                    </div>

                    {visibleSymptoms.length === 0 ? (
                      <div className="empty-symptoms-state">
                        <small>No symptoms match "{symptomFilterQuery}".</small>
                        <button
                          type="button"
                          className="clear-query-link"
                          onClick={() => {
                            setSymptomFilterQuery("");
                            setSymptomCategoryTab("all");
                          }}
                        >
                          Show all symptoms
                        </button>
                      </div>
                    ) : (
                      <div className="symptoms-list">
                        {visibleSymptoms.map((sym) => {
                          const isChecked = selectedSymptoms.includes(sym);
                          return (
                            <button
                              key={sym}
                              type="button"
                              className={`symptom-toggle ${isChecked ? "selected" : ""}`}
                              onClick={() => toggleSymptom(sym)}
                            >
                              <span className="checkbox-dot">{isChecked ? "✓" : "+"}</span>
                              <span>{sym}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </aside>

            {/* Matches Display with Dedicated Diagnosis Navbar */}
            <div className="wizard-results">
              {/* Diagnosis Navbar */}
              <nav className="diagnosis-navbar" aria-label="Possible Diagnoses Controls">
                <div className="diag-nav-top">
                  <div className="diag-nav-title-block">
                    <span className="diag-nav-eyebrow">STEP 2: RESULTS &amp; TREATMENTS</span>
                    <div className="diag-nav-title-row">
                      <h3>Possible Symptoms &amp; Diagnoses</h3>
                      <span className="diag-count-pill" title="Total matches based on current filters">
                        {filteredWizardMatches.length} {filteredWizardMatches.length === 1 ? "Match" : "Matches"}
                      </span>
                    </div>
                  </div>

                  <div className="diag-nav-tools">
                    {/* Filter search within diagnoses */}
                    <div className="diag-search-box">
                      <span className="diag-search-icon">🔍</span>
                      <input
                        type="search"
                        placeholder="Search diagnoses..."
                        value={wizardSearch}
                        onChange={(e) => setWizardSearch(e.target.value)}
                        aria-label="Filter within possible diagnoses"
                      />
                      {wizardSearch && (
                        <button
                          type="button"
                          className="diag-search-clear"
                          onClick={() => setWizardSearch("")}
                          aria-label="Clear filter"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Sort Selector */}
                    <div className="diag-sort-box">
                      <label htmlFor="diag-sort-select">Sort:</label>
                      <select
                        id="diag-sort-select"
                        value={wizardDiagnosisSort}
                        onChange={(e) => setWizardDiagnosisSort(e.target.value)}
                      >
                        <option value="confidence">Match Score</option>
                        <option value="severity">Severity</option>
                        <option value="name">Name (A–Z)</option>
                      </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="diag-view-toggle">
                      <button
                        type="button"
                        className={`diag-view-btn ${wizardViewMode === "grid" ? "active" : ""}`}
                        onClick={() => setWizardViewMode("grid")}
                        title="Grid View (Photo & Cards)"
                      >
                        ⊞ Grid
                      </button>
                      <button
                        type="button"
                        className={`diag-view-btn ${wizardViewMode === "list" ? "active" : ""}`}
                        onClick={() => setWizardViewMode("list")}
                        title="Detailed List View (Expanded Treatment Focus)"
                      >
                        ☰ List
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category Filter Tabs Navbar */}
                <div className="diag-category-tabs">
                  {[
                    { key: "All", label: "All Diagnoses", icon: "🌿" },
                    { key: "Fungal", label: "Fungal Diseases", icon: "🍄" },
                    { key: "Bacterial", label: "Bacterial Spots", icon: "🦠" },
                    { key: "Pest", label: "Pests & Mites", icon: "🐛" },
                    { key: "Nutritional", label: "Nutrient Deficiencies", icon: "🧪" },
                  ].map((tab) => {
                    const count = wizardCategoryCounts[tab.key] || 0;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        className={`diag-tab-btn ${wizardDiagnosisCategory === tab.key ? "active" : ""}`}
                        onClick={() => setWizardDiagnosisCategory(tab.key)}
                      >
                        <span className="diag-tab-icon">{tab.icon}</span>
                        <span className="diag-tab-text">{tab.label}</span>
                        <span className="diag-tab-count">{count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Selected Symptoms Bar */}
                {selectedSymptoms.length > 0 && (
                  <div className="diag-active-bar">
                    <span className="active-label">Active Symptoms:</span>
                    <div className="active-tags-list">
                      {selectedSymptoms.map((sym) => (
                        <button
                          key={sym}
                          type="button"
                          className="active-sym-tag"
                          onClick={() => toggleSymptom(sym)}
                          title={`Click to remove "${sym}"`}
                        >
                          <span className="sym-check">✓</span>
                          <span>{sym}</span>
                          <span className="sym-remove">✕</span>
                        </button>
                      ))}
                      <button type="button" className="diag-clear-all-btn" onClick={clearWizard}>
                        Clear All
                      </button>
                    </div>
                  </div>
                )}
              </nav>

              {/* Dedicated scrollable matches pane: only possible symptoms scroll */}
              <div className="matches-scroll-pane">
                {filteredWizardMatches.length === 0 ? (
                  <div className="no-matches-card">
                    <span>🌱</span>
                    <h4>No matching diseases found</h4>
                    <p>
                      {wizardSearch
                        ? `No diseases match "${wizardSearch}" under "${wizardDiagnosisCategory}". Try clearing your search.`
                        : "Try unchecking one or more symptoms on the left sidebar or switch category to 'All Diagnoses'."}
                    </p>
                    <button type="button" className="secondary-btn" onClick={clearWizard}>
                      Reset Symptoms &amp; Filters
                    </button>
                  </div>
                ) : (
                  <div className={wizardViewMode === "list" ? "matches-list" : "matches-grid"}>
                    {filteredWizardMatches.map((disease) => (
                      <article key={disease.id} className={`match-card ${wizardViewMode === "list" ? "list-item" : ""}`}>
                        {/* Visual leaf image for matched disease */}
                        <div className="match-card-visual">
                          <img src={disease.image} alt={disease.name} className="match-card-img" />
                          <span
                            className="category-pill match-pill-overlay"
                            style={{ backgroundColor: disease.badgeColor + "ee", color: "#ffffff" }}
                          >
                            {disease.category}
                          </span>
                          <span className="match-score-badge">
                            {disease.matchConfidence}% Match
                          </span>
                        </div>

                        <div className="match-card-content">
                          <div className="match-card-header">
                            <div>
                              <h4>{disease.name}</h4>
                              <small className="match-alias">{disease.commonName}</small>
                            </div>
                          </div>

                          <div className="symptoms-tags">
                            {disease.symptoms.map((s, idx) => (
                              <span
                                key={idx}
                                className={`tag ${selectedSymptoms.includes(s) ? "matched" : ""}`}
                              >
                                {selectedSymptoms.includes(s) && "✓ "}
                                {s}
                              </span>
                            ))}
                          </div>

                          {/* HIGHLIGHTED TREATMENT BOX */}
                          <div className="match-treatment-box">
                            <div className="treatment-tag-header">
                              <span className="treatment-tag-pill">🌿 HIGHLIGHTED TREATMENT</span>
                            </div>
                            <div className="treatment-row first-aid">
                              <strong>First Aid:</strong>
                              <p>{disease.immediateAction}</p>
                            </div>
                            <div className="treatment-row organic-highlight">
                              <strong>Organic Cure:</strong>
                              <p>{disease.organicTreatment}</p>
                            </div>
                          </div>

                          <div className="card-actions">
                            <button
                              type="button"
                              className="outline-sm-btn"
                              onClick={() => {
                                setSelectedCase({
                                  diseaseId: disease.id,
                                  confidence: disease.matchConfidence,
                                  image: disease.image,
                                  title: disease.name,
                                });
                                setImagePreview(disease.image);
                                setActiveTab("scanner");
                              }}
                            >
                              View in Scanner &amp; Add Task →
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 3: DISEASE & PEST LIBRARY
          ========================================================================= */}
      {activeTab === "library" && (
        <section className="library-section">
          {/* Search & Filter Bar */}
          <div className="library-controls">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search disease name, symptom, or plant (e.g., Root Rot, Tomato, Mildew)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-search" onClick={() => setSearchQuery("")}>
                  ✕
                </button>
              )}
            </div>

            <div className="category-pills">
              {["All", "Fungal", "Bacterial", "Pest", "Nutritional", "Healthy"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`cat-pill ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid with disease leaf visual banners and highlighted treatments */}
          <div className="library-grid">
            {filteredLibrary.map((disease) => (
              <article key={disease.id} className="library-card">
                {/* Visual leaf image for this disease */}
                <div className="library-card-visual">
                  <img src={disease.image} alt={disease.name} className="library-card-img" />
                  <span
                    className="category-pill lib-pill-overlay"
                    style={{ backgroundColor: disease.badgeColor + "ee", color: "#ffffff" }}
                  >
                    {disease.category}
                  </span>
                  <span
                    className={`severity-tag lib-severity-overlay ${
                      disease.severity.toLowerCase().includes("severe")
                        ? "severe"
                        : disease.severity.toLowerCase().includes("moderate")
                        ? "moderate"
                        : "mild"
                    }`}
                  >
                    {disease.severity}
                  </span>
                </div>

                <div className="lib-card-body">
                  <h3>{disease.name}</h3>
                  <p className="lib-common-name">{disease.commonName}</p>

                  <div className="lib-section">
                    <span className="lib-label">Frequent Targets:</span>
                    <p>{disease.plants.join(", ")}</p>
                  </div>

                  <div className="lib-section">
                    <span className="lib-label">Key Symptoms:</span>
                    <ul className="lib-bullet-list">
                      {disease.symptoms.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* PROMINENTLY HIGHLIGHTED ORGANIC TREATMENT */}
                  <div className="lib-treatment-highlight">
                    <div className="remedy-badge-row">
                      <span className="remedy-badge-pill">🌿 Primary Treatment Cure</span>
                    </div>
                    <p className="remedy-highlight-text">{disease.organicTreatment}</p>
                  </div>

                  <div className="lib-section prevention-block">
                    <span className="lib-label">🛡️ Prevention Tip:</span>
                    <p>{disease.prevention}</p>
                  </div>

                  <button
                    type="button"
                    className="outline-sm-btn full-w"
                    onClick={() => {
                      setSelectedCase({
                        diseaseId: disease.id,
                        confidence: 95,
                        image: disease.image,
                        title: disease.name,
                      });
                      setImagePreview(disease.image);
                      setActiveTab("scanner");
                    }}
                  >
                    Inspect in Scanner →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Prevention Guidelines Banner */}
      <section className="prevention-tips-banner">
        <div className="banner-icon">🛡️</div>
        <div className="banner-content">
          <h3>The Golden Rules of Urban Plant Health</h3>
          <div className="banner-tips-grid">
            <div>
              <strong>1. Water the Soil, Not the Foliage</strong>
              <p>Wet leaves invite fungal spores like powdery mildew and black spot to germinate.</p>
            </div>
            <div>
              <strong>2. Ensure Maximum Airflow</strong>
              <p>Keep at least 15 cm of space between balcony pots to allow wind to dry moisture.</p>
            </div>
            <div>
              <strong>3. Sanitize Pruning Shears</strong>
              <p>Wipe blades with rubbing alcohol or dilute soap before moving between different plants.</p>
            </div>
            <div>
              <strong>4. Morning Inspection Routine</strong>
              <p>Check leaf undersides once weekly. Catching pests early stops whole-garden infestations.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default DiseaseDetection;
