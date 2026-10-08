import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { store, createId, publicUser } from '../store.js'
import { persistStore } from '../persistence.js'
import { getJwtSecret } from '../config.js'
import { rateLimit } from '../middleware/rateLimit.js'

const router = Router()
router.use(rateLimit({ windowMs: 15 * 60_000, max: 20, scope: 'auth' }))

router.post('/register', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: 'Enter a valid name and email, and a password between 8 and 128 characters' })
  }
  if (store.users.some((user) => user.email === email)) return res.status(409).json({ message: 'An account with that email already exists' })
  const passwordHash = await bcrypt.hash(password, 12)
  const user = { id: createId('user'), name, email, passwordHash, role: 'USER', status: 'active', fitnessGoal: 'General Fitness', dietPreference: 'No Preference', exerciseExperience: 'Beginner', onboardingComplete: false }
  store.users.push(user)
  persistStore().catch(console.error)
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, getJwtSecret(), { expiresIn: '7d' })
  res.status(201).json({ user: publicUser(user), token })
})

router.post('/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const user = store.users.find((candidate) => candidate.email === email)
  const validSeedLogin = process.env.NODE_ENV !== 'production' && user?.email === 'jamie@example.com' && password === 'secret123' && !user.passwordHash
  const validAdminLogin = process.env.NODE_ENV !== 'production' && user?.email === 'admin@fitmate.com' && password === 'admin123' && !user.passwordHash
  if (!user || user.status !== 'active' || (!validSeedLogin && !validAdminLogin && (!user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))))) return res.status(401).json({ message: 'Invalid email or password' })
  if (validSeedLogin || validAdminLogin) user.passwordHash = await bcrypt.hash(password, 12)
  if (validSeedLogin || validAdminLogin) persistStore().catch(console.error)
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, getJwtSecret(), { expiresIn: '7d' })
  res.json({ user: publicUser(user), token })
})
router.post('/logout', (_req, res) => res.json({ message: 'Logged out' }))
router.post('/forgot-password', (_req, res) => res.status(503).json({ message: 'Password reset is not configured. Contact the site administrator.' }))


export default router
