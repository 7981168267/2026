const { TaskTemplate } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all templates for a user (including public ones)
 */
exports.getTemplates = async (req, res) => {
  try {
    const templates = await TaskTemplate.findAll({
      where: {
        [Op.or]: [
          { userId: req.user.id },
          { isPublic: true }
        ]
      },
      order: [['usageCount', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new template
 */
exports.createTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      title,
      taskDescription,
      category,
      priority,
      estimatedTime,
      subtasks,
      isPublic
    } = req.body;

    const template = await TaskTemplate.create({
      userId: req.user.id,
      name,
      description: description || '',
      title,
      taskDescription: taskDescription || '',
      category: category || 'General',
      priority: priority || 'medium',
      estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
      subtasks: subtasks || null,
      isPublic: isPublic || false
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a template
 */
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const template = await TaskTemplate.findOne({
      where: { id: parseInt(id), userId: req.user.id }
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        template[key] = updateData[key];
      }
    });

    await template.save();
    res.json(template);
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a template
 */
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await TaskTemplate.findOne({
      where: { id: parseInt(id), userId: req.user.id }
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await template.destroy();
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Increment template usage count
 */
exports.useTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await TaskTemplate.findOne({
      where: {
        id: parseInt(id),
        [Op.or]: [
          { userId: req.user.id },
          { isPublic: true }
        ]
      }
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    template.usageCount += 1;
    await template.save();

    res.json(template);
  } catch (error) {
    console.error('Use template error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

