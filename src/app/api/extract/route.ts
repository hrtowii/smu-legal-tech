import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  // baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://smu-legal-tech.vercel.app",
    "X-Title": "SMU Legal Tech - Financial Form Extractor",
  },
});

// Zod schemas based on the FinancialForm interface
const ApplicantIncomeSchema = z.object({
  occupation: z
    .string()
    .nullable()
    .optional()
    .describe("Occupation or job title"),
  grossMonthlyIncomeSGD: z
    .number()
    .nullable()
    .optional()
    .describe("Gross monthly income in Singapore Dollars"),
  periodOfEmployment: z
    .string()
    .nullable()
    .optional()
    .describe("Period of employment (e.g., 'Apr 2022 - Dec 2022')"),
});

const HouseholdIncomeSchema = z.object({
  name: z.string().nullable().optional().describe("Name of household member"),
  relationshipToApplicant: z
    .string()
    .nullable()
    .optional()
    .describe("Relationship to applicant (e.g., 'Father', 'Mother')"),
  occupation: z
    .string()
    .nullable()
    .optional()
    .describe("Occupation of household member"),
  grossMonthlyIncomeSGD: z
    .number()
    .nullable()
    .optional()
    .describe("Gross monthly income in Singapore Dollars"),
});

const OtherIncomeSourceSchema = z.object({
  description: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Description of income source (e.g., 'Rental income', 'CPF payouts')",
    ),
  amountSGD: z
    .number()
    .nullable()
    .optional()
    .describe("Amount in Singapore Dollars"),
});

const ExtractedFinancialFormSchema = z.object({
  applicantIncome: z
    .array(ApplicantIncomeSchema)
    .optional()
    .describe("Array of applicant income sources (up to 3 rows)"),
  householdIncome: z
    .array(HouseholdIncomeSchema)
    .optional()
    .describe("Array of household income sources (up to 5 rows)"),
  otherIncomeSources: z
    .array(OtherIncomeSourceSchema)
    .optional()
    .describe("Array of other income sources"),
  financialSituationNote: z
    .string()
    .optional()
    .describe("Optional free text about financial situation"),
  flags: z
    .array(z.string())
    .describe(
      "Issues requiring human review (unclear handwriting, missing info, inconsistent data, etc.)",
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Overall confidence score of the extraction (0-1)"),
  confidence_per_field: z.record(z.string(), z.number()).optional(),
  source_per_field: z.record(z.string(), z.string()).optional(),
});

// Manual JSON Schema definition as fallback
const jsonSchema = {
  type: "object",
  properties: {
    applicantIncome: {
      type: "array",
      items: {
        type: "object",
        properties: {
          occupation: { type: "string", nullable: true },
          grossMonthlyIncomeSGD: { type: "number", nullable: true },
          periodOfEmployment: { type: "string", nullable: true },
        },
        additionalProperties: false,
      },
    },
    householdIncome: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", nullable: true },
          relationshipToApplicant: { type: "string", nullable: true },
          occupation: { type: "string", nullable: true },
          grossMonthlyIncomeSGD: { type: "number", nullable: true },
        },
        additionalProperties: false,
      },
    },
    otherIncomeSources: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: { type: "string", nullable: true },
          amountSGD: { type: "number", nullable: true },
        },
        additionalProperties: false,
      },
    },
    financialSituationNote: { type: "string" },
    flags: {
      type: "array",
      items: { type: "string" },
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
  },
  required: ["flags", "confidence"],
  additionalProperties: false,
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64 for image processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = file.type;

    // Create the data URL for the image
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    // Use OpenAI Vision API with structured outputs
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert financial form data extraction system. You MUST respond with valid JSON that exactly matches the provided schema structure. Do not add extra fields or change field names. Always return a complete JSON object even if some data is missing.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this handwritten/scanned financial declaration form image and extract structured financial data.

CRITICAL: You MUST respond with a JSON object in this EXACT structure (copy exactly):
{
  "applicantIncome": [
    {
      "occupation": "string or null",
      "grossMonthlyIncomeSGD": number or null,
      "periodOfEmployment": "string or null"
    }
  ],
  "householdIncome": [
    {
      "name": "string or null",
      "relationshipToApplicant": "string or null",
      "occupation": "string or null",
      "grossMonthlyIncomeSGD": number or null
    }
  ],
  "otherIncomeSources": [
    {
      "description": "string or null",
      "amountSGD": number or null
    }
  ],
  "financialSituationNote": "string or empty string",
  "flags": ["array", "of", "issue", "strings"],
  "confidence": 0.85
}

EXTRACTED DATA REQUIREMENTS:
1. APPLICANT INCOME (applicantIncome array):
   - Extract applicant's own income sources from relevant sections
   - occupation: Job title/profession (e.g., "Software Engineer", "Freelancer")
   - grossMonthlyIncomeSGD: Monthly income as NUMBER (remove $, SGD, commas, e.g., "2,500" → 2500)
   - periodOfEmployment: Employment period (e.g., "Jan 2022 - Present", "Mar 2021 - Dec 2021")
   - Create one object per income source/row
   - Use null for missing values, never omit fields

2. HOUSEHOLD INCOME (householdIncome array):
   - Extract family/household members' income from relevant sections
   - name: Full name of household member
   - relationshipToApplicant: Relationship (e.g., "Father", "Mother", "Spouse", "Sibling")
   - occupation: Their job title/profession
   - grossMonthlyIncomeSGD: Their monthly income as NUMBER
   - Create one object per household member/row
   - Use null for missing values

3. OTHER INCOME SOURCES (otherIncomeSources array):
   - Extract additional income like rental, CPF payouts, allowances, investments
   - description: Brief description (e.g., "Rental income from HDB", "CPF withdrawal", "Child allowance")
   - amountSGD: Amount as NUMBER (remove currency symbols)
   - Create one object per additional income source

4. FINANCIAL SITUATION NOTE:
   - Extract any free-text notes about financial hardship, circumstances, or explanations
   - If no notes found, use: "No additional financial situation information provided"

5. FLAGS ARRAY:
   - List extraction issues: "unclear handwriting", "missing data", "inconsistent information", "illegible text", "incomplete form"
   - Always include at least one flag if extraction quality is below 0.9

6. CONFIDENCE SCORE:
   - 1.0 = Perfectly clear and complete extraction
   - 0.8-0.9 = Mostly clear, minor issues
   - 0.5-0.7 = Significant handwriting issues but data mostly recoverable
   - 0.0-0.4 = Very unclear, major data loss

DATA PROCESSING RULES:
- Convert ALL monetary amounts to numbers: "$2,500" → 2500, "SGD 1,200" → 1200
- Keep names, occupations, descriptions as strings (preserve original text)
- Handle tables: Each row = one array object
- Common sections to look for: "Applicant Income", "Household Income", "Other Income", "Family Members", "Additional Income"
- If a field is blank/unreadable, use null (not empty string or undefined)
- Never return incomplete JSON objects - always include all required fields

IMPORTANT: The AI will validate your JSON against a strict schema. Any deviation from the exact structure will cause parsing errors. Always return complete, valid JSON.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ExtractedFinancialFormSchema",
          schema: jsonSchema,
        },
      },
      temperature: 0.1,
      max_tokens: 16384,
    });

    console.log("Raw AI response:", completion.choices[0].message.content);

    // Parse the JSON response manually since we're not using zodResponseFormat
    let extractedData: any;
    try {
      extractedData = JSON.parse(completion.choices[0].message.content || "{}");
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      throw new Error("Invalid JSON response from AI model");
    }

    // Validate against Zod schema
    const validationResult =
      ExtractedFinancialFormSchema.safeParse(extractedData);
    if (!validationResult.success) {
      console.error("Zod validation errors:", validationResult.error);
      // Continue with the raw data but add validation warnings to flags
      extractedData.flags = [
        ...(extractedData.flags || []),
        "Data validation warnings - manual review recommended",
      ];
    }

    // Handle potential refusal
    if (completion.choices[0].message.refusal) {
      return NextResponse.json({
        applicantIncome: [],
        householdIncome: [],
        otherIncomeSources: [],
        financialSituationNote:
          "Model refused to process - manual review required",
        flags: ["AI model refusal", "Manual review required"],
        confidence: 0.0,
      });
    }

    // Ensure required fields are present with defaults
    const validatedData = {
      applicantIncome: extractedData.applicantIncome || [],
      householdIncome: extractedData.householdIncome || [],
      otherIncomeSources: extractedData.otherIncomeSources || [],
      financialSituationNote: extractedData.financialSituationNote || "",
      flags: extractedData.flags || [],
      confidence: Math.max(0, Math.min(1, extractedData.confidence || 0.5)), // Ensure 0-1 range
    };

    return NextResponse.json(validatedData);
  } catch (error: any) {
    console.error("Financial form extraction error:", error);

    // Return a fallback response if AI extraction fails
    return NextResponse.json(
      {
        applicantIncome: [],
        householdIncome: [],
        otherIncomeSources: [],
        financialSituationNote:
          "Error processing form - manual review required",
        flags: ["AI extraction failed", "Manual review required"],
        confidence: 0.0,
      },
      { status: 500 },
    );
  }
}
