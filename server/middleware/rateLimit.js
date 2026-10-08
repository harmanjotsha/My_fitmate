const buckets = new Map()
const maxBuckets = 10_000

export function rateLimit({ windowMs = 60_000, max = 120, scope = 'default' } = {}) {
  return (req, res, next) => {
    const key = `${scope}:${req.ip}`
    const now = Date.now()
    const bucket = buckets.get(key)
    if (!bucket || now - bucket.startedAt >= windowMs) {
      if (!bucket && buckets.size >= maxBuckets) buckets.delete(buckets.keys().next().value)
      buckets.set(key, { startedAt: now, count: 1 })
      return next()
    }
    bucket.count += 1
    if (bucket.count > max) return res.status(429).json({ message: 'Too many requests. Please try again shortly.' })
    next()
  }
}
