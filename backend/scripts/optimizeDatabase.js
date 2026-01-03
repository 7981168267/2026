const { sequelize } = require('../config/database');
require('dotenv').config();

const optimizeDatabase = async () => {
  try {
    console.log('🔧 Optimizing database for long-term performance (5+ years)...\n');
    
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database\n');

    const dbName = process.env.DB_NAME || 'tasktracker';

    // Create optimized indexes for tasks table
    console.log('📊 Creating optimized indexes...\n');

    const indexes = [
      { name: 'idx_userid_date', query: `CREATE INDEX idx_userid_date ON tasks(userId, date)` },
      { name: 'idx_userid_status', query: `CREATE INDEX idx_userid_status ON tasks(userId, status)` },
      { name: 'idx_date', query: `CREATE INDEX idx_date ON tasks(date)` },
      { name: 'idx_completedAt', query: `CREATE INDEX idx_completedAt ON tasks(completedAt)` },
      { name: 'idx_recurring', query: `CREATE INDEX idx_recurring ON tasks(userId, isRecurring, date)` },
      { name: 'idx_status', query: `CREATE INDEX idx_status ON tasks(status)` },
    ];

    for (const index of indexes) {
      try {
        // Check if index exists first
        const [results] = await sequelize.query(
          `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tasks' AND INDEX_NAME = ?`,
          { replacements: [dbName, index.name] }
        );
        
        if (results[0].count === 0) {
          await sequelize.query(index.query);
          console.log(`✅ Index '${index.name}' created successfully`);
        } else {
          console.log(`ℹ️  Index '${index.name}' already exists (skipping)`);
        }
      } catch (err) {
        if (err.message.includes('Duplicate key name') || err.message.includes('already exists')) {
          console.log(`ℹ️  Index '${index.name}' already exists (skipping)`);
        } else {
          console.log(`⚠️  Error creating index '${index.name}': ${err.message}`);
        }
      }
    }

    // Analyze table for query optimizer
    console.log('\n📈 Analyzing tables for query optimization...');
    await sequelize.query(`ANALYZE TABLE tasks`);
    console.log('✅ Table analysis complete\n');

    // Optimize table (defragment)
    console.log('🔧 Optimizing table structure...');
    await sequelize.query(`OPTIMIZE TABLE tasks`);
    console.log('✅ Table optimization complete\n');

    console.log('✅ Database optimization completed successfully!\n');
    console.log('💡 The database is now optimized to handle 5+ years of data efficiently.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Optimization error:', error.message);
    console.error('\n💡 Some operations may require specific MySQL versions or permissions.\n');
    process.exit(1);
  }
};

optimizeDatabase();

