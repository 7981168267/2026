const { sequelize } = require('../config/database');
const { User } = require('../models');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Connected to MySQL database');

    // Sync models
    await sequelize.sync({ alter: false });

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@example.com' } });
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email: admin@example.com');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed by beforeCreate hook
      role: 'admin'
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
