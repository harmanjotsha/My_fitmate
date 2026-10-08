import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  BarChart3,
  Dumbbell,
  Footprints,
  FileText,
  FolderKanban,
  Flame,
  HeartPulse,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Settings,
  Sparkles,
  Trophy,
  UserRound,
  Utensils,
  Waves,
  X,
  Zap,
} from 'lucide-react'
import { api } from './services/api.js'
import { FeatureView, OnboardingView } from './components/FeatureView.jsx'
import AuthView from './components/AuthView.jsx'
import LandingView from './components/LandingView.jsx'
import AdminManagementView from './components/AdminManagementView.jsx'
import DailyCheckInWidget from './components/DailyCheckInWidget.jsx'
import GamificationShelf from './components/GamificationShelf.jsx'
import AIHubView from './components/AIHubView.jsx'
import { NutritionPage, WorkoutsPage, ProgressPage, AchievementsPage, ServicesPage, SettingsPage } from './components/ConsolidatedPages.jsx'
import CollabSpaceView, { SharedProjectView } from './components/CollabSpaceView.jsx'
import HelpDeskView from './components/HelpDeskView.jsx'

const navItems = [
  { label: 'Dashboard', icon: Home },
  { label: 'Workouts', icon: Dumbbell },
  { label: 'Nutrition', icon: Utensils },
  { label: 'AI Hub', icon: Sparkles },
  { label: 'Collab Space', icon: FolderKanban },
  { label: 'Progress', icon: Activity },
  { label: 'Achievements', icon: Trophy },
  { label: 'Services', icon: CircleHelp },
  { label: 'Help Desk', icon: HelpCircle },
  { label: 'Settings', icon: Settings },
]

const quickStats = [
  { label: 'Calories', value: '0', unit: '/ 2,000 kcal', change: 'Today', icon: Flame, tone: 'orange' },
  { label: 'Water', value: '0', unit: '/ 8 glasses', change: 'Today', icon: Waves, tone: 'blue' },
  { label: 'Steps', value: '0', unit: 'steps', change: 'Today', icon: Footprints, tone: 'mint' },
  { label: 'Workout', value: '0', unit: 'min', change: 'Today', icon: Dumbbell, tone: 'lavender' },
  { label: 'Sleep', value: '0', unit: 'hours', change: 'Today', icon: Moon, tone: 'lavender' },
]

const workoutItems = [
  { title: 'Upper body strength', meta: '6 exercises · 28 min', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=420&q=80', tag: 'Strength', color: 'peach' },
  { title: 'Morning mobility', meta: '8 exercises · 15 min', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=420&q=80', tag: 'Mobility', color: 'sage' },
]

function App() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [previousNav, setPreviousNav] = useState(null)
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [settingsTab, setSettingsTab] = useState('profile')
  const [dashboard, setDashboard] = useState(null)
  const [showTargetEditor, setShowTargetEditor] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [targetForm, setTargetForm] = useState({})
  const [sharedProject, setSharedProject] = useState(null)

  const handleAuth = (authenticatedUser) => {
    setUser(authenticatedUser)
    api.dashboardSummary().then((summary) => { setDashboard(summary); setTargetForm(summary.targets || {}) }).catch(() => setDashboard(null))
  }

  useEffect(() => {
    if (!localStorage.getItem('fitmate_token')) return
    Promise.all([api.profile(), api.dashboardSummary()]).then(([profileResult, summary]) => { setUser(profileResult.user); setDashboard(summary); setTargetForm(summary.targets || {}) }).catch(() => { localStorage.removeItem('fitmate_token'); setUser(null); setDashboard(null); setShowAuth(true) })
  }, [])

  useEffect(() => {
    const handleAuthExpired = () => { setUser(null); setDashboard(null); setShowAuth(true); setAuthMode('login') }
    window.addEventListener('fitmate:auth-expired', handleAuthExpired)
    return () => window.removeEventListener('fitmate:auth-expired', handleAuthExpired)
  }, [])

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('shared')
    if (token) api.publicProject(token).then(({ project }) => setSharedProject(project)).catch(() => setSharedProject({ error: 'This shared project is unavailable.' }))
  }, [])

  const saveTargetOverrides = async (event) => {
    event.preventDefault()
    const result = await api.updateProfile({ targets: { calories: Number(targetForm.calories), waterGlasses: Number(targetForm.waterGlasses), stepCount: Number(targetForm.stepCount), workoutMinutes: Number(targetForm.workoutMinutes) } })
    setUser(result.user)
    const summary = await api.dashboardSummary()
    setDashboard(summary)
    setTargetForm(summary.targets || {})
    setShowTargetEditor(false)
  }

  if (sharedProject) return sharedProject.error ? <main className="public-project"><h1>{sharedProject.error}</h1></main> : <SharedProjectView project={sharedProject} />
  if (!user && !showAuth) return <LandingView onStart={(mode = 'login') => { setAuthMode(mode); setShowAuth(true) }} />
  if (!user) return <AuthView initialMode={authMode} onAuth={handleAuth} onBack={() => { localStorage.removeItem('fitmate_token'); setShowAuth(false) }} />
  if (user.role !== 'ADMIN' && user.onboardingComplete === false) return <div className="onboarding-flow"><button className="flow-back-button onboarding-back-button" onClick={() => window.dispatchEvent(new Event('fitmate:onboarding-previous'))}><ArrowLeft size={16} /> Previous</button><OnboardingView user={user} onComplete={handleAuth} onBack={() => { localStorage.removeItem('fitmate_token'); setUser(null); setAuthMode('register'); setShowAuth(true) }} /></div>

  const goTo = (view) => { if (view !== activeNav) setPreviousNav(activeNav); setActiveNav(view); setMobileMenu(false); if (view === 'Dashboard') api.dashboardSummary().then((summary) => { setDashboard(summary); setTargetForm(summary.targets || {}) }).catch(() => {}) }
  const goBack = () => { if (!previousNav) { localStorage.removeItem('fitmate_token'); setUser(null); setShowAuth(false); setMobileMenu(false); return } const target = previousNav; setPreviousNav(null); setActiveNav(target); setMobileMenu(false); if (target === 'Dashboard') api.dashboardSummary().then((summary) => { setDashboard(summary); setTargetForm(summary.targets || {}) }).catch(() => {}) }
  const calendarDate = new Date()
  const calendarMonth = calendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const calendarStart = (new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() + 6) % 7
  const calendarDays = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate()

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={18} strokeWidth={2.5} /></div>
          <span className="brand-wordmark"><span className="brand-fit">fit</span><span className="brand-mate">mate</span></span>
        </div>
        <div className="sidebar-label">Workspace</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => goTo(label)} key={label}>
              <Icon size={18} />
              <span>{label}</span>
              {label === 'Progress' && <span className="nav-badge">3</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-label resources-label">Your plan</div>
        {user.role === 'ADMIN' && <><div className="sidebar-label resources-label">Administration</div><nav className="main-nav"><button className={`nav-item ${activeNav === 'Admin' ? 'active' : ''}`} onClick={() => goTo('Admin')}><ShieldCheck size={18} /><span>Admin dashboard</span></button><button className={`nav-item ${activeNav === 'Admin Exercises' ? 'active' : ''}`} onClick={() => goTo('Admin Exercises')}><Dumbbell size={18} /><span>Exercises</span></button><button className={`nav-item ${activeNav === 'Admin Foods' ? 'active' : ''}`} onClick={() => goTo('Admin Foods')}><Utensils size={18} /><span>Foods</span></button><button className={`nav-item ${activeNav === 'Workout Plans' ? 'active' : ''}`} onClick={() => goTo('Workout Plans')}><CalendarDays size={18} /><span>Workout plans</span></button><button className={`nav-item ${activeNav === 'Announcements' ? 'active' : ''}`} onClick={() => goTo('Announcements')}><Bell size={18} /><span>Announcements</span></button><button className={`nav-item ${activeNav === 'Content' ? 'active' : ''}`} onClick={() => goTo('Content')}><FileText size={18} /><span>Content</span></button></nav></>}
        <div className="sidebar-bottom">
          <button type="button" className="coach-card" onClick={() => goTo('AI Hub')}>
            <div className="coach-icon"><Zap size={17} /></div>
            <div><strong>Need a little push?</strong><p>Talk to your AI coach</p></div>
            <ArrowRight size={15} />
          </button>
          <button className="nav-item logout" onClick={() => { localStorage.removeItem('fitmate_token'); setUser(null) }}><LogOut size={18} /><span>Log out</span></button>
        </div>
      </aside>

      {mobileMenu && <button className="mobile-overlay" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X /></button>}

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="topbar-navigation"><button className="back-button" onClick={goBack} aria-label={previousNav ? 'Go back' : 'Back to landing page'}><ArrowLeft size={16} /> Back</button><div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{activeNav}</strong></div></div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Help" onClick={() => goTo('Help Desk')}><CircleHelp size={19} /></button>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => { setSettingsTab('notifications'); goTo('Settings') }}><Bell size={19} /><i /></button>
            <button className="user-menu" onClick={() => goTo('Settings')}>
              <div className="avatar">{user.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</div>
              <div className="user-name"><strong>{user.name}</strong><span>Free plan</span></div>
              <ChevronDown size={15} />
            </button>
          </div>
        </header>

        {activeNav === 'Dashboard' ? <div className="page-wrap dashboard-page">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} <span className="sun-dot">●</span></p>
              <h1>Good Morning, {dashboard?.user?.name || user.name} <span className="wave">👋</span></h1>
              <p className="welcome-copy">A little progress every day adds up to big changes.</p>
            </div>
            <div className="header-actions">
              <button className="secondary-button" onClick={() => setShowCalendar(true)}><CalendarDays size={17} /> View calendar</button>
              <button className="primary-button" onClick={() => goTo('Progress')}><Plus size={18} /> Log activity</button>
            </div>
          </section>

          <section className="hero-card">
            <div className="hero-copy">
              <div className="hero-kicker"><span className="pulse-dot" /> TODAY'S FOCUS</div>
              <h2>Build a body<br />you feel <em>good</em> in.</h2>
              <p>Your body deserves care, not punishment. Show up for yourself today with a workout that meets you where you are.</p>
              <button className="hero-button" onClick={() => goTo('Workouts')}><Play size={16} fill="currentColor" /> Start today's workout <ArrowRight size={16} /></button>
            </div>
            <div className="hero-illustration">
              <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
              <div className="hero-sun">✦</div>
              <div className="hero-stat stat-one"><Flame size={15} /><span><strong>4 day</strong> streak</span></div>
              <div className="hero-stat stat-two"><Trophy size={15} /><span><strong>82%</strong> weekly goal</span></div>
              <div className="hero-person"><div className="person-head" /><div className="person-body" /><div className="person-arm" /><div className="person-leg left" /><div className="person-leg right" /></div>
            </div>
          </section>

          <section className="stats-grid">
            {[{ ...quickStats[0], value: dashboard?.stats?.caloriesConsumed || 0, unit: `/ ${dashboard?.stats?.caloriesGoal || 2000} kcal` }, { ...quickStats[1], value: dashboard?.stats?.waterGlasses || 0, unit: `/ ${dashboard?.stats?.waterGoalGlasses || 8} glasses` }, { ...quickStats[2], value: dashboard?.stats?.steps || 0 }, { ...quickStats[3], value: dashboard?.stats?.activeMinutes || 0 }, { ...quickStats[4], value: dashboard?.stats?.sleepHours || 0 }].map(({ label, value, unit, change, icon: Icon, tone }) => (
              <div className="stat-card" key={label}>
                <div className={`stat-icon ${tone}`}><Icon size={18} /></div>
                <div className="stat-card-top"><span>{label}</span></div>
                <div className="stat-value">{value} <small>{unit}</small></div>
                <div className={`stat-change ${tone}`}><ArrowRight size={13} /> {change} <span>vs last week</span></div>
              </div>
            ))}
          </section>

          <section className="panel daily-goal-panel">
            <div className="panel-heading"><div><p className="section-kicker">TODAY'S GOAL</p><h3>{dashboard?.user?.goal || 'Build a healthy routine'}</h3></div><div className="goal-actions"><strong className="goal-percent">{dashboard?.stats?.goalPercent || 0}%</strong><button className="manual-edit-link" onClick={() => setShowTargetEditor((current) => !current)}>Adjust targets</button></div></div>
            <div className="progress-track goal-track"><i style={{ width: `${dashboard?.stats?.goalPercent || 0}%` }} /></div>
            <p className="goal-caption">Your daily progress uses your personalized targets. These are general estimates, not medical advice.</p>
            {showTargetEditor && <form className="target-editor" onSubmit={saveTargetOverrides}><label>Calories<input required type="number" min="1200" value={targetForm.calories || ''} onChange={(event) => setTargetForm({ ...targetForm, calories: event.target.value })} /></label><label>Water glasses<input required type="number" min="1" max="30" value={targetForm.waterGlasses || ''} onChange={(event) => setTargetForm({ ...targetForm, waterGlasses: event.target.value })} /></label><label>Steps<input required type="number" min="500" value={targetForm.stepCount || ''} onChange={(event) => setTargetForm({ ...targetForm, stepCount: event.target.value })} /></label><label>Workout minutes<input required type="number" min="0" value={targetForm.workoutMinutes || ''} onChange={(event) => setTargetForm({ ...targetForm, workoutMinutes: event.target.value })} /></label><button className="primary-button" type="submit">Save targets</button></form>}
          </section>

          <DailyCheckInWidget existingCheckIn={dashboard?.checkIn} onSubmitted={(checkIn) => { setDashboard((current) => ({ ...current, checkIn })); api.dashboardSummary().then(setDashboard).catch(() => {}) }} />

          <GamificationShelf data={dashboard?.gamification} />

          <div className="content-grid">
            <section className="panel progress-panel">
              <div className="panel-heading"><div><p className="section-kicker">YOUR PROGRESS</p><h3>Weekly activity</h3></div><span className="select-button">This week</span></div>
              <div className="chart-wrap">
                <div className="chart-y-labels"><span>60</span><span>40</span><span>20</span><span>0</span></div>
                <div className="chart-area">
                  <div className="chart-lines"><i /><i /><i /><i /></div>
                  <svg className="activity-chart" viewBox="0 0 600 190" preserveAspectRatio="none" role="img" aria-label="Weekly activity chart">
                    <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a98ce5" stopOpacity=".3" /><stop offset="1" stopColor="#a98ce5" stopOpacity="0" /></linearGradient></defs>
                    <path d="M0,143 C28,140 42,118 67,120 S102,144 126,111 S163,85 190,103 S221,131 250,96 S287,72 316,86 S348,108 378,71 S416,54 443,71 S471,94 501,56 S548,62 600,27 L600,190 L0,190Z" fill="url(#fill)" />
                    <path d="M0,143 C28,140 42,118 67,120 S102,144 126,111 S163,85 190,103 S221,131 250,96 S287,72 316,86 S348,108 378,71 S416,54 443,71 S471,94 501,56 S548,62 600,27" fill="none" stroke="#8864d3" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="501" cy="56" r="5" fill="#fff" stroke="#8864d3" strokeWidth="3" />
                  </svg>
                  <div className="chart-x-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                </div>
              </div>
              <div className="chart-footer"><span><i className="legend-dot" /> Activity minutes</span><strong>124 min <small>of 180 goal</small></strong></div>
            </section>

            <section className="panel streak-panel">
              <div className="panel-heading"><div><p className="section-kicker">KEEP IT GOING</p><h3>Your streak</h3></div></div>
              <div className="streak-number"><strong>04</strong><span>days</span></div>
              <div className="week-dots">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <div className={index < 4 ? 'day done' : index === 4 ? 'day today' : 'day'} key={`${day}-${index}`}><span>{day}</span><i>{index < 4 ? '✓' : ''}</i></div>)}</div>
              <div className="streak-message"><Flame size={18} /><span><strong>You're on fire!</strong><br />Just 3 more days to beat your record.</span></div>
            </section>
          </div>

          <section className="bottom-grid">
            <section className="panel workouts-panel">
              <div className="panel-heading"><div><p className="section-kicker">RECOMMENDED FOR YOU</p><h3>Next workouts</h3></div><button className="text-button" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show less' : 'See all'} <ArrowRight size={15} /></button></div>
              <div className="workout-list">{(showAll ? [...workoutItems, ...workoutItems] : workoutItems).map((workout, index) => <article className="workout-item" key={`${workout.title}-${index}`}><div className={`workout-image ${workout.color}`}><img src={workout.image} alt="" /><button aria-label={`Start ${workout.title}`} onClick={() => goTo('Workouts')}><Play size={15} fill="currentColor" /></button></div><div className="workout-details"><span className="workout-tag">{workout.tag}</span><h4>{workout.title}</h4><p>{workout.meta}</p></div><button className="item-arrow" aria-label={`Open ${workout.title}`} onClick={() => goTo('Workouts')}><ArrowRight size={17} /></button></article>)}</div>
            </section>
            <section className="panel ai-panel"><div className="ai-glow" /><div className="panel-heading"><div><p className="section-kicker">YOUR PERSONAL GUIDE</p><h3>Ask your AI coach</h3></div><div className="ai-spark"><Sparkles size={17} /></div></div><p className="ai-copy">Get a little more clarity on your next step. Your coach knows your goals and is here to help.</p><button type="button" className="coach-prompt" onClick={() => goTo('AI Hub')}><Search size={16} /><span>What do you want to work on?</span><ArrowRight size={16} /></button><div className="suggestion-row"><button onClick={() => goTo('AI Hub')}>Better sleep</button><button onClick={() => goTo('AI Hub')}>Meal ideas</button><button onClick={() => goTo('AI Hub')}>Motivation</button></div></section>
          </section>
          <footer className="footer"><span>FitMate <i>•</i> Your everyday wellness companion</span><span>Made for real life, one day at a time.</span></footer>
          {showCalendar && <div className="calendar-backdrop" role="presentation" onClick={() => setShowCalendar(false)}><section className="calendar-modal" role="dialog" aria-modal="true" aria-labelledby="calendar-title" onClick={(event) => event.stopPropagation()}><div className="calendar-modal-header"><div><p className="section-kicker">YOUR SCHEDULE</p><h2 id="calendar-title">{calendarMonth}</h2></div><button className="calendar-close" aria-label="Close calendar" onClick={() => setShowCalendar(false)}>×</button></div><div className="calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{Array.from({ length: calendarStart }).map((_, index) => <span className="calendar-empty" key={`empty-${index}`} />)}{Array.from({ length: calendarDays }, (_, index) => { const day = index + 1; const isToday = day === calendarDate.getDate(); return <span className={`calendar-day ${isToday ? 'today' : ''}`} key={day}>{day}</span> })}</div><div className="calendar-today"><CalendarDays size={17} /><div><strong>Today, {calendarDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</strong><span>Keep your workout, meals, and recovery goals in view.</span></div></div></section></div>}
        </div> : activeNav === 'AI Hub' ? <AIHubView user={user} onUserUpdate={setUser} /> : activeNav === 'Collab Space' ? <CollabSpaceView /> : activeNav === 'Help Desk' ? <HelpDeskView /> : activeNav === 'Nutrition' ? <NutritionPage /> : activeNav === 'Workouts' ? <WorkoutsPage user={user} onUserUpdate={setUser} /> : activeNav === 'Progress' ? <ProgressPage /> : activeNav === 'Achievements' ? <AchievementsPage /> : activeNav === 'Services' ? <ServicesPage /> : activeNav === 'Settings' ? <SettingsPage user={user} onUserUpdate={setUser} initialTab={settingsTab} /> : activeNav === 'Admin' ? <FeatureView view="Admin" /> : ['Admin Exercises', 'Admin Foods', 'Workout Plans', 'Announcements', 'Content'].includes(activeNav) ? <AdminManagementView view={activeNav} /> : <div className="page-wrap"><p className="empty-copy">Choose a FitMate page from the sidebar.</p></div>}
      </main>
    </div>
  )
}

export default App
