import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { createTask, getTemplates, createTemplate, updateTemplate, deleteTemplate, useTemplate } from '../services/api';

/**
 * Templates Component
 * Task templates for quick task creation - Uses Real Data
 */
const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    category: 'General',
    priority: 'medium',
    estimatedTime: ''
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getTemplates();
      // Separate user templates and public/default templates
      const allTemplates = response.data || [];
      setTemplates(allTemplates);
    } catch (err) {
      setError('Failed to fetch templates');
      console.error('Fetch templates error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (template) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await createTask({
        title: template.title,
        description: template.taskDescription || template.description,
        date: today.toISOString(),
        category: template.category,
        priority: template.priority,
        estimatedTime: template.estimatedTime
      });
      
      // Increment usage count
      await useTemplate(template.id);
      await fetchTemplates(); // Refresh to show updated usage count
      
      alert('Task created from template!');
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task');
    }
  };

  const handleSaveTemplate = async () => {
    try {
      if (editingTemplate) {
        // Update existing
        await updateTemplate(editingTemplate.id, {
          name: formData.name,
          title: formData.title,
          taskDescription: formData.description,
          category: formData.category,
          priority: formData.priority,
          estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : null
        });
      } else {
        // Create new
        await createTemplate({
          name: formData.name,
          title: formData.title,
          taskDescription: formData.description,
          category: formData.category,
          priority: formData.priority,
          estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : null
        });
      }
      setDialogOpen(false);
      setEditingTemplate(null);
      setFormData({
        name: '',
        title: '',
        description: '',
        category: 'General',
        priority: 'medium',
        estimatedTime: ''
      });
      await fetchTemplates();
    } catch (err) {
      setError('Failed to save template');
      console.error('Save template error:', err);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      title: template.title,
      description: template.taskDescription || template.description || '',
      category: template.category,
      priority: template.priority,
      estimatedTime: template.estimatedTime || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return;

    try {
      await deleteTemplate(id);
      await fetchTemplates();
    } catch (err) {
      setError('Failed to delete template');
      console.error('Delete template error:', err);
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
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748', mb: 0.5 }}>
              Task Templates
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create tasks quickly from reusable templates
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingTemplate(null);
              setFormData({
                name: '',
                title: '',
                description: '',
                category: 'General',
                priority: 'medium',
                estimatedTime: ''
              });
              setDialogOpen(true);
            }}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            New Template
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
        ) : templates.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary">
              No templates yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              Run the seed script to add popular templates, or create your own
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setEditingTemplate(null);
                setFormData({
                  name: '',
                  title: '',
                  description: '',
                  category: 'General',
                  priority: 'medium',
                  estimatedTime: ''
                });
                setDialogOpen(true);
              }}
            >
              Create Your First Template
            </Button>
          </Box>
        ) : (
          <>
            {/* Public/Default Templates Section */}
            {templates.filter(t => t.isPublic).length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#667eea' }}>
                  📚 Popular Templates
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Pre-made templates for common tasks - click to use
                </Typography>
                <Grid container spacing={3}>
                  {templates.filter(t => t.isPublic).map((template) => (
                    <Grid item xs={12} sm={6} md={4} key={template.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          border: '2px solid #667eea',
                          '&:hover': {
                            boxShadow: 6,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.3s ease',
                          },
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#667eea' }}>
                              {template.name}
                            </Typography>
                            <Chip 
                              label="Popular" 
                              size="small" 
                              sx={{ 
                                backgroundColor: '#667eea', 
                                color: 'white',
                                fontSize: '0.7rem'
                              }} 
                            />
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                            {template.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {template.taskDescription || template.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            <Chip label={template.category} size="small" />
                            <Chip label={template.priority} size="small" color={template.priority === 'urgent' ? 'error' : template.priority === 'high' ? 'warning' : 'default'} />
                            {template.estimatedTime && (
                              <Chip label={`${template.estimatedTime} min`} size="small" variant="outlined" />
                            )}
                            {template.usageCount > 0 && (
                              <Chip label={`${template.usageCount} uses`} size="small" variant="outlined" />
                            )}
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<CopyIcon />}
                            onClick={() => handleCreateFromTemplate(template)}
                            fullWidth
                            sx={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }}
                          >
                            Use Template
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* User Templates Section */}
            {templates.filter(t => !t.isPublic).length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  ✨ Your Templates
                </Typography>
                <Grid container spacing={3}>
                  {templates.filter(t => !t.isPublic).map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {template.name}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    {template.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.taskDescription || template.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={template.category} size="small" />
                    <Chip label={template.priority} size="small" />
                    {template.estimatedTime && (
                      <Chip label={`${template.estimatedTime} min`} size="small" variant="outlined" />
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() => handleCreateFromTemplate(template)}
                  >
                    Use Template
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton size="small" onClick={() => handleEdit(template)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(template.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Template Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Template Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="General">General</MenuItem>
            <MenuItem value="Work">Work</MenuItem>
            <MenuItem value="Personal">Personal</MenuItem>
            <MenuItem value="Health">Health</MenuItem>
            <MenuItem value="Education">Education</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Estimated Time (minutes)"
            type="number"
            value={formData.estimatedTime}
            onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained" disabled={!formData.name || !formData.title}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Templates;

