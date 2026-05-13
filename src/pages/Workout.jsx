import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { WORKOUTS, SCHEDULE, getTodayIndex, getWeekLabel } from '../data/workouts'

function ExerciseCard({ ex, isPremium }) {
  return (
    <div className="exercise-card">
      <h3 className="exercise-name">{ex.name}</h3>
      <div className="exercise-stats">
        <div className="stat"><span className="stat-label">Sets</span><span className="stat-value">{ex.sets}</span></div>
        <div className="stat"><span className="stat-label">Reps</span><span className="stat-value">{ex.reps}</span></div>
        <div className="stat"><span className="stat-label">Rest</span><span className="stat-value">{ex.rest}</span></div>
      </div>
      {isPremium ? (
        <div className="exercise-premium">
          <div className="premium-row"><span className="premium-label">Primary Muscles</span><span className="premium-value">{ex.muscles}</span></div>
          <div className="premium-row"><span className="premium-label">Form Cue</span><span className="premium-value">{ex.cue}</span></div>
          <div className="premium-row"><span className="premium-label">Progression Rule</span><span className="premium-value">{ex.progression}</span></div>
        </div>
      ) : (
        <div className="premium-locked">
          <div className="premium-lock-overlay">
            <span>&#128274;</span>
            <span>Form cues &amp; progression rules &mdash; <strong>Premium</strong></span>
          </div>
        </div>
      )}
    </div>
  )
}

function NutritionCard({ workout, isPremium }) {
  if (isPremium) {
    return (
      <div className="card nutrition-card">
        <div className="eyebrow">Daily Nutrition Brief</div>
        <h3 className="nutrition-title">{workout.label}</h3>
        <p>{workout.nutrition}</p>
        <div className="rationale-block">
          <div className="eyebrow">Program Rationale</div>
          <p style={{ margin: '10px 0 0' }}>{workout.rationale}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="card nutrition-card">
      <div className="eyebrow">Daily Nutrition Brief</div>
      <h3 className="nutrition-title">Fuel Your Session</h3>
      <div className="premium-lock-overlay" style={{ marginTop: 16 }}>
        <span>&#128274;</span>
        <span>Daily nutrition brief &amp; program rationale &mdash; <strong>Premium only.</strong></span>
      </div>
    </div>
  )
}

export default function Workout() {
  const { session } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!session) return
    supabase.from('profiles').select('role,subscription').eq('id', session.user.id).single()
      .then(({ data }) => {
        setIsPremium(data?.subscription === 'premium' || data?.role === 'admin')
        setLoaded(true)
      })
  }, [session])

  const idx = getTodayIndex()
  const workoutKey = SCHEDULE[idx]
  const workout = WORKOUTS[workoutKey]

  if (!loaded) {
    return (
      <PageTransition>
        <Header />
        <main className="workout-wrap">
          <p className="workout-status">Loading your program...</p>
        </main>
        <Footer />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <Header />
      <main className="workout-wrap">
        <div className="card day-header">
          <div>
            <div className="eyebrow">Today's Program</div>
            <h2>{workout.label}</h2>
            <div className="day-pills">
              <span className="pill">{workout.focus}</span>
              <span className="pill">Day {idx + 1} of {SCHEDULE.length} · {getWeekLabel(idx)}</span>
            </div>
          </div>
        </div>

        <div className="exercise-grid">
          {workout.exercises.map((ex, i) => (
            <ExerciseCard key={i} ex={ex} isPremium={isPremium} />
          ))}
        </div>

        <NutritionCard workout={workout} isPremium={isPremium} />

        {!isPremium && (
          <div className="card upgrade-cta">
            <div className="eyebrow">Premium</div>
            <h2>Get the Full System.</h2>
            <p className="lead">Unlock progression rules, form cues, primary muscle targets, and your daily nutrition brief — built for intermediate lifters who are done guessing.</p>
            <div className="actions">
              <Link to="/upgrade" className="btn primary">Upgrade — $19.99/mo</Link>
              <Link to="/free" className="btn">Ask on Free Board</Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </PageTransition>
  )
}
