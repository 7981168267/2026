const { sequelize } = require('../config/database');
const { User, Task } = require('../models');
require('dotenv').config();

// Generate random task titles
const taskTitles = [
  'Complete project documentation',
  'Review code changes',
  'Team meeting preparation',
  'Update database schema',
  'Write unit tests',
  'Fix bug in login module',
  'Design new feature mockup',
  'Code review for pull request',
  'Deploy to staging environment',
  'Client presentation preparation',
  'Research new technology',
  'Optimize database queries',
  'Update user interface',
  'Write API documentation',
  'Backup database',
  'Security audit',
  'Performance testing',
  'Update dependencies',
  'Create user guide',
  'Prepare weekly report',
  'Attend training session',
  'Update project roadmap',
  'Review user feedback',
  'Implement new feature',
  'Bug fix and testing',
  'Database migration',
  'API endpoint development',
  'Frontend component update',
  'Integration testing',
  'Documentation review'
];

const taskDescriptions = [
  'Complete this task with attention to detail',
  'Priority task - needs immediate attention',
  'Review and update as needed',
  'Follow up with team members',
  'Ensure all requirements are met',
  'Double check before completion',
  'Coordinate with other departments',
  'Test thoroughly before marking complete',
  'Document the process',
  'Get approval from supervisor'
];

// Generate random date within a month
const getRandomDateInMonth = (startDate, daysInMonth) => {
  const randomDay = Math.floor(Math.random() * daysInMonth);
  const date = new Date(startDate);
  date.setDate(date.getDate() + randomDay);
  const hour = Math.floor(Math.random() * 12) + 8; // Between 8 AM and 8 PM
  const minute = Math.floor(Math.random() * 60);
  date.setHours(hour, minute, 0, 0);
  return date;
};

// Generate tasks for a month
const generateMockTasks = async (userId, startDate = null) => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to MySQL database');

    // Get or use provided start date
    const monthStart = startDate || new Date();
    monthStart.setDate(1); // First day of current month
    monthStart.setHours(0, 0, 0, 0);

    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    console.log(`Generating tasks for month: ${monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
    console.log(`Days in month: ${daysInMonth}`);

    // Generate 2-5 tasks per day on average
    const totalTasks = daysInMonth * 3; // Average 3 tasks per day
    const tasks = [];

    for (let i = 0; i < totalTasks; i++) {
      const taskDate = getRandomDateInMonth(monthStart, daysInMonth);
      
      // Some tasks are completed (70% chance), some pending (30%)
      const isCompleted = Math.random() > 0.3;
      const status = isCompleted ? 'completed' : 'pending';
      
      const task = {
        userId: userId,
        title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
        description: taskDescriptions[Math.floor(Math.random() * taskDescriptions.length)],
        date: taskDate,
        status: status,
        completedAt: isCompleted ? taskDate : null,
        createdAt: taskDate,
        updatedAt: taskDate
      };

      tasks.push(task);
    }

    // Insert tasks in batches
    console.log(`Creating ${tasks.length} tasks...`);
    await Task.bulkCreate(tasks);
    
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const pendingCount = tasks.filter(t => t.status === 'pending').length;
    
    console.log('\n✅ Mock data generated successfully!');
    console.log(`Total tasks: ${tasks.length}`);
    console.log(`Completed: ${completedCount}`);
    console.log(`Pending: ${pendingCount}`);
    console.log(`\nUser ID: ${userId}`);
    
    return tasks;
  } catch (error) {
    console.error('Error generating mock data:', error);
    throw error;
  }
};

module.exports = generateMockTasks;

// Main execution
const main = async () => {
  try {
    const args = process.argv.slice(2);
    let userId = args[0];
    let startDate = args[1] ? new Date(args[1]) : null;

    // If no user ID provided, try to find first user or create one
    if (!userId) {
      let user = await User.findOne({ where: { role: 'user' } });
      
      if (!user) {
        // Try to find any user
        user = await User.findOne();
      }

      if (!user) {
        console.error('❌ No users found. Please create a user first.');
        console.log('Run: npm run create-admin');
        process.exit(1);
      }

      userId = user.id;
      console.log(`Using user: ${user.name} (${user.email}) - ID: ${userId}`);
    } else {
      userId = parseInt(userId);
      const user = await User.findByPk(userId);
      if (!user) {
        console.error(`❌ User with ID ${userId} not found.`);
        process.exit(1);
      }
      console.log(`Using user: ${user.name} (${user.email}) - ID: ${userId}`);
    }

    await generateMockTasks(userId, startDate);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

main();

