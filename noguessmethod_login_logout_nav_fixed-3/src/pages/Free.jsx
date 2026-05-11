import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabase'

export default function Free() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [board, setBoard] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus('')
    try {
      const { error } = await supabase.from('free_posts').insert({ name, email, board, message, status: 'pending' })
      if (error) throw error
      setStatus('Submitted. Your message is pending review.')
      setName(''); setEmail(''); setBoard(''); setMessage('')
    } catch (err) {
      setStatus(err.message || 'Submission failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <Header />
      <main className="wrap">
        <section className="hero">
          <div className="card hero-copy">
            <div className="eyebrow">Free Member Board</div>
            <h1>No Guess.<br />Just<br />Check In.</h1>
            <p className="lead">A lightweight message board for free members to submit training questions, progress updates, and consistency wins while the beta grows.</p>
            <div className="feature-row">
              <div className="mini"><strong>Weekly Check-In</strong><span>Training days, misses, and fixes.</span></div>
              <div className="mini"><strong>Plateau Questions</strong><span>Ask what to do when progress stalls.</span></div>
              <div className="mini"><strong>Exercise Swaps</strong><span>Keep structure without guessing.</span></div>
            </div>
            <div className="actions">
              <a className="btn primary" href="#post">Enter Board</a>
              <Link className="btn" to="/">Main Site</Link>
            </div>
          </div>
          <div className="card logo-stage"><img src="/assets/ngm-logo-banner.jpeg" alt="NoGuessMethod" /></div>
        </section>
        <section className="board">
          <div className="card hero-copy">
            <div className="eyebrow">Pinned Boards</div>
            <div className="thread"><h3>Weekly Check-In</h3><p>Post training days completed, missed sessions, and what you need to fix this week.</p></div>
            <div className="thread"><h3>Plateau Questions</h3><p>Ask what to do when your lifts stall, your split feels stale, or recovery falls off.</p></div>
            <div className="thread"><h3>Exercise Swaps</h3><p>Share questions about substitutions, setup cues, and avoiding random changes.</p></div>
          </div>
          <div className="card hero-copy" id="post">
            <div className="eyebrow">Submit to Board</div>
            <h2>Free Member Message</h2>
            <p>Submissions go to your team first so posts can be reviewed before publishing.</p>
            <form className="form" onSubmit={handleSubmit}>
              <label>Name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required /></label>
              <label>Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" required /></label>
              <label>Board
                <select value={board} onChange={e => setBoard(e.target.value)} required>
                  <option value="">Choose a board</option>
                  <option>Weekly Check-In</option>
                  <option>Plateau Questions</option>
                  <option>Exercise Swaps</option>
                </select>
              </label>
              <label>Message<textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message..." required /></label>
              <button className="primary" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Message'}</button>
            </form>
            {status && <div className="status">{status}</div>}
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  )
}
