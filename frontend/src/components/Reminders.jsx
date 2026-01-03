import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Alert
} from '@mui/material';
import {
  NotificationsActive as NotificationsActiveIcon,
  Snooze as SnoozeIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { getNotifications, markNotificationAsRead } from '../services/api';
import { format } from 'date-fns';

/**
 * Reminders Component
 * Central reminder list with snooze and reschedule
 */
const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await getNotifications('false');
      // Filter for reminder type notifications
      const reminderList = response.data.filter(n => n.type === 'reminder' || n.type === 'web');
      setReminders(reminderList);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSnooze = async (id) => {
    // In a real app, this would reschedule the reminder
    alert('Reminder snoozed for 1 hour');
    // You could update the reminder's scheduled time here
  };

  const handleDismiss = async (id) => {
    try {
      await markNotificationAsRead(id);
      fetchReminders();
    } catch (err) {
      console.error('Failed to dismiss reminder:', err);
    }
  };

  const handleDelete = (id) => {
    // In a real app, this would delete the reminder
    setReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748', mb: 0.5 }}>
            Reminders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your upcoming reminders and notifications
          </Typography>
        </Box>

        {reminders.length === 0 ? (
          <Alert severity="info">
            No active reminders. You're all caught up!
          </Alert>
        ) : (
          <List>
            {reminders.map((reminder) => (
              <ListItem
                key={reminder.id}
                sx={{
                  mb: 1,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <NotificationsActiveIcon sx={{ color: '#ff9800', mr: 2 }} />
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {reminder.message}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={format(new Date(reminder.createdAt), 'MMM d, h:mm a')}
                        size="small"
                        variant="outlined"
                      />
                      {reminder.taskId && (
                        <Chip label="Task Related" size="small" />
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      edge="end"
                      onClick={() => handleSnooze(reminder.id)}
                      color="primary"
                      size="small"
                      title="Snooze"
                    >
                      <SnoozeIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDismiss(reminder.id)}
                      color="success"
                      size="small"
                      title="Dismiss"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(reminder.id)}
                      color="error"
                      size="small"
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Reminders;

