const User = require('./User');
const Task = require('./Task');
const Notification = require('./Notification');
const Subtask = require('./Subtask');
const TimeEntry = require('./TimeEntry');
const RecurringTaskTemplate = require('./RecurringTaskTemplate');
const Habit = require('./Habit');
const HabitCompletion = require('./HabitCompletion');
const TaskTemplate = require('./TaskTemplate');
const Category = require('./Category');

// Define associations after all models are loaded to avoid circular dependencies

// Habit associations
User.hasMany(Habit, { foreignKey: 'userId', as: 'habits' });
Habit.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Habit.hasMany(HabitCompletion, { foreignKey: 'habitId', as: 'completions', onDelete: 'CASCADE' });
HabitCompletion.belongsTo(Habit, { foreignKey: 'habitId', as: 'habit' });

module.exports = {
  User,
  Task,
  Notification,
  Subtask,
  TimeEntry,
  RecurringTaskTemplate,
  Habit,
  HabitCompletion,
  TaskTemplate,
  Category
};

