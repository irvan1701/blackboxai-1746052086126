const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { body, query, validationResult } = require('express-validator');

// Validation rules for income
const incomeValidation = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Source is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('description')
    .optional()
    .trim()
];

// Get all income records with optional filters
router.get('/', [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('category').optional().trim(),
  query('source').optional().trim(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid query parameters', errors.array());
    }

    const { startDate, endDate, category, source } = req.query;
    let sql = 'SELECT * FROM income WHERE 1=1';
    const params = [];

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (source) {
      sql += ' AND source = ?';
      params.push(source);
    }

    sql += ' ORDER BY date DESC';

    const incomes = await dbAsync.all(sql, params);
    res.json(incomes);
  } catch (error) {
    next(error);
  }
});

// Get income statistics
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await dbAsync.all(`
      SELECT 
        SUM(amount) as total,
        category,
        strftime('%Y-%m', date) as month
      FROM income 
      WHERE date >= date('now', '-12 months')
      GROUP BY category, month
      ORDER BY month DESC, category
    `);

    const categories = await dbAsync.all(`
      SELECT DISTINCT category
      FROM income
      ORDER BY category
    `);

    res.json({
      stats,
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    next(error);
  }
});

// Add new income
router.post('/', incomeValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid input', errors.array());
    }

    const { amount, source, category, date, description } = req.body;

    const result = await dbAsync.run(
      `INSERT INTO income (amount, source, category, date, description)
       VALUES (?, ?, ?, ?, ?)`,
      [amount, source, category, date, description]
    );

    const newIncome = await dbAsync.get(
      'SELECT * FROM income WHERE id = ?',
      [result.id]
    );

    res.status(201).json(newIncome);
  } catch (error) {
    next(error);
  }
});

// Update income
router.put('/:id', incomeValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid input', errors.array());
    }

    const { id } = req.params;
    const { amount, source, category, date, description } = req.body;

    // Check if income exists
    const income = await dbAsync.get(
      'SELECT id FROM income WHERE id = ?',
      [id]
    );

    if (!income) {
      throw new NotFoundError('Income record not found');
    }

    await dbAsync.run(
      `UPDATE income 
       SET amount = ?, source = ?, category = ?, date = ?, description = ?
       WHERE id = ?`,
      [amount, source, category, date, description, id]
    );

    const updatedIncome = await dbAsync.get(
      'SELECT * FROM income WHERE id = ?',
      [id]
    );

    res.json(updatedIncome);
  } catch (error) {
    next(error);
  }
});

// Delete income
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if income exists
    const income = await dbAsync.get(
      'SELECT id FROM income WHERE id = ?',
      [id]
    );

    if (!income) {
      throw new NotFoundError('Income record not found');
    }

    await dbAsync.run('DELETE FROM income WHERE id = ?', [id]);

    res.json({ message: 'Income record deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get income categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await dbAsync.all(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total
      FROM income
      GROUP BY category
      ORDER BY total DESC
    `);

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
