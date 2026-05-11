import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <span>NoGuessMethod</span>
      <span>
        <Link to="/">Main</Link> · <Link to="/free">Free Board</Link> · <Link to="/upgrade">Pricing</Link> · <Link to="/investors">Investors</Link>
      </span>
      <span>© 2026 NoGuessMethod</span>
    </footer>
  )
}
