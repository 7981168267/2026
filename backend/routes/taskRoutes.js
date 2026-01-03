const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.post('/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('date').optional().isISO8601()
  ],
  taskController.createTask
);

router.get('/', taskController.getTasks);
router.get('/today', taskController.getTodayTasks);
router.get('/analytics', taskController.getUserAnalytics);
router.get('/weekly-checkbook', taskController.getWeeklyCheckbook);

router.put('/:id',
  [
    body('status').optional().isIn(['pending', 'completed']),
    body('title').optional().trim().notEmpty(),
    body('date').optional().isISO8601()
  ],
  taskController.updateTask
);

router.delete('/:id', taskController.deleteTask);

module.exports = router;

