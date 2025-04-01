from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from skimage import io, filters, measure
import numpy as np
from google import genai  # Import the genai library

# Create Flask app
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Ensure the upload directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

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
            "- Suggested nutrition: Foods rich in iron (spinach, lentils) and omega-3 fatty acids (salmon, walnuts) to improve blood flow and brain health."
        ),
        "inflamed": (
            "- May indicate fever or infection causing elevated temperatures.\n"
            "- Could result from sinusitis, localized inflammation, or other infections.\n"
            "- Persistent inflammation may signal an underlying chronic condition such as meningitis or autoimmune disorders.\n"
            "- Consult a doctor if symptoms persist; untreated inflammation could worsen.\n"
            "- Suggested nutrition: Anti-inflammatory foods like turmeric, green tea, and leafy greens."
        ),
        "normal": ("Temperature seems normal. You should be good to go! kudos! :)"),
    },
    # Add other body parts and their implications here...
    "default": {
        "hypothermic": (
            "- Generalized hypothermia may result from prolonged cold exposure or systemic conditions.\n"
            "- Symptoms include shivering, lethargy, and reduced cognitive function.\n"
            "- Could indicate metabolic issues such as hypothyroidism.\n"
            "- Suggested actions include wearing appropriate clothing and avoiding prolonged exposure to cold environments.\n"
            "- Suggested nutrition: Warm soups, whole grains, and hot beverages to maintain body heat."
        ),
        "inflamed": (
            "- Generalized inflammation might indicate an autoimmune disorder or systemic infection.\n"
            "- Could result in fever, fatigue, or pain in multiple regions of the body.\n"
            "- Persistent inflammation can cause tissue damage and chronic health issues.\n"
            "- Seek medical advice for a detailed examination and treatment plan.\n"
            "- Suggested nutrition: Incorporate omega-3-rich foods (chia seeds, salmon) and reduce processed foods."
        ),
        "normal": ("Temperature seems normal. You should be good to go! kudos! :)"),
    },
}

def classify_temperature(mean_temp):
    if mean_temp < 29:
        return TEMP_CONDITIONS["low_temp"]["condition"], "hypothermic"
    elif 29 <= mean_temp <= 33:
        return TEMP_CONDITIONS["normal_temp"]["condition"], "normal"
    else:
        return TEMP_CONDITIONS["high_temp"]["condition"], "inflamed"

@app.route("/analyze", methods=["POST"])
def analyze_image():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
        file.save(file_path)

        # Load and process the image
        img = io.imread(file_path, as_gray=True)
        edges = filters.sobel(img)
        labeled_image, num_regions = measure.label(edges > 0.1, background=0, return_num=True)

        # Pass the grayscale image (img) to regionprops to avoid mean_intensity error
        regions = measure.regionprops(labeled_image, intensity_image=img)
        mean_intensity = np.mean(img)

        # Convert mean intensity to temperature (assuming a mapping, e.g., scaled to [30°C, 42°C])
        mean_temperature = mean_intensity * 25 + 20  # Map [0, 1] intensity to [30°C, 42°C]

        # Classify the mean temperature
        condition, classification = classify_temperature(mean_temperature)

        # Get body part and implications
        body_part = request.form.get("bodyPart", "default").lower()
        implications = IMPLICATIONS.get(body_part, IMPLICATIONS["default"])[classification]

        # Calculate conditions based on labeled regions
        temperatures = [region.mean_intensity * 25 + 20 for region in regions]
        cold_count = sum(1 for t in temperatures if t < 30)
        normal_count = sum(1 for t in temperatures if 30 <= t <= 34)
        hot_count = sum(1 for t in temperatures if t > 34)

        # Prepare result
        result = {
            "num_regions": num_regions,
            "mean_temperature": round(mean_temperature + 6, 2),
            "condition": condition,
            "conditions": {"cold": cold_count, "normal": normal_count, "hot": hot_count},
            "implications": implications,
        }

        # Initialize the Gemini API client
        client = genai.Client(api_key="AIzaSyAYRYmKfd3QOUqP7-KmgzXpeKFzXsyLR3E")

        # Generate content using the Gemini API
        gemini_response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Based on the analysis, the condition is '{condition}' with implications: {implications}. What are the nutritional deficiencies based on {body_part}? Also suggest some possible medication constituents. Add a message that these are purely suggestive only.Write in a very formal manner as if a real medical report. Make sure to only 5-6 lines "
        )

        os.remove(file_path)  # Clean up the uploaded file
        return jsonify({"result": result, "gemini_response": gemini_response.text})

    except Exception as e:
        print(f"Error: {e}")  # Print the error to the console
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)


