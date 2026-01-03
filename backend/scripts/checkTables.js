require('dotenv').config();
const { sequelize } = require('../config/database');

const checkTables = async () => {
  try {
    const [results] = await sequelize.query('SHOW TABLES');
    const existingTables = results.map(r => Object.values(r)[0]);
    
    console.log('Existing tables:', existingTables.join(', '));
    console.log('\nExpected tables:');
    
    const expectedTables = [
      'users',
      'tasks',
      'notifications',
      'subtasks',
      'time_entries',
      'recurring_task_templates',
      'habits',
      'habit_completions',
      'task_templates',
      'categories'
    ];
    
    expectedTables.forEach(table => {
      const exists = existingTables.includes(table);
      console.log(`  ${exists ? '[OK]' : '[MISSING]'} ${table}`);
    });
    
    const missing = expectedTables.filter(t => !existingTables.includes(t));
    if (missing.length > 0) {
      console.log(`\nMissing ${missing.length} table(s): ${missing.join(', ')}`);
      console.log('Run: node scripts/setupDatabase.js to create missing tables');
    } else {
      console.log('\nAll tables exist!');
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkTables();

