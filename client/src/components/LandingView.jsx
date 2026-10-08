import { useEffect, useState } from 'react'
import { ArrowRight, Check, ChevronRight, HeartPulse, Play, Sparkles, Trophy, Waves } from 'lucide-react'
import { motion } from 'framer-motion'
import fitImageOne from '../fit 1.jpg'
import fitImageTwo from '../fit 2.jpg'
import fitImageThree from '../fit 3 transparent.png'
import pilatesImage from '../pila.jpg'
import recoveryImage from '../me.jpg'

const highlights = [
  { icon: HeartPulse, title: 'Move with intention', text: 'Workouts that fit your energy, experience, and real schedule.' },
  { icon: Waves, title: 'Understand your rhythm', text: 'See the small signals behind your sleep, water, food, and progress.' },
  { icon: Sparkles, title: 'Get a little guidance', text: 'Practical AI suggestions built around your goals, never medical advice.' },
]

const programs = [
  { title: 'Strength training', text: 'Build useful strength with focused sessions.', image: fitImageOne },
  { title: 'Weight management', text: 'Create steady habits without extreme routines.', image: fitImageTwo },
  { title: 'Cardio and HIIT', text: 'Move with energy through short, adaptable workouts.', image: fitImageThree },
  { title: 'Yoga and flexibility', text: 'Improve mobility, balance, and recovery time.', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=720&q=85' },
  { title: 'Beginner movement', text: 'Start with approachable sessions that build confidence and consistency.', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=720&q=85' },
  { title: 'Pilates and core', text: 'Build balance and core strength with controlled, low-impact movement.', image: pilatesImage },
  { title: 'Recovery and mobility', text: 'Support flexibility with gentle mobility and recovery sessions.', image: recoveryImage },
  { title: 'At-home workouts', text: 'Keep moving with simple sessions that need little or no equipment.', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=720&q=85' },
]

const testimonials = [
  { name: 'Sarah Johnson', role: 'FitMate member', quote: 'The small daily check-ins helped me stay consistent without feeling judged.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80' },
  { name: 'Michael Brown', role: 'Strength member', quote: 'I finally have one calm place for workouts, meals, and progress.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80' },
  { name: 'Emily Davis', role: 'Wellness member', quote: 'The AI suggestions feel practical because they match my actual routine.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80' },
]

const insights = [
  { title: '10 minutes can still count', category: 'Movement', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=720&q=85' },
  { title: 'Build a stronger routine', category: 'Training', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=720&q=85' },
  { title: 'Food that supports your day', category: 'Nutrition', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=720&q=85' },
]

function TypewriterThought() {
  const thought = 'Your next strong habit can start with one small step.'
  const [text, setText] = useState('')
  const [active, setActive] = useState(false)
  useEffect(() => {
    if (!active) return undefined
    setText('')
    let index = 0
    const timer = window.setInterval(() => { index += 1; setText(thought.slice(0, index)); if (index >= thought.length) window.clearInterval(timer) }, 42)
    return () => window.clearInterval(timer)
  }, [active])
  return <motion.div className="typewriter-thought" onViewportEnter={() => setActive(true)} onViewportLeave={() => setActive(false)} viewport={{ once: false, amount: 0.65 }}><span>{text}</span><i aria-hidden="true" /></motion.div>
}

export default function LandingView({ onStart }) {
  const reveal = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' } } }
  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }
  return <motion.div className="landing-page" initial="hidden" animate="visible" variants={stagger}>
    <motion.header className="landing-nav" variants={reveal}>
      <div className="brand"><div className="brand-mark"><Sparkles size={18} strokeWidth={2.5} /></div><span className="brand-wordmark"><span className="brand-fit">fit</span><span className="brand-mate">mate</span></span></div>
      <nav className="landing-links"><a href="#approach">Our approach</a><a href="#features">What you get</a><a href="#story">Why FitMate</a></nav>
      <div className="landing-nav-actions"><button className="landing-signin" onClick={() => onStart('login')}>Sign in</button><button className="landing-nav-cta" onClick={() => onStart('register')}>Get started <ArrowRight size={15} /></button></div>
    </motion.header>

    <main>
      <motion.section className="landing-hero" id="approach" variants={stagger}>
        <div className="landing-hero-copy">
          <motion.p className="landing-eyebrow" variants={reveal}><span /> WELLNESS, WITHOUT THE NOISE</motion.p>
          <motion.h1 variants={reveal}>A healthier rhythm starts with <em>one good day.</em></motion.h1>
          <motion.p className="landing-lede" variants={reveal}>FitMate brings movement, nourishment, rest, and progress into one calm place, so you can care for yourself without turning wellness into another full-time job.</motion.p>
          <motion.div className="landing-hero-actions" variants={reveal}><motion.button className="landing-primary" whileHover={{ scale: 1.03 }} transition={{ duration: 0.18 }} onClick={() => onStart('register')}>Build your rhythm <motion.span whileHover={{ x: 4 }}><ArrowRight size={17} /></motion.span></motion.button><button className="landing-play" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}><span><Play size={13} fill="currentColor" /></span> See how it works</button></motion.div>
          <div className="landing-proof"><div className="proof-avatars"><i>AL</i><i>JM</i><i>RK</i><i>+</i></div><p><strong>Made for real life.</strong><br />A gentler way to keep showing up.</p></div>
        </div>
        <motion.div className="landing-hero-art" variants={reveal} aria-label="A person enjoying a calm outdoor walk">
          <div className="art-sun" /><div className="art-leaf leaf-one" /><div className="art-leaf leaf-two" /><div className="art-plant plant-one" /><div className="art-plant plant-two" />
          <div className="art-image"><img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=85" alt="Woman practicing a relaxed yoga pose outdoors" /></div>
          <motion.div className="floating-note note-top" animate={{ y: [0, -6, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}><div className="note-icon green"><Check size={14} /></div><span><strong>Small steps count</strong><br />Your consistency is up 18%</span></motion.div>
          <motion.div className="floating-note note-bottom" animate={{ y: [0, 6, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}><div className="note-icon gold"><Trophy size={14} /></div><span><strong>4 day streak</strong><br />Keep your momentum going</span></motion.div>
        </motion.div>
      </motion.section>

      <section className="landing-trust"><span>YOUR WELLNESS, ALL IN ONE PLACE</span><i /><span>MOVE · NOURISH · REST · GROW</span><i /><span>DESIGNED FOR YOUR EVERYDAY</span></section>

      <motion.section className="programs-section" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }} variants={stagger}><motion.div className="landing-section-heading" variants={reveal}><p className="landing-eyebrow">FITNESS THAT FITS YOU</p><h2>Find the right program for you.</h2><p>Choose a starting point that matches your goals, energy, and experience.</p></motion.div><div className="program-carousel" aria-label="Fitness programs"><div className="program-track">{[0, 1].map((copyIndex) => <div className="program-group" aria-hidden={copyIndex === 1} key={copyIndex}>{programs.map((program) => <motion.article className="program-card" variants={reveal} key={`${copyIndex}-${program.title}`}><div className="program-image-slot" aria-hidden={!program.image}>{program.image && <img className={`${program.title === 'Cardio and HIIT' ? 'program-image-contain ' : ''}${program.title === 'Recovery and mobility' ? 'program-image-recovery' : ''}`} src={program.image} alt={program.title} />}</div><div><span>FITMATE PROGRAM</span><h3>{program.title}</h3><p>{program.text}</p><button tabIndex={copyIndex === 1 ? -1 : undefined} onClick={() => onStart('register')}>Explore program <ArrowRight size={14} /></button></div></motion.article>)}</div>)}</div></div></motion.section>
      <TypewriterThought />

      <motion.section className="landing-features" id="features" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.16 }} variants={stagger}><motion.div className="landing-section-heading" variants={reveal}><p className="landing-eyebrow">A BETTER WAY TO BEGIN</p><h2>Take care of the whole you.</h2><p>Not a before-and-after story. A toolkit for feeling more supported in the life you already have.</p></motion.div><div className="highlight-grid">{highlights.map(({ icon: Icon, title, text }) => <motion.article className="highlight-card" variants={reveal} key={title}><div className="highlight-icon"><Icon size={19} /></div><h3>{title}</h3><p>{text}</p><button onClick={() => onStart('register')}>Explore FitMate <ChevronRight size={15} /></button></motion.article>)}</div></motion.section>

      <motion.section className="landing-story" id="story" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} variants={stagger}><motion.div className="story-image" variants={reveal}><img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85" alt="Person enjoying a focused strength training session" /></motion.div><motion.div className="story-copy" variants={reveal}><p className="landing-eyebrow">THE FITMATE MINDSET</p><h2>Progress is a conversation, not a score.</h2><p>Some days you have an hour. Some days you have ten minutes. FitMate helps you find the next kind thing you can do for your body, then makes it easier to come back tomorrow.</p><div className="story-checks">{['No perfection required', 'Suggestions that meet you where you are', 'Your data, your pace, your choices'].map((text) => <motion.span key={text} variants={reveal}><Check size={15} /> {text}</motion.span>)}</div><button className="landing-text-button" onClick={() => onStart('register')}>Start your first week <ArrowRight size={16} /></button></motion.div></motion.section>

      <motion.section className="testimonials-section" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.14 }} variants={stagger}><div className="landing-section-heading"><p className="landing-eyebrow">REAL PEOPLE. REAL PROGRESS.</p><h2>Keep showing up together.</h2></div><div className="testimonial-grid">{testimonials.map((item) => <motion.article className="testimonial-card" variants={reveal} key={item.name}><p>“{item.quote}”</p><div className="testimonial-person"><img src={item.image} alt="" /><span><strong>{item.name}</strong><small>{item.role}</small></span></div></motion.article>)}</div></motion.section>

      <motion.section className="insights-section" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }} variants={stagger}><div className="landing-section-heading"><p className="landing-eyebrow">FROM OUR COACHES</p><h2>Fitness tips and insights.</h2></div><div className="insights-grid">{insights.map((item) => <motion.article className="insight-card" variants={reveal} key={item.title}><img src={item.image} alt="" /><div><span>{item.category}</span><h3>{item.title}</h3><button onClick={() => onStart('register')}>Read more <ArrowRight size={14} /></button></div></motion.article>)}</div></motion.section>

      <motion.section className="rhythm-section" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.14 }} variants={stagger}><div className="large-section-heading"><p className="landing-eyebrow">YOUR EVERYDAY RHYTHM</p><h2>Everything you need to feel stronger, calmer, and more consistent.</h2></div><div className="rhythm-grid"><motion.article variants={reveal}><span>01</span><h3>Start with your real life</h3><p>Set a goal, choose your pace, and build a plan around the time and energy you actually have.</p></motion.article><motion.article variants={reveal}><span>02</span><h3>Make progress visible</h3><p>Bring workouts, meals, hydration, sleep, and check-ins into one clear daily view.</p></motion.article><motion.article variants={reveal}><span>03</span><h3>Keep the next step simple</h3><p>Use practical guidance and gentle reminders to return to the habits that support you.</p></motion.article></div></motion.section>

      <motion.section className="community-section" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.14 }} variants={stagger}><div className="community-copy"><p className="landing-eyebrow">BUILT FOR CONSISTENCY</p><h2>Small actions become your strongest routine.</h2><p>FitMate keeps the useful parts of fitness together, so every workout, meal, and recovery choice can add up without pressure.</p><button className="landing-primary" onClick={() => onStart('register')}>Create your rhythm <ArrowRight size={17} /></button></div><div className="community-metrics"><div><strong>4</strong><span>wellness pillars</span></div><div><strong>24/7</strong><span>AI guidance</span></div><div><strong>1</strong><span>calm workspace</span></div><div><strong>∞</strong><span>ways to begin</span></div></div></motion.section>

      <section className="landing-final"><div><p className="landing-eyebrow">YOUR NEXT GOOD DAY</p><h2>Make space for feeling well.</h2><p>Start with a profile, choose a goal, and let FitMate help with the rest.</p></div><button className="landing-primary" onClick={() => onStart('register')}>Get started free <ArrowRight size={17} /></button></section>
    </main>
    <footer className="landing-footer"><span>FitMate <i>•</i> Your everyday wellness companion</span><span>General wellness information, not medical advice.</span></footer>
  </motion.div>
}
