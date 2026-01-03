import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  useTheme,
  useMediaQuery,
  CssBaseline
} from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import TaskManagement from './TaskManagement';
import AnalyticsChart from './AnalyticsChart';
import WeeklyCheckBook from './WeeklyCheckBook';
import NotificationPanel from './NotificationPanel';
import Profile from './Profile';
import Settings from './Settings';
import Help from './Help';
import Sidebar from './Sidebar';
import CalendarView from './CalendarView';
import FocusTimer from './FocusTimer';
import Exercises from './Exercises';
import BodyConditionCalculator from './BodyConditionCalculator';
import LanguageLearning from './LanguageLearning';
import Reminders from './Reminders';
import Reports from './Reports';
import { getUnreadCount, getNotifications } from '../services/api';
import { requestNotificationPermission, showNotification } from '../utils/requestNotificationPermission';

const DRAWER_WIDTH = 280;

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  // Store scroll positions for each tab
  const scrollPositions = useRef({});
  const mainContentRef = useRef(null);
  const prevTabValue = useRef(tabValue);

  useEffect(() => {
    requestNotificationPermission();
    fetchUnreadCount();
    checkNewNotifications();
    const interval = setInterval(() => {
      fetchUnreadCount();
      checkNewNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Save scroll position when tab changes
  useEffect(() => {
    if (mainContentRef.current && prevTabValue.current !== null) {
      scrollPositions.current[prevTabValue.current] = mainContentRef.current.scrollTop;
    }
    prevTabValue.current = tabValue;
  }, [tabValue]);

  // Restore scroll position when tab is active
  useEffect(() => {
    if (mainContentRef.current && scrollPositions.current[tabValue] !== undefined) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        if (mainContentRef.current) {
          mainContentRef.current.scrollTop = scrollPositions.current[tabValue];
        }
      }, 50);
    } else {
      // Scroll to top for new pages
      setTimeout(() => {
        if (mainContentRef.current) {
          mainContentRef.current.scrollTop = 0;
        }
      }, 50);
    }
  }, [tabValue]);

  const checkNewNotifications = async () => {
    try {
      const response = await getNotifications('false');
      const unreadNotifications = response.data;
      unreadNotifications.forEach(notification => {
        showNotification('Task Reminder', {
          body: notification.message,
          tag: notification._id
        });
      });
    } catch (err) {
      console.error('Failed to check notifications:', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuItemClick = (value) => {
    // Save current scroll position before switching
    if (mainContentRef.current) {
      scrollPositions.current[tabValue] = mainContentRef.current.scrollTop;
    }
    setTabValue(value);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: '#ffffff',
          color: '#333',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Task Tracker
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => setNotificationOpen(true)}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar
        open={mobileOpen || !isMobile}
        onClose={() => setMobileOpen(false)}
        unreadCount={unreadCount}
        onNotificationClick={() => setNotificationOpen(true)}
        onLogout={handleLogout}
        onMenuClick={handleMenuItemClick}
        activeTab={tabValue}
      />

      {/* Main Content */}
      <Box
        ref={mainContentRef}
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          height: '100vh',
          overflow: 'auto',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          '&::-webkit-scrollbar': {
            width: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '10px',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '100%' }}>
          {/* Render content based on tabValue */}
          {tabValue === 0 && <TaskList onTaskUpdate={fetchUnreadCount} />}
          {tabValue === 1 && <TaskManagement onTaskUpdate={() => {
            // Refresh unread count and checkbook
            fetchUnreadCount();
          }} />}
          {tabValue === 2 && <AnalyticsChart />}
          {tabValue === 3 && <WeeklyCheckBook />}
          {tabValue === 4 && <Profile />}
          {tabValue === 5 && <Settings />}
          {tabValue === 6 && <CalendarView />}
          {tabValue === 7 && <FocusTimer />}
          {tabValue === 14 && <Exercises />}
          {tabValue === 15 && <BodyConditionCalculator />}
          {tabValue === 16 && <LanguageLearning />}
          {tabValue === 'help' && <Help />}
          {tabValue === 'about' && <Help />}
        </Box>
      </Box>

      {/* Notification Panel */}
      <NotificationPanel
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        onNotificationRead={fetchUnreadCount}
      />
    </Box>
  );
};

export default UserDashboard;
