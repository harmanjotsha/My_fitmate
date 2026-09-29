import cron from 'node-cron'
import { getGamification } from './gamification.js'
import { createId, store } from '../store.js'
import { persistStore } from '../persistence.js'

function dateKey(date) {
  return date.toISOString().slice(0, 10)
}

export function generateWeeklyDigest(referenceDate = new Date()) {
  const end = new Date(referenceDate)
  end.setUTCHours(23, 59, 59, 999)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 6)
  start.setUTCHours(0, 0, 0, 0)
  const weekKey = `${dateKey(start)}:${dateKey(end)}`

  return store.users.map((user) => {
    const inWeek = (item) => {
      const date = new Date(`${item.date}T00:00:00Z`)
      return date >= start && date <= end
    }
    const workouts = store.workouts.filter((item) => item.userId === user.id && inWeek(item) && item.completed)
    const meals = store.meals.filter((item) => item.userId === user.id && inWeek(item))
    const waterEntries = store.hydration.filter((item) => item.userId === user.id && inWeek(item))
    const waterAverage = waterEntries.length ? Math.round(waterEntries.reduce((sum, item) => sum + Number(item.amountMl || 0), 0) / waterEntries.length / 250) : 0
    const gamification = getGamification(user.id)
    return { userId: user.id, weekKey, workouts: workouts.length, meals: meals.length, waterAverage, streak: gamification.currentStreak, message: `Your week: ${workouts.length} workouts, ${meals.length} meals logged, ${gamification.currentStreak}-day streak. 🔥`, createdAt: new Date().toISOString() }
  })
}

export async function runWeeklyDigest(referenceDate = new Date()) {
  const digests = generateWeeklyDigest(referenceDate)
  let created = 0
  digests.forEach((digest) => {
    const alreadyExists = store.notifications.some((item) => item.userId === digest.userId && item.type === 'weekly_digest' && item.weekKey === digest.weekKey)
    if (alreadyExists) return
    store.notifications.unshift({ id: createId('notification'), userId: digest.userId, type: 'weekly_digest', weekKey: digest.weekKey, message: digest.message, details: digest, read: false, createdAt: digest.createdAt })
    created += 1
  })
  if (created) await persistStore()
  return { created, digests }
}

export function startWeeklyDigestScheduler() {
  cron.schedule('0 23 * * 0', () => { runWeeklyDigest().catch((error) => console.error('Weekly digest failed', error)) })
  console.log('Weekly digest scheduler enabled for Sunday at 23:00')
}
