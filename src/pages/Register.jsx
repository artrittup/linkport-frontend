import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '../components/Button'
import Card from '../components/Card'
import { getAuthErrorMessage } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

const inputClasses =
  'mt-2 w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] hover:border-[#8892b0] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

const roles = [
  {
    value: 'candidate',
    label: 'Candidate',
    description: 'Find jobs and projects',
  },
  {
    value: 'company',
    label: 'Company',
    description: 'Hire and post work',
  },
]

export default function Register() {
  const navigate = useNavigate()
  const { getDashboardPath, register } = useAuth()
  const [selectedRole, setSelectedRole] = useState('candidate')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const authenticatedUser = await register({
        ...formData,
        role: selectedRole,
      })
      navigate(getDashboardPath(authenticatedUser.role), { replace: true })
    } catch (requestError) {
      setError(
        getAuthErrorMessage(
          requestError,
          'Unable to create your account. Please check your details and try again.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a192f] px-4 py-12 text-[#e6f1ff] sm:px-6">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#64ffda]/5 blur-3xl" />

      <div className="relative w-full max-w-lg">
        <a
          href="/"
          className="mb-8 block text-center text-2xl font-bold tracking-tight text-[#e6f1ff] transition-opacity hover:opacity-80"
          aria-label="LinkPort home"
        >
          Link<span className="text-[#64ffda]">Port</span>
        </a>

        <Card padding="lg" className="shadow-2xl shadow-black/20">
          <div className="mb-8 text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#64ffda]">
              Get started
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-3 text-sm text-[#8892b0]">
              Join LinkPort as a candidate or company.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="full-name" className="text-sm font-medium text-[#e6f1ff]">
                Full name
              </label>
              <input
                id="full-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={updateField}
                placeholder="Your full name"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="register-email" className="text-sm font-medium text-[#e6f1ff]">
                Email
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={updateField}
                placeholder="you@example.com"
                className={inputClasses}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="register-password" className="text-sm font-medium text-[#e6f1ff]">
                  Password
                </label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={updateField}
                  placeholder="Create a password"
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="text-sm font-medium text-[#e6f1ff]">
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={updateField}
                  placeholder="Repeat password"
                  className={inputClasses}
                />
              </div>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-[#e6f1ff]">
                I am joining as
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => {
                  const isSelected = selectedRole === role.value

                  return (
                    <button
                      key={role.value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedRole(role.value)}
                      className={`rounded-md border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda] ${
                        isSelected
                          ? 'border-[#64ffda] bg-[#64ffda]/10'
                          : 'border-[#233554] bg-[#0a192f]/50 hover:border-[#8892b0] hover:bg-[#172a45]'
                      }`}
                    >
                      <span
                        className={`block text-sm font-semibold ${isSelected ? 'text-[#64ffda]' : 'text-[#e6f1ff]'}`}
                      >
                        {role.label}
                      </span>
                      <span className="mt-1 block text-xs text-[#8892b0]">
                        {role.description}
                      </span>
                    </button>
                  )
                })}
              </div>
              <input type="hidden" name="role" value={selectedRole} />
            </fieldset>

            {error && (
              <p
                role="alert"
                className="rounded-md border border-[#ef4444]/40 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]"
              >
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-[#8892b0]">
            Already have an account?{' '}
            <a
              href="/login"
              className="font-medium text-[#64ffda] transition-opacity hover:opacity-80"
            >
              Login
            </a>
          </p>
        </Card>
      </div>
    </main>
  )
}
