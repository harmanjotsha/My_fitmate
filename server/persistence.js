import mongoose from 'mongoose'
import { store } from './store.js'

const stateSchema = new mongoose.Schema({ key: { type: String, unique: true }, data: mongoose.Schema.Types.Mixed }, { timestamps: true })
const State = mongoose.models.FitmateState || mongoose.model('FitmateState', stateSchema)
let connected = false

function removeDevelopmentFixtures() {
  const demoUserIds = new Set(['user-jamie', 'user-admin'])
  const demoProjectIds = new Set(store.projects.filter((project) => demoUserIds.has(project.ownerId)).map((project) => project.id))

  store.users = store.users.filter((user) => !demoUserIds.has(user.id) && !['jamie@example.com', 'admin@fitmate.com'].includes(user.email))
  for (const key of ['meals', 'workouts', 'progress', 'hydration', 'sleep', 'wellnessCheckIns', 'challengeParticipants', 'achievements', 'gamification', 'userActivity', 'services', 'files', 'notifications']) {
    store[key] = store[key].filter((item) => !demoUserIds.has(item.userId) && item.id !== 'notification-1')
  }
  store.projects = store.projects.filter((project) => !demoProjectIds.has(project.id))
  store.projectMembers = store.projectMembers.filter((member) => !demoUserIds.has(member.userId) && !demoProjectIds.has(member.projectId))
  store.projectNotes = store.projectNotes.filter((note) => !demoProjectIds.has(note.projectId))
  store.projectFiles = store.projectFiles.filter((file) => !demoProjectIds.has(file.projectId))
  store.projectActivity = store.projectActivity.filter((activity) => !demoProjectIds.has(activity.projectId))
}

export async function connectPersistence() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI
  if (!mongoUrl) {
    if (process.env.NODE_ENV === 'production') throw new Error('MONGO_URL or MONGODB_URI is required in production')
    return false
  }
  try {
    await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 5000 })
    const snapshot = await State.findOne({ key: 'store' }).lean()
    if (snapshot?.data) Object.keys(store).forEach((key) => { if (snapshot.data[key]) store[key] = snapshot.data[key] })
    if (process.env.NODE_ENV === 'production') removeDevelopmentFixtures()
    connected = true
    if (process.env.NODE_ENV === 'production') await persistStore()
    console.log('FitMate MongoDB persistence enabled')
    return true
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error
    console.warn(`MongoDB unavailable; using in-memory store. ${error.message}`)
    return false
  }
}

export async function persistStore() {
  if (!connected) return
  await State.findOneAndUpdate({ key: 'store' }, { key: 'store', data: store }, { upsert: true, setDefaultsOnInsert: true })
}

export function getPersistenceStatus() {
  if (connected && mongoose.connection.readyState === 1) return 'mongodb'
  return process.env.NODE_ENV === 'production' ? 'unavailable' : 'memory (development only)'
}
