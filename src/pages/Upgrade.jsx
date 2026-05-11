import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'

const upgradeStyles = `
.upgrade-hero{width:min(1060px,calc(100% - 32px));margin:34px auto 82px;display:grid;gap:22px}
.pricing-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pricing-card{border:1px solid var(--line);border-radius:24px;overflow:hidden}
.pricing-card.featured{border-color:rgba(255,255,255,.5);box-shadow:0 0 0 1px rgba(255,255,255,.12),0 24px 80px rgba(0,0,0,.4)}
.pricing-top{padding:28px;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.025));border-bottom:1px solid var(--line)}
.pricing-top .price{font-size:42px;font-weight:900;line-height:1;letter-spacing:-.05em;margin:10px 0 4px}
.pricing-top .price-sub{color:var(--muted);font-size:14px}
.pricing-top .tier-label{font-size:12px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:var(--soft)}
.pricing-features{display:grid}
.pricing-feature{display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid var(--line);font-size:14px;color:var(--muted)}
.pricing-feature:last-child{border-bottom:0}
.pricing-feature.active{color:#fff}
.check{width:20px;height:20px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0}
.check.on{background:#fff;color:#000}
.check.off{background:rgba(255,255,255,.08);color:var(--soft)}
.pricing-action{padding:20px;border-top:1px solid var(--line)}
.checkout-status{margin-top:12px;font-size:14px;color:var(--muted);min-height:20px}
@media(max-width:680px){.pricing-grid{grid-template-columns:1fr}}
`

export default function Upgrade() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [checkoutStatus, setCheckoutStatus] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const startCheckout = async () => {
    if (!session) { navigate('/login'); return }
    setCheckoutLoading(true)
    setCheckoutStatus('')
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
      else if (data.error === 'Already subscribed') { setCheckoutStatus('You already have an active Premium subscription.') }
      else throw new Error(data.error || 'Could not create checkout session.')
    } catch (err) {
      setCheckoutStatus(err.message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <PageTransition>
      <style>{upgradeStyles}</style>
      <Header />
      <main className="upgrade-hero">
        <div className="card" style={{ padding: 32 }}>
          <div className="eyebrow">Pricing</div>
          <h2>Stop Guessing.<br />Start Progressing.</h2>
          <p className="lead" style={{ maxWidth: 560 }}>Every member gets a structured daily workout. Premium unlocks exactly why each exercise is programmed, how to progress it, and how to fuel it.</p>
        </div>

        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-top">
              <div className="tier-label">Free</div>
              <div className="price">$0</div>
              <div className="price-sub">Always free with a member account</div>
            </div>
            <div className="pricing-features">
              <div className="pricing-feature active"><span className="check on">✓</span>Daily structured workout</div>
              <div className="pricing-feature active"><span className="check on">✓</span>Exercise name, sets, reps, rest</div>
              <div className="pricing-feature active"><span className="check on">✓</span>30-day rotating PPL program</div>
              <div className="pricing-feature active"><span className="check on">✓</span>Free Board access</div>
              <div className="pricing-feature"><span className="check off">—</span>Form cues</div>
              <div className="pricing-feature"><span className="check off">—</span>Primary muscles</div>
              <div className="pricing-feature"><span className="check off">—</span>Progression rules</div>
              <div className="pricing-feature"><span className="check off">—</span>Daily nutrition brief</div>
              <div className="pricing-feature"><span className="check off">—</span>Program rationale</div>
            </div>
            <div className="pricing-action">
              <Link className="btn" to="/account" style={{ width: '100%', display: 'flex' }}>Your Account</Link>
            </div>
          </div>

          <div className="pricing-card featured">
            <div className="pricing-top">
              <div className="tier-label">Premium</div>
              <div className="price">$19.99<span style={{ fontSize: 18, fontWeight: 400 }}>/mo</span></div>
              <div className="price-sub">Cancel anytime. No contracts.</div>
            </div>
            <div className="pricing-features">
              <div className="pricing-feature active"><span className="check on">✓</span>Everything in Free</div>
              <div className="pricing-feature active"><span className="check on">✓</span>Form cues for every exercise</div>
              <div className="pricing-feature active"><span className="check on">✓</span>Primary muscles targeted</div>
              <div className="pricing-feature active"><span className="check on">✓</span>Exact progression rules</div>
              <div className="pricing-feature active"><span className="check on">✓</span>Daily nutrition brief</div>
              <div className="pricing-feature active"><span className="check on">✓</span>Program rationale</div>
              <div className="pricing-feature active"><span className="check on">✓</span>Early access to new features</div>
              <div className="pricing-feature active"><span className="check on">✓</span>Support NGM development</div>
            </div>
            <div className="pricing-action">
              <button className="btn primary" style={{ width: '100%', display: 'flex' }} onClick={startCheckout} disabled={checkoutLoading}>
                {checkoutLoading ? 'Redirecting to Stripe...' : 'Upgrade — $19.99/mo'}
              </button>
              {checkoutStatus && <p className="checkout-status">{checkoutStatus}</p>}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div className="mini"><strong>Cancel Anytime</strong><span>No lock-in. Manage or cancel your subscription directly from your account.</span></div>
          <div className="mini"><strong>Instant Access</strong><span>Premium unlocks immediately after payment — no waiting.</span></div>
          <div className="mini"><strong>Secure Checkout</strong><span>Payments handled by Stripe. We never store your card details.</span></div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  )
}
