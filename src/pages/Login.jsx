import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import Button from '../components/Button'
import Card from '../components/Card'
import ThemeToggle from '../components/ThemeToggle'
import { getAuthErrorMessage } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

const inputClasses =
  'mt-2 w-full rounded-md border border-border bg-background/70 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-subtle hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-focus-ring'

export default function Login() {
  const location = useLocation()
  const navigate = useNavigate()
  const { getDashboardPath, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const authenticatedUser = await login({ email, password })
      const requestedPath =
        typeof location.state?.from === 'string' &&
        location.state.from.startsWith('/') &&
        !location.state.from.startsWith('//')
          ? location.state.from
          : null

      navigate(requestedPath || getDashboardPath(authenticatedUser.role), {
        replace: true,
      })
    } catch (requestError) {
      setError(
        getAuthErrorMessage(
          requestError,
          'Unable to log in. Please check your details and try again.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 text-text-primary sm:px-6">
      <ThemeToggle className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="mb-8 block text-center text-2xl font-bold tracking-tight text-text-primary transition-opacity hover:opacity-80"
          aria-label="LinkPort home"
        >
          Link<span className="text-primary">Port</span>
        </Link>

        <Card padding="lg" className="shadow-2xl shadow-black/20">
          <div className="mb-8 text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Account access
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-3 text-sm text-text-muted">
              Log in to continue to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-text-primary">
                Email
              </label>
              <input
                id="email"
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

            <div>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="password" className="text-sm font-medium text-text-primary">
                  Password
                </label>
                <span className="cursor-not-allowed text-xs text-text-subtle" aria-disabled="true">
                  Forgot password? Coming soon
                </span>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className={inputClasses}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger-text"
              >
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-text-muted">
            Don’t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary transition-opacity hover:opacity-80"
            >
              Create one
            </Link>
          </p>
        </Card>
      </div>
    </main>
  )
}
