from flask import Flask, request, jsonify, send_from_directory
import json
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

PLANT_FILE = os.path.join(
    BASE_DIR,
    "backend",
    "data",
    "plants.json"
)


# ==========================================
# Load plant database
# ==========================================

with open(PLANT_FILE, "r", encoding="utf-8") as file:
    plants = json.load(file)


# ==========================================
# Serve recommendation page
# ==========================================

@app.route("/")
def recommendation_page():

    return send_from_directory(
        os.path.join(BASE_DIR, "pages"),
        "plant-recommendation.html"
    )


# ==========================================
# Serve CSS and JavaScript
# ==========================================

@app.route("/<path:filename>")
def serve_static_files(filename):

    allowed_files = [
        "recommendation.css",
        "recommendation.js"
    ]

    if filename in allowed_files:

        return send_from_directory(
            os.path.join(BASE_DIR, "pages"),
            filename
        )

    return "File not found", 404


# ==========================================
# Environmental data
# ==========================================

def get_environmental_data(pincode):

    # TEMPORARY DEMO DATA
    # We will connect a real weather API later.

    return {
        "pincode": pincode,
        "temperature": 28,
        "humidity": 68,
        "rainfall": "medium",
        "climate": "tropical"
    }


# ==========================================
# Temperature score
# ==========================================

def temperature_score(temperature, plant):

    minimum = plant["min_temperature"]
    maximum = plant["max_temperature"]

    if minimum <= temperature <= maximum:
        return 100

    if temperature < minimum:
        difference = minimum - temperature
    else:
        difference = temperature - maximum

    score = 100 - (difference * 10)

    return max(0, min(100, score))


# ==========================================
# Humidity score
# ==========================================

def humidity_score(humidity, plant):

    if humidity >= 70:
        user_humidity = "high"

    elif humidity >= 40:
        user_humidity = "medium"

    else:
        user_humidity = "low"

    if user_humidity == plant["humidity"]:
        return 100

    return 60


# ==========================================
# Sunlight score
# ==========================================

def sunlight_score(user_sunlight, plant_sunlight):

    if user_sunlight == plant_sunlight:
        return 100

    if (
        user_sunlight == "high"
        and plant_sunlight == "partial"
    ):
        return 70

    if (
        user_sunlight == "partial"
        and plant_sunlight == "high"
    ):
        return 60

    if (
        user_sunlight == "low"
        and plant_sunlight == "partial"
    ):
        return 60

    return 40


# ==========================================
# Space score
# ==========================================

def space_score(user_space, plant_space):

    values = {
        "small": 1,
        "medium": 2,
        "large": 3
    }

    user_value = values.get(user_space, 1)
    plant_value = values.get(plant_space, 2)

    if user_value >= plant_value:
        return 100

    if user_value + 1 == plant_value:
        return 60

    return 20


# ==========================================
# Location score
# ==========================================

def location_score(location, plant):

    if location in plant["locations"]:
        return 100

    return 0


# ==========================================
# Recommendation engine
# ==========================================

def recommend_plants(
    environment,
    location,
    space,
    sunlight
):

    results = []

    for plant in plants:

        location_match = location_score(
            location,
            plant
        )

        # Skip plants that are not suitable
        # for indoor / terrace / garden.

        if location_match == 0:
            continue

        temperature = temperature_score(
            environment["temperature"],
            plant
        )

        humidity = humidity_score(
            environment["humidity"],
            plant
        )

        sunlight_match = sunlight_score(
            sunlight,
            plant["sunlight"]
        )

        space_match = space_score(
            space,
            plant["space"]
        )

        # ----------------------------------
        # Weighted score
        # ----------------------------------

        final_score = (
            temperature * 0.30
            + humidity * 0.10
            + sunlight_match * 0.20
            + space_match * 0.20
            + location_match * 0.20
        )

        final_score = round(final_score)

        if final_score >= 40:

            results.append({

                "name": plant["name"],

                "category": plant["category"],

                "score": final_score,

                "sunlight": plant["sunlight"],

                "space": plant["space"],

                "water": plant["water"],

                "difficulty": plant["difficulty"],

                "description": plant["description"]

            })

    # Highest score first

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    # Return top 5

    return results[:5]


# ==========================================
# Recommendation API
# ==========================================

@app.route(
    "/recommend",
    methods=["POST"]
)
def recommend():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data received"
        }), 400

    pincode = data.get("pincode")
    location = data.get("location")
    space = data.get("space")
    sunlight = data.get("sunlight")


    # ----------------------------------
    # Validate input
    # ----------------------------------

    if not pincode:

        return jsonify({
            "error": "Pincode is required"
        }), 400


    if not location:

        return jsonify({
            "error": "Growing location is required"
        }), 400


    if not space:

        return jsonify({
            "error": "Available space is required"
        }), 400


    if not sunlight:

        return jsonify({
            "error": "Sunlight information is required"
        }), 400


    # ----------------------------------
    # Get environmental information
    # ----------------------------------

    environment = get_environmental_data(
        pincode
    )


    # ----------------------------------
    # Generate recommendations
    # ----------------------------------

    recommendations = recommend_plants(
        environment,
        location,
        space,
        sunlight
    )


    # ----------------------------------
    # Send response
    # ----------------------------------

    return jsonify({

        "success": True,

        "environment": environment,

        "recommendations": recommendations

    })


# ==========================================
# Start server
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )