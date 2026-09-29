import jwt from 'jsonwebtoken'
import { store } from '../store.js'

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ message: 'Authentication required' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'development-secret')
    if (!store.users.some((user) => user.id === req.user.id && user.status === 'active')) {
      return res.status(401).json({ message: 'User account is unavailable' })
    }
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
