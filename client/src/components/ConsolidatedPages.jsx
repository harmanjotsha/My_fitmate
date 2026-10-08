import { useState } from 'react'
import { Activity, Droplets, Dumbbell, Moon, Trophy, UserRound, Bell, Settings } from 'lucide-react'
import { FeatureView, ProgressView, ProfileView, ChallengesView, AchievementsView, SettingsView } from './FeatureView.jsx'
import { HydrationView, NotificationsView, SleepView, ServicesView } from './WellnessViews.jsx'
import FitJourneyView from './FitJourneyView.jsx'

function Tabs({ tabs, active, onChange }) {
  return <nav className="page-tabs" aria-label="Page sections">{tabs.map(({ id, label, icon: Icon }) => <button className={active === id ? 'active' : ''} onClick={() => onChange(id)} key={id}><Icon size={16} /> {label}</button>)}</nav>
}

export function NutritionPage() {
  const [tab, setTab] = useState('meals')
  return <section className="consolidated-page"><header className="consolidated-header"><p className="section-kicker">NUTRITION</p><h2>Meals & hydration</h2><p>Log naturally, understand your meals, and keep water within reach.</p></header><Tabs active={tab} onChange={setTab} tabs={[{ id: 'meals', label: 'Meals', icon: Activity }, { id: 'hydration', label: 'Hydration', icon: Droplets }]} />{tab === 'meals' ? <FeatureView view="Nutrition" /> : <HydrationView />}</section>
}

export function WorkoutsPage({ user, onUserUpdate }) {
  const [tab, setTab] = useState('workouts')
  return <section className="consolidated-page"><header className="consolidated-header"><p className="section-kicker">MOVEMENT</p><h2>Workouts</h2><p>Explore exercises and keep your planned and completed sessions together.</p></header><Tabs active={tab} onChange={setTab} tabs={[{ id: 'library', label: 'Library', icon: Activity }, { id: 'workouts', label: 'My Workouts', icon: Dumbbell }]} />{tab === 'library' ? <FeatureView view="Library" user={user} onUserUpdate={onUserUpdate} /> : <FeatureView view="My workouts" user={user} onUserUpdate={onUserUpdate} />}</section>
}

export function ProgressPage() {
  const [tab, setTab] = useState('trends')
  return <section className="consolidated-page progress-page"><header className="consolidated-header"><p className="section-kicker">YOUR JOURNEY</p><h2>Progress</h2><p>See patterns across your movement, rest, and consistency.</p></header><Tabs active={tab} onChange={setTab} tabs={[{ id: 'trends', label: 'Trends', icon: Activity }, { id: 'journey', label: 'Fit Journey', icon: Trophy }, { id: 'sleep', label: 'Sleep', icon: Moon }]} />{tab === 'trends' ? <ProgressView /> : tab === 'journey' ? <FitJourneyView /> : <SleepView />}</section>
}

export function AchievementsPage() {
  const [tab, setTab] = useState('badges')
  return <section className="consolidated-page"><header className="consolidated-header"><p className="section-kicker">CELEBRATE CONSISTENCY</p><h2>Achievements</h2><p>Small wins, shared goals, and progress you can feel proud of.</p></header><Tabs active={tab} onChange={setTab} tabs={[{ id: 'badges', label: 'Badges & XP', icon: Trophy }, { id: 'challenges', label: 'Challenges', icon: Activity }]} />{tab === 'badges' ? <AchievementsView /> : <ChallengesView />}</section>
}

export function SettingsPage({ user, onUserUpdate, initialTab = 'profile' }) {
  const [tab, setTab] = useState(initialTab)
  return <section className="consolidated-page"><header className="consolidated-header"><p className="section-kicker">ACCOUNT</p><h2>Settings</h2><p>Manage your profile, notifications, and account preferences.</p></header><Tabs active={tab} onChange={setTab} tabs={[{ id: 'profile', label: 'Profile', icon: UserRound }, { id: 'notifications', label: 'Notifications', icon: Bell }, { id: 'account', label: 'Account', icon: Settings }]} />{tab === 'profile' ? <ProfileView user={user} onUserUpdate={onUserUpdate} /> : tab === 'notifications' ? <NotificationsView /> : <SettingsView />}</section>
}

export function ServicesPage() { return <section className="consolidated-page"><header className="consolidated-header"><p className="section-kicker">SUPPORT</p><h2>Services</h2><p>Request help and follow each request through its status.</p></header><ServicesView /></section> }
