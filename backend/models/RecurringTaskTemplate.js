const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

/**
 * RecurringTaskTemplate Model
 * Template for advanced recurring tasks with custom patterns
 */
const RecurringTaskTemplate = sequelize.define('RecurringTaskTemplate', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'General'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  pattern: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'custom'),
    allowNull: false,
    defaultValue: 'daily'
  },
  patternConfig: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON config: {daysOfWeek: [1,3,5], interval: 2, endDate: "2026-12-31", etc.}'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Optional end date for recurring tasks'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this template is actively creating tasks'
  },
  lastGeneratedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last date when a task was generated from this template'
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
  tableName: 'recurring_task_templates',
  timestamps: true,
  indexes: [
    {
      name: 'idx_userid_active',
      fields: ['userId', 'isActive']
    },
    {
      name: 'idx_pattern',
      fields: ['pattern', 'isActive']
    }
  ]
});

// Define associations
User.hasMany(RecurringTaskTemplate, { foreignKey: 'userId', as: 'recurringTemplates' });
RecurringTaskTemplate.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = RecurringTaskTemplate;

