import { useState } from 'react'
import { Link } from 'react-router'
import { getAuthErrorMessage, requestPasswordReset } from '../api/authApi'

const inputClasses =
  'mt-1.5 w-full border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-subtle hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-focus-ring'

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
    <main className="min-h-screen bg-background text-text-primary">
      <header className="lp-titlebar">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-4 px-4 py-2.5 sm:px-6">
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-text-primary hover:text-primary sm:text-xl"
            aria-label="LinkPort home"
          >
            Link<span className="text-primary">Port</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-text-muted">
          <Link to="/" className="underline-offset-2 hover:text-primary hover:underline">Home</Link>
          <span aria-hidden="true"> &raquo; </span>
          <Link to="/login" className="underline-offset-2 hover:text-primary hover:underline">Log in</Link>
          <span aria-hidden="true"> &raquo; </span>
          <span className="text-text-secondary">Forgot password</span>
        </nav>

        <section className="lp-panel">
          <h1 className="lp-panel-head px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-text-primary">
            Reset your password
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-5">
            <p className="text-sm text-text-muted">
              Enter the email you registered with and we will send you a link to choose a new password.
            </p>

            <div>
              <label htmlFor="forgot-email" className="block text-sm font-bold text-text-primary">
                Email
              </label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={inputClasses}
              />
            </div>

            {notice && (
              <p role="status" className="border border-success/50 bg-success/10 px-3 py-2 text-sm text-success-text">
                {notice}
              </p>
            )}

            {error && (
              <p role="alert" className="border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger-text">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full border border-primary bg-primary px-4 py-2 text-sm font-bold text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <p className="border-t border-border bg-surface-muted px-4 py-3 text-sm text-text-muted">
            Remembered it?{' '}
            <Link to="/login" className="font-bold text-primary underline-offset-2 hover:underline">
              Back to log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
