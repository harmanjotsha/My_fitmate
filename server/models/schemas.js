import mongoose from 'mongoose'

const { Schema } = mongoose

export const User = mongoose.model('User', new Schema({
  name: String, email: { type: String, unique: true }, passwordHash: String, age: Number, height: Number, weight: Number,
  activityLevel: String, fitnessGoal: String, dietPreference: String, exerciseExperience: String,
  role: { type: String, enum: ['USER', 'ADMIN', 'TRAINER'], default: 'USER' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  targets: { calories: Number, waterGlasses: Number, stepCount: Number, workoutMinutes: Number, source: String, updatedAt: Date },
}, { timestamps: true }))

export const Exercise = mongoose.model('Exercise', new Schema({ name: String, category: String, difficulty: String, muscleGroup: String, equipment: String, durationMinutes: Number, videoUrl: String, instructions: [String], safetyNotes: String }))
export const Food = mongoose.model('Food', new Schema({ name: String, category: String, servingSize: String, caloriesApprox: Number, proteinApprox: Number, carbsApprox: Number, fatApprox: Number }))
export const Meal = mongoose.model('Meal', new Schema({ userId: Schema.Types.ObjectId, date: Date, items: [Schema.Types.Mixed], estimatedCalories: Number, source: { type: String, enum: ['manual', 'AI', 'image'] } }))
export const Workout = mongoose.model('Workout', new Schema({ userId: Schema.Types.ObjectId, date: Date, exercises: [Schema.Types.Mixed], durationMinutes: Number, completed: Boolean }))
export const Progress = mongoose.model('Progress', new Schema({ userId: Schema.Types.ObjectId, date: Date, weight: Number, steps: Number, waterGlasses: Number, sleepHours: Number, workoutMinutes: Number }))
export const Hydration = mongoose.model('Hydration', new Schema({ userId: Schema.Types.ObjectId, date: Date, goalMl: Number, amountMl: Number }))
export const Sleep = mongoose.model('Sleep', new Schema({ userId: Schema.Types.ObjectId, date: Date, bedtime: String, wakeTime: String, totalHours: Number, quality: String, notes: String }))
export const WellnessCheckIn = mongoose.model('WellnessCheckIn', new Schema({ userId: Schema.Types.ObjectId, date: Date, energy: Number, mood: Number, stress: Number, sleepQuality: Number, activityLevel: Number, summary: String }))
export const Challenge = mongoose.model('Challenge', new Schema({ title: String, description: String, durationDays: Number, goal: String, startDate: Date, endDate: Date, status: String, rules: [String] }))
export const ChallengeParticipant = mongoose.model('ChallengeParticipant', new Schema({ challengeId: Schema.Types.ObjectId, userId: Schema.Types.ObjectId, progress: Number, joinedAt: Date }))
export const Achievement = mongoose.model('Achievement', new Schema({ userId: Schema.Types.ObjectId, title: String, description: String, earnedAt: Date, xp: Number }))
export const Gamification = mongoose.model('Gamification', new Schema({ userId: Schema.Types.ObjectId, currentStreak: Number, longestStreak: Number, totalXp: Number, lastActiveDate: String, waterGoalHit: Boolean, earnedBadges: [Schema.Types.Mixed], xpEvents: [String] }, { timestamps: true }))
export const AiChat = mongoose.model('AiChat', new Schema({ userId: Schema.Types.ObjectId, message: String, response: String }, { timestamps: true }))
export const ServiceRequest = mongoose.model('ServiceRequest', new Schema({ userId: Schema.Types.ObjectId, type: String, description: String, status: { type: String, enum: ['pending', 'assigned', 'resolved'], default: 'pending' }, assignedTo: Schema.Types.ObjectId, notes: [String] }))
export const Announcement = mongoose.model('Announcement', new Schema({ title: String, body: String, createdBy: Schema.Types.ObjectId }, { timestamps: true }))
export const Badge = mongoose.model('Badge', new Schema({ userId: Schema.Types.ObjectId, badgeName: String, earnedAt: Date }))
export const Notification = mongoose.model('Notification', new Schema({ userId: Schema.Types.ObjectId, message: String, read: Boolean }, { timestamps: true }))
