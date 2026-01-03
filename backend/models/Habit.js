const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

/**
 * Habit Model
 * Tracks daily habits with streak counting
 */
const Habit = sequelize.define('Habit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#667eea',
    comment: 'Color code for the habit'
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Icon identifier'
  },
  currentStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Current consecutive days streak'
  },
  bestStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Best streak achieved'
  },
  totalCompletions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total times habit was completed'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'habits',
  timestamps: true,
  indexes: [
    {
      name: 'idx_userid_active',
      fields: ['userId', 'isActive']
    }
  ]
});

// Associations will be defined in models/index.js to avoid circular dependencies

module.exports = Habit;

