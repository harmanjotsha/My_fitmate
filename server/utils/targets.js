const ACTIVITY_FACTORS = {
  Sedentary: 1.2,
  'Lightly active': 1.375,
  Active: 1.55,
  'Very active': 1.725,
}

const ACTIVITY_TARGETS = {
  Sedentary: { steps: 5000, workoutMinutes: 20 },
  'Lightly active': { steps: 7000, workoutMinutes: 30 },
  Active: { steps: 9000, workoutMinutes: 40 },
  'Very active': { steps: 11000, workoutMinutes: 50 },
}

export function calculateDefaultTargets(profile = {}) {
  const age = Number(profile.age) || 30
  const height = Number(profile.height) || 170
  const weight = Number(profile.weight) || 70
  const activityLevel = profile.activityLevel || 'Active'
  const activityFactor = ACTIVITY_FACTORS[activityLevel] || ACTIVITY_FACTORS.Active
  const baseCalories = (10 * weight) + (6.25 * height) - (5 * age) - 78
  const goal = String(profile.fitnessGoal || '').toLowerCase()
  const goalAdjustment = goal.includes('weight') ? -250 : goal.includes('muscle') ? 250 : 0
  const activity = ACTIVITY_TARGETS[activityLevel] || ACTIVITY_TARGETS.Active

  return {
    calories: Math.max(1200, Math.round((baseCalories * activityFactor + goalAdjustment) / 50) * 50),
    waterGlasses: Math.max(6, Math.round((weight * 30 / 250))),
    stepCount: activity.steps,
    workoutMinutes: activity.workoutMinutes,
    source: 'smart-default',
    updatedAt: new Date().toISOString(),
  }
}
