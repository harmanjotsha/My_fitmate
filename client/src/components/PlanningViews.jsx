import { useState } from 'react'
import { Check, Dumbbell, LoaderCircle, Plus, Sparkles } from 'lucide-react'
import { api } from '../services/api.js'

function Shell({ eyebrow, title, description, children }) { return <section className="feature-page"><div className="feature-header"><div><p className="section-kicker">{eyebrow}</p><h2>{title}</h2><p>{description}</p></div></div>{children}</section> }

function displayAIValue(value) {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(displayAIValue).filter(Boolean).join(', ')
  if (typeof value === 'object') {
    return [value.activity, value.description, value.durationMinutes && `${value.durationMinutes} min`, value.approxCalories && `Approx. ${value.approxCalories} kcal`, value.approxMacros && `Approx. macros: ${typeof value.approxMacros === 'object' ? JSON.stringify(value.approxMacros) : value.approxMacros}`].filter(Boolean).join(' · ') || JSON.stringify(value)
  }
  return String(value)
}

export function WorkoutGeneratorView() {
  const [form, setForm] = useState({ time: '30 minutes', equipment: 'None', preference: 'Full body' })
  const [result, setResult] = useState(null); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('')
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const generate = async (event) => { event.preventDefault(); setBusy(true); setMessage(''); try { setResult(await api.workoutGenerator(form)) } finally { setBusy(false) } }
  const save = async () => { await api.addWorkout({ title: 'AI suggested workout', exercises: result.exercises, durationMinutes: Number.parseInt(form.time, 10) || 30 }); setMessage('Workout saved to your workout list.') }
  return <Shell eyebrow="AI WORKOUT BUILDER" title="Create my workout" description="Describe the time and equipment you have. FitMate will suggest a practical session you can adjust."><form className="entry-form" onSubmit={generate}><label>Available time<select value={form.time} onChange={(event) => update('time', event.target.value)}>{['15 minutes', '30 minutes', '45 minutes', '60 minutes'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Equipment<input value={form.equipment} onChange={(event) => update('equipment', event.target.value)} /></label><label>Workout preference<select value={form.preference} onChange={(event) => update('preference', event.target.value)}>{['Full body', 'Strength', 'Cardio', 'Mobility'].map((item) => <option key={item}>{item}</option>)}</select></label><button className="primary-button" disabled={busy}><Sparkles size={16} /> {busy ? 'Generating...' : 'Create workout'}</button></form>{result && <div className="plan-result"><h3><Dumbbell size={18} /> Your suggested workout</h3><p><strong>Warm up:</strong> {displayAIValue(result.warmUp)}</p>{result.exercises?.map((item, index) => <article className="feature-item" key={`${displayAIValue(item.name)}-${index}`}><div className="feature-item-icon"><Plus size={18} /></div><div className="feature-item-copy"><strong>{displayAIValue(item.name)}</strong><span>{displayAIValue(item.sets)} sets · {displayAIValue(item.reps)} reps · {displayAIValue(item.minutes)} min</span></div></article>)}<p><strong>Cool down:</strong> {displayAIValue(result.coolDown)}</p><button className="primary-button" onClick={save}><Check size={16} /> Save workout</button><small>{result.disclaimer}</small></div>}{message && <div className="success-banner">{message}</div>}</Shell>
}

export function MealPlannerView() {
  const [days, setDays] = useState(1); const [result, setResult] = useState(null); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('')
  const generate = async (event) => { event.preventDefault(); setBusy(true); setMessage(''); try { setResult(await api.mealPlan({ days })) } finally { setBusy(false) } }
  const saveMeal = async (meal) => { await api.addMeal({ mealType: 'Other', items: Object.values(meal).map(mealValueText), source: 'AI' }); setMessage('Meal added to your log.') }
  return <Shell eyebrow="MEAL PLANNER" title="Plan meals with less friction." description="Generate a one-day or seven-day set of general meal ideas, then save individual meals to your log."><form className="entry-form planner-controls" onSubmit={generate}><label>Plan length<select value={days} onChange={(event) => setDays(Number(event.target.value))}><option value="1">1 day</option><option value="7">7 days</option></select></label><button className="primary-button" disabled={busy}><Sparkles size={16} /> {busy ? 'Generating...' : 'Generate plan'}</button></form>{result && <div className="plan-result">{result.days?.map((day, index) => <article className="meal-plan-day" key={day.day || index}><h3>Day {day.day || index + 1}</h3>{['breakfast', 'lunch', 'snack', 'dinner'].map((type) => <div className="meal-plan-row" key={type}><strong>{type}</strong><span>{displayAIValue(day[type])}</span><button aria-label={`Add ${type} to meal log`} onClick={() => saveMeal({ [type]: day[type] })}><Plus size={15} /></button></div>)}</article>)}<small>{result.disclaimer}</small></div>}{message && <div className="success-banner">{message}</div>}</Shell>
}
