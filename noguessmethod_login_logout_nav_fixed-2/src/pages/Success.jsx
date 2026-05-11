import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

export default function Success() {
  return (
    <PageTransition>
      <Header />
      <main className="member-hero">
        <section className="card member-card">
          <div className="eyebrow">Payment Confirmed</div>
          <img className="auth-logo" src="/assets/ngm-logo-square.jpeg" alt="NGM" />
          <h2>You're Premium.</h2>
          <p>Your subscription is active. Everything is unlocked — progression rules, form cues, muscle targets, and your daily nutrition brief.</p>

          <div className="membership-box">
            <div className="membership-top">
              <strong>Premium Member</strong>
              <span>Full NoGuessMethod access</span>
            </div>
            <div className="membership-perks">
              <div className="perk"><b>Daily Workout</b><span>Unlocked</span></div>
              <div className="perk"><b>Form Cues</b><span>Unlocked</span></div>
              <div className="perk"><b>Progression Rules</b><span>Unlocked</span></div>
              <div className="perk"><b>Daily Nutrition Brief</b><span>Unlocked</span></div>
            </div>
          </div>

          <div className="actions">
            <Link className="btn primary" to="/workout">Go to Today's Workout</Link>
            <Link className="btn" to="/account">Member Hub</Link>
          </div>
        </section>

        <section className="card hero-copy">
          <div className="eyebrow">What's Unlocked</div>
          <h2>The Full System.</h2>
          <p className="lead">Every exercise in your daily program now includes the full breakdown — not just what to do, but exactly how to do it and when to push more.</p>
          <div className="feature-row">
            <div className="mini"><strong>Form Cues</strong><span>Technique notes for each exercise so every rep is intentional.</span></div>
            <div className="mini"><strong>Progression Rules</strong><span>Know exactly when and how to add weight. No more guessing.</span></div>
            <div className="mini"><strong>Nutrition Brief</strong><span>Daily fueling guidance matched to your session type.</span></div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  )
}
