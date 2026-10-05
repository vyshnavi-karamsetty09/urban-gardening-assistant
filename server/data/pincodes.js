export const PINCODE_PROFILES = [
  {
    prefix: "500",
    city: "Hyderabad",
    state: "Telangana",
    climate: "Tropical",
    sunlight: "Full Sun",
    temperature: "20°C - 35°C",
    humidity: "Medium",
    rainfall: "Moderate",
  },
  {
    prefix: "560",
    city: "Bengaluru",
    state: "Karnataka",
    climate: "Subtropical",
    sunlight: "High Light",
    temperature: "18°C - 30°C",
    humidity: "Medium",
    rainfall: "Moderate",
  },
  {
    prefix: "110",
    city: "Delhi",
    state: "Delhi",
    climate: "Subtropical",
    sunlight: "Full Sun",
    temperature: "12°C - 38°C",
    humidity: "Low",
    rainfall: "Low / Scanty",
  },
  {
    prefix: "400",
    city: "Mumbai",
    state: "Maharashtra",
    climate: "Tropical",
    sunlight: "High Light",
    temperature: "22°C - 34°C",
    humidity: "High",
    rainfall: "High / Abundant",
  },
  {
    prefix: "411",
    city: "Pune",
    state: "Maharashtra",
    climate: "Subtropical",
    sunlight: "High Light",
    temperature: "16°C - 33°C",
    humidity: "Medium",
    rainfall: "Moderate",
  },
  {
    prefix: "600",
    city: "Chennai",
    state: "Tamil Nadu",
    climate: "Tropical",
    sunlight: "Full Sun",
    temperature: "23°C - 36°C",
    humidity: "High",
    rainfall: "High / Abundant",
  },
  {
    prefix: "700",
    city: "Kolkata",
    state: "West Bengal",
    climate: "Tropical",
    sunlight: "High Light",
    temperature: "20°C - 35°C",
    humidity: "High",
    rainfall: "High / Abundant",
  },
  {
    prefix: "380",
    city: "Ahmedabad",
    state: "Gujarat",
    climate: "Arid / Dry",
    sunlight: "Full Sun",
    temperature: "15°C - 40°C",
    humidity: "Low",
    rainfall: "Low / Scanty",
  },
  {
    prefix: "302",
    city: "Jaipur",
    state: "Rajasthan",
    climate: "Arid / Dry",
    sunlight: "Full Sun",
    temperature: "10°C - 42°C",
    humidity: "Low",
    rainfall: "Low / Scanty",
  },
  {
    prefix: "682",
    city: "Kochi",
    state: "Kerala",
    climate: "Tropical",
    sunlight: "High Light",
    temperature: "23°C - 33°C",
    humidity: "High",
    rainfall: "High / Abundant",
  },
  {
    prefix: "751",
    city: "Bhubaneswar",
    state: "Odisha",
    climate: "Tropical",
    sunlight: "Full Sun",
    temperature: "20°C - 35°C",
    humidity: "High",
    rainfall: "High / Abundant",
  },
  {
    prefix: "781",
    city: "Guwahati",
    state: "Assam",
    climate: "Tropical",
    sunlight: "High Light",
    temperature: "18°C - 33°C",
    humidity: "High",
    rainfall: "High / Abundant",
  },
];

export function analyzePincode(pincode) {
  const clean = String(pincode || "").replace(/\D/g, "");

  const profile = PINCODE_PROFILES.find((item) =>
    clean.startsWith(item.prefix)
  );

  // Exact curated pincode match
  if (profile) {
    return {
      ...profile,
      matched: true,
      label: `${profile.city}, ${profile.state}`,
    };
  }

  const firstDigit = clean[0];

  const fallbackByZone = {
    "1": {
      climate: "Subtropical",
      sunlight: "High Light",
      temperature: "12°C - 34°C",
      humidity: "Medium",
      rainfall: "Low / Scanty",
    },

    "2": {
      climate: "Subtropical",
      sunlight: "High Light",
      temperature: "15°C - 35°C",
      humidity: "Medium",
      rainfall: "Moderate",
    },

    "3": {
      climate: "Arid / Dry",
      sunlight: "Full Sun",
      temperature: "12°C - 40°C",
      humidity: "Low",
      rainfall: "Low / Scanty",
    },

    "4": {
      climate: "Subtropical",
      sunlight: "High Light",
      temperature: "16°C - 35°C",
      humidity: "Medium",
      rainfall: "Moderate",
    },

    "5": {
      climate: "Tropical",
      sunlight: "High Light",
      temperature: "20°C - 35°C",
      humidity: "Medium",
      rainfall: "Moderate",
    },

    "6": {
      climate: "Tropical",
      sunlight: "High Light",
      temperature: "22°C - 35°C",
      humidity: "High",
      rainfall: "High / Abundant",
    },

    "7": {
      climate: "Tropical",
      sunlight: "High Light",
      temperature: "18°C - 35°C",
      humidity: "High",
      rainfall: "High / Abundant",
    },

    "8": {
      climate: "Subtropical",
      sunlight: "High Light",
      temperature: "12°C - 35°C",
      humidity: "Medium",
      rainfall: "Moderate",
    },

    "9": {
      climate: "Temperate",
      sunlight: "High Light",
      temperature: "10°C - 32°C",
      humidity: "Medium",
      rainfall: "Moderate",
    },
  };

  const fallback =
    fallbackByZone[firstDigit] || fallbackByZone["5"];

  // Guarantee these two fields even if a future fallback
  // profile accidentally omits them.
  return {
    ...fallback,
    sunlight: fallback.sunlight || "High Light",
    rainfall: fallback.rainfall || "Moderate",
    city: "Indian region estimate",
    state: "",
    matched: false,
    label: "Estimated from pincode zone",
  };
}