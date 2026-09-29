import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import apiRoutes from './routes/api.js'
import authRoutes from './routes/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import { connectPersistence } from './persistence.js'
import { requireAuth } from './middleware/auth.js'
import { store } from './store.js'
import { rateLimit } from './middleware/rateLimit.js'
import { getGamification } from './services/gamification.js'
import { startWeeklyDigestScheduler } from './services/weeklyDigest.js'

const app = express()
const port = process.env.PORT || 4000
const allowClientOrigin = (origin, callback) => {
  const allowed = !origin || origin === process.env.CLIENT_URL || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  callback(null, allowed)
}

app.use(cors({ origin: allowClientOrigin }))
app.use(express.json({ limit: '1mb' }))
app.use('/api', rateLimit({ windowMs: 60_000, max: 180 }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'fitmate-api', phase: 1 })
})

app.get('/api/dashboard/summary', requireAuth, (req, res) => {
  const currentDate = new Date().toISOString().slice(0, 10)
  const user = store.users.find((candidate) => candidate.id === req.user.id)
  const workouts = store.workouts.filter((item) => item.userId === req.user.id && item.date === currentDate)
  const meals = store.meals.filter((item) => item.userId === req.user.id && item.date === currentDate)
  const progress = store.progress.find((item) => item.userId === req.user.id && item.date === currentDate) || store.progress.find((item) => item.userId === req.user.id)
  const hydration = store.hydration.find((item) => item.userId === req.user.id && item.date === currentDate) || store.hydration.find((item) => item.userId === req.user.id)
  const sleep = store.sleep.find((item) => item.userId === req.user.id && item.date === currentDate) || store.sleep.find((item) => item.userId === req.user.id)
  const checkIn = store.wellnessCheckIns.find((item) => item.userId === req.user.id && item.date === currentDate) || null
  const gamification = getGamification(req.user.id)
  const targets = user?.targets || { calories: 2000, waterGlasses: 8, stepCount: 8000, workoutMinutes: 30 }
  const caloriesConsumed = meals.reduce((total, item) => total + Number(item.estimatedCalories || 0), 0)
  const caloriesGoal = Number(targets.calories || 2000)
  const workoutMinutes = workouts.reduce((total, item) => total + Number(item.durationMinutes || 0), 0) || progress?.workoutMinutes || 0
  const waterGlasses = Math.round((hydration?.amountMl || progress?.waterGlasses * 250 || 0) / 250)
  const goalPercent = Math.min(100, Math.round(((caloriesConsumed / caloriesGoal) + ((progress?.steps || 0) / Number(targets.stepCount || 8000)) + (waterGlasses / Number(targets.waterGlasses || 8)) + (workoutMinutes / Number(targets.workoutMinutes || 30))) / 4 * 100))
  res.json({
    user: { name: user?.name, goal: user?.fitnessGoal },
    targets,
    checkIn,
    gamification,
    stats: { caloriesConsumed, caloriesGoal, steps: progress?.steps || 0, activeMinutes: workoutMinutes, waterGlasses, waterGoalGlasses: Number(targets.waterGlasses || 8), sleepHours: sleep?.totalHours || progress?.sleepHours || 0, mealsLogged: meals.length, goalPercent },
    streak: workouts.filter((item) => item.completed).length,
  })
})

app.use('/api/auth', authRoutes)
app.use('/api', apiRoutes)

app.use(errorHandler)

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }))

connectPersistence().finally(() => { startWeeklyDigestScheduler(); app.listen(port, () => console.log(`FitMate API listening on http://localhost:${port}`)) })
