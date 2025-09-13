"use client";

import { useState } from "react";
import {
  FinancialForm,
  ApplicantIncome,
  HouseholdIncome,
  OtherIncomeSource,
} from "../../api/data";

interface ExtractedFinancialForm extends FinancialForm {
  flags: string[];
  confidence: number;
}

export default function Demo() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] =
    useState<ExtractedFinancialForm | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "upload" | "processing" | "review" | "export"
  >("upload");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
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
        console.log("Received data:", data); // Debug log
        setExtractedData(data);
        setCurrentStep("review");
      } else {
        const errorData = await response.json();
        console.error("Extraction failed:", errorData);
        alert(`Extraction failed: ${errorData.error || "Unknown error"}`);
        setCurrentStep("upload");
      }
    } catch (error) {
      console.error("Error:", error);
      setCurrentStep("upload");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinancialSituationChange = (value: string) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        financialSituationNote: value,
      });
    }
  };

  const handleApplicantIncomeChange = (
    index: number,
    field: keyof ApplicantIncome,
    value: string | number,
  ) => {
    if (extractedData) {
      const newApplicantIncome = [...(extractedData.applicantIncome || [])];
      newApplicantIncome[index] = {
        ...newApplicantIncome[index],
        [field]: value,
      };
      setExtractedData({
        ...extractedData,
        applicantIncome: newApplicantIncome,
      });
    }
  };

  const handleHouseholdIncomeChange = (
    index: number,
    field: keyof HouseholdIncome,
    value: string | number,
  ) => {
    if (extractedData) {
      const newHouseholdIncome = [...(extractedData.householdIncome || [])];
      newHouseholdIncome[index] = {
        ...newHouseholdIncome[index],
        [field]: value,
      };
      setExtractedData({
        ...extractedData,
        householdIncome: newHouseholdIncome,
      });
    }
  };

  const handleOtherIncomeChange = (
    index: number,
    field: keyof OtherIncomeSource,
    value: string | number,
  ) => {
    if (extractedData) {
      const newOtherIncome = [...(extractedData.otherIncomeSources || [])];
      newOtherIncome[index] = {
        ...newOtherIncome[index],
        [field]: value,
      };
      setExtractedData({
        ...extractedData,
        otherIncomeSources: newOtherIncome,
      });
    }
  };

  const addApplicantIncomeRow = () => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        applicantIncome: [
          ...(extractedData.applicantIncome || []),
          { occupation: "", grossMonthlyIncomeSGD: 0, periodOfEmployment: "" },
        ],
      });
    }
  };

  const addHouseholdIncomeRow = () => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        householdIncome: [
          ...(extractedData.householdIncome || []),
          {
            name: "",
            relationshipToApplicant: "",
            occupation: "",
            grossMonthlyIncomeSGD: 0,
          },
        ],
      });
    }
  };

  const addOtherIncomeRow = () => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        otherIncomeSources: [
          ...(extractedData.otherIncomeSources || []),
          { description: "", amountSGD: 0 },
        ],
      });
    }
  };

  const exportToCSV = () => {
    if (!extractedData) return;

    const csvData = [
      ["Section", "Field", "Value"],
      [
        "Financial Situation",
        "Note",
        extractedData.financialSituationNote || "",
      ],
    ];

    // Add applicant income data
    if (extractedData.applicantIncome) {
      extractedData.applicantIncome.forEach((income, index) => {
        csvData.push([
          `Applicant Income ${index + 1}`,
          "Occupation",
          income.occupation || "",
        ]);
        csvData.push([
          `Applicant Income ${index + 1}`,
          "Monthly Income (SGD)",
          income.grossMonthlyIncomeSGD?.toString() || "0",
        ]);
        csvData.push([
          `Applicant Income ${index + 1}`,
          "Employment Period",
          income.periodOfEmployment || "",
        ]);
      });
    }

    // Add household income data
    if (extractedData.householdIncome) {
      extractedData.householdIncome.forEach((income, index) => {
        csvData.push([
          `Household Income ${index + 1}`,
          "Name",
          income.name || "",
        ]);
        csvData.push([
          `Household Income ${index + 1}`,
          "Relationship",
          income.relationshipToApplicant || "",
        ]);
        csvData.push([
          `Household Income ${index + 1}`,
          "Occupation",
          income.occupation || "",
        ]);
        csvData.push([
          `Household Income ${index + 1}`,
          "Monthly Income (SGD)",
          income.grossMonthlyIncomeSGD?.toString() || "0",
        ]);
      });
    }

    // Add other income sources
    if (extractedData.otherIncomeSources) {
      extractedData.otherIncomeSources.forEach((income, index) => {
        csvData.push([
          `Other Income ${index + 1}`,
          "Description",
          income.description || "",
        ]);
        csvData.push([
          `Other Income ${index + 1}`,
          "Amount (SGD)",
          income.amountSGD?.toString() || "0",
        ]);
      });
    }

    csvData.push(["Metadata", "Flags", extractedData.flags.join("; ")]);
    csvData.push([
      "Metadata",
      "Confidence Score",
      extractedData.confidence.toString(),
    ]);

    const csvContent = csvData
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial_form_extraction_${new Date().getTime()}.csv`;
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
        alert("Financial form saved successfully!");
        setCurrentStep("export");
      } else {
        alert("Failed to save financial form");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving financial form");
    }
  };

  const resetDemo = () => {
    setFile(null);
    setImagePreview(null);
    setExtractedData(null);
    setCurrentStep("upload");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Financial Form Demo
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Upload a handwritten financial form and watch our AI extract
          structured income data in real-time
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
          <h2 className="text-2xl font-semibold mb-6">
            1. Upload Financial Form
          </h2>

          {!file ? (
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
          ) : (
            <div className="space-y-6">
              {/* Image Preview */}
              {imagePreview && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Image Preview:</h3>
                  <div className="flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Uploaded financial form"
                      className="max-w-full max-h-96 object-contain border rounded shadow"
                    />
                  </div>
                </div>
              )}

              {/* File Info and Actions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setFile(null);
                        setImagePreview(null);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                    <button
                      onClick={handleExtract}
                      disabled={isProcessing}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      {isProcessing
                        ? "Processing..."
                        : "Extract Financial Data"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processing Step */}
      {currentStep === "processing" && (
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-6">
            2. Processing Financial Form
          </h2>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">
            Our AI is analyzing the financial form and extracting income data...
          </p>
        </div>
      )}

      {/* Review Step */}
      {currentStep === "review" && extractedData && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              3. Review & Edit Financial Data
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

          <div className="space-y-8">
            {/* Debug Info */}
            {process.env.NODE_ENV === "development" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  Debug Info:
                </h4>
                <pre className="text-xs text-yellow-700 overflow-auto">
                  {JSON.stringify(extractedData, null, 2)}
                </pre>
              </div>
            )}

            {/* Financial Situation Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Situation Note
              </label>
              <textarea
                value={extractedData.financialSituationNote || ""}
                onChange={(e) => handleFinancialSituationChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Any additional notes about financial situation..."
              />
            </div>

            {/* Applicant Income */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Applicant Income</h3>
                <button
                  onClick={addApplicantIncomeRow}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Add Row
                </button>
              </div>
              {(!extractedData.applicantIncome ||
                extractedData.applicantIncome.length === 0) && (
                <div className="text-gray-500 text-sm mb-4">
                  No applicant income data extracted. Click "Add Row" to
                  manually add entries.
                </div>
              )}
              {extractedData.applicantIncome?.map((income, index) => (
                <div
                  key={index}
                  className="grid md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={income.occupation || ""}
                      onChange={(e) =>
                        handleApplicantIncomeChange(
                          index,
                          "occupation",
                          e.target.value,
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Income (SGD)
                    </label>
                    <input
                      type="number"
                      value={income.grossMonthlyIncomeSGD || 0}
                      onChange={(e) =>
                        handleApplicantIncomeChange(
                          index,
                          "grossMonthlyIncomeSGD",
                          parseFloat(e.target.value),
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employment Period
                    </label>
                    <input
                      type="text"
                      value={income.periodOfEmployment || ""}
                      onChange={(e) =>
                        handleApplicantIncomeChange(
                          index,
                          "periodOfEmployment",
                          e.target.value,
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Household Income */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Household Income</h3>
                <button
                  onClick={addHouseholdIncomeRow}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Add Row
                </button>
              </div>
              {(!extractedData.householdIncome ||
                extractedData.householdIncome.length === 0) && (
                <div className="text-gray-500 text-sm mb-4">
                  No household income data extracted. Click "Add Row" to
                  manually add entries.
                </div>
              )}
              {extractedData.householdIncome?.map((income, index) => (
                <div
                  key={index}
                  className="grid md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={income.name || ""}
                      onChange={(e) =>
                        handleHouseholdIncomeChange(
                          index,
                          "name",
                          e.target.value,
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={income.relationshipToApplicant || ""}
                      onChange={(e) =>
                        handleHouseholdIncomeChange(
                          index,
                          "relationshipToApplicant",
                          e.target.value,
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={income.occupation || ""}
                      onChange={(e) =>
                        handleHouseholdIncomeChange(
                          index,
                          "occupation",
                          e.target.value,
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Income (SGD)
                    </label>
                    <input
                      type="number"
                      value={income.grossMonthlyIncomeSGD || 0}
                      onChange={(e) =>
                        handleHouseholdIncomeChange(
                          index,
                          "grossMonthlyIncomeSGD",
                          parseFloat(e.target.value),
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Other Income Sources */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Other Income Sources</h3>
                <button
                  onClick={addOtherIncomeRow}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Add Row
                </button>
              </div>
              {(!extractedData.otherIncomeSources ||
                extractedData.otherIncomeSources.length === 0) && (
                <div className="text-gray-500 text-sm mb-4">
                  No other income sources extracted. Click "Add Row" to manually
                  add entries.
                </div>
              )}
              {extractedData.otherIncomeSources?.map((income, index) => (
                <div
                  key={index}
                  className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={income.description || ""}
                      onChange={(e) =>
                        handleOtherIncomeChange(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (SGD)
                    </label>
                    <input
                      type="number"
                      value={income.amountSGD || 0}
                      onChange={(e) =>
                        handleOtherIncomeChange(
                          index,
                          "amountSGD",
                          parseFloat(e.target.value),
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
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
            4. Export or Save Financial Data
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Download CSV
              </h3>
              <p className="text-blue-700 mb-4">
                Export the financial data as a CSV file for use in spreadsheets
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
