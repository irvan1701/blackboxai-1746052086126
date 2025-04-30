const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbAsync } = require('../db');
const { ValidationError } = require('../middleware/errorHandler');
const { body, validationResult } = require('express-validator');

// Login validation rules
const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').trim().notEmpty().withMessage('Password is required'),
];

// Login route
router.post('/login', loginValidation, async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid input', errors.array());
    }

    const { username, password } = req.body;

    // Get user from database
    const user = await dbAsync.get(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      throw new ValidationError('Invalid credentials');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ValidationError('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Register route (for initial setup or admin use)
router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password')
      .trim()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .trim()
      .isIn(['admin', 'user'])
      .withMessage('Invalid role specified'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Invalid input', errors.array());
      }

      const { username, password, role } = req.body;

      // Check if user already exists
      const existingUser = await dbAsync.get(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );

      if (existingUser) {
        throw new ValidationError('Username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const result = await dbAsync.run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role]
      );

      res.status(201).json({
        message: 'User created successfully',
        userId: result.id
      });
    } catch (error) {
      next(error);
    }
  }
);

// Change password route
router.post(
  '/change-password',
  [
    body('currentPassword').trim().notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .trim()
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Invalid input', errors.array());
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      // Get user from database
      const user = await dbAsync.get(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        throw new ValidationError('User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new ValidationError('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await dbAsync.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
