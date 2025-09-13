// smu-legal-tech/src/app/(marketing)/demo/types.ts
import type {
  ApplicantIncome,
  HouseholdIncome,
  OtherIncomeSource,
  EnhancedFinancialForm,
  ValidationResult,
} from "../../api/data";

export interface ExtractedFinancialForm extends EnhancedFinancialForm {
  flags: string[];
  confidence: number;
}

export type Step = "upload" | "processing" | "review" | "export";

export interface PendingConfirmation {
  field: string;
  value: string;
  confidence: number;
  onConfirm: () => void;
  onEdit: (newValue: string) => void;
}

export interface PendingValidation {
  field: string;
  value: string;
  validationResult: ValidationResult;
  onAccept: () => void;
  onEdit: (newValue: string) => void;
}
