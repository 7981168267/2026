import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AddTask as AddTaskIcon,
  Analytics as AnalyticsIcon,
  CalendarViewWeek as CalendarIcon,
  CalendarToday as CalendarTodayIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Timer as TimerIcon,
  Inbox as InboxIcon,
  Article as ArticleIcon,
  EmojiEvents as EmojiEventsIcon,
  Label as LabelIcon,
  NotificationsActive as NotificationsActiveIcon,
  Assessment as ReportsIcon,
  CheckCircle as CheckCircleIcon,
  FitnessCenter as FitnessCenterIcon,
  Calculate as CalculateIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 280;

const Sidebar = ({ open, onClose, unreadCount, onNotificationClick, onLogout, onMenuClick, activeTab }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';

  const userMenuItems = [
    { text: "Today's Tasks", icon: <DashboardIcon />, path: '/dashboard', value: 0 },
    { text: 'Create Task', icon: <AddTaskIcon />, path: '/dashboard', value: 1 },
    { text: 'Weekly Checkbook', icon: <CalendarIcon />, path: '/dashboard', value: 3 },
    { text: 'Calendar', icon: <CalendarTodayIcon />, path: '/dashboard', value: 6 },
    { text: 'Focus Timer', icon: <TimerIcon />, path: '/dashboard', value: 7 },
    { text: 'Exercises', icon: <FitnessCenterIcon />, path: '/dashboard', value: 14 },
    { text: 'Body Calculator', icon: <CalculateIcon />, path: '/dashboard', value: 15 },
    { text: 'Language Learning', icon: <LanguageIcon />, path: '/dashboard', value: 16 },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/dashboard', value: 2 },
    
    { text: 'Profile', icon: <PersonIcon />, path: '/dashboard', value: 4 },
    { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard', value: 5 },
  ];

  const adminMenuItems = [
    { text: 'User Management', icon: <PeopleIcon />, path: '/admin', value: 0 },
    { text: 'User Analytics', icon: <AssessmentIcon />, path: '/admin', value: 1 },
    { text: 'Profile', icon: <PersonIcon />, path: '/admin', value: 2 },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin', value: 3 },
  ];

  const commonFooterItems = [
    { text: 'Help & Support', icon: <HelpIcon />, path: '/help', value: 'help' },
    { text: 'About', icon: <InfoIcon />, path: '/about', value: 'about' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleMenuItemClick = (item) => {
    if (item.path === '/dashboard' || item.path === '/admin') {
      if (onMenuClick) {
        onMenuClick(item.value);
      }
      navigate(item.path);
    } else if (item.path === '/help' || item.path === '/about') {
      // For help/about, just navigate and let dashboard handle it
      if (onMenuClick) {
        onMenuClick(item.value);
      }
      const currentPath = isAdmin ? '/admin' : '/dashboard';
      navigate(currentPath);
    } else {
      if (onMenuClick) {
        onMenuClick(item.value);
      }
      const currentPath = isAdmin ? '/admin' : '/dashboard';
      navigate(currentPath);
    }
    if (onClose) onClose();
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: 'none',
          backgroundColor: '#ffffff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
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
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.25)',
                width: 56,
                height: 56,
                fontSize: '1.5rem',
                fontWeight: 700,
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem', display: 'block' }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={isAdmin ? 'Administrator' : 'User'}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24,
              alignSelf: 'flex-start',
            }}
          />
        </Box>

        <Divider />

        {/* Menu Items */}
        <List sx={{ flex: 1, pt: 1.5, px: 1 }}>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleMenuItemClick(item)}
                sx={{
                  borderRadius: 2,
                  py: 1.3,
                  px: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateX(4px)',
                  },
                  ...(activeTab === item.value && {
                    backgroundColor: 'rgba(102, 126, 234, 0.15)',
                    borderLeft: '3px solid #667eea',
                    '& .MuiListItemIcon-root': {
                      color: '#667eea',
                    },
                    '& .MuiListItemText-primary': {
                      color: '#667eea',
                      fontWeight: 600,
                    },
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 44,
                    color: activeTab === item.value ? '#667eea' : '#64748b',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: activeTab === item.value ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        {/* Footer Actions */}
        <Box sx={{ p: 1.5 }}>
          {/* Notifications */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={onNotificationClick}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 44, position: 'relative', color: '#64748b' }}>
                <NotificationsIcon />
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      backgroundColor: '#f44336',
                      color: 'white',
                      borderRadius: '50%',
                      width: 22,
                      height: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 4px rgba(244, 67, 54, 0.4)',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Box>
                )}
              </ListItemIcon>
              <ListItemText
                primary="Notifications"
                primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>

          {/* Help & About */}
          {commonFooterItems.map((item) => (
            <ListItem key={item.value} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleMenuItemClick(item)}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 44, color: '#64748b' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          <Divider sx={{ my: 1 }} />

          {/* Logout */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={onLogout}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: 2,
                color: '#f44336',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 44, color: '#f44336' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 600 }}
              />
            </ListItemButton>
          </ListItem>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
