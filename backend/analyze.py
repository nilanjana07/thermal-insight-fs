from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from skimage import io, filters, measure
import numpy as np
import google.generativeai as genai

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- Gemini API Key Setup ---
genai.configure(api_key="")

# --- Temperature Classification ---
TEMP_CONDITIONS = {
    "low_temp": {"threshold": 0.38, "condition": "Hypothermic - Potential issue detected."},
    "normal_temp": {"threshold": 0.40, "condition": "Normal temperature - No abnormalities detected."},
    "high_temp": {"threshold": 0.44, "condition": "Inflamed - Potential issue detected."},
}

IMPLICATIONS = {
    "head": {
        "hypothermic": (
            "- Poor blood circulation may lead to conditions like migraines or cold exposure injuries.\n"
            "- Possible symptoms include dizziness, headaches, or numbness in the scalp.\n"
            "- Could indicate systemic issues like hypothermia or anemia.\n"
            "- Neurological issues such as decreased brain activity could also be a concern.\n"
            "- Suggested nutrition: Foods rich in iron (spinach, lentils) and omega-3 fatty acids (salmon, walnuts)."
        ),
        "inflamed": (
            "- May indicate fever or infection causing elevated temperatures.\n"
            "- Could result from sinusitis, localized inflammation, or other infections.\n"
            "- Persistent inflammation may signal an underlying chronic condition such as meningitis or autoimmune disorders.\n"
            "- Consult a doctor if symptoms persist.\n"
            "- Suggested nutrition: Anti-inflammatory foods like turmeric, green tea, and leafy greens."
        ),
        "normal": "Temperature seems normal. You should be good to go! Kudos! :)",
    },
    "default": {
        "hypothermic": (
            "- Generalized hypothermia may result from prolonged cold exposure or systemic conditions.\n"
            "- Symptoms include shivering, lethargy, and reduced cognitive function.\n"
            "- Could indicate metabolic issues such as hypothyroidism.\n"
            "- Suggested actions include warm clothing and avoiding prolonged cold exposure.\n"
            "- Suggested nutrition: Warm soups, whole grains, and hot beverages."
        ),
        "inflamed": (
            "- Generalized inflammation might indicate an autoimmune disorder or systemic infection.\n"
            "- Could result in fever, fatigue, or pain in multiple regions.\n"
            "- Persistent inflammation can cause tissue damage.\n"
            "- Seek medical advice for further diagnosis.\n"
            "- Suggested nutrition: Omega-3-rich foods (chia seeds, salmon) and reduced processed foods."
        ),
        "normal": "Temperature seems normal. You should be good to go! Kudos! :)",
    },
}

def classify_temperature(mean_temp):
    if mean_temp < 29:
        return TEMP_CONDITIONS["low_temp"]["condition"], "hypothermic"
    elif 29 <= mean_temp <= 33:
        return TEMP_CONDITIONS["normal_temp"]["condition"], "normal"
    else:
        return TEMP_CONDITIONS["high_temp"]["condition"], "inflamed"

# --- Route for Analyzing Uploaded Thermal Image ---
@app.route("/analyze", methods=["POST"])
def analyze_image():
    try:
        if "file" not in request.files or request.files["file"].filename == "":
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
        file.save(file_path)

        # Image Processing
        img = io.imread(file_path, as_gray=True)
        edges = filters.sobel(img)
        labeled_image, num_regions = measure.label(edges > 0.1, background=0, return_num=True)
        regions = measure.regionprops(labeled_image, intensity_image=img)
        mean_intensity = np.mean(img)
        mean_temperature = mean_intensity * 25 + 20  # Convert to Celsius

        # Classify Temperature
        condition, classification = classify_temperature(mean_temperature)
        body_part = request.form.get("bodyPart", "default").lower()
        implications = IMPLICATIONS.get(body_part, IMPLICATIONS["default"])[classification]

        # Region-level temperature breakdown
        temperatures = [region.mean_intensity * 25 + 20 for region in regions]
        cold_count = sum(1 for t in temperatures if t < 30)
        normal_count = sum(1 for t in temperatures if 30 <= t <= 34)
        hot_count = sum(1 for t in temperatures if t > 34)

        result = {
            "num_regions": num_regions,
            "mean_temperature": round(mean_temperature + 6, 2),  # Adjusted for calibration
            "condition": condition,
            "conditions": {
                "cold": cold_count,
                "normal": normal_count,
                "hot": hot_count,
            },
            "implications": implications,
        }

        # Gemini Analysis
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            f"Based on the analysis, the condition is '{condition}' with implications: {implications}.\n"
            f"What are the nutritional deficiencies based on {body_part}?\n"
            f"Also suggest some possible medication constituents.\n"
            f"Add a message that these are purely suggestive only.\n"
            f"Write in a very formal manner as if a real medical report. Only 5-6 lines. "
            f"No need to rewrite the condition and implication."
        )

        gemini_response = model.generate_content(prompt)

        # Clean up
        os.remove(file_path)

        return jsonify({
            "result": result,
            "gemini_response": gemini_response.text
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

# --- Start the Flask App ---
if __name__ == "__main__":
    app.run(debug=True)



