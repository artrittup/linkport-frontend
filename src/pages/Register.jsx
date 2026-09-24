import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import SkillsInput from '../components/SkillsInput'
import { getAuthErrorMessage } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

const inputClasses =
  'mt-1.5 w-full border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-subtle hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-focus-ring'

const roles = [
  {
    value: 'candidate',
    label: 'Member',
    description: 'Find jobs and projects',
  },
  {
    value: 'company',
    label: 'Company',
    description: 'Hire and post work',
  },
]

const initialCandidateProfile = {
  professionalTitle: '',
  bio: '',
  location: '',
  phone: '',
  portfolioLink: '',
  githubUrl: '',
  linkedinUrl: '',
  education: '',
  experience: '',
  cvUrl: '',
}

const initialCompanyProfile = {
  companyName: '',
  description: '',
  industry: '',
  location: '',
  phone: '',
  website: '',
  linkedinUrl: '',
  logoUrl: '',
  employeeCount: '',
}

function FieldError({ errors, name }) {
  const nestedError = name === 'skills'
    ? Object.entries(errors).find(([field]) => field.startsWith('skills.'))?.[1]?.[0]
    : null
  const message = errors[name]?.[0] ?? nestedError

  return message ? <p className="mt-1.5 text-xs text-danger-text">{message}</p> : null
}

function OptionalField({
  errors,
  label,
  name,
  onChange,
  placeholder,
  type = 'text',
  value,
  rows,
  min,
}) {
  const fieldClasses = `${inputClasses} ${errors[name] ? 'border-danger/70' : ''}`

  return (
    <div className={rows ? 'sm:col-span-2' : ''}>
      <label htmlFor={`register-${name}`} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      {rows ? (
        <textarea
          id={`register-${name}`}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={Boolean(errors[name])}
          className={`${fieldClasses} resize-y`}
        />
      ) : (
        <input
          id={`register-${name}`}
          name={name}
          type={type}
          min={min}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={Boolean(errors[name])}
          className={fieldClasses}
        />
      )}
      <FieldError errors={errors} name={name} />
    </div>
  )
}

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
  const [candidateProfile, setCandidateProfile] = useState(initialCandidateProfile)
  const [companyProfile, setCompanyProfile] = useState(initialCompanyProfile)
  const [skills, setSkills] = useState([])
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const updateCandidateField = (event) => {
    setCandidateProfile((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const updateCompanyField = (event) => {
    setCompanyProfile((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setValidationErrors({})

    if (formData.password.length < 8) {
      setValidationErrors({ password: ['The password must be at least 8 characters.'] })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationErrors({
        confirmPassword: ['The password confirmation does not match.'],
      })
      return
    }

    setIsSubmitting(true)

    try {
      const authenticatedUser = await register({
        ...formData,
        role: selectedRole,
        candidateProfile: {
          ...candidateProfile,
          skills,
        },
        companyProfile,
      })
      navigate(getDashboardPath(authenticatedUser.role), { replace: true })
    } catch (requestError) {
      const responseErrors = requestError.response?.data?.errors ?? {}
      setValidationErrors(responseErrors)
      setError(
        Object.keys(responseErrors).length > 0
          ? 'Please correct the highlighted fields and try again.'
          : getAuthErrorMessage(
              requestError,
              'Unable to create your account. Please check your details and try again.',
            ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <header className="lp-titlebar">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 py-2.5 sm:px-6">
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-text-primary hover:text-primary sm:text-xl"
            aria-label="LinkPort home"
          >
            Link<span className="text-primary">Port</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-text-muted">
          <Link to="/" className="underline-offset-2 hover:text-primary hover:underline">Home</Link>
          <span aria-hidden="true"> &raquo; </span>
          <span className="text-text-secondary">Register</span>
        </nav>

        <section className="lp-panel">
          <h1 className="lp-panel-head px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-text-primary">
            Create an account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-5">
            <div className="border-b border-border pb-2">
              <h2 className="text-base font-semibold text-text-primary">Account details</h2>
              <p className="mt-1 text-xs text-text-muted">These fields are required to create your account.</p>
            </div>

            <div>
              <label htmlFor="full-name" className="text-sm font-medium text-text-primary">
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
                aria-invalid={Boolean(validationErrors.fullName)}
                className={`${inputClasses} ${validationErrors.fullName ? 'border-danger/70' : ''}`}
              />
              <FieldError errors={validationErrors} name="fullName" />
            </div>

            <div>
              <label htmlFor="register-email" className="text-sm font-medium text-text-primary">
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
                aria-invalid={Boolean(validationErrors.email)}
                className={`${inputClasses} ${validationErrors.email ? 'border-danger/70' : ''}`}
              />
              <FieldError errors={validationErrors} name="email" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="register-password" className="text-sm font-medium text-text-primary">
                  Password
                </label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength="8"
                  value={formData.password}
                  onChange={updateField}
                  placeholder="Create a password"
                  aria-invalid={Boolean(validationErrors.password)}
                  className={`${inputClasses} ${validationErrors.password ? 'border-danger/70' : ''}`}
                />
                <FieldError errors={validationErrors} name="password" />
              </div>
              <div>
                <label htmlFor="confirm-password" className="text-sm font-medium text-text-primary">
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
                  aria-invalid={Boolean(validationErrors.confirmPassword)}
                  className={`${inputClasses} ${validationErrors.confirmPassword ? 'border-danger/70' : ''}`}
                />
                <FieldError errors={validationErrors} name="confirmPassword" />
              </div>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-text-primary">
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
                      onClick={() => {
                        setSelectedRole(role.value)
                        setValidationErrors({})
                        setError('')
                      }}
                      className={`border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background hover:border-border-strong hover:bg-surface-elevated'
                      }`}
                    >
                      <span
                        className={`block text-sm font-semibold ${isSelected ? 'text-primary' : 'text-text-primary'}`}
                      >
                        {role.label}
                      </span>
                      <span className="mt-1 block text-xs text-text-muted">
                        {role.description}
                      </span>
                    </button>
                  )
                })}
              </div>
              <input type="hidden" name="role" value={selectedRole} />
              <FieldError errors={validationErrors} name="role" />
            </fieldset>

            <details
              key={selectedRole}
              className="group border border-border bg-background"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring">
                <span>
                  <span className="block text-sm font-semibold text-text-primary">
                    {selectedRole === 'candidate'
                      ? 'Member profile details'
                      : 'Company profile details'}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-text-muted">
                    Optional - add them now or complete your profile later.
                  </span>
                </span>
                <span className="font-mono text-lg text-primary transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>

              <div className="border-t border-border px-5 py-5">
                {selectedRole === 'candidate' ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <OptionalField errors={validationErrors} label="Professional title" name="headline" value={candidateProfile.professionalTitle} onChange={(event) => updateCandidateField({ target: { name: 'professionalTitle', value: event.target.value } })} placeholder="Junior Frontend Developer" />
                    <OptionalField errors={validationErrors} label="Location" name="location" value={candidateProfile.location} onChange={updateCandidateField} placeholder="City, country" />
                    <OptionalField errors={validationErrors} label="Phone" name="phone" type="tel" value={candidateProfile.phone} onChange={updateCandidateField} placeholder="+383 44 123 456" />
                    <OptionalField errors={validationErrors} label="Portfolio / Website URL" name="website" type="url" value={candidateProfile.portfolioLink} onChange={(event) => updateCandidateField({ target: { name: 'portfolioLink', value: event.target.value } })} placeholder="https://portfolio.example.com" />
                    <OptionalField errors={validationErrors} label="GitHub URL" name="github_url" type="url" value={candidateProfile.githubUrl} onChange={(event) => updateCandidateField({ target: { name: 'githubUrl', value: event.target.value } })} placeholder="https://github.com/username" />
                    <OptionalField errors={validationErrors} label="LinkedIn URL" name="linkedin_url" type="url" value={candidateProfile.linkedinUrl} onChange={(event) => updateCandidateField({ target: { name: 'linkedinUrl', value: event.target.value } })} placeholder="https://linkedin.com/in/username" />
                    <OptionalField errors={validationErrors} label="Bio" name="bio" rows="4" value={candidateProfile.bio} onChange={updateCandidateField} placeholder="A short introduction about you and your goals." />
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-text-primary">Skills</label>
                      <div className="mt-2">
                        <SkillsInput skills={skills} setSkills={setSkills} placeholder="Type a skill and press Enter" />
                      </div>
                      <FieldError errors={validationErrors} name="skills" />
                    </div>
                    <OptionalField errors={validationErrors} label="Education" name="education" rows="3" value={candidateProfile.education} onChange={updateCandidateField} placeholder="Degree, school, or relevant training" />
                    <OptionalField errors={validationErrors} label="Experience" name="experience" rows="3" value={candidateProfile.experience} onChange={updateCandidateField} placeholder="Relevant work, internship, or project experience" />
                    <OptionalField errors={validationErrors} label="CV URL" name="cv_url" type="url" value={candidateProfile.cvUrl} onChange={(event) => updateCandidateField({ target: { name: 'cvUrl', value: event.target.value } })} placeholder="https://example.com/cv.pdf" />
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <OptionalField errors={validationErrors} label="Company name" name="company_name" value={companyProfile.companyName} onChange={(event) => updateCompanyField({ target: { name: 'companyName', value: event.target.value } })} placeholder="LinkPort Labs" />
                    <OptionalField errors={validationErrors} label="Industry" name="industry" value={companyProfile.industry} onChange={updateCompanyField} placeholder="Software" />
                    <OptionalField errors={validationErrors} label="Location" name="location" value={companyProfile.location} onChange={updateCompanyField} placeholder="City, country" />
                    <OptionalField errors={validationErrors} label="Phone" name="phone" type="tel" value={companyProfile.phone} onChange={updateCompanyField} placeholder="+383 38 123 456" />
                    <OptionalField errors={validationErrors} label="Website URL" name="website" type="url" value={companyProfile.website} onChange={updateCompanyField} placeholder="https://company.example.com" />
                    <OptionalField errors={validationErrors} label="LinkedIn URL" name="linkedin_url" type="url" value={companyProfile.linkedinUrl} onChange={(event) => updateCompanyField({ target: { name: 'linkedinUrl', value: event.target.value } })} placeholder="https://linkedin.com/company/name" />
                    <OptionalField errors={validationErrors} label="Logo URL" name="logo_url" type="url" value={companyProfile.logoUrl} onChange={(event) => updateCompanyField({ target: { name: 'logoUrl', value: event.target.value } })} placeholder="https://company.example.com/logo.png" />
                    <OptionalField errors={validationErrors} label="Employee count" name="employee_count" type="number" min="1" value={companyProfile.employeeCount} onChange={(event) => updateCompanyField({ target: { name: 'employeeCount', value: event.target.value } })} placeholder="25" />
                    <OptionalField errors={validationErrors} label="Description" name="description" rows="4" value={companyProfile.description} onChange={updateCompanyField} placeholder="What your company does and who you serve." />
                  </div>
                )}
              </div>
            </details>

            {error && (
              <p
                role="alert"
                className="border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger-text"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full border border-primary bg-primary px-4 py-2 text-sm font-bold text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="border-t border-border bg-surface-muted px-4 py-3 text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary underline-offset-2 hover:underline">
              Log in here
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
