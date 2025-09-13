// smu-legal-tech/src/app/(marketing)/demo/utils.ts
import type { ExtractedFinancialForm, ValidationResult } from "./types";

/* --------------------------------------------------------------- */
/*  Helper – shallow copy + path‑setter                              */
/* --------------------------------------------------------------- */
export const setFieldValue = (
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
/*  Confidence and validation helpers                              */
/* --------------------------------------------------------------- */
export const getFieldConfidence = (
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

export const getValidationStatus = (
  fieldPath: string,
  validations: Record<string, ValidationResult>,
): ValidationResult | null => validations[fieldPath] ?? null;

/* --------------------------------------------------------------- */
/*  Field display name helper                                      */
/* --------------------------------------------------------------- */
export const getFieldDisplayName = (fieldPath: string): string => {
  const pathParts = fieldPath.split(".");

  if (fieldPath === "financialSituationNote") {
    return "Financial Situation Note";
  }

  if (fieldPath.startsWith("applicantIncome.")) {
    const index = parseInt(pathParts[1]) + 1;
    const field = pathParts[2];
    const fieldName =
      field === "occupation"
        ? "Occupation"
        : field === "grossMonthlyIncomeSGD"
          ? "Monthly Income"
          : field === "periodOfEmployment"
            ? "Employment Period"
            : field;
    return `Applicant Income ${index} - ${fieldName}`;
  }

  if (fieldPath.startsWith("householdIncome.")) {
    const index = parseInt(pathParts[1]) + 1;
    const field = pathParts[2];
    const fieldName =
      field === "name"
        ? "Name"
        : field === "relationshipToApplicant"
          ? "Relationship"
          : field === "occupation"
            ? "Occupation"
            : field === "grossMonthlyIncomeSGD"
              ? "Monthly Income"
              : field;
    return `Household Income ${index} - ${fieldName}`;
  }

  if (fieldPath.startsWith("otherIncomeSources.")) {
    const index = parseInt(pathParts[1]) + 1;
    const field = pathParts[2];
    const fieldName =
      field === "description"
        ? "Description"
        : field === "amountSGD"
          ? "Amount"
          : field;
    return `Other Income ${index} - ${fieldName}`;
  }

  return fieldPath;
};
