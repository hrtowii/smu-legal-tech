import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";

// Initialize SQLite database
async function initDatabase() {
  const dbPath = path.join(process.cwd(), "legal_forms.db");

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Create table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS extractions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      applicant_name TEXT,
      contact_number TEXT,
      email TEXT,
      address TEXT,
      date_of_birth TEXT,
      charges TEXT,
      prior_convictions TEXT,
      employment_status TEXT,
      monthly_income TEXT,
      dependents TEXT,
      emergency_contact TEXT,
      flags TEXT,
      confidence REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.applicantName) {
      return NextResponse.json(
        { error: "Applicant name is required" },
        { status: 400 },
      );
    }

    const db = await initDatabase();

    // Insert the extracted data
    const result = await db.run(
      `
      INSERT INTO extractions (
        applicant_name, contact_number, email, address, date_of_birth,
        charges, prior_convictions, employment_status, monthly_income,
        dependents, emergency_contact, flags, confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        data.applicantName,
        data.contactNumber || "",
        data.email || "",
        data.address || "",
        data.dateOfBirth || "",
        data.charges || "",
        data.priorConvictions || "",
        data.employmentStatus || "",
        data.monthlyIncome || "",
        data.dependents || "",
        data.emergencyContact || "",
        JSON.stringify(data.flags || []),
        data.confidence || 0,
      ],
    );

    await db.close();

    return NextResponse.json({
      success: true,
      id: result.lastID,
      message: "Data saved successfully",
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
    const db = await initDatabase();

    // Get all extractions ordered by creation date
    const extractions = await db.all(`
      SELECT * FROM extractions 
      ORDER BY created_at DESC 
      LIMIT 50
    `);

    await db.close();

    // Parse flags JSON for each record
    const processedExtractions = extractions.map((extraction: any) => ({
      ...extraction,
      flags: JSON.parse(extraction.flags || "[]"),
    }));

    return NextResponse.json(processedExtractions);
  } catch (error) {
    console.error("Database fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from database" },
      { status: 500 },
    );
  }
}
