const DISCLAIMER = 'This is general wellness information, not medical advice.'
const GROQ_TEXT_API_KEY = process.env.GROQ_API_KEY
const GROQ_VISION_API_KEY = process.env.GROQ_API_TWO || process.env.GROQ_API_KEY
const AI_API_KEY = GROQ_TEXT_API_KEY || process.env.OPENAI_API_KEY
const AI_ENDPOINT = GROQ_TEXT_API_KEY
  ? 'https://api.groq.com/openai/v1/chat/completions'
  : 'https://api.openai.com/v1/chat/completions'
const AI_MODEL = GROQ_TEXT_API_KEY
  ? (process.env.GROQ_MODEL || 'openai/gpt-oss-120b')
  : (process.env.OPENAI_MODEL || 'gpt-4o-mini')
const AI_VISION_MODEL = process.env.GROQ_VISION_MODEL || (process.env.OPENAI_API_KEY ? (process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini') : '')

export async function getMealSuggestion({ profile, availableFoods = [] }) {
  if (AI_API_KEY) {
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: 0.5,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `Return JSON with breakfast, lunch, snack, dinner, and disclaimer. Give general wellness meal ideas only, never diagnosis or treatment. Mark estimates approximate. Always include exactly this disclaimer: ${DISCLAIMER}` },
          { role: 'user', content: JSON.stringify({ goal: profile?.fitnessGoal, dietPreference: profile?.dietPreference, experience: profile?.exerciseExperience, availableFoods: availableFoods.map((food) => typeof food === 'string' ? food : food.name).slice(0, 30) }) },
        ],
      }),
    })
    if (!response.ok) throw new Error('The AI provider could not complete this suggestion')
    const payload = await response.json()
    return { ...JSON.parse(payload.choices?.[0]?.message?.content || '{}'), disclaimer: DISCLAIMER }
  }

  // Local fallback keeps the product usable when no provider key is configured.
  return {
    breakfast: 'Greek yogurt, berries, and oats',
    lunch: 'A grain bowl with greens, beans, and roasted vegetables',
    snack: 'Fruit with a small handful of nuts',
    dinner: 'A balanced plate with lean protein, vegetables, and rice',
    context: { goal: profile?.fitnessGoal, dietPreference: profile?.dietPreference, availableFoods: availableFoods.length },
    disclaimer: DISCLAIMER,
  }
}

export async function getFoodAnalysis({ description = '', imageData = '', availableFoods = [] }) {
  const imageWarning = Boolean(imageData)
  const fallbackAnalysis = () => {
    const known = [
      { match: /roti|chapati/i, name: 'Roti', quantity: '1 piece', calories: 110, protein: 3, carbs: 22, fat: 1 },
      { match: /dal|lentil/i, name: 'Dal', quantity: '1 bowl', calories: 180, protein: 10, carbs: 28, fat: 3 },
      { match: /curd|yogurt/i, name: 'Curd / yogurt', quantity: '1 serving', calories: 100, protein: 5, carbs: 7, fat: 4 },
      { match: /rice/i, name: 'Rice', quantity: '1 cup', calories: 205, protein: 4, carbs: 45, fat: 0 },
      { match: /pasta|macaroni|spaghetti|noodle/i, name: 'Pasta', quantity: '1 serving', calories: 350, protein: 12, carbs: 68, fat: 7 },
      { match: /oat/i, name: 'Oats', quantity: '1 serving', calories: 150, protein: 5, carbs: 27, fat: 3 },
    ]
    const items = known.filter((food) => food.match.test(description)).map(({ match, ...food }) => food)
    const totals = items.reduce((result, item) => ({ calories: result.calories + item.calories, protein: result.protein + item.protein, carbs: result.carbs + item.carbs, fat: result.fat + item.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
    return { items, totals, overall: items.length ? ['Description-based estimate used because image analysis is temporarily unavailable.'] : [imageData ? 'Image uploaded, but the configured vision model could not analyze it. Configure an accessible vision-capable provider for image-only estimates.' : 'Add a written meal description for a more useful estimate.'], imageWarning: imageWarning || undefined, analysisUnavailable: Boolean(imageData), disclaimer: DISCLAIMER }
  }
  const responseRules = `Return JSON with items (array of name, quantity, calories, protein, carbs, fat), totals (calories, protein, carbs, fat), overall (array of short observations), and imageWarning. Nutrition values are estimates only. If the description or image is unclear, say so instead of inventing precision. Include the exact disclaimer: ${DISCLAIMER}`
  if (imageData && !AI_VISION_MODEL) {
    return description ? fallbackAnalysis() : { items: [], totals: { calories: 'Unavailable', protein: 'Unavailable', carbs: 'Unavailable', fat: 'Unavailable' }, overall: ['Image uploaded successfully, but no vision-capable AI model is configured. Add a vision provider key to analyze calories from the image alone.'], imageWarning: true, analysisUnavailable: true, disclaimer: DISCLAIMER }
  }
  const visionKey = GROQ_VISION_API_KEY || process.env.OPENAI_API_KEY
  const visionEndpoint = GROQ_VISION_API_KEY ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions'
  const requestKey = imageData ? visionKey : AI_API_KEY
  const requestEndpoint = imageData ? visionEndpoint : AI_ENDPOINT
  const requestModel = imageData ? AI_VISION_MODEL : AI_MODEL
  if (requestKey && requestModel && !(imageData && !AI_VISION_MODEL)) {
    const userContent = [{ type: 'text', text: JSON.stringify({ description, availableFoods: availableFoods.slice(0, 30) }) }]
    if (imageData) userContent.push({ type: 'image_url', image_url: { url: imageData, detail: 'low' } })
    const requestBody = {
      model: requestModel,
      temperature: 0.2,
      messages: [{ role: 'system', content: `You are FitMate's food analyzer. Identify described or visible foods and provide cautious approximate nutrition. Never provide medical advice or claim exact nutritional measurements. ${responseRules}` }, { role: 'user', content: userContent }],
    }
    if (!imageData) requestBody.response_format = { type: 'json_object' }
    const response = await fetch(requestEndpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${requestKey}` },
      body: JSON.stringify(requestBody),
    })
    if (!response.ok) {
      if (imageData) return fallbackAnalysis()
      throw new Error('The AI provider could not analyze this meal')
    }
    const payload = await response.json()
    const rawContent = payload.choices?.[0]?.message?.content || '{}'
    const jsonContent = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    try {
      return { ...JSON.parse(jsonContent), imageWarning, disclaimer: DISCLAIMER }
    } catch (error) {
      if (imageData) return fallbackAnalysis()
      throw error
    }
  }

  return fallbackAnalysis()
}

export async function getCoachResponse({ profile, message, activity = {} }) {
  const context = {
    currentGoal: profile?.fitnessGoal,
    dietPreference: profile?.dietPreference,
    exerciseExperience: profile?.exerciseExperience,
    activityLevel: profile?.activityLevel,
    availableEquipment: profile?.availableEquipment,
    preferredWorkoutDuration: profile?.preferredWorkoutDuration,
    availableFoods: activity.availableFoods || [],
    recentMeals: activity.recentMeals || [],
    recentWorkouts: activity.recentWorkouts || [],
    latestHydration: activity.latestHydration || null,
    latestSleep: activity.latestSleep || null,
    latestProgress: activity.latestProgress || null,
  }
  if (AI_API_KEY) {
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({ model: AI_MODEL, temperature: 0.5, messages: [
        { role: 'system', content: `You are FitMate's supportive fitness and wellness coach. Use the user's stored profile and recent app activity when relevant. If asked what to eat, give a clear breakfast, lunch, snack, and dinner suggestion using the stated diet preference and available foods. If activity data is missing, say so and offer a general option. Give practical general wellness suggestions only. Never diagnose, prescribe treatment, recommend medication, extreme diets, starvation, or dangerous exercise. Do not present estimated calories or nutrition numbers as exact. Keep answers concise. End with this exact disclaimer: ${DISCLAIMER}` },
        { role: 'user', content: JSON.stringify({ message, ...context }) },
      ] }),
    })
    if (!response.ok) throw new Error('The AI provider could not answer right now')
    const payload = await response.json()
    return { response: payload.choices?.[0]?.message?.content || 'Try one small, repeatable action today.', disclaimer: DISCLAIMER }
  }
  const asksForFood = /eat|meal|breakfast|lunch|dinner|snack|food/i.test(message || '')
  if (asksForFood) {
    const foods = context.availableFoods.length ? ` using options such as ${context.availableFoods.slice(0, 4).join(', ')}` : ''
    return { response: `For your ${context.currentGoal?.toLowerCase() || 'fitness'} goal and ${context.dietPreference?.toLowerCase() || 'chosen'} preference${foods}, consider:\n\nBreakfast: Oats with fruit and a protein option.\nLunch: Rice or roti with vegetables and a protein source.\nSnack: Fruit with nuts or yogurt.\nDinner: Vegetables with a protein-rich food and a satisfying grain.\n\nYou have logged ${context.recentMeals.length} recent meal${context.recentMeals.length === 1 ? '' : 's'} and your latest hydration is ${context.latestHydration?.amountMl || 0} ml. Adjust portions to your hunger and routine.`, disclaimer: DISCLAIMER }
  }
  return { response: `For your ${context.currentGoal?.toLowerCase() || 'goals'}, start with one small action you can repeat today. You have logged ${context.recentWorkouts.length} recent workout${context.recentWorkouts.length === 1 ? '' : 's'} and ${context.latestProgress?.steps || 0} steps in your latest progress entry. Try 20 minutes of movement, a balanced meal, or an earlier bedtime.`, disclaimer: DISCLAIMER }
}

export async function getGeminiResponse({ message, context = {} }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return getCoachResponse({ profile: context.profile, message, activity: context.activity })
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.0-flash'}:generateContent?key=${apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `You are FitMate's wellness assistant. Return practical Markdown-friendly advice, never diagnosis or treatment. End with this exact disclaimer: ${DISCLAIMER}\n\nContext: ${JSON.stringify(context)}\n\nRequest: ${message}` }] }] }),
  })
  if (!response.ok) throw new Error('The Gemini provider could not answer right now')
  const payload = await response.json()
  return { response: payload.candidates?.[0]?.content?.parts?.map((part) => part.text).join('') || 'Try one small, repeatable action today.', disclaimer: DISCLAIMER, provider: 'gemini' }
}

export async function getWorkoutSuggestion({ profile, preferences = {} }) {
  const disclaimer = DISCLAIMER
  if (AI_API_KEY) {
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({ model: AI_MODEL, temperature: 0.4, response_format: { type: 'json_object' }, messages: [
        { role: 'system', content: `Return JSON with warmUp, exercises (array of name, sets, reps, minutes), and coolDown. Give general fitness information only, do not diagnose injuries or prescribe treatment. Include disclaimer: ${disclaimer}` },
        { role: 'user', content: JSON.stringify({ goal: profile?.fitnessGoal, experience: profile?.exerciseExperience, time: preferences.time, equipment: preferences.equipment, preference: preferences.preference }) },
      ] }),
    })
    if (!response.ok) throw new Error('The AI provider could not create this workout')
    const payload = await response.json()
    return { ...JSON.parse(payload.choices?.[0]?.message?.content || '{}'), disclaimer }
  }
  return { warmUp: '5 minutes of easy movement and dynamic stretches', exercises: [{ name: 'Bodyweight squats', sets: 3, reps: 10, minutes: 6 }, { name: 'Incline push-ups', sets: 3, reps: 8, minutes: 6 }, { name: 'Reverse lunges', sets: 3, reps: 8, minutes: 6 }, { name: 'Dead bug', sets: 3, reps: 8, minutes: 5 }], coolDown: '5 minutes of relaxed breathing and stretching', disclaimer }
}

export async function getMealPlan({ profile, days = 1, mealType = 'balanced' }) {
  const disclaimer = DISCLAIMER
  const normalizedDays = Math.min(7, Math.max(1, Number(days)))
  const fallbackMealPlan = () => {
    const template = { breakfast: 'Greek yogurt, berries, and oats', lunch: 'A grain bowl with beans, greens, and roasted vegetables', snack: 'Fruit with a small handful of nuts', dinner: 'Rice, vegetables, and a simple protein' }
    return { days: Array.from({ length: normalizedDays }, (_, index) => ({ day: index + 1, ...template })), disclaimer, provider: 'local-fallback' }
  }
  if (AI_API_KEY) {
    try {
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
        body: JSON.stringify({ model: AI_MODEL, temperature: 0.5, response_format: { type: 'json_object' }, messages: [
          { role: 'system', content: `Return JSON with days, each containing breakfast, lunch, snack, and dinner. Give general meal ideas, use approximate nutrition only, never medical diets. Include disclaimer: ${disclaimer}` },
          { role: 'user', content: JSON.stringify({ days: normalizedDays, mealType, goal: profile?.fitnessGoal, dietPreference: profile?.dietPreference }) },
        ] }),
      })
      if (!response.ok) return fallbackMealPlan()
      const payload = await response.json()
      const content = payload.choices?.[0]?.message?.content || '{}'
      return { ...JSON.parse(content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()), disclaimer, provider: 'ai' }
    } catch {
      return fallbackMealPlan()
    }
  }
  return fallbackMealPlan()
}

export { DISCLAIMER }
