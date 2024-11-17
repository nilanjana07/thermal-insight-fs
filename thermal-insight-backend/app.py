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
    "low_temp": {"threshold": 0.3, "condition": "Cold regions detected - May indicate poor blood circulation or hypothermia."},
    "normal_temp": {"threshold": 0.4, "condition": "Normal temperature - No abnormalities detected."},
    "high_temp": {"threshold": 0.5, "condition": "Hot regions detected - May indicate inflammation or infection."},
}

def classify_temperature(region_mean_intensity):
    if region_mean_intensity < TEMP_CONDITIONS["low_temp"]["threshold"]:
        return TEMP_CONDITIONS["low_temp"]["condition"]
    elif TEMP_CONDITIONS["low_temp"]["threshold"] <= region_mean_intensity <= TEMP_CONDITIONS["normal_temp"]["threshold"]:
        return TEMP_CONDITIONS["normal_temp"]["condition"]
    else:
        return TEMP_CONDITIONS["high_temp"]["condition"]

@app.route("/analyze", methods=["POST"])
def analyze_image():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(file_path)

    img = io.imread(file_path, as_gray=True)
    edges = filters.sobel(img)
    labeled_image, num_regions = measure.label(edges > 0.1, background=0, return_num=True)
    regions = measure.regionprops(labeled_image)
    mean_intensity = np.mean(img)

    conditions = {"cold": [], "normal": [], "hot": []}
    for region in regions:
        region_mean_intensity = np.mean(img[region.coords[:, 0], region.coords[:, 1]])
        condition = classify_temperature(region_mean_intensity)
        if condition == TEMP_CONDITIONS["low_temp"]["condition"]:
            conditions["cold"].append(region_mean_intensity)
        elif condition == TEMP_CONDITIONS["normal_temp"]["condition"]:
            conditions["normal"].append(region_mean_intensity)
        else:
            conditions["hot"].append(region_mean_intensity)

    result = {
        "num_regions": num_regions,
        "mean_intensity": mean_intensity * 100,
        "conditions": {
            "cold": len(conditions["cold"]),
            "normal": len(conditions["normal"]),
            "hot": len(conditions["hot"]),
        },
    }

    os.remove(file_path)  # Clean up the uploaded file
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
