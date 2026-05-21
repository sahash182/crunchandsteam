import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Lock } from 'lucide-react'

export default function PaymentForm({ total, onSuccess, onBack }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message)
      setLoading(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-brand-dark/5 shadow-sm">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Lock size={16} />
        {loading ? 'Processing…' : `Pay $${total.toFixed(2)}`}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-brand-text/50 hover:text-brand-text transition-colors"
      >
        ← Back to details
      </button>

      <p className="text-center text-xs text-brand-text/40 flex items-center justify-center gap-1">
        <Lock size={11} /> Secured by Stripe
      </p>
    </form>
  )
}
