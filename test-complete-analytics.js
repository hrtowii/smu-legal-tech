const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function testCompleteAnalytics() {
  const dbPath = path.join(__dirname, 'legal_forms.db');
  console.log('🔍 Testing Complete Analytics Functionality');
  console.log('='.repeat(50));

  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err);
      return;
    }
    console.log('✅ Connected to SQLite database');
  });

  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // Test 1: Basic table existence and data count
        console.log('\n📊 TEST 1: Database Structure');
        console.log('-'.repeat(30));

        const tableCheck = await new Promise((res, rej) => {
          db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='financial_forms'", (err, row) => {
            if (err) rej(err);
            else res(row);
          });
        });

        if (!tableCheck) {
          console.log('❌ financial_forms table does not exist');
          db.close();
          reject(new Error('Table not found'));
          return;
        }
        console.log('✅ financial_forms table exists');

        const totalCount = await new Promise((res, rej) => {
          db.get("SELECT COUNT(*) as count FROM financial_forms", (err, row) => {
            if (err) rej(err);
            else res(row.count);
          });
        });
        console.log(`✅ Total forms in database: ${totalCount}`);

        if (totalCount === 0) {
          console.log('⚠️  No data to analyze, stopping tests');
          db.close();
          resolve();
          return;
        }

        // Test 2: Confidence Distribution Analysis
        console.log('\n📈 TEST 2: Confidence Distribution');
        console.log('-'.repeat(30));

        const confidenceData = await new Promise((res, rej) => {
          db.all(`
            SELECT
              CASE
                WHEN confidence >= 0.9 THEN 'Very High (90%+)'
                WHEN confidence >= 0.8 THEN 'High (80-89%)'
                WHEN confidence >= 0.7 THEN 'Medium (70-79%)'
                WHEN confidence >= 0.6 THEN 'Low (60-69%)'
                ELSE 'Very Low (<60%)'
              END as confidence_range,
              COUNT(*) as count,
              ROUND(AVG(confidence) * 100, 1) as avg_confidence
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
            if (err) rej(err);
            else res(rows);
          });
        });

        confidenceData.forEach(row => {
          console.log(`📊 ${row.confidence_range}: ${row.count} forms (avg: ${row.avg_confidence}%)`);
        });

        // Test 3: Flag Analysis
        console.log('\n🚩 TEST 3: Common Issues/Flags');
        console.log('-'.repeat(30));

        const flagData = await new Promise((res, rej) => {
          db.all(`
            SELECT
              json_extract(flags, '$[0]') as flag_type,
              COUNT(*) as count
            FROM financial_forms
            WHERE json_extract(flags, '$[0]') IS NOT NULL AND json_extract(flags, '$[0]') != ''
            GROUP BY json_extract(flags, '$[0]')
            ORDER BY count DESC
            LIMIT 5
          `, (err, rows) => {
            if (err) rej(err);
            else res(rows);
          });
        });

        if (flagData.length > 0) {
          flagData.forEach(row => {
            console.log(`🚩 ${row.flag_type}: ${row.count} occurrences`);
          });
        } else {
          console.log('✅ No issues/flags found in data');
        }

        // Test 4: Income Source Analysis
        console.log('\n💰 TEST 4: Income Source Analysis');
        console.log('-'.repeat(30));

        const incomeData = await new Promise((res, rej) => {
          db.all(`
            SELECT
              'Applicant Income' as source_type,
              COUNT(*) as count,
              ROUND(AVG(gross_monthly_income_sgd), 2) as avg_amount,
              MIN(gross_monthly_income_sgd) as min_amount,
              MAX(gross_monthly_income_sgd) as max_amount
            FROM applicant_income
            WHERE gross_monthly_income_sgd > 0
            UNION ALL
            SELECT
              'Household Income' as source_type,
              COUNT(*) as count,
              ROUND(AVG(gross_monthly_income_sgd), 2) as avg_amount,
              MIN(gross_monthly_income_sgd) as min_amount,
              MAX(gross_monthly_income_sgd) as max_amount
            FROM household_income
            WHERE gross_monthly_income_sgd > 0
            UNION ALL
            SELECT
              'Other Income' as source_type,
              COUNT(*) as count,
              ROUND(AVG(amount_sgd), 2) as avg_amount,
              MIN(amount_sgd) as min_amount,
              MAX(amount_sgd) as max_amount
            FROM other_income_sources
            WHERE amount_sgd > 0
          `, (err, rows) => {
            if (err) rej(err);
            else res(rows);
          });
        });

        incomeData.forEach(row => {
          if (row.count > 0) {
            console.log(`💰 ${row.source_type}:`);
            console.log(`   Count: ${row.count} | Avg: $${row.avg_amount} | Range: $${row.min_amount} - $${row.max_amount}`);
          }
        });

        // Test 5: Popular Occupations
        console.log('\n👔 TEST 5: Most Common Occupations');
        console.log('-'.repeat(30));

        const occupationData = await new Promise((res, rej) => {
          db.all(`
            SELECT
              occupation,
              COUNT(*) as count,
              ROUND(AVG(gross_monthly_income_sgd), 2) as avg_income
            FROM (
              SELECT occupation, gross_monthly_income_sgd
              FROM applicant_income
              WHERE occupation IS NOT NULL AND occupation != '' AND gross_monthly_income_sgd > 0
              UNION ALL
              SELECT occupation, gross_monthly_income_sgd
              FROM household_income
              WHERE occupation IS NOT NULL AND occupation != '' AND gross_monthly_income_sgd > 0
            )
            GROUP BY occupation
            HAVING COUNT(*) >= 1
            ORDER BY count DESC, avg_income DESC
            LIMIT 8
          `, (err, rows) => {
            if (err) rej(err);
            else res(rows);
          });
        });

        if (occupationData.length > 0) {
          occupationData.forEach(row => {
            console.log(`👔 ${row.occupation}: ${row.count} people (avg income: $${row.avg_income})`);
          });
        } else {
          console.log('⚠️  No occupation data found');
        }

        // Test 6: Income Range Distribution
        console.log('\n📊 TEST 6: Income Range Distribution');
        console.log('-'.repeat(30));

        const rangeData = await new Promise((res, rej) => {
          db.all(`
            SELECT
              CASE
                WHEN income >= 5000 THEN '$5000+'
                WHEN income >= 3000 THEN '$3000-4999'
                WHEN income >= 2000 THEN '$2000-2999'
                WHEN income >= 1000 THEN '$1000-1999'
                WHEN income >= 500 THEN '$500-999'
                ELSE '$0-499'
              END as income_range,
              COUNT(*) as count,
              ROUND(AVG(income), 2) as avg_in_range
            FROM (
              SELECT gross_monthly_income_sgd as income FROM applicant_income WHERE gross_monthly_income_sgd > 0
              UNION ALL
              SELECT gross_monthly_income_sgd as income FROM household_income WHERE gross_monthly_income_sgd > 0
            )
            GROUP BY
              CASE
                WHEN income >= 5000 THEN '$5000+'
                WHEN income >= 3000 THEN '$3000-4999'
                WHEN income >= 2000 THEN '$2000-2999'
                WHEN income >= 1000 THEN '$1000-1999'
                WHEN income >= 500 THEN '$500-999'
                ELSE '$0-499'
              END
            ORDER BY avg_in_range
          `, (err, rows) => {
            if (err) rej(err);
            else res(rows);
          });
        });

        rangeData.forEach(row => {
          console.log(`📊 ${row.income_range}: ${row.count} entries (avg: $${row.avg_in_range})`);
        });

        // Test 7: Summary Statistics
        console.log('\n📋 TEST 7: Summary Statistics');
        console.log('-'.repeat(30));

        const summaryStats = await new Promise((res, rej) => {
          db.get(`
            SELECT
              COUNT(*) as total_forms,
              ROUND(AVG(confidence) * 100, 1) as avg_confidence,
              COUNT(CASE WHEN confidence < 0.7 THEN 1 END) as low_confidence_count,
              COUNT(CASE WHEN json_array_length(flags) > 0 THEN 1 END) as forms_with_flags,
              MIN(confidence) as min_confidence,
              MAX(confidence) as max_confidence
            FROM financial_forms
          `, (err, row) => {
            if (err) rej(err);
            else res(row);
          });
        });

        console.log(`📊 Total Forms: ${summaryStats.total_forms}`);
        console.log(`📊 Average Confidence: ${summaryStats.avg_confidence}%`);
        console.log(`📊 Low Confidence Forms (<70%): ${summaryStats.low_confidence_count}`);
        console.log(`📊 Forms with Issues: ${summaryStats.forms_with_flags}`);
        console.log(`📊 Confidence Range: ${Math.round(summaryStats.min_confidence * 100)}% - ${Math.round(summaryStats.max_confidence * 100)}%`);

        // Test 8: Recent Activity (if available)
        console.log('\n📅 TEST 8: Recent Activity');
        console.log('-'.repeat(30));

        const recentActivity = await new Promise((res, rej) => {
          db.all(`
            SELECT
              date(created_at) as submission_date,
              COUNT(*) as daily_submissions,
              ROUND(AVG(confidence) * 100, 1) as daily_avg_confidence
            FROM financial_forms
            WHERE created_at >= date('now', '-30 days')
            GROUP BY date(created_at)
            ORDER BY submission_date DESC
            LIMIT 10
          `, (err, rows) => {
            if (err) rej(err);
            else res(rows);
          });
        });

        if (recentActivity.length > 0) {
          recentActivity.forEach(row => {
            console.log(`📅 ${row.submission_date}: ${row.daily_submissions} submissions (avg confidence: ${row.daily_avg_confidence}%)`);
          });
        } else {
          console.log('⚠️  No recent activity data available');
        }

        console.log('\n🎉 ANALYTICS TEST COMPLETE!');
        console.log('='.repeat(50));
        console.log('✅ All analytics queries executed successfully');
        console.log('📊 Dashboard should display comprehensive charts with this data');
        console.log('🚀 Analytics system is ready for production use');

        db.close();
        resolve();

      } catch (error) {
        console.error('❌ Test failed:', error);
        db.close();
        reject(error);
      }
    });
  });
}

// Run the complete analytics test
testCompleteAnalytics()
  .then(() => {
    console.log('\n✅ Analytics test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analytics test failed:', error);
    process.exit(1);
  });
