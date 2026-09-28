import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import AuthLayout from '../components/AuthLayout'
import FloatingField from '../components/FloatingField'
import UsernameField from '../components/UsernameField'
import EmailField from '../components/EmailField'
import CountryPicker from '../components/CountryPicker'
import DialCodeSelect from '../components/DialCodeSelect'
import { COUNTRIES } from '../data/countries'
import LinkPortLogo from '../components/LinkPortLogo'
import SkillsInput from '../components/SkillsInput'
import { getAuthErrorMessage } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

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

function PhoneField({ errors, value, onChange }) {
  const match = /^(\+\d{1,4})\s*(.*)$/.exec(value || '')
  const rest = match?.[2] ?? (value || '')

  // Several countries share a dial code, so remember the chosen country.
  const [country, setCountry] = useState(
    () => COUNTRIES.find((item) => item.iso === 'xk') ?? COUNTRIES[0],
  )
  const dial = match?.[1] ?? country.dial

  const emit = (nextDial, nextRest) => {
    onChange({ target: { name: 'phone', value: `${nextDial} ${nextRest}`.trim() } })
  }

  const invalid = Boolean(errors.phone)

  return (
    <div>
      <div className="flex gap-2">
        <DialCodeSelect
          iso={country.iso}
          onChange={(next) => { setCountry(next); emit(next.dial, rest) }}
        />

        <div className="relative min-w-0 flex-1">
          <input
            id="register-phone"
            name="phone"
            type="tel"
            value={rest}
            onChange={(event) => emit(dial, event.target.value)}
            placeholder=" "
            aria-invalid={invalid || undefined}
            className={`peer h-[3.75rem] w-full rounded-lg border bg-surface px-3 pb-2 pt-7 text-[15px] leading-tight text-text-primary outline-none transition-colors hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-focus-ring ${
              invalid ? 'border-danger' : 'border-border'
            }`}
          />
          <label
            htmlFor="register-phone"
            className={`pointer-events-none absolute left-3 top-[0.85rem] text-[11px] leading-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-focus:top-[0.85rem] peer-focus:translate-y-0 peer-focus:text-[11px] ${
              invalid ? 'text-danger-text' : 'text-text-muted'
            }`}
          >
            Phone
          </label>
        </div>
      </div>
      <FieldError errors={errors} name="phone" />
    </div>
  )
}

function OptionalField({
  errors,
  label,
  name,
  onChange,
  type = 'text',
  value,
  rows,
  min,
}) {
  const invalid = Boolean(errors[name])
  const id = `register-${name}`

  // Same floating-label treatment as the account fields above.
  const shared = `peer w-full rounded-lg border bg-surface pb-2 pl-3 pr-3 pt-7 text-[15px] leading-tight text-text-primary outline-none transition-colors hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-focus-ring ${
    invalid ? 'border-danger' : 'border-border'
  }`

  return (
    <div className={rows ? 'sm:col-span-2' : ''}>
      <div className="relative">
        {rows ? (
          <textarea
            id={id}
            name={name}
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder=" "
            aria-invalid={invalid || undefined}
            className={`${shared} resize-y`}
          />
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            min={min}
            value={value}
            onChange={onChange}
            placeholder=" "
            aria-invalid={invalid || undefined}
            className={`${shared} h-[3.75rem]`}
          />
        )}
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-3 top-[0.85rem] text-[11px] leading-none transition-all peer-focus:top-[0.85rem] peer-focus:translate-y-0 peer-focus:text-[11px] ${
            rows
              ? 'peer-placeholder-shown:top-[1.35rem] peer-placeholder-shown:text-[15px]'
              : 'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px]'
          } ${invalid ? 'text-danger-text' : 'text-text-muted'}`}
        >
          {label}
        </label>
      </div>
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
    username: '',
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
    <AuthLayout
      headline="Explore your interests."
      nickname={formData.name}
      username={formData.username}
      wide
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Create a new account</h1>
        <p className="mt-2 text-sm text-text-muted">It is quick and free.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">

          <UsernameField
            value={formData.username}
            onChange={updateField}
            invalid={Boolean(validationErrors.username)}
          />
          <FieldError errors={validationErrors} name="username" />

          <FloatingField
            id="register-nickname"
            name="name"
            type="text"
            label="Nickname"
            autoComplete="nickname"
            required
            maxLength="60"
            value={formData.name}
            onChange={updateField}
            invalid={Boolean(validationErrors.fullName)}
          />
          <FieldError errors={validationErrors} name="fullName" />

          <EmailField
            value={formData.email}
            onChange={updateField}
            invalid={Boolean(validationErrors.email)}
          />
          <FieldError errors={validationErrors} name="email" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FloatingField
                id="register-password"
                name="password"
                type="password"
                label="New password"
                autoComplete="new-password"
                required
                minLength="8"
                value={formData.password}
                onChange={updateField}
                invalid={Boolean(validationErrors.password)}
              />
              <FieldError errors={validationErrors} name="password" />
            </div>
            <div>
              <FloatingField
                id="confirm-password"
                name="confirmPassword"
                type="password"
                label="Confirm password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={updateField}
                invalid={Boolean(validationErrors.confirmPassword)}
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
                    <OptionalField errors={validationErrors} label="Your field" name="headline" value={candidateProfile.professionalTitle} onChange={(event) => updateCandidateField({ target: { name: 'professionalTitle', value: event.target.value } })} />
                    <CountryPicker value={candidateProfile.location} onChange={updateCandidateField} invalid={Boolean(validationErrors.location)} />
                    <PhoneField errors={validationErrors} value={candidateProfile.phone} onChange={updateCandidateField} />
                    <OptionalField errors={validationErrors} label="Portfolio / Website URL" name="website" type="url" value={candidateProfile.portfolioLink} onChange={(event) => updateCandidateField({ target: { name: 'portfolioLink', value: event.target.value } })} />
                    <OptionalField errors={validationErrors} label="GitHub URL" name="github_url" type="url" value={candidateProfile.githubUrl} onChange={(event) => updateCandidateField({ target: { name: 'githubUrl', value: event.target.value } })} />
                    <OptionalField errors={validationErrors} label="LinkedIn URL" name="linkedin_url" type="url" value={candidateProfile.linkedinUrl} onChange={(event) => updateCandidateField({ target: { name: 'linkedinUrl', value: event.target.value } })} />
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-text-primary">Skills</label>
                      <div className="mt-2">
                        <SkillsInput skills={skills} setSkills={setSkills} />
                      </div>
                      <FieldError errors={validationErrors} name="skills" />
                    </div>
                    <OptionalField errors={validationErrors} label="Education" name="education" rows="3" value={candidateProfile.education} onChange={updateCandidateField} />
                    <OptionalField errors={validationErrors} label="Experience" name="experience" rows="3" value={candidateProfile.experience} onChange={updateCandidateField} />
                    <OptionalField errors={validationErrors} label="CV URL" name="cv_url" type="url" value={candidateProfile.cvUrl} onChange={(event) => updateCandidateField({ target: { name: 'cvUrl', value: event.target.value } })} />
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <OptionalField errors={validationErrors} label="Company name" name="company_name" value={companyProfile.companyName} onChange={(event) => updateCompanyField({ target: { name: 'companyName', value: event.target.value } })} />
                    <OptionalField errors={validationErrors} label="Industry" name="industry" value={companyProfile.industry} onChange={updateCompanyField} />
                    <CountryPicker value={companyProfile.location} onChange={updateCompanyField} invalid={Boolean(validationErrors.location)} />
                    <PhoneField errors={validationErrors} value={companyProfile.phone} onChange={updateCompanyField} />
                    <OptionalField errors={validationErrors} label="Website URL" name="website" type="url" value={companyProfile.website} onChange={updateCompanyField} />
                    <OptionalField errors={validationErrors} label="LinkedIn URL" name="linkedin_url" type="url" value={companyProfile.linkedinUrl} onChange={(event) => updateCompanyField({ target: { name: 'linkedinUrl', value: event.target.value } })} />
                    <OptionalField errors={validationErrors} label="Logo URL" name="logo_url" type="url" value={companyProfile.logoUrl} onChange={(event) => updateCompanyField({ target: { name: 'logoUrl', value: event.target.value } })} />
                    <OptionalField errors={validationErrors} label="Employee count" name="employee_count" type="number" min="1" value={companyProfile.employeeCount} onChange={(event) => updateCompanyField({ target: { name: 'employeeCount', value: event.target.value } })} />
                    <OptionalField errors={validationErrors} label="Description" name="description" rows="4" value={companyProfile.description} onChange={updateCompanyField} />
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
              className="block w-full rounded-lg border border-primary bg-primary px-4 py-3 text-center text-base font-bold text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

        <hr className="my-6 border-border" />

        <Link
          to="/login"
          className="block rounded-lg border border-primary bg-surface px-4 py-2 text-center text-sm font-bold text-primary no-underline transition-colors hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          Already have an account?
        </Link>

        <p className="mt-10 flex items-center justify-center gap-1.5 text-text-muted">
          <LinkPortLogo className="h-[18px] w-auto" />
          <span className="text-[15px] font-medium tracking-[-0.01em]">LinkPort</span>
        </p>
      </div>
    </AuthLayout>
  )
}
