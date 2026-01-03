import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box,
  Typography,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Fade
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { getAllUsers, createUser, getUserById, updateUser, deleteUser } from '../services/api';
import { format } from 'date-fns';

const UserList = ({ onUserSelect }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      console.log('Fetched users:', response.data); // Debug log
      // Ensure passwordHash is available for each user
      const usersWithHash = response.data.map(user => {
        const userWithHash = {
          ...user,
          passwordHash: user.passwordHash || user.password || '••••••••'
        };
        console.log('User with hash:', userWithHash.id, userWithHash.passwordHash); // Debug log
        return userWithHash;
      });
      setUsers(usersWithHash);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({ name: '', email: '', password: '', role: 'user' });
    setError('');
    setSuccess('');
  };

  const handleEditOpen = async (user) => {
    try {
      setError('');
      const response = await getUserById(user.id || user._id);
      setSelectedUser(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        password: '', // Don't show password, admin can set new one
        role: response.data.role
      });
      setEditOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user data');
    }
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedUser(null);
    setFormData({ name: '', email: '', password: '', role: 'user' });
    setError('');
    setSuccess('');
  };

  const handleDeleteOpen = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setSelectedUser(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      
      // Only include password if it's provided
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      await updateUser(selectedUser.id, updateData);
      setSuccess('User updated successfully!');
      fetchUsers();
      setTimeout(() => {
        handleEditClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setError('');
      await deleteUser(selectedUser.id || selectedUser._id);
      setSuccess('User deleted successfully!');
      fetchUsers();
      handleDeleteClose();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      handleDeleteClose();
    }
  };

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await createUser(formData);
      setSuccess('User created successfully!');
      fetchUsers();
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: '#667eea', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading users...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <Box sx={{ mb: 3, pb: 2, borderBottom: '2px solid rgba(102, 126, 234, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748', mb: 0.5 }}>
              User Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and view all users in the system
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Create New User
          </Button>
        </Box>

        {error && !open && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#2d3748', minWidth: 200 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2d3748', minWidth: 200 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2d3748', minWidth: 180 }}>Password</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2d3748', minWidth: 100 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2d3748', minWidth: 120 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2d3748', minWidth: 150 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 50, color: '#667eea', opacity: 0.5 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 1 }}>
                        No users found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create your first user to get started
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <Fade in={true} timeout={300} key={user.id || user._id} style={{ transitionDelay: `${index * 50}ms` }}>
                    <TableRow
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.05)',
                        },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              width: 40,
                              height: 40,
                              fontWeight: 600,
                            }}
                          >
                            {user.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 18, color: '#64748b' }} />
                          <Typography variant="body2">{user.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap' }}>
                          <LockIcon sx={{ fontSize: 16, color: '#667eea', flexShrink: 0 }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace',
                              color: '#64748b',
                              fontSize: '0.75rem',
                              minWidth: 100,
                              wordBreak: 'break-all',
                              flexShrink: 1
                            }}
                            title={showPasswords[user.id || user._id] ? 'Password hash' : 'Click eye icon to reveal'}
                          >
                            {showPasswords[user.id || user._id] 
                              ? (user.passwordHash || user.password || 'No password set') 
                              : '••••••••'}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => togglePasswordVisibility(user.id || user._id)}
                            sx={{ 
                              p: 0.5,
                              flexShrink: 0,
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.1)'
                              }
                            }}
                            title={showPasswords[user.id || user._id] ? 'Hide password' : 'Show password'}
                          >
                            {showPasswords[user.id || user._id] ? (
                              <VisibilityOffIcon sx={{ fontSize: 16, color: '#667eea' }} />
                            ) : (
                              <VisibilityIcon sx={{ fontSize: 16, color: '#64748b' }} />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={user.role === 'admin' ? 'primary' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Tooltip title="View Analytics">
                            <IconButton
                              size="small"
                              onClick={() => onUserSelect(user.id || user._id)}
                              sx={{
                                color: '#667eea',
                                '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' }
                              }}
                            >
                              <AssessmentIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              onClick={() => handleEditOpen(user)}
                              sx={{
                                color: '#10b981',
                                '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteOpen(user)}
                              sx={{
                                color: '#ef4444',
                                '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            },
          }}
        >
          <form onSubmit={handleSubmit}>
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PersonIcon sx={{ color: 'white' }} />
                </Box>
                Create New User
              </Box>
            </DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                  {success}
                </Alert>
              )}
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Full Name"
                type="text"
                fullWidth
                variant="outlined"
                required
                value={formData.name}
                onChange={handleChange}
                sx={{ mb: 2.5, mt: 2, borderRadius: 2 }}
              />
              <TextField
                margin="dense"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                required
                value={formData.email}
                onChange={handleChange}
                sx={{ mb: 2.5, borderRadius: 2 }}
              />
              <TextField
                margin="dense"
                name="password"
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                required
                value={formData.password}
                onChange={handleChange}
                sx={{ mb: 2.5, borderRadius: 2 }}
                helperText="Minimum 6 characters"
              />
              <TextField
                margin="dense"
                name="role"
                label="Role"
                select
                fullWidth
                variant="outlined"
                value={formData.role}
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                sx={{ borderRadius: 2 }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </TextField>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button
                onClick={handleClose}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  },
                }}
              >
                Create User
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog
          open={editOpen}
          onClose={handleEditClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            },
          }}
        >
          <form onSubmit={handleEditSubmit}>
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EditIcon sx={{ color: 'white' }} />
                </Box>
                Edit User
              </Box>
            </DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                  {success}
                </Alert>
              )}
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Full Name"
                type="text"
                fullWidth
                variant="outlined"
                required
                value={formData.name}
                onChange={handleChange}
                sx={{ mb: 2.5, mt: 2, borderRadius: 2 }}
              />
              <TextField
                margin="dense"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                required
                value={formData.email}
                onChange={handleChange}
                sx={{ mb: 2.5, borderRadius: 2 }}
              />
              <TextField
                margin="dense"
                name="password"
                label="New Password (leave blank to keep current)"
                type="password"
                fullWidth
                variant="outlined"
                value={formData.password}
                onChange={handleChange}
                sx={{ mb: 2.5, borderRadius: 2 }}
                helperText="Leave blank to keep current password. Minimum 6 characters if changing."
              />
              <TextField
                margin="dense"
                name="role"
                label="Role"
                select
                fullWidth
                variant="outlined"
                value={formData.role}
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                sx={{ borderRadius: 2 }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </TextField>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button
                onClick={handleEditClose}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  },
                }}
              >
                Update User
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteOpen}
          onClose={handleDeleteClose}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DeleteIcon sx={{ color: 'white' }} />
              </Box>
              Delete User
            </Box>
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this user?
            </Typography>
            {selectedUser && (
              <Box sx={{ 
                p: 2, 
                bgcolor: 'rgba(239, 68, 68, 0.1)', 
                borderRadius: 2,
                mb: 2 
              }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  User Details:
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedUser.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {selectedUser.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Role:</strong> {selectedUser.role}
                </Typography>
              </Box>
            )}
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              This action cannot be undone. All user data, tasks, and related information will be permanently deleted.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={handleDeleteClose}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                },
              }}
            >
              Delete User
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default UserList;
