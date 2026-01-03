import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  EmojiEvents as EmojiEventsIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { getHabits, createHabit, updateHabit, deleteHabit, completeHabit } from '../services/api';

/**
 * Habits Component
 * Daily habits with streak tracking - Uses Real Data
 */
const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', color: '#667eea' });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const response = await getHabits();
      setHabits(response.data);
    } catch (err) {
      setError('Failed to fetch habits');
      console.error('Fetch habits error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await completeHabit(id);
      await fetchHabits(); // Refresh to get updated streaks
    } catch (err) {
      setError('Failed to complete habit');
      console.error('Complete habit error:', err);
    }
  };

  const handleAddHabit = async () => {
    if (!newHabit.name.trim()) return;

    try {
      await createHabit({
        name: newHabit.name.trim(),
        color: newHabit.color
      });
      setNewHabit({ name: '', color: '#667eea' });
      setDialogOpen(false);
      await fetchHabits();
    } catch (err) {
      setError('Failed to create habit');
      console.error('Create habit error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this habit?')) return;

    try {
      await deleteHabit(id);
      await fetchHabits();
    } catch (err) {
      setError('Failed to delete habit');
      console.error('Delete habit error:', err);
    }
  };

  const weeklyConsistency = (habit) => {
    // Calculate from current streak (simplified - can be enhanced with actual completion history)
    return Math.min(habit.currentStreak * 14, 100);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748', mb: 0.5 }}>
              Habits
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Build daily habits and track your streaks
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            New Habit
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : habits.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary">
              No habits yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Create your first habit to start tracking
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {habits.map((habit) => (
            <Grid item xs={12} sm={6} md={4} key={habit.id}>
              <Card
                sx={{
                  height: '100%',
                  borderLeft: `4px solid ${habit.color}`,
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {habit.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {habit.completedToday && (
                        <CheckCircleIcon sx={{ color: '#4caf50' }} />
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(habit.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Current Streak
                      </Typography>
                      <Chip
                        icon={<EmojiEventsIcon />}
                        label={`${habit.currentStreak} days`}
                        size="small"
                        sx={{ backgroundColor: habit.color, color: 'white' }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={weeklyConsistency(habit)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: habit.color,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Best Streak: {habit.bestStreak} days
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Weekly: {weeklyConsistency(habit).toFixed(0)}%
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant={habit.completedToday ? 'outlined' : 'contained'}
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleMarkComplete(habit.id)}
                    disabled={habit.completedToday}
                    sx={{
                      backgroundColor: habit.completedToday ? 'transparent' : habit.color,
                      color: habit.completedToday ? habit.color : 'white',
                      borderColor: habit.color,
                      '&:hover': {
                        backgroundColor: habit.completedToday ? 'rgba(0,0,0,0.05)' : habit.color,
                      },
                    }}
                  >
                    {habit.completedToday ? 'Completed Today' : 'Mark Complete'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Add Habit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Habit</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Habit Name"
            value={newHabit.name}
            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
            placeholder="e.g., Morning Exercise, Read 30 minutes"
          />
          <TextField
            fullWidth
            label="Color"
            type="color"
            value={newHabit.color}
            onChange={(e) => setNewHabit({ ...newHabit, color: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddHabit} variant="contained" disabled={!newHabit.name.trim()}>
            Add Habit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Habits;

