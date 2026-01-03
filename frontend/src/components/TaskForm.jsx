import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControlLabel,
  Switch,
  MenuItem,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import {
  Title as TitleIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  Send as SendIcon,
  Repeat as RepeatIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Close as CloseIcon,
  Flag as FlagIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { createTask, getTodayTasks } from '../services/api';
import { format } from 'date-fns';

const TaskForm = ({ onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    // Default to January 1, 2026
    const defaultDate = new Date('2026-01-01');
    return defaultDate.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  // Load persisted daily toggle state from localStorage
  const [isDaily, setIsDaily] = useState(() => {
    const saved = localStorage.getItem('taskForm_isDaily');
    return saved === 'true';
  });
  const [durationMonths, setDurationMonths] = useState(() => {
    const saved = localStorage.getItem('taskForm_durationMonths');
    return saved ? parseInt(saved) : 1;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentTasks, setRecentTasks] = useState([]);
  const [showRecentTasks, setShowRecentTasks] = useState(false);

  // Clear success message and recent tasks when component unmounts (navigating away)
  useEffect(() => {
    return () => {
      setSuccess('');
      setShowRecentTasks(false);
    };
  }, []);

  // Fetch today's tasks to show recently created ones
  const fetchRecentTasks = async () => {
    try {
      const response = await getTodayTasks();
      // Show only tasks created today, sorted by newest first
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const filtered = response.data.filter(task => {
        const taskDate = new Date(task.date || task.createdAt);
        return taskDate >= today;
      }).slice(0, 5); // Show max 5 recent tasks
      setRecentTasks(filtered);
    } catch (err) {
      console.error('Failed to fetch recent tasks:', err);
    }
  };

  useEffect(() => {
    fetchRecentTasks();
  }, []);

  // Persist daily toggle state to localStorage
  const handleDailyToggle = (checked) => {
    setIsDaily(checked);
    localStorage.setItem('taskForm_isDaily', checked.toString());
    if (!checked) {
      localStorage.removeItem('taskForm_durationMonths');
    }
  };

  const handleDurationChange = (value) => {
    setDurationMonths(value);
    localStorage.setItem('taskForm_durationMonths', value.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await createTask({
        title,
        description,
        date: new Date(date).toISOString(),
        isDaily: isDaily,
        durationMonths: isDaily ? durationMonths : 0,
        priority,
        category,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : null
      });

      if (result.data.tasksCreated) {
        setSuccess(`Successfully created ${result.data.tasksCreated} daily tasks!`);
      } else {
        setSuccess('Task created successfully!');
      }

      // Clear only title and description - keep settings for next task
      setTitle('');
      setDescription('');
      // Keep date, isDaily, and durationMonths - stay on form for next task

      // Show recently created tasks
      setShowRecentTasks(true);
      await fetchRecentTasks();

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);

      // Just refresh task count, don't navigate away
      if (onTaskCreated) {
        onTaskCreated();
      }
      
      // Trigger global refresh event for WeeklyCheckbook and other components
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleDismissSuccess = () => {
    setSuccess('');
    setShowRecentTasks(false);
  };

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          maxWidth: 700,
          mx: 'auto',
          mb: 3,
        }}
      >
        <Box sx={{ mb: 3, pb: 2, borderBottom: '2px solid rgba(102, 126, 234, 0.1)' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748', mb: 0.5 }}>
            Create New Task
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new task to your schedule
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={handleDismissSuccess}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Task Title"
            variant="outlined"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TitleIcon sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
            }}
            placeholder="e.g., 6 O'CLOCK WAKEUP, READ 1 HOUR, GYM 45 MIN"
          />

          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                  <DescriptionIcon sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ScheduleIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
            <TextField
              fullWidth
              select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              SelectProps={{
                native: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FlagIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </TextField>
            <TextField
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CategoryIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
              placeholder="Work, Personal, Health, etc."
            />
          </Box>

          <TextField
            fullWidth
            label="Estimated Time (minutes)"
            type="number"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTimeIcon sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
            }}
            helperText="Optional: Estimated time to complete this task"
          />

          <Box
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: 2,
              border: '2px solid rgba(102, 126, 234, 0.2)',
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={isDaily}
                  onChange={(e) => handleDailyToggle(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RepeatIcon sx={{ color: '#667eea' }} />
                  <Typography sx={{ fontWeight: 600 }}>Create Daily Recurring Task</Typography>
                </Box>
              }
              sx={{ mb: isDaily ? 2 : 0 }}
            />

            {isDaily && (
              <Box>
                <TextField
                  fullWidth
                  select
                  label="Duration"
                  value={durationMonths}
                  onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                  sx={{
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  helperText={`Task will be created for each day from ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} onwards`}
                >
                  <MenuItem value={1}>1 Month (~30 days)</MenuItem>
                  <MenuItem value={2}>2 Months (~60 days)</MenuItem>
                  <MenuItem value={3}>3 Months (~90 days)</MenuItem>
                  <MenuItem value={6}>6 Months (~180 days)</MenuItem>
                  <MenuItem value={12}>12 Months (1 Year, ~365 days)</MenuItem>
                  <MenuItem value={24}>24 Months (2 Years, ~730 days)</MenuItem>
                </TextField>
                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  <Typography variant="body2">
                    This will create <strong>{durationMonths * 30} daily tasks</strong> (approximately) starting from your selected date. 
                    Each day will have its own checkbox in the checkbook.
                  </Typography>
                </Alert>
              </Box>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !title.trim()}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            sx={{
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: '#e2e8f0',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Creating Task...' : isDaily ? `Create Daily Tasks (${durationMonths} Month${durationMonths > 1 ? 's' : ''})` : 'Create Task'}
          </Button>
        </Box>
      </Paper>

      {/* Recently Created Tasks - Show below form after creation */}
      {showRecentTasks && recentTasks.length > 0 && (
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
            maxWidth: 700,
            mx: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>
              Recently Created Tasks
            </Typography>
            <IconButton
              size="small"
              onClick={handleDismissSuccess}
              sx={{ color: '#64748b' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {recentTasks.map((task) => (
              <Card
                key={task.id || task._id}
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  borderLeft: task.status === 'completed' ? '4px solid #4caf50' : '4px solid #ff9800',
                  backgroundColor: task.status === 'completed' ? 'rgba(76, 175, 80, 0.05)' : 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    {task.status === 'completed' ? (
                      <CheckCircleIcon sx={{ color: '#4caf50', mt: 0.5 }} />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ color: '#ff9800', mt: 0.5 }} />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: '#2d3748',
                          mb: 0.5,
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </Typography>
                      {task.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 1,
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                          }}
                        >
                          {task.description}
                        </Typography>
                      )}
                      <Chip
                        label={task.status === 'completed' ? 'Completed' : 'Pending'}
                        size="small"
                        color={task.status === 'completed' ? 'success' : 'warning'}
                        sx={{ fontWeight: 600, height: 22 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default TaskForm;
