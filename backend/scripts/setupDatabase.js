const { sequelize } = require('../config/database');
// Import all models to ensure all tables are created
const { 
  User, 
  Task, 
  Notification, 
  Subtask, 
  TimeEntry, 
  RecurringTaskTemplate,
  Habit,
  HabitCompletion,
  TaskTemplate,
  Category
} = require('../models');

const setupDatabase = async () => {
  try {
    console.log('🔄 Setting up database...\n');
    
    // Sync all models (create tables)
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database tables created/verified successfully!\n');
    
    // Verify all tables exist
    const [results] = await sequelize.query('SHOW TABLES');
    const tables = results.map(r => Object.values(r)[0]);
    console.log(`📊 Created/Verified ${tables.length} table(s):`);
    tables.forEach(table => console.log(`   - ${table}`));
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

setupDatabase();

