/**
 * Database Check Script
 * Checks database connection and shows current status
 * Run: node scripts/checkDatabase.js
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, Task, Category, Habit, Notification } = require('../models');

const checkDatabase = async () => {
  try {
    console.log('🔍 Checking database connection and status...\n');
    
    // Test connection
    console.log('1️⃣ Testing database connection...');
    await sequelize.authenticate();
    console.log('   ✅ Database connection successful!\n');
    
    // Get database info
    console.log('2️⃣ Database information:');
    const [dbInfo] = await sequelize.query('SELECT DATABASE() as db');
    const dbName = dbInfo[0]?.db || 'Not connected';
    console.log(`   Database: ${dbName}`);
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || 3306}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}\n`);
    
    // Check tables
    console.log('3️⃣ Checking database tables...');
    const [tables] = await sequelize.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      { replacements: [dbName] }
    );
    
    if (tables.length === 0) {
      console.log('   ⚠️  No tables found in database');
      console.log('   💡 Run: node scripts/setupDatabase.js to create tables\n');
    } else {
      console.log(`   ✅ Found ${tables.length} table(s):`);
      tables.forEach(table => {
        console.log(`      - ${table.TABLE_NAME}`);
      });
      console.log('');
    }
    
    // Check data counts
    console.log('4️⃣ Checking data counts...');
    try {
      const userCount = await User.count();
      const taskCount = await Task.count();
      const categoryCount = await Category.count();
      const habitCount = await Habit.count();
      const notificationCount = await Notification.count();
      
      console.log(`   Users: ${userCount}`);
      console.log(`   Tasks: ${taskCount}`);
      console.log(`   Categories: ${categoryCount}`);
      console.log(`   Habits: ${habitCount}`);
      console.log(`   Notifications: ${notificationCount}\n`);
    } catch (err) {
      console.log('   ⚠️  Could not count records (tables may not exist yet)\n');
    }
    
    // Check recent users
    console.log('5️⃣ Recent users:');
    try {
      const users = await User.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'email', 'role', 'createdAt']
      });
      
      if (users.length === 0) {
        console.log('   ℹ️  No users found');
        console.log('   💡 Run: node scripts/createAdmin.js to create an admin user\n');
      } else {
        users.forEach(user => {
          console.log(`   - ${user.name} (${user.email}) - ${user.role} - Created: ${user.createdAt.toLocaleDateString()}`);
        });
        console.log('');
      }
    } catch (err) {
      console.log('   ⚠️  Could not fetch users (users table may not exist)\n');
    }
    
    console.log('✅ Database check complete!\n');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure MySQL/MariaDB is running');
    console.error('   2. Check XAMPP/WAMP is started');
    console.error('   3. Verify database exists: node scripts/createDatabase.js');
    console.error('   4. Check .env file configuration');
    console.error('   5. Ensure MySQL service is running\n');
    process.exit(1);
  }
};

checkDatabase();

