const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function populateSampleData() {
  const dbPath = path.join(__dirname, 'legal_forms.db');
  console.log('Populating sample data...');

  const db = new sqlite3.Database(dbPath);

  // Sample data for financial forms
  const sampleForms = [
    {
      financial_situation_note: "Seeking assistance for family expenses",
      flags: JSON.stringify(["unclear_handwriting", "missing_signature"]),
      confidence: 0.65,
      status: "pending_review"
    },
    {
      financial_situation_note: "Medical expenses for elderly parent",
      flags: JSON.stringify(["incomplete_income_details"]),
      confidence: 0.82,
      status: "approved"
    },
    {
      financial_situation_note: "Lost job during pandemic, need support",
      flags: JSON.stringify(["low_confidence_ocr", "handwritten_amounts"]),
      confidence: 0.58,
      status: "pending_review"
    },
    {
      financial_situation_note: "Supporting disabled child",
      flags: JSON.stringify([]),
      confidence: 0.91,
      status: "approved"
    },
    {
      financial_situation_note: "Temporary financial difficulty",
      flags: JSON.stringify(["unclear_employment_period"]),
      confidence: 0.74,
      status: "reviewed"
    },
    {
      financial_situation_note: "Housing assistance needed",
      flags: JSON.stringify(["missing_bank_statements"]),
      confidence: 0.67,
      status: "pending_review"
    },
    {
      financial_situation_note: "Education expenses for children",
      flags: JSON.stringify([]),
      confidence: 0.88,
      status: "approved"
    },
    {
      financial_situation_note: "Single parent seeking help",
      flags: JSON.stringify(["inconsistent_income_data"]),
      confidence: 0.72,
      status: "rejected"
    }
  ];

  // Sample applicant income data
  const applicantIncomes = [
    { occupation: "Part-time Cashier", gross_monthly_income_sgd: 1200, period_of_employment: "Jan 2023 - Present" },
    { occupation: "Taxi Driver", gross_monthly_income_sgd: 2800, period_of_employment: "Mar 2020 - Present" },
    { occupation: "Cleaner", gross_monthly_income_sgd: 1000, period_of_employment: "Jun 2022 - Present" },
    { occupation: "Security Guard", gross_monthly_income_sgd: 2200, period_of_employment: "Sep 2021 - Present" },
    { occupation: "Food Delivery", gross_monthly_income_sgd: 1800, period_of_employment: "Apr 2023 - Present" },
    { occupation: "Administrative Assistant", gross_monthly_income_sgd: 2500, period_of_employment: "Feb 2019 - Present" },
    { occupation: "Construction Worker", gross_monthly_income_sgd: 3200, period_of_employment: "Aug 2020 - Present" },
    { occupation: "Retail Sales", gross_monthly_income_sgd: 1600, period_of_employment: "Nov 2022 - Present" },
    { occupation: "Hawker", gross_monthly_income_sgd: 2100, period_of_employment: "Jan 2018 - Present" },
    { occupation: "Freelance Tutor", gross_monthly_income_sgd: 1400, period_of_employment: "May 2023 - Present" }
  ];

  // Sample household income data
  const householdIncomes = [
    { name: "Mary Tan", relationship_to_applicant: "Spouse", occupation: "Nurse", gross_monthly_income_sgd: 3500 },
    { name: "John Lim", relationship_to_applicant: "Father", occupation: "Retiree", gross_monthly_income_sgd: 800 },
    { name: "Sarah Wong", relationship_to_applicant: "Mother", occupation: "Cleaner", gross_monthly_income_sgd: 1200 },
    { name: "David Chen", relationship_to_applicant: "Brother", occupation: "Engineer", gross_monthly_income_sgd: 4500 },
    { name: "Lisa Ng", relationship_to_applicant: "Sister", occupation: "Teacher", gross_monthly_income_sgd: 3800 },
    { name: "Robert Tan", relationship_to_applicant: "Son", occupation: "Student Part-time", gross_monthly_income_sgd: 600 },
    { name: "Grace Lee", relationship_to_applicant: "Daughter", occupation: "Unemployed", gross_monthly_income_sgd: 0 },
    { name: "William Koh", relationship_to_applicant: "Uncle", occupation: "Taxi Driver", gross_monthly_income_sgd: 2400 }
  ];

  // Sample other income sources
  const otherIncomeSources = [
    { description: "CPF Payouts", amount_sgd: 400 },
    { description: "Rental Income", amount_sgd: 800 },
    { description: "Government Allowance", amount_sgd: 300 },
    { description: "Freelance Work", amount_sgd: 500 },
    { description: "Investment Returns", amount_sgd: 200 },
    { description: "Family Support", amount_sgd: 600 },
    { description: "Part-time Job", amount_sgd: 900 },
    { description: "Disability Benefits", amount_sgd: 450 }
  ];

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Insert sample forms
      const formStmt = db.prepare(`
        INSERT INTO financial_forms (
          financial_situation_note, flags, confidence, status
        ) VALUES (?, ?, ?, ?)
      `);

      sampleForms.forEach((form, index) => {
        formStmt.run([
          form.financial_situation_note,
          form.flags,
          form.confidence,
          form.status
        ], function(err) {
          if (err) {
            console.error(`Error inserting form ${index + 1}:`, err);
          } else {
            console.log(`✓ Inserted form ${index + 1} with ID ${this.lastID}`);

            // Insert related income data for this form
            const formId = this.lastID;

            // Insert applicant income (1-2 entries per form)
            const numApplicantIncomes = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < numApplicantIncomes; i++) {
              const income = applicantIncomes[Math.floor(Math.random() * applicantIncomes.length)];
              db.run(`
                INSERT INTO applicant_income (
                  form_id, occupation, gross_monthly_income_sgd, period_of_employment
                ) VALUES (?, ?, ?, ?)
              `, [formId, income.occupation, income.gross_monthly_income_sgd, income.period_of_employment]);
            }

            // Insert household income (0-3 entries per form)
            const numHouseholdIncomes = Math.floor(Math.random() * 4);
            for (let i = 0; i < numHouseholdIncomes; i++) {
              const income = householdIncomes[Math.floor(Math.random() * householdIncomes.length)];
              db.run(`
                INSERT INTO household_income (
                  form_id, name, relationship_to_applicant, occupation, gross_monthly_income_sgd
                ) VALUES (?, ?, ?, ?, ?)
              `, [formId, income.name, income.relationship_to_applicant, income.occupation, income.gross_monthly_income_sgd]);
            }

            // Insert other income sources (0-2 entries per form)
            const numOtherIncomes = Math.floor(Math.random() * 3);
            for (let i = 0; i < numOtherIncomes; i++) {
              const income = otherIncomeSources[Math.floor(Math.random() * otherIncomeSources.length)];
              db.run(`
                INSERT INTO other_income_sources (
                  form_id, description, amount_sgd
                ) VALUES (?, ?, ?)
              `, [formId, income.description, income.amount_sgd]);
            }
          }
        });
      });

      formStmt.finalize((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✓ Sample data population completed!');
          db.close();
          resolve();
        }
      });
    });
  });
}

// Run the script
populateSampleData()
  .then(() => {
    console.log('✓ All sample data inserted successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Error populating sample data:', error);
    process.exit(1);
  });
