import React, { useState } from "react";
import { jsPDF } from "jspdf";

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
    if (!result) return;
  
    const pdf = new jsPDF();
    pdf.setFillColor(240, 248, 255);
    pdf.rect(0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height, 'F');// adding a background colour
    // Add a custom font for "Thermanalysis" if needed
    pdf.setFont("times", "bold");
    pdf.setFontSize(18);
  
    // Add a logo/icon to the header
  // Place icon in the top-left corner
  
    // Header
    pdf.text("Thermanalysis Report", 105, 15, null, null, "center");
  
    // Draw a horizontal line below the header
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(10, 30, 200, 30);
  
    // Patient Details Section
    pdf.setFontSize(14);
    pdf.setFont("times", "normal");
    pdf.text(" Patient Details", 10, 40);
  
    pdf.text(`  Name: ${formData.name}`, 10, 50);
    pdf.text(`  Age: ${formData.age}`, 10, 60);
    pdf.text(`  Address: ${formData.address}`, 10, 70);
    pdf.text(`  Date of Birth: ${formData.dob}`, 10, 80);
    pdf.text(`  Email: ${formData.email}`, 10, 90);
    pdf.text(`  Phone: ${formData.phone}`, 10, 100);
    pdf.text(`  Body Part: ${formData.bodyPart}`, 10, 110);
  
    // Analysis Results Section
    pdf.text("  Analysis Results", 10, 130);
    pdf.setFont("times", "italic");
    pdf.setFontSize(14);
    const meanTemperature = result.result.mean_temperature ? result.result.mean_temperature.toFixed(2) : "N/A";
    const implications = result.result.implications || "N/A";
    const numRegions = result.result.num_regions || "N/A";
    const resultText = `  Mean Intensity: ${meanTemperature} Implications: ${implications} Number of Regions: ${numRegions}`;
   
  // // Split text for implications to avoid overlapping
  const splitResultText = pdf.splitTextToSize(resultText, 180);
  pdf.text(splitResultText, 14, 140);
  
    //gemini response section
    pdf.setFontSize(14);
    pdf.text(" Produced prediction", 10, 180);
    const geminiResponseText = result.gemini_response;
    const splitGeminiResponseText = pdf.splitTextToSize(geminiResponseText, 180);
    pdf.text(splitGeminiResponseText, 14, 190);

    // Footer with contact details and icon
    pdf.setFontSize(12);
    
    pdf.text(
      "Contact us: Email: support@thermanalysis.com | Phone: +91 9477976686",
      40,
      285,
      null,
      null,
      "left"
    );
  
    // Add a border around the document content
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(10, 10, 190, 280);
  
    // Save the PDF
    pdf.save("Thermanalysis-Report.pdf");
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-cyan-500">Check your Reports</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Age:</label>
              <input
                type="number"
                name ="age"
                value={formData.age}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address:</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth:</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email ID:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Body Part:</label>
              <input
                type="text"
                name="bodyPart"
                value={formData.bodyPart}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Thermal Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 mt-4 text-white font-semibold rounded-md ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} transition duration-200`}
          >
            {loading ? "Analyzing..." : "Submit"}
          </button>
        </form>

        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

        {result && (
          <div className="mt-6 p-4 border border-gray-300 rounded-md">
            <h2 className="text-lg font-bold">Analysis Report Generated!</h2>
            <pre className="whitespace-pre-wrap text-sm hidden">{JSON.stringify(result, null, 2)}</pre>
            <button
              onClick={downloadPDF}
              className="mt-4 w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-200"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;