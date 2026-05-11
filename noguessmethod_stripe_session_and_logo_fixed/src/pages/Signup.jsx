import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setStatus('Passwords do not match.'); return }
    setLoading(true)
    setStatus('')
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/account`,
        },
      })
      if (error) throw error
      if (data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, username, role: 'member' })
      }
      setStatus('Account created. Check your email if confirmation is required.')
    } catch (err) {
      setStatus(err.message || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <Header />
      <main className="auth">
        <section className="card auth-panel">
          <div className="eyebrow">Create Account</div>
          <img className="auth-logo" src="/assets/ngm-logo-square.jpeg" alt="NGM" />
          <h2>Create Account</h2>
          <p>Create your NoGuessMethod account and access the member hub.</p>
          <form className="form" onSubmit={handleSubmit}>
            <label>Username<input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required /></label>
            <label>Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" required /></label>
            <label>Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" required /></label>
            <label>Confirm Password<input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" placeholder="Confirm password" required /></label>
            <button className="primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
          </form>
          <p className="status">Already have an account? <Link to="/login">Login</Link></p>
          {status && <div className="status">{status}</div>}
        </section>
        <section className="card logo-stage">
          <img src="/assets/ngm-logo-banner.jpeg" alt="NoGuessMethod" />
        </section>
      </main>
      <Footer />
    </PageTransition>
  )
}
