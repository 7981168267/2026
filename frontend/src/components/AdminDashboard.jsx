import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  CssBaseline
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserList from './UserList';
import UserAnalytics from './UserAnalytics';
import Profile from './Profile';
import Settings from './Settings';
import Help from './Help';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = 280;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    setTabValue(1);
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
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar
        open={mobileOpen || !isMobile}
        onClose={() => setMobileOpen(false)}
        unreadCount={0}
        onNotificationClick={() => {}}
        onLogout={handleLogout}
        onMenuClick={(value) => {
          setTabValue(value);
          if (isMobile) setMobileOpen(false);
        }}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          height: '100vh',
          overflow: 'auto',
          backgroundColor: '#f5f7fa',
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '100%' }}>
          {tabValue === 0 && <UserList onUserSelect={handleUserSelect} />}
          {tabValue === 1 && selectedUserId && (
            <UserAnalytics userId={selectedUserId} />
          )}
          {tabValue === 2 && <Profile />}
          {tabValue === 3 && <Settings />}
          {tabValue === 'help' && <Help />}
          {tabValue === 'about' && <Help />}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
