const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Register/Login (for initial admin and user login)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Create user account (one-time registration per user)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'password', 'createdAt', 'updatedAt'], // Include password hash for admin
      order: [['createdAt', 'DESC']]
    });
    
    // Return users with passwordHash field (for admin to see/reset)
    const usersWithHash = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      passwordHash: user.password, // Hashed password (for admin reference)
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    
    res.json(usersWithHash);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Get user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'overall' } = req.query; // daily, weekly, monthly, overall

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      default: // overall
        startDate = null;
        endDate = null;
    }

    const { Task } = require('../models');
    const whereClause = { userId: parseInt(userId) };
    if (startDate && endDate) {
      whereClause.date = { [Op.between]: [startDate, endDate] };
    }

    const tasks = await Task.findAll({ 
      where: whereClause,
      attributes: ['id', 'userId', 'title', 'description', 'date', 'status', 'completedAt', 'createdAt', 'updatedAt']
    });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Daily breakdown for charts
    const dailyData = {};
    tasks.forEach(task => {
      const dateKey = new Date(task.date).toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { completed: 0, pending: 0, total: 0 };
      }
      dailyData[dateKey].total++;
      if (task.status === 'completed') {
        dailyData[dateKey].completed++;
      } else {
        dailyData[dateKey].pending++;
      }
    });

    res.json({
      period,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      dailyData: Object.keys(dailyData).sort().map(date => ({
        date,
        ...dailyData[date]
      })),
      tasks: tasks.slice(0, 50).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        date: t.date,
        status: t.status
      }))
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user info
exports.getCurrentUser = async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Update user
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, password, role } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from removing their own admin role
    if (req.user.id === parseInt(userId) && role !== 'admin' && user.role === 'admin') {
      return res.status(400).json({ message: 'You cannot remove your own admin role' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        where: { 
          email: email.toLowerCase().trim(),
          id: { [Op.ne]: userId }
        } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use by another user' });
      }
      user.email = email.toLowerCase().trim();
    }
    if (password) {
      user.password = password; // Will be hashed by the model hook
    }
    if (role) user.role = role;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === parseInt(userId)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Get user by ID (with password hash for admin view)
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user with password hash (for admin to see/reset)
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      passwordHash: user.password, // Hashed password (for admin reference)
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
