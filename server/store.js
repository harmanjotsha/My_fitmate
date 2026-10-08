import { randomUUID } from 'node:crypto'

const today = new Date().toISOString().slice(0, 10)
const demoMode = process.env.NODE_ENV !== 'production'

export const store = {
  users: demoMode ? [
    { id: 'user-jamie', name: 'Jamie Roberts', email: 'jamie@example.com', passwordHash: '', role: 'USER', status: 'active', fitnessGoal: 'Build strength and feel energized', dietPreference: 'Balanced', exerciseExperience: 'Intermediate', activityLevel: 'Active', age: 29, height: 172, weight: 68, onboardingComplete: true, targets: { calories: 2400, waterGlasses: 8, stepCount: 9000, workoutMinutes: 40, source: 'smart-default' } },
    { id: 'user-admin', name: 'FitMate Admin', email: 'admin@fitmate.com', passwordHash: '', role: 'ADMIN', status: 'active', fitnessGoal: 'Support the community', dietPreference: 'Balanced', exerciseExperience: 'Advanced', onboardingComplete: true },
  ] : [],
  exercises: [
    { id: 'exercise-1', name: 'Upper body strength', category: 'Strength', difficulty: 'Intermediate', muscleGroup: 'Upper body', equipment: 'Dumbbells', durationMinutes: 28, instructions: ['Warm up for five minutes', 'Complete three controlled rounds', 'Rest for sixty seconds between rounds'] },
    { id: 'exercise-2', name: 'Morning mobility', category: 'Mobility', difficulty: 'Beginner', muscleGroup: 'Full body', equipment: 'Mat', durationMinutes: 15, instructions: ['Move slowly through each range', 'Breathe steadily throughout'] },
  ],
  foods: [
    { id: 'food-1', name: 'Greek yogurt', category: 'Dairy', servingSize: '170 g', caloriesApprox: 120, proteinApprox: 17, carbsApprox: 7, fatApprox: 0 },
    { id: 'food-2', name: 'Oats', category: 'Grains', servingSize: '40 g', caloriesApprox: 150, proteinApprox: 5, carbsApprox: 27, fatApprox: 3 },
  ],
  meals: demoMode ? [{ id: 'meal-1', userId: 'user-jamie', date: today, items: ['Greek yogurt', 'Berries', 'Oats'], estimatedCalories: 340, source: 'manual' }] : [],
  workouts: demoMode ? [{ id: 'workout-1', userId: 'user-jamie', date: today, title: 'Upper body strength', exercises: ['Push ups', 'Dumbbell row', 'Shoulder press'], durationMinutes: 28, completed: false }] : [],
  progress: demoMode ? [{ id: 'progress-1', userId: 'user-jamie', date: today, weight: 68, steps: 6840, waterGlasses: 5, sleepHours: 7.4, workoutMinutes: 42 }] : [],
  hydration: demoMode ? [{ id: 'hydration-1', userId: 'user-jamie', date: today, goalMl: 2000, amountMl: 1250 }] : [],
  sleep: demoMode ? [{ id: 'sleep-1', userId: 'user-jamie', date: today, bedtime: '22:45', wakeTime: '06:10', totalHours: 7.4, quality: 'Good', notes: '' }] : [],
  wellnessCheckIns: [],
  challenges: [{ id: 'challenge-1', title: '30-Day Activity Challenge', description: 'Build a steady movement habit with one active day at a time.', durationDays: 30, goal: 'Complete 20 active days', startDate: today, endDate: today, status: 'active', rules: ['Choose movement that fits your day', 'Rest is part of consistency'] }],
  challengeParticipants: [],
  achievements: [],
  gamification: [],
  announcements: [],
  content: [],
  workoutPlans: [],
  userActivity: [],
  aiUsage: [],
  files: [],
  projects: demoMode ? [{ id: 'project-1', ownerId: 'user-jamie', name: 'Jamie fitness journey', description: 'A shared space for workouts, meal ideas, and weekly progress.', isPublic: true, shareToken: 'jamie-fitness-journey', createdAt: today }] : [],
  projectMembers: demoMode ? [{ id: 'member-1', projectId: 'project-1', userId: 'user-jamie', role: 'owner', joinedAt: today }] : [],
  projectNotes: demoMode ? [{ id: 'note-1', projectId: 'project-1', authorId: 'user-jamie', title: 'Weekly focus', content: '# Weekly focus\n\n- Complete three strength sessions\n- Drink water with every meal\n- Protect my bedtime', updatedAt: new Date().toISOString() }] : [],
  projectFiles: [],
  projectActivity: [],
  services: [],
  notifications: demoMode ? [{ id: 'notification-1', userId: 'user-jamie', message: 'Your weekly activity goal is 69% complete.', read: false }] : [],
}

export function createId(prefix) { return `${prefix}-${randomUUID()}` }
export function currentUserFromRequest(req) { return store.users.find((user) => user.id === req.user?.id) }
export function publicUser(user) {
  if (!user) return null
  const { passwordHash, ...safeUser } = user
  return safeUser
}
