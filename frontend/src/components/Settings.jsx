import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon
} from '@mui/icons-material';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save settings logic here
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748', mb: 1 }}>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your application preferences
          </Typography>
        </Box>

        {saved && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Settings saved successfully!
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Notifications */}
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
                    <NotificationsIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Notifications
                  </Typography>
                </Box>

                <Box sx={{ pl: 10 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Enable browser notifications"
                    sx={{ mb: 2, display: 'block' }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Email notifications for task reminders"
                    sx={{ display: 'block' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Appearance */}
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
                    <PaletteIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Appearance
                  </Typography>
                </Box>

                <Box sx={{ pl: 10 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Dark mode (Coming soon)"
                    sx={{ display: 'block' }}
                    disabled
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Language */}
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
                    <LanguageIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Language
                  </Typography>
                </Box>

                <Box sx={{ pl: 10 }}>
                  <Typography variant="body2" color="text.secondary">
                    English (US) - Default
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" sx={{ borderRadius: 2, px: 4 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  },
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Settings;

