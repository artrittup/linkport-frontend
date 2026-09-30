import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import AuthLayout from '../components/AuthLayout'
import Captcha, { captchaEnabled } from '../components/Captcha'
import FloatingField from '../components/FloatingField'
import LinkPortLogo from '../components/LinkPortLogo'
import { getAuthErrorMessage } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const location = useLocation()
  const navigate = useNavigate()
  const { getDashboardPath, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const authenticatedUser = await login({ email, password, captchaToken })
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
    <AuthLayout headline="Welcome back." variant="signin" mark="person">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Log into LinkPort</h1>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          {location.state?.notice && (
            <p role="status" className="rounded-lg border border-success/50 bg-success/10 px-3 py-2 text-sm text-success-text">
              {location.state.notice}
            </p>
          )}

          <FloatingField
            id="email"
            name="email"
            type="text"
            label="Email or username"
            autoComplete="username"
            required
            invalid={Boolean(error)}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <FloatingField
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            required
            invalid={Boolean(error)}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && (
            <p role="alert" className="text-sm text-danger-text">
              {error}
            </p>
          )}

          <Captcha onToken={setCaptchaToken} />

          <button
            type="submit"
            disabled={isSubmitting || (captchaEnabled && !captchaToken)}
            className="w-full rounded-lg bg-primary px-4 py-3 text-base font-bold text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:opacity-60"
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm font-semibold text-text-primary no-underline hover:underline">
            Forgot password?
          </Link>
        </p>

        <hr className="my-6 border-border" />

        <Link
          to="/register"
          className="block rounded-lg border border-primary bg-surface px-4 py-3 text-center text-base font-bold text-primary no-underline transition-colors hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          Create new account
        </Link>

        <p className="mt-10 flex items-center justify-center gap-1.5 text-text-muted">
          <LinkPortLogo className="h-[18px] w-auto" />
          <span className="text-[15px] font-medium tracking-[-0.01em]">LinkPort</span>
        </p>
      </div>
    </AuthLayout>
  )
}
