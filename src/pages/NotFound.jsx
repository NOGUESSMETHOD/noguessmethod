import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

export default function NotFound() {
  return (
    <PageTransition>
      <Header />
      <main className="auth">
        <section className="card auth-panel">
          <div className="eyebrow">Not Found</div>
          <img className="auth-logo" src="/assets/ngm-logo-square.jpeg" alt="NGM" />
          <h2>Not Found</h2>
          <p>The page you are looking for does not exist.</p>
          <Link className="btn primary" to="/">Go Home</Link>
        </section>
        <section className="card logo-stage">
          <img src="/assets/ngm-logo-banner.jpeg" alt="NoGuessMethod" />
        </section>
      </main>
      <Footer />
    </PageTransition>
  )
}
