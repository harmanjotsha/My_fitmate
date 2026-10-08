export function validateProductionConfig(env = process.env) {
  if (env.NODE_ENV !== 'production') return true

  const errors = []
  const jwtSecret = env.JWT_SECRET?.trim() || ''
  if (jwtSecret.length < 32 || /replace|change.?me|example|placeholder/i.test(jwtSecret)) {
    errors.push('JWT_SECRET must be a unique random value of at least 32 characters')
  }
  if (!(env.MONGO_URL || env.MONGODB_URI)) {
    errors.push('MONGO_URL or MONGODB_URI is required')
  }

  const clientOrigin = env.CLIENT_URL || env.RENDER_EXTERNAL_URL
  let clientUrl
  try {
    if (!clientOrigin) throw new Error('Missing client origin')
    clientUrl = new URL(clientOrigin)
  } catch {
    errors.push('CLIENT_URL or RENDER_EXTERNAL_URL must be a valid HTTPS origin')
  }
  if (clientUrl && (clientUrl.protocol !== 'https:' || clientUrl.origin !== clientOrigin)) {
    errors.push('CLIENT_URL or RENDER_EXTERNAL_URL must be a valid HTTPS origin')
  }

  if (errors.length) {
    throw new Error(`Invalid production configuration:\n- ${errors.join('\n- ')}`)
  }
  return true
}

export function getJwtSecret(env = process.env) {
  if (env.JWT_SECRET) return env.JWT_SECRET
  if (env.NODE_ENV === 'production') throw new Error('JWT_SECRET is required in production')
  return 'development-only-fitmate-secret'
}