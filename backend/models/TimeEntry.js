const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Task = require('./Task');
const User = require('./User');

/**
 * TimeEntry Model
 * Tracks time spent on tasks with start/stop functionality
 */
const TimeEntry = sequelize.define('TimeEntry', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'When the timer started'
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the timer stopped (null if still running)'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes (calculated from startTime and endTime)'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Optional notes about this time entry'
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
  tableName: 'time_entries',
  timestamps: true,
  hooks: {
    beforeSave: async (timeEntry) => {
      // Calculate duration if both startTime and endTime are present
      if (timeEntry.startTime && timeEntry.endTime) {
        const diffMs = new Date(timeEntry.endTime) - new Date(timeEntry.startTime);
        timeEntry.duration = Math.round(diffMs / 60000); // Convert to minutes
      }
    }
  },
  indexes: [
    {
      name: 'idx_taskid',
      fields: ['taskId']
    },
    {
      name: 'idx_userid',
      fields: ['userId']
    },
    {
      name: 'idx_userid_date',
      fields: ['userId', 'startTime']
    }
  ]
});

// Define associations
Task.hasMany(TimeEntry, { foreignKey: 'taskId', as: 'timeEntries', onDelete: 'CASCADE' });
TimeEntry.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
User.hasMany(TimeEntry, { foreignKey: 'userId', as: 'timeEntries' });
TimeEntry.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = TimeEntry;

