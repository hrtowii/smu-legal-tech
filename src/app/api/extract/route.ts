import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const ExtractedDataSchema = z.object({
  applicantName: z.string().describe("Full name of the applicant"),
  contactNumber: z.string().describe("Phone number or contact details"),
  email: z.string().describe("Email address if provided"),
  address: z.string().describe("Full residential address"),
  dateOfBirth: z.string().describe("Date of birth in any format found"),
  charges: z.string().describe("Criminal charges or offenses mentioned"),
  priorConvictions: z
    .string()
    .describe("Previous criminal history or convictions"),
  employmentStatus: z.string().describe("Current employment situation"),
  monthlyIncome: z.string().describe("Monthly income amount if specified"),
  dependents: z.string().describe("Number of dependents or family members"),
  emergencyContact: z.string().describe("Emergency contact person and details"),
  flags: z
    .array(z.string())
    .describe(
      "Issues requiring human review (unclear handwriting, missing info, etc.)",
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Overall confidence score of the extraction"),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // For demo purposes, we'll simulate the extraction process
    // In a real implementation, you would:
    // 1. Convert the file to text using OCR (Tesseract, Google Vision API, etc.)
    // 2. Process the text with AI to extract structured data

    // Simulated extraction for demo
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate processing time

    // Mock extracted text (in real implementation, this would come from OCR)
    const mockOcrText = `
    Application for Criminal Defence Aid
    
    Name: John Smith (handwriting unclear on last letter)
    Phone: 91234567
    Email: john@email.com
    Address: 123 Main Street, Singapore 123456
    DOB: 15/03/1985
    
    Charges: Theft, minor assault
    Previous convictions: None mentioned
    Employment: Part-time cleaner
    Income: about $800 per month
    Dependents: 2 children
    Emergency contact: Mary Smith - sister - 98765432
    
    Note: Some fields were left blank, handwriting difficult to read in places
    `;

    // Use AI to extract structured data from the OCR text
    const result = await generateObject({
      model: openai("gpt-4"),
      schema: ExtractedDataSchema,
      prompt: `
        Extract structured data from this handwritten legal form OCR text. 
        Handle informal language, incomplete information, and unclear handwriting.
        Flag any issues that require human review.
        
        OCR Text:
        ${mockOcrText}
        
        Instructions:
        - Extract all available information even if informal
        - Flag unclear handwriting, missing mandatory fields, or ambiguous responses
        - Provide confidence score based on text clarity and completeness
        - Map informal language to appropriate structured formats
      `,
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract data from form" },
      { status: 500 },
    );
  }
}
