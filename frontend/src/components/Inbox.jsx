import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Label as LabelIcon
} from '@mui/icons-material';
import { createTask, getTasks, updateTask, deleteTask } from '../services/api';

/**
 * Inbox Component
 * Quick capture for tasks without date/category
 * Tasks are marked as "Unprocessed" and can be moved to proper lists later
 */
const Inbox = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [processDialog, setProcessDialog] = useState({ open: false, task: null });
  const [processDate, setProcessDate] = useState('');
  const [processCategory, setProcessCategory] = useState('General');

  useEffect(() => {
    fetchInboxTasks();
  }, []);

  const fetchInboxTasks = async () => {
    try {
      setLoading(true);
      // Fetch tasks with inbox status or no date
      const response = await getTasks({ status: 'pending', limit: 100 });
      // Filter for tasks without date or with inbox flag
      const inboxTasks = response.data.tasks.filter(task => 
        !task.date || task.category === 'Inbox' || task.title.startsWith('[INBOX]')
      );
      setTasks(inboxTasks);
    } catch (err) {
      setError('Failed to fetch inbox tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!quickTitle.trim()) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await createTask({
        title: `[INBOX] ${quickTitle}`,
        description: '',
        date: today.toISOString(),
        category: 'Inbox',
        priority: 'medium'
      });
      
      setQuickTitle('');
      setQuickAddOpen(false);
      fetchInboxTasks();
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
    }
  };

  const handleProcessTask = async () => {
    if (!processDialog.task || !processDate) return;

    try {
      await updateTask(processDialog.task.id, {
        title: processDialog.task.title.replace('[INBOX] ', ''),
        date: new Date(processDate).toISOString(),
        category: processCategory
      });
      
      setProcessDialog({ open: false, task: null });
      fetchInboxTasks();
    } catch (err) {
      setError('Failed to process task');
      console.error(err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      fetchInboxTasks();
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  const handleComplete = async (task) => {
    try {
      await updateTask(task.id, { status: 'completed' });
      fetchInboxTasks();
    } catch (err) {
      setError('Failed to complete task');
      console.error(err);
    }
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748', mb: 0.5 }}>
              Inbox
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quick capture for tasks. Process them later with dates and categories.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setQuickAddOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
              },
            }}
          >
            Quick Add
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
        ) : tasks.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary">
              Your inbox is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add tasks quickly without worrying about dates or categories
            </Typography>
          </Box>
        ) : (
          <List>
            {tasks.map((task) => (
              <ListItem
                key={task.id}
                sx={{
                  mb: 1,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        opacity: task.status === 'completed' ? 0.6 : 1,
                      }}
                    >
                      {task.title.replace('[INBOX] ', '')}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      {task.category && (
                        <Chip
                          label={task.category}
                          size="small"
                          icon={<LabelIcon />}
                          sx={{ height: 22 }}
                        />
                      )}
                      {task.date && (
                        <Chip
                          label={new Date(task.date).toLocaleDateString()}
                          size="small"
                          icon={<ScheduleIcon />}
                          sx={{ height: 22 }}
                        />
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {task.status !== 'completed' && (
                      <>
                        <IconButton
                          edge="end"
                          onClick={() => handleComplete(task)}
                          color="success"
                          size="small"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => setProcessDialog({ open: true, task })}
                          color="primary"
                          size="small"
                        >
                          <ScheduleIcon />
                        </IconButton>
                      </>
                    )}
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(task.id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Quick Add Dialog */}
      <Dialog open={quickAddOpen} onClose={() => setQuickAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Quick Add Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Task Title"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleQuickAdd();
              }
            }}
            placeholder="What needs to be done?"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickAddOpen(false)}>Cancel</Button>
          <Button onClick={handleQuickAdd} variant="contained" disabled={!quickTitle.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Process Task Dialog */}
      <Dialog open={processDialog.open} onClose={() => setProcessDialog({ open: false, task: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Process Task</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={processDate}
            onChange={(e) => setProcessDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Category"
            value={processCategory}
            onChange={(e) => setProcessCategory(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialog({ open: false, task: null })}>Cancel</Button>
          <Button onClick={handleProcessTask} variant="contained" disabled={!processDate}>
            Process
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inbox;

