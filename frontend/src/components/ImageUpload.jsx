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
    pdf.setFontSize(16);
    pdf.text("Thermalytics Analysis Report", 10, 10);

    pdf.setFontSize(12);
    pdf.text("Patient Details:", 10, 20);
    pdf.text(`- Name: ${formData.name}`, 10, 30);
    pdf.text(`- Age: ${formData.age}`, 10, 40);
    pdf.text(`- Address: ${formData.address}`, 10, 50);
    pdf.text(`- Date of Birth: ${formData.dob}`, 10, 60);
    pdf.text(`- Email: ${formData.email}`, 10, 70);
    pdf.text(`- Phone: ${formData.phone}`, 10, 80);
    pdf.text(`- Body Part: ${formData.bodyPart}`, 10, 90);

    pdf.text("Analysis Results:", 10, 110);
    pdf.text(`- Cold: ${result.conditions.cold}`, 10, 120);
    pdf.text(`- Hot: ${result.conditions.hot}`, 10, 130);
    pdf.text(`- Normal: ${result.conditions.normal}`, 10, 140);
    pdf.text(`- Mean Intensity: ${result.mean_intensity.toFixed(2)}`, 10, 150);
    pdf.text(`- Number of Regions: ${result.num_regions}`, 10, 160);

    pdf.save("Thermo-Insights-Report.pdf");
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
            <h2 className="text-lg font-bold">Analysis Report</h2>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
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