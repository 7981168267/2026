import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Checkbox,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  GetApp as GetAppIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { getWeeklyCheckbook, updateTask, deleteTask } from '../services/api';
import { format, startOfWeek, addDays, addWeeks, subWeeks, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';

const WeeklyCheckBook = () => {
  const [checkbookData, setCheckbookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Default to current week
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 0 }); // Sunday as start of week
  });
  const [weeksCount, setWeeksCount] = useState(2);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editDialog, setEditDialog] = useState({ open: false, task: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, taskId: null, taskTitle: '' });

  useEffect(() => {
    fetchCheckbookData();
  }, [currentWeekStart, weeksCount, refreshTrigger]);

  // Listen for task updates from other components
  useEffect(() => {
    const handleTaskUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    // Listen for custom event when tasks are created/updated
    window.addEventListener('taskUpdated', handleTaskUpdate);
    
    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdate);
    };
  }, []);

  const fetchCheckbookData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getWeeklyCheckbook(currentWeekStart.toISOString(), weeksCount);
      setCheckbookData(response.data);
    } catch (err) {
      setError('Failed to fetch checkbook data');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeeks = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, weeksCount));
  };

  const handleNextWeeks = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, weeksCount));
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 0 }));
  };

  const handleTaskToggle = async (taskId, currentStatus, dateKey) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await updateTask(taskId, { status: newStatus });
      // Refresh checkbook data
      await fetchCheckbookData();
      // Trigger global refresh event
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (err) {
      setError('Failed to update task');
      console.error('Toggle task error:', err);
    }
  };

  const handleMenuOpen = (event, taskTitle, taskData) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTask({ title: taskTitle, ...taskData });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTask(null);
  };

  const handleEditClick = () => {
    if (selectedTask) {
      // Get first task instance for editing
      const firstDayKey = Object.keys(checkbookData.tasks[selectedTask.title].days).find(
        key => checkbookData.tasks[selectedTask.title].days[key]
      );
      const firstTask = checkbookData.tasks[selectedTask.title].days[firstDayKey];
      if (firstTask) {
        setEditDialog({
          open: true,
          task: {
            id: firstTask.id,
            title: selectedTask.title,
            description: selectedTask.description
          }
        });
      }
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedTask) {
      // Delete all instances of this task (by title)
      setDeleteDialog({
        open: true,
        taskId: null, // Will delete by title pattern
        taskTitle: selectedTask.title
      });
    }
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    try {
      if (!editDialog.task?.title?.trim()) {
        setError('Task title is required');
        return;
      }
      
      // Update the task - backend will handle updating all recurring instances
      await updateTask(editDialog.task.id, {
        title: editDialog.task.title.trim(),
        description: editDialog.task.description || ''
      });
      setEditDialog({ open: false, task: null });
      setError('');
      await fetchCheckbookData();
      // Trigger global refresh event
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
      console.error('Edit task error:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    // Delete all task instances with this title
    try {
      if (!checkbookData || !checkbookData.tasks || !checkbookData.tasks[deleteDialog.taskTitle]) {
        setError('Task not found');
        setDeleteDialog({ open: false, taskId: null, taskTitle: '' });
        return;
      }

      // Get the first task ID to delete (we'll use deleteAllRecurring parameter)
      const firstTaskId = Object.values(checkbookData.tasks[deleteDialog.taskTitle].days)
        .find(dayData => dayData && dayData.id)?.id;

      if (!firstTaskId) {
        setError('No task ID found');
        setDeleteDialog({ open: false, taskId: null, taskTitle: '' });
        return;
      }

      // Delete all instances using deleteAllRecurring parameter
      await deleteTask(firstTaskId, { deleteAllRecurring: 'true' });
      
      setDeleteDialog({ open: false, taskId: null, taskTitle: '' });
      setError('');
      await fetchCheckbookData(); // Refresh checkbook
      // Trigger global refresh event
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete tasks');
      console.error('Delete task error:', err);
      setDeleteDialog({ open: false, taskId: null, taskTitle: '' });
    }
  };

  const handleExportExcel = () => {
    if (!checkbookData) return;

    const wsData = [];
    
    // Header
    wsData.push(['Task Checkbook', '', '', '', '', '', '', '']);
    wsData.push([
      'Period:',
      format(parseISO(checkbookData.weekStart), 'MMM dd, yyyy'),
      '-',
      format(parseISO(checkbookData.weekEnd), 'MMM dd, yyyy'),
      '',
      '',
      '',
      ''
    ]);
    wsData.push([]);

    // Days header
    const headers = ['Task'];
    checkbookData.days.forEach(day => {
      headers.push(format(parseISO(day.date), 'MMM dd'));
    });
    wsData.push(headers);

    // Task rows
    Object.keys(checkbookData.tasks).forEach(taskTitle => {
      const taskRow = [taskTitle];
      checkbookData.days.forEach(day => {
        const dayData = checkbookData.tasks[taskTitle].days[day.dateKey];
        if (dayData) {
          taskRow.push(dayData.status === 'completed' ? '✓' : '');
        } else {
          taskRow.push('');
        }
      });
      wsData.push(taskRow);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Checkbook');
    XLSX.writeFile(wb, `task_checkbook_${format(parseISO(checkbookData.weekStart), 'yyyy-MM-dd')}.xlsx`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: '#667eea', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading checkbook...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2, borderRadius: 2 }} onClose={() => setError('')}>
        {error}
      </Alert>
    );
  }

  if (!checkbookData) {
    return null;
  }

  const taskTitles = Object.keys(checkbookData.tasks);

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'auto',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2} pb={2} borderBottom="2px solid rgba(102, 126, 234, 0.1)">
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748' }}>
            Weekly Checkbook
          </Typography>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Weeks</InputLabel>
              <Select
                value={weeksCount}
                label="Weeks"
                onChange={(e) => setWeeksCount(parseInt(e.target.value))}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value={2}>2 Weeks</MenuItem>
                <MenuItem value={4}>4 Weeks</MenuItem>
                <MenuItem value={8}>8 Weeks</MenuItem>
                <MenuItem value={12}>12 Weeks</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<GetAppIcon />}
              onClick={handleExportExcel}
              sx={{ borderRadius: 2 }}
            >
              Export to Excel
            </Button>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton onClick={handlePreviousWeeks} sx={{ borderRadius: 2 }}>
                <ArrowBackIosIcon />
              </IconButton>
              <Typography variant="body2" sx={{ minWidth: 200, textAlign: 'center' }}>
                {format(parseISO(checkbookData.weekStart), 'MMM dd')} - {format(parseISO(checkbookData.weekEnd), 'MMM dd, yyyy')}
              </Typography>
              <IconButton onClick={handleNextWeeks} sx={{ borderRadius: 2 }}>
                <ArrowForwardIosIcon />
              </IconButton>
              <Button
                variant="outlined"
                size="small"
                onClick={handleGoToToday}
                sx={{ ml: 1, borderRadius: 2 }}
              >
                Today
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={fetchCheckbookData}
                sx={{ ml: 1, borderRadius: 2 }}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </Box>

        {taskTitles.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 1 }}>
              No tasks found for this period
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create tasks with dates in this range to see them in the checkbook
            </Typography>
            <Button
              variant="contained"
              onClick={handleGoToToday}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                },
              }}
            >
              Go to Current Week
            </Button>
          </Box>
        ) : (
          <TableContainer
            sx={{
              borderRadius: 2,
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              maxHeight: '70vh',
              overflow: 'auto',
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                      backgroundColor: '#f8f9ff',
                      fontWeight: 700,
                      color: '#2d3748',
                      minWidth: 250,
                      borderRight: '2px solid rgba(102, 126, 234, 0.2)',
                    }}
                  >
                    Task
                  </TableCell>
                  {checkbookData.days.map((day) => (
                    <TableCell
                      key={day.dateKey}
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: '#2d3748',
                        minWidth: 100,
                        backgroundColor: '#f8f9ff',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: '#667eea' }}>
                          {day.dayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {day.fullDate}
                        </Typography>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {taskTitles.map((taskTitle, index) => {
                  const task = checkbookData.tasks[taskTitle];
                  return (
                    <TableRow
                      key={taskTitle}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.03)',
                        },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 2,
                          backgroundColor: 'white',
                          fontWeight: 600,
                          borderRight: '2px solid rgba(102, 126, 234, 0.2)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                          },
                        }}
                      >
                        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {taskTitle}
                            </Typography>
                            {task.description && (
                              <Typography variant="caption" color="text.secondary">
                                {task.description}
                              </Typography>
                            )}
                          </Box>
                          <Tooltip title="Task Options">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, taskTitle, task)}
                              sx={{
                                color: '#667eea',
                                '&:hover': {
                                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                },
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      {checkbookData.days.map((day) => {
                        const dayData = task.days[day.dateKey];
                        const isToday = format(new Date(day.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                        return (
                          <TableCell
                            key={day.dateKey}
                            align="center"
                            sx={{
                              py: 1.5,
                              backgroundColor: isToday ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                            }}
                          >
                            {dayData ? (
                              <Tooltip title={`${dayData.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}`}>
                                <Checkbox
                                  icon={<RadioButtonUncheckedIcon />}
                                  checkedIcon={<CheckCircleIcon />}
                                  checked={dayData.status === 'completed'}
                                  onChange={() => handleTaskToggle(dayData.id, dayData.status, day.dateKey)}
                                  sx={{
                                    color: dayData.status === 'completed' ? '#4caf50' : '#ff9800',
                                    '&.Mui-checked': {
                                      color: '#4caf50',
                                    },
                                    '&:hover': {
                                      backgroundColor: dayData.status === 'completed' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                      transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s ease',
                                  }}
                                />
                              </Tooltip>
                            ) : (
                              <Tooltip title="No task for this day">
                                <Box 
                                  sx={{ 
                                    width: 40, 
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 1,
                                    border: '1px dashed rgba(0,0,0,0.1)',
                                  }} 
                                />
                              </Tooltip>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Task Options Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              minWidth: 200,
            },
          }}
        >
          <MenuItem onClick={handleEditClick}>
            <ListItemIcon>
              <EditIcon fontSize="small" sx={{ color: '#667eea' }} />
            </ListItemIcon>
            <ListItemText primary="Edit Task" />
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: '#f44336' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: '#f44336' }} />
            </ListItemIcon>
            <ListItemText primary="Delete Task" />
          </MenuItem>
        </Menu>

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
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              Editing will update all instances of this recurring task
            </Alert>
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
              This will delete ALL instances of this recurring task and cannot be undone!
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
              Delete All Instances
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default WeeklyCheckBook;
