const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function testAnalytics() {
  const dbPath = path.join(__dirname, 'legal_forms.db');

  console.log('Testing analytics queries...');
  console.log('Database path:', dbPath);

  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      return;
    }
    console.log('Connected to SQLite database');
  });

  // Test basic table existence
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='financial_forms'", (err, row) => {
    if (err) {
      console.error('Error checking tables:', err);
    } else if (row) {
      console.log('✓ financial_forms table exists');

      // Test basic count
      db.get("SELECT COUNT(*) as count FROM financial_forms", (err, countRow) => {
        if (err) {
          console.error('Error counting forms:', err);
        } else {
          console.log(`✓ Total forms in database: ${countRow.count}`);

          if (countRow.count > 0) {
            // Test sample analytics query
            db.all(`
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
            `, (err, rows) => {
              if (err) {
                console.error('Error running confidence query:', err);
              } else {
                console.log('✓ Confidence distribution:');
                rows.forEach(row => {
                  console.log(`  ${row.confidence_range}: ${row.count}`);
                });
              }

              db.close();
            });
          } else {
            console.log('⚠ No data in database to analyze');
            db.close();
          }
        }
      });
    } else {
      console.log('⚠ financial_forms table does not exist');
      db.close();
    }
  });
}

testAnalytics().catch(console.error);
