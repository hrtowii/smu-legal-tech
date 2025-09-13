import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://smu-legal-tech.vercel.app",
    "X-Title": "SMU Legal Tech - Financial Form Extractor",
  },
});

// Zod schemas based on the FinancialForm interface
const ApplicantIncomeSchema = z.object({
  occupation: z.string().optional().describe("Occupation or job title"),
  grossMonthlyIncomeSGD: z
    .number()
    .optional()
    .describe("Gross monthly income in Singapore Dollars"),
  periodOfEmployment: z
    .string()
    .optional()
    .describe("Period of employment (e.g., 'Apr 2022 - Dec 2022')"),
});

const HouseholdIncomeSchema = z.object({
  name: z.string().optional().describe("Name of household member"),
  relationshipToApplicant: z
    .string()
    .optional()
    .describe("Relationship to applicant (e.g., 'Father', 'Mother')"),
  occupation: z.string().optional().describe("Occupation of household member"),
  grossMonthlyIncomeSGD: z
    .number()
    .optional()
    .describe("Gross monthly income in Singapore Dollars"),
});

const OtherIncomeSourceSchema = z.object({
  description: z
    .string()
    .optional()
    .describe(
      "Description of income source (e.g., 'Rental income', 'CPF payouts')",
    ),
  amountSGD: z.number().optional().describe("Amount in Singapore Dollars"),
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
});

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
    console.log(imageUrl);
    // Use OpenAI Vision API with structured outputs
    const completion = await openai.chat.completions.create({
      model: "openrouter/sonoma-sky-alpha",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert financial form data extraction system. Analyze this handwritten/scanned financial declaration form image and extract structured financial data.

Extract the following information:

1. **Applicant Income**: Look for sections about the applicant's own income sources
   - Extract occupation, monthly income amounts, and employment periods
   - Create separate entries for each income source

2. **Household Income**: Look for sections about family/household members' income
   - Extract name, relationship to applicant, occupation, and monthly income
   - Create separate entries for each household member

3. **Other Income Sources**: Look for additional income like rental, CPF, allowances
   - Extract description and amount for each source

4. **Financial Situation**: Look for any notes about financial hardship or circumstances

5. **Quality Assessment**:
   - Flag issues like unclear handwriting, missing data, inconsistent information
   - Provide confidence score based on image clarity and data completeness

Instructions:
- Convert all monetary amounts to numbers (remove currency symbols, commas)
- Keep names, occupations, and descriptions as text
- If you see table structures, extract each row as a separate entry
- Look for common form sections: "Applicant Income", "Household Income", "Other Income"
- Be thorough and extract every piece of financial information visible`,
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
      response_format: zodResponseFormat(
        ExtractedFinancialFormSchema,
        "financial_form_extraction",
      ),
      max_tokens: 20000,
    });
    // "{\"applicant_income\":[{\"occupation\":\"Unclear (possibly 'Coder' or scribbled)\",\"monthly_income\":1000,\"period\":\"From Nov 2022 to present (incomplete)\"}],\"household_income\":[{\"name\":\"Mew (possibly 'Mei' or unclear handwriting)\",\"relationship\":\"Applicant (self? unclear)\",\"occupation\":\"Plumber (plum)\",\"monthly_income\":2000},{\"name\":\"Dad\",\"relationship\":\"Father\",\"occupation\":\"Plumber (plumb)\",\"monthly_income\":null},{\"name\":\"Unclear\",\"relationship\":\"Unclear\",\"occupation\":\"Odd jobs full time\",\"monthly_income\":null}],\"other_income\":[{\"description\":\"Allowances or similar (oluancy)\",\"amount\":100},{\"description\":\"Rental or other (amount around)\",\"amount\":300}],\"financial_situation\":\"No elaboration provided on financial situation.\",\"quality_assessment\":{\"issues\":[\"Unclear handwriting throughout, e.g., 'meow', 'plum', 'oluancy' likely OCR/handwriting errors\",\"Missing data in several fields, e.g., incomplete periods, blank rows\",\"Inconsistent formatting in table structures, periods not fully specified\"],\"confidence_score\":45}}
    const extractedData = completion.choices[0].message.content;
    console.log(extractedData);
    if (!extractedData) {
      throw new Error("No parsed data received from AI model");
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
      confidence: extractedData.confidence || 0.5,
    };

    return NextResponse.json(validatedData);
  } catch (error) {
    console.error("Financial form extraction error:", error);

    // Return a fallback response if AI extraction fails
    return NextResponse.json({
      applicantIncome: [],
      householdIncome: [],
      otherIncomeSources: [],
      financialSituationNote: "Error processing form - manual review required",
      flags: ["AI extraction failed", "Manual review required"],
      confidence: 0.0,
    });
  }
}
