const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/', categoryController.getCategories);

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Category name is required')
  ],
  categoryController.createCategory
);

router.put('/:id',
  [
    body('name').optional().trim().notEmpty()
  ],
  categoryController.updateCategory
);

router.delete('/:id', categoryController.deleteCategory);

module.exports = router;

