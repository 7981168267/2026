const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Task = sequelize.define('Task', {
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
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    comment: 'Task priority level'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'General',
    comment: 'Task category (Work, Personal, Health, etc.)'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Task due date for overdue detection'
  },
  estimatedTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated time in minutes'
  },
  actualTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Actual time spent in minutes (sum of time entries)'
  },
  taskTemplateId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'For recurring tasks, links to the original task template'
  },
  recurringPattern: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'custom'),
    allowNull: true,
    comment: 'Recurring pattern type'
  },
  recurringConfig: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON config for custom recurring patterns'
  },
  completedAt: {
    type: DataTypes.DATE,
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
  tableName: 'tasks',
  timestamps: true,
  indexes: [
    // Composite index for user date queries (most common)
    {
      name: 'idx_userid_date',
      fields: ['userId', 'date'],
      unique: false
    },
    // Index for status queries
    {
      name: 'idx_userid_status',
      fields: ['userId', 'status']
    },
    // Index for date range queries
    {
      name: 'idx_date',
      fields: ['date']
    },
    // Index for completedAt (for analytics)
    {
      name: 'idx_completedAt',
      fields: ['completedAt']
    },
    // Index for recurring tasks
    {
      name: 'idx_recurring',
      fields: ['userId', 'isRecurring', 'date']
    },
    // Index for title search
    {
      name: 'idx_title',
      fields: ['title'],
      type: 'FULLTEXT' // For MySQL full-text search
    }
  ]
});

// Define associations
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Task;
