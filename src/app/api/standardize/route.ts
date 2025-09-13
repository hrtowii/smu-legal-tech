import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { StandardizationRule } from "../data";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://smu-legal-tech.vercel.app",
    "X-Title": "SMU Legal Tech - Language Standardization Service",
  },
});

// Predefined standardization rules for common informal language
const STANDARDIZATION_RULES: StandardizationRule[] = [
  // Uncertainty expressions
  {
    pattern: /not sure|unsure|dunno|dont know|don't know/i,
    standardValue: "unknown",
    type: "regex",
    confidence: 0.9,
  },
  {
    pattern:
      /idk|dk|dont remember|don't remember|cant remember|can't remember/i,
    standardValue: "missing",
    type: "regex",
    confidence: 0.9,
  },
  {
    pattern: /maybe|might be|could be|probably|perhaps|think so/i,
    standardValue: "ambiguous",
    type: "regex",
    confidence: 0.8,
  },

  // Relationship standardization
  {
    pattern: /mum|mom|mommy/i,
    standardValue: "mother",
    type: "regex",
    confidence: 0.95,
  },
  {
    pattern: /dad|daddy|papa/i,
    standardValue: "father",
    type: "regex",
    confidence: 0.95,
  },
  {
    pattern: /sis|sister/i,
    standardValue: "sibling",
    type: "regex",
    confidence: 0.9,
  },
  {
    pattern: /bro|brother/i,
    standardValue: "sibling",
    type: "regex",
    confidence: 0.9,
  },
  {
    pattern: /hubby|husband/i,
    standardValue: "spouse",
    type: "regex",
    confidence: 0.95,
  },
  {
    pattern: /wife|wifey/i,
    standardValue: "spouse",
    type: "regex",
    confidence: 0.95,
  },
  {
    pattern: /bf|boyfriend/i,
    standardValue: "partner",
    type: "regex",
    confidence: 0.9,
  },
  {
    pattern: /gf|girlfriend/i,
    standardValue: "partner",
    type: "regex",
    confidence: 0.9,
  },

  // Occupation standardization
  {
    pattern: /cabbie|cab driver/i,
    standardValue: "taxi driver",
    type: "regex",
    confidence: 0.9,
  },
  {
    pattern: /maid|helper|domestic helper/i,
    standardValue: "domestic worker",
    type: "regex",
    confidence: 0.9,
  },
  {
    pattern: /hawker|food vendor/i,
    standardValue: "food service worker",
    type: "regex",
    confidence: 0.9,
  },
  {
    pattern: /part time|pt/i,
    standardValue: "part-time",
    type: "regex",
    confidence: 0.9,
  },
  {
    pattern: /full time|ft/i,
    standardValue: "full-time",
    type: "regex",
    confidence: 0.9,
  },

  // Income expressions
  {
    pattern: /around (\d+)k|about (\d+)k|~(\d+)k|\$(\d+)k/i,
    standardValue: "multiply_by_1000",
    type: "regex",
    confidence: 0.85,
  },
  {
    pattern: /no income|unemployed|jobless/i,
    standardValue: "0",
    type: "regex",
    confidence: 0.95,
  },
];

function applyStandardizationRules(text: string): {
  standardized: string;
  confidence: number;
  applied: boolean;
} {
  if (!text || typeof text !== "string") {
    return { standardized: text, confidence: 1.0, applied: false };
  }

  for (const rule of STANDARDIZATION_RULES) {
    const match = text.match(rule.pattern);
    if (match) {
      if (rule.standardValue === "multiply_by_1000") {
        // Handle numeric conversions like "2k" -> 2000
        const number = match[1] || match[2] || match[3] || match[4];
        if (number) {
          return {
            standardized: (parseInt(number) * 1000).toString(),
            confidence: rule.confidence,
            applied: true,
          };
        }
      } else {
        return {
          standardized: rule.standardValue,
          confidence: rule.confidence,
          applied: true,
        };
      }
    }
  }

  return { standardized: text, confidence: 1.0, applied: false };
}

async function llmStandardize(
  text: string,
  fieldType: string,
): Promise<{ standardized: string; confidence: number }> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at standardizing informal text for legal forms. Your job is to convert informal, colloquial, or unclear responses into standardized, professional format suitable for legal documentation.

Field type: ${fieldType}

RULES:
1. Convert informal language to formal equivalents
2. Standardize relationships (e.g., "mum" -> "mother")
3. Standardize occupations (e.g., "cabbie" -> "taxi driver")
4. Convert unclear amounts to numbers where possible
5. If text indicates uncertainty, use: "unknown", "missing", or "ambiguous"
6. Keep original meaning but make it professional
7. Return only the standardized text, nothing else
8. If already professional, return as-is

Examples:
Input: "idk" -> Output: "missing"
Input: "around 2k" -> Output: "2000"
Input: "my mum" -> Output: "mother"
Input: "part time cashier" -> Output: "part-time cashier"`,
        },
        {
          role: "user",
          content: `Standardize this text for a ${fieldType} field: "${text}"`,
        },
      ],
      temperature: 0.1,
      max_tokens: 100,
    });

    const standardized = completion.choices[0].message.content?.trim() || text;

    // Calculate confidence based on how much the text changed
    const similarity =
      text.toLowerCase() === standardized.toLowerCase() ? 1.0 : 0.8;

    return { standardized, confidence: similarity };
  } catch (error) {
    console.error("LLM standardization error:", error);
    return { standardized: text, confidence: 0.5 };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, fieldType, useRulesOnly = false } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({
        standardized: text,
        confidence: 1.0,
        applied: false,
        method: "none",
      });
    }

    // First apply rule-based standardization
    const ruleResult = applyStandardizationRules(text);

    if (ruleResult.applied || useRulesOnly) {
      return NextResponse.json({
        standardized: ruleResult.standardized,
        confidence: ruleResult.confidence,
        applied: ruleResult.applied,
        method: "rules",
        original: text,
      });
    }

    // If no rules matched and LLM is allowed, use LLM standardization
    const llmResult = await llmStandardize(text, fieldType || "general");

    return NextResponse.json({
      standardized: llmResult.standardized,
      confidence: llmResult.confidence,
      applied: llmResult.standardized !== text,
      method: "llm",
      original: text,
    });
  } catch (error) {
    console.error("Standardization error:", error);
    return NextResponse.json(
      { error: "Failed to standardize text" },
      { status: 500 },
    );
  }
}

// GET endpoint to retrieve all standardization rules
export async function GET() {
  return NextResponse.json({
    rules: STANDARDIZATION_RULES.map((rule) => ({
      pattern: rule.pattern.toString(),
      standardValue: rule.standardValue,
      type: rule.type,
      confidence: rule.confidence,
    })),
  });
}
