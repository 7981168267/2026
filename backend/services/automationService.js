const { Task, RecurringTaskTemplate } = require('../models');
const { Op } = require('sequelize');
const cron = require('node-cron');

/**
 * Smart Automation Service
 * Handles auto-moving overdue tasks, auto-creating recurring tasks, etc.
 */

/**
 * Auto-move overdue tasks to today
 */
async function moveOverdueTasks() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = await Task.findAll({
      where: {
        status: 'pending',
        dueDate: {
          [Op.lt]: today
        },
        date: {
          [Op.lt]: today
        }
      }
    });

    let movedCount = 0;
    for (const task of overdueTasks) {
      // Move to today
      task.date = today;
      await task.save();
      movedCount++;
    }

    console.log(`✅ Moved ${movedCount} overdue tasks to today`);
    return movedCount;
  } catch (error) {
    console.error('❌ Error moving overdue tasks:', error);
    throw error;
  }
}

/**
 * Auto-create next recurring task after completion
 */
async function createNextRecurringTask(taskId) {
  try {
    const task = await Task.findByPk(taskId);
    if (!task || !task.isRecurring || task.status !== 'completed') {
      return null;
    }

    // Determine next date based on recurring pattern
    let nextDate = new Date(task.date);
    
    if (task.recurringPattern === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (task.recurringPattern === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (task.recurringPattern === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else {
      // Custom pattern - check config
      if (task.recurringConfig) {
        const config = typeof task.recurringConfig === 'string' 
          ? JSON.parse(task.recurringConfig) 
          : task.recurringConfig;
        
        if (config.interval) {
          nextDate.setDate(nextDate.getDate() + config.interval);
        }
      }
    }

    // Check if next date is within endDate limit
    if (task.endDate && nextDate > new Date(task.endDate)) {
      return null; // Recurring period ended
    }

    // Check if task already exists for next date
    const existingTask = await Task.findOne({
      where: {
        userId: task.userId,
        title: task.title,
        date: {
          [Op.between]: [
            new Date(nextDate.setHours(0, 0, 0, 0)),
            new Date(nextDate.setHours(23, 59, 59, 999))
          ]
        }
      }
    });

    if (existingTask) {
      return existingTask; // Already exists
    }

    // Create next task
    const nextTask = await Task.create({
      userId: task.userId,
      title: task.title,
      description: task.description,
      date: nextDate,
      endDate: task.endDate,
      isRecurring: true,
      status: 'pending',
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      estimatedTime: task.estimatedTime,
      recurringPattern: task.recurringPattern,
      recurringConfig: task.recurringConfig,
      taskTemplateId: task.taskTemplateId || task.id
    });

    return nextTask;
  } catch (error) {
    console.error('❌ Error creating next recurring task:', error);
    throw error;
  }
}

/**
 * Process recurring task templates and create tasks
 */
async function processRecurringTemplates() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const templates = await RecurringTaskTemplate.findAll({
      where: {
        isActive: true,
        startDate: { [Op.lte]: today },
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gte]: today } }
        ]
      }
    });

    let createdCount = 0;
    for (const template of templates) {
      // Check if we need to generate tasks
      const lastGenerated = template.lastGeneratedDate 
        ? new Date(template.lastGeneratedDate)
        : new Date(template.startDate);
      lastGenerated.setHours(0, 0, 0, 0);

      // Generate tasks based on pattern
      if (template.pattern === 'daily') {
        // Generate tasks for days since last generation
        const daysDiff = Math.floor((today - lastGenerated) / (1000 * 60 * 60 * 24));
        
        for (let i = 1; i <= daysDiff; i++) {
          const taskDate = new Date(lastGenerated);
          taskDate.setDate(taskDate.getDate() + i);

          // Check if task already exists
          const existing = await Task.findOne({
            where: {
              userId: template.userId,
              title: template.title,
              date: {
                [Op.between]: [
                  new Date(taskDate.setHours(0, 0, 0, 0)),
                  new Date(taskDate.setHours(23, 59, 59, 999))
                ]
              }
            }
          });

          if (!existing) {
            await Task.create({
              userId: template.userId,
              title: template.title,
              description: template.description,
              date: taskDate,
              endDate: template.endDate,
              isRecurring: true,
              status: 'pending',
              priority: template.priority,
              category: template.category,
              recurringPattern: template.pattern,
              recurringConfig: template.patternConfig,
              taskTemplateId: template.id
            });
            createdCount++;
          }
        }
      }
      // Add weekly/monthly patterns similarly

      // Update last generated date
      template.lastGeneratedDate = today;
      await template.save();
    }

    console.log(`✅ Created ${createdCount} tasks from recurring templates`);
    return createdCount;
  } catch (error) {
    console.error('❌ Error processing recurring templates:', error);
    throw error;
  }
}

/**
 * Send smart reminders for upcoming deadlines
 */
async function sendDeadlineReminders() {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const upcomingTasks = await Task.findAll({
      where: {
        status: 'pending',
        dueDate: {
          [Op.between]: [now, tomorrow]
        }
      },
      include: ['user']
    });

    // Group by user and send notifications
    const userTasks = {};
    upcomingTasks.forEach(task => {
      if (!userTasks[task.userId]) {
        userTasks[task.userId] = [];
      }
      userTasks[task.userId].push(task);
    });

    // Create notifications for each user
    const { Notification } = require('../models');
    for (const [userId, tasks] of Object.entries(userTasks)) {
      for (const task of tasks) {
        const hoursUntilDue = Math.round((new Date(task.dueDate) - now) / (1000 * 60 * 60));
        let message = `Task "${task.title}" is due `;
        
        if (hoursUntilDue < 1) {
          message += 'very soon!';
        } else if (hoursUntilDue < 24) {
          message += `in ${hoursUntilDue} hours`;
        } else {
          message += 'tomorrow';
        }

        await Notification.create({
          userId: parseInt(userId),
          taskId: task.id,
          type: 'reminder',
          message
        });
      }
    }

    console.log(`✅ Sent reminders for ${upcomingTasks.length} tasks`);
    return upcomingTasks.length;
  } catch (error) {
    console.error('❌ Error sending deadline reminders:', error);
    throw error;
  }
}

/**
 * Schedule automation tasks
 */
function scheduleAutomationTasks() {
  // Move overdue tasks daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Running overdue task automation...');
    await moveOverdueTasks();
  });

  // Process recurring templates daily at 1 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('🔄 Processing recurring task templates...');
    await processRecurringTemplates();
  });

  // Send deadline reminders every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('🔄 Sending deadline reminders...');
    await sendDeadlineReminders();
  });

  console.log('✅ Automation tasks scheduled');
}

module.exports = {
  moveOverdueTasks,
  createNextRecurringTask,
  processRecurringTemplates,
  sendDeadlineReminders,
  scheduleAutomationTasks
};

