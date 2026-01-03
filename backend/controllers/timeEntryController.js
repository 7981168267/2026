const { TimeEntry, Task } = require('../models');
const { Op } = require('sequelize');

/**
 * Start time tracking for a task
 */
exports.startTimer = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Verify task belongs to user
    const task = await Task.findOne({ 
      where: { id: parseInt(taskId), userId: req.user.id } 
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if there's already a running timer for this task
    const runningTimer = await TimeEntry.findOne({
      where: {
        taskId: parseInt(taskId),
        userId: req.user.id,
        endTime: null
      }
    });

    if (runningTimer) {
      return res.status(400).json({ 
        message: 'Timer already running for this task',
        timeEntry: runningTimer
      });
    }

    // Create new time entry
    const timeEntry = await TimeEntry.create({
      taskId: parseInt(taskId),
      userId: req.user.id,
      startTime: new Date(),
      endTime: null,
      duration: null
    });

    res.status(201).json(timeEntry);
  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Stop time tracking for a task
 */
exports.stopTimer = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { notes } = req.body;

    // Find running timer
    const timeEntry = await TimeEntry.findOne({
      where: {
        taskId: parseInt(taskId),
        userId: req.user.id,
        endTime: null
      },
      include: [{
        model: Task,
        as: 'task',
        where: { userId: req.user.id }
      }]
    });

    if (!timeEntry) {
      return res.status(404).json({ message: 'No running timer found for this task' });
    }

    // Stop timer
    const endTime = new Date();
    timeEntry.endTime = endTime;
    
    // Calculate duration
    const diffMs = endTime - new Date(timeEntry.startTime);
    timeEntry.duration = Math.round(diffMs / 60000); // Convert to minutes
    
    if (notes) {
      timeEntry.notes = notes;
    }

    await timeEntry.save();

    // Update task's actualTime
    await updateTaskActualTime(parseInt(taskId));

    res.json(timeEntry);
  } catch (error) {
    console.error('Stop timer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get current running timer for a task
 */
exports.getRunningTimer = async (req, res) => {
  try {
    const { taskId } = req.params;

    const timeEntry = await TimeEntry.findOne({
      where: {
        taskId: parseInt(taskId),
        userId: req.user.id,
        endTime: null
      },
      include: [{
        model: Task,
        as: 'task',
        where: { userId: req.user.id }
      }]
    });

    if (!timeEntry) {
      return res.json({ running: false });
    }

    // Calculate elapsed time
    const elapsedMs = new Date() - new Date(timeEntry.startTime);
    const elapsedMinutes = Math.round(elapsedMs / 60000);

    res.json({
      running: true,
      timeEntry,
      elapsedMinutes
    });
  } catch (error) {
    console.error('Get running timer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all time entries for a task
 */
exports.getTimeEntries = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify task belongs to user
    const task = await Task.findOne({ 
      where: { id: parseInt(taskId), userId: req.user.id } 
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const whereClause = {
      taskId: parseInt(taskId),
      userId: req.user.id
    };

    if (startDate && endDate) {
      whereClause.startTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const timeEntries = await TimeEntry.findAll({
      where: whereClause,
      order: [['startTime', 'DESC']]
    });

    // Calculate total time
    const totalMinutes = timeEntries
      .filter(te => te.duration !== null)
      .reduce((sum, te) => sum + (te.duration || 0), 0);

    res.json({
      timeEntries,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(2)
    });
  } catch (error) {
    console.error('Get time entries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a time entry
 */
exports.deleteTimeEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const timeEntry = await TimeEntry.findOne({
      where: { id: parseInt(id) },
      include: [{
        model: Task,
        as: 'task',
        where: { userId: req.user.id }
      }]
    });

    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    const taskId = timeEntry.taskId;
    await timeEntry.destroy();

    // Update task's actualTime
    await updateTaskActualTime(taskId);

    res.json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    console.error('Delete time entry error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Helper function to update task's actualTime
 */
async function updateTaskActualTime(taskId) {
  const timeEntries = await TimeEntry.findAll({
    where: {
      taskId,
      duration: { [Op.ne]: null }
    }
  });

  const totalMinutes = timeEntries.reduce((sum, te) => sum + (te.duration || 0), 0);

  await Task.update(
    { actualTime: totalMinutes },
    { where: { id: taskId } }
  );
}

/**
 * Get time tracking statistics for a user
 */
exports.getTimeStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {
      userId: req.user.id,
      duration: { [Op.ne]: null }
    };

    if (startDate && endDate) {
      whereClause.startTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const timeEntries = await TimeEntry.findAll({
      where: whereClause,
      include: [{
        model: Task,
        as: 'task',
        attributes: ['id', 'title', 'category']
      }],
      order: [['startTime', 'DESC']]
    });

    // Calculate statistics
    const totalMinutes = timeEntries.reduce((sum, te) => sum + (te.duration || 0), 0);
    
    // Group by category
    const categoryStats = {};
    timeEntries.forEach(te => {
      const category = te.task?.category || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = 0;
      }
      categoryStats[category] += te.duration || 0;
    });

    // Group by task
    const taskStats = {};
    timeEntries.forEach(te => {
      const taskId = te.taskId;
      if (!taskStats[taskId]) {
        taskStats[taskId] = {
          taskId,
          taskTitle: te.task?.title || 'Unknown',
          totalMinutes: 0
        };
      }
      taskStats[taskId].totalMinutes += te.duration || 0;
    });

    res.json({
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(2),
      entryCount: timeEntries.length,
      categoryStats,
      taskStats: Object.values(taskStats)
    });
  } catch (error) {
    console.error('Get time stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

