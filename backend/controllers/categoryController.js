const { Category, Task } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all categories for a user
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.user.id },
      order: [['name', 'ASC']]
    });

    // Get task count for each category
    const categoriesWithCounts = await Promise.all(categories.map(async (category) => {
      const taskCount = await Task.count({
        where: {
          userId: req.user.id,
          category: category.name
        }
      });

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        description: category.description,
        isDefault: category.isDefault,
        taskCount
      };
    }));

    res.json(categoriesWithCounts);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new category
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, color, icon, description } = req.body;

    // Check if category already exists
    const existing = await Category.findOne({
      where: {
        userId: req.user.id,
        name: name.trim()
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = await Category.create({
      userId: req.user.id,
      name: name.trim(),
      color: color || '#667eea',
      icon: icon || null,
      description: description || ''
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a category
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, icon, description } = req.body;

    const category = await Category.findOne({
      where: { id: parseInt(id), userId: req.user.id }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // If name is being changed, check for duplicates
    if (name && name.trim() !== category.name) {
      const existing = await Category.findOne({
        where: {
          userId: req.user.id,
          name: name.trim(),
          id: { [Op.ne]: category.id }
        }
      });

      if (existing) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }

      // Update all tasks with old category name to new name
      await Task.update(
        { category: name.trim() },
        {
          where: {
            userId: req.user.id,
            category: category.name
          }
        }
      );
    }

    if (name !== undefined) category.name = name.trim();
    if (color !== undefined) category.color = color;
    if (icon !== undefined) category.icon = icon;
    if (description !== undefined) category.description = description;

    await category.save();
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a category
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id: parseInt(id), userId: req.user.id }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default category' });
    }

    // Move tasks to "General" category
    await Task.update(
      { category: 'General' },
      {
        where: {
          userId: req.user.id,
          category: category.name
        }
      }
    );

    await category.destroy();
    res.json({ message: 'Category deleted successfully. Tasks moved to "General".' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

