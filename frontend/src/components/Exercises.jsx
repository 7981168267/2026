import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tabs,
  Tab,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  FitnessCenter as FitnessIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarIcon,
  PlayArrow as PlayIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

/**
 * Exercises Component
 * Day-wise exercise recommendations with body part focus
 * Uses external image sources (Unsplash) for professional exercise images
 */

const EXERCISES_BY_DAY = {
  0: { // Sunday
    day: 'Sunday',
    bodyPart: 'Rest Day',
    color: '#9e9e9e',
    exercises: [
      { 
        name: 'Light Stretching', 
        duration: '10 min', 
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80', 
        videoId: 'g13nVd7f85w', // YouTube video ID for stretching
        description: 'Gentle stretching and yoga poses to relax',
        sets: '1 set',
        reps: '10-15 min',
        instructions: [
          'Start with gentle neck rolls and shoulder circles',
          'Perform seated forward fold for 30 seconds',
          'Do gentle spinal twists on both sides',
          'Finish with deep breathing exercises'
        ],
        tips: 'Focus on breathing deeply and holding each stretch for 20-30 seconds. Never force a stretch.'
      },
      { 
        name: 'Yoga Flow', 
        duration: '15 min', 
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80', 
        videoId: 'v7AYKMP6rOE', // Sun Salutation
        description: 'Sun salutation and gentle yoga flow',
        sets: '1 set',
        reps: '15 min',
        instructions: [
          'Begin with Mountain Pose (Tadasana)',
          'Flow through Sun Salutation A (3-5 rounds)',
          'Include gentle twists and forward folds',
          'End with Savasana (corpse pose) for 2-3 minutes'
        ],
        tips: 'Move slowly and focus on your breath. Modify poses as needed for your flexibility level.'
      },
      { 
        name: 'Meditation', 
        duration: '10 min', 
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80', 
        videoId: 'O-6f5wQXSu8', // Meditation guide
        description: 'Mindfulness and breathing exercises',
        sets: '1 set',
        reps: '10 min',
        instructions: [
          'Find a quiet, comfortable place to sit',
          'Close your eyes and focus on your breath',
          'Count breaths: inhale (1), exhale (2), up to 10, then repeat',
          'If your mind wanders, gently return to counting'
        ],
        tips: 'Start with 5 minutes if 10 feels too long. Consistency is more important than duration.'
      }
    ]
  },
  1: { // Monday
    day: 'Monday',
    bodyPart: 'Chest & Triceps',
    color: '#f44336',
    exercises: [
      { 
        name: 'Push-ups', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80', 
        videoId: 'IODxDxX7oi4', // Push-up tutorial
        difficulty: 'Medium',
        description: 'Standard push-ups targeting chest, shoulders, and triceps',
        sets: '3 sets',
        reps: '12-15 reps',
        weight: 'Bodyweight',
        easy: { sets: '2 sets', reps: '8-10 reps', weight: 'Knee push-ups' },
        medium: { sets: '3 sets', reps: '12-15 reps', weight: 'Bodyweight' },
        hard: { sets: '4 sets', reps: '15-20 reps', weight: 'Bodyweight or weighted vest' },
        instructions: [
          'Start in plank position: hands shoulder-width apart, body straight',
          'Lower your body until chest nearly touches the floor',
          'Push back up to starting position',
          'Keep core tight and back straight throughout'
        ],
        tips: 'If too difficult, do knee push-ups. If too easy, elevate feet or add a pause at bottom.'
      },
      { 
        name: 'Incline Push-ups', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=80', 
        videoId: 'IODxDxX7oi4', // Similar to push-ups
        description: 'Feet elevated push-ups for upper chest',
        sets: '3 sets',
        reps: '10-12 reps',
        instructions: [
          'Place feet on elevated surface (bench, step, or chair)',
          'Hands on floor, wider than shoulder-width',
          'Lower body with control, feeling stretch in upper chest',
          'Push up explosively to starting position'
        ],
        tips: 'Higher elevation = more difficulty. Start with low elevation and progress gradually.'
      },
      { 
        name: 'Tricep Dips', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80', 
        videoId: '6g4k7X3VX4E', // Tricep dips
        difficulty: 'Medium',
        description: 'Chair or floor tricep dips',
        sets: '3 sets',
        reps: '10-12 reps',
        weight: 'Bodyweight',
        easy: { sets: '2 sets', reps: '6-8 reps', weight: 'Bent knees' },
        medium: { sets: '3 sets', reps: '10-12 reps', weight: 'Straight legs' },
        hard: { sets: '4 sets', reps: '12-15 reps', weight: 'Weighted or elevated feet' },
        instructions: [
          'Sit on edge of chair/bench, hands gripping edge',
          'Slide forward so body is off the edge',
          'Lower body by bending elbows to 90 degrees',
          'Push back up using triceps, keep shoulders down'
        ],
        tips: 'Keep elbows close to body. For easier version, bend knees. For harder, extend legs straight.'
      },
      { 
        name: 'Diamond Push-ups', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80', 
        videoId: 'IODxDxX7oi4', // Diamond push-ups
        difficulty: 'Hard',
        description: 'Close-grip push-ups for triceps',
        sets: '3 sets',
        reps: '8-10 reps',
        weight: 'Bodyweight',
        easy: { sets: '2 sets', reps: '5-6 reps', weight: 'Knee diamond push-ups' },
        medium: { sets: '3 sets', reps: '8-10 reps', weight: 'Bodyweight' },
        hard: { sets: '4 sets', reps: '12-15 reps', weight: 'Weighted or elevated feet' },
        instructions: [
          'Start in push-up position',
          'Place hands together forming a diamond shape',
          'Lower body keeping elbows close to sides',
          'Push up focusing on tricep contraction'
        ],
        tips: 'This is advanced. Master regular push-ups first. Can do on knees for easier version.'
      },
      { 
        name: 'Chest Fly (Floor)', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=80', 
        videoId: 'eozdVDA78K0', // Chest fly
        description: 'Dumbbell or bodyweight chest fly',
        sets: '3 sets',
        reps: '12-15 reps',
        instructions: [
          'Lie on back, arms extended to sides (like airplane wings)',
          'Slowly bring arms together above chest',
          'Squeeze chest muscles at top',
          'Lower with control back to starting position'
        ],
        tips: 'Use light weights or no weights. Focus on chest squeeze, not arm strength.'
      },
      { 
        name: 'Chest Stretch', 
        duration: '30 sec', 
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80', 
        videoId: 'g13nVd7f85w', // Stretching
        description: 'Doorway chest stretch to prevent tightness',
        sets: '2 sets',
        reps: '30 sec hold',
        instructions: [
          'Stand in doorway, place forearm on doorframe',
          'Step forward with opposite leg',
          'Feel stretch in chest and front shoulder',
          'Hold 30 seconds, switch sides'
        ],
        tips: 'Don\'t overstretch. Should feel gentle pull, not pain. Breathe deeply during stretch.'
      }
    ]
  },
  2: { // Tuesday
    day: 'Tuesday',
    bodyPart: 'Back & Biceps',
    color: '#2196f3',
    exercises: [
      { 
        name: 'Pull-ups / Chin-ups', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=80', 
        videoId: 'eGo4IYlbE5g', // Pull-ups tutorial
        description: 'Pull-ups or assisted pull-ups for back',
        sets: '3 sets',
        reps: '8-10 reps',
        instructions: [
          'Hang from bar with palms facing away (pull-up) or toward you (chin-up)',
          'Pull body up until chin clears bar',
          'Lower with control to full arm extension',
          'Keep core engaged, avoid swinging'
        ],
        tips: 'Use resistance bands for assistance if needed. Focus on back muscles, not just arms.'
      },
      { 
        name: 'Bent-over Rows', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80', 
        videoId: 'kE0XjZ-KXr8', // Bent-over rows
        description: 'Dumbbell or resistance band rows',
        sets: '3 sets',
        reps: '12-15 reps',
        instructions: [
          'Bend forward at hips, slight knee bend, back straight',
          'Hold weights/bands, pull elbows back',
          'Squeeze shoulder blades together at top',
          'Lower with control, feel stretch in back'
        ],
        tips: 'Keep back straight, don\'t round. Pull to lower chest/upper abs, not stomach.'
      },
      { 
        name: 'Bicep Curls', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80', 
        videoId: 'ykJmrZ5v0Oo', // Bicep curls
        description: 'Dumbbell or resistance band bicep curls',
        sets: '3 sets',
        reps: '12-15 reps',
        instructions: [
          'Stand with weights at sides, palms facing forward',
          'Curl weights up, keeping elbows at sides',
          'Squeeze biceps at top of movement',
          'Lower slowly, don\'t let gravity do the work'
        ],
        tips: 'Don\'t swing body. Keep elbows stationary. Full range of motion: full extension to full contraction.'
      },
      { 
        name: 'Hammer Curls', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=80', 
        videoId: 'ykJmrZ5v0Oo', // Hammer curls
        description: 'Hammer grip curls for brachialis',
        sets: '3 sets',
        reps: '12-15 reps',
        instructions: [
          'Hold weights with neutral grip (palms facing each other)',
          'Curl up keeping palms in same position',
          'Focus on outer bicep/brachialis muscle',
          'Lower with control'
        ],
        tips: 'This targets different part of bicep. Alternate with regular curls for complete bicep development.'
      },
      { 
        name: 'Reverse Fly', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80', 
        videoId: 'ttvf3g9Ylco', // Reverse fly
        description: 'Rear deltoid and upper back exercise',
        sets: '3 sets',
        reps: '12-15 reps',
        instructions: [
          'Bend forward slightly, arms hanging down',
          'Raise arms out to sides in arc motion',
          'Squeeze shoulder blades together',
          'Lower with control'
        ],
        tips: 'Great for posture! Focus on rear delts and rhomboids. Light weight, perfect form.'
      },
      { 
        name: 'Back Stretch', 
        duration: '30 sec', 
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80', 
        videoId: 'g13nVd7f85w', // Back stretching
        description: 'Cat-cow stretch for back flexibility',
        sets: '2 sets',
        reps: '30 sec hold',
        instructions: [
          'Start on hands and knees',
          'Arch back (cow): look up, belly down',
          'Round back (cat): tuck chin, pull belly in',
          'Flow between positions 10-15 times'
        ],
        tips: 'Move slowly and breathe. This is great for spinal mobility and relieving back tension.'
      }
    ]
  },
  3: { // Wednesday
    day: 'Wednesday',
    bodyPart: 'Legs & Glutes',
    color: '#4caf50',
    exercises: [
      { 
        name: 'Squats', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80', 
        videoId: 'YaXPRqUwItQ', // Squat tutorial
        difficulty: 'Medium',
        description: 'Bodyweight squats for quads and glutes',
        sets: '3 sets',
        reps: '15-20 reps',
        weight: 'Bodyweight',
        easy: { sets: '2 sets', reps: '10-12 reps', weight: 'Bodyweight or chair-assisted' },
        medium: { sets: '3 sets', reps: '15-20 reps', weight: 'Bodyweight' },
        hard: { sets: '4 sets', reps: '20-25 reps', weight: '10-20kg dumbbells or barbell' },
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower as if sitting in chair, knees track over toes',
          'Go down until thighs parallel to floor (or as low as comfortable)',
          'Push through heels to stand back up'
        ],
        tips: 'Keep chest up, core tight. Don\'t let knees cave inward. Full depth = better results.'
      },
      { 
        name: 'Lunges', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=80', 
        videoId: 'QOVaHwm-Q6U', // Lunge tutorial
        difficulty: 'Medium',
        description: 'Forward or reverse lunges',
        sets: '3 sets',
        reps: '12 reps each leg',
        weight: 'Bodyweight',
        easy: { sets: '2 sets', reps: '8 reps each leg', weight: 'Bodyweight' },
        medium: { sets: '3 sets', reps: '12 reps each leg', weight: 'Bodyweight' },
        hard: { sets: '4 sets', reps: '15 reps each leg', weight: '5-10kg dumbbells' },
        instructions: [
          'Step forward (or backward) into lunge position',
          'Lower back knee toward ground, front knee at 90 degrees',
          'Push through front heel to return to start',
          'Alternate legs or complete all on one side first'
        ],
        tips: 'Keep torso upright. Front knee shouldn\'t go past toes. Equal weight on both legs.'
      },
      { 
        name: 'Glute Bridges', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80', 
        videoId: 'wPM8icPu6H8', // Glute bridge
        description: 'Hip bridges for glutes and hamstrings',
        sets: '3 sets',
        reps: '15-20 reps',
        instructions: [
          'Lie on back, knees bent, feet flat',
          'Lift hips up, squeezing glutes',
          'Form straight line from knees to shoulders',
          'Lower with control, don\'t drop'
        ],
        tips: 'Squeeze glutes hard at top! Can add single-leg variation for more challenge.'
      },
      { 
        name: 'Calf Raises', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80', 
        videoId: '3VcKaXpzqRo', // Calf raises
        description: 'Standing calf raises',
        sets: '3 sets',
        reps: '20-25 reps',
        instructions: [
          'Stand on edge of step or flat ground',
          'Rise up onto toes, squeezing calves',
          'Hold for 1-2 seconds at top',
          'Lower slowly, feel stretch in calves'
        ],
        tips: 'Full range of motion: all the way up, all the way down. Can do single-leg for more intensity.'
      },
      { 
        name: 'Wall Sit', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=80', 
        videoId: 'y-wV4Venusw', // Wall sit
        description: 'Isometric quad and glute exercise',
        sets: '3 sets',
        reps: '30-60 sec hold',
        instructions: [
          'Back against wall, slide down until knees at 90 degrees',
          'Hold position, thighs parallel to floor',
          'Keep core engaged, breathe normally',
          'Push through when time is up'
        ],
        tips: 'Start with 30 seconds, build up to 60+. This burns! Great for leg endurance.'
      },
      { 
        name: 'Leg Stretch', 
        duration: '30 sec', 
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80', 
        videoId: 'g13nVd7f85w', // Leg stretching
        description: 'Quad and hamstring stretches',
        sets: '2 sets',
        reps: '30 sec hold each',
        instructions: [
          'Quad stretch: Stand, pull heel to glute, hold',
          'Hamstring stretch: Sit, reach for toes, hold',
          'Hold each stretch 30 seconds',
          'Breathe deeply, don\'t bounce'
        ],
        tips: 'Stretch after workout when muscles are warm. Never stretch to the point of pain.'
      }
    ]
  },
  4: { // Thursday
    day: 'Thursday',
    bodyPart: 'Shoulders & Core',
    color: '#ff9800',
    exercises: [
      { 
        name: 'Shoulder Press', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80', 
        videoId: 'qEwKCR5JCog', // Shoulder press
        description: 'Overhead shoulder press with dumbbells',
        sets: '3 sets',
        reps: '12-15 reps',
        instructions: [
          'Start with weights at shoulder height',
          'Press up until arms fully extended',
          'Lower with control back to shoulders',
          'Keep core tight, don\'t arch back excessively'
        ],
        tips: 'Can do seated or standing. Standing engages core more. Don\'t lock elbows at top.'
      },
      { 
        name: 'Lateral Raises', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=80', 
        videoId: '3VcKaXpzqRo', // Lateral raises
        description: 'Side lateral raises for deltoids',
        sets: '3 sets',
        reps: '12-15 reps',
        instructions: [
          'Hold weights at sides, slight bend in elbows',
          'Raise arms out to sides until parallel to floor',
          'Lower slowly, control the negative',
          'Keep slight bend in elbows throughout'
        ],
        tips: 'Light weight, perfect form. Don\'t swing. Focus on deltoid contraction.'
      },
      { 
        name: 'Plank', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80', 
        videoId: 'pSHjTRCQxIw', // Plank tutorial
        difficulty: 'Medium',
        description: 'Forearm plank hold for core',
        sets: '3 sets',
        reps: '30-60 sec hold',
        weight: 'Bodyweight',
        easy: { sets: '2 sets', reps: '20-30 sec hold', weight: 'Knee plank' },
        medium: { sets: '3 sets', reps: '30-60 sec hold', weight: 'Bodyweight' },
        hard: { sets: '4 sets', reps: '60-90 sec hold', weight: 'Weighted or single-arm plank' },
        instructions: [
          'Forearms on ground, body straight line',
          'Engage core, glutes, and quads',
          'Hold position, breathe normally',
          'Don\'t let hips sag or rise'
        ],
        tips: 'Quality over quantity. Better to hold 30 seconds with perfect form than 60 with bad form.'
      },
      { 
        name: 'Side Plank', 
        duration: '2 sets', 
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80', 
        videoId: 'pSHjTRCQxIw', // Side plank
        description: 'Side plank for obliques',
        sets: '2 sets each side',
        reps: '20-30 sec hold',
        instructions: [
          'Lie on side, prop up on forearm',
          'Lift hips, form straight line',
          'Hold position, keep core engaged',
          'Switch sides after time'
        ],
        tips: 'Great for obliques and stability. Can lift top leg for extra challenge.'
      },
      { 
        name: 'Russian Twists', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=80', 
        videoId: 'wkD8rjkodUI', // Russian twists
        description: 'Seated twists for core rotation',
        sets: '3 sets',
        reps: '20 reps each side',
        instructions: [
          'Sit, lean back slightly, lift feet',
          'Rotate torso side to side',
          'Touch ground on each side',
          'Keep core engaged throughout'
        ],
        tips: 'Can hold weight for more resistance. Don\'t let feet touch ground. Control the rotation.'
      },
      { 
        name: 'Mountain Climbers', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80', 
        videoId: 'nmwgirgXLYM', // Mountain climbers
        description: 'Cardio and core exercise',
        sets: '3 sets',
        reps: '20-30 reps each leg',
        instructions: [
          'Start in plank position',
          'Alternate bringing knees to chest',
          'Keep hips level, core tight',
          'Move at controlled pace'
        ],
        tips: 'Great cardio finisher! Can do slow for core focus or fast for cardio. Keep form tight.'
      }
    ]
  },
  5: { // Friday
    day: 'Friday',
    bodyPart: 'Full Body',
    color: '#9c27b0',
    exercises: [
      { 
        name: 'Burpees', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80', 
        videoId: 'auBLP_XH1hI', // Burpees tutorial
        difficulty: 'Hard',
        description: 'Full body burpees for cardio and strength',
        sets: '3 sets',
        reps: '10-12 reps',
        weight: 'Bodyweight',
        easy: { sets: '2 sets', reps: '5-8 reps', weight: 'No push-up, step back' },
        medium: { sets: '3 sets', reps: '10-12 reps', weight: 'Bodyweight with push-up' },
        hard: { sets: '4 sets', reps: '15-20 reps', weight: 'Weighted or jump burpees' },
        instructions: [
          'Start standing, drop into squat',
          'Jump feet back to plank position',
          'Do push-up (optional)',
          'Jump feet forward, explode up with arms overhead'
        ],
        tips: 'The ultimate full-body exercise! Start slow, focus on form. Can skip push-up if too difficult.'
      },
      { 
        name: 'Mountain Climbers', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=80', 
        description: 'Mountain climber exercise for core and cardio',
        sets: '3 sets',
        reps: '20-30 reps each leg',
        instructions: [
          'Plank position, alternate knees to chest',
          'Keep hips level, move at fast pace',
          'Engage core throughout',
          'Breathe rhythmically'
        ],
        tips: 'Great for heart rate! Can do slow for beginners or fast for advanced. Keep form tight.'
      },
      { 
        name: 'Jumping Jacks', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80', 
        videoId: 'iSSAk4XCsRA', // Jumping jacks
        description: 'Cardio jumping jacks',
        sets: '3 sets',
        reps: '30-40 reps',
        instructions: [
          'Start standing, feet together',
          'Jump feet apart while raising arms overhead',
          'Jump back to start position',
          'Maintain rhythm and pace'
        ],
        tips: 'Classic cardio! Great warm-up or finisher. Can do low-impact version (step instead of jump).'
      },
      { 
        name: 'High Knees', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80', 
        videoId: 'oDdkytliOqE', // High knees
        description: 'Running in place with high knees',
        sets: '3 sets',
        reps: '30 sec each',
        instructions: [
          'Run in place, bring knees up high',
          'Pump arms naturally',
          'Land on balls of feet',
          'Maintain fast pace'
        ],
        tips: 'Great cardio! Focus on bringing knees up high, not just running fast. Engage core.'
      },
      { 
        name: 'Jump Squats', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=80', 
        videoId: 'YaXPRqUwItQ', // Jump squats
        description: 'Explosive jump squats for power',
        sets: '3 sets',
        reps: '12-15 reps',
        instructions: [
          'Perform regular squat',
          'Explode up, jumping as high as possible',
          'Land softly, immediately go into next squat',
          'Use arms for momentum'
        ],
        tips: 'Advanced exercise! Master regular squats first. Land softly to protect knees. Great for power!'
      },
      { 
        name: 'Plank to Push-up', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80', 
        videoId: 'pSHjTRCQxIw', // Plank variations
        description: 'Core and upper body combination',
        sets: '3 sets',
        reps: '10-12 reps',
        instructions: [
          'Start in plank position',
          'Push up to high plank (one arm at a time)',
          'Lower back to plank',
          'Alternate which arm goes first'
        ],
        tips: 'Great for core stability and shoulder strength. Keep body straight, don\'t rotate hips.'
      }
    ]
  },
  6: { // Saturday
    day: 'Saturday',
    bodyPart: 'Cardio & Flexibility',
    color: '#00bcd4',
    exercises: [
      { 
        name: 'Jump Rope', 
        duration: '3 sets', 
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80', 
        videoId: 'u3zgHI8QnqE', // Jump rope
        description: 'Jump rope or simulated jumping',
        sets: '3 sets',
        reps: '1-2 min each',
        instructions: [
          'Hold rope handles, jump over rope',
          'Land on balls of feet, keep knees slightly bent',
          'Maintain rhythm, can vary speed',
          'Rest 30-60 seconds between sets'
        ],
        tips: 'No rope? Simulate the motion! Great for coordination and cardio. Start slow, build speed.'
      },
      { 
        name: 'Yoga Flow', 
        duration: '15 min', 
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80', 
        videoId: 'v7AYKMP6rOE', // Sun Salutation
        description: 'Sun salutation flow sequence',
        sets: '1 set',
        reps: '15 min',
        instructions: [
          'Start with Mountain Pose',
          'Flow through Sun Salutation A (5-10 rounds)',
          'Include standing poses: Warrior I, II, Triangle',
          'End with seated stretches and Savasana'
        ],
        tips: 'Focus on breath and movement connection. Move slowly and mindfully. Great for flexibility!'
      },
      { 
        name: 'Deep Stretching', 
        duration: '20 min', 
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80', 
        description: 'Full body deep stretching routine',
        sets: '1 set',
        reps: '20 min',
        instructions: [
          'Stretch all major muscle groups',
          'Hold each stretch 30-60 seconds',
          'Include: hamstrings, quads, calves, chest, back, shoulders',
          'Breathe deeply, relax into stretches'
        ],
        tips: 'Best done after workout when muscles are warm. Never stretch to pain. Consistency is key.'
      },
      { 
        name: 'Walking / Light Jog', 
        duration: '20-30 min', 
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=80', 
        videoId: 'iSSAk4XCsRA', // Walking/jogging
        description: 'Light cardio activity',
        sets: '1 set',
        reps: '20-30 min',
        instructions: [
          'Walk at moderate pace or light jog',
          'Maintain conversation pace (can talk while moving)',
          'Focus on steady rhythm',
          'Enjoy the movement and fresh air'
        ],
        tips: 'Active recovery day! Low intensity is perfect. Can do outdoors or on treadmill.'
      }
    ]
  }
};

const Exercises = () => {
  const currentDay = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [viewMode, setViewMode] = useState(0); // 0: Today, 1: Week View
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium'); // easy, medium, hard

  const todayExercise = EXERCISES_BY_DAY[currentDay];
  const selectedExerciseData = EXERCISES_BY_DAY[selectedDay];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    // Reset difficulty to medium when opening new exercise
    setSelectedDifficulty(exercise.difficulty === 'Easy' ? 'easy' : exercise.difficulty === 'Hard' ? 'hard' : 'medium');
    setDetailDialogOpen(true);
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2d3748', mb: 0.5 }}>
              Daily Exercises
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Day-wise workout recommendations with body part focus
            </Typography>
          </Box>
        </Box>

        <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)} sx={{ mb: 3 }}>
          <Tab icon={<TodayIcon />} label="Today's Workout" />
          <Tab icon={<CalendarIcon />} label="Week View" />
        </Tabs>

        {viewMode === 0 && (
          <Box>
            {/* Today's Workout Header */}
            <Box
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${todayExercise.color}15 0%, ${todayExercise.color}05 100%)`,
                border: `2px solid ${todayExercise.color}40`,
                textAlign: 'center'
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: todayExercise.color, mb: 1 }}>
                {todayExercise.day} - {todayExercise.bodyPart}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {todayExercise.exercises.length} exercises recommended for today
              </Typography>
            </Box>

            {/* Today's Exercises */}
            <Grid container spacing={3}>
              {todayExercise.exercises.map((exercise, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 8,
                        transform: 'translateY(-8px)',
                      },
                    }}
                    onClick={() => handleExerciseClick(exercise)}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: 250,
                        backgroundImage: `url(${exercise.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(to bottom, transparent 0%, ${todayExercise.color}DD 100%)`,
                          transition: 'opacity 0.3s ease',
                        },
                        '&:hover::after': {
                          background: `linear-gradient(to bottom, transparent 0%, ${todayExercise.color}FF 100%)`,
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          zIndex: 1
                        }}
                      >
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            fontWeight: 700,
                            fontSize: '0.85rem'
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          right: 12,
                          zIndex: 1
                        }}
                      >
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                          }}
                        >
                          {exercise.name}
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        {exercise.difficulty && (
                          <Chip
                            label={exercise.difficulty}
                            size="small"
                            color={
                              exercise.difficulty === 'Easy' ? 'success' :
                              exercise.difficulty === 'Medium' ? 'warning' : 'error'
                            }
                          />
                        )}
                        <Chip
                          label={exercise.sets}
                          size="small"
                          sx={{ backgroundColor: todayExercise.color, color: 'white', fontWeight: 600 }}
                        />
                        <Chip
                          label={exercise.reps}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: todayExercise.color, color: todayExercise.color }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {exercise.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        startIcon={<PlayIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExerciseClick(exercise);
                        }}
                        sx={{
                          color: todayExercise.color,
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: `${todayExercise.color}15`,
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {viewMode === 1 && (
          <Box>
            {/* Week View - Day Selector */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {dayNames.map((dayName, dayIndex) => {
                const dayData = EXERCISES_BY_DAY[dayIndex];
                const isToday = dayIndex === currentDay;
                const isSelected = dayIndex === selectedDay;
                
                return (
                  <Button
                    key={dayIndex}
                    variant={isSelected ? 'contained' : 'outlined'}
                    onClick={() => setSelectedDay(dayIndex)}
                    sx={{
                      minWidth: 120,
                      backgroundColor: isSelected ? dayData.color : 'transparent',
                      borderColor: dayData.color,
                      color: isSelected ? 'white' : dayData.color,
                      fontWeight: isSelected ? 700 : 500,
                      '&:hover': {
                        backgroundColor: isSelected ? dayData.color : `${dayData.color}15`,
                        borderColor: dayData.color,
                      },
                      ...(isToday && !isSelected && {
                        borderWidth: 2,
                        fontWeight: 700
                      })
                    }}
                  >
                    {dayName}
                    {isToday && (
                      <Chip 
                        label="Today" 
                        size="small" 
                        sx={{ 
                          ml: 1, 
                          height: 18, 
                          fontSize: '0.65rem',
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : dayData.color,
                          color: isSelected ? 'white' : 'white'
                        }} 
                      />
                    )}
                  </Button>
                );
              })}
            </Box>

            {/* Selected Day Exercises */}
            <Box
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${selectedExerciseData.color}15 0%, ${selectedExerciseData.color}05 100%)`,
                border: `2px solid ${selectedExerciseData.color}40`,
                textAlign: 'center'
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: selectedExerciseData.color, mb: 1 }}>
                {selectedExerciseData.day} - {selectedExerciseData.bodyPart}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedExerciseData.exercises.length} exercises for {selectedExerciseData.bodyPart.toLowerCase()}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {selectedExerciseData.exercises.map((exercise, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 8,
                        transform: 'translateY(-8px)',
                      },
                    }}
                    onClick={() => handleExerciseClick(exercise)}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: 250,
                        backgroundImage: `url(${exercise.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(to bottom, transparent 0%, ${selectedExerciseData.color}DD 100%)`,
                          transition: 'opacity 0.3s ease',
                        },
                        '&:hover::after': {
                          background: `linear-gradient(to bottom, transparent 0%, ${selectedExerciseData.color}FF 100%)`,
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          zIndex: 1
                        }}
                      >
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            fontWeight: 700,
                            fontSize: '0.85rem'
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          right: 12,
                          zIndex: 1
                        }}
                      >
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                          }}
                        >
                          {exercise.name}
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        {exercise.difficulty && (
                          <Chip
                            label={exercise.difficulty}
                            size="small"
                            color={
                              exercise.difficulty === 'Easy' ? 'success' :
                              exercise.difficulty === 'Medium' ? 'warning' : 'error'
                            }
                          />
                        )}
                        <Chip
                          label={exercise.sets}
                          size="small"
                          sx={{ backgroundColor: selectedExerciseData.color, color: 'white', fontWeight: 600 }}
                        />
                        <Chip
                          label={exercise.reps}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: selectedExerciseData.color, color: selectedExerciseData.color }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {exercise.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        startIcon={<PlayIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExerciseClick(exercise);
                        }}
                        sx={{
                          color: selectedExerciseData.color,
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: `${selectedExerciseData.color}15`,
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>Workout Schedule:</strong> Each day focuses on different body parts to ensure balanced training and proper recovery.
            Click on any exercise card to see detailed instructions and tips!
          </Typography>
        </Alert>
      </Paper>

      {/* Exercise Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }
        }}
      >
        {selectedExercise && (
          <>
            <DialogTitle sx={{ p: 0 }}>
              <Box
                sx={{
                  position: 'relative',
                  height: 300,
                  backgroundImage: `url(${selectedExercise.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)',
                  }
                }}
              >
                <IconButton
                  onClick={() => setDetailDialogOpen(false)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '&:hover': {
                      backgroundColor: 'white',
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 3,
                    zIndex: 1
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                    {selectedExercise.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={selectedExercise.sets}
                      sx={{ backgroundColor: 'rgba(255,255,255,0.9)', fontWeight: 600 }}
                    />
                    <Chip
                      label={selectedExercise.reps}
                      sx={{ backgroundColor: 'rgba(255,255,255,0.9)', fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {selectedExercise.description}
              </Typography>

              {/* Difficulty Selector */}
              {selectedExercise.easy && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    Select Difficulty Level:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button
                      variant={selectedDifficulty === 'easy' ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setSelectedDifficulty('easy')}
                      color="success"
                    >
                      Easy
                    </Button>
                    <Button
                      variant={selectedDifficulty === 'medium' ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setSelectedDifficulty('medium')}
                      color="warning"
                    >
                      Medium
                    </Button>
                    <Button
                      variant={selectedDifficulty === 'hard' ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setSelectedDifficulty('hard')}
                      color="error"
                    >
                      Hard
                    </Button>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      {selectedDifficulty === 'easy' ? 'Easy' : selectedDifficulty === 'medium' ? 'Medium' : 'Hard'} Level:
                    </Typography>
                    <Typography variant="body1">
                      <strong>Sets:</strong> {selectedExercise[selectedDifficulty]?.sets || selectedExercise.sets}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Reps:</strong> {selectedExercise[selectedDifficulty]?.reps || selectedExercise.reps}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Weight:</strong> {selectedExercise[selectedDifficulty]?.weight || selectedExercise.weight || 'Bodyweight'}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Video Preview */}
              {selectedExercise.videoId && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2d3748' }}>
                    📹 Watch How to Do It:
                  </Typography>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '56.25%', // 16:9 aspect ratio
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${selectedExercise.videoId}?rel=0&modestbranding=1`}
                      title={selectedExercise.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2d3748' }}>
                How to Perform:
              </Typography>
              <List>
                {selectedExercise.instructions?.map((instruction, index) => (
                  <ListItem key={index} sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <CheckIcon sx={{ color: '#4caf50' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={instruction}
                      primaryTypographyProps={{
                        variant: 'body1',
                        sx: { color: '#2d3748' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              {selectedExercise.tips && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffc107'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#856404' }}>
                      💡 Pro Tip:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#856404' }}>
                      {selectedExercise.tips}
                    </Typography>
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
              <Button onClick={() => setDetailDialogOpen(false)} variant="contained" fullWidth>
                Got it! Let's Exercise
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Exercises;
