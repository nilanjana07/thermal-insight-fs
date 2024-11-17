import React, { useState } from "react";
import axios from "axios";
import "./ImageUpload.css";

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setResult("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please upload a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(response.data.result);
    } catch (err) {
      setError("Failed to analyze the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Thermal Image Analyzer</h1>
      <p className="subtitle">Upload a thermal image to analyze temperature conditions.</p>
      <form className="form" onSubmit={handleSubmit}>
        <label className="file-label">
          <input
            type="file"
            className="file-input"
            accept="image/*"
            onChange={handleFileChange}
          />
          {selectedFile ? selectedFile.name : "Choose an Image"}
        </label>
        <button className="upload-button" type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Upload and Analyze"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {result && (
        <div className="result-container">
          <h2 className="result-title">Analysis Result</h2>
          <p className="result">{result}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
