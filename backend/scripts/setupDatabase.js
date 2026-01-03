const { sequelize } = require('../config/database');
const { User, Task, Notification } = require('../models');

const setupDatabase = async () => {
  try {
    console.log('Setting up database...');
    
    // Sync all models (create tables)
    await sequelize.sync({ force: false, alter: false });
    console.log('Database tables created/verified successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Database setup error:', error);
    process.exit(1);
  }
};

setupDatabase();

