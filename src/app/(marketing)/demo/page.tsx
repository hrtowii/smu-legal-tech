// smu-legal-tech/src/app/(marketing)/demo/page.tsx
"use client";

import React, { useState } from "react";
import type {
  ApplicantIncome,
  HouseholdIncome,
  OtherIncomeSource,
  EnhancedFinancialForm,
  ValidationResult,
} from "../../api/data";
import { ValidationModals } from "../../../components/validation-modals";
import { UploadStep } from "../../../components/UploadStep";
import { ProcessingStep } from "../../../components/ProcessingStep";
import { ReviewStep } from "../../../components/ReviewStep";
import { ExportStep } from "../../../components/ExportStep";
import type {
  ExtractedFinancialForm,
  Step,
  PendingConfirmation,
  PendingValidation,
} from "./types";
import { setFieldValue } from "./utils";
import { runAllValidations } from "./validations";

export default function Demo() {
  /* ---------- state ---------- */
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] =
    useState<ExtractedFinancialForm | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("upload");

  // validation helpers
  const [fieldValidations, setFieldValidations] = useState<
    Record<string, ValidationResult>
  >({});
  const [isValidating, setIsValidating] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);
  const [pendingValidation, setPendingValidation] =
    useState<PendingValidation | null>(null);

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

  const goToExportStep = async () => {
    setIsValidating(true);

    try {
      const validationsPassed = await runAllValidations(
        extractedData,
        setFieldValidations,
        setPendingValidation,
        setExtractedData,
      );

      // Wait a brief moment for state to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // If a validation modal is now pending, stay on the review page.
      if (pendingValidation) {
        console.log("Validation modal pending, staying on review page");
        return;
      }

      if (!validationsPassed) {
        console.log("Validation failed, staying on review page");
        return;
      }

      console.log("All validations passed, proceeding to export");
      setCurrentStep("export");
    } finally {
      setIsValidating(false);
    }
  };

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
        "Gross Monthly Income (SGD)",
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
        "Gross Monthly Income (SGD)",
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
     Render
     ----------------------------------------------------------------- */
  return (
    <div className="container mx-auto py-8">
      {/* ------------------- Header ------------------- */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-6">Financial Form Demo</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
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
                    ? "bg-primary text-primary-foreground"
                    : i <
                        ["upload", "processing", "review", "export"].indexOf(
                          currentStep,
                        )
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && <div className="w-16 h-1 bg-muted mx-2"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* ==================== UPLOAD ==================== */}
      {currentStep === "upload" && (
        <UploadStep
          file={file}
          imagePreview={imagePreview}
          isProcessing={isProcessing}
          onFileUpload={handleFileUpload}
          onExtract={handleExtract}
          onRemove={() => {
            setFile(null);
            setImagePreview(null);
          }}
        />
      )}

      {/* ==================== PROCESSING ==================== */}
      {currentStep === "processing" && <ProcessingStep />}

      {/* ==================== REVIEW ==================== */}
      {currentStep === "review" && (
        <ReviewStep
          extractedData={extractedData}
          fieldValidations={fieldValidations}
          onFinancialSituationChange={handleFinancialSituationChange}
          onApplicantIncomeChange={handleApplicantIncomeChange}
          onHouseholdIncomeChange={handleHouseholdIncomeChange}
          onOtherIncomeChange={handleOtherIncomeChange}
          addApplicantIncomeRow={addApplicantIncomeRow}
          addHouseholdIncomeRow={addHouseholdIncomeRow}
          addOtherIncomeRow={addOtherIncomeRow}
          onGoToExport={goToExportStep}
          isValidating={isValidating}
          onResetDemo={resetDemo}
          onContinueAnyway={() => setCurrentStep("export")}
        />
      )}

      {/* ==================== EXPORT ==================== */}
      {currentStep === "export" && (
        <ExportStep
          extractedData={extractedData}
          onExportToCSV={exportToCSV}
          onSaveToDatabase={saveToDatabase}
          onResetDemo={resetDemo}
        />
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
