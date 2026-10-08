import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import apiRoutes from './routes/api.js'
import authRoutes from './routes/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import { connectPersistence, getPersistenceStatus } from './persistence.js'
import { requireAuth } from './middleware/auth.js'
import { store } from './store.js'
import { rateLimit } from './middleware/rateLimit.js'
import { getGamification } from './services/gamification.js'
import { startWeeklyDigestScheduler } from './services/weeklyDigest.js'
import { validateProductionConfig } from './config.js'

const app = express()
const port = Number(process.env.PORT || 4000)
const isProduction = process.env.NODE_ENV === 'production'
const serverDirectory = dirname(fileURLToPath(import.meta.url))
const clientDist = resolve(serverDirectory, '../client/dist')
const clientOrigin = process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL
app.disable('x-powered-by')
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false)
const allowClientOrigin = (origin, callback) => {
  const allowed = !origin || origin === clientOrigin || (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
  callback(null, allowed)
}

app.use(cors({ origin: allowClientOrigin }))
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  next()
})
app.use(express.json({ limit: '2mb' }))
app.use('/api', rateLimit({ windowMs: 60_000, max: 180, scope: 'api' }))

app.get('/api/health', (_req, res) => {
  const persistence = getPersistenceStatus()
  const ready = !isProduction || persistence === 'mongodb'
  res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'unavailable', service: 'fitmate-api', persistence })
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

app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found' }))

if (isProduction) {
  app.use(express.static(clientDist, { index: false, maxAge: '1y', immutable: true }))
  app.get('*', (_req, res) => res.sendFile(resolve(clientDist, 'index.html')))
}

app.use(errorHandler)

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }))

async function startServer() {
  try {
    validateProductionConfig()
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535')
    if (isProduction && !existsSync(resolve(clientDist, 'index.html'))) {
      throw new Error('Production client build is missing. Run npm run build before starting the server.')
    }
    await connectPersistence()
    startWeeklyDigestScheduler()
    app.listen(port, '0.0.0.0', () => console.log(`FitMate API listening on port ${port}`))
  } catch (error) {
    console.error(`FitMate failed to start: ${error.message}`)
    process.exitCode = 1
  }
}

export { app }
startServer()
