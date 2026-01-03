import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Divider
} from '@mui/material';
import {
  Download as DownloadIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { getTaskAnalytics } from '../services/api';

/**
 * Reports Component
 * Weekly & monthly productivity reports with export
 */
const Reports = () => {
  const [period, setPeriod] = useState('weekly');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    try {
      setLoading(true);
      const response = await getTaskAnalytics(period);
      setReportData(response.data);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    alert('PDF export functionality - to be implemented');
    // In a real app, use a library like jsPDF or react-pdf
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    
    // Create CSV content
    const csvRows = [
      ['Report Period', period],
      ['Total Tasks', reportData.totalTasks],
      ['Completed Tasks', reportData.completedTasks],
      ['Completion Rate', `${reportData.completionRate}%`],
      ['Current Streak', reportData.currentStreak],
      ['Best Streak', reportData.bestStreak],
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
              Productivity Reports
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate and export detailed productivity reports
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="overall">Overall</MenuItem>
            </TextField>
            <Button
              variant="contained"
              onClick={generateReport}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Generate Report
            </Button>
          </Box>
        </Box>

        {reportData && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Tasks
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
                      {reportData.totalTasks}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Completed
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {reportData.completedTasks}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Completion Rate
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                      {reportData.completionRate.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Current Streak
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                      {reportData.currentStreak} days
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportPDF}
              >
                Export PDF
              </Button>
            </Box>
          </>
        )}

        {!reportData && (
          <Box textAlign="center" py={6}>
            <AssessmentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No report generated yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Select a period and click "Generate Report" to view your productivity data
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Reports;

