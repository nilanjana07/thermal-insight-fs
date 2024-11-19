from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from skimage import io, filters, measure
import numpy as np

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
        "normal":("Temperature seems normal. You should be good to go! kudos! :)"),
    },
    "chest": {
        "hypothermic": (
            "- May indicate poor circulation in the chest, potentially linked to cardiac or pulmonary issues.\n"
            "- Could result from extreme cold exposure or stress-related conditions.\n"
            "- May lead to reduced lung function or chest muscle stiffness.\n"
            "- Suggested actions include gentle breathing exercises to stimulate circulation.\n"
            "- Suggested nutrition: Warm fluids (like herbal teas), garlic, and nuts to support cardiac health."
        ),
        "inflamed": (
            "- Could suggest respiratory infections such as bronchitis or pneumonia.\n"
            "- May indicate muscle strain or inflammation due to physical exertion or injury.\n"
            "- Persistent conditions may point to chronic diseases like asthma or COPD.\n"
            "- Regular exercise and improved air quality can reduce symptoms.\n"
            "- Suggested nutrition: Foods high in antioxidants (berries, citrus fruits) to support lung health."
        ),
        "normal":("Temperature seems normal. You should be good to go! kudos! :)"),
    },
    "arm": {
        "hypothermic": (
            "- Indicates poor circulation, possibly due to vascular issues or nerve damage.\n"
            "- Symptoms might include tingling, numbness, or weakness in the arms.\n"
            "- Could suggest systemic issues like Raynaud's phenomenon or diabetes.\n"
            "- Suggested remedies include physical therapy and warm compresses.\n"
            "- Suggested nutrition: Magnesium-rich foods like avocados and almonds for improved nerve and muscle function."
        ),
        "inflamed": (
            "- May result from overuse, injury, or conditions like tendinitis.\n"
            "- Could indicate localized infections or inflammatory conditions such as arthritis.\n"
            "- Prolonged inflammation can lead to reduced mobility or chronic pain.\n"
            "- Suggested treatments include rest, ice therapy, and anti-inflammatory medications.\n"
            "- Suggested nutrition: Protein-rich foods (chicken, eggs) and anti-inflammatory spices (ginger, turmeric)."
        ),
        "normal":("Temperature seems normal. You should be good to go! kudos! :)"),
    },
    "leg": {
        "hypothermic": (
            "- Could indicate peripheral vascular disease or deep vein thrombosis.\n"
            "- Symptoms may include cold feet, cramping, or reduced mobility.\n"
            "- May suggest nerve damage or compromised circulation due to diabetes.\n"
            "- Suggested remedies include elevation, massage, and compression therapy.\n"
            "- Suggested nutrition: Foods rich in potassium (bananas, sweet potatoes) for better muscle function."
        ),
        "inflamed": (
            "- Common causes include muscle overuse, injury, or varicose veins.\n"
            "- Persistent symptoms might suggest venous insufficiency or cellulitis.\n"
            "- Chronic inflammation could lead to difficulty walking or leg pain.\n"
            "- Suggested remedies include stretching, hydration, and medical consultation.\n"
            "- Suggested nutrition: Foods high in vitamin C (oranges, strawberries) for vascular health."
        ),
        "normal":("Temperature seems normal. You should be good to go! kudos! :)"),
    },
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
        "normal":("Temperature seems normal. You should be good to go! kudos! :)"),

    },
}


def classify_temperature(mean_temp):
    if mean_temp < 31:
        return TEMP_CONDITIONS["low_temp"]["condition"], "hypothermic"
    elif 31 <= mean_temp <= 32:
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
        cold_count = sum(1 for t in temperatures if t < 35)
        normal_count = sum(1 for t in temperatures if 35 <= t <= 37)
        hot_count = sum(1 for t in temperatures if t > 37)

        # Prepare result
        result = {
            "num_regions": num_regions,
            "mean_temperature": round(mean_temperature, 2),
            "condition": condition,
            "conditions": {"cold": cold_count, "normal": normal_count, "hot": hot_count},
            "implications": implications,
        }

        os.remove(file_path)  # Clean up the uploaded file
        return jsonify(result)

    except Exception as e:
        print(f"Error: {e}")  # Print the error to the console
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)


