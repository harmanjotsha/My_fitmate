import { useEffect, useState } from 'react'
import { Dumbbell, LoaderCircle, Utensils } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../services/api.js'

export default function FitJourneyView() {
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { api.journey(4).then(({ weeks: records }) => setWeeks(records)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)) }, [])
  return <section className="feature-page journey-page"><div className="feature-header"><div><p className="section-kicker">YOUR FIT JOURNEY</p><h2>The story of your consistency.</h2><p>Look back at the habits you practiced each week. Progress is built from returning, not from perfection.</p></div></div>{error && <div className="error-banner">{error}</div>}{loading ? <div className="loading-state"><LoaderCircle className="spin" /> Loading your journey...</div> : <div className="journey-story">{weeks.map((week, index) => <motion.article className="journey-card" key={week.weekLabel} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .35 }} transition={{ duration: .38, delay: index * .1 }}><div className="journey-marker"><span>{index + 1}</span></div><div className="journey-card-body"><p className="section-kicker">{week.weekLabel}</p><h3>{week.takeaway}</h3><div className="journey-counts"><span><Dumbbell size={16} /> {week.workoutCount} workouts</span><span><Utensils size={16} /> {week.mealCount} meal logs</span></div><p className="journey-note">Small actions count. Keep choosing the next supportive step.</p></div></motion.article>)}</div>}</section>
}
