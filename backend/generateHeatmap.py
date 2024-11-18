from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
HEATMAP_FOLDER = 'heatmaps'

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(HEATMAP_FOLDER, exist_ok=True)

@app.route('/generateHeatmap', methods=['POST'])
def generate_heatmap():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400
    
    image = request.files['image']
    if image.filename == '':
        return jsonify({"error": "No selected file."}), 400

    # Save the uploaded image
    input_path = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(input_path)

    # Generate the heatmap
    try:
        # Read the thermal image (assumed to be grayscale)
        img = cv2.imread(input_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return jsonify({"error": "Unable to read the image. Make sure it's a valid thermal image."}), 400

        # Apply a colormap to the grayscale image to create a heatmap
        heatmap = cv2.applyColorMap(img, cv2.COLORMAP_JET)

        # Save the heatmap image
        heatmap_filename = os.path.splitext(image.filename)[0] + "_heatmap.jpg"
        heatmap_path = os.path.join(HEATMAP_FOLDER, heatmap_filename)
        cv2.imwrite(heatmap_path, heatmap)

        return send_file(heatmap_path, mimetype='image/jpeg')

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
