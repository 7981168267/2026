import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  Chip,
  Alert,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Timer as TimerIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { getTodayTasks, startTimer, stopTimer, getRunningTimer } from '../services/api';

/**
 * Focus Timer with Custom Time
 * Customizable focus sessions (1-120 minutes)
 */

const FocusTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 minutes
  const [customMinutes, setCustomMinutes] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const intervalRef = useRef(null);
  const [runningTimer, setRunningTimer] = useState(null);

  useEffect(() => {
    fetchTasks();
    checkRunningTimer();
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const fetchTasks = async () => {
    try {
      const response = await getTodayTasks();
      setTasks(response.data.filter(t => t.status === 'pending'));
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const checkRunningTimer = async () => {
    if (selectedTask) {
      try {
        const response = await getRunningTimer(selectedTask);
        if (response.data.running) {
          setRunningTimer(response.data);
          setIsRunning(true);
        }
      } catch (err) {
        // No running timer
      }
    }
  };

  const handleStart = async () => {
    if (selectedTask && !runningTimer) {
      try {
        await startTimer(selectedTask);
        await checkRunningTimer();
      } catch (err) {
        console.error('Failed to start timer:', err);
      }
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = async () => {
    setIsRunning(false);
    setTimeLeft(customMinutes * 60);
    
    if (selectedTask && runningTimer) {
      try {
        await stopTimer(selectedTask, 'Session stopped');
        setRunningTimer(null);
      } catch (err) {
        console.error('Failed to stop timer:', err);
      }
    }
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    if (selectedTask && runningTimer) {
      try {
        await stopTimer(selectedTask, 'Focus session completed');
        setRunningTimer(null);
      } catch (err) {
        console.error('Failed to stop timer:', err);
      }
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Session Complete!', {
        body: 'Great work! Time for a break!',
        icon: '/favicon.ico'
      });
    }

    setCompletedSessions(prev => prev + 1);
    setTimeLeft(customMinutes * 60);
  };

  const handleCustomTimeChange = (minutes) => {
    const newMinutes = Math.max(1, Math.min(120, parseInt(minutes) || 25));
    setCustomMinutes(newMinutes);
    if (!isRunning) {
      setTimeLeft(newMinutes * 60);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((customMinutes * 60 - timeLeft) / (customMinutes * 60)) * 100;

  return (
    <Box>
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2d3748' }}>
            Focus Timer
          </Typography>
          <Button
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
            variant="outlined"
            size="small"
          >
            Custom Time
          </Button>
        </Box>

        {/* Task Selection */}
        <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                select
                label="Select Task (Optional)"
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                disabled={isRunning}
              >
                <MenuItem value="">No task selected</MenuItem>
                {tasks.map((task) => (
                  <MenuItem key={task.id} value={task.id}>
                    {task.title}
                  </MenuItem>
                ))}
              </TextField>
        </Box>

        {/* Timer Display */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  mb: 3
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={progress}
                  size={280}
                  thickness={4}
                  sx={{
                    color: '#667eea',
                    transform: 'rotate(-90deg)',
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="h2" sx={{ fontWeight: 700, color: '#2d3748' }}>
                    {formatTime(timeLeft)}
                  </Typography>
                  <Chip
                    label={`${customMinutes} min session`}
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              {!isRunning ? (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayIcon />}
                  onClick={handleStart}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    },
                  }}
                >
                  Start
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PauseIcon />}
                    onClick={handlePause}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Pause
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<StopIcon />}
                    onClick={handleStop}
                    color="error"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Stop
                  </Button>
                </>
              )}
        </Box>

        {/* Session Stats */}
        <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
                      {completedSessions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sessions Today
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
                      {Math.floor((completedSessions * customMinutes) / 60)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hours Focused
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
        </Card>
      </Paper>

      {/* Custom Time Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Custom Timer Duration</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="number"
            label="Minutes"
            value={customMinutes}
            onChange={(e) => handleCustomTimeChange(e.target.value)}
            inputProps={{ min: 1, max: 120 }}
            helperText="Set custom focus time (1-120 minutes)"
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(102, 126, 234, 0.1)', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current setting: <strong>{customMinutes} minutes</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Recommended: 25 minutes (Pomodoro technique)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setTimeLeft(customMinutes * 60);
              setSettingsOpen(false);
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {selectedTask && runningTimer && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Timer is tracking time for the selected task
        </Alert>
      )}
    </Box>
  );
};

export default FocusTimer;
