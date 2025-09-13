import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { FinancialForm, EnhancedFinancialForm } from "../data";

// Initialize SQLite database with enhanced schema
async function initDatabase() {
  const dbPath = path.join(process.cwd(), "legal_forms.db");

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable WAL mode for better performance
  await db.exec("PRAGMA journal_mode = WAL;");

  // Create enhanced financial_forms table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS financial_forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      financial_situation_note TEXT,
      flags TEXT,
      confidence REAL,
      status TEXT DEFAULT 'pending_review',
      reviewer_id TEXT,
      review_notes TEXT,
      required_fields TEXT,
      missing_mandatory_fields TEXT,
      created_at DATETIME DEFAULT (datetime('now','localtime')),
      updated_at DATETIME DEFAULT (datetime('now','localtime'))
    );
  `);

  // Add new columns to existing table if they don't exist
  try {
    await db.exec(
      "ALTER TABLE financial_forms ADD COLUMN status TEXT DEFAULT 'pending_review';",
    );
  } catch (e) {}

  try {
    await db.exec("ALTER TABLE financial_forms ADD COLUMN reviewer_id TEXT;");
  } catch (e) {}

  try {
    await db.exec("ALTER TABLE financial_forms ADD COLUMN review_notes TEXT;");
  } catch (e) {}

  try {
    await db.exec(
      "ALTER TABLE financial_forms ADD COLUMN required_fields TEXT;",
    );
  } catch (e) {}

  try {
    await db.exec(
      "ALTER TABLE financial_forms ADD COLUMN missing_mandatory_fields TEXT;",
    );
  } catch (e) {}

  // Field-level confidence tracking
  await db.exec(`
    CREATE TABLE IF NOT EXISTS field_confidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      field_name TEXT,
      field_value TEXT,
      confidence_score REAL,
      extraction_source TEXT,
      flags TEXT,
      alternatives TEXT,
      original_text TEXT,
      created_at DATETIME DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (form_id) REFERENCES financial_forms (id)
    );
  `);

  // Validation history for learning
  await db.exec(`
    CREATE TABLE IF NOT EXISTS validation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      field_name TEXT,
      original_value TEXT,
      corrected_value TEXT,
      correction_reason TEXT,
      corrected_by TEXT,
      timestamp DATETIME DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (form_id) REFERENCES financial_forms (id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS applicant_income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      occupation TEXT,
      gross_monthly_income_sgd REAL,
      period_of_employment TEXT,
      FOREIGN KEY (form_id) REFERENCES financial_forms (id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS household_income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      name TEXT,
      relationship_to_applicant TEXT,
      occupation TEXT,
      gross_monthly_income_sgd REAL,
      FOREIGN KEY (form_id) REFERENCES financial_forms (id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS other_income_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      description TEXT,
      amount_sgd REAL,
      FOREIGN KEY (form_id) REFERENCES financial_forms (id)
    );
  `);

  return db;
}

export async function POST(request: NextRequest) {
  try {
    const data: (FinancialForm | EnhancedFinancialForm) & {
      flags?: string[];
      confidence?: number;
      fieldConfidence?: Record<string, any>;
      status?: string;
      reviewNotes?: string;
      requiredFields?: string[];
      missingMandatoryFields?: string[];
    } = await request.json();

    const db = await initDatabase();

    // Begin transaction
    await db.exec("BEGIN TRANSACTION");

    try {
      // Insert main form record with enhanced fields
      const result = await db.run(
        `INSERT INTO financial_forms (
          financial_situation_note, flags, confidence, status,
          review_notes, required_fields, missing_mandatory_fields
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.financialSituationNote || "",
          JSON.stringify(data.flags || []),
          data.confidence || 0,
          data.status || "pending_review",
          data.reviewNotes || "",
          JSON.stringify(data.requiredFields || []),
          JSON.stringify(data.missingMandatoryFields || []),
        ],
      );

      const formId = result.lastID;

      // Insert field confidence data if available
      if ("fieldConfidence" in data && data.fieldConfidence) {
        for (const [fieldName, fieldData] of Object.entries(
          data.fieldConfidence,
        )) {
          await db.run(
            `
            INSERT INTO field_confidence (
              form_id, field_name, field_value, confidence_score,
              extraction_source, flags, alternatives, original_text
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
            [
              formId,
              fieldName,
              JSON.stringify(fieldData.value),
              fieldData.confidence || 0,
              fieldData.source || "unknown",
              JSON.stringify(fieldData.flags || []),
              JSON.stringify(fieldData.alternatives || []),
              fieldData.originalText || "",
            ],
          );
        }
      }

      // Insert applicant income records
      if (data.applicantIncome && data.applicantIncome.length > 0) {
        for (const income of data.applicantIncome) {
          await db.run(
            `
            INSERT INTO applicant_income (
              form_id, occupation, gross_monthly_income_sgd, period_of_employment
            ) VALUES (?, ?, ?, ?)
          `,
            [
              formId,
              income.occupation || "",
              income.grossMonthlyIncomeSGD || 0,
              income.periodOfEmployment || "",
            ],
          );
        }
      }

      // Insert household income records
      if (data.householdIncome && data.householdIncome.length > 0) {
        for (const income of data.householdIncome) {
          await db.run(
            `
            INSERT INTO household_income (
              form_id, name, relationship_to_applicant, occupation, gross_monthly_income_sgd
            ) VALUES (?, ?, ?, ?, ?)
          `,
            [
              formId,
              income.name || "",
              income.relationshipToApplicant || "",
              income.occupation || "",
              income.grossMonthlyIncomeSGD || 0,
            ],
          );
        }
      }

      // Insert other income sources
      if (data.otherIncomeSources && data.otherIncomeSources.length > 0) {
        for (const income of data.otherIncomeSources) {
          await db.run(
            `
            INSERT INTO other_income_sources (
              form_id, description, amount_sgd
            ) VALUES (?, ?, ?)
          `,
            [formId, income.description || "", income.amountSGD || 0],
          );
        }
      }

      await db.exec("COMMIT");
      await db.close();

      return NextResponse.json({
        success: true,
        id: formId,
        message: "Financial form saved successfully",
      });
    } catch (error) {
      await db.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Database save error:", error);
    return NextResponse.json(
      { error: "Failed to save data to database" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const db = await initDatabase();

    // Get all financial forms with enhanced data
    const forms = await db.all(`
      SELECT * FROM financial_forms
      ORDER BY created_at DESC
      LIMIT 50
    `);

    const processedForms = await Promise.all(
      forms.map(async (form: any) => {
        // Get field confidence data
        const fieldConfidence = await db.all(
          `SELECT * FROM field_confidence WHERE form_id = ?`,
          [form.id],
        );

        // Get applicant income
        const applicantIncome = await db.all(
          `SELECT * FROM applicant_income WHERE form_id = ?`,
          [form.id],
        );

        // Get household income
        const householdIncome = await db.all(
          `SELECT * FROM household_income WHERE form_id = ?`,
          [form.id],
        );

        // Get other income sources
        const otherIncomeSources = await db.all(
          `SELECT * FROM other_income_sources WHERE form_id = ?`,
          [form.id],
        );

        // Process field confidence into the expected format
        const fieldConfidenceMap: Record<string, any> = {};
        fieldConfidence.forEach((fc: any) => {
          fieldConfidenceMap[fc.field_name] = {
            value: JSON.parse(fc.field_value || '""'),
            confidence: fc.confidence_score,
            source: fc.extraction_source,
            flags: JSON.parse(fc.flags || "[]"),
            alternatives: JSON.parse(fc.alternatives || "[]"),
            originalText: fc.original_text,
          };
        });

        return {
          ...form,
          flags: JSON.parse(form.flags || "[]"),
          requiredFields: JSON.parse(form.required_fields || "[]"),
          missingMandatoryFields: JSON.parse(
            form.missing_mandatory_fields || "[]",
          ),
          fieldConfidence: fieldConfidenceMap,
          applicantIncome: applicantIncome.map((ai: any) => ({
            occupation: ai.occupation,
            grossMonthlyIncomeSGD: ai.gross_monthly_income_sgd,
            periodOfEmployment: ai.period_of_employment,
          })),
          householdIncome: householdIncome.map((hi: any) => ({
            name: hi.name,
            relationshipToApplicant: hi.relationship_to_applicant,
            occupation: hi.occupation,
            grossMonthlyIncomeSGD: hi.gross_monthly_income_sgd,
          })),
          otherIncomeSources: otherIncomeSources.map((ois: any) => ({
            description: ois.description,
            amountSGD: ois.amount_sgd,
          })),
        };
      }),
    );

    await db.close();

    return NextResponse.json(processedForms);
  } catch (error) {
    console.error("Database fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from database" },
      { status: 500 },
    );
  }
}
