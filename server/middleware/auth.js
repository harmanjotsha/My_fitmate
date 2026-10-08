import jwt from 'jsonwebtoken'
import { store } from '../store.js'
import { getJwtSecret } from '../config.js'

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ message: 'Authentication required' })

  try {
    req.user = jwt.verify(token, getJwtSecret())
    if (!store.users.some((user) => user.id === req.user.id && user.status === 'active')) {
      return res.status(401).json({ message: 'User account is unavailable' })
    }
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
