/**
 * Create Database Script
 * Creates the database if it doesn't exist
 * Run: node scripts/createDatabase.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const createDatabase = async () => {
  try {
    const dbName = process.env.DB_NAME || 'tasktracker';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 3306;

    console.log('🔄 Creating database...\n');
    console.log(`Database name: ${dbName}`);
    console.log(`Host: ${dbHost}:${dbPort}`);
    console.log(`User: ${dbUser}\n`);

    // Connect to MySQL without specifying a database
    const sequelize = new Sequelize('', dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: 'mysql',
      logging: false
    });

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL server\n');

    // Check if database exists
    const [results] = await sequelize.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      { replacements: [dbName] }
    );

    if (results && results.length > 0) {
      console.log(`ℹ️  Database '${dbName}' already exists\n`);
    } else {
      // Create database
      await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`✅ Database '${dbName}' created successfully\n`);
    }

    await sequelize.close();
    console.log('✅ Database setup complete!\n');
    console.log('💡 Next steps:');
    console.log('   1. Run: node scripts/migrateAdvancedFeatures.js');
    console.log('   2. Run: node scripts/seedDefaultTemplates.js (optional)');
    console.log('   3. Run: node scripts/createAdmin.js (optional)\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure MySQL/MariaDB is running');
    console.error('   2. Check XAMPP/WAMP is started');
    console.error('   3. Verify DB_USER and DB_PASSWORD in .env file');
    console.error('   4. Ensure MySQL service is running\n');
    process.exit(1);
  }
};

createDatabase();

