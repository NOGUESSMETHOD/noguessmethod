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
        const { error: profileError } = await supabase.from('profiles').insert({ id: data.user.id, username, role: 'member' })
        if (profileError) throw new Error('Account created but profile setup failed: ' + profileError.message)
      }
      setStatus('Account created. Check your email if confirmation is required.')
    } catch (err) {
      console.error('Signup error:', err)
      setStatus(err.message || JSON.stringify(err) || 'Signup failed.')
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
          <h2>Create Account</h
