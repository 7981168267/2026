const cron = require('node-cron');
const { Task, User, Notification } = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('../config/email');

// Run daily at 11:30 PM
const scheduleDailyReminders = () => {
  cron.schedule('30 23 * * *', async () => {
    console.log('Running daily reminder check at 11:30 PM...');
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find all pending tasks for today
      const pendingTasks = await Task.findAll({
        where: {
          date: { [Op.gte]: today, [Op.lt]: tomorrow },
          status: 'pending'
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      // Group tasks by user
      const tasksByUser = {};
      pendingTasks.forEach(task => {
        const userId = task.userId.toString();
        if (!tasksByUser[userId]) {
          tasksByUser[userId] = {
            user: task.user,
            tasks: []
          };
        }
        tasksByUser[userId].tasks.push(task);
      });

      // Send notifications for each user
      for (const userId in tasksByUser) {
        const { user, tasks } = tasksByUser[userId];
        
        if (tasks.length === 0) continue;

        // Create web notification
        const notificationMessage = `You have ${tasks.length} pending task(s) from today.`;
        await Notification.create({
          userId: user.id,
          type: 'reminder',
          message: notificationMessage
        });

        // Send email notification
        const emailSubject = `Daily Task Reminder - ${tasks.length} Pending Task(s)`;
        const emailHtml = `
          <h2>Daily Task Reminder</h2>
          <p>Hi ${user.name},</p>
          <p>You have ${tasks.length} pending task(s) from today that need to be completed:</p>
          <ul>
            ${tasks.map(task => `<li>${task.title}</li>`).join('')}
          </ul>
          <p>Please complete these tasks before the day ends.</p>
        `;

        await sendEmail(user.email, emailSubject, emailHtml);

        console.log(`Sent reminder to user ${user.email} for ${tasks.length} task(s)`);
      }

      console.log(`Daily reminder check completed. Notified ${Object.keys(tasksByUser).length} user(s).`);
    } catch (error) {
      console.error('Error in daily reminder scheduler:', error);
    }
  });
};

module.exports = { scheduleDailyReminders };
