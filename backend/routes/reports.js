const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db');
const { ValidationError } = require('../middleware/errorHandler');
const { query, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Validation rules for report generation
const reportValidation = [
  query('startDate')
    .isISO8601()
    .withMessage('Start date is required and must be valid'),
  query('endDate')
    .isISO8601()
    .withMessage('End date is required and must be valid'),
  query('type')
    .isIn(['all', 'income', 'expense', 'budget'])
    .withMessage('Invalid report type'),
  query('department')
    .optional()
    .isIn(['all', 'RIIT', 'Internal', 'Kewirausahaan', 'Regional', 'Medvis'])
    .withMessage('Invalid department'),
  query('format')
    .isIn(['csv', 'pdf'])
    .withMessage('Invalid format')
];

// Generate financial report
router.get('/generate', reportValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid parameters', errors.array());
    }

    const { startDate, endDate, type, department, format } = req.query;

    // Prepare base data based on report type
    let data = {};
    
    if (type === 'all' || type === 'income') {
      // Get income data
      const incomeQuery = `
        SELECT 
          i.*,
          strftime('%Y-%m', i.date) as month
        FROM income i
        WHERE i.date BETWEEN ? AND ?
        ${department !== 'all' ? 'AND i.department = ?' : ''}
        ORDER BY i.date DESC
      `;
      
      const incomeParams = department !== 'all' 
        ? [startDate, endDate, department]
        : [startDate, endDate];

      data.income = await dbAsync.all(incomeQuery, incomeParams);
    }

    if (type === 'all' || type === 'expense') {
      // Get expense data
      const expenseQuery = `
        SELECT 
          e.*,
          strftime('%Y-%m', e.date) as month
        FROM expenses e
        WHERE e.date BETWEEN ? AND ?
        ${department !== 'all' ? 'AND e.department = ?' : ''}
        ORDER BY e.date DESC
      `;

      const expenseParams = department !== 'all'
        ? [startDate, endDate, department]
        : [startDate, endDate];

      data.expenses = await dbAsync.all(expenseQuery, expenseParams);
    }

    if (type === 'all' || type === 'budget') {
      // Get budget data
      const budgetQuery = `
        SELECT 
          b.*,
          COALESCE(SUM(e.amount), 0) as spent_amount,
          b.amount - COALESCE(SUM(e.amount), 0) as remaining_amount
        FROM budgets b
        LEFT JOIN expenses e ON b.department = e.department 
          AND e.date BETWEEN ? AND ?
        WHERE b.fiscal_year = strftime('%Y', ?)
        ${department !== 'all' ? 'AND b.department = ?' : ''}
        GROUP BY b.department
      `;

      const budgetParams = department !== 'all'
        ? [startDate, endDate, startDate, department]
        : [startDate, endDate, startDate];

      data.budgets = await dbAsync.all(budgetQuery, budgetParams);
    }

    // Calculate summary
    const summary = {
      periodStart: startDate,
      periodEnd: endDate,
      totalIncome: data.income ? data.income.reduce((sum, i) => sum + i.amount, 0) : 0,
      totalExpenses: data.expenses ? data.expenses.reduce((sum, e) => sum + e.amount, 0) : 0,
      netBalance: 0,
    };
    summary.netBalance = summary.totalIncome - summary.totalExpenses;

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `financial-report-${type}-${timestamp}.${format}`;
    const filepath = path.join(reportsDir, filename);

    // Generate report file
    if (format === 'csv') {
      await generateCSV(filepath, data, summary);
    } else {
      await generatePDF(filepath, data, summary);
    }

    // Save report record
    await dbAsync.run(
      `INSERT INTO reports (type, department, start_date, end_date, format, file_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [type, department, startDate, endDate, format, filepath]
    );

    // Stream the file to client
    res.download(filepath, filename, (err) => {
      if (err) {
        next(err);
      }
      // Delete the file after sending
      fs.unlinkSync(filepath);
    });
  } catch (error) {
    next(error);
  }
});

// Get recent reports
router.get('/recent', async (req, res, next) => {
  try {
    const reports = await dbAsync.all(`
      SELECT *
      FROM reports
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json(reports);
  } catch (error) {
    next(error);
  }
});

// Helper function to generate CSV
async function generateCSV(filepath, data, summary) {
  let csvContent = 'Financial Report\n';
  csvContent += `Period: ${summary.periodStart} to ${summary.periodEnd}\n\n`;
  csvContent += `Total Income: ${summary.totalIncome}\n`;
  csvContent += `Total Expenses: ${summary.totalExpenses}\n`;
  csvContent += `Net Balance: ${summary.netBalance}\n\n`;

  if (data.income) {
    csvContent += '\nINCOME\n';
    csvContent += 'Date,Source,Category,Amount,Description\n';
    data.income.forEach(i => {
      csvContent += `${i.date},${i.source},${i.category},${i.amount},${i.description || ''}\n`;
    });
  }

  if (data.expenses) {
    csvContent += '\nEXPENSES\n';
    csvContent += 'Date,Category,Department,Amount,Status,Description\n';
    data.expenses.forEach(e => {
      csvContent += `${e.date},${e.category},${e.department},${e.amount},${e.status},${e.description || ''}\n`;
    });
  }

  if (data.budgets) {
    csvContent += '\nBUDGETS\n';
    csvContent += 'Department,Budget Amount,Spent Amount,Remaining Amount\n';
    data.budgets.forEach(b => {
      csvContent += `${b.department},${b.amount},${b.spent_amount},${b.remaining_amount}\n`;
    });
  }

  fs.writeFileSync(filepath, csvContent);
}

// Helper function to generate PDF
async function generatePDF(filepath, data, summary) {
  // Note: In a real implementation, you would use a PDF generation library
  // such as PDFKit to create a properly formatted PDF file.
  // For now, we'll create a simple text file with .pdf extension
  let content = 'Financial Report\n';
  content += `Period: ${summary.periodStart} to ${summary.periodEnd}\n\n`;
  content += `Total Income: ${summary.totalIncome}\n`;
  content += `Total Expenses: ${summary.totalExpenses}\n`;
  content += `Net Balance: ${summary.netBalance}\n`;

  fs.writeFileSync(filepath, content);
}

module.exports = router;
