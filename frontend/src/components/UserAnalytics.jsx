import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  ButtonGroup,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getUserAnalytics } from '../services/api';

const COLORS = ['#667eea', '#764ba2', '#4caf50', '#ff9800'];

const UserAnalytics = ({ userId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('overall');

  useEffect(() => {
    fetchAnalytics();
  }, [userId, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getUserAnalytics(userId, period);
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return null;
  }

  const pieData = [
    { name: 'Completed', value: analytics.completedTasks },
    { name: 'Pending', value: analytics.pendingTasks }
  ];

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2} pb={2} borderBottom="2px solid rgba(102, 126, 234, 0.1)">
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748' }}>User Analytics</Typography>
        <ButtonGroup variant="outlined">
          <Button
            variant={period === 'daily' ? 'contained' : 'outlined'}
            onClick={() => setPeriod('daily')}
          >
            Daily
          </Button>
          <Button
            variant={period === 'weekly' ? 'contained' : 'outlined'}
            onClick={() => setPeriod('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={period === 'monthly' ? 'contained' : 'outlined'}
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={period === 'overall' ? 'contained' : 'outlined'}
            onClick={() => setPeriod('overall')}
          >
            Overall
          </Button>
        </ButtonGroup>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              borderLeft: '4px solid #667eea',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Total Tasks
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#2d3748', mt: 1 }}>
                {analytics.totalTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
              borderLeft: '4px solid #4caf50',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(76, 175, 80, 0.15)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Completed
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50', mt: 1 }}>
                {analytics.completedTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
              borderLeft: '4px solid #ff9800',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(255, 152, 0, 0.15)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Pending
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800', mt: 1 }}>
                {analytics.pendingTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #ffffff 0%, #f3e8ff 100%)',
              borderLeft: '4px solid #764ba2',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(118, 75, 162, 0.15)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Completion Rate
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#764ba2', mt: 1 }}>
                {analytics.completionRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {analytics.dailyData && analytics.dailyData.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748', mb: 2 }}>
                Daily Task Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#4caf50" name="Completed" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="pending" fill="#ff9800" name="Pending" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748', mb: 2 }}>
                Task Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default UserAnalytics;

