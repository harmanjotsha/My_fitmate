import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { store, createId, publicUser } from '../store.js'
import { persistStore } from '../persistence.js'

const router = Router()

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Name, email, and a password of at least 6 characters are required' })
  if (store.users.some((user) => user.email === email.toLowerCase())) return res.status(409).json({ message: 'An account with that email already exists' })
  const passwordHash = await bcrypt.hash(password, 12)
  const user = { id: createId('user'), name, email: email.toLowerCase(), passwordHash, role: 'USER', status: 'active', fitnessGoal: 'General Fitness', dietPreference: 'No Preference', exerciseExperience: 'Beginner', onboardingComplete: false }
  store.users.push(user)
  persistStore().catch(console.error)
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET || 'development-secret', { expiresIn: '7d' })
  res.status(201).json({ user: publicUser(user), token })
})

router.post('/login', async (req, res) => {
  const user = store.users.find((candidate) => candidate.email === req.body.email?.toLowerCase())
  const validSeedLogin = user?.email === 'jamie@example.com' && req.body.password === 'secret123' && !user.passwordHash
  const validAdminLogin = user?.email === 'admin@fitmate.com' && req.body.password === 'admin123' && !user.passwordHash
  if (!user || (!validSeedLogin && !validAdminLogin && (!user.passwordHash || !(await bcrypt.compare(req.body.password || '', user.passwordHash))))) return res.status(401).json({ message: 'Invalid email or password' })
  if (validSeedLogin || validAdminLogin) user.passwordHash = await bcrypt.hash(req.body.password, 12)
  if (validSeedLogin || validAdminLogin) persistStore().catch(console.error)
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET || 'development-secret', { expiresIn: '7d' })
  res.json({ user: publicUser(user), token })
})
router.post('/logout', (_req, res) => res.json({ message: 'Logged out' }))
router.post('/forgot-password', (_req, res) => res.json({ message: 'If the account exists, a reset email will be sent' }))


export default router
