import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/roleCheck.js'
import { currentUserFromRequest, createId, publicUser, store } from '../store.js'
import { getCoachResponse, getGeminiResponse, getMealSuggestion, getMealPlan, getWorkoutSuggestion, getFoodAnalysis } from '../services/aiService.js'
import { persistStore } from '../persistence.js'
import { calculateDefaultTargets } from '../utils/targets.js'
import { awardXp, getGamification, markWaterGoal, touchStreak } from '../services/gamification.js'
import { deleteAsset, isCloudinaryConfigured, uploadBuffer } from '../services/cloudinary.js'
import multer from 'multer'

const router = Router()
const protectedRouter = Router()
protectedRouter.use(requireAuth)
const today = () => new Date().toISOString().slice(0, 10)
const logActivity = (userId, type, detail) => store.userActivity.unshift({ id: createId('activity'), userId, type, detail, createdAt: new Date().toISOString() })
const award = (userId, title, description, xp) => { if (!store.achievements.some((item) => item.userId === userId && item.title === title)) store.achievements.unshift({ id: createId('achievement'), userId, title, description, xp, earnedAt: new Date().toISOString() }) }
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })
const projectForUser = (projectId, userId) => store.projects.find((project) => project.id === projectId && store.projectMembers.some((member) => member.projectId === projectId && member.userId === userId))
const publicProject = (project) => ({ ...project, members: store.projectMembers.filter((member) => member.projectId === project.id).map((member) => { const user = store.users.find((item) => item.id === member.userId); return { id: member.userId, name: user?.name || 'FitMate member', role: member.role } }), notes: store.projectNotes.filter((note) => note.projectId === project.id).map(({ authorId, ...note }) => note), files: store.projectFiles.filter((file) => file.projectId === project.id).map(({ content, ...file }) => file), analytics: { notes: store.projectNotes.filter((note) => note.projectId === project.id).length, files: store.projectFiles.filter((file) => file.projectId === project.id).length, contributions: store.projectActivity.filter((item) => item.projectId === project.id).length } })

router.get('/public/projects/:id', (req, res) => {
  const project = store.projects.find((item) => (item.id === req.params.id || item.shareToken === req.params.id) && item.isPublic)
  if (!project) return res.status(404).json({ message: 'Public project not found' })
  res.json({ project: publicProject(project) })
})

router.get('/exercises', (req, res) => {
  const query = req.query.search?.toLowerCase()
  const items = query ? store.exercises.filter((item) => `${item.name} ${item.category} ${item.muscleGroup}`.toLowerCase().includes(query)) : store.exercises
  res.json({ items })
})
router.get('/foods', (_req, res) => res.json({ items: store.foods }))
router.get('/admin/dashboard', requireAuth, requireRole('ADMIN'), (_req, res) => res.json({ users: store.users.length, exercises: store.exercises.length, foods: store.foods.length, meals: store.meals.length }))
router.get('/admin/users', requireAuth, requireRole('ADMIN'), (_req, res) => res.json({ items: store.users.map(({ passwordHash, ...user }) => user) }))
router.patch('/admin/users/:id/status', requireAuth, requireRole('ADMIN'), (req, res) => {
  const user = store.users.find((item) => item.id === req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  if (!['active', 'suspended'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid account status' })
  user.status = req.body.status; persistStore().catch(console.error)
  const { passwordHash, ...safeUser } = user
  res.json({ user: safeUser })
})
router.get('/admin/activity', requireAuth, requireRole('ADMIN'), (_req, res) => res.json({ items: store.userActivity.slice(0, 100) }))
router.get('/admin/ai-analytics', requireAuth, requireRole('ADMIN'), (_req, res) => res.json({ total: store.aiUsage.length, byType: store.aiUsage.reduce((result, item) => ({ ...result, [item.type]: (result[item.type] || 0) + 1 }), {}) }))
router.get('/admin/exercises', requireAuth, requireRole('ADMIN'), (_req, res) => res.json({ items: store.exercises }))
router.post('/admin/exercises', requireAuth, requireRole('ADMIN'), (req, res) => { const exercise = { id: createId('exercise'), ...req.body }; store.exercises.unshift(exercise); persistStore().catch(console.error); res.status(201).json({ exercise }) })
router.patch('/admin/exercises/:id', requireAuth, requireRole('ADMIN'), (req, res) => { const exercise = store.exercises.find((item) => item.id === req.params.id); if (!exercise) return res.status(404).json({ message: 'Exercise not found' }); Object.assign(exercise, req.body); persistStore().catch(console.error); res.json({ exercise }) })
router.delete('/admin/exercises/:id', requireAuth, requireRole('ADMIN'), (req, res) => { const index = store.exercises.findIndex((item) => item.id === req.params.id); if (index < 0) return res.status(404).json({ message: 'Exercise not found' }); store.exercises.splice(index, 1); persistStore().catch(console.error); res.json({ message: 'Exercise deleted' }) })
router.get('/admin/foods', requireAuth, requireRole('ADMIN'), (_req, res) => res.json({ items: store.foods }))
router.post('/admin/foods', requireAuth, requireRole('ADMIN'), (req, res) => { const food = { id: createId('food'), ...req.body }; store.foods.unshift(food); persistStore().catch(console.error); res.status(201).json({ food }) })
router.patch('/admin/foods/:id', requireAuth, requireRole('ADMIN'), (req, res) => { const food = store.foods.find((item) => item.id === req.params.id); if (!food) return res.status(404).json({ message: 'Food not found' }); Object.assign(food, req.body); persistStore().catch(console.error); res.json({ food }) })
router.delete('/admin/foods/:id', requireAuth, requireRole('ADMIN'), (req, res) => { const index = store.foods.findIndex((item) => item.id === req.params.id); if (index < 0) return res.status(404).json({ message: 'Food not found' }); store.foods.splice(index, 1); persistStore().catch(console.error); res.json({ message: 'Food deleted' }) })
router.get('/admin/workout-plans', requireAuth, requireRole('ADMIN'), (_req, res) => res.json({ items: store.workoutPlans }))
router.post('/admin/workout-plans', requireAuth, requireRole('ADMIN'), (req, res) => { const plan = { id: createId('plan'), title: req.body.title || 'Untitled plan', description: req.body.description || '', durationMinutes: Number(req.body.durationMinutes || 30), equipment: req.body.equipment || 'None', exercises: req.body.exercises || [] }; store.workoutPlans.unshift(plan); persistStore().catch(console.error); res.status(201).json({ plan }) })
router.delete('/admin/workout-plans/:id', requireAuth, requireRole('ADMIN'), (req, res) => { const index = store.workoutPlans.findIndex((item) => item.id === req.params.id); if (index < 0) return res.status(404).json({ message: 'Workout plan not found' }); store.workoutPlans.splice(index, 1); persistStore().catch(console.error); res.json({ message: 'Workout plan deleted' }) })
router.post('/admin/challenges', requireAuth, requireRole('ADMIN'), (req, res) => { const challenge = { id: createId('challenge'), ...req.body, status: req.body.status || 'active' }; store.challenges.unshift(challenge); persistStore().catch(console.error); res.status(201).json({ challenge }) })
router.patch('/admin/challenges/:id', requireAuth, requireRole('ADMIN'), (req, res) => { const challenge = store.challenges.find((item) => item.id === req.params.id); if (!challenge) return res.status(404).json({ message: 'Challenge not found' }); Object.assign(challenge, req.body); persistStore().catch(console.error); res.json({ challenge }) })
router.delete('/admin/challenges/:id', requireAuth, requireRole('ADMIN'), (req, res) => { const index = store.challenges.findIndex((item) => item.id === req.params.id); if (index < 0) return res.status(404).json({ message: 'Challenge not found' }); store.challenges.splice(index, 1); persistStore().catch(console.error); res.json({ message: 'Challenge deleted' }) })
router.get('/admin/announcements', requireAuth, requireRole('ADMIN'), (_req, res) => res.json({ items: store.announcements }))
router.post('/admin/announcements', requireAuth, requireRole('ADMIN'), (req, res) => { const announcement = { id: createId('announcement'), title: req.body.title || '', message: req.body.message || '', status: req.body.status || 'active', createdAt: new Date().toISOString() }; store.announcements.unshift(announcement); persistStore().catch(console.error); res.status(201).json({ announcement }) })
router.get('/admin/content', requireAuth, requireRole('ADMIN'), (_req, res) => res.json({ items: store.content || [] }))
router.post('/admin/content', requireAuth, requireRole('ADMIN'), (req, res) => { store.content ||= []; const item = { id: createId('content'), ...req.body, status: req.body.status || 'draft' }; store.content.unshift(item); persistStore().catch(console.error); res.status(201).json({ content: item }) })
protectedRouter.get('/users/profile', (req, res) => res.json({ user: publicUser(currentUserFromRequest(req)) }))
protectedRouter.get('/projects', (req, res) => res.json({ items: store.projects.filter((project) => projectForUser(project.id, req.user.id)).map(publicProject) }))
protectedRouter.post('/projects', (req, res) => {
  const project = { id: createId('project'), ownerId: req.user.id, name: String(req.body.name || 'My fitness project').slice(0, 100), description: String(req.body.description || '').slice(0, 500), isPublic: false, shareToken: createId('share'), createdAt: new Date().toISOString() }
  store.projects.unshift(project); store.projectMembers.push({ id: createId('member'), projectId: project.id, userId: req.user.id, role: 'owner', joinedAt: project.createdAt }); persistStore().catch(console.error)
  res.status(201).json({ project: publicProject(project) })
})
protectedRouter.patch('/projects/:id', (req, res) => {
  const project = projectForUser(req.params.id, req.user.id)
  if (!project) return res.status(404).json({ message: 'Project not found' })
  if (req.body.name !== undefined) project.name = String(req.body.name).slice(0, 100)
  if (req.body.description !== undefined) project.description = String(req.body.description).slice(0, 500)
  if (req.body.isPublic !== undefined) project.isPublic = Boolean(req.body.isPublic)
  persistStore().catch(console.error); res.json({ project: publicProject(project) })
})
protectedRouter.post('/projects/:id/members', (req, res) => {
  const project = projectForUser(req.params.id, req.user.id); const email = String(req.body.email || '').toLowerCase(); const user = store.users.find((item) => item.email === email)
  if (!project) return res.status(404).json({ message: 'Project not found' }); if (!user) return res.status(404).json({ message: 'A FitMate user with that email was not found' })
  if (!store.projectMembers.some((member) => member.projectId === project.id && member.userId === user.id)) store.projectMembers.push({ id: createId('member'), projectId: project.id, userId: user.id, role: 'editor', joinedAt: new Date().toISOString() })
  persistStore().catch(console.error); res.status(201).json({ project: publicProject(project) })
})
protectedRouter.get('/projects/:id/notes', (req, res) => { if (!projectForUser(req.params.id, req.user.id)) return res.status(404).json({ message: 'Project not found' }); res.json({ items: store.projectNotes.filter((note) => note.projectId === req.params.id) }) })
protectedRouter.post('/projects/:id/notes', (req, res) => { if (!projectForUser(req.params.id, req.user.id)) return res.status(404).json({ message: 'Project not found' }); const note = { id: createId('note'), projectId: req.params.id, authorId: req.user.id, title: String(req.body.title || 'Untitled note').slice(0, 120), content: String(req.body.content || '').slice(0, 20_000), updatedAt: new Date().toISOString() }; store.projectNotes.unshift(note); store.projectActivity.unshift({ id: createId('activity'), projectId: note.projectId, userId: req.user.id, type: 'note_created', createdAt: note.updatedAt }); persistStore().catch(console.error); res.status(201).json({ note }) })
protectedRouter.patch('/projects/:id/notes/:noteId', (req, res) => { const note = store.projectNotes.find((item) => item.id === req.params.noteId && item.projectId === req.params.id); if (!note || !projectForUser(req.params.id, req.user.id)) return res.status(404).json({ message: 'Note not found' }); Object.assign(note, { title: String(req.body.title ?? note.title).slice(0, 120), content: String(req.body.content ?? note.content).slice(0, 20_000), updatedAt: new Date().toISOString() }); persistStore().catch(console.error); res.json({ note }) })
protectedRouter.delete('/projects/:id/notes/:noteId', (req, res) => { const index = store.projectNotes.findIndex((item) => item.id === req.params.noteId && item.projectId === req.params.id); if (index < 0 || !projectForUser(req.params.id, req.user.id)) return res.status(404).json({ message: 'Note not found' }); store.projectNotes.splice(index, 1); persistStore().catch(console.error); res.json({ message: 'Note deleted' }) })
protectedRouter.post('/projects/:id/files', upload.single('file'), async (req, res, next) => { try { if (!projectForUser(req.params.id, req.user.id)) return res.status(404).json({ message: 'Project not found' }); if (!req.file) return res.status(400).json({ message: 'Choose a file first' }); if (!isCloudinaryConfigured()) return res.status(503).json({ message: 'Cloudinary storage is not configured' }); const isText = req.file.mimetype.startsWith('text/') || /\.(md|markdown|json|js|jsx|ts|tsx|css|html)$/i.test(req.file.originalname); const cloudAsset = await uploadBuffer(req.file.buffer, { folder: `fitmate/projects/${req.params.id}` }); const uploadedAt = new Date().toISOString(); const file = { id: createId('file'), projectId: req.params.id, ownerId: req.user.id, name: req.file.originalname, type: req.file.mimetype, size: req.file.size, preview: isText ? req.file.buffer.toString('utf8').slice(0, 100_000) : '', url: cloudAsset.secure_url, secureUrl: cloudAsset.secure_url, publicId: cloudAsset.public_id, resourceType: cloudAsset.resource_type, format: cloudAsset.format || '', uploadedAt }; store.projectFiles.unshift(file); store.files.unshift(file); store.projectActivity.unshift({ id: createId('activity'), projectId: file.projectId, userId: req.user.id, type: 'file_uploaded', createdAt: uploadedAt }); persistStore().catch(console.error); res.status(201).json({ file }) } catch (error) { next(error) } })
protectedRouter.get('/projects/:id/files', (req, res) => { if (!projectForUser(req.params.id, req.user.id)) return res.status(404).json({ message: 'Project not found' }); res.json({ items: store.projectFiles.filter((file) => file.projectId === req.params.id) }) })
protectedRouter.delete('/projects/:id/files/:fileId', async (req, res, next) => { try { const index = store.projectFiles.findIndex((file) => file.id === req.params.fileId && file.projectId === req.params.id); if (index < 0 || !projectForUser(req.params.id, req.user.id)) return res.status(404).json({ message: 'File not found' }); const file = store.projectFiles[index]; await deleteAsset(file.publicId, file.resourceType); store.projectFiles.splice(index, 1); store.files = store.files.filter((entry) => entry.id !== req.params.fileId); persistStore().catch(console.error); res.json({ message: 'File deleted' }) } catch (error) { next(error) } })
protectedRouter.get('/projects/:id/analytics', (req, res) => { const project = projectForUser(req.params.id, req.user.id); if (!project) return res.status(404).json({ message: 'Project not found' }); const contributions = store.projectActivity.filter((item) => item.projectId === project.id); res.json({ analytics: { notes: store.projectNotes.filter((item) => item.projectId === project.id).length, files: store.projectFiles.filter((item) => item.projectId === project.id).length, contributions: contributions.length, byMember: contributions.reduce((result, item) => ({ ...result, [item.userId]: (result[item.userId] || 0) + 1 }), {}) } }) })
protectedRouter.patch('/users/profile', (req, res) => {
  const user = currentUserFromRequest(req)
  const allowed = ['name', 'age', 'height', 'weight', 'activityLevel', 'fitnessGoal', 'dietPreference', 'exerciseExperience', 'availableEquipment', 'preferredWorkoutDuration', 'onboardingComplete']
  allowed.forEach((key) => { if (req.body[key] !== undefined) user[key] = req.body[key] })
  const targetFieldsChanged = ['fitnessGoal', 'activityLevel', 'age', 'height', 'weight'].some((key) => req.body[key] !== undefined)
  if (req.body.targets) user.targets = { ...user.targets, ...req.body.targets, source: 'user-adjusted', updatedAt: new Date().toISOString() }
  if (targetFieldsChanged || (req.body.onboardingComplete && !user.targets)) user.targets = calculateDefaultTargets(user)
  persistStore().catch(console.error)
  res.json({ user: publicUser(user) })
})
protectedRouter.get('/meals', (req, res) => res.json({ items: store.meals.filter((item) => item.userId === req.user.id) }))
protectedRouter.post('/uploads/images', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Choose an image first' })
    if (!isCloudinaryConfigured()) return res.status(503).json({ message: 'Cloudinary storage is not configured' })
    const asset = await uploadBuffer(req.file.buffer, { folder: `fitmate/uploads/${req.user.id}` })
    res.status(201).json({ url: asset.secure_url, publicId: asset.public_id, resourceType: asset.resource_type, name: req.file.originalname })
  } catch (error) { next(error) }
})
protectedRouter.post('/meals', (req, res) => {
  const meal = { id: createId('meal'), userId: req.user.id, date: req.body.date || new Date().toISOString().slice(0, 10), items: req.body.items || [], estimatedCalories: Number(req.body.estimatedCalories || 0), source: req.body.source || 'manual' }
  store.meals.unshift(meal)
  awardXp(req.user.id, 'mealLogged', meal.date, meal.id)
  award(req.user.id, 'Meal Logger', 'You logged your first meal.', 10); logActivity(req.user.id, 'meal_logged', meal.items.join(', '))
  persistStore().catch(console.error)
  res.status(201).json({ meal })
})
protectedRouter.post('/meals/log-text', async (req, res, next) => {
  try {
    const text = typeof req.body.text === 'string' ? req.body.text.trim().slice(0, 2000) : ''
    if (!text) return res.status(400).json({ message: 'Tell us what you ate first' })
    const analysis = await getFoodAnalysis({ description: text, availableFoods: store.foods.map((food) => food.name) })
    const meal = { id: createId('meal'), userId: req.user.id, date: today(), items: analysis.items || [], estimatedCalories: Number(analysis.totals?.calories || 0), estimatedNutrition: analysis.totals || {}, source: 'AI' }
    store.meals.unshift(meal); award(req.user.id, 'Meal Logger', 'You logged a meal with FitMate.', 10); awardXp(req.user.id, 'mealLogged', meal.date, meal.id); logActivity(req.user.id, 'meal_logged', text); persistStore().catch(console.error)
    res.status(201).json({ meal, analysis })
  } catch (error) { next(error) }
})
protectedRouter.post('/meals/log-image', upload.single('image'), async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) return res.status(503).json({ message: 'Cloudinary storage is not configured' })
    const suppliedImageData = typeof req.body.imageData === 'string' ? req.body.imageData : ''
    const description = typeof req.body.description === 'string' ? req.body.description.trim().slice(0, 2000) : ''
    const imageData = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : suppliedImageData
    if (!imageData) return res.status(400).json({ message: 'Upload a food image first' })
    if (imageData.length > 1_200_000) return res.status(413).json({ message: 'Food image is too large. Please choose an image under 900 KB.' })
    const imageBuffer = req.file?.buffer || Buffer.from(imageData.split(',')[1] || '', 'base64')
    const imageType = req.file?.mimetype || imageData.match(/^data:([^;]+);/)?.[1] || 'image/jpeg'
    const cloudAsset = await uploadBuffer(imageBuffer, { folder: `fitmate/meals/${req.user.id}`, resource_type: 'image' })
    const analysis = await getFoodAnalysis({ description, imageData, availableFoods: store.foods.map((food) => food.name) })
    const meal = { id: createId('meal'), userId: req.user.id, date: today(), items: analysis.items || [], estimatedCalories: Number(analysis.totals?.calories || 0), estimatedNutrition: analysis.totals || {}, source: 'image', imageUrl: cloudAsset.secure_url, imageName: req.file?.originalname || 'uploaded-meal-image', imageMimeType: imageType, imagePublicId: cloudAsset.public_id, imageResourceType: cloudAsset.resource_type }
    store.meals.unshift(meal); award(req.user.id, 'Meal Logger', 'You logged a meal with FitMate.', 10); awardXp(req.user.id, 'mealLogged', meal.date, meal.id); logActivity(req.user.id, 'meal_logged_from_image', 'Food image analyzed'); persistStore().catch(console.error)
    res.status(201).json({ meal, analysis: { ...analysis, imageWarning: true, imageUrl: meal.imageUrl } })
  } catch (error) { next(error) }
})
protectedRouter.get('/workouts', (req, res) => res.json({ items: store.workouts.filter((item) => item.userId === req.user.id) }))
protectedRouter.post('/workouts', (req, res) => {
  const workout = { id: createId('workout'), userId: req.user.id, date: new Date().toISOString().slice(0, 10), title: req.body.title || 'My workout', exercises: req.body.exercises || [], durationMinutes: Number(req.body.durationMinutes || 0), completed: false }
  store.workouts.unshift(workout)
  persistStore().catch(console.error)
  res.status(201).json({ workout })
})
protectedRouter.patch('/workouts/:id', (req, res) => {
  const workout = store.workouts.find((item) => item.id === req.params.id && item.userId === req.user.id)
  if (!workout) return res.status(404).json({ message: 'Workout not found' })
  const wasCompleted = workout.completed
  Object.assign(workout, { ...req.body, completed: Boolean(req.body.completed) })
  if (workout.completed && !wasCompleted) { award(req.user.id, 'Workout Starter', 'You completed a workout.', 20); awardXp(req.user.id, 'workoutCompleted', workout.date, workout.id); logActivity(req.user.id, 'workout_completed', workout.title) }
  persistStore().catch(console.error)
  res.json({ workout })
})
protectedRouter.get('/progress', (req, res) => res.json({ items: store.progress.filter((item) => item.userId === req.user.id) }))
protectedRouter.post('/progress', (req, res) => {
  const entry = { id: createId('progress'), userId: req.user.id, date: req.body.date || new Date().toISOString().slice(0, 10), weight: Number(req.body.weight || 0), steps: Number(req.body.steps || 0), waterGlasses: Number(req.body.waterGlasses || 0), sleepHours: Number(req.body.sleepHours || 0), workoutMinutes: Number(req.body.workoutMinutes || 0) }
  store.progress.unshift(entry)
  persistStore().catch(console.error)
  res.status(201).json({ progress: entry })
})
protectedRouter.get('/hydration', (req, res) => res.json({ items: store.hydration.filter((item) => item.userId === req.user.id).sort((a, b) => b.date.localeCompare(a.date)) }))
protectedRouter.post('/hydration', (req, res) => {
  const entry = { id: createId('hydration'), userId: req.user.id, date: req.body.date || today(), goalMl: Math.max(250, Number(req.body.goalMl || 2000)), amountMl: Math.max(0, Number(req.body.amountMl || 0)) }
  store.hydration.unshift(entry); logActivity(req.user.id, 'hydration_logged', `${entry.amountMl} ml`); persistStore().catch(console.error)
  if (entry.amountMl >= entry.goalMl) { award(req.user.id, 'Hydration Hero', 'You reached your water goal.', 10); markWaterGoal(req.user.id) }
  res.status(201).json({ hydration: entry })
})
protectedRouter.patch('/hydration/:id', (req, res) => {
  const entry = store.hydration.find((item) => item.id === req.params.id && item.userId === req.user.id)
  if (!entry) return res.status(404).json({ message: 'Hydration entry not found' })
  if (req.body.amountMl !== undefined) entry.amountMl = Math.max(0, Number(req.body.amountMl))
  if (req.body.goalMl !== undefined) entry.goalMl = Math.max(250, Number(req.body.goalMl))
  persistStore().catch(console.error); res.json({ hydration: entry })
})
protectedRouter.get('/sleep', (req, res) => res.json({ items: store.sleep.filter((item) => item.userId === req.user.id).sort((a, b) => b.date.localeCompare(a.date)) }))
protectedRouter.post('/sleep', (req, res) => {
  const entry = { id: createId('sleep'), userId: req.user.id, date: req.body.date || today(), bedtime: req.body.bedtime || '', wakeTime: req.body.wakeTime || '', totalHours: Math.max(0, Number(req.body.totalHours || 0)), quality: req.body.quality || 'Okay', notes: req.body.notes || '' }
  store.sleep.unshift(entry); logActivity(req.user.id, 'sleep_logged', `${entry.totalHours} hours`); persistStore().catch(console.error)
  res.status(201).json({ sleep: entry })
})
protectedRouter.get('/wellness/check-ins', (req, res) => res.json({ items: store.wellnessCheckIns.filter((item) => item.userId === req.user.id).sort((a, b) => b.date.localeCompare(a.date)) }))
protectedRouter.post('/wellness/check-ins', (req, res) => {
  const scale = (value) => Math.min(5, Math.max(1, Number(value || 3)))
  const energy = scale(req.body.energy); const mood = scale(req.body.mood); const stress = scale(req.body.stress); const sleepQuality = scale(req.body.sleepQuality)
  const summary = energy <= 2 && stress >= 4 ? 'Consider a lighter activity today or some extra rest.' : sleepQuality <= 2 ? 'Consider a gentle routine today and make space for recovery.' : mood <= 2 ? 'Choose one small supportive habit and keep today manageable.' : 'You have a useful snapshot of today. Keep one small habit moving forward.'
  const entry = { id: createId('checkin'), userId: req.user.id, date: req.body.date || today(), energy, mood, stress, sleepQuality, activityLevel: scale(req.body.activityLevel), summary }
  store.wellnessCheckIns.unshift(entry); logActivity(req.user.id, 'wellness_check_in', 'Daily check-in completed'); persistStore().catch(console.error)
  award(req.user.id, 'Daily Check-in', 'You paused to notice how you are doing.', 10)
  touchStreak(req.user.id, entry.date)
  if (entry.energy >= 3 && entry.mood >= 3 && entry.stress <= 3 && entry.sleepQuality >= 3) awardXp(req.user.id, 'dailyGoalCompleted', entry.date)
  res.status(201).json({ checkIn: entry })
})
protectedRouter.get('/challenges', (req, res) => {
  const joined = store.challengeParticipants.filter((item) => item.userId === req.user.id)
  res.json({ items: store.challenges.map((challenge) => ({ ...challenge, participant: joined.find((item) => item.challengeId === challenge.id) || null })) })
})
protectedRouter.post('/challenges/:id/join', (req, res) => {
  const challenge = store.challenges.find((item) => item.id === req.params.id && item.status === 'active')
  if (!challenge) return res.status(404).json({ message: 'Active challenge not found' })
  let participant = store.challengeParticipants.find((item) => item.challengeId === challenge.id && item.userId === req.user.id)
  if (!participant) { participant = { id: createId('participant'), challengeId: challenge.id, userId: req.user.id, progress: 0, joinedAt: new Date().toISOString() }; store.challengeParticipants.push(participant); logActivity(req.user.id, 'challenge_joined', challenge.title); persistStore().catch(console.error) }
  res.status(201).json({ participant })
})
protectedRouter.get('/achievements', (req, res) => res.json({ items: store.achievements.filter((item) => item.userId === req.user.id) }))
protectedRouter.get('/gamification', (req, res) => res.json({ gamification: getGamification(req.user.id) }))
protectedRouter.get('/progress/journey', (req, res) => {
  const weekCount = Math.min(12, Math.max(1, Number(req.query.weeks) || 4))
  const startOfWeek = (date) => {
    const value = new Date(date)
    const day = value.getUTCDay()
    value.setUTCDate(value.getUTCDate() - (day === 0 ? 6 : day - 1))
    value.setUTCHours(0, 0, 0, 0)
    return value
  }
  const currentWeek = startOfWeek(new Date())
  const weeks = Array.from({ length: weekCount }, (_, index) => {
    const start = new Date(currentWeek)
    start.setUTCDate(start.getUTCDate() - ((weekCount - index - 1) * 7))
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 7)
    const inWeek = (item) => { const date = new Date(`${item.date}T00:00:00Z`); return date >= start && date < end }
    return { start, workouts: store.workouts.filter((item) => item.userId === req.user.id && inWeek(item)), meals: store.meals.filter((item) => item.userId === req.user.id && inWeek(item)) }
  })
  const story = weeks.map((week, index) => {
    const workoutCount = week.workouts.length
    const mealCount = week.meals.length
    const previous = weeks[index - 1]
    const previousTotal = previous ? previous.workouts.length + previous.meals.length : 0
    const total = workoutCount + mealCount
    const takeaway = !previous ? (total ? 'A strong starting point — keep building your rhythm.' : 'A fresh week to begin one small habit.') : total > previousTotal ? '🏆 Consistency improved!' : total < previousTotal ? 'A quieter week — keep your next step small and steady.' : 'Solid week — same pace as last week.'
    return { weekLabel: `Week of ${week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, workoutCount, mealCount, takeaway }
  })
  res.json({ weeks: story })
})
protectedRouter.get('/progress/summary', (req, res) => {
  const range = [7, 30, 90].includes(Number(req.query.range)) ? Number(req.query.range) : 7
  const cutoff = Date.now() - range * 86400000
  const workouts = store.workouts.filter((item) => item.userId === req.user.id && new Date(item.date).getTime() >= cutoff)
  const meals = store.meals.filter((item) => item.userId === req.user.id && new Date(item.date).getTime() >= cutoff)
  const hydration = store.hydration.filter((item) => item.userId === req.user.id && new Date(item.date).getTime() >= cutoff)
  const sleep = store.sleep.filter((item) => item.userId === req.user.id && new Date(item.date).getTime() >= cutoff)
  res.json({ range, totals: { workouts: workouts.length, completedWorkouts: workouts.filter((item) => item.completed).length, meals: meals.length, activeMinutes: workouts.reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0), waterMl: hydration.reduce((sum, item) => sum + Number(item.amountMl || 0), 0), averageSleep: sleep.length ? Number((sleep.reduce((sum, item) => sum + Number(item.totalHours || 0), 0) / sleep.length).toFixed(1)) : 0 }, trends: { workouts, hydration, sleep } })
})
protectedRouter.get('/notifications', (req, res) => res.json({ items: store.notifications.filter((item) => item.userId === req.user.id || !item.userId) }))
protectedRouter.patch('/notifications/:id/read', (req, res) => {
  const notification = store.notifications.find((item) => item.id === req.params.id && (item.userId === req.user.id || !item.userId))
  if (!notification) return res.status(404).json({ message: 'Notification not found' })
  notification.read = true; persistStore().catch(console.error); res.json({ notification })
})
protectedRouter.post('/notifications/read-all', (req, res) => {
  store.notifications.filter((item) => item.userId === req.user.id || !item.userId).forEach((item) => { item.read = true })
  persistStore().catch(console.error); res.json({ message: 'Notifications marked as read' })
})
protectedRouter.get('/services', (req, res) => res.json({ items: store.services.filter((item) => item.userId === req.user.id) }))
protectedRouter.post('/ai/explain-note', async (req, res, next) => {
  try { const user = currentUserFromRequest(req); res.json(await getCoachResponse({ message: `${req.body.action === 'improve' ? 'Suggest improvements for' : 'Explain'} this Markdown note:\n${req.body.note}`, profile: { fitnessGoal: user?.fitnessGoal, dietPreference: user?.dietPreference } })) } catch (error) { next(error) }
})
protectedRouter.post('/ai/gemini', async (req, res, next) => {
  try {
    if (typeof req.body.message !== 'string' || !req.body.message.trim() || req.body.message.length > 4000) return res.status(400).json({ message: 'Message must be between 1 and 4000 characters' })
    const user = currentUserFromRequest(req)
    const result = await getGeminiResponse({ message: req.body.message, context: { profile: { fitnessGoal: user?.fitnessGoal, dietPreference: user?.dietPreference }, activity: { latestProgress: store.progress.find((item) => item.userId === req.user.id) } } })
    store.aiUsage.push({ id: createId('ai'), userId: req.user.id, type: 'gemini_request', createdAt: new Date().toISOString() })
    res.json(result)
  } catch (error) { next(error) }
})
protectedRouter.post('/services', (req, res) => {
  const service = { id: createId('service'), userId: req.user.id, type: req.body.type || 'General support', title: req.body.title || 'Support request', description: req.body.description || '', preferredDate: req.body.preferredDate || '', status: 'pending', notes: [] }
  store.services.unshift(service)
  logActivity(req.user.id, 'service_requested', service.title)
  persistStore().catch(console.error)
  res.status(201).json({ service })
})
protectedRouter.post('/ai/meal-suggestion', async (req, res, next) => {
  try {
    const user = currentUserFromRequest(req)
    const profile = { fitnessGoal: user?.fitnessGoal, dietPreference: user?.dietPreference, exerciseExperience: user?.exerciseExperience }
    res.json(await getMealSuggestion({ profile, availableFoods: req.body.availableFoods || store.foods }))
  } catch (error) { next(error) }
})
protectedRouter.post('/ai/food-analyze', async (req, res, next) => {
  try {
    const description = typeof req.body.description === 'string' ? req.body.description.trim().slice(0, 2000) : ''
    const imageData = typeof req.body.imageData === 'string' ? req.body.imageData : ''
    if (!description && !imageData) return res.status(400).json({ message: 'Describe your meal or upload a food image' })
    if (imageData && imageData.length > 1_200_000) return res.status(413).json({ message: 'Food image is too large. Please choose an image under 900 KB.' })
    const result = await getFoodAnalysis({ description, imageData, availableFoods: store.foods.map((food) => food.name) })
    store.aiUsage.push({ id: createId('ai'), userId: req.user.id, type: 'food_analysis', createdAt: new Date().toISOString() })
    res.json(result)
  } catch (error) { next(error) }
})
protectedRouter.post('/ai/workout-generator', async (req, res, next) => {
  try { const user = currentUserFromRequest(req); const result = await getWorkoutSuggestion({ profile: user, preferences: req.body }); store.aiUsage.push({ id: createId('ai'), userId: req.user.id, type: 'workout_suggestion', createdAt: new Date().toISOString() }); res.json(result) } catch (error) { next(error) }
})
protectedRouter.post('/ai/meal-plan', async (req, res, next) => {
  try { const user = currentUserFromRequest(req); const result = await getMealPlan({ profile: user, days: req.body.days, mealType: req.body.mealType }); store.aiUsage.push({ id: createId('ai'), userId: req.user.id, type: 'meal_plan', createdAt: new Date().toISOString() }); res.json(result) } catch (error) { next(error) }
})
protectedRouter.post('/ai/chat', async (req, res, next) => {
  try {
    const user = currentUserFromRequest(req)
    if (typeof req.body.message !== 'string' || !req.body.message.trim() || req.body.message.length > 2000) return res.status(400).json({ message: 'Message must be between 1 and 2000 characters' })
    const userId = req.user.id
    const activity = {
      availableFoods: store.foods.slice(0, 20).map((food) => food.name),
      recentMeals: store.meals.filter((item) => item.userId === userId).slice(0, 5).map((item) => ({ date: item.date, items: item.items, estimatedCalories: item.estimatedCalories })),
      recentWorkouts: store.workouts.filter((item) => item.userId === userId).slice(0, 5).map((item) => ({ date: item.date, title: item.title, durationMinutes: item.durationMinutes, completed: item.completed })),
      latestHydration: store.hydration.find((item) => item.userId === userId),
      latestSleep: store.sleep.find((item) => item.userId === userId),
      latestProgress: store.progress.find((item) => item.userId === userId),
    }
    const result = await getCoachResponse({ message: req.body.message, profile: user, activity })
    store.aiUsage.push({ id: createId('ai'), userId, type: 'coach_question', createdAt: new Date().toISOString() })
    res.json(result)
  } catch (error) { next(error) }
})

router.use(protectedRouter)
export default router
