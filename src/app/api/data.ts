// Enhanced field types with confidence tracking
export interface FieldConfidence {
  value: any;
  confidence: number; // 0-1 score
  source: "ocr" | "llm_inference" | "user_input" | "standardized";
  flags: string[]; // Issues like "unclear handwriting", "informal language"
  alternatives?: any[]; // Alternative interpretations
  originalText?: string; // Raw OCR text before processing
}

export interface ValidationResult {
  isValid: boolean;
  standardizedValue: any;
  confidence: number;
  flags: string[];
  suggestions: string[];
  requiresReview: boolean;
}

// Language standardization mappings
export interface StandardizationRule {
  pattern: string | RegExp;
  standardValue: string;
  type: "exact" | "regex" | "similarity";
  confidence: number;
}

export interface ApplicantIncome {
  occupation?: string; // e.g. "Part-time cashier"
  grossMonthlyIncomeSGD?: number; // e.g. 1200
  periodOfEmployment?: string; // e.g. "Apr 2022 - Dec 2022"
}

// One row under "Household income"
export interface HouseholdIncome {
  name?: string; // e.g. "Tan Wei Ming"
  relationshipToApplicant?: string; // e.g. "Father"
  occupation?: string; // e.g. "Taxi Driver"
  grossMonthlyIncomeSGD?: number; // e.g. 2800
}

// Other income sources like rental, CPF, allowance, etc.
export interface OtherIncomeSource {
  description?: string; // e.g. "Rental income", "CPF payouts"
  amountSGD?: number; // e.g. 200
}

// Enhanced form with field-level confidence
export interface EnhancedFinancialForm {
  id?: number;
  applicantIncome?: ApplicantIncome[];
  householdIncome?: HouseholdIncome[];
  otherIncomeSources?: OtherIncomeSource[];
  financialSituationNote?: string;

  // Enhanced metadata
  fieldConfidence?: Record<string, FieldConfidence>;
  flags: string[];
  confidence: number;
  status: "pending_review" | "reviewed" | "approved" | "rejected";
  reviewerId?: string;
  reviewNotes?: string;
  review_notes?: string; // Database field name
  requiredFields: string[]; // Fields that must be filled
  missingMandatoryFields: string[];

  // Database timestamps
  created_at?: string;
  updated_at?: string;
}

// The entire extracted form (keeping original for backward compatibility)
export interface FinancialForm {
  applicantIncome?: ApplicantIncome[]; // Up to 3 rows
  householdIncome?: HouseholdIncome[]; // Up to 5 rows
  otherIncomeSources?: OtherIncomeSource[]; // Variable length
  financialSituationNote?: string; // Optional free text
}
