import { useEffect, useRef, useState } from 'react'
import { Flame, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function GamificationShelf({ data }) {
  const [celebrate, setCelebrate] = useState(false)
  const previousBadges = useRef([])
  const xp = data?.totalXp || 0
  const level = Math.floor(xp / 100) + 1
  const progress = xp % 100
  const earnedKeys = (data?.earnedBadges || []).map((badge) => badge.key)
  useEffect(() => {
    if (previousBadges.current.length && earnedKeys.some((key) => !previousBadges.current.includes(key))) {
      setCelebrate(true); const timer = window.setTimeout(() => setCelebrate(false), 1800); return () => window.clearTimeout(timer)
    }
    previousBadges.current = earnedKeys
  }, [earnedKeys.join(',')])
  return <section className="gamification-grid"><AnimatePresence>{celebrate && <motion.div className="badge-confetti" initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}><span>🎉</span><span>✨</span><span>🎊</span></motion.div>}</AnimatePresence><section className="panel streak-summary"><div className="gamification-heading"><p className="section-kicker">CONSISTENCY</p><Flame size={19} color="#df7c42" /></div><strong>🔥 {data?.currentStreak || 0} Day Streak</strong><span>Longest: {data?.longestStreak || 0} days</span></section><section className="panel xp-summary"><div className="gamification-heading"><p className="section-kicker">YOUR XP</p><Sparkles size={17} color="#7650c5" /></div><div className="xp-line"><strong>Level {level}</strong><span>{xp} XP</span></div><div className="xp-track"><motion.i initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: .8, ease: 'easeOut' }} /></div><small>{100 - progress} XP to next level</small></section><section className="panel badge-summary"><div className="gamification-heading"><p className="section-kicker">BADGE SHELF</p><span>{earnedKeys.length}/{data?.badges?.length || 0} earned</span></div><div className="badge-grid">{data?.badges?.map((badge) => <div className={`badge-item ${badge.earned ? 'earned' : ''}`} title={badge.earned ? `Earned on ${new Date(badge.earned.earnedAt).toLocaleDateString()}` : 'Not earned yet'} key={badge.key}><span>{badge.icon}</span><small>{badge.title}</small></div>)}</div></section></section>
}
