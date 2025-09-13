// ──────────────────────────────────────────────────────────────────────
//  app/api/smart-mapping/route.ts
// ─────────────────────────────────────────────────────────────────────-
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://smu-legal-tech.vercel.app",
    "X-Title": "SMU Legal Tech - Smart Field Mapping Service",
  },
});

/// -----------------------
// Zod schemas for the LLM response
// -----------------------
const FieldMappingSchema = z.object({
  fieldName: z.string(),
  extractedText: z.string(),
  confidence: z.number().min(0).max(1),
});

const MappingResultSchema = z.object({
  mappings: z.array(FieldMappingSchema),
  unmappedText: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

/// -----------------------
// JSON‑schema version for the OpenAI request
// (OpenAI wants a plain JSON‑Schema, not a Zod object)
/// -----------------------
const mappingJsonSchema = {
  type: "object",
  properties: {
    mappings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          fieldName: { type: "string" },
          extractedText: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["fieldName", "extractedText", "confidence"],
        additionalProperties: false,
      },
    },
    unmappedText: {
      type: "array",
      items: { type: "string" },
    },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["mappings", "unmappedText", "confidence"],
  additionalProperties: false,
};

/// -----------------------
// Expected field categories (unchanged)
// -----------------------
const EXPECTED_FIELDS = {
  applicantIncome: [
    "occupation",
    "grossMonthlyIncomeSGD",
    "periodOfEmployment",
  ],
  householdIncome: [
    "name",
    "relationshipToApplicant",
    "occupation",
    "grossMonthlyIncomeSGD",
  ],
  otherIncomeSources: ["description", "amountSGD"],
  personal: ["applicantName", "nric", "address", "phoneNumber", "email"],
  financial: [
    "financialSituationNote",
    "totalHouseholdIncome",
    "monthlyExpenses",
  ],
};

/// -----------------------
// Core mapping function – now uses Zod parsing
// -----------------------
async function mapTextToFields(
  extractedTexts: string[],
  formType: string = "financial",
): Promise<{
  mappings: FieldMapping[];
  unmappedText: string[];
  confidence: number;
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at mapping extracted text fragments to appropriate form fields. Your job is to intelligently assign scattered or cross‑boundary text to the correct field categories.
EXPECTED FIELD TYPES:
- Applicant Income: occupation, grossMonthlyIncomeSGD, periodOfEmployment
- Household Income: name, relationshipToApplicant, occupation, grossMonthlyIncomeSGD
- Other Income: description, amountSGD
- Personal Info: applicantName, nric, address, phoneNumber, email
- Financial Notes: financialSituationNote, totalHouseholdIncome, monthlyExpenses
MAPPING RULES:
1. Identify what type of information each text fragment contains
2. Map it to the most appropriate field category
3. Handle cases where information crosses expected boundaries
4. Identify narrative text that should be mapped to structured fields
5. Flag text that doesn't fit any expected category
6. Provide confidence scores (0‑1) for each mapping
Return a JSON object with this exact structure:
{
  "mappings": [
    {
      "fieldName": "occupation",
      "extractedText": "part‑time cashier at NTUC",
      "confidence": 0.9
    }
  ],
  "unmappedText": ["text that doesn't fit any field"],
  "confidence": 0.85
}`,
        },
        {
          role: "user",
          content: `Map these extracted text fragments to appropriate form fields:
${extractedTexts.map((t, i) => `${i + 1}. "${t}"`).join("\n")}
Analyze each fragment and map it to the most appropriate field. Handle cases where information might be scattered across multiple fragments or written in unexpected places.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
      // 👉  Tell OpenAI to obey the JSON schema
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "MappingResultSchema",
          schema: mappingJsonSchema,
        },
      },
    });

    // The model always returns a string (or null). We try to parse it with Zod.
    const raw = completion.choices[0].message.content ?? "{}";

    // First a quick JSON.parse – Zod works with a plain JS object.
    const parsedObj = JSON.parse(raw);

    // Zod validation – will throw if the shape is wrong.
    const validated = MappingResultSchema.parse(parsedObj);

    return {
      mappings: validated.mappings,
      unmappedText: validated.unmappedText,
      confidence: validated.confidence,
    };
  } catch (error) {
    console.error("Field mapping error:", error);
    // Fallback – return an empty, safe structure
    return {
      mappings: [],
      unmappedText: extractedTexts,
      confidence: 0,
    };
  }
}

/// -----------------------
// Helper to decide which top‑level category a field belongs to
// -----------------------
function determineFieldCategory(fieldName: string): string {
  for (const [category, fields] of Object.entries(EXPECTED_FIELDS)) {
    if (fields.includes(fieldName)) return category;
  }
  return "unmapped";
}

/// -----------------------
// Enhance the raw extraction with the mapping results
// (unchanged – only the type of `mappedFields` changed)
// -----------------------
async function enhanceMapping(
  originalData: any,
  mappedFields: FieldMapping[],
): Promise<any> {
  const enhanced = { ...originalData };
  const fieldGroups: Record<string, FieldMapping[]> = {};

  mappedFields.forEach((mapping) => {
    const category = determineFieldCategory(mapping.fieldName);
    if (!fieldGroups[category]) fieldGroups[category] = [];
    fieldGroups[category].push(mapping);
  });

  // Apply the mappings – this is a very simple demo implementation.
  Object.entries(fieldGroups).forEach(([category, mappings]) => {
    if (category === "applicantIncome") {
      enhanced.applicantIncome = enhanced.applicantIncome || [];
      mappings.forEach((m) => {
        if (m.fieldName === "occupation") {
          if (enhanced.applicantIncome.length === 0) {
            enhanced.applicantIncome.push({ occupation: m.extractedText });
          } else {
            enhanced.applicantIncome[0].occupation = m.extractedText;
          }
        }
        // … implement other fields (grossMonthlyIncomeSGD, periodOfEmployment) similarly …
      });
    }
    // Add similar logic for other categories (householdIncome, otherIncomeSources, …)
  });

  return enhanced;
}

/// -----------------------
// POST – the only endpoint you asked for
// -----------------------
export async function POST(request: NextRequest) {
  try {
    // The demo sends `{ extractedData: <object>, formType?: "financial" }`
    const { extractedData, formType = "financial" } = await request.json();

    if (!extractedData || typeof extractedData !== "object") {
      return NextResponse.json(
        { error: "`extractedData` object is required" },
        { status: 400 },
      );
    }

    // -----------------------------------------------------------------
    // Convert the whole extraction object into a flat array of strings.
    // This mirrors the behaviour you used in the previous version.
    // -----------------------------------------------------------------
    const collectStrings = (obj: any, acc: string[] = []): string[] => {
      if (obj == null) return acc;
      if (typeof obj === "string" || typeof obj === "number") {
        acc.push(String(obj));
      } else if (Array.isArray(obj)) {
        obj.forEach((i) => collectStrings(i, acc));
      } else if (typeof obj === "object") {
        Object.values(obj).forEach((v) => collectStrings(v, acc));
      }
      return acc;
    };
    const extractedTexts = collectStrings(extractedData);

    // ---------------------------------------------------------
    // 1️⃣  Run the LLM mapping (now safely typed)
    // ---------------------------------------------------------
    const mappingResult = await mapTextToFields(extractedTexts, formType);

    // ---------------------------------------------------------
    // 2️⃣  Enhance the original extraction with the new fields
    // ---------------------------------------------------------
    let enhancedData = extractedData;
    if (mappingResult.mappings.length > 0) {
      enhancedData = await enhanceMapping(
        extractedData,
        mappingResult.mappings,
      );
    }

    // ---------------------------------------------------------
    // 3️⃣  Return the merged result
    // ---------------------------------------------------------
    return NextResponse.json({
      ...mappingResult,
      enhancedData,
      fieldCategories: EXPECTED_FIELDS,
    });
  } catch (error) {
    console.error("Smart mapping error:", error);
    return NextResponse.json(
      { error: "Failed to map fields" },
      { status: 500 },
    );
  }
}

/// -----------------------
// GET – unchanged (keeps the reference data)
// -----------------------
export async function GET() {
  return NextResponse.json({
    expectedFields: EXPECTED_FIELDS,
    supportedFormTypes: ["financial", "personal", "legal"],
  });
}
