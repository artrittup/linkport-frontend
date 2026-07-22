import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Button from '../components/Button'
import Card from '../components/Card'
import { getAuthErrorMessage } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

const inputClasses =
  'mt-2 w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] hover:border-[#8892b0] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

export default function Login() {
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
      navigate(getDashboardPath(authenticatedUser.role), { replace: true })
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a192f] px-4 py-12 text-[#e6f1ff] sm:px-6">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#64ffda]/5 blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="mb-8 block text-center text-2xl font-bold tracking-tight text-[#e6f1ff] transition-opacity hover:opacity-80"
          aria-label="LinkPort home"
        >
          Link<span className="text-[#64ffda]">Port</span>
        </Link>

        <Card padding="lg" className="shadow-2xl shadow-black/20">
          <div className="mb-8 text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#64ffda]">
              Account access
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-3 text-sm text-[#8892b0]">
              Log in to continue to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-[#e6f1ff]">
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
                <label htmlFor="password" className="text-sm font-medium text-[#e6f1ff]">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-[#8892b0] transition-colors hover:text-[#64ffda]"
                >
                  Forgot password?
                </a>
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
                className="rounded-md border border-[#ef4444]/40 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]"
              >
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-[#8892b0]">
            Don’t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-[#64ffda] transition-opacity hover:opacity-80"
            >
              Create one
            </Link>
          </p>
        </Card>
      </div>
    </main>
  )
}
