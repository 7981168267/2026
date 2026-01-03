import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  MenuItem,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  FitnessCenter as FitnessIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * Body Condition Calculator
 * Calculates BMI, healthy weight range, BMR, and suggests exercises
 */
const BodyConditionCalculator = () => {
  const [formData, setFormData] = useState({
    gender: 'male',
    age: '',
    height: '', // in cm
    weight: '', // in kg
    activityLevel: 'moderate' // sedentary, light, moderate, active, very_active
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const activityLevels = {
    sedentary: { label: 'Sedentary (little/no exercise)', multiplier: 1.2 },
    light: { label: 'Light (exercise 1-3 days/week)', multiplier: 1.375 },
    moderate: { label: 'Moderate (exercise 3-5 days/week)', multiplier: 1.55 },
    active: { label: 'Active (exercise 6-7 days/week)', multiplier: 1.725 },
    very_active: { label: 'Very Active (hard exercise daily)', multiplier: 1.9 }
  };

  const calculateBMI = (weight, height) => {
    // BMI = weight (kg) / (height (m))^2
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#2196f3', severity: 'info' };
    if (bmi < 25) return { label: 'Normal Weight', color: '#4caf50', severity: 'success' };
    if (bmi < 30) return { label: 'Overweight', color: '#ff9800', severity: 'warning' };
    return { label: 'Obese', color: '#f44336', severity: 'error' };
  };

  const calculateHealthyWeightRange = (height) => {
    // Healthy BMI range: 18.5 - 24.9
    const heightInMeters = height / 100;
    const minWeight = (18.5 * heightInMeters * heightInMeters).toFixed(1);
    const maxWeight = (24.9 * heightInMeters * heightInMeters).toFixed(1);
    return { min: minWeight, max: maxWeight };
  };

  const calculateBMR = (gender, weight, height, age) => {
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
      return (10 * weight + 6.25 * height - 5 * age + 5).toFixed(0);
    } else {
      return (10 * weight + 6.25 * height - 5 * age - 161).toFixed(0);
    }
  };

  const calculateTDEE = (bmr, activityMultiplier) => {
    return (bmr * activityMultiplier).toFixed(0);
  };

  const getExerciseSuggestions = (bmi, category) => {
    const suggestions = {
      underweight: {
        focus: 'Build muscle and strength',
        exercises: [
          { name: 'Squats', difficulty: 'Medium', sets: '4 sets', reps: '8-10 reps', weight: 'Bodyweight + 5-10kg' },
          { name: 'Push-ups', difficulty: 'Medium', sets: '4 sets', reps: '10-12 reps', weight: 'Bodyweight' },
          { name: 'Pull-ups', difficulty: 'Hard', sets: '3 sets', reps: '6-8 reps', weight: 'Bodyweight or assisted' },
          { name: 'Shoulder Press', difficulty: 'Medium', sets: '4 sets', reps: '8-10 reps', weight: '5-10kg dumbbells' },
          { name: 'Deadlifts', difficulty: 'Hard', sets: '3 sets', reps: '5-6 reps', weight: '10-20kg' }
        ],
        tips: 'Focus on progressive overload. Eat in calorie surplus with protein-rich foods.'
      },
      normal: {
        focus: 'Maintain fitness and build strength',
        exercises: [
          { name: 'Squats', difficulty: 'Medium', sets: '3 sets', reps: '12-15 reps', weight: 'Bodyweight or 5kg' },
          { name: 'Push-ups', difficulty: 'Easy', sets: '3 sets', reps: '12-15 reps', weight: 'Bodyweight' },
          { name: 'Lunges', difficulty: 'Medium', sets: '3 sets', reps: '12 reps each', weight: 'Bodyweight' },
          { name: 'Plank', difficulty: 'Easy', sets: '3 sets', reps: '30-60 sec', weight: 'Bodyweight' },
          { name: 'Bicep Curls', difficulty: 'Easy', sets: '3 sets', reps: '12-15 reps', weight: '3-5kg dumbbells' }
        ],
        tips: 'Maintain balanced diet and regular exercise. Mix cardio and strength training.'
      },
      overweight: {
        focus: 'Weight loss and cardiovascular health',
        exercises: [
          { name: 'Walking/Jogging', difficulty: 'Easy', sets: '1 set', reps: '20-30 min', weight: 'Bodyweight' },
          { name: 'Burpees', difficulty: 'Hard', sets: '3 sets', reps: '8-10 reps', weight: 'Bodyweight' },
          { name: 'Mountain Climbers', difficulty: 'Medium', sets: '3 sets', reps: '20-30 reps', weight: 'Bodyweight' },
          { name: 'Jumping Jacks', difficulty: 'Easy', sets: '3 sets', reps: '30-40 reps', weight: 'Bodyweight' },
          { name: 'Squats', difficulty: 'Easy', sets: '3 sets', reps: '15-20 reps', weight: 'Bodyweight' }
        ],
        tips: 'Focus on cardio exercises. Create calorie deficit through diet and exercise. Start with low-impact exercises.'
      },
      obese: {
        focus: 'Safe weight loss and mobility',
        exercises: [
          { name: 'Walking', difficulty: 'Easy', sets: '1 set', reps: '20-30 min', weight: 'Bodyweight' },
          { name: 'Chair Squats', difficulty: 'Easy', sets: '3 sets', reps: '10-12 reps', weight: 'Bodyweight' },
          { name: 'Wall Push-ups', difficulty: 'Easy', sets: '3 sets', reps: '10-12 reps', weight: 'Bodyweight' },
          { name: 'Seated Leg Lifts', difficulty: 'Easy', sets: '3 sets', reps: '12-15 reps', weight: 'Bodyweight' },
          { name: 'Arm Circles', difficulty: 'Easy', sets: '3 sets', reps: '15-20 reps', weight: 'Bodyweight' }
        ],
        tips: 'Start with low-impact exercises. Consult doctor before starting. Focus on gradual progress and consistency.'
      }
    };

    return suggestions[category] || suggestions.normal;
  };

  const handleCalculate = () => {
    if (!formData.age || !formData.height || !formData.weight) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const age = parseInt(formData.age);

      const bmi = parseFloat(calculateBMI(weight, height));
      const bmiCategory = getBMICategory(bmi);
      const healthyWeight = calculateHealthyWeightRange(height);
      const bmr = parseFloat(calculateBMR(formData.gender, weight, height, age));
      const activityMultiplier = activityLevels[formData.activityLevel].multiplier;
      const tdee = parseFloat(calculateTDEE(bmr, activityMultiplier));
      const suggestions = getExerciseSuggestions(bmi, bmiCategory.label.toLowerCase().replace(' ', ''));

      setResults({
        bmi,
        bmiCategory,
        healthyWeight,
        bmr,
        tdee,
        currentWeight: weight,
        suggestions,
        weightToLose: weight > parseFloat(healthyWeight.max) ? (weight - parseFloat(healthyWeight.max)).toFixed(1) : 0,
        weightToGain: weight < parseFloat(healthyWeight.min) ? (parseFloat(healthyWeight.min) - weight).toFixed(1) : 0
      });

      setLoading(false);
    }, 500);
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          mb: 3
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2d3748', mb: 1 }}>
            Body Condition Calculator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Calculate your BMI, healthy weight range, and get personalized exercise recommendations
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Enter Your Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Age (years)"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      inputProps={{ min: 1, max: 120 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Height (cm)"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      inputProps={{ min: 50, max: 250 }}
                      helperText="Example: 175 cm (5 feet 9 inches)"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Weight (kg)"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      inputProps={{ min: 20, max: 300 }}
                      helperText="Example: 70 kg (154 lbs)"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Activity Level"
                      value={formData.activityLevel}
                      onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                    >
                      {Object.entries(activityLevels).map(([key, value]) => (
                        <MenuItem key={key} value={key}>
                          {value.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<CalculateIcon />}
                      onClick={handleCalculate}
                      disabled={loading}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                        },
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Calculate'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            {results ? (
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Your Results
                  </Typography>

                  {/* BMI */}
                  <Box sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: `${results.bmiCategory.color}15` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        BMI (Body Mass Index)
                      </Typography>
                      <Chip
                        label={results.bmiCategory.label}
                        sx={{
                          backgroundColor: results.bmiCategory.color,
                          color: 'white',
                          fontWeight: 700
                        }}
                      />
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: results.bmiCategory.color }}>
                      {results.bmi}
                    </Typography>
                  </Box>

                  {/* Healthy Weight Range */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Healthy Weight Range for your height:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {results.healthyWeight.min} - {results.healthyWeight.max} kg
                    </Typography>
                    {results.weightToLose > 0 && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        Aim to lose <strong>{results.weightToLose} kg</strong> to reach healthy range
                      </Alert>
                    )}
                    {results.weightToGain > 0 && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        Aim to gain <strong>{results.weightToGain} kg</strong> to reach healthy range
                      </Alert>
                    )}
                  </Box>

                  {/* BMR & TDEE */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="body2" color="text.secondary">
                          BMR (Basal Metabolic Rate)
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                          {results.bmr} kcal/day
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Calories burned at rest
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="body2" color="text.secondary">
                          TDEE (Total Daily Energy Expenditure)
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                          {results.tdee} kcal/day
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Calories burned with activity
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Exercise Suggestions */}
                  <Divider sx={{ my: 3 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FitnessIcon sx={{ color: '#667eea' }} />
                      Recommended Exercises
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Focus:</strong> {results.suggestions.focus}
                      </Typography>
                    </Alert>
                    <List>
                      {results.suggestions.exercises.map((exercise, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {exercise.name}
                                </Typography>
                                <Chip
                                  label={exercise.difficulty}
                                  size="small"
                                  color={
                                    exercise.difficulty === 'Easy' ? 'success' :
                                    exercise.difficulty === 'Medium' ? 'warning' : 'error'
                                  }
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {exercise.sets} • {exercise.reps} • {exercise.weight}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>💡 Tip:</strong> {results.suggestions.tips}
                      </Typography>
                    </Alert>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <InfoIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Enter your details and click Calculate
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Get personalized health metrics and exercise recommendations
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default BodyConditionCalculator;

