const { Subtask, Task } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a subtask
 */
exports.createSubtask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, order } = req.body;

    // Verify task belongs to user
    const task = await Task.findOne({ 
      where: { id: parseInt(taskId), userId: req.user.id } 
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Get max order if not provided
    let subtaskOrder = order;
    if (subtaskOrder === undefined) {
      const maxOrder = await Subtask.max('order', {
        where: { taskId: parseInt(taskId) }
      });
      subtaskOrder = (maxOrder || -1) + 1;
    }

    const subtask = await Subtask.create({
      taskId: parseInt(taskId),
      title,
      description: description || '',
      order: subtaskOrder
    });

    res.status(201).json(subtask);
  } catch (error) {
    console.error('Create subtask error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a subtask
 */
exports.updateSubtask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, order } = req.body;

    const subtask = await Subtask.findOne({
      where: { id: parseInt(id) },
      include: [{
        model: Task,
        as: 'task',
        where: { userId: req.user.id }
      }]
    });

    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    if (title !== undefined) subtask.title = title;
    if (description !== undefined) subtask.description = description;
    if (status !== undefined) {
      subtask.status = status;
      if (status === 'completed' && !subtask.completedAt) {
        subtask.completedAt = new Date();
      } else if (status === 'pending') {
        subtask.completedAt = null;
      }
    }
    if (order !== undefined) subtask.order = order;

    await subtask.save();

    // Update parent task progress if needed
    await updateTaskProgress(subtask.taskId);

    res.json(subtask);
  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a subtask
 */
exports.deleteSubtask = async (req, res) => {
  try {
    const { id } = req.params;

    const subtask = await Subtask.findOne({
      where: { id: parseInt(id) },
      include: [{
        model: Task,
        as: 'task',
        where: { userId: req.user.id }
      }]
    });

    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    const taskId = subtask.taskId;
    await subtask.destroy();

    // Update parent task progress
    await updateTaskProgress(taskId);

    res.json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    console.error('Delete subtask error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all subtasks for a task
 */
exports.getSubtasks = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Verify task belongs to user
    const task = await Task.findOne({ 
      where: { id: parseInt(taskId), userId: req.user.id } 
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtasks = await Subtask.findAll({
      where: { taskId: parseInt(taskId) },
      order: [['order', 'ASC']]
    });

    res.json(subtasks);
  } catch (error) {
    console.error('Get subtasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Helper function to calculate and update task progress
 */
async function updateTaskProgress(taskId) {
  const subtasks = await Subtask.findAll({
    where: { taskId }
  });

  if (subtasks.length === 0) return;

  const completedCount = subtasks.filter(st => st.status === 'completed').length;
  const progress = Math.round((completedCount / subtasks.length) * 100);

  // Note: We could add a progress field to Task model if needed
  // For now, we'll just return progress in API responses
  return progress;
}

/**
 * Get task progress (percentage of completed subtasks)
 */
exports.getTaskProgress = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Verify task belongs to user
    const task = await Task.findOne({ 
      where: { id: parseInt(taskId), userId: req.user.id } 
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtasks = await Subtask.findAll({
      where: { taskId: parseInt(taskId) }
    });

    if (subtasks.length === 0) {
      return res.json({ progress: 0, total: 0, completed: 0 });
    }

    const completedCount = subtasks.filter(st => st.status === 'completed').length;
    const progress = Math.round((completedCount / subtasks.length) * 100);

    res.json({
      progress,
      total: subtasks.length,
      completed: completedCount
    });
  } catch (error) {
    console.error('Get task progress error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

