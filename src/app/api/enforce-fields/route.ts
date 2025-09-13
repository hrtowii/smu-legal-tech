import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://smu-legal-tech.vercel.app",
    "X-Title": "SMU Legal Tech - Mandatory Field Enforcement",
  },
});

// Define mandatory fields for different form types
const MANDATORY_FIELD_RULES = {
  financial_form: {
    applicantIncome: {
      required: ["occupation", "grossMonthlyIncomeSGD"],
      conditional: {
        periodOfEmployment: "required when employment is not current",
      },
    },
    householdIncome: {
      required: ["name", "relationshipToApplicant", "grossMonthlyIncomeSGD"],
      conditional: {
        occupation: "required for working-age adults",
      },
    },
    personal: {
      required: ["applicantName"],
      conditional: {
        nric: "required for Singapore citizens",
        passport: "required for non-citizens",
      },
    },
  },
};

// Field priorities for intelligent completion
const FIELD_PRIORITIES = {
  applicantName: 1,
  nric: 2,
  occupation: 3,
  grossMonthlyIncomeSGD: 4,
  relationshipToApplicant: 5,
  name: 6,
};

interface MissingField {
  fieldName: string;
  section: string;
  priority: number;
  reason: string;
  suggestions: string[];
  canInfer: boolean;
}

interface EnforcementResult {
  missingFields: MissingField[];
  canProceed: boolean;
  blockerFields: string[];
  suggestions: string[];
  inferredValues: Record<string, any>;
}

function analyzeMissingFields(
  formData: any,
  formType: string = "financial_form",
): MissingField[] {
  const missing: MissingField[] = [];
  const rules =
    MANDATORY_FIELD_RULES[formType as keyof typeof MANDATORY_FIELD_RULES];

  if (!rules) return missing;

  // Check applicant income fields
  if (formData.applicantIncome && formData.applicantIncome.length > 0) {
    formData.applicantIncome.forEach((income: any, index: number) => {
      rules.applicantIncome.required.forEach((field) => {
        if (!income[field] || income[field] === "") {
          missing.push({
            fieldName: `applicantIncome[${index}].${field}`,
            section: "applicantIncome",
            priority:
              FIELD_PRIORITIES[field as keyof typeof FIELD_PRIORITIES] || 10,
            reason: "Required field for applicant income",
            suggestions: getSuggestionsForField(field),
            canInfer: canInferField(field, formData),
          });
        }
      });
    });
  }

  // Check household income fields
  if (formData.householdIncome && formData.householdIncome.length > 0) {
    formData.householdIncome.forEach((income: any, index: number) => {
      rules.householdIncome.required.forEach((field) => {
        if (!income[field] || income[field] === "") {
          missing.push({
            fieldName: `householdIncome[${index}].${field}`,
            section: "householdIncome",
            priority:
              FIELD_PRIORITIES[field as keyof typeof FIELD_PRIORITIES] || 10,
            reason: "Required field for household member",
            suggestions: getSuggestionsForField(field),
            canInfer: canInferField(field, formData),
          });
        }
      });
    });
  }

  // Sort by priority (lower number = higher priority)
  return missing.sort((a, b) => a.priority - b.priority);
}

function getSuggestionsForField(fieldName: string): string[] {
  const suggestions: Record<string, string[]> = {
    occupation: [
      "Check if written elsewhere in the form",
      "Look for job title or profession",
      "Consider if applicant is unemployed or retired",
    ],
    grossMonthlyIncomeSGD: [
      "Look for salary information",
      "Check for hourly wage that can be calculated",
      "Consider if income is zero for unemployed",
    ],
    relationshipToApplicant: [
      "Common relationships: father, mother, spouse, child, sibling",
      "Check family section for clues",
      "Look at names for relationship hints",
    ],
    name: [
      "Check if full name is written elsewhere",
      "Look for initials that can be expanded",
      "Verify spelling of existing name",
    ],
  };

  return suggestions[fieldName] || ["Please fill in this required field"];
}

function canInferField(fieldName: string, _formData: any): boolean {
  // Logic to determine if we can infer missing values from context
  if (fieldName === "grossMonthlyIncomeSGD") {
    // Can infer zero income if marked as unemployed
    return true;
  }

  if (fieldName === "relationshipToApplicant") {
    // Can sometimes infer from context or names
    return false;
  }

  return false;
}

async function llmEnforceFields(
  formData: any,
  missingFields: MissingField[],
): Promise<EnforcementResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing financial forms and enforcing mandatory field requirements. Your job is to:

1. Analyze missing mandatory fields
2. Determine if the form can proceed or needs completion
3. Suggest how to fill missing fields from available context
4. Infer values where possible and appropriate

ENFORCEMENT RULES:
- Critical fields (name, income amounts) are blocking - form cannot proceed
- Context fields (relationships, occupations) can sometimes be inferred
- Look for information scattered across the form that could fill missing fields
- Consider if zero values are appropriate (e.g., unemployed = $0 income)
- Flag when human intervention is absolutely necessary

Return a JSON object with this exact structure:
{
  "canProceed": true/false,
  "blockerFields": ["array", "of", "critical", "missing", "fields"],
  "suggestions": ["array", "of", "actionable", "suggestions"],
  "inferredValues": {
    "fieldName": "inferred_value"
  }
}`,
        },
        {
          role: "user",
          content: `Analyze this form data and missing mandatory fields:

FORM DATA:
${JSON.stringify(formData, null, 2)}

MISSING FIELDS:
${missingFields.map((field) => `- ${field.fieldName}: ${field.reason}`).join("\n")}

Determine:
1. Can this form proceed to approval despite missing fields?
2. Which fields are absolute blockers?
3. What values can be safely inferred from context?
4. What specific actions should be taken?`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const result = JSON.parse(
      completion.choices[0].message.content ||
        '{"canProceed": false, "blockerFields": [], "suggestions": [], "inferredValues": {}}',
    );

    return {
      missingFields,
      canProceed: result.canProceed || false,
      blockerFields: result.blockerFields || [],
      suggestions: result.suggestions || [],
      inferredValues: result.inferredValues || {},
    };
  } catch (error) {
    console.error("LLM enforcement error:", error);

    // Fallback to conservative enforcement
    const criticalFields = missingFields.filter(
      (f) =>
        f.fieldName.includes("grossMonthlyIncomeSGD") ||
        f.fieldName.includes("name") ||
        f.fieldName.includes("occupation"),
    );

    return {
      missingFields,
      canProceed: criticalFields.length === 0,
      blockerFields: criticalFields.map((f) => f.fieldName),
      suggestions: ["Please complete all required fields before proceeding"],
      inferredValues: {},
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      formData,
      formType = "financial_form",
      strict = false,
    } = await request.json();

    if (!formData) {
      return NextResponse.json(
        { error: "formData is required" },
        { status: 400 },
      );
    }

    // Analyze missing mandatory fields
    const missingFields = analyzeMissingFields(formData, formType);

    if (missingFields.length === 0) {
      return NextResponse.json({
        missingFields: [],
        canProceed: true,
        blockerFields: [],
        suggestions: ["All mandatory fields are complete"],
        inferredValues: {},
        status: "complete",
      });
    }

    // In strict mode, any missing field blocks
    if (strict) {
      return NextResponse.json({
        missingFields,
        canProceed: false,
        blockerFields: missingFields.map((f) => f.fieldName),
        suggestions: ["All fields must be completed in strict mode"],
        inferredValues: {},
        status: "blocked",
      });
    }

    // Use LLM to make intelligent enforcement decisions
    const enforcementResult = await llmEnforceFields(formData, missingFields);

    return NextResponse.json({
      ...enforcementResult,
      status: enforcementResult.canProceed
        ? "conditional_approval"
        : "requires_completion",
    });
  } catch (error) {
    console.error("Mandatory field enforcement error:", error);
    return NextResponse.json(
      { error: "Failed to enforce mandatory fields" },
      { status: 500 },
    );
  }
}

// GET endpoint to retrieve mandatory field rules
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const formType = searchParams.get("formType") || "financial_form";

  return NextResponse.json({
    mandatoryFields:
      MANDATORY_FIELD_RULES[formType as keyof typeof MANDATORY_FIELD_RULES] ||
      {},
    fieldPriorities: FIELD_PRIORITIES,
    supportedFormTypes: Object.keys(MANDATORY_FIELD_RULES),
  });
}
