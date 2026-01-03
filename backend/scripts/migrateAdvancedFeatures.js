/**
 * Migration Script for Advanced Features
 * Adds new columns to tasks table and creates new tables
 * Run: node scripts/migrateAdvancedFeatures.js
 */

const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const migrateDatabase = async () => {
  try {
    console.log('🔄 Starting advanced features migration...\n');

    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Add new columns to tasks table
    console.log('📝 Adding new columns to tasks table...');
    
    // Helper function to check if column exists
    const columnExists = async (tableName, columnName) => {
      try {
        const results = await sequelize.query(
          `SELECT COUNT(*) as count 
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = '${tableName}' 
           AND COLUMN_NAME = '${columnName}'`,
          { type: QueryTypes.SELECT }
        );
        // Results is an array, first element has the count
        return results && results.length > 0 && parseInt(results[0].count) > 0;
      } catch (error) {
        console.warn(`  ⚠ Could not check if column '${columnName}' exists:`, error.message);
        return false;
      }
    };

    // Define columns to add
    const columnsToAdd = [
      {
        name: 'priority',
        definition: `ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT 'Task priority level'`
      },
      {
        name: 'category',
        definition: `VARCHAR(255) DEFAULT 'General' COMMENT 'Task category'`
      },
      {
        name: 'dueDate',
        definition: `DATETIME NULL COMMENT 'Task due date'`
      },
      {
        name: 'estimatedTime',
        definition: `INT NULL COMMENT 'Estimated time in minutes'`
      },
      {
        name: 'actualTime',
        definition: `INT DEFAULT 0 COMMENT 'Actual time spent in minutes'`
      },
      {
        name: 'recurringPattern',
        definition: `ENUM('daily', 'weekly', 'monthly', 'custom') NULL COMMENT 'Recurring pattern type'`
      },
      {
        name: 'recurringConfig',
        definition: `JSON NULL COMMENT 'JSON config for custom recurring patterns'`
      }
    ];

    // Add each column if it doesn't exist
    for (const column of columnsToAdd) {
      try {
        // First check if column exists
        const exists = await columnExists('tasks', column.name);
        if (exists) {
          console.log(`  ⚠ Column '${column.name}' already exists, skipping...`);
          continue;
        }
        
        // Try to add the column
        await sequelize.query(
          `ALTER TABLE tasks ADD COLUMN ${column.name} ${column.definition}`,
          { type: QueryTypes.RAW }
        );
        console.log(`  ✓ Added column '${column.name}'`);
      } catch (error) {
        // Handle duplicate column error (in case check failed)
        if (error.message.includes('Duplicate column name') || 
            error.message.includes('already exists') ||
            error.message.includes('ER_DUP_FIELDNAME')) {
          console.log(`  ⚠ Column '${column.name}' already exists, skipping...`);
        } else {
          console.error(`  ❌ Error adding column '${column.name}':`, error.message);
          // Don't throw - continue with other columns
          console.error(`  Continuing with other columns...`);
        }
      }
    }

    // Ensure tasks table exists before creating subtasks
    console.log('\n📝 Verifying tasks table exists...');
    const tasksTableCheck = await sequelize.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'tasks'`,
      { type: QueryTypes.SELECT }
    );
    
    if (!tasksTableCheck || tasksTableCheck.length === 0) {
      console.log('  ⚠ Tasks table does not exist. Creating base tables first...');
      // Use Sequelize to sync base models
      const { Task, User } = require('../models');
      await sequelize.sync({ alter: false });
      console.log('  ✓ Base tables created');
    } else {
      console.log('  ✓ Tasks table exists');
    }

    // Create subtasks table
    console.log('\n📝 Creating subtasks table...');
    
    // Check if table exists first
    const tables = await sequelize.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'subtasks'`,
      { type: QueryTypes.SELECT }
    );
    
    if (tables && tables.length > 0) {
      console.log('  ⚠ Subtasks table already exists, skipping...');
    } else {
      try {
        await sequelize.query(`
          CREATE TABLE subtasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          taskId INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status ENUM('pending', 'completed') DEFAULT 'pending',
          \`order\` INT DEFAULT 0 COMMENT 'Order of subtask within parent task',
          completedAt DATETIME NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
          INDEX idx_taskid (taskId),
          INDEX idx_taskid_status (taskId, status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `, { type: QueryTypes.RAW });
        console.log('  ✓ Subtasks table created');
      } catch (error) {
        if (error.message.includes('Failed to open the referenced table')) {
          console.error('  ❌ Error: tasks table does not exist. Please run setup-db first.');
          console.error('     Run: npm run setup-db');
          throw error;
        } else {
          throw error;
        }
      }
    }

    // Create time_entries table
    console.log('\n📝 Creating time_entries table...');
    
    const timeEntriesTables = await sequelize.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'time_entries'`,
      { type: QueryTypes.SELECT }
    );
    
    if (timeEntriesTables && timeEntriesTables.length > 0) {
      console.log('  ⚠ Time entries table already exists, skipping...');
    } else {
      try {
        await sequelize.query(`
          CREATE TABLE time_entries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          taskId INT NOT NULL,
          userId INT NOT NULL,
          startTime DATETIME NOT NULL COMMENT 'When the timer started',
          endTime DATETIME NULL COMMENT 'When the timer stopped',
          duration INT NULL COMMENT 'Duration in minutes',
          notes TEXT COMMENT 'Optional notes about this time entry',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_taskid (taskId),
          INDEX idx_userid (userId),
          INDEX idx_userid_date (userId, startTime)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `, { type: QueryTypes.RAW });
        console.log('  ✓ Time entries table created');
      } catch (error) {
        if (error.message.includes('Failed to open the referenced table')) {
          console.error('  ❌ Error: Referenced table does not exist. Please run setup-db first.');
          console.error('     Run: npm run setup-db');
          throw error;
        } else {
          throw error;
        }
      }
    }

    // Create recurring_task_templates table
    console.log('\n📝 Creating recurring_task_templates table...');
    
    const templatesTables = await sequelize.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'recurring_task_templates'`,
      { type: QueryTypes.SELECT }
    );
    
    if (templatesTables && templatesTables.length > 0) {
      console.log('  ⚠ Recurring task templates table already exists, skipping...');
    } else {
      await sequelize.query(`
        CREATE TABLE recurring_task_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(255) DEFAULT 'General',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        pattern ENUM('daily', 'weekly', 'monthly', 'custom') NOT NULL DEFAULT 'daily',
        patternConfig JSON COMMENT 'JSON config for custom patterns',
        startDate DATETIME NOT NULL,
        endDate DATETIME NULL COMMENT 'Optional end date',
        isActive BOOLEAN DEFAULT TRUE COMMENT 'Whether template is active',
        lastGeneratedDate DATETIME NULL COMMENT 'Last date when task was generated',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_userid_active (userId, isActive),
        INDEX idx_pattern (pattern, isActive)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `, { type: QueryTypes.RAW });
      console.log('  ✓ Recurring task templates table created');
    }

    // Create habits table
    console.log('\n📝 Creating habits table...');
    const habitsTables = await sequelize.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'habits'`,
      { type: QueryTypes.SELECT }
    );
    
    if (habitsTables && habitsTables.length > 0) {
      console.log('  ⚠ Habits table already exists, skipping...');
    } else {
      await sequelize.query(`
        CREATE TABLE habits (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          color VARCHAR(7) DEFAULT '#667eea',
          icon VARCHAR(50),
          currentStreak INT DEFAULT 0,
          bestStreak INT DEFAULT 0,
          totalCompletions INT DEFAULT 0,
          isActive BOOLEAN DEFAULT TRUE,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_userid_active (userId, isActive)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `, { type: QueryTypes.RAW });
      console.log('  ✓ Habits table created');
    }

    // Create habit_completions table
    console.log('\n📝 Creating habit_completions table...');
    const habitCompletionsTables = await sequelize.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'habit_completions'`,
      { type: QueryTypes.SELECT }
    );
    
    if (habitCompletionsTables && habitCompletionsTables.length > 0) {
      console.log('  ⚠ Habit completions table already exists, skipping...');
    } else {
      await sequelize.query(`
        CREATE TABLE habit_completions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          habitId INT NOT NULL,
          completionDate DATE NOT NULL,
          notes TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (habitId) REFERENCES habits(id) ON DELETE CASCADE,
          INDEX idx_habitid_date (habitId, completionDate),
          UNIQUE KEY unique_habit_date (habitId, completionDate),
          INDEX idx_completiondate (completionDate)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `, { type: QueryTypes.RAW });
      console.log('  ✓ Habit completions table created');
    }

    // Create task_templates table
    console.log('\n📝 Creating task_templates table...');
    const taskTemplatesTables = await sequelize.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'task_templates'`,
      { type: QueryTypes.SELECT }
    );
    
    if (taskTemplatesTables && taskTemplatesTables.length > 0) {
      console.log('  ⚠ Task templates table already exists, skipping...');
    } else {
      await sequelize.query(`
        CREATE TABLE task_templates (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          title VARCHAR(255) NOT NULL,
          taskDescription TEXT,
          category VARCHAR(255) DEFAULT 'General',
          priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
          estimatedTime INT,
          subtasks JSON,
          isPublic BOOLEAN DEFAULT FALSE,
          usageCount INT DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_userid (userId),
          INDEX idx_public (isPublic)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `, { type: QueryTypes.RAW });
      console.log('  ✓ Task templates table created');
    }

    // Create categories table
    console.log('\n📝 Creating categories table...');
    const categoriesTables = await sequelize.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'categories'`,
      { type: QueryTypes.SELECT }
    );
    
    if (categoriesTables && categoriesTables.length > 0) {
      console.log('  ⚠ Categories table already exists, skipping...');
    } else {
      await sequelize.query(`
        CREATE TABLE categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          color VARCHAR(7) DEFAULT '#667eea',
          icon VARCHAR(50),
          description TEXT,
          isDefault BOOLEAN DEFAULT FALSE,
          taskCount INT DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_userid (userId),
          UNIQUE KEY unique_user_category (userId, name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `, { type: QueryTypes.RAW });
      console.log('  ✓ Categories table created');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Test the new features in the frontend');
    console.log('   3. Update existing tasks with default values if needed\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Run migration
if (require.main === module) {
  migrateDatabase();
}

module.exports = { migrateDatabase };

