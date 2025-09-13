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

// The entire extracted form
export interface FinancialForm {
  applicantIncome?: ApplicantIncome[]; // Up to 3 rows
  householdIncome?: HouseholdIncome[]; // Up to 5 rows
  otherIncomeSources?: OtherIncomeSource[]; // Variable length
  financialSituationNote?: string; // Optional free text
}
