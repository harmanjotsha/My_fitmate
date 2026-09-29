import { useState } from 'react'
import { Check, Send } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '../services/api.js'

const rows = [
  { key: 'energy', label: 'Energy', emojis: ['😴', '😐', '🙂', '😃', '🔥'] },
  { key: 'mood', label: 'Mood', emojis: ['😞', '😐', '🙂', '😊', '😁'] },
  { key: 'stress', label: 'Stress', emojis: ['😌', '🙂', '😐', '😟', '😣'] },
  { key: 'sleepQuality', label: 'Sleep quality', emojis: ['😴', '😕', '🙂', '😊', '🌙'] },
]

export default function DailyCheckInWidget({ existingCheckIn, onSubmitted }) {
  const [values, setValues] = useState({ energy: 3, mood: 3, stress: 3, sleepQuality: 3 })
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(Boolean(existingCheckIn))
  const [response, setResponse] = useState(existingCheckIn?.summary || '')
  const submit = async (event) => {
    event.preventDefault(); setSaving(true)
    try { const result = await api.addWellnessCheckIn(values); setResponse(result.checkIn.summary); setSubmitted(true); onSubmitted?.(result.checkIn) } finally { setSaving(false) }
  }
  return <AnimatePresence mode="wait">{submitted ? <motion.div className="daily-checkin-chip" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}><span><Check size={15} /> Checked in today</span>{response && <small>{response}</small>}</motion.div> : <motion.section className="daily-checkin-widget panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12, height: 0, marginBottom: 0, overflow: 'hidden' }}><div className="panel-heading"><div><p className="section-kicker">DAILY WELLNESS CHECK-IN</p><h3>How are you feeling today?</h3></div><span className="checkin-spark">✦</span></div><form onSubmit={submit}><div className="checkin-rows">{rows.map(({ key, label, emojis }) => <div className="checkin-row" key={key}><strong>{label}</strong><div>{emojis.map((emoji, index) => <button type="button" className={values[key] === index + 1 ? 'selected' : ''} aria-label={`${label} ${index + 1} of 5`} onClick={() => setValues((current) => ({ ...current, [key]: index + 1 }))} key={`${key}-${emoji}`}>{emoji}</button>)}</div></div>)}</div><button className="primary-button checkin-submit" disabled={saving}><Send size={15} /> {saving ? 'Saving...' : 'Check in'}</button></form></motion.section>}</AnimatePresence>
}
