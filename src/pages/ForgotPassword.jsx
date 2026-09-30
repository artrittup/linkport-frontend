import { useState } from 'react'
import { Link } from 'react-router'
import AuthLayout from '../components/AuthLayout'
import FloatingField from '../components/FloatingField'
import LinkPortLogo from '../components/LinkPortLogo'
import { getAuthErrorMessage, requestPasswordReset } from '../api/authApi'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsSubmitting(true)

    try {
      const data = await requestPasswordReset(email)
      setNotice(data?.message || 'If that email is registered, a reset link is on its way.')
    } catch (requestError) {
      setError(
        getAuthErrorMessage(requestError, 'Unable to send the reset link. Please try again.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout headline="Welcome back." variant="signin" mark="help">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Enter the email you registered with and we will send you a link to choose a new one.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <FloatingField
            id="forgot-email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            required
            invalid={Boolean(error)}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          {notice && (
            <p role="status" className="rounded-lg border border-success/50 bg-success/10 px-3 py-2 text-sm text-success-text">
              {notice}
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-danger-text">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary px-4 py-3 text-base font-bold text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:opacity-60"
          >
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <hr className="my-6 border-border" />

        <Link
          to="/login"
          className="block rounded-lg border border-primary bg-surface px-4 py-3 text-center text-base font-bold text-primary no-underline transition-colors hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          Back to log in
        </Link>

        <p className="mt-10 flex items-center justify-center gap-1.5 text-text-muted">
          <LinkPortLogo className="h-[18px] w-auto" />
          <span className="text-[15px] font-medium tracking-[-0.01em]">LinkPort</span>
        </p>
      </div>
    </AuthLayout>
  )
}
