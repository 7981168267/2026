const { Task, Notification, Subtask, TimeEntry } = require('../models');
const { Op } = require('sequelize');
const { createNextRecurringTask } = require('../services/automationService');

// Helper function to safely include subtasks (only if table exists)
const getSubtaskInclude = () => {
  try {
    // Check if Subtask model is available and table might exist
    if (Subtask && Subtask.sequelize) {
      return {
        model: Subtask,
        as: 'subtasks',
        required: false, // Left join
        attributes: ['id', 'title', 'status', 'order'],
        order: [['order', 'ASC']]
      };
    }
  } catch (error) {
    // If Subtask model isn't available, return null
  }
  return null;
};

// Helper function to format dates
const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Helper function to get burnout recommendations
const getBurnoutRecommendations = (level, indicators) => {
  const recommendations = [];
  
  if (level === 'high') {
    recommendations.push('Consider reducing task load and focusing on high-priority items only');
    recommendations.push('Take breaks between tasks to maintain productivity');
  }
  
  if (indicators.overdueTasks > 5) {
    recommendations.push(`You have ${indicators.overdueTasks} overdue tasks. Consider rescheduling or delegating some tasks.`);
  }
  
  if (indicators.highPriorityPending > 3) {
    recommendations.push('Multiple urgent tasks pending. Prioritize and tackle them one at a time.');
  }
  
  if (indicators.completionRateDecline) {
    recommendations.push('Completion rate has declined. Review your task planning and time estimates.');
  }
  
  if (indicators.avgTasksPerDay > 10) {
    recommendations.push('High daily task count detected. Consider breaking tasks into smaller subtasks.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Great job maintaining a healthy workload!');
  }
  
  return recommendations;
};

// Create task (supports recurring/daily tasks)
exports.createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      durationMonths, 
      isDaily,
      priority = 'medium',
      category = 'General',
      dueDate,
      estimatedTime,
      subtasks = []
    } = req.body;
    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0);

    // Calculate end date based on duration
    let endDate = null;
    if (durationMonths && durationMonths > 0) {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(durationMonths));
      endDate.setHours(23, 59, 59, 999);
    }

    // If it's a recurring daily task, create tasks for each day
    if (isDaily && durationMonths > 0) {
      const tasks = [];
      const currentDate = new Date(startDate);
      currentDate.setHours(0, 0, 0, 0);
      
      // Get all existing tasks for this title in the date range to avoid duplicates
      const existingTasks = await Task.findAll({
        where: {
          userId: req.user.id,
          title,
          date: {
            [Op.between]: [
              new Date(startDate.getTime()),
              new Date(endDate.getTime())
            ]
          }
        },
        attributes: ['date']
      });
      
      // Create a Set of existing dates for quick lookup
      const existingDates = new Set(
        existingTasks.map(t => {
          const d = new Date(t.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      );
      
      // Create tasks for each day from start date to end date
      while (currentDate <= endDate) {
        const dateKey = currentDate.getTime();
        
        // Only create if it doesn't already exist
        if (!existingDates.has(dateKey)) {
          const taskDate = new Date(currentDate);
          taskDate.setHours(0, 0, 0, 0);
          
          tasks.push({
            userId: req.user.id,
            title,
            description: description || '',
            date: taskDate,
            endDate: endDate,
            isRecurring: true,
            status: 'pending',
            priority,
            category,
            dueDate: dueDate ? new Date(dueDate) : null,
            estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
            recurringPattern: 'daily'
          });
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Bulk create all tasks at once
      if (tasks.length > 0) {
        await Task.bulkCreate(tasks, { ignoreDuplicates: true });
      }

      return res.status(201).json({
        message: `Created ${tasks.length} daily tasks from ${formatDate(startDate)} to ${formatDate(endDate)}`,
        tasksCreated: tasks.length,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    } else {
      // Single task - build task data with only fields that exist
      const taskData = {
        userId: req.user.id,
        title,
        description: description || '',
        date: startDate,
        endDate: endDate,
        isRecurring: false,
        status: 'pending'
      };
      
      // Add optional fields if they're provided (will be ignored if columns don't exist)
      if (priority) taskData.priority = priority;
      if (category) taskData.category = category;
      if (dueDate) taskData.dueDate = new Date(dueDate);
      if (estimatedTime) taskData.estimatedTime = parseInt(estimatedTime);
      
      const task = await Task.create(taskData);

      // Create subtasks if provided and Subtask model is available
      if (subtasks && subtasks.length > 0) {
        try {
          const subtaskData = subtasks.map((st, index) => ({
            taskId: task.id,
            title: st.title || st,
            description: st.description || '',
            order: index
          }));
          await Subtask.bulkCreate(subtaskData);
        } catch (error) {
          // If subtasks table doesn't exist, just log and continue
          console.warn('Subtask creation skipped (table may not exist):', error.message);
        }
      }

      // Fetch task - try with subtasks, but don't fail if table doesn't exist
      const subtaskInclude = getSubtaskInclude();
      if (subtaskInclude) {
        try {
          const taskWithSubtasks = await Task.findByPk(task.id, {
            include: [subtaskInclude]
          });
          return res.status(201).json(taskWithSubtasks);
        } catch (error) {
          // If include fails, just return the task without subtasks
          console.warn('Could not load subtasks:', error.message);
        }
      }
      return res.status(201).json(task);
    }
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's tasks (with pagination for 5+ years of data)
exports.getTasks = async (req, res) => {
  try {
    const { date, status, page = 1, limit = 50, startDate, endDate } = req.query;
    const whereClause = { userId: req.user.id };

    // Support both single date and date range
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      whereClause.date = { [Op.between]: [start, end] };
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.date = { [Op.between]: [start, end] };
    }

    if (status) {
      whereClause.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100); // Max 100 per page
    const offset = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalCount = await Task.count({ where: whereClause });

    // Build attributes array - only include columns that exist
    const baseAttributes = ['id', 'userId', 'title', 'description', 'date', 'status', 'completedAt', 'createdAt', 'updatedAt'];
    
    // Build includes array - only include if available
    const includes = [];
    const subtaskInclude = getSubtaskInclude();
    if (subtaskInclude) {
      includes.push(subtaskInclude);
    }
    
    const tasks = await Task.findAll({
      where: whereClause,
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      attributes: baseAttributes,
      include: includes.length > 0 ? includes : undefined,
      limit: limitNum,
      offset: offset
    });

    res.json({
      tasks,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum * limitNum < totalCount,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get today's tasks
exports.getTodayTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Build attributes array - handle missing columns gracefully
    const baseAttributes = ['id', 'userId', 'title', 'description', 'date', 'status', 'completedAt', 'createdAt', 'updatedAt'];
    
    // Build includes array - only include if available
    const includes = [];
    const subtaskInclude = getSubtaskInclude();
    if (subtaskInclude) {
      includes.push(subtaskInclude);
    }
    
    const tasks = await Task.findAll({
      where: {
        userId: req.user.id,
        date: { [Op.gte]: today, [Op.lt]: tomorrow }
      },
      order: [['createdAt', 'DESC']],
      attributes: baseAttributes,
      include: includes.length > 0 ? includes : undefined
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get today tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update task status
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      title, 
      description, 
      date,
      priority,
      category,
      dueDate,
      estimatedTime
    } = req.body;

    const task = await Task.findOne({ 
      where: { id: parseInt(id), userId: req.user.id },
      include: [{ model: Subtask, as: 'subtasks', order: [['order', 'ASC']] }]
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (status !== undefined) {
      task.status = status;
      if (status === 'completed' && !task.completedAt) {
        task.completedAt = new Date();
        
        // Auto-create next recurring task if applicable
        if (task.isRecurring) {
          try {
            await createNextRecurringTask(task.id);
          } catch (error) {
            console.error('Error creating next recurring task:', error);
            // Don't fail the request if automation fails
          }
        }
      } else if (status === 'pending') {
        task.completedAt = null;
      }
    }

    // Update new fields - only if columns exist (will be ignored if they don't)
    try {
      if (priority !== undefined) task.priority = priority;
      if (category !== undefined) task.category = category;
      if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
      if (estimatedTime !== undefined) task.estimatedTime = estimatedTime ? parseInt(estimatedTime) : null;
    } catch (error) {
      // If columns don't exist, just log and continue
      console.warn('Some optional fields could not be updated:', error.message);
    }

    // Update title - if title changed, update all instances of recurring tasks with same old title
    if (title !== undefined && title.trim() && title.trim() !== task.title) {
      const oldTitle = task.title;
      task.title = title.trim();
      
      // If this is a recurring task, update all other instances with the same title
      if (task.isRecurring) {
        await Task.update(
          { title: title.trim() },
          {
            where: {
              userId: req.user.id,
              title: oldTitle,
              id: { [Op.ne]: task.id } // Exclude current task
            }
          }
        );
      }
    }

    // Update description - update all instances if recurring
    if (description !== undefined) {
      const newDescription = description.trim() || '';
      task.description = newDescription;
      
      if (task.isRecurring) {
        await Task.update(
          { description: newDescription },
          {
            where: {
              userId: req.user.id,
              title: task.title,
              id: { [Op.ne]: task.id }
            }
          }
        );
      }
    }

    if (date !== undefined) task.date = new Date(date);

    await task.save();
    
    // Reload with associations - don't fail if subtasks table doesn't exist
    const subtaskInclude = getSubtaskInclude();
    if (subtaskInclude) {
      try {
        const updatedTask = await Task.findByPk(task.id, {
          include: [subtaskInclude]
        });
        return res.json(updatedTask);
      } catch (error) {
        // If include fails, just return the task without subtasks
        console.warn('Could not load subtasks:', error.message);
      }
    }
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteAllRecurring } = req.query; // Optional: delete all instances if recurring

    const task = await Task.findOne({ 
      where: { id: parseInt(id), userId: req.user.id },
      attributes: ['id', 'userId', 'title', 'isRecurring']
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // If it's a recurring task and deleteAllRecurring is true, delete all instances
    if (task.isRecurring && deleteAllRecurring === 'true') {
      const deletedCount = await Task.destroy({
        where: {
          userId: req.user.id,
          title: task.title
        }
      });
      return res.json({ 
        message: `Deleted ${deletedCount} task instance(s) successfully`,
        deletedCount 
      });
    } else {
      // Delete single task
      await task.destroy();
      return res.json({ message: 'Task deleted successfully' });
    }
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user analytics (for user dashboard)
exports.getUserAnalytics = async (req, res) => {
  try {
    const { period = 'overall' } = req.query;
    const userId = req.user.id;

    let startDate, endDate, previousStartDate, previousEndDate;
    const now = new Date();

    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        // Previous day
        previousStartDate = new Date(now);
        previousStartDate.setDate(previousStartDate.getDate() - 1);
        previousStartDate.setHours(0, 0, 0, 0);
        previousEndDate = new Date(previousStartDate);
        previousEndDate.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        // Previous week
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        previousEndDate.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        // Previous month
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      default:
        startDate = null;
        endDate = null;
        previousStartDate = null;
        previousEndDate = null;
    }

    // Get current period tasks - Optimized for large datasets
    const whereClause = { userId };
    if (startDate && endDate) {
      whereClause.date = { [Op.between]: [startDate, endDate] };
    }

    // For overall period, limit to last 5 years for performance
    if (period === 'overall') {
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      fiveYearsAgo.setHours(0, 0, 0, 0);
      if (!whereClause.date) {
        whereClause.date = {};
      }
      whereClause.date[Op.gte] = fiveYearsAgo;
    }

    // Build attributes - only include columns that exist
    const baseAttributes = ['id', 'userId', 'title', 'description', 'date', 'status', 'completedAt', 'createdAt', 'updatedAt'];
    
    const tasks = await Task.findAll({ 
      where: whereClause,
      attributes: baseAttributes,
      order: [['date', 'ASC']],
      limit: period === 'overall' ? 10000 : undefined // Limit overall to 10k tasks for performance
    });

    // Get previous period tasks for comparison - Only fetch counts, not full data
    let previousTasks = [];
    if (previousStartDate && previousEndDate) {
      previousTasks = await Task.findAll({
        where: {
          userId,
          date: { [Op.between]: [previousStartDate, previousEndDate] }
        },
        attributes: ['id', 'status', 'date', 'completedAt'],
        limit: 5000 // Limit previous period queries
      });
    }

    // Calculate basic metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Previous period metrics for comparison
    const prevCompleted = previousTasks.filter(t => t.status === 'completed').length;
    const prevTotal = previousTasks.length;
    const prevCompletionRate = prevTotal > 0 ? (prevCompleted / prevTotal) * 100 : 0;
    const completionRateChange = completionRate - prevCompletionRate;
    const tasksChange = totalTasks - prevTotal;

    // Calculate streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    // Get completed tasks sorted by date - Optimized: Only get last 2 years for streak calculation
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    twoYearsAgo.setHours(0, 0, 0, 0);
    
    const allTasks = await Task.findAll({
      where: { 
        userId,
        date: { [Op.gte]: twoYearsAgo } // Only last 2 years for streak calculation
      },
      attributes: ['date', 'status'],
      order: [['date', 'DESC']],
      limit: 2000 // Reasonable limit for streak calculation
    });

    const completedByDate = {};
    allTasks.forEach(task => {
      const dateKey = new Date(task.date).toISOString().split('T')[0];
      if (!completedByDate[dateKey]) {
        completedByDate[dateKey] = { total: 0, completed: 0 };
      }
      completedByDate[dateKey].total++;
      if (task.status === 'completed') {
        completedByDate[dateKey].completed++;
      }
    });

    // Calculate current streak (days with all tasks completed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);
    
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      const dayTasks = completedByDate[dateKey];
      if (dayTasks && dayTasks.total > 0 && dayTasks.completed === dayTasks.total) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate best streak
    const sortedDates = Object.keys(completedByDate).sort().reverse();
    for (const dateKey of sortedDates) {
      const dayTasks = completedByDate[dateKey];
      if (dayTasks && dayTasks.total > 0 && dayTasks.completed === dayTasks.total) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate average tasks per day
    const uniqueDays = new Set(tasks.map(t => new Date(t.date).toISOString().split('T')[0]));
    const avgTasksPerDay = uniqueDays.size > 0 ? (totalTasks / uniqueDays.size).toFixed(1) : 0;

    // Calculate most productive day of week
    const dayOfWeekCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // Sunday = 0
    tasks.filter(t => t.status === 'completed').forEach(task => {
      const dayOfWeek = new Date(task.date).getDay();
      dayOfWeekCounts[dayOfWeek]++;
    });
    const mostProductiveDay = Object.keys(dayOfWeekCounts).reduce((a, b) => 
      dayOfWeekCounts[a] > dayOfWeekCounts[b] ? a : b
    );
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Daily breakdown with completion rate per day
    const dailyData = {};
    tasks.forEach(task => {
      const dateKey = new Date(task.date).toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { completed: 0, pending: 0, total: 0, completionRate: 0 };
      }
      dailyData[dateKey].total++;
      if (task.status === 'completed') {
        dailyData[dateKey].completed++;
      } else {
        dailyData[dateKey].pending++;
      }
      dailyData[dateKey].completionRate = dailyData[dateKey].total > 0 
        ? (dailyData[dateKey].completed / dailyData[dateKey].total) * 100 
        : 0;
    });

    // Weekly data for checkbook view
    const weeklyTasks = {};
    if (period === 'weekly' || period === 'overall') {
      tasks.forEach(task => {
        const dateKey = new Date(task.date).toISOString().split('T')[0];
        if (!weeklyTasks[dateKey]) {
          weeklyTasks[dateKey] = [];
        }
        weeklyTasks[dateKey].push({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          createdAt: task.createdAt
        });
      });
    }

    // Category-wise analytics - handle missing category field
    const categoryStats = {};
    tasks.forEach(task => {
      const category = (task.category && task.category !== 'null') ? task.category : 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, completed: 0, pending: 0 };
      }
      categoryStats[category].total++;
      if (task.status === 'completed') {
        categoryStats[category].completed++;
      } else {
        categoryStats[category].pending++;
      }
    });

    // Calculate category completion rates
    const categoryBreakdown = Object.keys(categoryStats).map(category => ({
      category,
      total: categoryStats[category].total,
      completed: categoryStats[category].completed,
      pending: categoryStats[category].pending,
      completionRate: categoryStats[category].total > 0
        ? Math.round((categoryStats[category].completed / categoryStats[category].total) * 100 * 100) / 100
        : 0
    })).sort((a, b) => b.total - a.total);

    // Priority breakdown - handle missing priority field
    const priorityStats = {
      urgent: { total: 0, completed: 0 },
      high: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      low: { total: 0, completed: 0 }
    };
    tasks.forEach(task => {
      const priority = (task.priority && ['urgent', 'high', 'medium', 'low'].includes(task.priority)) 
        ? task.priority 
        : 'medium';
      priorityStats[priority].total++;
      if (task.status === 'completed') {
        priorityStats[priority].completed++;
      }
    });

    // Productivity heatmap data (hour of day vs day of week)
    const heatmapData = {};
    tasks.filter(t => t.status === 'completed' && t.completedAt).forEach(task => {
      const completedDate = new Date(task.completedAt);
      const dayOfWeek = completedDate.getDay();
      const hour = completedDate.getHours();
      const key = `${dayOfWeek}-${hour}`;
      if (!heatmapData[key]) {
        heatmapData[key] = 0;
      }
      heatmapData[key]++;
    });

    // Time tracking analytics - handle missing time fields
    const timeStats = {
      totalEstimated: 0,
      totalActual: 0,
      tasksWithTime: 0
    };
    tasks.forEach(task => {
      if (task.estimatedTime && !isNaN(task.estimatedTime)) {
        timeStats.totalEstimated += parseInt(task.estimatedTime);
        timeStats.tasksWithTime++;
      }
      if (task.actualTime && !isNaN(task.actualTime)) {
        timeStats.totalActual += parseInt(task.actualTime);
      }
    });
    const timeEfficiency = timeStats.totalEstimated > 0
      ? Math.round((timeStats.totalActual / timeStats.totalEstimated) * 100 * 100) / 100
      : null;

    // Burnout detection - handle missing fields gracefully
    const burnoutIndicators = {
      overdueTasks: tasks.filter(t => {
        if (!t.dueDate || t.status === 'completed') return false;
        try {
          return new Date(t.dueDate) < new Date();
        } catch {
          return false;
        }
      }).length,
      highPriorityPending: tasks.filter(t => 
        t.priority === 'urgent' && t.status === 'pending'
      ).length,
      completionRateDecline: completionRateChange < -10, // 10% decline
      avgTasksPerDay: parseFloat(avgTasksPerDay)
    };
    
    const burnoutScore = 
      (burnoutIndicators.overdueTasks * 2) +
      (burnoutIndicators.highPriorityPending * 3) +
      (burnoutIndicators.completionRateDecline ? 5 : 0) +
      (burnoutIndicators.avgTasksPerDay > 10 ? 2 : 0);
    
    const burnoutLevel = burnoutScore < 5 ? 'low' : 
                        burnoutScore < 10 ? 'medium' : 'high';

    res.json({
      period,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      // New metrics
      currentStreak,
      bestStreak,
      avgTasksPerDay: parseFloat(avgTasksPerDay),
      mostProductiveDay: dayNames[parseInt(mostProductiveDay)],
      completionRateChange: Math.round(completionRateChange * 100) / 100,
      tasksChange,
      previousPeriod: {
        totalTasks: prevTotal,
        completedTasks: prevCompleted,
        completionRate: Math.round(prevCompletionRate * 100) / 100
      },
      dailyData: Object.keys(dailyData).sort().map(date => ({
        date,
        ...dailyData[date]
      })),
      weeklyTasks,
      // Advanced analytics
      categoryBreakdown,
      priorityStats,
      heatmapData,
      timeStats: {
        ...timeStats,
        timeEfficiency,
        avgEstimated: timeStats.tasksWithTime > 0 
          ? Math.round(timeStats.totalEstimated / timeStats.tasksWithTime)
          : 0,
        avgActual: timeStats.tasksWithTime > 0
          ? Math.round(timeStats.totalActual / timeStats.tasksWithTime)
          : 0
      },
      burnoutAnalysis: {
        ...burnoutIndicators,
        burnoutScore,
        burnoutLevel,
        recommendations: getBurnoutRecommendations(burnoutLevel, burnoutIndicators)
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get weekly checkbook data (multiple weeks, tasks as rows)
exports.getWeeklyCheckbook = async (req, res) => {
  try {
    const { weekStart, weeksCount = 2 } = req.query;
    const userId = req.user.id;

    let startDate;
    if (weekStart) {
      startDate = new Date(weekStart);
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week (Sunday)
    }
    startDate.setHours(0, 0, 0, 0);

    const weeks = parseInt(weeksCount) || 2;
    const totalDays = weeks * 7;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + totalDays);
    endDate.setHours(23, 59, 59, 999);

    // Get all tasks in the date range - include all tasks, not just recurring
    const tasks = await Task.findAll({
      where: {
        userId,
        date: { [Op.between]: [startDate, endDate] }
      },
      order: [['title', 'ASC'], ['date', 'ASC']],
      attributes: [
        'id', 'userId', 'title', 'description', 'date', 'status', 
        'priority', 'category', 'dueDate', 'estimatedTime', 'actualTime',
        'completedAt', 'createdAt', 'updatedAt', 'isRecurring'
      ]
    });

    // Get unique task titles (group by title)
    const uniqueTaskTitles = [...new Set(tasks.map(t => t.title))];

    // Build checkbook structure: tasks as rows, days as columns
    const checkbookData = {};
    
    // Initialize all days
    const allDays = [];
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      allDays.push({
        date: currentDate,
        dateKey,
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    // For each unique task, create a row with status for each day
    uniqueTaskTitles.forEach(taskTitle => {
      const taskInstances = tasks.filter(t => t.title === taskTitle);
      const taskRow = {
        title: taskTitle,
        description: taskInstances[0]?.description || '',
        days: {}
      };

      allDays.forEach(day => {
        const taskForDay = taskInstances.find(t => {
          const taskDate = new Date(t.date).toISOString().split('T')[0];
          return taskDate === day.dateKey;
        });

        taskRow.days[day.dateKey] = taskForDay ? {
          id: taskForDay.id,
          status: taskForDay.status,
          completedAt: taskForDay.completedAt
        } : null;
      });

      checkbookData[taskTitle] = taskRow;
    });

    res.json({
      weekStart: startDate.toISOString(),
      weekEnd: endDate.toISOString(),
      weeksCount: weeks,
      days: allDays,
      tasks: checkbookData
    });
  } catch (error) {
    console.error('Get weekly checkbook error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
