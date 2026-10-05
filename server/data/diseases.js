export const DISEASE_RULES = [
  {
    id: "early-blight",
    name: "Early Blight",
    keywords: [
      "brown or black spots", "brown spots", "black spots", "target rings",
      "concentric target rings", "yellowing leaves", "lower leaves dying", "blight"
    ],
    advice: "Remove badly affected foliage, improve airflow, and water at soil level."
  },
  {
    id: "powdery-mildew",
    name: "Powdery Mildew",
    keywords: [
      "white powdery coating", "white powder", "white coating", "powdery",
      "curling or distorted leaves", "curling leaves", "leaf curling", "distorted leaves", "mildew"
    ],
    advice: "Improve airflow, move foliage into better light, and avoid wetting leaves overnight."
  },
  {
    id: "spider-mites",
    name: "Spider Mites",
    keywords: [
      "fine webbing on undersides", "fine webbing", "tiny webs", "webbing",
      "yellow stippling or pinprick dots", "stippling", "pinprick", "speckled leaves",
      "bronzed or dry leaves", "bronze leaves", "mites"
    ],
    advice: "Isolate the plant, wash leaf undersides, and monitor new growth closely."
  },
  {
    id: "iron-chlorosis",
    name: "Iron Chlorosis",
    keywords: [
      "yellowing leaves with dark green veins", "yellow leaves", "green veins",
      "pale new foliage", "pale new leaves", "chlorosis", "iron deficiency"
    ],
    advice: "Check root-zone pH and drainage before correcting iron availability."
  },
  {
    id: "bacterial-leaf-spot",
    name: "Bacterial Leaf Spot",
    keywords: [
      "water-soaked dark lesions", "water-soaked", "dark lesions", "lesions",
      "brown spots with yellow halos", "dark leaf spots", "halo", "leaf spot", "bacterial"
    ],
    advice: "Remove affected leaves, keep foliage dry, and sanitize tools."
  },
  {
    id: "aphids",
    name: "Aphids",
    keywords: [
      "clusters of tiny green/black bugs", "sticky honeydew on leaves", "sticky leaves",
      "curling new shoot growth", "curling tips", "tiny green insects", "aphids", "honeydew", "bugs"
    ],
    advice: "Inspect new growth and leaf undersides, then use a gentle wash and repeat monitoring."
  },
  {
    id: "root-rot",
    name: "Root Rot",
    keywords: [
      "wilting despite wet soil", "dark soft stems at soil line", "yellowing, mushy leaves",
      "mushy roots", "foul smell", "root rot", "waterlogged", "soft stems", "wilting"
    ],
    advice: "Stop watering, improve drainage, and remove damaged roots if repotting is needed."
  },
  {
    id: "healthy-plant",
    name: "Healthy Plant",
    keywords: [
      "healthy", "no symptoms", "green leaves", "vibrant green foliage", "normal growth",
      "firm erect stems", "active new bud growth"
    ],
    advice: "Continue regular light, watering, drainage, and pest checks."
  },
];

export function classifySymptoms(symptoms = []) {
  const text = symptoms.join(" ").toLowerCase();
  let best = DISEASE_RULES[DISEASE_RULES.length - 1];
  let bestScore = 0;

  for (const disease of DISEASE_RULES) {
    const score = disease.keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      best = disease;
      bestScore = score;
    }
  }

  return {
    diseaseId: best.id,
    diseaseName: best.name,
    // Rule matching ranks possible matches; it does not produce a calibrated
    // probability. Keep confidence empty unless a real AI provider supplies it.
    confidence: null,
    advice: best.advice,
  };
}
