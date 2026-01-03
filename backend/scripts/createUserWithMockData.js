const { sequelize } = require('../config/database');
const { User, Task } = require('../models');
require('dotenv').config();

// Task data (same as generateMockData.js)
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

const getRandomDateInMonth = (startDate, daysInMonth) => {
  const randomDay = Math.floor(Math.random() * daysInMonth);
  const date = new Date(startDate);
  date.setDate(date.getDate() + randomDay);
  const hour = Math.floor(Math.random() * 12) + 8;
  const minute = Math.floor(Math.random() * 60);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const generateMockTasks = async (userId, startDate = null) => {
  const monthStart = startDate || new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  console.log(`Generating tasks for month: ${monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
  console.log(`Days in month: ${daysInMonth}`);

  const totalTasks = daysInMonth * 3; // Average 3 tasks per day
  const tasks = [];

  for (let i = 0; i < totalTasks; i++) {
    const taskDate = getRandomDateInMonth(monthStart, daysInMonth);
    const isCompleted = Math.random() > 0.3; // 70% completed, 30% pending
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

  console.log(`Creating ${tasks.length} tasks...`);
  await Task.bulkCreate(tasks);
  
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  
  console.log('\n✅ Mock data generated successfully!');
  console.log(`Total tasks: ${tasks.length}`);
  console.log(`Completed: ${completedCount}`);
  console.log(`Pending: ${pendingCount}`);
  
  return tasks;
};

const createUserWithMockData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL database');

    // Check if user already exists
    let testUser = await User.findOne({ where: { email: 'john.doe@example.com' } });
    
    if (!testUser) {
      // Create a test user
      testUser = await User.create({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'user'
      });

      console.log(`\n✅ User created successfully!`);
      console.log(`Name: ${testUser.name}`);
      console.log(`Email: ${testUser.email}`);
      console.log(`Password: password123`);
      console.log(`User ID: ${testUser.id}\n`);
    } else {
      console.log(`\n✅ User already exists!`);
      console.log(`Name: ${testUser.name}`);
      console.log(`Email: ${testUser.email}`);
      console.log(`User ID: ${testUser.id}\n`);
    }

    // Check if tasks already exist for this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const existingTasks = await Task.count({
      where: {
        userId: testUser.id,
        date: { [require('sequelize').Op.between]: [monthStart, monthEnd] }
      }
    });

    if (existingTasks > 0) {
      console.log(`⚠️  User already has ${existingTasks} tasks for this month.`);
      console.log('Generating additional tasks...\n');
    } else {
      console.log('Generating mock data...\n');
    }

    // Generate mock data for this user
    await generateMockTasks(testUser.id);

    console.log('\n✅ Setup complete!');
    console.log('\n📋 Login credentials:');
    console.log('Email: john.doe@example.com');
    console.log('Password: password123');
    console.log('\nYou can now login and view the mock data in the dashboard!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createUserWithMockData();
