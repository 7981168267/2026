const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Task = require('./Task');

/**
 * Subtask Model
 * Represents subtasks within a parent task with progress tracking
 */
const Subtask = sequelize.define('Subtask', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Task,
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  status: {
    type: DataTypes.ENUM('pending', 'completed'),
    defaultValue: 'pending'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Order of subtask within parent task'
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
  tableName: 'subtasks',
  timestamps: true,
  indexes: [
    {
      name: 'idx_taskid',
      fields: ['taskId']
    },
    {
      name: 'idx_taskid_status',
      fields: ['taskId', 'status']
    }
  ]
});

// Define associations
Task.hasMany(Subtask, { foreignKey: 'taskId', as: 'subtasks', onDelete: 'CASCADE' });
Subtask.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

module.exports = Subtask;

