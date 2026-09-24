import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { getAuthErrorMessage, resetPassword } from '../api/authApi'

const inputClasses =
  'mt-1.5 w-full border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-subtle hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-focus-ring'

const labelClasses = 'block text-sm font-bold text-text-primary'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const emailFromLink = searchParams.get('email') || ''

  const [email, setEmail] = useState(emailFromLink)
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password !== passwordConfirmation) {
      setError('The two passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword({ token, email, password, passwordConfirmation })
      navigate('/login', {
        replace: true,
        state: { notice: 'Your password has been reset. You can log in now.' },
      })
    } catch (requestError) {
      setError(
        getAuthErrorMessage(requestError, 'Unable to reset the password. The link may have expired.'),
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
          <span className="text-text-secondary">Choose a new password</span>
        </nav>

        <section className="lp-panel">
          <h1 className="lp-panel-head px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-text-primary">
            Choose a new password
          </h1>

          {token ? (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-5">
              <div>
                <label htmlFor="reset-email" className={labelClasses}>Email</label>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="reset-password" className={labelClasses}>New password</label>
                <input
                  id="reset-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength="8"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="reset-password-confirm" className={labelClasses}>Confirm new password</label>
                <input
                  id="reset-password-confirm"
                  name="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  placeholder="Repeat the password"
                  className={inputClasses}
                />
              </div>

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
                {isSubmitting ? 'Saving...' : 'Save new password'}
              </button>
            </form>
          ) : (
            <div className="space-y-3 p-4 sm:p-5">
              <p role="alert" className="border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger-text">
                This reset link is missing its token. Request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block border border-primary bg-primary px-4 py-2 text-sm font-bold text-primary-contrast transition-colors hover:bg-primary-hover"
              >
                Request a new link
              </Link>
            </div>
          )}

          <p className="border-t border-border bg-surface-muted px-4 py-3 text-sm text-text-muted">
            <Link to="/login" className="font-bold text-primary underline-offset-2 hover:underline">
              Back to log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
