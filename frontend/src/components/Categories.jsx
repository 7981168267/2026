import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Label as LabelIcon
} from '@mui/icons-material';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';

/**
 * Categories Component
 * Manage task categories with color coding - Uses Real Data
 */
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '#667eea' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setCategories(response.data);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formData.name,
          color: formData.color
        });
      } else {
        await createCategory({
          name: formData.name,
          color: formData.color
        });
      }
      setDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', color: '#667eea' });
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
      console.error('Save category error:', err);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Tasks will be moved to "General".')) return;

    try {
      await deleteCategory(id);
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
      console.error('Delete category error:', err);
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
              Categories
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Organize tasks with color-coded categories
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', color: '#667eea' });
              setDialogOpen(true);
            }}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            New Category
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
        ) : categories.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary">
              No categories yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Create categories to organize your tasks
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card
                sx={{
                  height: '100%',
                  borderLeft: `4px solid ${category.color}`,
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LabelIcon sx={{ color: category.color }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleEdit(category)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(category.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Chip
                    label={`${category.taskCount} tasks`}
                    size="small"
                    sx={{
                      backgroundColor: category.color,
                      color: 'white',
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
          </Grid>
        )}
      </Paper>

      {/* Category Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.name.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;

