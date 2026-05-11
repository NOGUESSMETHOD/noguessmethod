import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate('/account')
    } catch (err) {
      setStatus(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <Header />
      <main className="auth">
        <section className="card auth-panel">
          <div className="eyebrow">Member Login</div>
          <img className="auth-logo" src="/assets/ngm-logo-square.jpeg" alt="NGM" />
          <h2>Welcome Back.</h2>
          <p>Sign in to your NoGuessMethod account and continue from your member hub.</p>
          <form className="form" onSubmit={handleSubmit}>
            <label>Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" required /></label>
            <label>Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" required /></label>
            <button className="primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
          </form>
          <p className="status">Need an account? <Link to="/signup">Create one</Link></p>
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
