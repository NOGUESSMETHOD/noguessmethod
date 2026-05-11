import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [wlName, setWlName] = useState('')
  const [wlEmail, setWlEmail] = useState('')
  const [wlLevel, setWlLevel] = useState('')
  const [wlGoal, setWlGoal] = useState('')
  const [wlStatus, setWlStatus] = useState('')
  const [wlLoading, setWlLoading] = useState(false)

  const handleWaitlist = async (e) => {
    e.preventDefault()
    setWlLoading(true)
    setWlStatus('')
    try {
      const { error } = await supabase.from('beta_users').insert({
        name: wlName, email: wlEmail, training_level: wlLevel, goal: wlGoal,
      })
      if (error) throw error
      setWlStatus("You're on the list. We'll be in touch.")
      setWlName(''); setWlEmail(''); setWlLevel(''); setWlGoal('')
    } catch (err) {
      setWlStatus(err.message || 'Something went wrong. Try again.')
    } finally {
      setWlLoading(false)
    }
  }

  return (
    <PageTransition>
      <Header />
      <main className="wrap">
        <section className="hero">
          <div className="card hero-copy">
            <div className="eyebrow">Structured training for intermediate lifters</div>
            <h1>Stop<br />Guessing.<br />Start<br />Lifting.</h1>
            <p className="lead">You've been training for a year or more. You're stuck. NoGuessMethod gives you a structured daily system — so you know exactly what to do, how to do it, and when to push more.</p>
            <div className="actions">
              <Link className="btn primary" to="/signup">Start Free</Link>
              <a className="btn" href="#how">See How It Works</a>
            </div>
            <Link className="sub-link" to="/free">Already lifting? Jump to the Free Board</Link>
            <div className="feature-row">
              <div className="mini"><strong>Daily Program</strong><span>A new structured workout every day. Push, Pull, Legs, Core, Recovery.</span></div>
              <div className="mini"><strong>Clear Progression</strong><span>Know exactly when to add weight and when to hold. No more guessing.</span></div>
              <div className="mini"><strong>Free to Start</strong><span>Full access to daily workouts at no cost. Upgrade when you're ready.</span></div>
            </div>
          </div>
          <div className="card logo-stage">
            <img src="/assets/ngm-logo-banner.jpeg" alt="NoGuessMethod" />
          </div>
        </section>
      </main>

      <hr className="lp-divider" />

      <section className="lp-section">
        <div className="card problem-card">
          <div className="eyebrow">The Problem</div>
          <h2>Most intermediate lifters<br />plateau for the same reasons.</h2>
          <p className="lead" style={{ maxWidth: 600, marginBottom: 28 }}>Beginner programs are behind you. Advanced programming isn't for you yet. The middle is where most lifters stall — not because they're lazy, but because nothing tells them what comes next.</p>
          <div className="feature-row">
            <div className="mini"><strong>The Plateau</strong><span>Same weight, same reps, same exercises. Progress stopped without a clear reason why.</span></div>
            <div className="mini"><strong>The Guesswork</strong><span>Searching Reddit for answers. Getting ten different opinions. Committing to none of them.</span></div>
            <div className="mini"><strong>The Drop-Off</strong><span>Inconsistency sets in when you don't know what you're working toward. The gym stops feeling worth it.</span></div>
          </div>
        </div>
      </section>

      <hr className="lp-divider" />

      <section className="lp-section" id="how">
        <div className="lp-header">
          <div className="eyebrow">How It Works</div>
          <h2>Three steps.<br />No confusion.</h2>
        </div>
        <div className="how-steps">
          <div className="step card"><div className="step-num">01</div><strong>Create a free account</strong><p>Sign up in under a minute. No credit card required. Your account connects everything as NGM grows.</p></div>
          <div className="step card"><div className="step-num">02</div><strong>Get today's workout</strong><p>A 30-day rotating PPL program updates daily — Push, Pull, Legs, Core, and Active Recovery. Structured for intermediate lifters, not beginners.</p></div>
          <div className="step card"><div className="step-num">03</div><strong>Follow the system</strong><p>Free members get the full workout. Premium members get the exact reason behind every set, how to progress it, and how to fuel it.</p></div>
        </div>
      </section>

      <hr className="lp-divider" />

      <section className="lp-section">
        <div className="lp-header">
          <div className="eyebrow">Pricing</div>
          <h2>Free to start.<br />Premium to progress.</h2>
          <p>Every member gets a real daily program. Premium unlocks the full breakdown — the why and the how behind every exercise.</p>
        </div>
        <div className="tier-compare">
          <div className="card tier-card">
            <div className="tier-top">
              <span className="tier-label">Free</span>
              <div className="tier-price">$0</div>
              <div className="tier-sub">Always free with a member account</div>
            </div>
            <ul className="tier-list">
              <li className="on">Daily structured workout</li>
              <li className="on">Exercise, sets, reps, rest time</li>
              <li className="on">30-day rotating PPL program</li>
              <li className="on">Free Board access</li>
              <li className="off">Form cues</li>
              <li className="off">Primary muscles</li>
              <li className="off">Progression rules</li>
              <li className="off">Daily nutrition brief</li>
            </ul>
            <div className="tier-action">
              <Link className="btn" to="/signup" style={{ width: '100%', display: 'flex' }}>Create Free Account</Link>
            </div>
          </div>
          <div className="card tier-card tier-featured">
            <div className="tier-top">
              <span className="tier-label">Premium</span>
              <div className="tier-price">$19.99<span className="tier-per">/mo</span></div>
              <div className="tier-sub">Cancel anytime. No contracts.</div>
            </div>
            <ul className="tier-list">
              <li className="on">Everything in Free</li>
              <li className="on">Form cues for every exercise</li>
              <li className="on">Primary muscles targeted</li>
              <li className="on">Exact progression rules</li>
              <li className="on">Daily nutrition brief</li>
              <li className="on">Program rationale</li>
              <li className="on">Early access to new features</li>
            </ul>
            <div className="tier-action">
              <Link className="btn primary" to="/upgrade" style={{ width: '100%', display: 'flex' }}>Upgrade — $19.99/mo</Link>
            </div>
          </div>
        </div>
      </section>

      <hr className="lp-divider" />

      <section className="lp-section" id="beta" style={{ paddingBottom: 80 }}>
        <div className="card form-card" style={{ margin: '0 auto' }}>
          <div className="eyebrow">Beta Access</div>
          <h2>Get Early Access.</h2>
          <p>Join the waitlist. Be first when SMS reminders and personalized programming launch.</p>
          <form className="form" onSubmit={handleWaitlist}>
            <label>Name<input value={wlName} onChange={e => setWlName(e.target.value)} placeholder="Your name" required /></label>
            <label>Email<input value={wlEmail} onChange={e => setWlEmail(e.target.value)} type="email" placeholder="you@example.com" required /></label>
            <label>Training Level
              <select value={wlLevel} onChange={e => setWlLevel(e.target.value)} required>
                <option value="">Select one</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
            <label>Main Goal<input value={wlGoal} onChange={e => setWlGoal(e.target.value)} placeholder="Strength, plateau break, consistency..." /></label>
            <button className="primary" type="submit" disabled={wlLoading}>{wlLoading ? 'Joining...' : 'Join Waitlist'}</button>
            {wlStatus && <p className="status">{wlStatus}</p>}
          </form>
        </div>
      </section>

      <Footer />
    </PageTransition>
  )
}
