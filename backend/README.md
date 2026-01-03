# Task Tracker Backend

Express.js backend API for the Task Tracker application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tasktracker
JWT_SECRET=your_jwt_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
FRONTEND_URL=http://localhost:3000
```

3. Start the server:
```bash
npm run dev
```

## Database Models

- **User**: Stores user information (name, email, password, role)
- **Task**: Stores task information (userId, title, description, date, status)
- **Notification**: Stores notification information (userId, taskId, type, message, read)

## Scheduled Jobs

Daily reminders are sent at 11:30 PM for users with pending tasks using node-cron.

