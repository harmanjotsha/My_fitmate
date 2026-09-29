import { useState } from 'react'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { api } from '../services/api.js'

export default function AuthView({ onAuth, onBack, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ name: '', email: 'jamie@example.com', password: 'secret123' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (event) => { event.preventDefault(); setLoading(true); setError(''); try { const result = mode === 'login' ? await api.login(form) : await api.register(form); localStorage.setItem('fitmate_token', result.token); onAuth(result.user) } catch (authError) { setError(authError.message) } finally { setLoading(false) } }
  return <div className="auth-screen"><button className="flow-back-button" onClick={onBack}><ArrowLeft size={16} /> Back to landing</button><div className="auth-card"><div className="brand auth-brand"><div className="brand-mark"><Sparkles size={18} /></div><span className="brand-wordmark"><span className="brand-fit">fit</span><span className="brand-mate">mate</span></span></div><p className="section-kicker">YOUR EVERYDAY WELLNESS COMPANION</p><h1>{mode === 'login' ? 'Welcome back.' : 'Start where you are.'}</h1><p className="auth-copy">Build a rhythm that supports your real life, one small action at a time.</p><form onSubmit={submit}>{mode === 'register' && <input required placeholder="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />}<input required type="email" placeholder="Email address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><input required minLength="6" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />{error && <div className="error-banner">{error}</div>}<button className="primary-button auth-submit" disabled={loading}>{loading ? 'Signing in...' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></button></form><button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'New to FitMate? Create an account' : 'Already have an account? Sign in'}</button></div></div>
}
