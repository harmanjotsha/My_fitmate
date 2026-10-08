import { useEffect, useState } from 'react'
import { Check, LoaderCircle, Plus, Trash2 } from 'lucide-react'
import { api } from '../services/api.js'

const configs = {
  'Admin Exercises': { title: 'Exercises', load: api.adminExercises, create: api.addAdminExercise, remove: api.deleteAdminExercise, key: 'exercise', fields: [['name', 'Name'], ['category', 'Category'], ['difficulty', 'Difficulty'], ['muscleGroup', 'Muscle group'], ['equipment', 'Equipment']] },
  'Admin Foods': { title: 'Foods', load: api.adminFoods, create: api.addAdminFood, remove: api.deleteAdminFood, key: 'food', fields: [['name', 'Name'], ['category', 'Category'], ['servingSize', 'Serving size'], ['caloriesApprox', 'Calories estimate'], ['proteinApprox', 'Protein estimate']] },
  'Workout Plans': { title: 'Workout plans', load: api.adminWorkoutPlans, create: api.addAdminWorkoutPlan, remove: api.deleteAdminWorkoutPlan, key: 'plan', fields: [['title', 'Title'], ['description', 'Description'], ['durationMinutes', 'Duration minutes'], ['equipment', 'Equipment']] },
  Announcements: { title: 'Announcements', load: api.adminAnnouncements, create: api.addAdminAnnouncement, key: 'announcement', fields: [['title', 'Title'], ['message', 'Message']] },
  Content: { title: 'Content', load: api.adminContent, create: api.addAdminContent, key: 'content', fields: [['title', 'Title'], ['category', 'Category'], ['description', 'Description'], ['content', 'Content']] },
}

export default function AdminManagementView({ view }) {
  const config = configs[view]; const [items, setItems] = useState([]); const [form, setForm] = useState({}); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  useEffect(() => { if (!config) return; setLoading(true); config.load().then(({ items: records }) => setItems(records)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)) }, [config])
  if (!config) return <section className="feature-page"><h2>Admin area</h2></section>
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event) => { event.preventDefault(); try { const result = await config.create(form); setItems((current) => [result[config.key], ...current]); setForm({}) } catch (requestError) { setError(requestError.message) } }
  const remove = async (id) => { if (!config.remove) return; try { await config.remove(id); setItems((current) => current.filter((item) => item.id !== id)) } catch (requestError) { setError(requestError.message) } }
  return <section className="feature-page"><div className="feature-header"><div><p className="section-kicker">ADMINISTRATION</p><h2>{config.title}</h2><p>Create and manage platform content without exposing private user data.</p></div></div>{error && <div className="error-banner">{error}</div>}<form className="entry-form" onSubmit={submit}>{config.fields.map(([key, label]) => <label key={key}>{label}{key === 'description' || key === 'message' || key === 'content' ? <textarea required value={form[key] || ''} onChange={(event) => update(key, event.target.value)} /> : <input required value={form[key] || ''} onChange={(event) => update(key, event.target.value)} />}</label>)}<button className="primary-button"><Plus size={16} /> Add {config.title === 'Content' ? 'Content' : config.title.replace(/s$/, '')}</button></form>{loading ? <div className="loading-state"><LoaderCircle className="spin" /> Loading...</div> : <div className="feature-list">{items.map((item) => <article className="feature-item" key={item.id}><div className="feature-item-copy"><strong>{item.name || item.title}</strong><span>{item.category || item.description || item.message || item.status || 'Active'}</span></div>{config.remove && <button aria-label={`Delete ${item.name || item.title}`} onClick={() => remove(item.id)}><Trash2 size={16} /></button>}</article>)}</div>}</section>
}
