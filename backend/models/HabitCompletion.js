const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * HabitCompletion Model
 * Tracks daily habit completions
 */
const HabitCompletion = sequelize.define('HabitCompletion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  habitId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE'
  },
  completionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Date when habit was completed (YYYY-MM-DD)'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'habit_completions',
  timestamps: true,
  indexes: [
    {
      name: 'idx_habitid_date',
      fields: ['habitId', 'completionDate'],
      unique: true // One completion per habit per day
    },
    {
      name: 'idx_completiondate',
      fields: ['completionDate']
    }
  ]
});

// Associations will be defined in models/index.js to avoid circular dependencies

module.exports = HabitCompletion;

