const { sequelize } = require('../config/database');
require('dotenv').config();

const migrateTaskTable = async () => {
  try {
    console.log('🔄 Migrating Task table to add new columns...\n');
    
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database\n');

    const dbName = process.env.DB_NAME || 'tasktracker';

    // Check if columns already exist
    const [results] = await sequelize.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tasks' AND COLUMN_NAME IN ('endDate', 'isRecurring', 'taskTemplateId')`,
      {
        replacements: [dbName]
      }
    );

    const existingColumns = Array.isArray(results) && results.length > 0 
      ? results.map(r => r.COLUMN_NAME) 
      : [];
    const columnsToAdd = [];

    if (!existingColumns.includes('endDate')) {
      columnsToAdd.push('ADD COLUMN endDate DATE NULL');
    }
    if (!existingColumns.includes('isRecurring')) {
      columnsToAdd.push('ADD COLUMN isRecurring TINYINT(1) DEFAULT 0');
    }
    if (!existingColumns.includes('taskTemplateId')) {
      columnsToAdd.push('ADD COLUMN taskTemplateId INT NULL');
    }

    if (columnsToAdd.length > 0) {
      for (const columnSql of columnsToAdd) {
        try {
          const alterQuery = `ALTER TABLE tasks ${columnSql}`;
          await sequelize.query(alterQuery);
          const columnName = columnSql.match(/ADD COLUMN (\w+)/)[1];
          console.log(`✅ Added column: ${columnName}`);
        } catch (err) {
          if (err.message.includes('Duplicate column')) {
            console.log(`ℹ️  Column already exists (skipping)`);
          } else {
            throw err;
          }
        }
      }
      console.log('');
    } else {
      console.log('ℹ️  All columns already exist. No migration needed.\n');
    }

    console.log('✅ Migration completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Make sure MySQL/MariaDB is running');
    console.error('2. Verify database "' + (process.env.DB_NAME || 'tasktracker') + '" exists');
    console.error('3. Check .env file has correct DB_NAME\n');
    process.exit(1);
  }
};

migrateTaskTable();

