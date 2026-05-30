import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

const STRIPE_PK = 'pk_live_51TU1I4CP3zZyYmuP6yz0ypeLLg6Yc6WAJNq6o1p8SpVVhKWCrBe3CzcS2ZMPswdoODSfSogROwAvspxwWJoonaHN00DGwXP4WT'

export default function Checkout() {
  const { session } = useAuth()
  const navigate = useNavigate()

  const [stripe, setStripe] = useState(null)
  const [elements, setElements] = useState(null)
  const [cardElement, setCardElement] = useState(null)
  const [name, setName] = useState('')
  const [promo, setPromo] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [couponId, setCouponId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const BASE_PRICE = 19.99
  const finalPrice = (BASE_PRICE * (1 - discount / 100)).toFixed(2)

  useEffect(() => {
    if (!session) navigate('/login')
  }, [session])

  useEffect(() => {
    const stripeInstance = window.Stripe(STRIPE_PK)
    setStripe(stripeInstance)
    const els = stripeInstance.elements()
    setElements(els)

    const card = els.create('card', {
      style: {
        base: {
          color: '#ffffff',
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: '16px',
          fontWeight: '400',
          '::placeholder': { color: 'rgba(255,255,255,0.4)' },
          backgroundColor: 'transparent',
        },
        invalid: { color: '#ff6d6d' },
      },
    })

    card.mount('#card-element')
    setCardElement(card)

    card.on('change', (e) => {
      if (e.error) setError(e.error.message)
      else setError('')
    })

    return () => card.unmount()
  }, [])

  const applyPromo = async () => {
    if (!promo.trim()) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const res = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: promo.trim() }),
      })
      const data = await res.json()
      if (data.valid) {
        setDiscount(data.percentOff)
        setCouponId(data.couponId)
        setPromoApplied(true)
      } else {
        setPromoError(data.error || 'Invalid promo code.')
      }
    } catch {
      setPromoError('Could not validate code. Try again.')
    } finally {
      setPromoLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Please enter the name on your card.'); return }
    setLoading(true)
    setError('')

    try {
      // Create payment method using Stripe Elements (no raw card data sent)
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name },
      })

      if (pmError) {
        setError(pmError.message)
        setLoading(false)
        return
      }

      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          name,
          couponId,
        }),
      })

      const data = await res.json()

      if (data.requiresAction) {
        const { error: actionError } = await stripe.confirmCardPayment(data.clientSecret)
        if (actionError) {
          setError(actionError.message)
          setLoading(false)
          return
        }
        navigate('/success', { state: { paid: true } })
        return
      }

      if (data.success) {
        navigate('/success', { state: { paid: true } })
      } else {
        setError(data.error || 'Payment failed. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <Header />
      <main className="auth" style={{ alignItems: 'start', margin: '34px auto 82px' }}>

        {/* Order Summary */}
        <section className="card auth-panel">
          <div className="eyebrow">Order Summary</div>
          <img className="auth-logo" src="/assets/ngm-logo-square.jpeg" alt="NGM" />
          <h2>Premium</h2>
          <p>Full NoGuessMethod access. Cancel anytime.</p>

          <div className="membership-box" style={{ marginTop: 20 }}>
            <div className="membership-top">
              <strong>What's included</strong>
            </div>
            <div className="membership-perks">
              <div className="perk"><b>Daily Workout</b><span>✓ Included</span></div>
              <div className="perk"><b>Form Cues</b><span>✓ Unlocked</span></div>
              <div className="perk"><b>Progression Rules</b><span>✓ Unlocked</span></div>
              <div className="perk"><b>Nutrition Brief</b><span>✓ Unlocked</span></div>
              <div className="perk"><b>Program Rationale</b><span>✓ Unlocked</span></div>
            </div>
          </div>

          <div style={{ marginTop: 24, borderTop: '1px solid var(--line)', paddingTop: 20, display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)' }}>
              <span>Premium Monthly</span>
              <span>$19.99</span>
            </div>
            {promoApplied && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6dff8a' }}>
                <span>Promo ({promo.toUpperCase()})</span>
                <span>−{discount}%</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 900 }}>
              <span>Total / month</span>
              <span>${finalPrice}</span>
            </div>
          </div>
        </section>

        {/* Payment Form */}
        <section className="card auth-panel">
          <div className="eyebrow">Payment</div>
          <h2>Card Details</h2>
          <p>Secured by Stripe. We never store your card.</p>

          <div className="form" style={{ marginTop: 20 }}>
            <label>
              Name on Card
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Smith"
                autoComplete="cc-name"
              />
            </label>

            <label>
              Card Details
              <div
                id="card-element"
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 16,
                  background: 'rgba(0,0,0,.3)',
                  padding: '14px 15px',
                  transition: 'border-color 0.15s ease',
                }}
              />
            </label>

            {/* Promo Code */}
            <label>
              Promo Code
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={promo}
                  onChange={e => {
                    setPromo(e.target.value)
                    setPromoError('')
                    setPromoApplied(false)
                    setDiscount(0)
                    setCouponId(null)
                  }}
                  placeholder="Enter code"
                  style={{ flex: 1 }}
                  disabled={promoApplied}
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  disabled={promoLoading || promoApplied || !promo.trim()}
                  style={{ whiteSpace: 'nowrap', minWidth: 80 }}
                >
                  {promoApplied ? '✓ Applied' : promoLoading ? '...' : 'Apply'}
                </button>
              </div>
            </label>
            {promoError && <p className="status" style={{ color: '#ff6d6d', margin: 0 }}>{promoError}</p>}
            {promoApplied && <p className="status" style={{ color: '#6dff8a', margin: 0 }}>Promo applied — {discount}% off!</p>}

            {error && <p className="status" style={{ color: '#ff6d6d', margin: 0 }}>{error}</p>}

            <button
              type="button"
              className="primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? 'Processing...' : `Pay $${finalPrice}/mo`}
            </button>

            <p style={{ fontSize: 12, color: 'var(--soft)', textAlign: 'center', margin: 0 }}>
              🔒 Payments processed securely by{' '}
              <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--soft)', textDecoration: 'underline' }}>
                Stripe
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  )
}
