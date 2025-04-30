require('dotenv').config();
const bcrypt = require('bcryptjs');
const { dbAsync, initializeDatabase } = require('../db');

async function createAdminUser() {
  try {
    // Initialize database and tables
    initializeDatabase();

    // Admin user credentials
    const adminUser = {
      username: 'admin@apmi.org',
      password: 'Admin@APMI2023',
      role: 'admin'
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);

    // Check if admin user already exists
    const existingUser = await dbAsync.get(
      'SELECT id FROM users WHERE username = ?',
      [adminUser.username]
    );

    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }

    // Insert admin user
    await dbAsync.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [adminUser.username, hashedPassword, adminUser.role]
    );

    console.log('Admin user created successfully');
    console.log('Username:', adminUser.username);
    console.log('Password:', adminUser.password);
    console.log('\nPlease change the password after first login!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Run the script
createAdminUser();
