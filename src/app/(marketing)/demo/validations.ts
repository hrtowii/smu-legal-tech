// smu-legal-tech/src/app/(marketing)/demo/validations.ts
import type {
  ApplicantIncome,
  HouseholdIncome,
  OtherIncomeSource,
  ValidationResult,
} from "../../api/data";
import type { ExtractedFinancialForm } from "./types";
import { setFieldValue } from "./utils";

export async function runAllValidations(
  extractedData: ExtractedFinancialForm | null,
  setFieldValidations: (
    fn: (
      prev: Record<string, ValidationResult>,
    ) => Record<string, ValidationResult>,
  ) => void,
  setPendingValidation: (
    pending: {
      field: string;
      value: string;
      validationResult: ValidationResult;
      onAccept: () => void;
      onEdit: (newValue: string) => void;
    } | null,
  ) => void,
  setExtractedData: (
    fn: (prev: ExtractedFinancialForm | null) => ExtractedFinancialForm | null,
  ) => void,
): Promise<boolean> {
  if (!extractedData) return true; // No data to validate, allow progression

  const validationResults: { [key: string]: boolean } = {};
  let hasValidationError = false;

  const validate = async (fieldPath: string, value: string) => {
    try {
      const res = await fetch("/api/validate-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldName: fieldPath, fieldValue: value }),
      });
      if (!res.ok) {
        validationResults[fieldPath] = false;
        return false;
      }
      const validation = (await res.json()) as ValidationResult;
      setFieldValidations((v) => ({ ...v, [fieldPath]: validation }));

      if (!validation.isValid) {
        validationResults[fieldPath] = false;
        hasValidationError = true;
        setPendingValidation({
          field: fieldPath,
          value,
          validationResult: validation,
          onAccept: () => setPendingValidation(null),
          onEdit: (newVal) => {
            setExtractedData((d) => setFieldValue(d, fieldPath, newVal));
            setPendingValidation(null);
          },
        });
        return false;
      }
      validationResults[fieldPath] = true;
      return true;
    } catch (e) {
      console.warn("validation error", e);
      validationResults[fieldPath] = false;
      return false;
    }
  };

  const validationPromises = [
    // financial note
    ...(extractedData.financialSituationNote
      ? [
          validate(
            "financialSituationNote",
            extractedData.financialSituationNote,
          ),
        ]
      : []),

    // applicant income
    ...(extractedData.applicantIncome?.flatMap((inc, i) => {
      const base = `applicantIncome.${i}`;
      return [
        ...(inc.occupation
          ? [validate(`${base}.occupation`, inc.occupation)]
          : []),
        ...(inc.grossMonthlyIncomeSGD !== undefined
          ? [
              validate(
                `${base}.grossMonthlyIncomeSGD`,
                String(inc.grossMonthlyIncomeSGD),
              ),
            ]
          : []),
        ...(inc.periodOfEmployment
          ? [validate(`${base}.periodOfEmployment`, inc.periodOfEmployment)]
          : []),
      ];
    }) || []),

    // household income
    ...(extractedData.householdIncome?.flatMap((inc, i) => {
      const base = `householdIncome.${i}`;
      return [
        ...(inc.name ? [validate(`${base}.name`, inc.name)] : []),
        ...(inc.relationshipToApplicant
          ? [
              validate(
                `${base}.relationshipToApplicant`,
                inc.relationshipToApplicant,
              ),
            ]
          : []),
        ...(inc.occupation
          ? [validate(`${base}.occupation`, inc.occupation)]
          : []),
        ...(inc.grossMonthlyIncomeSGD !== undefined
          ? [
              validate(
                `${base}.grossMonthlyIncomeSGD`,
                String(inc.grossMonthlyIncomeSGD),
              ),
            ]
          : []),
      ];
    }) || []),

    // other income
    ...(extractedData.otherIncomeSources?.flatMap((inc, i) => {
      const base = `otherIncomeSources.${i}`;
      return [
        ...(inc.description
          ? [validate(`${base}.description`, inc.description)]
          : []),
        ...(inc.amountSGD !== undefined
          ? [validate(`${base}.amountSGD`, String(inc.amountSGD))]
          : []),
      ];
    }) || []),
  ];

  await Promise.all(validationPromises);

  // Return true only if no validation errors were found
  return !hasValidationError;
}
