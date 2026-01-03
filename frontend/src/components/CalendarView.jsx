import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { getTasks } from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, startOfWeek, endOfWeek } from 'date-fns';

/**
 * Calendar View Component
 * Shows tasks by date with day/week/month views
 */
const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // day, week, month
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchTasks();
  }, [currentDate]);

  const fetchTasks = async () => {
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const response = await getTasks({
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
      setTasks(response.data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return isSameDay(taskDate, date);
    });
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

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
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => setCurrentDate(addMonths(currentDate, -1))}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700, minWidth: 200, textAlign: 'center' }}>
              {format(currentDate, 'MMMM yyyy')}
            </Typography>
            <IconButton onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRightIcon />
            </IconButton>
            <Button
              startIcon={<TodayIcon />}
              onClick={() => setCurrentDate(new Date())}
              variant="outlined"
            >
              Today
            </Button>
          </Box>
          <Box>
            <Button
              variant={view === 'month' ? 'contained' : 'outlined'}
              onClick={() => setView('month')}
              sx={{ mr: 1 }}
            >
              Month
            </Button>
            <Button
              variant={view === 'week' ? 'contained' : 'outlined'}
              onClick={() => setView('week')}
              sx={{ mr: 1 }}
            >
              Week
            </Button>
            <Button
              variant={view === 'day' ? 'contained' : 'outlined'}
              onClick={() => setView('day')}
            >
              Day
            </Button>
          </Box>
        </Box>

        {/* Calendar Grid */}
        {view === 'month' && (
          <Grid container spacing={1}>
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Grid item xs={12/7} key={day}>
                <Box sx={{ textAlign: 'center', py: 1, fontWeight: 600, color: '#64748b' }}>
                  {day}
                </Box>
              </Grid>
            ))}
            {/* Calendar days */}
            {days.map((day) => {
              const dayTasks = getTasksForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);

              return (
                <Grid item xs={12/7} key={day.toString()}>
                  <Card
                    sx={{
                      minHeight: 100,
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #667eea' : '1px solid #e2e8f0',
                      backgroundColor: isToday ? 'rgba(102, 126, 234, 0.1)' : 'white',
                      opacity: isCurrentMonth ? 1 : 0.4,
                      '&:hover': {
                        boxShadow: 2,
                      },
                    }}
                    onClick={() => setSelectedDate(day)}
                  >
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isToday ? 700 : 500,
                          color: isToday ? '#667eea' : '#2d3748',
                          mb: 0.5
                        }}
                      >
                        {format(day, 'd')}
                      </Typography>
                      {dayTasks.slice(0, 3).map((task) => (
                        <Chip
                          key={task.id}
                          label={task.title.substring(0, 15)}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            mb: 0.5,
                            backgroundColor: task.priority === 'urgent' ? '#f44336' :
                                           task.priority === 'high' ? '#ff9800' :
                                           task.priority === 'medium' ? '#2196f3' : '#4caf50',
                            color: 'white',
                            display: 'block',
                            width: '100%',
                          }}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{dayTasks.length - 3} more
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Selected Date Tasks */}
        {selectedDate && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Tasks for {format(selectedDate, 'MMMM d, yyyy')}
            </Typography>
            {getTasksForDate(selectedDate).length === 0 ? (
              <Typography color="text.secondary">No tasks for this date</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {getTasksForDate(selectedDate).map((task) => (
                  <Card key={task.id}>
                    <CardContent>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {task.title}
                      </Typography>
                      {task.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {task.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {task.priority && (
                          <Chip label={task.priority} size="small" />
                        )}
                        {task.category && (
                          <Chip label={task.category} size="small" variant="outlined" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CalendarView;

