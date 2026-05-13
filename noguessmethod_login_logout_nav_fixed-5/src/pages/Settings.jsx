import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const TIME_LABELS = {
  early_morning: 'Early Morning (5–7am)',
  morning: 'Morning (7–10am)',
  midday: 'Midday (10am–1pm)',
  afternoon: 'Afternoon (1–5pm)',
  evening: 'Evening (5–8pm)',
  night: 'Night (8pm+)',
}

function StatusMsg({ msg, ok }) {
  if (!msg) return null
  return <p className={`settings-status${ok === true ? ' ok' : ok === false ? ' err' : ''}`}>{msg}</p>
}

export default function Settings() {
  const { session } = useAuth()
  const [profile, setProfile] = useState(null)
  const [username, setUsername] = useState('')
  const [level, setLevel] = useState('')
  const [goal, setGoal] = useState('')
  const [phone, setPhone] = useState('')
  const [time, setTime] = useState('')
  const [pw, setPw] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [profileMsg, setProfileMsg] = useState({ msg: '', ok: null })
  const [trainingMsg, setTrainingMsg] = useState({ msg: '', ok: null })
  const [prefsMsg, setPrefsMsg] = useState({ msg: '', ok: null })
  const [pwMsg, setPwMsg] = useState({ msg: '', ok: null })

  useEffect(() => {
    if (!session) return
    supabase.from('profiles')
      .select('username,role,subscription,training_level,goal,preferred_time,phone_number')
      .eq('id', session.user.id).single()
      .then(({ data }) => {
        if (!data) return
        setProfile(data)
        setUsername(data.username || '')
        setLevel(data.training_level || '')
        setGoal(data.goal || '')
        setPhone(data.phone_number || '')
        setTime(data.preferred_time || '')
      })
  }, [session])

  const isPremium = profile?.subscription === 'premium' || profile?.role === 'admin'

  const saveProfile = async () => {
    if (!username.trim()) { setProfileMsg({ msg: 'Username cannot be empty.', ok: false }); return }
    const { error } = await supabase.from('profiles').update({ username }).eq('id', session.user.id)
    setProfileMsg(error ? { msg: error.message, ok: false } : { msg: 'Profile saved.', ok: true })
  }

  const saveTraining = async () => {
    const { error } = await supabase.from('profiles').update({ training_level: level, goal }).eq('id', session.user.id)
    setTrainingMsg(error ? { msg: error.message, ok: false } : { msg: 'Training saved.', ok: true })
  }

  const savePrefs = async () => {
    if (phone && !/^\+[1-9]\d{6,14}$/.test(phone)) {
      setPrefsMsg({ msg: 'Phone must be in international format: +1 212 555 0123', ok: false }); return
    }
    const { error } = await supabase.from('profiles').update({ preferred_time: time, phone_number: phone || null }).eq('id', session.user.id)
    setPrefsMsg(error ? { msg: error.message, ok: false } : { msg: 'Reminder settings saved.', ok: true })
  }

  const savePassword = async () => {
    if (!pw) { setPwMsg({ msg: 'Enter a new password.', ok: false }); return }
    if (pw !== pwConfirm) { setPwMsg({ msg: 'Passwords do not match.', ok: false }); return }
    if (pw.length < 8) { setPwMsg({ msg: 'Password must be at least 8 characters.', ok: false }); return }
    const { error } = await supabase.auth.updateUser({ password: pw })
    if (error) { setPwMsg({ msg: error.message, ok: false }); return }
    setPwMsg({ msg: 'Password updated.', ok: true })
    setPw(''); setPwConfirm('')
  }

  if (!profile) {
    return (
      <PageTransition>
        <Header />
        <p style={{ padding: '80px 0', textAlign: 'center', color: 'var(--muted)' }}>Loading your profile...</p>
        <Footer />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <Header />
      <main className="settings-wrap">
        <div className="card settings-panel">
          <div className="eyebrow">Settings</div>
          <img className="auth-logo" src="/assets/ngm-logo-square.jpeg" alt="NGM" />
          <h2>Your Profile.</h2>

          <div className="settings-section">
            <div className="settings-label">Profile</div>
            <div className="settings-row">
              <label>Username<input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" /></label>
            </div>
            <button className="btn primary" type="button" onClick={saveProfile}>Save Profile</button>
            <StatusMsg {...profileMsg} />
          </div>

          <div className="settings-section">
            <div className="settings-label">Training</div>
            <div className="settings-row">
              <label>Training Level
                <select value={level} onChange={e => setLevel(e.target.value)}>
                  <option value="">Select one</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </label>
              <label>Main Goal<input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Strength, plateau break, consistency..." /></label>
            </div>
            <button className="btn primary" type="button" onClick={saveTraining}>Save Training</button>
            <StatusMsg {...trainingMsg} />
          </div>

          <div className="settings-section">
            <div className="settings-label">Reminders</div>
            <div className="settings-row">
              <label>Phone Number for SMS<input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+1 212 555 0123" /></label>
              <label style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}>International format required (e.g. +1 for US). Leave blank to opt out of SMS.</label>
              <label>Preferred Workout Time
                <select value={time} onChange={e => setTime(e.target.value)}>
                  <option value="">No preference — skip SMS</option>
                  <option value="early_morning">Early Morning (5–7am ET)</option>
                  <option value="morning">Morning (7–10am ET)</option>
                  <option value="midday">Midday (10am–1pm ET)</option>
                  <option value="afternoon">Afternoon (1–5pm ET)</option>
                  <option value="evening">Evening (5–8pm ET)</option>
                  <option value="night">Night (8pm+ ET)</option>
                </select>
              </label>
            </div>
            <button className="btn primary" type="button" onClick={savePrefs}>Save Reminder Settings</button>
            <StatusMsg {...prefsMsg} />
          </div>

          <div className="settings-section">
            <div className="settings-label">Change Password</div>
            <div className="settings-row">
              <label>New Password<input value={pw} onChange={e => setPw(e.target.value)} type="password" placeholder="New password" /></label>
              <label>Confirm Password<input value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} type="password" placeholder="Confirm new password" /></label>
            </div>
            <button className="btn" type="button" onClick={savePassword}>Update Password</button>
            <StatusMsg {...pwMsg} />
          </div>
        </div>

        <div className="card summary-card">
          <div className="eyebrow">Account</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,42px)' }}>Quick View.</h2>
          <div className="summary-list">
            <div className="summary-row"><b>Email</b><span>{session?.user?.email || '—'}</span></div>
            <div className="summary-row"><b>Username</b><span>{username || '—'}</span></div>
            <div className="summary-row"><b>Member Since</b><span>{session ? new Date(session.user.created_at).toLocaleDateString() : '—'}</span></div>
            <div className="summary-row"><b>Subscription</b><span>{isPremium ? 'Premium' : 'Free'}</span></div>
            <div className="summary-row"><b>Training Level</b><span>{level || '—'}</span></div>
            <div className="summary-row"><b>Goal</b><span>{goal || '—'}</span></div>
            <div className="summary-row"><b>Workout Time</b><span>{time ? TIME_LABELS[time] : '—'}</span></div>
            <div className="summary-row"><b>SMS</b><span>{phone || 'Not set'}</span></div>
          </div>
          <div className="actions" style={{ marginTop: 22, flexDirection: 'column' }}>
            <Link className="btn primary" to="/workout">Today's Workout</Link>
            <Link className="btn" to="/account">Member Hub</Link>
            {!isPremium && <Link className="btn" to="/upgrade">Upgrade — $19.99/mo</Link>}
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  )
}
