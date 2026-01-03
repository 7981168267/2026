const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const subtaskController = require('../controllers/subtaskController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get task progress
router.get('/task/:taskId/progress', subtaskController.getTaskProgress);

// Get all subtasks for a task
router.get('/task/:taskId', subtaskController.getSubtasks);

// Create subtask
router.post('/task/:taskId',
  [
    body('title').trim().notEmpty().withMessage('Subtask title is required')
  ],
  subtaskController.createSubtask
);

// Update subtask
router.put('/:id',
  [
    body('status').optional().isIn(['pending', 'completed']),
    body('title').optional().trim().notEmpty()
  ],
  subtaskController.updateSubtask
);

// Delete subtask
router.delete('/:id', subtaskController.deleteSubtask);

module.exports = router;

