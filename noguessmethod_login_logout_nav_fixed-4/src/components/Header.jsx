import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const navLinks = (
    <>
      <Link to="/">Main</Link>
      <Link to="/free">Free Board</Link>
      {session && <Link to="/premium">Premium</Link>}
      {!session && <Link to="/signup">Sign Up</Link>}
      {!session && <Link to="/login" className="primary">Login</Link>}
      {session && <Link to="/workout">Today's Workout</Link>}
      {session && <Link to="/account" className="primary">Member Hub</Link>}
      {session && (
        <button type="button" className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      )}
    </>
  )

  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="NoGuessMethod home">
        <img src="/assets/ngm-logo-square.jpeg" alt="NGM" className="logo-square" />
      </Link>

      {/* Desktop nav */}
      <nav className="nav">
        {navLinks}
      </nav>

      {/* Hamburger button */}
      <button
        type="button"
        className={`hamburger${open ? ' open' : ''}`}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile nav overlay */}
      <div className={`mobile-nav${open ? ' open' : ''}`} aria-hidden={!open}>
        <nav onClick={() => setOpen(false)}>
          {navLinks}
        </nav>
      </div>
    </header>
  )
}
