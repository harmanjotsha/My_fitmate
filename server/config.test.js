import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { validateProductionConfig } from './config.js'

test('development does not require production secrets', () => {
  assert.equal(validateProductionConfig({ NODE_ENV: 'development' }), true)
})

test('production rejects missing deployment settings', () => {
  assert.throws(
    () => validateProductionConfig({ NODE_ENV: 'production' }),
    /JWT_SECRET.*MONGO_URL.*CLIENT_URL or RENDER_EXTERNAL_URL/s,
  )
})

test('production accepts a strong secret, database, and HTTPS origin', () => {
  assert.equal(validateProductionConfig({
    NODE_ENV: 'production',
    JWT_SECRET: 'a'.repeat(48),
    MONGO_URL: 'mongodb+srv://example.invalid/fitmate',
    CLIENT_URL: 'https://fitmate.example',
  }), true)
})

test('production accepts the URL automatically assigned by Render', () => {
  assert.equal(validateProductionConfig({
    NODE_ENV: 'production',
    JWT_SECRET: 'a'.repeat(48),
    MONGO_URL: 'mongodb+srv://example.invalid/fitmate',
    RENDER_EXTERNAL_URL: 'https://fitmate.onrender.com',
  }), true)
})

test('production rejects an HTTP client origin', () => {
  assert.throws(
    () => validateProductionConfig({
      NODE_ENV: 'production',
      JWT_SECRET: 'a'.repeat(48),
      MONGO_URL: 'mongodb+srv://example.invalid/fitmate',
      CLIENT_URL: 'http://fitmate.example',
    }),
    /HTTPS origin/,
  )
})

test('production rejects a copied example JWT secret', () => {
  assert.throws(
    () => validateProductionConfig({
      NODE_ENV: 'production',
      JWT_SECRET: 'replace-with-output-from-openssl-rand-32chars',
      MONGO_URL: 'mongodb+srv://example.invalid/fitmate',
      CLIENT_URL: 'https://fitmate.example',
    }),
    /unique random value/,
  )
})

test('JWT secret fallback is development-only', async () => {
  const { getJwtSecret } = await import('./config.js')
  assert.equal(getJwtSecret({ NODE_ENV: 'development' }), 'development-only-fitmate-secret')
  assert.throws(() => getJwtSecret({ NODE_ENV: 'production' }), /required in production/)
})

test('production startup exits before listening when MongoDB is missing', () => {
  const result = spawnSync(process.execPath, ['server.js'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      JWT_SECRET: 'a'.repeat(64),
      MONGO_URL: '',
      MONGODB_URI: '',
      CLIENT_URL: 'https://fitmate.example',
      PORT: '4179',
    },
  })
  const output = `${result.stdout}${result.stderr}`
  assert.notEqual(result.status, 0)
  assert.match(output, /MONGO_URL or MONGODB_URI is required/)
  assert.doesNotMatch(output, /API listening/)
})

test('production startup exits before listening when MongoDB is unreachable', () => {
  const result = spawnSync(process.execPath, ['server.js'], {
    encoding: 'utf8',
    timeout: 10_000,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      JWT_SECRET: 'a'.repeat(64),
      MONGO_URL: 'mongodb://127.0.0.1:1/fitmate',
      MONGODB_URI: '',
      CLIENT_URL: 'https://fitmate.example',
      PORT: '4181',
    },
  })
  const output = `${result.stdout}${result.stderr}`
  assert.notEqual(result.status, 0)
  assert.match(output, /FitMate failed to start/)
  assert.doesNotMatch(output, /API listening/)
})

test('production store starts without seeded demo accounts or personal data', () => {
  const result = spawnSync(process.execPath, [
    '--input-type=module',
    '-e',
    "import { store } from './store.js'; process.stdout.write(JSON.stringify({ users: store.users, meals: store.meals, projects: store.projects }))",
  ], {
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'production' },
  })
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(JSON.parse(result.stdout), { users: [], meals: [], projects: [] })
})