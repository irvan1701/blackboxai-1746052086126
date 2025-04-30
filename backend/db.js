const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const db = new sqlite3.Database(
  path.join(__dirname, 'data', 'database.sqlite'),
  (err) => {
    if (err) {
      console.error('Database connection error:', err);
    } else {
      console.log('Connected to SQLite database');
    }
  }
);

// Initialize database tables
const initializeDatabase = () => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount DECIMAL(10,2) NOT NULL,
      source TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount DECIMAL(10,2) NOT NULL,
      category TEXT NOT NULL,
      department TEXT NOT NULL,
      description TEXT,
      receipt_path TEXT,
      date DATE NOT NULL,
      due_date DATE,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department TEXT UNIQUE NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      fiscal_year INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      department TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      format TEXT NOT NULL,
      file_path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  // Create tables
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    tables.forEach((table) => {
      db.run(table, (err) => {
        if (err) {
          console.error('Error creating table:', err);
        }
      });
    });

    // Create triggers for updated_at
    const updateTriggers = [
      `CREATE TRIGGER IF NOT EXISTS income_updated_at 
       AFTER UPDATE ON income
       BEGIN
         UPDATE income SET updated_at = CURRENT_TIMESTAMP
         WHERE id = NEW.id;
       END`,

      `CREATE TRIGGER IF NOT EXISTS expenses_updated_at
       AFTER UPDATE ON expenses
       BEGIN
         UPDATE expenses SET updated_at = CURRENT_TIMESTAMP
         WHERE id = NEW.id;
       END`,

      `CREATE TRIGGER IF NOT EXISTS budgets_updated_at
       AFTER UPDATE ON budgets
       BEGIN
         UPDATE budgets SET updated_at = CURRENT_TIMESTAMP
         WHERE id = NEW.id;
       END`
    ];

    updateTriggers.forEach((trigger) => {
      db.run(trigger, (err) => {
        if (err) {
          console.error('Error creating trigger:', err);
        }
      });
    });
  });
};

// Helper functions for database operations
const dbAsync = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  },

  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
};

module.exports = {
  db,
  dbAsync,
  initializeDatabase
};
