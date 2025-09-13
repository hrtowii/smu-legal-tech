// app/(marketing)/demo/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import type {
  ApplicantIncome,
  HouseholdIncome,
  OtherIncomeSource,
  EnhancedFinancialForm,
  ValidationResult,
} from "../../api/data";
import { ValidationModals } from "../../../components/validation-modals";

interface ExtractedFinancialForm extends EnhancedFinancialForm {
  flags: string[];
  confidence: number;
}

/* --------------------------------------------------------------- */
/*  Helper – shallow copy + path‑setter                              */
/* --------------------------------------------------------------- */
const setFieldValue = (
  data: ExtractedFinancialForm | null,
  path: string,
  value: string | number,
): ExtractedFinancialForm | null => {
  if (!data) return null;

  const parts = path.split(".");
  const newData = { ...data };
  let cur: Record<string, unknown> = newData as Record<string, unknown>;

  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    cur = Array.isArray(cur) ? (cur[Number(p)] as any) : (cur[p] as any);
    if (!cur) return data; // safety‑guard
  }

  const last = parts[parts.length - 1];
  if (Array.isArray(cur)) cur[Number(last)] = value;
  else cur[last] = value;

  return newData;
};

/* --------------------------------------------------------------- */
/*  Main component                                                 */
/* --------------------------------------------------------------- */
export default function Demo() {
  /* ---------- state ---------- */
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] =
    useState<ExtractedFinancialForm | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "upload" | "processing" | "review" | "export"
  >("upload");

  // validation helpers
  const [fieldValidations, setFieldValidations] = useState<
    Record<string, ValidationResult>
  >({});
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    field: string;
    value: string;
    confidence: number;
    onConfirm: () => void;
    onEdit: (newValue: string) => void;
  } | null>(null);
  const [pendingValidation, setPendingValidation] = useState<{
    field: string;
    value: string;
    validationResult: ValidationResult;
    onAccept: () => void;
    onEdit: (newValue: string) => void;
  } | null>(null);

  /* ---------- file handling ---------- */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(selected);
  };

  const handleExtract = async () => {
    if (!file) return;
    setIsProcessing(true);
    setCurrentStep("processing");
    const formData = new FormData();
    formData.append("file", file);

    try {
      // ----- OCR extraction -------------------------------------------------
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });
      if (!extractRes.ok) {
        const err = await extractRes.json();
        alert(`Extraction failed: ${err.error ?? "unknown error"}`);
        setCurrentStep("upload");
        return;
      }
      let data = await extractRes.json();

      // ----- optional smart‑mapping -----------------------------------------
      try {
        const mapRes = await fetch("/api/smart-mapping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ extractedData: data }),
        });
        if (mapRes.ok) {
          const { enhancedData } = await mapRes.json();
          data = { ...data, ...enhancedData };
        }
      } catch (e) {
        console.warn("smart‑mapping error – continuing with raw data", e);
      }

      // ----- low‑confidence detection (does not block UI) -------------------
      if (data.fieldConfidence) {
        Object.entries(data.fieldConfidence).forEach(
          ([field, rawInfo]: [string, unknown]) => {
            const confidence =
              typeof rawInfo === "object" && rawInfo !== null
                ? (rawInfo as { confidence?: number }).confidence
                : rawInfo;
            if (
              confidence !== undefined &&
              typeof confidence === "number" &&
              confidence < 0.7
            ) {
              setPendingConfirmation({
                field,
                value: (rawInfo as { value?: string })?.value ?? "",
                confidence,
                onConfirm: () => setPendingConfirmation(null),
                onEdit: (newVal) => {
                  setExtractedData((d) => setFieldValue(d, field, newVal));
                  setPendingConfirmation(null);
                },
              });
            }
          },
        );
      }

      setExtractedData(data);
      setCurrentStep("review");
    } catch (e) {
      console.error(e);
      setCurrentStep("upload");
    } finally {
      setIsProcessing(false);
    }
  };

  /* ---------- confidence / validation helpers ---------- */
  const getFieldConfidence = (
    fieldPath: string,
    data: ExtractedFinancialForm | null,
  ): number | null => {
    const info = data?.fieldConfidence?.[fieldPath];
    if (!info) return null;
    return typeof info === "object" && info !== null
      ? ((info as { confidence?: number }).confidence ?? null)
      : typeof info === "number"
        ? info
        : null;
  };

  const getValidationStatus = (
    fieldPath: string,
    validations: Record<string, ValidationResult>,
  ): ValidationResult | null => validations[fieldPath] ?? null;

  const handleFinancialSituationChange = (value: string) => {
    if (!extractedData) return;
    setExtractedData({ ...extractedData, financialSituationNote: value });
  };

  const handleApplicantIncomeChange = (
    idx: number,
    field: keyof ApplicantIncome,
    raw: string | number,
  ) => {
    const newArr = [...(extractedData?.applicantIncome ?? [])];
    newArr[idx] = { ...newArr[idx], [field]: raw };
    setExtractedData((d) => (d ? { ...d, applicantIncome: newArr } : d));
  };

  const handleHouseholdIncomeChange = (
    idx: number,
    field: keyof HouseholdIncome,
    raw: string | number,
  ) => {
    const newArr = [...(extractedData?.householdIncome ?? [])];
    newArr[idx] = { ...newArr[idx], [field]: raw };
    setExtractedData((d) => (d ? { ...d, householdIncome: newArr } : d));
  };

  const handleOtherIncomeChange = (
    idx: number,
    field: keyof OtherIncomeSource,
    raw: string | number,
  ) => {
    const newArr = [...(extractedData?.otherIncomeSources ?? [])];
    newArr[idx] = { ...newArr[idx], [field]: raw };
    setExtractedData((d) => (d ? { ...d, otherIncomeSources: newArr } : d));
  };

  /* ---------- row‑adding helpers (unchanged) ---------- */
  const addApplicantIncomeRow = () => {
    setExtractedData((d) =>
      d
        ? {
            ...d,
            applicantIncome: [
              ...(d.applicantIncome ?? []),
              {
                occupation: "",
                grossMonthlyIncomeSGD: 0,
                periodOfEmployment: "",
              },
            ],
          }
        : d,
    );
  };

  const addHouseholdIncomeRow = () => {
    setExtractedData((d) =>
      d
        ? {
            ...d,
            householdIncome: [
              ...(d.householdIncome ?? []),
              {
                name: "",
                relationshipToApplicant: "",
                occupation: "",
                grossMonthlyIncomeSGD: 0,
              },
            ],
          }
        : d,
    );
  };

  const addOtherIncomeRow = () => {
    setExtractedData((d) =>
      d
        ? {
            ...d,
            otherIncomeSources: [
              ...(d.otherIncomeSources ?? []),
              { description: "", amountSGD: 0 },
            ],
          }
        : d,
    );
  };

  /* -----------------------------------------------------------------
     VALIDATION BEFORE MOVING TO THE NEXT STEP
     ----------------------------------------------------------------- */
  const runAllValidations = async () => {
    if (!extractedData) return false;

    const validate = async (fieldPath: string, value: string) => {
      try {
        const res = await fetch("/api/validate-field", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fieldName: fieldPath, fieldValue: value }),
        });
        if (!res.ok) return;
        const validation = (await res.json()) as ValidationResult;
        setFieldValidations((v) => ({ ...v, [fieldPath]: validation }));

        if (!validation.isValid) {
          setPendingValidation({
            field: fieldPath,
            value,
            validationResult: validation,
            onAccept: () => setPendingValidation(null),
            onEdit: (newValue) => {
              setExtractedData((d) => setFieldValue(d, fieldPath, newValue));
              setPendingValidation(null);
            },
          });
        }
      } catch (e) {
        console.warn("validation error", e);
      }
    };

    // ---- financial note -------------------------------------------------
    if (extractedData.financialSituationNote) {
      await validate(
        "financialSituationNote",
        extractedData.financialSituationNote,
      );
    }

    // ---- applicant income ------------------------------------------------
    extractedData.applicantIncome?.forEach((inc, i) => {
      const base = `applicantIncome.${i}`;
      if (inc.occupation) validate(`${base}.occupation`, inc.occupation);
      if (inc.grossMonthlyIncomeSGD !== undefined)
        validate(
          `${base}.grossMonthlyIncomeSGD`,
          String(inc.grossMonthlyIncomeSGD),
        );
      if (inc.periodOfEmployment)
        validate(`${base}.periodOfEmployment`, inc.periodOfEmployment);
    });

    // ---- household income ------------------------------------------------
    extractedData.householdIncome?.forEach((inc, i) => {
      const base = `householdIncome.${i}`;
      if (inc.name) validate(`${base}.name`, inc.name);
      if (inc.relationshipToApplicant)
        validate(
          `${base}.relationshipToApplicant`,
          inc.relationshipToApplicant,
        );
      if (inc.occupation) validate(`${base}.occupation`, inc.occupation);
      if (inc.grossMonthlyIncomeSGD !== undefined)
        validate(
          `${base}.grossMonthlyIncomeSGD`,
          String(inc.grossMonthlyIncomeSGD),
        );
    });

    // ---- other income ----------------------------------------------------
    extractedData.otherIncomeSources?.forEach((inc, i) => {
      const base = `otherIncomeSources.${i}`;
      if (inc.description) validate(`${base}.description`, inc.description);
      if (inc.amountSGD !== undefined)
        validate(`${base}.amountSGD`, String(inc.amountSGD));
    });

    // Return true if **no** validation error was added.
    return Object.values(fieldValidations).every((v) => v.isValid);
  };

  const goToExportStep = async () => {
    await runAllValidations();

    // If a validation modal is now pending, stay on the review page.
    if (pendingValidation) return;

    setCurrentStep("export");
  };

  /* -----------------------------------------------------------------
     Export / Save (unchanged)
     ----------------------------------------------------------------- */
  const exportToCSV = async () => {
    if (!extractedData) return;

    const rows: string[][] = [
      ["Section", "Field", "Value"],
      [
        "Financial Situation",
        "Note",
        extractedData.financialSituationNote ?? "",
      ],
    ];

    extractedData.applicantIncome?.forEach((inc, i) => {
      rows.push([
        `Applicant Income ${i + 1}`,
        "Occupation",
        inc.occupation ?? "",
      ]);
      rows.push([
        `Applicant Income ${i + 1}`,
        "Monthly Income (SGD)",
        (inc.grossMonthlyIncomeSGD ?? 0).toString(),
      ]);
      rows.push([
        `Applicant Income ${i + 1}`,
        "Employment Period",
        inc.periodOfEmployment ?? "",
      ]);
    });

    extractedData.householdIncome?.forEach((inc, i) => {
      rows.push([`Household Income ${i + 1}`, "Name", inc.name ?? ""]);
      rows.push([
        `Household Income ${i + 1}`,
        "Relationship",
        inc.relationshipToApplicant ?? "",
      ]);
      rows.push([
        `Household Income ${i + 1}`,
        "Occupation",
        inc.occupation ?? "",
      ]);
      rows.push([
        `Household Income ${i + 1}`,
        "Monthly Income (SGD)",
        (inc.grossMonthlyIncomeSGD ?? 0).toString(),
      ]);
    });

    extractedData.otherIncomeSources?.forEach((inc, i) => {
      rows.push([
        `Other Income ${i + 1}`,
        "Description",
        inc.description ?? "",
      ]);
      rows.push([
        `Other Income ${i + 1}`,
        "Amount (SGD)",
        (inc.amountSGD ?? 0).toString(),
      ]);
    });

    rows.push(["Metadata", "Flags", extractedData.flags.join("; ")]);
    rows.push([
      "Metadata",
      "Confidence Score",
      extractedData.confidence.toString(),
    ]);

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial_form_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveToDatabase = async () => {
    if (!extractedData) return;
    const res = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(extractedData),
    });
    if (res.ok) {
      alert("Financial form saved successfully!");
      setCurrentStep("export");
    } else {
      alert("Failed to save the form.");
    }
  };

  const resetDemo = () => {
    setFile(null);
    setImagePreview(null);
    setExtractedData(null);
    setCurrentStep("upload");
    setFieldValidations({});
    setPendingConfirmation(null);
    setPendingValidation(null);
  };

  /* -----------------------------------------------------------------
     Re‑usable field wrapper (shows confidence & validation UI)
     ----------------------------------------------------------------- */
  type FieldWrapperProps = {
    path: string;
    label: string;
    children: React.ReactNode;
    extra?: React.ReactNode;
  };

  function FieldWrapper({ path, label, children, extra }: FieldWrapperProps) {
    const confidence = getFieldConfidence(path, extractedData);
    const validation = getValidationStatus(path, fieldValidations);
    const lowConfidence = confidence !== null && confidence < 0.6;
    const hasError = (validation && !validation.isValid) || lowConfidence;

    const badgeBg =
      confidence !== null
        ? confidence > 0.8
          ? "bg-green-100 text-green-800"
          : confidence > 0.6
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
        : "bg-gray-100 text-gray-800";

    return (
      <div className="mb-4">
        <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <span>{label}</span>
          {confidence !== null && (
            <span
              className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${badgeBg}`}
            >
              {Math.round(confidence * 100)}%
            </span>
          )}
          {extra}
        </div>

        <div className={`relative ${hasError ? "ring-2 ring-red-500" : ""}`}>
          {children}
          {hasError && (
            <div className="absolute left-0 top-full mt-1 w-max max-w-xs bg-red-600 text-white text-xs rounded py-1 px-2 z-10">
              {lowConfidence && <p>Low confidence</p>}
              {validation && !validation.isValid && (
                <div className="mt-1 space-y-1">
                  {validation.flags?.map((f) => (
                    <p key={`validation-flag-${f}`}>⚠️ {f}</p>
                  ))}
                  {validation.suggestions?.length > 0 && (
                    <p className="mt-1 text-blue-200">
                      Suggestion: {validation.suggestions.join(", ")}
                    </p>
                  )}
                </div>
              )}
              <div className="absolute left-2 -top-1 w-0 h-0 border-8 border-transparent border-b-red-600" />
            </div>
          )}
        </div>
      </div>
    );
  }

  /* -----------------------------------------------------------------
     Render
     ----------------------------------------------------------------- */
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* ------------------- Header ------------------- */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Financial Form Demo
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Upload a handwritten financial form and watch our AI extract
          structured income data in real‑time.
        </p>
      </div>

      {/* ------------------- Step indicator ------------------- */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center space-x-4">
          {["upload", "processing", "review", "export"].map((step, i) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === step
                    ? "bg-blue-600 text-white"
                    : i <
                        ["upload", "processing", "review", "export"].indexOf(
                          currentStep,
                        )
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && <div className="w-16 h-1 bg-gray-200 mx-2"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* ==================== UPLOAD ==================== */}
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
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
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
                    PDF, PNG, JPG up to 10 MB
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              {/* image preview */}
              {imagePreview && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Image preview</h3>
                  <div className="flex justify-center">
                    <Image
                      src={imagePreview}
                      alt="Uploaded financial form"
                      width={800}
                      height={600}
                      className="max-w-full max-h-96 object-contain border rounded shadow"
                    />
                  </div>
                </div>
              )}

              {/* file card */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setImagePreview(null);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={handleExtract}
                      disabled={isProcessing}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      {isProcessing ? "Processing…" : "Extract Financial Data"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== PROCESSING ==================== */}
      {currentStep === "processing" && (
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-6">
            2. Processing Financial Form
          </h2>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">
            Our AI is analysing the form and extracting income data…
          </p>
        </div>
      )}

      {/* ==================== REVIEW ==================== */}
      {currentStep === "review" && extractedData && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          {/* header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              3. Review &amp; Edit Financial Data
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

          {/* flags */}
          {extractedData.flags.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Flagged for Review
              </h3>
              <ul className="list-disc list-inside text-sm text-yellow-700">
                {extractedData.flags.map((f) => (
                  <li key={`extracted-flag-${f}`}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ---------- form fields ---------- */}
          <div className="space-y-8">
            {/* financial note */}
            <FieldWrapper
              path="financialSituationNote"
              label="Financial Situation Note"
            >
              <textarea
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional notes about the financial situation…"
                value={extractedData.financialSituationNote ?? ""}
                onChange={(e) => handleFinancialSituationChange(e.target.value)}
              />
            </FieldWrapper>

            {/* applicant income */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Applicant Income</h3>
                <button
                  type="button"
                  onClick={addApplicantIncomeRow}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Add Row
                </button>
              </div>

              {(!extractedData.applicantIncome ||
                extractedData.applicantIncome.length === 0) && (
                <p className="text-gray-500 text-sm mb-4">
                  No applicant‑income data extracted. Click “Add Row” to
                  manually add entries.
                </p>
              )}

              {extractedData.applicantIncome?.map((inc, i) => (
                <div
                  key={`applicant-income-${i}-${inc.occupation || "unknown"}`}
                  className="grid md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded"
                >
                  <FieldWrapper
                    path={`applicantIncome.${i}.occupation`}
                    label="Occupation"
                  >
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={inc.occupation ?? ""}
                      onChange={(e) =>
                        handleApplicantIncomeChange(
                          i,
                          "occupation",
                          e.target.value,
                        )
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper
                    path={`applicantIncome.${i}.grossMonthlyIncomeSGD`}
                    label="Monthly Income (SGD)"
                  >
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={inc.grossMonthlyIncomeSGD ?? 0}
                      onChange={(e) =>
                        handleApplicantIncomeChange(
                          i,
                          "grossMonthlyIncomeSGD",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper
                    path={`applicantIncome.${i}.periodOfEmployment`}
                    label="Employment Period"
                  >
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={inc.periodOfEmployment ?? ""}
                      onChange={(e) =>
                        handleApplicantIncomeChange(
                          i,
                          "periodOfEmployment",
                          e.target.value,
                        )
                      }
                    />
                  </FieldWrapper>
                </div>
              ))}
            </div>

            {/* household income */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Household Income</h3>
                <button
                  type="button"
                  onClick={addHouseholdIncomeRow}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Add Row
                </button>
              </div>

              {(!extractedData.householdIncome ||
                extractedData.householdIncome.length === 0) && (
                <p className="text-gray-500 text-sm mb-4">
                  No household‑income data extracted. Click “Add Row” to
                  manually add entries.
                </p>
              )}

              {extractedData.householdIncome?.map((inc, i) => (
                <div
                  key={`household-income-${i}-${inc.name || "unknown"}`}
                  className="grid md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded"
                >
                  <FieldWrapper path={`householdIncome.${i}.name`} label="Name">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={inc.name ?? ""}
                      onChange={(e) =>
                        handleHouseholdIncomeChange(i, "name", e.target.value)
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper
                    path={`householdIncome.${i}.relationshipToApplicant`}
                    label="Relationship"
                  >
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={inc.relationshipToApplicant ?? ""}
                      onChange={(e) =>
                        handleHouseholdIncomeChange(
                          i,
                          "relationshipToApplicant",
                          e.target.value,
                        )
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper
                    path={`householdIncome.${i}.occupation`}
                    label="Occupation"
                  >
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={inc.occupation ?? ""}
                      onChange={(e) =>
                        handleHouseholdIncomeChange(
                          i,
                          "occupation",
                          e.target.value,
                        )
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper
                    path={`householdIncome.${i}.grossMonthlyIncomeSGD`}
                    label="Monthly Income (SGD)"
                  >
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={inc.grossMonthlyIncomeSGD ?? 0}
                      onChange={(e) =>
                        handleHouseholdIncomeChange(
                          i,
                          "grossMonthlyIncomeSGD",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </FieldWrapper>
                </div>
              ))}
            </div>

            {/* other income */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Other Income Sources</h3>
                <button
                  type="button"
                  onClick={addOtherIncomeRow}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Add Row
                </button>
              </div>

              {(!extractedData.otherIncomeSources ||
                extractedData.otherIncomeSources.length === 0) && (
                <p className="text-gray-500 text-sm mb-4">
                  No other‑income data extracted. Click “Add Row” to manually
                  add entries.
                </p>
              )}

              {extractedData.otherIncomeSources?.map((inc, i) => (
                <div
                  key={`other-income-${i}-${inc.description || "unknown"}`}
                  className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded"
                >
                  <FieldWrapper
                    path={`otherIncomeSources.${i}.description`}
                    label="Description"
                  >
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={inc.description ?? ""}
                      onChange={(e) =>
                        handleOtherIncomeChange(
                          i,
                          "description",
                          e.target.value,
                        )
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper
                    path={`otherIncomeSources.${i}.amountSGD`}
                    label="Amount (SGD)"
                  >
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={inc.amountSGD ?? 0}
                      onChange={(e) =>
                        handleOtherIncomeChange(
                          i,
                          "amountSGD",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </FieldWrapper>
                </div>
              ))}
            </div>
          </div>

          {/* navigation buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={goToExportStep}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Continue to Export
            </button>
            <button
              type="button"
              onClick={resetDemo}
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold"
            >
              Start Over
            </button>
          </div>

          {/* ---------- test‑data & debug sections (unchanged) ---------- */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
            <h4 className="text-sm font-semibold text-blue-800 mb-3">
              Test: Create Low Confidence Data
            </h4>
            <button
              type="button"
              onClick={() => {
                const testData: ExtractedFinancialForm = {
                  flags: ["test_flag"],
                  confidence: 0.4,
                  status: "pending_review",
                  requiredFields: [],
                  missingMandatoryFields: [],
                  financialSituationNote: "Test situation",
                  applicantIncome: [
                    {
                      occupation: "Test Occupation",
                      grossMonthlyIncomeSGD: 1000,
                      periodOfEmployment: "6 months",
                    },
                  ],
                  fieldConfidence: {
                    financialSituationNote: {
                      value: "Test situation",
                      confidence: 0.4,
                      source: "ocr",
                      flags: ["unclear_handwriting"],
                      originalText: "Test situation",
                    },
                    "applicantIncome.0.occupation": {
                      value: "Test Occupation",
                      confidence: 0.3,
                      source: "ocr",
                      flags: ["low_confidence"],
                      originalText: "Test Occupation",
                    },
                  },
                };
                setExtractedData(testData);
                setCurrentStep("review");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              Load Test Data with Low Confidence
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
            <h4 className="text-sm font-semibold text-yellow-800 mb-3">
              Debug: Test Modals
            </h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPendingConfirmation({
                    field: "test.field",
                    value: "Test Value",
                    confidence: 0.5,
                    onConfirm: () => setPendingConfirmation(null),
                    onEdit: () => setPendingConfirmation(null),
                  });
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
              >
                Test Confirmation Modal
              </button>

              <button
                type="button"
                onClick={() => {
                  setPendingValidation({
                    field: "test.validation.field",
                    value: "Invalid Value",
                    validationResult: {
                      isValid: false,
                      standardizedValue: "",
                      confidence: 0.3,
                      flags: ["invalid_format", "missing_required_data"],
                      suggestions: [
                        "Try format: YYYY-MM-DD",
                        "Include all required fields",
                      ],
                      requiresReview: true,
                    },
                    onAccept: () => setPendingValidation(null),
                    onEdit: () => setPendingValidation(null),
                  });
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Test Validation Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EXPORT ==================== */}
      {currentStep === "export" && extractedData && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">
            4. Export or Save Financial Data
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* CSV */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Download CSV
              </h3>
              <p className="text-blue-700 mb-4">
                Export the financial data as a CSV file for use in spreadsheets
                or other systems.
              </p>
              <button
                type="button"
                onClick={exportToCSV}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold w-full"
              >
                Download CSV
              </button>
            </div>

            {/* DB save */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-4">
                Save to Database
              </h3>
              <p className="text-green-700 mb-4">
                Save directly to the case‑management system for immediate access
                by staff.
              </p>
              <button
                type="button"
                onClick={saveToDatabase}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold w-full"
              >
                Save Data to Database
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={resetDemo}
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg font-semibold"
            >
              Process Another Form
            </button>
          </div>
        </div>
      )}

      {/* --------------------- Modals --------------------- */}
      <ValidationModals
        pendingConfirmation={pendingConfirmation}
        pendingValidation={
          pendingValidation
            ? {
                field: pendingValidation.field,
                value: pendingValidation.value,
                validationResult: {
                  isValid: pendingValidation.validationResult.isValid,
                  issues: pendingValidation.validationResult.flags || [],
                  suggestions:
                    pendingValidation.validationResult.suggestions || [],
                },
                onAccept: pendingValidation.onAccept,
                onEdit: pendingValidation.onEdit,
              }
            : null
        }
        onCloseConfirmation={() => setPendingConfirmation(null)}
        onCloseValidation={() => setPendingValidation(null)}
      />
    </div>
  );
}
