import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

// Initialize SQLite database for analytics
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

// Analytics endpoint - GET only
export async function GET() {
  try {
    const db = await initDatabase();

    // Get analytics data for visualization
    const analytics = {
      // Flag frequency analysis
      flagAnalysis: await db.all(`
        SELECT
          json_extract(flags, '$[0]') as flag_type,
          COUNT(*) as count
        FROM financial_forms
        WHERE json_extract(flags, '$[0]') IS NOT NULL
        GROUP BY json_extract(flags, '$[0]')
        ORDER BY count DESC
      `),

      // Confidence distribution
      confidenceDistribution: await db.all(`
        SELECT
          CASE
            WHEN confidence >= 0.9 THEN 'Very High (90%+)'
            WHEN confidence >= 0.8 THEN 'High (80-89%)'
            WHEN confidence >= 0.7 THEN 'Medium (70-79%)'
            WHEN confidence >= 0.6 THEN 'Low (60-69%)'
            ELSE 'Very Low (<60%)'
          END as confidence_range,
          COUNT(*) as count
        FROM financial_forms
        GROUP BY
          CASE
            WHEN confidence >= 0.9 THEN 'Very High (90%+)'
            WHEN confidence >= 0.8 THEN 'High (80-89%)'
            WHEN confidence >= 0.7 THEN 'Medium (70-79%)'
            WHEN confidence >= 0.6 THEN 'Low (60-69%)'
            ELSE 'Very Low (<60%)'
          END
        ORDER BY count DESC
      `),

      // Income source analysis
      incomeSourceAnalysis: await db.all(`
        SELECT
          'Applicant Income' as source_type,
          COUNT(*) as count,
          AVG(gross_monthly_income_sgd) as avg_amount,
          MIN(gross_monthly_income_sgd) as min_amount,
          MAX(gross_monthly_income_sgd) as max_amount
        FROM applicant_income
        WHERE gross_monthly_income_sgd > 0
        UNION ALL
        SELECT
          'Household Income' as source_type,
          COUNT(*) as count,
          AVG(gross_monthly_income_sgd) as avg_amount,
          MIN(gross_monthly_income_sgd) as min_amount,
          MAX(gross_monthly_income_sgd) as max_amount
        FROM household_income
        WHERE gross_monthly_income_sgd > 0
        UNION ALL
        SELECT
          'Other Income' as source_type,
          COUNT(*) as count,
          AVG(amount_sgd) as avg_amount,
          MIN(amount_sgd) as min_amount,
          MAX(amount_sgd) as max_amount
        FROM other_income_sources
        WHERE amount_sgd > 0
      `),

      // Common occupations
      occupationAnalysis: await db.all(`
        SELECT
          occupation,
          COUNT(*) as count,
          AVG(gross_monthly_income_sgd) as avg_income
        FROM (
          SELECT occupation, gross_monthly_income_sgd FROM applicant_income WHERE occupation IS NOT NULL AND occupation != ''
          UNION ALL
          SELECT occupation, gross_monthly_income_sgd FROM household_income WHERE occupation IS NOT NULL AND occupation != ''
        )
        GROUP BY occupation
        HAVING COUNT(*) > 1
        ORDER BY count DESC
        LIMIT 10
      `),

      // Income range distribution
      incomeRangeDistribution: await db.all(`
        SELECT
          CASE
            WHEN income >= 5000 THEN '5000+'
            WHEN income >= 3000 THEN '3000-4999'
            WHEN income >= 2000 THEN '2000-2999'
            WHEN income >= 1000 THEN '1000-1999'
            WHEN income >= 500 THEN '500-999'
            ELSE '0-499'
          END as income_range,
          COUNT(*) as count
        FROM (
          SELECT gross_monthly_income_sgd as income FROM applicant_income WHERE gross_monthly_income_sgd > 0
          UNION ALL
          SELECT gross_monthly_income_sgd as income FROM household_income WHERE gross_monthly_income_sgd > 0
        )
        GROUP BY
          CASE
            WHEN income >= 5000 THEN '5000+'
            WHEN income >= 3000 THEN '3000-4999'
            WHEN income >= 2000 THEN '2000-2999'
            WHEN income >= 1000 THEN '1000-1999'
            WHEN income >= 500 THEN '500-999'
            ELSE '0-499'
          END
        ORDER BY
          CASE
            WHEN income_range = '0-499' THEN 1
            WHEN income_range = '500-999' THEN 2
            WHEN income_range = '1000-1999' THEN 3
            WHEN income_range = '2000-2999' THEN 4
            WHEN income_range = '3000-4999' THEN 5
            WHEN income_range = '5000+' THEN 6
          END
      `),

      // Monthly submission trends
      submissionTrends: await db.all(`
        SELECT
          strftime('%Y-%m', created_at) as month,
          COUNT(*) as submissions,
          AVG(confidence) as avg_confidence
        FROM financial_forms
        WHERE created_at >= date('now', '-12 months')
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month
      `),

      // Missing fields analysis
      missingFieldsAnalysis: await db.all(`
        SELECT
          json_extract(missing_mandatory_fields, '$[0]') as missing_field,
          COUNT(*) as count
        FROM financial_forms
        WHERE json_extract(missing_mandatory_fields, '$[0]') IS NOT NULL
        GROUP BY json_extract(missing_mandatory_fields, '$[0]')
        ORDER BY count DESC
        LIMIT 10
      `),

      // Summary statistics
      summaryStats: await db.get(`
        SELECT
          COUNT(*) as total_forms,
          AVG(confidence) as avg_confidence,
          COUNT(CASE WHEN confidence < 0.7 THEN 1 END) as low_confidence_count,
          COUNT(CASE WHEN json_array_length(flags) > 0 THEN 1 END) as forms_with_flags
        FROM financial_forms
      `),
    };

    await db.close();

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
