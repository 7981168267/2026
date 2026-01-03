import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Email as EmailIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const Help = () => {
  const faqs = [
    {
      question: 'How do I create a new task?',
      answer: 'Click on "Create Task" in the sidebar, fill in the task title, description, and select a date. Click "Create Task" to save it.',
    },
    {
      question: 'How do I mark a task as completed?',
      answer: 'Simply click the checkbox next to any task in your "Today\'s Tasks" list. You can also click it again to mark it as pending.',
    },
    {
      question: 'What are the daily reminders?',
      answer: 'Daily reminders are sent at 11:30 PM for any pending tasks from that day. You\'ll receive both email and in-app notifications.',
    },
    {
      question: 'How do I export my tasks to Excel?',
      answer: 'Navigate to the "Weekly Checkbook" page and click the "Export to Excel" button. This will download your weekly tasks in Excel format.',
    },
    {
      question: 'How do I view my task analytics?',
      answer: 'Click on "Analytics" in the sidebar. You can view daily, weekly, monthly, or overall statistics with interactive charts.',
    },
  ];

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
            Help & Support
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find answers to common questions and get help
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
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
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <QuestionAnswerIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  FAQs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse frequently asked questions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
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
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <EmailIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Contact Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get in touch with our support team
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
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
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <InfoIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Documentation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Read detailed guides and tutorials
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                mb: 1,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                '&:before': {
                  display: 'none',
                },
                '&.Mui-expanded': {
                  margin: '0 0 8px 0',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#667eea' }} />}
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  },
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Help;

