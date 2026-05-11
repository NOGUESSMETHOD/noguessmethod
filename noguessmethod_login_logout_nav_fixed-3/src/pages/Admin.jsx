import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Admin() {
  const { session } = useAuth()
  const [authorized, setAuthorized] = useState(false)
  const [authError, setAuthError] = useState('')
  const [tab, setTab] = useState('members')
  const [members, setMembers] = useState([])
  const [posts, setPosts] = useState([])
  const [beta, setBeta] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) return
    supabase.from('profiles').select('role').eq('id', session.user.id).single()
      .then(({ data }) => {
        if (data?.role !== 'admin') { setAuthError('Access denied. Admin only.'); return }
        setAuthorized(true)
        loadData(session.access_token)
      })
  }, [session])

  const loadData = async (token) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin-data', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setMembers(data.members)
      setPosts(data.posts)
      setBeta(data.beta)
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const setSub = async (targetId, subscription, btn) => {
    btn.disabled = true; btn.textContent = '...'
    try {
      const res = await fetch('/api/admin-set-subscription', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, subscription }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Failed')
      setMembers(prev => prev.map(m => m.id === targetId ? { ...m, subscription } : m))
    } catch (err) {
      btn.disabled = false
      btn.textContent = subscription === 'premium' ? 'Make Premium' : 'Revoke'
      alert(err.message)
    }
  }

  const setPostStatus = async (postId, status) => {
    try {
      const res = await fetch('/api/admin-update-post', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, status }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Failed')
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, status } : p))
    } catch (err) {
      alert(err.message)
    }
  }

  if (authError) {
    return (
      <PageTransition>
        <Header />
        <p className="admin-loading">{authError}</p>
        <Footer />
      </PageTransition>
    )
  }

  if (!authorized) {
    return (
      <PageTransition>
        <Header />
        <p className="admin-loading">Checking authorization...</p>
        <Footer />
      </PageTransition>
    )
  }

  const filteredMembers = search
    ? members.filter(m => m.email.toLowerCase().includes(search.toLowerCase()) || m.username.toLowerCase().includes(search.toLowerCase()))
    : members

  return (
    <PageTransition>
      <Header />
      <div className="admin-wrap">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <div className="eyebrow">Admin Dashboard</div>
            <h2 style={{ margin: '6px 0 0' }}>Control Panel.</h2>
          </div>
          <button className="btn" onClick={() => loadData(session.access_token)} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="stats-bar">
          <div className="stat-card"><div className="stat-num">{members.length}</div><div className="stat-lbl">Total Members</div></div>
          <div className="stat-card"><div className="stat-num">{members.filter(m => m.subscription === 'premium').length}</div><div className="stat-lbl">Premium</div></div>
          <div className="stat-card"><div className="stat-num">{posts.length}</div><div className="stat-lbl">Free Board Posts</div></div>
          <div className="stat-card"><div className="stat-num">{beta.length}</div><div className="stat-lbl">Waitlist Signups</div></div>
        </div>

        <div className="admin-tabs">
          {['members', 'posts', 'waitlist'].map(t => (
            <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'members' ? 'Members' : t === 'posts' ? 'Free Board' : 'Waitlist'}
            </button>
          ))}
        </div>

        {tab === 'members' && (
          <div className="admin-panel visible">
            <div className="admin-section">
              <div className="admin-section-head">
                <h3>All Members</h3>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search email or username..." style={{ background: 'rgba(0,0,0,.3)', border: '1px solid var(--line)', borderRadius: 12, padding: '8px 14px', color: '#fff', fontSize: 13, width: 220 }} />
              </div>
              {filteredMembers.length === 0 ? (
                <div className="empty-row">{search ? 'No members match that search.' : 'No members yet.'}</div>
              ) : (
                <table className="admin-tbl">
                  <thead><tr><th>Email</th><th>Username</th><th>Status</th><th>Level</th><th>Goal</th><th>Joined</th><th>Action</th></tr></thead>
                  <tbody>
                    {filteredMembers.map(m => {
                      const isPrem = m.subscription === 'premium'
                      const isAdm = m.role === 'admin'
                      return (
                        <tr key={m.id}>
                          <td>{m.email}</td>
                          <td>{m.username}</td>
                          <td>
                            <span className={`badge ${isPrem ? 'badge-premium' : 'badge-free'}`}>{isPrem ? 'Premium' : 'Free'}</span>
                            {isAdm && <span className="badge badge-admin" style={{ marginLeft: 6 }}>Admin</span>}
                          </td>
                          <td>{m.training_level}</td>
                          <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.goal}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{fmt(m.created_at)}</td>
                          <td>
                            {isAdm ? (
                              <span style={{ color: 'var(--soft)', fontSize: 12 }}>Admin</span>
                            ) : isPrem ? (
                              <button className="tbl-btn danger" onClick={e => setSub(m.id, 'free', e.currentTarget)}>Revoke</button>
                            ) : (
                              <button className="tbl-btn" onClick={e => setSub(m.id, 'premium', e.currentTarget)}>Make Premium</button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === 'posts' && (
          <div className="admin-panel visible">
            <div className="admin-section">
              <div className="admin-section-head"><h3>Free Board Submissions</h3></div>
              {posts.length === 0 ? (
                <div className="empty-row">No posts yet.</div>
              ) : (
                <table className="admin-tbl">
                  <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Board</th><th>Message</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {posts.map(p => (
                      <tr key={p.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>{fmt(p.created_at)}</td>
                        <td>{p.name || '—'}</td>
                        <td>{p.email || '—'}</td>
                        <td><span className="badge badge-free">{p.board || '—'}</span></td>
                        <td className="msg-cell">{p.message || '—'}</td>
                        <td><span className={`badge ${p.status === 'approved' ? 'badge-premium' : p.status === 'resolved' ? 'badge-admin' : 'badge-free'}`}>{p.status || 'pending'}</span></td>
                        <td style={{ whiteSpace: 'nowrap', display: 'flex', gap: 6 }}>
                          {p.status !== 'approved' && (
                            <button className="tbl-btn" onClick={() => setPostStatus(p.id, 'approved')}>Approve</button>
                          )}
                          {p.status !== 'resolved' && (
                            <button className="tbl-btn danger" onClick={() => setPostStatus(p.id, 'resolved')}>Resolve</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === 'waitlist' && (
          <div className="admin-panel visible">
            <div className="admin-section">
              <div className="admin-section-head"><h3>Waitlist Signups</h3></div>
              {beta.length === 0 ? (
                <div className="empty-row">No signups yet.</div>
              ) : (
                <table className="admin-tbl">
                  <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Level</th><th>Goal</th></tr></thead>
                  <tbody>
                    {beta.map((b, i) => (
                      <tr key={i}>
                        <td style={{ whiteSpace: 'nowrap' }}>{fmt(b.created_at)}</td>
                        <td>{b.name || '—'}</td>
                        <td>{b.email || '—'}</td>
                        <td>{b.training_level || '—'}</td>
                        <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.goal || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </PageTransition>
  )
}
