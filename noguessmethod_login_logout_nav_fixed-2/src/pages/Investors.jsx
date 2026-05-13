import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

export default function Investors() {
  return (
    <PageTransition>
      <Header />
      <main className="auth">
        <section className="card auth-panel">
          <div className="eyebrow">Investors</div>
          <img className="auth-logo" src="/assets/ngm-logo-square.jpeg" alt="NGM" />
          <h2>Investor Access</h2>
          <p>Request information on the NoGuessMethod beta, traction, and upcoming roadmap.</p>
          <form className="form" action="https://formspree.io/f/mdabkvlw" method="POST">
            <label>Name<input name="name" required /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Background<input name="background" placeholder="Investor, operator, advisor, etc." /></label>
            <label>Message<textarea name="message" placeholder="Tell us what you are interested in." /></label>
            <button className="primary" type="submit">Request Deck</button>
          </form>
        </section>
        <section className="card logo-stage">
          <img src="/assets/ngm-logo-banner.jpeg" alt="NoGuessMethod" />
        </section>
      </main>
      <Footer />
    </PageTransition>
  )
}
