import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { WORKOUTS, SCHEDULE, getTodayIndex, getWeekLabel } from '../data/workouts'

// ─── Log Workout Modal ────────────────────────────────────────────────────────

function SetRow({ setNumber, weight, reps, onChange }) {
  return (
    <div className="set-row">
      <span className="set-number">Set {setNumber}</span>
      <label className="set-input-wrap">
        <input
          type="number"
          inputMode="decimal"
          placeholder="lbs"
          value={weight}
          min={0}
          onChange={e => onChange('weight', e.target.value)}
          className="set-input"
        />
        <span className="set-input-unit">lbs</span>
      </label>
      <span className="set-sep">×</span>
      <label className="set-input-wrap">
        <input
          type="number"
          inputMode="numeric"
          placeholder="reps"
          value={reps}
          min={0}
          onChange={e => onChange('reps', e.target.value)}
          className="set-input"
        />
        <span className="set-input-unit">reps</span>
      </label>
    </div>
  )
}

function LogModal({ workout, workoutKey, idx, userId, onClose, onLogged }) {
  // Build initial state: { [exerciseName]: [{ weight: '', reps: '' }, ...] }
  const initialSets = Object.fromEntries(
    workout.exercises.map(ex => [
      ex.name,
      Array.from({ length: ex.sets }, () => ({ weight: '', reps: '' }))
    ])
  )
  const [sets, setSets] = useState(initialSets)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const modalRef = useRef()

  // Close on backdrop click
  function handleBackdrop(e) {
    if (e.target === modalRef.current) onClose()
  }

  function updateSet(exerciseName, setIndex, field, value) {
    setSets(prev => ({
      ...prev,
      [exerciseName]: prev[exerciseName].map((s, i) =>
        i === setIndex ? { ...s, [field]: value } : s
      )
    }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      // 1. Insert workout_log
      const { data: logData, error: logError } = await supabase
        .from('workout_logs')
        .insert({ user_id: userId, workout_key: workoutKey, day_index: idx })
        .select('id')
        .single()

      if (logError) throw logError

      const workoutLogId = logData.id

      // 2. Build set_logs rows (skip empty sets)
      const setRows = []
      for (const ex of workout.exercises) {
        const exSets = sets[ex.name]
        exSets.forEach((s, i) => {
          const repsVal = parseInt(s.reps)
          if (!repsVal || repsVal < 1) return // skip blank sets
          setRows.push({
            workout_log_id: workoutLogId,
            user_id: userId,
            exercise_name: ex.name,
            set_number: i + 1,
            weight: s.weight !== '' ? parseFloat(s.weight) : null,
            reps: repsVal,
          })
        })
      }

      if (setRows.length > 0) {
        const { error: setsError } = await supabase
          .from('set_logs')
          .insert(setRows)
        if (setsError) throw setsError
      }

      onLogged()
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" ref={modalRef} onClick={handleBackdrop}>
      <div className="modal-sheet">
        <div className="modal-header">
          <div>
            <div className="eyebrow">Log Workout</div>
            <h3 className="modal-title">{workout.label}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {workout.exercises.map(ex => (
            <div key={ex.name} className="log-exercise">
              <div className="log-exercise-header">
                <span className="log-exercise-name">{ex.name}</span>
                <span className="log-exercise-meta">{ex.sets} sets · {ex.reps} reps</span>
              </div>
              <div className="set-rows">
                {sets[ex.name].map((s, i) => (
                  <SetRow
                    key={i}
                    setNumber={i + 1}
                    weight={s.weight}
                    reps={s.reps}
                    onChange={(field, val) => updateSet(ex.name, i, field, val)}
                  />
                ))}
              </div>
            </div>
          ))}

          {error && <p className="log-error">{error}</p>}
        </div>

        <div className="modal-footer">
          <p className="log-hint">Leave weight blank for bodyweight exercises.</p>
          <button
            className="btn primary full-width"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Workout'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── PR Banner ────────────────────────────────────────────────────────────────

function PRBanner({ prs }) {
  if (!prs || prs.length === 0) return null
  return (
    <div className="pr-banner">
      <span className="pr-trophy">🏆</span>
      <div className="pr-text">
        <strong>New PR{prs.length > 1 ? 's' : ''}!</strong>{' '}
        {prs.map((pr, i) => (
          <span key={i}>
            {pr.exercise_name} — {pr.weight} lbs × {pr.reps} reps
            {i < prs.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Exercise Card ────────────────────────────────────────────────────────────

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

// ─── Nutrition Card ───────────────────────────────────────────────────────────

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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Workout() {
  const { session } = useAuth()
  const [isPremium, setIsPremium]   = useState(false)
  const [joinedAt, setJoinedAt]     = useState(null)
  const [loaded, setLoaded]         = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const [newPRs, setNewPRs]         = useState([])
  const [loggedToday, setLoggedToday] = useState(false)

  useEffect(() => {
    if (!session) return
    supabase
      .from('profiles')
      .select('role, subscription, joined_at')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('Profile fetch error:', error)
        setIsPremium(data?.subscription === 'premium' || data?.role === 'admin')
        setJoinedAt(data?.joined_at ?? null)
        setLoaded(true)
      })
  }, [session])

  // Check if already logged today
  useEffect(() => {
    if (!session) return
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('workout_logs')
      .select('id')
      .eq('user_id', session.user.id)
      .gte('logged_at', today + 'T00:00:00')
      .lte('logged_at', today + 'T23:59:59')
      .then(({ data }) => {
        if (data && data.length > 0) setLoggedToday(true)
      })
  }, [session])

  const idx        = getTodayIndex(joinedAt)
  const workoutKey = SCHEDULE[idx]
  const workout    = WORKOUTS[workoutKey]

  // Called after a workout is saved — check for new PRs
  async function handleLogged() {
    setLoggedToday(true)
    // Fetch PRs set today
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('personal_records')
      .select('exercise_name, weight, reps')
      .eq('user_id', session.user.id)
      .gte('achieved_at', today + 'T00:00:00')
    if (data && data.length > 0) setNewPRs(data)
  }

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

        {newPRs.length > 0 && <PRBanner prs={newPRs} />}

        <div className="card day-header">
          <div>
            <div className="eyebrow">Today's Program</div>
            <h2>{workout.label}</h2>
            <div className="day-pills">
              <span className="pill">{workout.focus}</span>
              <span className="pill">Day {idx + 1} of {SCHEDULE.length} · {getWeekLabel(idx)}</span>
            </div>
          </div>
          <button
            className={`btn log-btn ${loggedToday ? 'logged' : 'primary'}`}
            onClick={() => !loggedToday && setShowModal(true)}
            disabled={loggedToday}
          >
            {loggedToday ? '✓ Logged' : 'Log Workout'}
          </button>
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

      {showModal && (
        <LogModal
          workout={workout}
          workoutKey={workoutKey}
          idx={idx}
          userId={session.user.id}
          onClose={() => setShowModal(false)}
          onLogged={handleLogged}
        />
      )}
    </PageTransition>
  )
}
