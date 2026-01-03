const express = require('express');
const router = express.Router();
const timeEntryController = require('../controllers/timeEntryController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Start timer
router.post('/task/:taskId/start', timeEntryController.startTimer);

// Stop timer
router.post('/task/:taskId/stop', timeEntryController.stopTimer);

// Get running timer
router.get('/task/:taskId/running', timeEntryController.getRunningTimer);

// Get all time entries for a task
router.get('/task/:taskId', timeEntryController.getTimeEntries);

// Get time statistics
router.get('/stats', timeEntryController.getTimeStats);

// Delete time entry
router.delete('/:id', timeEntryController.deleteTimeEntry);

module.exports = router;

