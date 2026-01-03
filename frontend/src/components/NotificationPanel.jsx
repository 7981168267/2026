import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Badge,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  MarkEmailRead as MarkEmailReadIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/api';

const NotificationPanel = ({ open, onClose, onNotificationRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      fetchNotifications();
      if (onNotificationRead) onNotificationRead();
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifications();
      if (onNotificationRead) onNotificationRead();
    } catch (err) {
      setError('Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <NotificationsActiveIcon sx={{ fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Notifications
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        {unreadCount > 0 && (
          <>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<MarkEmailReadIcon />}
                onClick={handleMarkAllAsRead}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5568d3',
                    backgroundColor: 'rgba(102, 126, 234, 0.08)',
                  },
                }}
              >
                Mark All as Read
              </Button>
            </Box>
            <Divider />
          </>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ m: 2, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
            <Box textAlign="center">
              <CircularProgress size={40} sx={{ color: '#667eea', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading notifications...
              </Typography>
            </Box>
          </Box>
        ) : notifications.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <NotificationsActiveIcon sx={{ fontSize: 50, color: '#667eea', opacity: 0.5 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 1 }}>
              No notifications
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              You're all caught up!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id || notification._id}
                  disablePadding
                  sx={{
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  <ListItemButton
                    onClick={() => !notification.read && handleMarkAsRead(notification.id || notification._id)}
                    sx={{
                      p: 2.5,
                      backgroundColor: notification.read ? 'transparent' : 'rgba(102, 126, 234, 0.05)',
                      '&:hover': {
                        backgroundColor: notification.read ? 'rgba(0,0,0,0.02)' : 'rgba(102, 126, 234, 0.1)',
                      },
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        mr: 2,
                        bgcolor: notification.read
                          ? 'rgba(102, 126, 234, 0.1)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        background: notification.read
                          ? 'rgba(102, 126, 234, 0.1)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      <NotificationsActiveIcon sx={{ color: notification.read ? '#667eea' : 'white' }} />
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: notification.read ? 500 : 600,
                            color: '#2d3748',
                            mb: 0.5,
                          }}
                        >
                          {notification.message}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(notification.createdAt), 'MMM dd, yyyy • HH:mm')}
                          </Typography>
                          {notification.taskId && (
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                              Task: {notification.taskId.title}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    {!notification.read && (
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: '#667eea',
                          ml: 1,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationPanel;
