const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

/**
 * TaskTemplate Model
 * Reusable task templates for quick task creation
 */
const TaskTemplate = sequelize.define('TaskTemplate', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Task title template'
  },
  taskDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Task description template'
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
  estimatedTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated time in minutes'
  },
  subtasks: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of subtask templates'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether template is available to all users'
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of times template has been used'
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
  tableName: 'task_templates',
  timestamps: true,
  indexes: [
    {
      name: 'idx_userid',
      fields: ['userId']
    },
    {
      name: 'idx_public',
      fields: ['isPublic']
    }
  ]
});

// Define associations
User.hasMany(TaskTemplate, { foreignKey: 'userId', as: 'taskTemplates' });
TaskTemplate.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = TaskTemplate;

