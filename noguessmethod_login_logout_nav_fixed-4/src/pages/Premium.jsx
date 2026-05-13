import { useMemo, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

const swaps = {
  squat: ['Leg press', 'Goblet squat', 'Bulgarian split squat'],
  bench: ['Dumbbell press', 'Push-up', 'Chest press machine'],
  deadlift: ['Romanian deadlift', 'Hip thrust', 'Cable pull-through'],
  row: ['Cable row', 'Chest-supported row', 'Lat pulldown'],
  shoulder: ['Machine shoulder press', 'Landmine press', 'Lateral raise'],
}

export default function Premium() {
  const [energy, setEnergy] = useState(7)
  const [sleep, setSleep] = useState(7)
  const [soreness, setSoreness] = useState(3)
  const [goal, setGoal] = useState('Build muscle')
  const [exercise, setExercise] = useState('squat')
  const [notes, setNotes] = useState('')

  const readiness = useMemo(() => {
    const score = Math.round(((Number(energy) + Number(sleep) + (10 - Number(soreness))) / 30) * 100)
    if (score >= 75) return { score, label: 'Push progression today' }
    if (score >= 55) return { score, label: 'Train normal and keep form strict' }
    return { score, label: 'Reduce load and prioritize recovery' }
  }, [energy, sleep, soreness])

  const plan = useMemo(() => {
    if (goal === 'Build muscle') return 'Use 8–12 reps, controlled tempo, and add weight once all sets hit the top of the rep range.'
    if (goal === 'Strength') return 'Use 3–6 reps on main lifts, longer rest, and add weight only when bar speed stays clean.'
    return 'Use moderate weight, steady pace, and keep 1–2 reps in reserve to stay consistent.'
  }, [goal])

  return (
    <PageTransition>
      <Header />
      <main className="premium-wrap">
        <section className="card premium-hero">
          <div>
            <div className="eyebrow">Premium Control Panel</div>
            <h1>Train with<br />less guessing.</h1>
            <p className="lead">Use this page to check readiness, plan today’s focus, swap exercises, and keep a quick workout log.</p>
          </div>
          <div className="readiness-score">
            <span>{readiness.score}</span>
            <b>{readiness.label}</b>
          </div>
        </section>

        <section className="premium-grid">
          <div className="card premium-tool">
            <h2>Readiness</h2>
            <label>Energy <input type="range" min="1" max="10" value={energy} onChange={e=>setEnergy(e.target.value)} /></label>
            <label>Sleep <input type="range" min="1" max="10" value={sleep} onChange={e=>setSleep(e.target.value)} /></label>
            <label>Soreness <input type="range" min="1" max="10" value={soreness} onChange={e=>setSoreness(e.target.value)} /></label>
          </div>

          <div className="card premium-tool">
            <h2>Goal Plan</h2>
            <label>Goal
              <select value={goal} onChange={e=>setGoal(e.target.value)}>
                <option>Build muscle</option><option>Strength</option><option>Consistency</option>
              </select>
            </label>
            <p>{plan}</p>
          </div>

          <div className="card premium-tool">
            <h2>Exercise Swap</h2>
            <label>Exercise
              <select value={exercise} onChange={e=>setExercise(e.target.value)}>
                {Object.keys(swaps).map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
            <div className="swap-list">{swaps[exercise].map(x => <span key={x}>{x}</span>)}</div>
          </div>

          <div className="card premium-tool">
            <h2>Quick Log</h2>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Example: Bench 135x8, 135x8, 135x7. Felt strong." />
            <p>{notes ? 'Saved locally for now. Supabase sync can be added after the premium table is created.' : 'Write a quick note after your workout.'}</p>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  )
}
