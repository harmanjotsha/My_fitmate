import { useState } from 'react'
import { Apple, Dumbbell, MessageCircle, Utensils } from 'lucide-react'
import { FeatureView, FoodAnalyzer } from './FeatureView.jsx'
import { MealPlannerView, WorkoutGeneratorView } from './PlanningViews.jsx'

const tabs = [
  { id: 'coach', label: 'AI Coach', icon: MessageCircle },
  { id: 'food', label: 'Food Analyzer', icon: Apple },
  { id: 'workout', label: 'Workout Generator', icon: Dumbbell },
  { id: 'meals', label: 'Meal Planner', icon: Utensils },
]

export default function AIHubView({ user, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('coach')
  const content = activeTab === 'coach' ? <FeatureView view="AI coach" user={user} onUserUpdate={onUserUpdate} /> : activeTab === 'food' ? <section className="feature-page"><FoodAnalyzer /></section> : activeTab === 'workout' ? <WorkoutGeneratorView /> : <MealPlannerView />
  return <section className="ai-hub"><header className="ai-hub-header"><div><p className="section-kicker">FITMATE AI</p><h2>Your AI wellness space</h2><p>Ask, analyze, and plan with your profile and activity context.</p></div><div className="ai-hub-badge">✨ Profile-aware</div></header><nav className="ai-hub-tabs" aria-label="AI tools">{tabs.map(({ id, label, icon: Icon }) => <button className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)} key={id}><Icon size={17} /><span>{label}</span></button>)}</nav>{content}</section>
}