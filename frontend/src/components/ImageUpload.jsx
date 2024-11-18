import React, { useState } from "react";
import "./ImageUpload.css";
import { saveAs } from "file-saver";

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    address: "",
    dob: "",
    email: "",
    phone: "",
    bodyPart: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null); // Clear previous results
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please upload a thermal image.");
      return;
    }

    setLoading(true);
    setError("");

    const uploadData = new FormData();
    uploadData.append("file", file);
    Object.entries(formData).forEach(([key, value]) => {
      uploadData.append(key, value);
    });

    try {
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: uploadData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const pdfContent = `
      Thermo-Insights Analysis Report
      
      Patient Details:
      - Name: ${formData.name}
      - Age: ${formData.age}
      - Address: ${formData.address}
      - Date of Birth: ${formData.dob}
      - Email: ${formData.email}
      - Phone: ${formData.phone}
      - Body Part: ${formData.bodyPart}

      Analysis Results:
      ${JSON.stringify(result, null, 2)}
    `;

    const blob = new Blob([pdfContent], { type: "application/pdf" });
    saveAs(blob, "Thermo-Insights-Report.pdf");
  };

  return (
    <div className="image-upload-container">
      <div className="card">
        <h1 className="title">Thermo-Insights</h1>
        <p className="description">
          Thermal imaging is a non-invasive diagnostic technique that uses heat
          patterns to detect abnormalities. This tool aids in preliminary
          diagnoses for conditions such as inflammation or poor blood
          circulation.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label>Patient Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            required
          />

          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />

          <label>Date of Birth:</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            required
          />

          <label>Email ID:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <label>Phone Number:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />

          <label>Body Part:</label>
          <input
            type="text"
            name="bodyPart"
            value={formData.bodyPart}
            onChange={handleInputChange}
            required
          />

          <label>Thermal Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Submit"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result-container">
            <h2>Analysis Report</h2>
            <pre>{JSON.stringify(result, null, 2)}</pre>
            <button onClick={downloadPDF}>Download PDF</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;



