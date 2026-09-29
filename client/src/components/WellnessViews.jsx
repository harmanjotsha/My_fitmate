import { useEffect, useState } from 'react'
import { Check, Droplets, Moon, Plus, Send, Sparkles } from 'lucide-react'
import { api } from '../services/api.js'

function Page({ eyebrow, title, description, children, className = '' }) {
  return <section className={`feature-page ${className}`}><div className="feature-header"><div><p className="section-kicker">{eyebrow}</p><h2>{title}</h2><p>{description}</p></div></div>{children}</section>
}

function EntryForm({ children, onSubmit, submitLabel = 'Save entry' }) {
  return <form className="entry-form" onSubmit={onSubmit}>{children}<button className="primary-button" type="submit"><Check size={16} /> {submitLabel}</button></form>
}

export function HydrationView() {
  const [entry, setEntry] = useState(null)
  const [amount, setAmount] = useState(250)
  const [goalMl, setGoalMl] = useState(2000)
  const [error, setError] = useState('')
  useEffect(() => { api.hydration().then(({ items }) => setEntry(items[0] || null)).catch((requestError) => setError(requestError.message)) }, [])
  const add = async (value) => { try { const result = entry ? await api.updateHydration(entry.id, { amountMl: entry.amountMl + value }) : await api.addHydration({ amountMl: value, goalMl }); setEntry(result.hydration) } catch (requestError) { setError(requestError.message) } }
  return <Page eyebrow="HYDRATION" title="Drink in a little care." description="Track water as a gentle daily check-in, with a goal that belongs to you.">{error && <div className="error-banner">{error}</div>}<div className="wellness-focus-card"><div className="wellness-icon blue"><Droplets size={22} /></div><div><p className="section-kicker">TODAY'S HYDRATION</p><strong>{entry?.amountMl || 0} / {entry?.goalMl || goalMl} ml</strong><div className="progress-track"><i style={{ width: `${Math.min(100, ((entry?.amountMl || 0) / (entry?.goalMl || goalMl)) * 100)}%` }} /></div></div></div><div className="quick-actions"><button type="button" className="secondary-button" onClick={() => add(250)}>+250 ml</button><button type="button" className="secondary-button" onClick={() => add(500)}>+500 ml</button><button type="button" className="secondary-button" onClick={() => add(750)}>+750 ml</button></div><EntryForm onSubmit={(event) => { event.preventDefault(); add(0) }}><label>Daily goal in ml<input type="number" min="250" step="250" value={goalMl} onChange={(event) => setGoalMl(event.target.value)} /></label></EntryForm></Page>
}

export function SleepView() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), bedtime: '22:30', wakeTime: '06:30', totalHours: 8, quality: 'Good', notes: '' })
  const [error, setError] = useState('')
  useEffect(() => { api.sleep().then(({ items: records }) => setItems(records)).catch((requestError) => setError(requestError.message)) }, [])
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event) => { event.preventDefault(); try { const result = await api.addSleep(form); setItems((current) => [result.sleep, ...current]) } catch (requestError) { setError(requestError.message) } }
  return <Page eyebrow="REST & RECOVERY" title="Sleep" description="Notice your rest patterns over time without turning them into a score.">{error && <div className="error-banner">{error}</div>}<EntryForm onSubmit={submit}><div className="form-grid"><label>Date<input type="date" value={form.date} onChange={(event) => update('date', event.target.value)} /></label><label>Total hours<input type="number" min="0" max="24" step="0.1" value={form.totalHours} onChange={(event) => update('totalHours', event.target.value)} /></label><label>Bedtime<input type="time" value={form.bedtime} onChange={(event) => update('bedtime', event.target.value)} /></label><label>Wake time<input type="time" value={form.wakeTime} onChange={(event) => update('wakeTime', event.target.value)} /></label></div><label>Sleep quality<select value={form.quality} onChange={(event) => update('quality', event.target.value)}>{['Poor', 'Okay', 'Good', 'Excellent'].map((option) => <option key={option}>{option}</option>)}</select></label><label>Notes<textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} /></label></EntryForm><div className="feature-list">{items.map((item) => <article className="feature-item" key={item.id}><div className="feature-item-icon"><Moon size={18} /></div><div className="feature-item-copy"><strong>{item.totalHours} hours · {item.quality}</strong><span>{item.date} · {item.bedtime} to {item.wakeTime}</span></div></article>)}</div></Page>
  return <Page className="sleep-view" eyebrow="REST & RECOVERY" title="Sleep" description="Notice your rest patterns over time without turning them into a score.">{error && <div className="error-banner">{error}</div>}<EntryForm onSubmit={submit}><div className="form-grid"><label>Date<input type="date" value={form.date} onChange={(event) => update('date', event.target.value)} /></label><label>Total hours<input type="number" min="0" max="24" step="0.1" value={form.totalHours} onChange={(event) => update('totalHours', event.target.value)} /></label><label>Bedtime<input type="time" value={form.bedtime} onChange={(event) => update('bedtime', event.target.value)} /></label><label>Wake time<input type="time" value={form.wakeTime} onChange={(event) => update('wakeTime', event.target.value)} /></label></div><label>Sleep quality<select value={form.quality} onChange={(event) => update('quality', event.target.value)}>{['Poor', 'Okay', 'Good', 'Excellent'].map((option) => <option key={option}>{option}</option>)}</select></label><label>Notes<textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} /></label></EntryForm><div className="feature-list">{items.map((item) => <article className="feature-item" key={item.id}><div className="feature-item-icon"><Moon size={18} /></div><div className="feature-item-copy"><strong>{item.totalHours} hours · {item.quality}</strong><span>{item.date} · {item.bedtime} to {item.wakeTime}</span></div></article>)}</div></Page>
}

export function WellnessCheckInView() {
  const [form, setForm] = useState({ energy: 3, mood: 3, stress: 3, sleepQuality: 3, activityLevel: 3 })
  const [summary, setSummary] = useState('')
  const update = (key, value) => setForm((current) => ({ ...current, [key]: Number(value) }))
  const submit = async (event) => { event.preventDefault(); const result = await api.addWellnessCheckIn(form); setSummary(result.checkIn.summary) }
  return <Page eyebrow="DAILY REFLECTION" title="Wellness check-in" description="A quick pause to notice energy, mood, stress, rest, and movement."><EntryForm onSubmit={submit} submitLabel="Complete check-in">{[['energy', 'Energy'], ['mood', 'Mood'], ['stress', 'Stress'], ['sleepQuality', 'Sleep quality'], ['activityLevel', 'Activity level']].map(([key, label]) => <label key={key}>{label}<input type="range" min="1" max="5" value={form[key]} onChange={(event) => update(key, event.target.value)} /><span className="range-value">{form[key]} / 5</span></label>)}</EntryForm>{summary && <div className="success-banner"><Sparkles size={16} /> {summary}</div>}</Page>
}

export function ServicesView() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ type: 'General Fitness Help', title: '', description: '', preferredDate: '' })
  const [error, setError] = useState('')
  useEffect(() => { api.services().then(({ items: records }) => setItems(records)).catch((requestError) => setError(requestError.message)) }, [])
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event) => { event.preventDefault(); try { const result = await api.addService(form); setItems((current) => [result.service, ...current]); setForm({ type: form.type, title: '', description: '', preferredDate: '' }) } catch (requestError) { setError(requestError.message) } }
  return <Page className="services-view" eyebrow="WELLNESS SERVICES" title="Ask for support." description="Request general fitness guidance, nutrition guidance, or technical help from the FitMate team.">{error && <div className="error-banner">{error}</div>}<EntryForm onSubmit={submit}><div className="services-form-grid"><label>Service type<select value={form.type} onChange={(event) => update('type', event.target.value)}>{['Workout Guidance', 'Nutrition Guidance', 'General Fitness Help', 'Technical Support', 'Other'].map((option) => <option key={option}>{option}</option>)}</select></label><label>Preferred date<input type="date" value={form.preferredDate} onChange={(event) => update('preferredDate', event.target.value)} /></label><label className="services-title-field">Title<input required value={form.title} onChange={(event) => update('title', event.target.value)} /></label><label className="services-description-field">Description<textarea required value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Tell us what you need help with..." /></label></div></EntryForm><div className="services-history"><div className="services-history-heading"><div><p className="section-kicker">REQUEST HISTORY</p><h3>Your support requests</h3></div><span>{items.length} {items.length === 1 ? 'request' : 'requests'}</span></div><div className="feature-list">{items.length === 0 ? <div className="services-empty"><Send size={20} /><div><strong>No requests yet</strong><span>Submit your first request above and track its status here.</span></div></div> : items.map((item) => <article className="feature-item" key={item.id}><div className="feature-item-icon"><Send size={18} /></div><div className="feature-item-copy"><strong>{item.title}</strong><span>{item.type} · {item.status}</span></div></article>)}</div></div></Page>
}

export function NotificationsView() {
  const [items, setItems] = useState([])
  useEffect(() => { api.notifications().then(({ items: records }) => setItems(records)) }, [])
  const markRead = async (id) => { const result = await api.markNotificationRead(id); setItems((current) => current.map((item) => item.id === id ? result.notification : item)) }
  return <Page eyebrow="UPDATES" title="Notifications" description="Keep track of reminders, service updates, announcements, and achievements."><div className="feature-header"><button className="secondary-button" onClick={async () => { await api.markAllNotificationsRead(); setItems((current) => current.map((item) => ({ ...item, read: true }))) }}>Mark all read</button></div><div className="feature-list">{items.length === 0 && <p className="empty-copy">You are all caught up.</p>}{items.map((item) => <article className={`feature-item ${item.read ? '' : 'unread'}`} key={item.id}><div className="feature-item-icon"><Plus size={18} /></div><div className="feature-item-copy"><strong>{item.message}</strong><span>{item.read ? 'Read' : 'New'}</span></div>{!item.read && <button className="complete-button" onClick={() => markRead(item.id)}>Mark read</button>}</article>)}</div></Page>
}
