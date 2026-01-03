const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

/**
 * Category Model
 * User-defined task categories with color coding
 */
const Category = sequelize.define('Category', {
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
  color: {
    type: DataTypes.STRING,
    defaultValue: '#667eea',
    comment: 'Hex color code for the category'
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Icon identifier'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this is a default/system category'
  },
  taskCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of tasks in this category'
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
  tableName: 'categories',
  timestamps: true,
  indexes: [
    {
      name: 'idx_userid',
      fields: ['userId']
    },
    {
      name: 'idx_userid_name',
      fields: ['userId', 'name'],
      unique: true // One category name per user
    }
  ]
});

// Define associations
User.hasMany(Category, { foreignKey: 'userId', as: 'categories' });
Category.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Category;

