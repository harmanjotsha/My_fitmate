import mongoose from 'mongoose'
import { store } from './store.js'

const stateSchema = new mongoose.Schema({ key: { type: String, unique: true }, data: mongoose.Schema.Types.Mixed }, { timestamps: true })
const State = mongoose.models.FitmateState || mongoose.model('FitmateState', stateSchema)
let connected = false

export async function connectPersistence() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI
  if (!mongoUrl) return false
  try {
    await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 5000 })
    const snapshot = await State.findOne({ key: 'store' }).lean()
    if (snapshot?.data) Object.keys(store).forEach((key) => { if (snapshot.data[key]) store[key] = snapshot.data[key] })
    connected = true
    console.log('FitMate MongoDB persistence enabled')
    return true
  } catch (error) {
    console.warn(`MongoDB unavailable; using in-memory store. ${error.message}`)
    return false
  }
}

export async function persistStore() {
  if (!connected) return
  await State.findOneAndUpdate({ key: 'store' }, { key: 'store', data: store }, { upsert: true, setDefaultsOnInsert: true })
}
