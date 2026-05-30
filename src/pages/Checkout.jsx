import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

export default function Checkout() {
  const { session } = useAuth()
  const navigate = useNavigate()

  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')
  const [promo, setPromo] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [promoCode, setPromoCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const BASE_PRICE = 19.99
  const finalPrice = (BASE_PRICE * (1 - discount / 100)).toFixed(2)

  useEffect(() => {
    if (!session) navigate('/login')
  }, [session])

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

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
        setPromoCode(data.couponId)
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
    if (!cardNumber || !expiry || !cvc || !name) {
      setError('Please fill in all card details.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber: cardNumber.replace(/\s/g, ''),
          expMonth: expiry.split('/')[0],
          expYear: expiry.split('/')[1],
          cvc,
          name,
          couponId: promoCode,
        }),
      })
      const data = await res.json()
      if (data.success) {
        navigate('/success')
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
              Card Number
              <input
                value={cardNumber}
                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                autoComplete="cc-number"
                inputMode="numeric"
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label>
                Expiry
                <input
                  value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  autoComplete="cc-exp"
                  inputMode="numeric"
                />
              </label>
              <label>
                CVC
                <input
                  value={cvc}
                  onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  autoComplete="cc-csc"
                  inputMode="numeric"
                />
              </label>
            </div>

            {/* Promo Code */}
            <label>
              Promo Code
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={promo}
                  onChange={e => { setPromo(e.target.value); setPromoError(''); setPromoApplied(false); setDiscount(0); setPromoCode(null) }}
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
              🔒 Payments processed securely by Stripe
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  )
}
