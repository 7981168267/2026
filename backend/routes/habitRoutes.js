const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const habitController = require('../controllers/habitController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/', habitController.getHabits);
router.get('/:id/completions', habitController.getHabitCompletions);

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Habit name is required')
  ],
  habitController.createHabit
);

router.post('/:id/complete', habitController.completeHabit);

router.put('/:id',
  [
    body('name').optional().trim().notEmpty()
  ],
  habitController.updateHabit
);

router.delete('/:id', habitController.deleteHabit);

module.exports = router;

