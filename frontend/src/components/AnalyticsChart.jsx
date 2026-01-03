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
  Alert,
  Chip,
  LinearProgress,
  Fade,
  Grow,
  alpha,
  IconButton,
  Switch,
  FormControlLabel
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
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  Whatshot as WhatshotIcon,
  EmojiEvents as EmojiEventsIcon,
  ShowChart as ShowChartIcon,
  Today as TodayIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { getTaskAnalytics } from '../services/api';

// Dark mode color palette (CRM Dashboard inspired)
const DARK_COLORS = {
  background: '#0f172a',
  cardBackground: '#1e293b',
  cardHover: '#334155',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  primary: '#8b5cf6', // Purple
  secondary: '#06b6d4', // Cyan
  success: '#10b981', // Green
  warning: '#f59e0b', // Amber
  accent1: '#ec4899', // Pink
  accent2: '#3b82f6', // Blue
  accent3: '#14b8a6', // Teal
  gradient1: ['#8b5cf6', '#ec4899'], // Purple to Pink
  gradient2: ['#06b6d4', '#3b82f6'], // Cyan to Blue
  gradient3: ['#10b981', '#14b8a6'], // Green to Teal
};

// Light mode color palette
const LIGHT_COLORS = {
  background: '#f8fafc',
  cardBackground: '#ffffff',
  cardHover: '#f1f5f9',
  text: '#1e293b',
  textSecondary: '#64748b',
  primary: '#6366f1', // Indigo
  secondary: '#0ea5e9', // Sky
  success: '#059669', // Emerald
  warning: '#d97706', // Amber
  accent1: '#db2777', // Pink
  accent2: '#2563eb', // Blue
  accent3: '#0891b2', // Cyan
  gradient1: ['#6366f1', '#db2777'],
  gradient2: ['#0ea5e9', '#2563eb'],
  gradient3: ['#059669', '#0891b2'],
};

const StatCard = ({ icon, title, value, subtitle, color, change, delay = 0, isDark }) => {
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  return (
    <Grow in={true} timeout={600 + delay * 100}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: isDark 
            ? '0 8px 32px rgba(0,0,0,0.4)' 
            : '0 8px 24px rgba(0,0,0,0.12)',
          background: isDark 
            ? colors.cardBackground 
            : `linear-gradient(135deg, ${color[0]} 0%, ${color[1]} 100%)`,
          color: isDark ? colors.text : 'white',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          border: isDark ? `1px solid ${alpha(colors.primary, 0.2)}` : 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark 
              ? `linear-gradient(135deg, ${alpha(color[0], 0.2)} 0%, ${alpha(color[1], 0.2)} 100%)`
              : 'rgba(255,255,255,0.1)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: isDark 
              ? `0 12px 40px ${alpha(color[0], 0.3)}`
              : `0 12px 32px ${alpha(color[0], 0.4)}`,
            '&::before': {
              opacity: 1,
            },
          },
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                backgroundColor: isDark 
                  ? alpha(color[0], 0.2)
                  : 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: isDark ? `1px solid ${alpha(color[0], 0.3)}` : 'none',
              }}
            >
              {React.cloneElement(icon, { 
                sx: { fontSize: 32, color: isDark ? color[0] : 'white' } 
              })}
            </Box>
            {change !== undefined && change !== 0 && (
              <Chip
                icon={change > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={`${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
                size="small"
                sx={{
                  backgroundColor: isDark 
                    ? alpha(change > 0 ? colors.success : colors.warning, 0.2)
                    : 'rgba(255, 255, 255, 0.25)',
                  color: isDark 
                    ? (change > 0 ? colors.success : colors.warning)
                    : 'white',
                  fontWeight: 700,
                  backdropFilter: 'blur(10px)',
                  border: isDark ? `1px solid ${alpha(change > 0 ? colors.success : colors.warning, 0.3)}` : 'none',
                }}
              />
            )}
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '2rem', md: '2.5rem' } }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ opacity: isDark ? 0.9 : 0.95, fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ opacity: isDark ? 0.7 : 0.85 }}>
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
};

const AnalyticsChart = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('overall');
  const [isDark, setIsDark] = useState(true); // Default to dark mode

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getTaskAnalytics(period);
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight={500} 
        gap={2}
        sx={{ bgcolor: colors.background, borderRadius: 3, p: 4 }}
      >
        <CircularProgress size={64} sx={{ color: colors.primary }} thickness={4} />
        <Typography variant="h6" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
          Analyzing your productivity...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          m: 2, 
          borderRadius: 3,
          bgcolor: isDark ? colors.cardBackground : undefined,
          color: colors.text
        }} 
        onClose={() => setError('')}
      >
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return null;
  }

  const pieData = [
    { name: 'Completed', value: analytics.completedTasks, color: colors.success },
    { name: 'Pending', value: analytics.pendingTasks, color: colors.warning }
  ];

  const completionRate = analytics.completionRate || 0;
  const currentStreak = analytics.currentStreak || 0;
  const bestStreak = analytics.bestStreak || 0;
  const avgTasksPerDay = analytics.avgTasksPerDay || 0;
  const mostProductiveDay = analytics.mostProductiveDay || 'N/A';

  // Format daily data for better display
  const formattedDailyData = analytics.dailyData?.map(item => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dateShort: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
  })) || [];

  // Prepare radar chart data for weekly productivity
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdayData = weekdays.map((day, index) => {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index];
    const completedCount = formattedDailyData
      .filter(d => new Date(d.date).getDay() === index)
      .reduce((sum, d) => sum + d.completed, 0);
    return {
      day,
      completed: completedCount,
      fullName: dayName
    };
  });

  const maxCompleted = Math.max(...weekdayData.map(d => d.completed), 1);

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Fade in={true} timeout={800}>
        <Paper
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mb: 3,
            borderRadius: 4,
            boxShadow: isDark 
              ? '0 8px 32px rgba(0,0,0,0.4)' 
              : '0 8px 32px rgba(0,0,0,0.08)',
            background: isDark 
              ? colors.cardBackground 
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
            border: isDark ? `1px solid ${alpha(colors.primary, 0.1)}` : 'none',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={3}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  color: colors.text, 
                  mb: 1,
                  background: isDark 
                    ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent1} 100%)`
                    : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent1} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Analytics Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: colors.textSecondary, fontSize: '1.1rem' }}>
                Track your productivity and performance insights
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={isDark}
                    onChange={(e) => setIsDark(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: colors.primary,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: colors.primary,
                      },
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {isDark ? (
                      <DarkModeIcon sx={{ color: colors.primary }} />
                    ) : (
                      <LightModeIcon sx={{ color: colors.warning }} />
                    )}
                    <Typography sx={{ color: colors.text, fontWeight: 600 }}>
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </Typography>
                  </Box>
                }
              />
              <ButtonGroup 
                variant="outlined" 
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: isDark 
                    ? '0 4px 12px rgba(0,0,0,0.3)' 
                    : '0 4px 12px rgba(0,0,0,0.1)',
                  borderColor: isDark ? alpha(colors.primary, 0.3) : undefined,
                }}
              >
                <Button
                  variant={period === 'daily' ? 'contained' : 'outlined'}
                  onClick={() => setPeriod('daily')}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 700,
                    px: 3,
                    color: period === 'daily' ? 'white' : colors.text,
                    bgcolor: period === 'daily' ? colors.primary : 'transparent',
                    borderColor: alpha(colors.primary, 0.3),
                    '&:hover': {
                      bgcolor: period === 'daily' ? colors.primary : alpha(colors.primary, 0.1),
                      borderColor: colors.primary,
                    },
                  }}
                >
                  Daily
                </Button>
                <Button
                  variant={period === 'weekly' ? 'contained' : 'outlined'}
                  onClick={() => setPeriod('weekly')}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 700,
                    px: 3,
                    color: period === 'weekly' ? 'white' : colors.text,
                    bgcolor: period === 'weekly' ? colors.secondary : 'transparent',
                    borderColor: alpha(colors.secondary, 0.3),
                    '&:hover': {
                      bgcolor: period === 'weekly' ? colors.secondary : alpha(colors.secondary, 0.1),
                      borderColor: colors.secondary,
                    },
                  }}
                >
                  Weekly
                </Button>
                <Button
                  variant={period === 'monthly' ? 'contained' : 'outlined'}
                  onClick={() => setPeriod('monthly')}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 700,
                    px: 3,
                    color: period === 'monthly' ? 'white' : colors.text,
                    bgcolor: period === 'monthly' ? colors.accent3 : 'transparent',
                    borderColor: alpha(colors.accent3, 0.3),
                    '&:hover': {
                      bgcolor: period === 'monthly' ? colors.accent3 : alpha(colors.accent3, 0.1),
                      borderColor: colors.accent3,
                    },
                  }}
                >
                  Monthly
                </Button>
                <Button
                  variant={period === 'overall' ? 'contained' : 'outlined'}
                  onClick={() => setPeriod('overall')}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 700,
                    px: 3,
                    color: period === 'overall' ? 'white' : colors.text,
                    bgcolor: period === 'overall' ? colors.accent1 : 'transparent',
                    borderColor: alpha(colors.accent1, 0.3),
                    '&:hover': {
                      bgcolor: period === 'overall' ? colors.accent1 : alpha(colors.accent1, 0.1),
                      borderColor: colors.accent1,
                    },
                  }}
                >
                  Overall
                </Button>
              </ButtonGroup>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<AssessmentIcon />}
                title="Total Tasks"
                value={analytics.totalTasks}
                subtitle={`${period.charAt(0).toUpperCase() + period.slice(1)} period`}
                color={DARK_COLORS.gradient1}
                change={analytics.tasksChange}
                delay={0}
                isDark={isDark}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<CheckCircleIcon />}
                title="Completed"
                value={analytics.completedTasks}
                subtitle={`${((analytics.completedTasks / Math.max(analytics.totalTasks, 1)) * 100).toFixed(1)}% of total`}
                color={DARK_COLORS.gradient3}
                delay={1}
                isDark={isDark}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<WhatshotIcon />}
                title="Current Streak"
                value={currentStreak}
                subtitle={`${currentStreak === 1 ? 'day' : 'days'} in a row!`}
                color={DARK_COLORS.gradient1}
                delay={2}
                isDark={isDark}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<TrendingUpIcon />}
                title="Completion Rate"
                value={`${completionRate.toFixed(1)}%`}
                subtitle={completionRate >= 80 ? 'Excellent! 🎉' : completionRate >= 60 ? 'Good job! 👏' : 'Keep going! 💪'}
                color={DARK_COLORS.gradient2}
                change={analytics.completionRateChange}
                delay={3}
                isDark={isDark}
              />
            </Grid>

            {bestStreak > 0 && (
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<EmojiEventsIcon />}
                  title="Best Streak"
                  value={bestStreak}
                  subtitle="All-time record!"
                  color={[colors.warning, colors.accent1]}
                  delay={4}
                  isDark={isDark}
                />
              </Grid>
            )}

            {avgTasksPerDay > 0 && (
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<ShowChartIcon />}
                  title="Avg Tasks/Day"
                  value={avgTasksPerDay}
                  subtitle="Daily average"
                  color={DARK_COLORS.gradient2}
                  delay={5}
                  isDark={isDark}
                />
              </Grid>
            )}

            {mostProductiveDay !== 'N/A' && (
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<TodayIcon />}
                  title="Most Productive"
                  value={mostProductiveDay.substring(0, 3)}
                  subtitle="Day of the week"
                  color={DARK_COLORS.gradient3}
                  delay={6}
                  isDark={isDark}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<PendingIcon />}
                title="Pending Tasks"
                value={analytics.pendingTasks}
                subtitle="Need attention"
                color={[colors.warning, colors.accent1]}
                delay={7}
                isDark={isDark}
              />
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Charts */}
      {formattedDailyData.length > 0 && (
        <Grid container spacing={3}>
          {/* Daily Overview - Area Chart */}
          <Grid item xs={12} md={8}>
            <Fade in={true} timeout={1000}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  mb: 3,
                  borderRadius: 4,
                  boxShadow: isDark 
                    ? '0 8px 32px rgba(0,0,0,0.4)' 
                    : '0 8px 32px rgba(0,0,0,0.08)',
                  background: colors.cardBackground,
                  border: isDark ? `1px solid ${alpha(colors.primary, 0.1)}` : 'none',
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent1} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CalendarIcon sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text }}>
                    Daily Task Overview
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={formattedDailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.success} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={colors.success} stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.warning} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={colors.warning} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? alpha(colors.text, 0.1) : '#e0e0e0'} />
                    <XAxis
                      dataKey="dateLabel"
                      tick={{ fill: colors.textSecondary, fontSize: 12, fontWeight: 600 }}
                      stroke={isDark ? alpha(colors.text, 0.2) : '#b0b0b0'}
                    />
                    <YAxis tick={{ fill: colors.textSecondary, fontSize: 12, fontWeight: 600 }} stroke={isDark ? alpha(colors.text, 0.2) : '#b0b0b0'} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.cardBackground,
                        border: `1px solid ${alpha(colors.primary, 0.2)}`,
                        borderRadius: 12,
                        boxShadow: isDark 
                          ? '0 8px 24px rgba(0,0,0,0.4)' 
                          : '0 8px 24px rgba(0,0,0,0.15)',
                        padding: '12px 16px',
                        color: colors.text,
                      }}
                      labelFormatter={(value) => `Date: ${value}`}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: 20, color: colors.text }}
                      iconType="circle"
                      iconSize={12}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke={colors.success}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorCompleted)"
                      name="Completed Tasks"
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stroke={colors.warning}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPending)"
                      name="Pending Tasks"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Fade>

            {/* Completion Trend - Line Chart */}
            <Fade in={true} timeout={1200}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 4,
                  boxShadow: isDark 
                    ? '0 8px 32px rgba(0,0,0,0.4)' 
                    : '0 8px 32px rgba(0,0,0,0.08)',
                  background: colors.cardBackground,
                  border: isDark ? `1px solid ${alpha(colors.primary, 0.1)}` : 'none',
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.accent3} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text }}>
                    Completion Trend
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={formattedDailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? alpha(colors.text, 0.1) : '#e0e0e0'} />
                    <XAxis
                      dataKey="dateLabel"
                      tick={{ fill: colors.textSecondary, fontSize: 12, fontWeight: 600 }}
                      stroke={isDark ? alpha(colors.text, 0.2) : '#b0b0b0'}
                    />
                    <YAxis tick={{ fill: colors.textSecondary, fontSize: 12, fontWeight: 600 }} stroke={isDark ? alpha(colors.text, 0.2) : '#b0b0b0'} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.cardBackground,
                        border: `1px solid ${alpha(colors.primary, 0.2)}`,
                        borderRadius: 12,
                        boxShadow: isDark 
                          ? '0 8px 24px rgba(0,0,0,0.4)' 
                          : '0 8px 24px rgba(0,0,0,0.15)',
                        padding: '12px 16px',
                        color: colors.text,
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: 20, color: colors.text }}
                      iconType="line"
                      iconSize={12}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke={colors.success}
                      strokeWidth={4}
                      name="Completed"
                      dot={{ fill: colors.success, r: 6, strokeWidth: 2, stroke: colors.cardBackground }}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke={colors.warning}
                      strokeWidth={4}
                      name="Pending"
                      dot={{ fill: colors.warning, r: 6, strokeWidth: 2, stroke: colors.cardBackground }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Fade>
          </Grid>

          {/* Side Charts */}
          <Grid item xs={12} md={4}>
            {/* Task Distribution - Pie Chart */}
            <Fade in={true} timeout={1000}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  mb: 3,
                  borderRadius: 4,
                  boxShadow: isDark 
                    ? '0 8px 32px rgba(0,0,0,0.4)' 
                    : '0 8px 32px rgba(0,0,0,0.08)',
                  background: colors.cardBackground,
                  border: isDark ? `1px solid ${alpha(colors.primary, 0.1)}` : 'none',
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent1} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AssessmentIcon sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text }}>
                    Task Distribution
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent, value }) =>
                        `${name}: ${value}\n${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.cardBackground,
                        border: `1px solid ${alpha(colors.primary, 0.2)}`,
                        borderRadius: 12,
                        boxShadow: isDark 
                          ? '0 8px 24px rgba(0,0,0,0.4)' 
                          : '0 8px 24px rgba(0,0,0,0.15)',
                        color: colors.text,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <Box mt={3} display="flex" flexDirection="column" gap={1.5}>
                  {pieData.map((item, index) => (
                    <Box 
                      key={index} 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="space-between" 
                      p={1.5} 
                      sx={{
                        borderRadius: 2,
                        backgroundColor: alpha(item.color, 0.1),
                        border: `1px solid ${alpha(item.color, 0.2)}`,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: item.color,
                          }}
                        />
                        <Typography variant="body1" sx={{ fontWeight: 600, color: colors.text }}>
                          {item.name}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: item.color }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Fade>

            {/* Weekly Productivity - Radar Chart */}
            {weekdayData.some(d => d.completed > 0) && (
              <Fade in={true} timeout={1200}>
                <Paper
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 4,
                    boxShadow: isDark 
                      ? '0 8px 32px rgba(0,0,0,0.4)' 
                      : '0 8px 32px rgba(0,0,0,0.08)',
                    background: colors.cardBackground,
                    border: isDark ? `1px solid ${alpha(colors.primary, 0.1)}` : 'none',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${colors.accent3} 0%, ${colors.secondary} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShowChartIcon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text }}>
                      Weekly Pattern
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={weekdayData}>
                      <PolarGrid stroke={isDark ? alpha(colors.text, 0.1) : '#e0e0e0'} />
                      <PolarAngleAxis 
                        dataKey="day" 
                        tick={{ fill: colors.textSecondary, fontSize: 12, fontWeight: 600 }} 
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, maxCompleted]} 
                        tick={{ fill: colors.textSecondary, fontSize: 10 }} 
                      />
                      <Radar
                        name="Completed Tasks"
                        dataKey="completed"
                        stroke={colors.success}
                        fill={colors.success}
                        fillOpacity={0.6}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: colors.cardBackground,
                          border: `1px solid ${alpha(colors.primary, 0.2)}`,
                          borderRadius: 12,
                          boxShadow: isDark 
                            ? '0 8px 24px rgba(0,0,0,0.4)' 
                            : '0 8px 24px rgba(0,0,0,0.15)',
                          color: colors.text,
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <Box mt={2} textAlign="center">
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Most productive: <strong style={{ color: colors.text }}>{mostProductiveDay}</strong>
                    </Typography>
                  </Box>
                </Paper>
              </Fade>
            )}
          </Grid>
        </Grid>
      )}

      {formattedDailyData.length === 0 && (
        <Fade in={true} timeout={800}>
          <Paper
            sx={{
              p: 6,
              borderRadius: 4,
              boxShadow: isDark 
                ? '0 8px 32px rgba(0,0,0,0.4)' 
                : '0 8px 32px rgba(0,0,0,0.08)',
              textAlign: 'center',
              background: colors.cardBackground,
              border: isDark ? `1px solid ${alpha(colors.primary, 0.1)}` : 'none',
            }}
          >
            <AssessmentIcon sx={{ fontSize: 64, color: colors.textSecondary, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text, mb: 1 }}>
              No Data Available
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary }}>
              Create some tasks to see your analytics and productivity insights here
            </Typography>
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default AnalyticsChart;
