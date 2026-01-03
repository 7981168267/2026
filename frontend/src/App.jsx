import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#9aa7f0',
      dark: '#4c63d2',
      contrastText: '#fff',
    },
    secondary: {
      main: '#764ba2',
      light: '#9a6fc4',
      dark: '#5a3a7a',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3748',
      secondary: '#718096',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 8px rgba(102, 126, 234, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            Loading...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
      <Route
        path="/admin"
        element={
          <PrivateRoute adminOnly={true}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

