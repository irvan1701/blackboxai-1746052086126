const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { body, validationResult } = require('express-validator');

// Validation rules for budget
const budgetValidation = [
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
    .isIn(['RIIT', 'Internal', 'Kewirausahaan', 'Regional', 'Medvis'])
    .withMessage('Invalid department'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('fiscalYear')
    .isInt({ min: 2023 })
    .withMessage('Invalid fiscal year')
];

// Get all department budgets
router.get('/', async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Get budgets with spent amount for each department
    const budgets = await dbAsync.all(`
      SELECT 
        b.*,
        COALESCE(SUM(e.amount), 0) as spent_amount,
        b.amount - COALESCE(SUM(e.amount), 0) as remaining_amount
      FROM budgets b
      LEFT JOIN expenses e ON b.department = e.department 
        AND strftime('%Y', e.date) = b.fiscal_year
      WHERE b.fiscal_year = ?
      GROUP BY b.department
    `, [currentYear]);

    res.json(budgets);
  } catch (error) {
    next(error);
  }
});

// Get budget overview with spending analysis
router.get('/overview', async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    
    const overview = await dbAsync.all(`
      WITH monthly_spending AS (
        SELECT 
          department,
          strftime('%m', date) as month,
          SUM(amount) as monthly_spent
        FROM expenses
        WHERE strftime('%Y', date) = ?
        GROUP BY department, month
      )
      SELECT 
        b.department,
        b.amount as total_budget,
        COALESCE(SUM(e.amount), 0) as total_spent,
        b.amount - COALESCE(SUM(e.amount), 0) as remaining,
        COALESCE(AVG(ms.monthly_spent), 0) as average_monthly_spending,
        CASE 
          WHEN COALESCE(SUM(e.amount), 0) > b.amount THEN 'exceeded'
          WHEN COALESCE(SUM(e.amount), 0) > b.amount * 0.8 THEN 'warning'
          ELSE 'normal'
        END as status
      FROM budgets b
      LEFT JOIN expenses e ON b.department = e.department 
        AND strftime('%Y', e.date) = b.fiscal_year
      LEFT JOIN monthly_spending ms ON b.department = ms.department
      WHERE b.fiscal_year = ?
      GROUP BY b.department
    `, [currentYear, currentYear]);

    res.json(overview);
  } catch (error) {
    next(error);
  }
});

// Set or update department budget
router.post('/', budgetValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid input', errors.array());
    }

    const { department, amount, fiscalYear } = req.body;

    // Check if budget already exists for the department and fiscal year
    const existingBudget = await dbAsync.get(
      'SELECT * FROM budgets WHERE department = ? AND fiscal_year = ?',
      [department, fiscalYear]
    );

    if (existingBudget) {
      // Update existing budget
      await dbAsync.run(
        'UPDATE budgets SET amount = ? WHERE department = ? AND fiscal_year = ?',
        [amount, department, fiscalYear]
      );
    } else {
      // Create new budget
      await dbAsync.run(
        'INSERT INTO budgets (department, amount, fiscal_year) VALUES (?, ?, ?)',
        [department, amount, fiscalYear]
      );
    }

    // Get updated budget with spending information
    const updatedBudget = await dbAsync.get(`
      SELECT 
        b.*,
        COALESCE(SUM(e.amount), 0) as spent_amount,
        b.amount - COALESCE(SUM(e.amount), 0) as remaining_amount
      FROM budgets b
      LEFT JOIN expenses e ON b.department = e.department 
        AND strftime('%Y', e.date) = b.fiscal_year
      WHERE b.department = ? AND b.fiscal_year = ?
      GROUP BY b.department
    `, [department, fiscalYear]);

    res.json(updatedBudget);
  } catch (error) {
    next(error);
  }
});

// Get department spending trends
router.get('/trends/:department', async (req, res, next) => {
  try {
    const { department } = req.params;
    const currentYear = new Date().getFullYear();

    // Get monthly spending trends
    const trends = await dbAsync.all(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(amount) as total_spent,
        COUNT(*) as transaction_count
      FROM expenses
      WHERE department = ?
        AND strftime('%Y', date) = ?
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month
    `, [department, currentYear]);

    // Get category breakdown
    const categoryBreakdown = await dbAsync.all(`
      SELECT 
        category,
        SUM(amount) as total_spent,
        COUNT(*) as transaction_count
      FROM expenses
      WHERE department = ?
        AND strftime('%Y', date) = ?
      GROUP BY category
      ORDER BY total_spent DESC
    `, [department, currentYear]);

    res.json({
      trends,
      categoryBreakdown
    });
  } catch (error) {
    next(error);
  }
});

// Check budget alerts
router.get('/alerts', async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    
    const alerts = await dbAsync.all(`
      SELECT 
        b.department,
        b.amount as budget_amount,
        COALESCE(SUM(e.amount), 0) as spent_amount,
        b.amount - COALESCE(SUM(e.amount), 0) as remaining_amount,
        CASE 
          WHEN COALESCE(SUM(e.amount), 0) > b.amount THEN 'exceeded'
          WHEN COALESCE(SUM(e.amount), 0) > b.amount * 0.8 THEN 'warning'
          ELSE 'normal'
        END as status
      FROM budgets b
      LEFT JOIN expenses e ON b.department = e.department 
        AND strftime('%Y', e.date) = b.fiscal_year
      WHERE b.fiscal_year = ?
        AND (
          COALESCE(SUM(e.amount), 0) > b.amount
          OR COALESCE(SUM(e.amount), 0) > b.amount * 0.8
        )
      GROUP BY b.department
    `, [currentYear]);

    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
