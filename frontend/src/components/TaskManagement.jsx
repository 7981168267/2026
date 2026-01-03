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
  Tooltip,
  Divider,
  Grid
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  TaskAlt as TaskAltIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { getTasks, updateTask, deleteTask } from '../services/api';
import { format } from 'date-fns';
import TaskForm from './TaskForm';

const TaskManagement = ({ onTaskUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, task: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, taskId: null, taskTitle: '', isRecurring: false });
  const [deleteByTitleDialog, setDeleteByTitleDialog] = useState({ open: false, taskTitle: '' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getTasks({ limit: 100, page: 1 });
      // Handle both array response and object with tasks property
      const tasksData = Array.isArray(response.data) ? response.data : (response.data.tasks || []);
      setTasks(tasksData);
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      console.error('Fetch tasks error:', err);
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await updateTask(taskId, { status: newStatus });
      await fetchTasks();
      // Trigger global refresh event for WeeklyCheckbook
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (err) {
      console.error('Toggle task error:', err);
      setError(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDeleteClick = (task) => {
    if (task.isRecurring) {
      // For recurring tasks, ask to delete all instances
      setDeleteByTitleDialog({
        open: true,
        taskTitle: task.title
      });
    } else {
      // Single task deletion
      setDeleteDialog({
        open: true,
        taskId: task.id,
        taskTitle: task.title,
        isRecurring: false
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.taskId) {
      setError('Task ID is missing');
      setDeleteDialog({ open: false, taskId: null, taskTitle: '', isRecurring: false });
      return;
    }

    try {
      await deleteTask(deleteDialog.taskId);
      setDeleteDialog({ open: false, taskId: null, taskTitle: '', isRecurring: false });
      setError('');
      await fetchTasks(); // Refresh task list
      if (onTaskUpdate) onTaskUpdate(); // Notify parent to refresh checkbook
      // Trigger global refresh event for WeeklyCheckbook
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete task';
      setError(errorMessage);
      console.error('Delete task error:', err);
      setDeleteDialog({ open: false, taskId: null, taskTitle: '', isRecurring: false });
    }
  };

  const handleDeleteByTitleConfirm = async () => {
    try {
      // Find first task with this title to use deleteAllRecurring
      const firstTask = tasks.find(t => t.title === deleteByTitleDialog.taskTitle);
      
      if (!firstTask || !firstTask.id) {
        setError('No tasks found with this title');
        setDeleteByTitleDialog({ open: false, taskTitle: '' });
        return;
      }

      // Delete all instances using deleteAllRecurring parameter
      await deleteTask(firstTask.id, { deleteAllRecurring: 'true' });

      setDeleteByTitleDialog({ open: false, taskTitle: '' });
      setError('');
      await fetchTasks(); // Refresh task list
      if (onTaskUpdate) onTaskUpdate(); // Notify parent to refresh checkbook
      // Trigger global refresh event for WeeklyCheckbook
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete tasks';
      setError(errorMessage);
      console.error('Delete tasks by title error:', err);
      setDeleteByTitleDialog({ open: false, taskTitle: '' });
    }
  };

  const handleEdit = (task) => {
    setEditDialog({ open: true, task: { ...task } });
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
      await fetchTasks(); // Refresh task list
      if (onTaskUpdate) onTaskUpdate(); // Notify parent to refresh checkbook
      // Trigger global refresh event for WeeklyCheckbook
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update task';
      setError(errorMessage);
      console.error('Update task error:', err);
    }
  };

  const handleTaskCreated = () => {
    fetchTasks(); // Refresh task list after creation
    if (onTaskUpdate) onTaskUpdate(); // Notify parent
    // Trigger global refresh event for WeeklyCheckbook
    window.dispatchEvent(new CustomEvent('taskUpdated'));
  };

  // Group tasks by title for better display
  const groupedTasks = tasks.reduce((acc, task) => {
    const key = task.title;
    if (!acc[key]) {
      acc[key] = {
        title: task.title,
        description: task.description,
        tasks: [],
        isRecurring: task.isRecurring || false
      };
    }
    acc[key].tasks.push(task);
    return acc;
  }, {});

  const taskGroups = Object.values(groupedTasks);

  return (
    <Box>
      {/* Task Form Section */}
      <Box sx={{ mb: 4 }}>
        <TaskForm onTaskCreated={handleTaskCreated} />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Task List Section */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        }}
      >
        <Box sx={{ mb: 3, pb: 2, borderBottom: '2px solid rgba(102, 126, 234, 0.1)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748', mb: 0.5 }}>
                My Tasks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and organize your tasks
              </Typography>
            </Box>
            <Chip
              icon={<TaskAltIcon />}
              label={`${tasks.length} Task${tasks.length !== 1 ? 's' : ''}`}
              color="primary"
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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : taskGroups.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              px: 2,
            }}
          >
            <AssignmentIcon sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No tasks found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first task using the form above
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {taskGroups.map((group, index) => (
              <Fade in={true} timeout={300 + index * 50} key={group.title}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    borderLeft: '4px solid #667eea',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#2d3748',
                            mb: 0.5,
                            wordBreak: 'break-word',
                          }}
                        >
                          {group.title}
                        </Typography>
                        {group.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 1,
                              wordBreak: 'break-word',
                            }}
                          >
                            {group.description}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          {group.isRecurring && (
                            <Chip
                              label="Recurring"
                              size="small"
                              color="info"
                              sx={{ height: 22, fontWeight: 600 }}
                            />
                          )}
                          <Chip
                            label={`${group.tasks.length} instance${group.tasks.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{ height: 22, fontWeight: 600, backgroundColor: '#e2e8f0' }}
                          />
                          <Chip
                            label={`${group.tasks.filter(t => t.status === 'completed').length} completed`}
                            size="small"
                            color="success"
                            sx={{ height: 22, fontWeight: 600 }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                        <Tooltip title="Edit Task">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(group.tasks[0])}
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
                            onClick={() => handleDeleteClick(group.tasks[0])}
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
                    <Divider sx={{ my: 1.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                        Task Instances:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {group.tasks.slice(0, 5).map((task) => (
                          <Box
                            key={task.id || task._id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 1.5,
                              borderRadius: 1,
                              backgroundColor: task.status === 'completed' ? 'rgba(76, 175, 80, 0.05)' : 'rgba(255, 152, 0, 0.05)',
                              borderLeft: task.status === 'completed' ? '3px solid #4caf50' : '3px solid #ff9800',
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleTaskToggle(task.id || task._id, task.status)}
                              sx={{
                                color: task.status === 'completed' ? '#4caf50' : '#ff9800',
                                p: 0.5,
                              }}
                            >
                              {task.status === 'completed' ? (
                                <CheckCircleIcon fontSize="small" />
                              ) : (
                                <RadioButtonUncheckedIcon fontSize="small" />
                              )}
                            </IconButton>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                  color: task.status === 'completed' ? 'text.secondary' : 'text.primary',
                                }}
                              >
                                {format(new Date(task.date), 'MMM dd, yyyy')}
                              </Typography>
                            </Box>
                            <Chip
                              label={task.status === 'completed' ? 'Completed' : 'Pending'}
                              size="small"
                              color={task.status === 'completed' ? 'success' : 'warning'}
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                            />
                          </Box>
                        ))}
                        {group.tasks.length > 5 && (
                          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5 }}>
                            ... and {group.tasks.length - 5} more instance{group.tasks.length - 5 !== 1 ? 's' : ''}
                          </Typography>
                        )}
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
            <EditIcon />
            Edit Task
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
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
          {editDialog.task?.isRecurring && (
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              <Typography variant="body2">
                Editing this task will update <strong>all recurring instances</strong> with the same title.
              </Typography>
            </Alert>
          )}
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

      {/* Delete Single Task Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, taskId: null, taskTitle: '', isRecurring: false })}
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
            onClick={() => setDeleteDialog({ open: false, taskId: null, taskTitle: '', isRecurring: false })}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #e53935 0%, #c62828 100%)',
              },
            }}
          >
            Delete Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Recurring Task Dialog (All Instances) */}
      <Dialog
        open={deleteByTitleDialog.open}
        onClose={() => setDeleteByTitleDialog({ open: false, taskTitle: '' })}
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
            Delete Recurring Task
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            This will delete <strong>ALL instances</strong> of this recurring task!
          </Alert>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Are you sure you want to delete the task "{deleteByTitleDialog.taskTitle}"?
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(244, 67, 54, 0.05)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 1 }}>
              {deleteByTitleDialog.taskTitle}
            </Typography>
            {tasks.filter(t => t.title === deleteByTitleDialog.taskTitle).length > 0 && (
              <Typography variant="body2" color="text.secondary">
                This will delete {tasks.filter(t => t.title === deleteByTitleDialog.taskTitle).length} task instance(s)
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteByTitleDialog({ open: false, taskTitle: '' })}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteByTitleConfirm}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #e53935 0%, #c62828 100%)',
              },
            }}
          >
            Delete All Instances
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskManagement;

