import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Card,
  CardContent,
  IconButton,
  Chip,
  Fade,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  TaskAlt as TaskAltIcon
} from '@mui/icons-material';
import { getTodayTasks, updateTask, deleteTask } from '../services/api';
import { format } from 'date-fns';

const TaskList = ({ onTaskUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, task: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, taskId: null, taskTitle: '' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getTodayTasks();
      setTasks(response.data);
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await updateTask(task.id || task._id, { status: newStatus });
      await fetchTasks();
      // Trigger global refresh event for WeeklyCheckbook
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDeleteClick = (taskId, taskTitle) => {
    setDeleteDialog({ open: true, taskId, taskTitle });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.taskId) {
      setError('Task ID is missing');
      setDeleteDialog({ open: false, taskId: null, taskTitle: '' });
      return;
    }

    try {
      await deleteTask(deleteDialog.taskId);
      setDeleteDialog({ open: false, taskId: null, taskTitle: '' });
      setError('');
      await fetchTasks();
      // Trigger global refresh event for WeeklyCheckbook
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete task';
      setError(errorMessage);
      console.error('Delete task error:', err);
      setDeleteDialog({ open: false, taskId: null, taskTitle: '' });
    }
  };

  const handleEdit = (task) => {
    setEditDialog({ open: true, task });
  };

  const handleSaveEdit = async () => {
    try {
      if (!editDialog.task?.title?.trim()) {
        setError('Task title is required');
        return;
      }

      const taskId = editDialog.task.id || editDialog.task._id;
      if (!taskId) {
        setError('Task ID is missing');
        return;
      }

      await updateTask(taskId, {
        title: editDialog.task.title.trim(),
        description: editDialog.task.description || ''
      });
      setEditDialog({ open: false, task: null });
      setError('');
      await fetchTasks();
      // Trigger global refresh event for WeeklyCheckbook
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update task';
      setError(errorMessage);
      console.error('Update task error:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: '#667eea', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading your tasks...
          </Typography>
        </Box>
      </Box>
    );
  }

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        }}
      >
        <Box sx={{ mb: 3, pb: 2, borderBottom: '2px solid rgba(102, 126, 234, 0.1)' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748', mb: 0.5 }}>
            Today's Tasks
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              {format(new Date(), 'EEEE, MMMM dd, yyyy')}
            </Typography>
            <Chip
              icon={<TaskAltIcon />}
              label={`${completedCount} Completed`}
              color="success"
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<AssignmentIcon />}
              label={`${pendingCount} Pending`}
              color="warning"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
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

        {tasks.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <AssignmentIcon sx={{ fontSize: 60, color: '#667eea', opacity: 0.5 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 1 }}>
              No tasks for today
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a new task to get started!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tasks.map((task, index) => (
              <Fade in={true} timeout={300} key={task.id || task._id} style={{ transitionDelay: `${index * 50}ms` }}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    borderLeft: task.status === 'completed' ? '4px solid #4caf50' : '4px solid #ff9800',
                    backgroundColor: task.status === 'completed' ? 'rgba(76, 175, 80, 0.05)' : 'white',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <IconButton
                        onClick={() => handleToggleStatus(task)}
                        sx={{
                          mt: 0.5,
                          color: task.status === 'completed' ? '#4caf50' : '#9e9e9e',
                          '&:hover': {
                            backgroundColor: task.status === 'completed' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)',
                          },
                        }}
                      >
                        {task.status === 'completed' ? (
                          <CheckCircleIcon sx={{ fontSize: 28 }} />
                        ) : (
                          <RadioButtonUncheckedIcon sx={{ fontSize: 28 }} />
                        )}
                      </IconButton>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#2d3748',
                            mb: 0.5,
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                            opacity: task.status === 'completed' ? 0.7 : 1,
                          }}
                        >
                          {task.title}
                        </Typography>
                        {task.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 1.5,
                              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                              opacity: task.status === 'completed' ? 0.6 : 1,
                            }}
                          >
                            {task.description}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip
                            label={task.status === 'completed' ? 'Completed' : 'Pending'}
                            size="small"
                            color={task.status === 'completed' ? 'success' : 'warning'}
                            sx={{ fontWeight: 600, height: 24 }}
                          />
                          {task.priority && (
                            <Chip
                              label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                height: 24,
                                backgroundColor: 
                                  task.priority === 'urgent' ? '#f44336' :
                                  task.priority === 'high' ? '#ff9800' :
                                  task.priority === 'medium' ? '#2196f3' : '#4caf50',
                                color: 'white'
                              }}
                            />
                          )}
                          {task.category && (
                            <Chip
                              label={task.category}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 500, height: 24 }}
                            />
                          )}
                          {task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending' && (
                            <Chip
                              label="Overdue"
                              size="small"
                              color="error"
                              sx={{ fontWeight: 600, height: 24 }}
                            />
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit Task">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(task)}
                            sx={{
                              color: '#667eea',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Task">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(task.id || task._id, task.title)}
                            sx={{
                              color: '#f44336',
                              '&:hover': {
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Box>
        )}
      </Paper>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, task: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon sx={{ color: '#667eea' }} />
            Edit Task
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Task Title"
            variant="outlined"
            required
            value={editDialog.task?.title || ''}
            onChange={(e) =>
              setEditDialog({
                ...editDialog,
                task: { ...editDialog.task, title: e.target.value }
              })
            }
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            multiline
            rows={4}
            value={editDialog.task?.description || ''}
            onChange={(e) =>
              setEditDialog({
                ...editDialog,
                task: { ...editDialog.task, description: e.target.value }
              })
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setEditDialog({ open: false, task: null })}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={!editDialog.task?.title?.trim()}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
              },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, taskId: null, taskTitle: '' })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(244, 67, 54, 0.3)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: '#f44336' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <DeleteIcon />
            Delete Task
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Are you sure you want to delete this task?
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(244, 67, 54, 0.05)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
              {deleteDialog.taskTitle}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, taskId: null, taskTitle: '' })}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              borderRadius: 2,
              backgroundColor: '#f44336',
              '&:hover': {
                backgroundColor: '#d32f2f',
              },
            }}
          >
            Delete Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList;
