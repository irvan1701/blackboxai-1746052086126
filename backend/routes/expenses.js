const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { dbAsync } = require('../db');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { body, query, validationResult } = require('express-validator');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/receipts';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .jpg, .png and .pdf files are allowed'));
    }
  }
});

// Validation rules for expenses
const expenseValidation = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['pending', 'paid', 'overdue'])
    .withMessage('Invalid status')
];

// Get all expenses with optional filters
router.get('/', [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('category').optional().trim(),
  query('department').optional().trim(),
  query('status').optional().isIn(['pending', 'paid', 'overdue']).withMessage('Invalid status'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid query parameters', errors.array());
    }

    const { startDate, endDate, category, department, status } = req.query;
    let sql = 'SELECT * FROM expenses WHERE 1=1';
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
    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY date DESC';

    const expenses = await dbAsync.all(sql, params);
    res.json(expenses);
  } catch (error) {
    next(error);
  }
});

// Get expense statistics
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await dbAsync.all(`
      SELECT 
        SUM(amount) as total,
        category,
        department,
        strftime('%Y-%m', date) as month
      FROM expenses 
      WHERE date >= date('now', '-12 months')
      GROUP BY category, department, month
      ORDER BY month DESC, category
    `);

    const categories = await dbAsync.all(`
      SELECT DISTINCT category
      FROM expenses
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

// Add new expense
router.post('/', upload.single('receipt'), expenseValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      throw new ValidationError('Invalid input', errors.array());
    }

    const {
      amount,
      category,
      department,
      date,
      dueDate,
      description,
      status = 'pending'
    } = req.body;

    const receipt_path = req.file ? req.file.path : null;

    const result = await dbAsync.run(
      `INSERT INTO expenses (
        amount, category, department, date, due_date, 
        description, status, receipt_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [amount, category, department, date, dueDate, description, status, receipt_path]
    );

    const newExpense = await dbAsync.get(
      'SELECT * FROM expenses WHERE id = ?',
      [result.id]
    );

    res.status(201).json(newExpense);
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

// Update expense
router.put('/:id', upload.single('receipt'), expenseValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      throw new ValidationError('Invalid input', errors.array());
    }

    const { id } = req.params;
    const {
      amount,
      category,
      department,
      date,
      dueDate,
      description,
      status
    } = req.body;

    // Check if expense exists and get current receipt path
    const expense = await dbAsync.get(
      'SELECT receipt_path FROM expenses WHERE id = ?',
      [id]
    );

    if (!expense) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      throw new NotFoundError('Expense record not found');
    }

    // Handle receipt update
    let receipt_path = expense.receipt_path;
    if (req.file) {
      // Delete old receipt if it exists
      if (expense.receipt_path && fs.existsSync(expense.receipt_path)) {
        fs.unlinkSync(expense.receipt_path);
      }
      receipt_path = req.file.path;
    }

    await dbAsync.run(
      `UPDATE expenses 
       SET amount = ?, category = ?, department = ?, date = ?, 
           due_date = ?, description = ?, status = ?, receipt_path = ?
       WHERE id = ?`,
      [amount, category, department, date, dueDate, description, status, receipt_path, id]
    );

    const updatedExpense = await dbAsync.get(
      'SELECT * FROM expenses WHERE id = ?',
      [id]
    );

    res.json(updatedExpense);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

// Delete expense
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get expense and receipt path
    const expense = await dbAsync.get(
      'SELECT receipt_path FROM expenses WHERE id = ?',
      [id]
    );

    if (!expense) {
      throw new NotFoundError('Expense record not found');
    }

    // Delete receipt file if it exists
    if (expense.receipt_path && fs.existsSync(expense.receipt_path)) {
      fs.unlinkSync(expense.receipt_path);
    }

    await dbAsync.run('DELETE FROM expenses WHERE id = ?', [id]);

    res.json({ message: 'Expense record deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get expense categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await dbAsync.all(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total
      FROM expenses
      GROUP BY category
      ORDER BY total DESC
    `);

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
