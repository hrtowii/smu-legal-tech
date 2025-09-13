import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ValidationResult } from "../data";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://smu-legal-tech.vercel.app",
    "X-Title": "SMU Legal Tech - Field Validation Service",
  },
});

// Define validation rules for different field types
const VALIDATION_RULES = {
  nric: {
    pattern: /^[STFG]\d{7}[A-Z]$/,
    message: "NRIC must be in format S1234567A",
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email format",
  },
  phone: {
    pattern: /^[689]\d{7}$/,
    message: "Phone number must be 8 digits starting with 6, 8, or 9",
  },
  postalCode: {
    pattern: /^\d{6}$/,
    message: "Postal code must be 6 digits",
  },
  income: {
    pattern: /^\d+(\.\d{1,2})?$/,
    message: "Income must be a valid number",
  },
  relationship: {
    allowedValues: [
      "father",
      "mother",
      "spouse",
      "sibling",
      "child",
      "partner",
      "other",
    ],
    message: "Must be a valid family relationship",
  },
};

// Define mandatory fields for different form sections
const MANDATORY_FIELDS = {
  applicantIncome: ["occupation", "grossMonthlyIncomeSGD"],
  householdIncome: ["name", "relationshipToApplicant", "grossMonthlyIncomeSGD"],
  otherIncomeSources: ["description", "amountSGD"],
  personal: ["applicantName", "nric"],
};

function validateFieldFormat(value: any, fieldType: string): ValidationResult {
  if (!value || value === "") {
    return {
      isValid: false,
      standardizedValue: value,
      confidence: 1.0,
      flags: ["empty_field"],
      suggestions: ["Field is required"],
      requiresReview: true,
    };
  }

  const rule = VALIDATION_RULES[fieldType as keyof typeof VALIDATION_RULES];

  if (!rule) {
    return {
      isValid: true,
      standardizedValue: value,
      confidence: 0.8,
      flags: [],
      suggestions: [],
      requiresReview: false,
    };
  }

  // Pattern-based validation
  if ("pattern" in rule) {
    const isValid = rule.pattern.test(String(value));
    return {
      isValid,
      standardizedValue: value,
      confidence: isValid ? 1.0 : 0.2,
      flags: isValid ? [] : ["format_error"],
      suggestions: isValid ? [] : [rule.message],
      requiresReview: !isValid,
    };
  }

  // Allowed values validation
  if ("allowedValues" in rule) {
    const normalizedValue = String(value).toLowerCase();
    const isValid = rule.allowedValues.some(
      (allowed) =>
        normalizedValue.includes(allowed) || allowed.includes(normalizedValue),
    );

    return {
      isValid,
      standardizedValue: value,
      confidence: isValid ? 0.9 : 0.3,
      flags: isValid ? [] : ["invalid_value"],
      suggestions: isValid
        ? []
        : [rule.message, `Allowed values: ${rule.allowedValues.join(", ")}`],
      requiresReview: !isValid,
    };
  }

  return {
    isValid: true,
    standardizedValue: value,
    confidence: 0.8,
    flags: [],
    suggestions: [],
    requiresReview: false,
  };
}

async function llmValidateField(
  value: any,
  fieldName: string,
  context?: string,
): Promise<ValidationResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at validating form field data for legal financial documents. Your job is to assess whether field values are valid, complete, and appropriate.

VALIDATION CRITERIA:
1. Completeness: Is the field properly filled?
2. Format: Is the format appropriate for the field type?
3. Consistency: Does it make sense in context?
4. Professional: Is it suitable for legal documentation?

FIELD TYPES TO VALIDATE:
- Names: Should be proper names, not nicknames
- Occupations: Should be professional job titles
- Income: Should be realistic numbers
- Relationships: Should be standard family relationships
- Dates: Should be valid date ranges
- Contact info: Should be properly formatted

Return a JSON object with this exact structure:
{
  "isValid": true/false,
  "confidence": 0.85,
  "flags": ["array", "of", "issues"],
  "suggestions": ["array", "of", "suggestions"],
  "standardizedValue": "corrected or standardized value",
  "requiresReview": true/false
}

FLAGS can include: "incomplete", "unclear", "format_error", "suspicious", "informal_language", "missing_context"
SUGGESTIONS should provide actionable feedback for improvement.`,
        },
        {
          role: "user",
          content: `Validate this field data:
Field Name: ${fieldName}
Value: "${value}"
${context ? `Context: ${context}` : ""}

Assess validity, suggest improvements, and determine if human review is needed.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 300,
    });

    const result = JSON.parse(
      completion.choices[0].message.content ||
        '{"isValid": false, "confidence": 0, "flags": ["validation_error"], "suggestions": ["Could not validate"], "standardizedValue": null, "requiresReview": true}',
    );

    return {
      isValid: result.isValid || false,
      standardizedValue: result.standardizedValue || value,
      confidence: Math.min(1, Math.max(0, result.confidence || 0)),
      flags: result.flags || [],
      suggestions: result.suggestions || [],
      requiresReview: result.requiresReview || false,
    };
  } catch (error) {
    console.error("LLM validation error:", error);
    return {
      isValid: false,
      standardizedValue: value,
      confidence: 0,
      flags: ["validation_error"],
      suggestions: ["Could not validate field"],
      requiresReview: true,
    };
  }
}

function checkMandatoryFields(data: any, section: string): string[] {
  const mandatoryFields =
    MANDATORY_FIELDS[section as keyof typeof MANDATORY_FIELDS] || [];
  const missing: string[] = [];

  if (section === "applicantIncome" && data.applicantIncome) {
    data.applicantIncome.forEach((income: any, index: number) => {
      mandatoryFields.forEach((field) => {
        if (!income[field] || income[field] === "") {
          missing.push(`applicantIncome[${index}].${field}`);
        }
      });
    });
  }

  if (section === "householdIncome" && data.householdIncome) {
    data.householdIncome.forEach((income: any, index: number) => {
      mandatoryFields.forEach((field) => {
        if (!income[field] || income[field] === "") {
          missing.push(`householdIncome[${index}].${field}`);
        }
      });
    });
  }

  return missing;
}

export async function POST(request: NextRequest) {
  try {
    const {
      fieldValue,
      fieldName,
      fieldType,
      context,
      useRulesOnly = false,
      formData,
      section,
    } = await request.json();

    // Validate required parameters
    if (fieldValue === undefined || !fieldName) {
      return NextResponse.json(
        { error: "fieldValue and fieldName are required" },
        { status: 400 },
      );
    }

    // First apply rule-based validation if fieldType is provided
    let ruleValidation: ValidationResult | null = null;
    if (fieldType) {
      ruleValidation = validateFieldFormat(fieldValue, fieldType);
    }

    // If rules-only mode or rule validation failed critically, return rule result
    if (
      useRulesOnly ||
      (ruleValidation &&
        !ruleValidation.isValid &&
        ruleValidation.confidence > 0.8)
    ) {
      const mandatoryCheck =
        section && formData ? checkMandatoryFields(formData, section) : [];

      return NextResponse.json({
        ...ruleValidation,
        method: "rules",
        missingMandatoryFields: mandatoryCheck,
      });
    }

    // Use LLM validation for more nuanced checking
    const llmValidation = await llmValidateField(
      fieldValue,
      fieldName,
      context,
    );

    // Combine rule and LLM validation results
    const combinedFlags = [
      ...(ruleValidation?.flags || []),
      ...llmValidation.flags,
    ];

    const combinedSuggestions = [
      ...(ruleValidation?.suggestions || []),
      ...llmValidation.suggestions,
    ];

    const finalConfidence = ruleValidation
      ? Math.min(ruleValidation.confidence, llmValidation.confidence)
      : llmValidation.confidence;

    const mandatoryCheck =
      section && formData ? checkMandatoryFields(formData, section) : [];

    return NextResponse.json({
      isValid: llmValidation.isValid && ruleValidation?.isValid !== false,
      standardizedValue: llmValidation.standardizedValue,
      confidence: finalConfidence,
      flags: [...new Set(combinedFlags)], // Remove duplicates
      suggestions: [...new Set(combinedSuggestions)],
      requiresReview:
        llmValidation.requiresReview || ruleValidation?.requiresReview,
      method: "combined",
      missingMandatoryFields: mandatoryCheck,
    });
  } catch (error) {
    console.error("Field validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate field" },
      { status: 500 },
    );
  }
}

// GET endpoint to retrieve validation rules and mandatory fields
export async function GET() {
  return NextResponse.json({
    validationRules: VALIDATION_RULES,
    mandatoryFields: MANDATORY_FIELDS,
    supportedFieldTypes: Object.keys(VALIDATION_RULES),
  });
}
