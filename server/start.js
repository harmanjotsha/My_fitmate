import http from 'node:http'
import 'dotenv/config'
import { spawn } from 'node:child_process'

const port = Number(process.env.PORT || 4000)

function checkHealth() {
  return new Promise((resolve) => {
    const request = http.get(`http://127.0.0.1:${port}/api/health`, (response) => {
      let body = ''
      response.on('data', (chunk) => { body += chunk })
      response.on('end', () => {
        try {
          const result = JSON.parse(body)
          resolve(response.statusCode === 200 && result.service === 'fitmate-api')
        } catch {
          resolve(false)
        }
      })
    })
    request.on('error', () => resolve(false))
    request.setTimeout(800, () => { request.destroy(); resolve(false) })
  })
}

if (await checkHealth()) {
  console.log(`FitMate API is already running on http://localhost:${port}`)
  process.exit(0)
}

const server = spawn(process.execPath, ['server.js'], { stdio: 'inherit', env: process.env })
server.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 1)
})