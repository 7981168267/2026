const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const templateController = require('../controllers/templateController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/', templateController.getTemplates);

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Template name is required'),
    body('title').trim().notEmpty().withMessage('Task title is required')
  ],
  templateController.createTemplate
);

router.post('/:id/use', templateController.useTemplate);

router.put('/:id', templateController.updateTemplate);

router.delete('/:id', templateController.deleteTemplate);

module.exports = router;

