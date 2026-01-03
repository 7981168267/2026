const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'tasktracker',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Make sure MySQL/MariaDB is running (check XAMPP/WAMP)');
    console.error('2. Verify database "tasktracker" exists in phpMyAdmin');
    console.error('3. Check .env file has correct DB_HOST, DB_USER, DB_PASSWORD');
    console.error('4. Ensure MySQL service is started\n');
    return false;
  }
};

module.exports = { sequelize, testConnection };

