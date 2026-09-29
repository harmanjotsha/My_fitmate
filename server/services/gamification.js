import { createId, store } from '../store.js'

export const XP_RULES = Object.freeze({ workoutCompleted: 20, waterGoalHit: 10, mealLogged: 10, dailyGoalCompleted: 30 })

export const BADGES = Object.freeze([
  { key: 'first-workout', title: 'First Workout', icon: '🏋️', description: 'Complete your first workout.' },
  { key: 'seven-day-streak', title: '7-Day Streak', icon: '🔥', description: 'Show up for seven days in a row.' },
  { key: 'ten-workouts', title: '10 Workouts', icon: '💪', description: 'Complete ten workouts.' },
  { key: 'hydration-hero', title: 'Hydration Hero', icon: '💧', description: 'Hit your water goal.' },
  { key: 'consistency-champion', title: 'Consistency Champion', icon: '🏆', description: 'Complete seven daily check-ins.' },
])

function getRecord(userId) {
  let record = store.gamification.find((item) => item.userId === userId)
  if (!record) {
    record = { id: createId('gamification'), userId, currentStreak: 0, longestStreak: 0, totalXp: 0, earnedBadges: [], xpEvents: [], updatedAt: new Date().toISOString() }
    store.gamification.push(record)
  }
  return record
}

function unlock(record, key) {
  if (record.earnedBadges.some((badge) => badge.key === key)) return null
  const badge = BADGES.find((item) => item.key === key)
  if (!badge) return null
  const earned = { ...badge, earnedAt: new Date().toISOString() }
  record.earnedBadges.push(earned)
  return earned
}

function refreshBadges(record) {
  const userId = record.userId
  const completedWorkouts = store.workouts.filter((item) => item.userId === userId && item.completed).length
  const checkIns = store.wellnessCheckIns.filter((item) => item.userId === userId).length
  const unlocked = []
  if (completedWorkouts >= 1) { const badge = unlock(record, 'first-workout'); if (badge) unlocked.push(badge) }
  if (record.currentStreak >= 7) { const badge = unlock(record, 'seven-day-streak'); if (badge) unlocked.push(badge) }
  if (completedWorkouts >= 10) { const badge = unlock(record, 'ten-workouts'); if (badge) unlocked.push(badge) }
  if (record.waterGoalHit) { const badge = unlock(record, 'hydration-hero'); if (badge) unlocked.push(badge) }
  if (checkIns >= 7) { const badge = unlock(record, 'consistency-champion'); if (badge) unlocked.push(badge) }
  return unlocked
}

export function touchStreak(userId, date = new Date().toISOString().slice(0, 10)) {
  const record = getRecord(userId)
  if (record.lastActiveDate === date) return record
  const previous = record.lastActiveDate ? new Date(`${record.lastActiveDate}T00:00:00Z`) : null
  const current = new Date(`${date}T00:00:00Z`)
  const difference = previous ? Math.round((current - previous) / 86400000) : 0
  record.currentStreak = difference === 1 ? record.currentStreak + 1 : 1
  record.longestStreak = Math.max(record.longestStreak, record.currentStreak)
  record.lastActiveDate = date
  record.updatedAt = new Date().toISOString()
  refreshBadges(record)
  return record
}

export function awardXp(userId, rule, date = new Date().toISOString().slice(0, 10), eventId = '') {
  const amount = XP_RULES[rule]
  if (!amount) return { record: getRecord(userId), unlocked: [] }
  const record = getRecord(userId)
  const eventKey = `${rule}:${date}:${eventId}`
  if (!record.xpEvents.includes(eventKey)) {
    record.xpEvents.push(eventKey)
    record.totalXp += amount
  }
  touchStreak(userId, date)
  const unlocked = refreshBadges(record)
  return { record, unlocked }
}

export function markWaterGoal(userId) {
  const record = getRecord(userId)
  record.waterGoalHit = true
  const result = awardXp(userId, 'waterGoalHit')
  const badge = refreshBadges(record)
  return { record: result.record, unlocked: [...result.unlocked, ...badge] }
}

export function getGamification(userId) {
  const record = getRecord(userId)
  return { ...record, badges: BADGES.map((badge) => ({ ...badge, earned: record.earnedBadges.find((earned) => earned.key === badge.key) || null })) }
}
