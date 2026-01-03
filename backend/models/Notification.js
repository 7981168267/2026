const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Task = require('./Task');

const Notification = sequelize.define('Notification', {
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
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Task,
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('email', 'web', 'reminder'),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'read']
    }
  ]
});

// Define associations
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

module.exports = Notification;
