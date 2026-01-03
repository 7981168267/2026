require('dotenv').config();
const { TaskTemplate, User } = require('../models');
const sequelize = require('../config/database');

/**
 * Seed default/popular task templates
 * These are commonly used templates that all users can access
 */
const defaultTemplates = [
  {
    name: 'Daily Morning Routine',
    description: 'Start your day right with a productive morning routine',
    title: 'Complete Morning Routine',
    taskDescription: 'Follow your morning routine: exercise, meditation, healthy breakfast, and planning the day',
    category: 'Personal',
    priority: 'high',
    estimatedTime: 60,
    isPublic: true
  },
  {
    name: 'Work Meeting Preparation',
    description: 'Prepare for an important meeting',
    title: 'Prepare for Meeting',
    taskDescription: 'Review agenda, prepare talking points, gather necessary documents, and set up meeting room',
    category: 'Work',
    priority: 'high',
    estimatedTime: 30,
    isPublic: true
  },
  {
    name: 'Project Planning Session',
    description: 'Plan a new project from scratch',
    title: 'Project Planning',
    taskDescription: 'Define project goals, create timeline, identify resources needed, assign tasks, and set milestones',
    category: 'Work',
    priority: 'high',
    estimatedTime: 120,
    isPublic: true
  },
  {
    name: 'Daily Exercise',
    description: 'Daily workout routine',
    title: 'Exercise Session',
    taskDescription: 'Complete your daily exercise routine: warm-up, main workout, cool-down, and stretching',
    category: 'Health',
    priority: 'medium',
    estimatedTime: 45,
    isPublic: true
  },
  {
    name: 'Weekly Review',
    description: 'Review your week and plan ahead',
    title: 'Weekly Review & Planning',
    taskDescription: 'Review completed tasks, analyze productivity, identify improvements, plan next week goals, and update calendar',
    category: 'Personal',
    priority: 'medium',
    estimatedTime: 60,
    isPublic: true
  },
  {
    name: 'Email Management',
    description: 'Process and organize emails',
    title: 'Email Inbox Cleanup',
    taskDescription: 'Read new emails, respond to urgent messages, archive old emails, organize folders, and unsubscribe from unwanted lists',
    category: 'Work',
    priority: 'medium',
    estimatedTime: 30,
    isPublic: true
  },
  {
    name: 'Learning Session',
    description: 'Dedicated learning time',
    title: 'Study/Learning Session',
    taskDescription: 'Read course materials, take notes, practice exercises, review previous lessons, and complete assignments',
    category: 'Education',
    priority: 'high',
    estimatedTime: 90,
    isPublic: true
  },
  {
    name: 'Meal Prep',
    description: 'Prepare meals for the week',
    title: 'Weekly Meal Preparation',
    taskDescription: 'Plan meals, create shopping list, buy ingredients, prep vegetables, cook main dishes, and store meals',
    category: 'Personal',
    priority: 'medium',
    estimatedTime: 120,
    isPublic: true
  },
  {
    name: 'Code Review',
    description: 'Review and refactor code',
    title: 'Code Review & Refactoring',
    taskDescription: 'Review pull requests, test code changes, refactor old code, update documentation, and fix bugs',
    category: 'Work',
    priority: 'high',
    estimatedTime: 60,
    isPublic: true
  },
  {
    name: 'Client Presentation',
    description: 'Prepare and deliver client presentation',
    title: 'Client Presentation',
    taskDescription: 'Create presentation slides, prepare talking points, practice delivery, gather client requirements, and schedule meeting',
    category: 'Work',
    priority: 'urgent',
    estimatedTime: 180,
    isPublic: true
  },
  {
    name: 'Meditation & Mindfulness',
    description: 'Daily meditation practice',
    title: 'Meditation Session',
    taskDescription: 'Find quiet space, set timer, practice breathing exercises, guided meditation, and reflection',
    category: 'Health',
    priority: 'medium',
    estimatedTime: 20,
    isPublic: true
  },
  {
    name: 'Budget Review',
    description: 'Review and manage finances',
    title: 'Monthly Budget Review',
    taskDescription: 'Review expenses, categorize transactions, analyze spending patterns, set budget goals, and plan savings',
    category: 'Personal',
    priority: 'high',
    estimatedTime: 45,
    isPublic: true
  },
  {
    name: 'Content Creation',
    description: 'Create blog post or article',
    title: 'Write Blog Post',
    taskDescription: 'Research topic, create outline, write first draft, edit and proofread, add images, and publish',
    category: 'Work',
    priority: 'medium',
    estimatedTime: 120,
    isPublic: true
  },
  {
    name: 'Team Standup',
    description: 'Daily team standup meeting',
    title: 'Team Standup',
    taskDescription: 'Prepare updates, attend standup meeting, share progress, discuss blockers, and update task board',
    category: 'Work',
    priority: 'high',
    estimatedTime: 15,
    isPublic: true
  },
  {
    name: 'Home Organization',
    description: 'Organize and declutter home',
    title: 'Home Organization',
    taskDescription: 'Declutter room, organize items, donate unused items, deep clean, and create organization system',
    category: 'Personal',
    priority: 'low',
    estimatedTime: 180,
    isPublic: true
  },
  {
    name: 'Networking Event',
    description: 'Prepare for networking event',
    title: 'Networking Event Preparation',
    taskDescription: 'Research event and attendees, prepare elevator pitch, update LinkedIn profile, print business cards, and plan questions',
    category: 'Work',
    priority: 'medium',
    estimatedTime: 60,
    isPublic: true
  },
  {
    name: 'Reading Session',
    description: 'Dedicated reading time',
    title: 'Reading Time',
    taskDescription: 'Choose book, find quiet space, read for set time, take notes on key points, and reflect on learnings',
    category: 'Education',
    priority: 'low',
    estimatedTime: 60,
    isPublic: true
  },
  {
    name: 'Social Media Management',
    description: 'Manage social media accounts',
    title: 'Social Media Content',
    taskDescription: 'Plan content calendar, create posts, schedule updates, engage with audience, analyze metrics, and respond to comments',
    category: 'Work',
    priority: 'medium',
    estimatedTime: 45,
    isPublic: true
  },
  {
    name: 'Health Checkup',
    description: 'Schedule and attend health checkup',
    title: 'Health Checkup',
    taskDescription: 'Schedule appointment, prepare health history, list current medications, attend appointment, and follow up on results',
    category: 'Health',
    priority: 'high',
    estimatedTime: 90,
    isPublic: true
  },
  {
    name: 'Product Launch',
    description: 'Launch a new product',
    title: 'Product Launch Preparation',
    taskDescription: 'Finalize product features, create marketing materials, set up launch page, prepare press release, and coordinate launch event',
    category: 'Work',
    priority: 'urgent',
    estimatedTime: 240,
    isPublic: true
  },
  {
    name: 'Vacation Planning',
    description: 'Plan a vacation trip',
    title: 'Vacation Planning',
    taskDescription: 'Research destinations, book flights and hotels, create itinerary, pack luggage, arrange travel insurance, and set out-of-office',
    category: 'Personal',
    priority: 'medium',
    estimatedTime: 180,
    isPublic: true
  }
];

async function seedDefaultTemplates() {
  try {
    console.log('🌱 Seeding default task templates...\n');

    // Get admin user or first user (for public templates, userId can be null or admin)
    const adminUser = await User.findOne({ 
      where: { email: 'admin@example.com' },
      attributes: ['id']
    }) || await User.findOne({ 
      order: [['id', 'ASC']],
      attributes: ['id']
    });

    const userId = adminUser ? adminUser.id : null;

    let created = 0;
    let skipped = 0;

    for (const template of defaultTemplates) {
      // Check if template already exists
      const existing = await TaskTemplate.findOne({
        where: {
          name: template.name,
          isPublic: true
        }
      });

      if (existing) {
        console.log(`  ⚠ Skipping: "${template.name}" (already exists)`);
        skipped++;
        continue;
      }

      await TaskTemplate.create({
        ...template,
        userId: userId,
        usageCount: 0
      });

      console.log(`  ✓ Created: "${template.name}"`);
      created++;
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Created: ${created} templates`);
    console.log(`   Skipped: ${skipped} templates`);
    console.log(`   Total: ${defaultTemplates.length} templates\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  sequelize.authenticate()
    .then(() => {
      console.log('📦 Database connected\n');
      return seedDefaultTemplates();
    })
    .catch(error => {
      console.error('❌ Database connection error:', error);
      process.exit(1);
    });
}

module.exports = { seedDefaultTemplates, defaultTemplates };

