import { NextRequest, NextResponse } from "next/server";
import { Database } from "bun:sqlite";
import path from "path";
import { FinancialForm } from "../data";

// Initialize SQLite database
function initDatabase() {
  const dbPath = path.join(process.cwd(), "legal_forms.db");

  const db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.exec("PRAGMA journal_mode = WAL;");

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS financial_forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      financial_situation_note TEXT,
      flags TEXT,
      confidence REAL,
      created_at DATETIME DEFAULT (datetime('now','localtime')),
      updated_at DATETIME DEFAULT (datetime('now','localtime'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS applicant_income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      occupation TEXT,
      gross_monthly_income_sgd REAL,
      period_of_employment TEXT,
      FOREIGN KEY (form_id) REFERENCES financial_forms (id)
    );
  `);

  db.exec(`
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

  db.exec(`
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
    const data: FinancialForm & { flags?: string[]; confidence?: number } =
      await request.json();

    const db = initDatabase();

    // Begin transaction
    const transaction = db.transaction((formData: typeof data) => {
      // Insert main form record
      const result = db.run(
        `INSERT INTO financial_forms (
          financial_situation_note, flags, confidence
        ) VALUES (?, ?, ?)`,
        [
          formData.financialSituationNote || "",
          JSON.stringify(formData.flags || []),
          formData.confidence || 0,
        ],
      );

      const formId = result.lastInsertRowid;

      // Insert applicant income records
      if (formData.applicantIncome && formData.applicantIncome.length > 0) {
        const insertApplicantIncome = db.prepare(`
          INSERT INTO applicant_income (
            form_id, occupation, gross_monthly_income_sgd, period_of_employment
          ) VALUES (?, ?, ?, ?)
        `);

        for (const income of formData.applicantIncome) {
          insertApplicantIncome.run([
            formId,
            income.occupation || "",
            income.grossMonthlyIncomeSGD || 0,
            income.periodOfEmployment || "",
          ]);
        }
      }

      // Insert household income records
      if (formData.householdIncome && formData.householdIncome.length > 0) {
        const insertHouseholdIncome = db.prepare(`
          INSERT INTO household_income (
            form_id, name, relationship_to_applicant, occupation, gross_monthly_income_sgd
          ) VALUES (?, ?, ?, ?, ?)
        `);

        for (const income of formData.householdIncome) {
          insertHouseholdIncome.run([
            formId,
            income.name || "",
            income.relationshipToApplicant || "",
            income.occupation || "",
            income.grossMonthlyIncomeSGD || 0,
          ]);
        }
      }

      // Insert other income sources
      if (
        formData.otherIncomeSources &&
        formData.otherIncomeSources.length > 0
      ) {
        const insertOtherIncome = db.prepare(`
          INSERT INTO other_income_sources (
            form_id, description, amount_sgd
          ) VALUES (?, ?, ?)
        `);

        for (const income of formData.otherIncomeSources) {
          insertOtherIncome.run([
            formId,
            income.description || "",
            income.amountSGD || 0,
          ]);
        }
      }

      return formId;
    });

    const formId = transaction(data);
    db.close();

    return NextResponse.json({
      success: true,
      id: formId,
      message: "Financial form saved successfully",
    });
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
    const db = initDatabase();

    // Get all financial forms with related data
    const forms = db
      .query(
        `
      SELECT * FROM financial_forms
      ORDER BY created_at DESC
      LIMIT 50
    `,
      )
      .all();

    const processedForms = forms.map((form: any) => {
      // Get applicant income
      const applicantIncome = db
        .query(
          `
        SELECT * FROM applicant_income WHERE form_id = ?
      `,
        )
        .all(form.id);

      // Get household income
      const householdIncome = db
        .query(
          `
        SELECT * FROM household_income WHERE form_id = ?
      `,
        )
        .all(form.id);

      // Get other income sources
      const otherIncomeSources = db
        .query(
          `
        SELECT * FROM other_income_sources WHERE form_id = ?
      `,
        )
        .all(form.id);

      return {
        ...form,
        flags: JSON.parse(form.flags || "[]"),
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
    });

    db.close();

    return NextResponse.json(processedForms);
  } catch (error) {
    console.error("Database fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from database" },
      { status: 500 },
    );
  }
}
