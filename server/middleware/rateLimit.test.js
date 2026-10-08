import assert from 'node:assert/strict'
import test from 'node:test'
import { rateLimit } from './rateLimit.js'

function invoke(middleware, ip) {
  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this },
    json() { return this },
  }
  let continued = false
  middleware({ ip }, response, () => { continued = true })
  return { response, continued }
}

test('rate limit is shared across paths for an IP and scope', () => {
  const middleware = rateLimit({ windowMs: 60_000, max: 1, scope: `test-${Date.now()}` })
  assert.equal(invoke(middleware, '192.0.2.4').continued, true)
  const limited = invoke(middleware, '192.0.2.4')
  assert.equal(limited.continued, false)
  assert.equal(limited.response.statusCode, 429)
})

test('rate limit buckets are isolated by IP', () => {
  const middleware = rateLimit({ windowMs: 60_000, max: 1, scope: `test-${Date.now()}` })
  assert.equal(invoke(middleware, '192.0.2.5').continued, true)
  assert.equal(invoke(middleware, '192.0.2.6').continued, true)
})