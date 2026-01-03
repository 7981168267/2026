const { Habit, HabitCompletion } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all habits for a user
 */
exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.findAll({
      where: {
        userId: req.user.id,
        isActive: true
      },
      order: [['createdAt', 'DESC']],
      include: [{
        model: HabitCompletion,
        as: 'completions',
        attributes: ['id', 'completionDate', 'notes']
      }]
    });

    // Calculate streaks for each habit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const habitsWithStreaks = await Promise.all(habits.map(async (habit) => {
      const completions = await HabitCompletion.findAll({
        where: { habitId: habit.id },
        order: [['completionDate', 'DESC']],
        attributes: ['completionDate']
      });

      const completionDates = completions.map(c => c.completionDate.toISOString().split('T')[0]);
      const completedToday = completionDates.includes(todayStr);

      // Calculate current streak
      let currentStreak = 0;
      let checkDate = new Date(today);
      
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (completionDates.includes(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Calculate best streak
      let bestStreak = 0;
      let tempStreak = 0;
      const sortedDates = [...completionDates].sort().reverse();
      
      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0 || sortedDates[i] === getPreviousDay(sortedDates[i - 1])) {
          tempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      bestStreak = Math.max(bestStreak, tempStreak);

      return {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        color: habit.color,
        icon: habit.icon,
        currentStreak,
        bestStreak: Math.max(bestStreak, habit.bestStreak),
        totalCompletions: completions.length,
        completedToday
      };
    }));

    res.json(habitsWithStreaks);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new habit
 */
exports.createHabit = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    const habit = await Habit.create({
      userId: req.user.id,
      name,
      description: description || '',
      color: color || '#667eea',
      icon: icon || null
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a habit
 */
exports.updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon } = req.body;

    const habit = await Habit.findOne({
      where: { id: parseInt(id), userId: req.user.id }
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    if (name !== undefined) habit.name = name;
    if (description !== undefined) habit.description = description;
    if (color !== undefined) habit.color = color;
    if (icon !== undefined) habit.icon = icon;

    await habit.save();
    res.json(habit);
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a habit
 */
exports.deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;

    const habit = await Habit.findOne({
      where: { id: parseInt(id), userId: req.user.id }
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    await habit.destroy();
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Mark habit as completed for today
 */
exports.completeHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const habit = await Habit.findOne({
      where: { id: parseInt(id), userId: req.user.id }
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Check if already completed today
    const existing = await HabitCompletion.findOne({
      where: {
        habitId: habit.id,
        completionDate: todayStr
      }
    });

    if (existing) {
      return res.json({ message: 'Habit already completed today', completion: existing });
    }

    // Create completion
    const completion = await HabitCompletion.create({
      habitId: habit.id,
      completionDate: todayStr,
      notes: notes || null
    });

    // Update habit stats
    habit.totalCompletions += 1;
    await habit.save();

    res.status(201).json(completion);
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get habit completion history
 */
exports.getHabitCompletions = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const habit = await Habit.findOne({
      where: { id: parseInt(id), userId: req.user.id }
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const whereClause = { habitId: habit.id };
    if (startDate && endDate) {
      whereClause.completionDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const completions = await HabitCompletion.findAll({
      where: whereClause,
      order: [['completionDate', 'DESC']]
    });

    res.json(completions);
  } catch (error) {
    console.error('Get habit completions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function
function getPreviousDay(dateStr) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

