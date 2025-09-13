"use client";

import { useState } from "react";

interface ExtractedData {
  applicantName: string;
  contactNumber: string;
  email: string;
  address: string;
  dateOfBirth: string;
  charges: string;
  priorConvictions: string;
  employmentStatus: string;
  monthlyIncome: string;
  dependents: string;
  emergencyContact: string;
  flags: string[];
  confidence: number;
}

export default function Demo() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null,
  );
  const [currentStep, setCurrentStep] = useState<
    "upload" | "processing" | "review" | "export"
  >("upload");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleExtract = async () => {
    if (!file) return;

    setIsProcessing(true);
    setCurrentStep("processing");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedData(data);
        setCurrentStep("review");
      } else {
        console.error("Extraction failed");
        setCurrentStep("upload");
      }
    } catch (error) {
      console.error("Error:", error);
      setCurrentStep("upload");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataChange = (field: keyof ExtractedData, value: string) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        [field]: value,
      });
    }
  };

  const exportToCSV = () => {
    if (!extractedData) return;

    const csvData = [
      ["Field", "Value"],
      ["Applicant Name", extractedData.applicantName],
      ["Contact Number", extractedData.contactNumber],
      ["Email", extractedData.email],
      ["Address", extractedData.address],
      ["Date of Birth", extractedData.dateOfBirth],
      ["Charges", extractedData.charges],
      ["Prior Convictions", extractedData.priorConvictions],
      ["Employment Status", extractedData.employmentStatus],
      ["Monthly Income", extractedData.monthlyIncome],
      ["Dependents", extractedData.dependents],
      ["Emergency Contact", extractedData.emergencyContact],
      ["Flags", extractedData.flags.join("; ")],
      ["Confidence Score", extractedData.confidence.toString()],
    ];

    const csvContent = csvData
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `legal_form_extraction_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const saveToDatabase = async () => {
    if (!extractedData) return;

    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(extractedData),
      });

      if (response.ok) {
        alert("Data saved successfully!");
        setCurrentStep("export");
      } else {
        alert("Failed to save data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data");
    }
  };

  const resetDemo = () => {
    setFile(null);
    setExtractedData(null);
    setCurrentStep("upload");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Interactive Demo
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Upload a handwritten legal form and watch our AI extract structured
          data in real-time
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center space-x-4">
          {["upload", "processing", "review", "export"].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === step
                    ? "bg-blue-600 text-white"
                    : ["upload", "processing", "review", "export"].indexOf(
                          currentStep,
                        ) > index
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              {index < 3 && <div className="w-16 h-1 bg-gray-200 mx-2"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Upload Step */}
      {currentStep === "upload" && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">1. Upload Legal Form</h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-gray-600">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-lg">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
            </label>
          </div>

          {file && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-4">
                Selected file: {file.name}
              </p>
              <button
                onClick={handleExtract}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Extract Data
              </button>
            </div>
          )}
        </div>
      )}

      {/* Processing Step */}
      {currentStep === "processing" && (
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-6">2. Processing Form</h2>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">
            Our AI is analyzing the handwritten form and extracting structured
            data...
          </p>
        </div>
      )}

      {/* Review Step */}
      {currentStep === "review" && extractedData && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              3. Review & Edit Extracted Data
            </h2>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Confidence:</span>
              <span
                className={`px-2 py-1 rounded text-sm font-semibold ${
                  extractedData.confidence > 0.8
                    ? "bg-green-100 text-green-800"
                    : extractedData.confidence > 0.6
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {Math.round(extractedData.confidence * 100)}%
              </span>
            </div>
          </div>

          {extractedData.flags.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <h3 className="text-sm font-medium text-yellow-800">
                Flagged for Review:
              </h3>
              <ul className="text-sm text-yellow-700 mt-1">
                {extractedData.flags.map((flag, index) => (
                  <li key={index}>• {flag}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(extractedData)
              .filter(([key]) => !["flags", "confidence"].includes(key))
              .map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </label>
                  <input
                    type="text"
                    value={value as string}
                    onChange={(e) =>
                      handleDataChange(
                        key as keyof ExtractedData,
                        e.target.value,
                      )
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setCurrentStep("export")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Continue to Export
            </button>
            <button
              onClick={resetDemo}
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* Export Step */}
      {currentStep === "export" && extractedData && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">
            4. Export or Save Data
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Download CSV
              </h3>
              <p className="text-blue-700 mb-4">
                Export the extracted data as a CSV file for use in spreadsheets
                or other systems.
              </p>
              <button
                onClick={exportToCSV}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold w-full"
              >
                Download CSV
              </button>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-4">
                Save to Database
              </h3>
              <p className="text-green-700 mb-4">
                Save directly to the case management system for immediate access
                by staff.
              </p>
              <button
                onClick={saveToDatabase}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold w-full"
              >
                Save to System
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={resetDemo}
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg font-semibold"
            >
              Process Another Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
