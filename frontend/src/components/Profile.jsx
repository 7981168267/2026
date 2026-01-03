import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 2,
              fontSize: '3rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2d3748', mb: 1 }}>
            {user?.name}
          </Typography>
          <Chip
            label={user?.role === 'admin' ? 'Administrator' : 'User'}
            color={user?.role === 'admin' ? 'primary' : 'default'}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <EmailIcon sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <BadgeIcon sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <CalendarIcon sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Account Information
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                      Member since {format(new Date(), 'MMMM yyyy')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;

