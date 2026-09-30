import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import AuthLayout from '../components/AuthLayout'
import Captcha, { captchaEnabled } from '../components/Captcha'
import TermsDialog from '../components/TermsDialog'
import FloatingField from '../components/FloatingField'
import PasswordField from '../components/PasswordField'
import UsernameField from '../components/UsernameField'
import EmailField from '../components/EmailField'
import CountryPicker from '../components/CountryPicker'
import DialCodeSelect from '../components/DialCodeSelect'
import { COUNTRIES } from '../data/countries'
import LinkPortLogo from '../components/LinkPortLogo'
import { getAuthErrorMessage } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

const COMPANY_TYPES = [
  'Sole proprietorship', 'Limited liability company (LLC)', 'Joint-stock company',
  'Partnership', 'Non-profit / NGO', 'Public institution', 'Startup', 'Other',
]

function RoleIcon({ name, className = 'h-6 w-6' }) {
  const paths = {
    member: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    company: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M9 21v-3h6v3" /></>,
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

const roles = [
  {
    value: 'candidate',
    icon: 'member',
    label: 'Member',
    description: 'Join communities in your field, find jobs and projects, and build a profile.',
  },
  {
    value: 'company',
    icon: 'company',
    label: 'Company',
    description: 'Post jobs and projects, review applications, and find people to hire.',
  },
]

function FieldError({ errors, name }) {
  const nestedError = name === 'skills'
    ? Object.entries(errors).find(([field]) => field.startsWith('skills.'))?.[1]?.[0]
    : null
  const message = errors[name]?.[0] ?? nestedError

  return message ? <p className="mt-1.5 text-xs text-danger-text">{message}</p> : null
}


function CompanyPhoneField({ errors, value, onChange }) {
  const match = /^(\+\d{1,4})\s*(.*)$/.exec(value || '')
  const rest = match?.[2] ?? (value || '')
  const [country, setCountry] = useState(
    () => COUNTRIES.find((item) => item.iso === 'xk') ?? COUNTRIES[0],
  )
  const dial = match?.[1] ?? country.dial
  const invalid = Boolean(errors.phone)

  const emit = (nextDial, nextRest) => {
    onChange({ target: { name: 'phone', value: `${nextDial} ${nextRest}`.trim() } })
  }

  return (
    <div>
      <div className="flex gap-2">
        <DialCodeSelect
          iso={country.iso}
          onChange={(next) => { setCountry(next); emit(next.dial, rest) }}
        />
        <div className="relative min-w-0 flex-1">
          <input
            id="company-phone"
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
            htmlFor="company-phone"
            className={`pointer-events-none absolute left-3 top-[0.85rem] text-[11px] leading-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-focus:top-[0.85rem] peer-focus:translate-y-0 peer-focus:text-[11px] ${
              invalid ? 'text-danger-text' : 'text-text-muted'
            }`}
          >
            Company phone
          </label>
        </div>
      </div>
      <FieldError errors={errors} name="phone" />
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const { getDashboardPath, register } = useAuth()
  const [selectedRole, setSelectedRole] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [companyProfile, setCompanyProfile] = useState({
    ownerName: '', companyType: '', registrationNumber: '',
    registrationDocumentUrl: '', contactEmail: '', website: '',
    country: '', phone: '', industry: '', description: '',
  })
  const [captchaToken, setCaptchaToken] = useState('')
  const [showTerms, setShowTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => {
    setFormData((current) => ({
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

  const handleSubmit = (event) => {
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

    setShowTerms(true)
  }

  const createAccount = async () => {
    setError('')
    setIsSubmitting(true)

    try {
      const authenticatedUser = await register({
        ...formData,
        role: selectedRole,
        captchaToken,
        companyProfile: {
          ...companyProfile,
          companyName: formData.name,
          contactEmail: formData.email,
        },
      })
      navigate(getDashboardPath(authenticatedUser.role), { replace: true })
    } catch (requestError) {
      const responseErrors = requestError.response?.data?.errors ?? {}
      setShowTerms(false)
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
      mark={selectedRole === 'company' ? 'company' : 'person'}
      verified={selectedRole === 'company'
        && Boolean(companyProfile.ownerName && companyProfile.companyType
          && companyProfile.registrationDocumentUrl && formData.email
          && companyProfile.country)}
      wide
    >
      <div>
        {!selectedRole ? (
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Join LinkPort</h1>
            <p className="mt-2 text-sm text-text-muted">First, tell us who you are.</p>

            <div className="mt-5 space-y-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className="flex w-full items-start gap-3.5 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-primary hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                    <RoleIcon name={role.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-bold text-text-primary">{role.label}</span>
                    <span className="mt-1 block text-sm leading-snug text-text-muted">
                      {role.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <hr className="my-6 border-border" />

            <Link
              to="/login"
              className="block rounded-lg border border-primary bg-surface px-4 py-2 text-center text-sm font-bold text-primary no-underline transition-colors hover:bg-primary/5"
            >
              Already have an account?
            </Link>
          </div>
        ) : (
        <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {selectedRole === 'candidate' ? 'Create a member account' : 'Create a company account'}
            </h1>
            <p className="mt-2 text-sm text-text-muted">It is quick and free.</p>
          </div>
          <button
            type="button"
            onClick={() => { setSelectedRole(null); setValidationErrors({}); setError('') }}
            className="shrink-0 text-sm font-semibold text-primary hover:underline"
          >
            Change
          </button>
        </div>

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
            label={selectedRole === 'company' ? 'Company name' : 'Nickname'}
            autoComplete={selectedRole === 'company' ? 'organization' : 'nickname'}
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
            label={selectedRole === 'company' ? 'Company email' : 'Email'}
          />
          <FieldError errors={validationErrors} name="email" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <PasswordField
                id="register-password"
                name="password"
                type="password"
                label="New password"
                autoComplete="off"
                required
                minLength="8"
                showStrength
                value={formData.password}
                onChange={updateField}
                invalid={Boolean(validationErrors.password)}
              />
              <FieldError errors={validationErrors} name="password" />
            </div>
            <div>
              <PasswordField
                id="confirm-password"
                name="confirmPassword"
                type="password"
                label="Confirm password"
                autoComplete="off"
                required
                value={formData.confirmPassword}
                onChange={updateField}
                invalid={Boolean(validationErrors.confirmPassword)}
              />
              <FieldError errors={validationErrors} name="confirmPassword" />
            </div>
          </div>

          {selectedRole === 'company' && (
            <>
              <FloatingField
                id="company-owner"
                name="ownerName"
                type="text"
                label="CEO / Owner"
                required
                maxLength="160"
                value={companyProfile.ownerName}
                onChange={updateCompanyField}
                invalid={Boolean(validationErrors.owner_name)}
              />
              <FieldError errors={validationErrors} name="owner_name" />

              <div className="relative">
                <select
                  id="company-type"
                  name="companyType"
                  required
                  value={companyProfile.companyType}
                  onChange={updateCompanyField}
                  className={`peer h-[3.75rem] w-full appearance-none rounded-lg border bg-surface px-3 pb-2 pt-7 text-[15px] text-text-primary outline-none transition-colors hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-focus-ring ${
                    validationErrors.company_type ? 'border-danger' : 'border-border'
                  }`}
                >
                  <option value="">Select a type</option>
                  {COMPANY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <label
                  htmlFor="company-type"
                  className="pointer-events-none absolute left-3 top-[0.85rem] text-[11px] leading-none text-text-muted"
                >
                  Company type
                </label>
              </div>
              <FieldError errors={validationErrors} name="company_type" />

              <FloatingField
                id="company-registration-number"
                name="registrationNumber"
                type="text"
                label="Business registration number (optional)"
                maxLength="60"
                value={companyProfile.registrationNumber}
                onChange={updateCompanyField}
                invalid={Boolean(validationErrors.registration_number)}
              />
              <FieldError errors={validationErrors} name="registration_number" />

              <div>
                <FloatingField
                  id="company-document"
                  name="registrationDocumentUrl"
                  type="url"
                  label="Business registration document (link)"
                  required
                  value={companyProfile.registrationDocumentUrl}
                  onChange={updateCompanyField}
                  invalid={Boolean(validationErrors.registration_document_url)}
                />
                <FieldError errors={validationErrors} name="registration_document_url" />
              </div>

              <FloatingField
                id="company-website"
                name="website"
                type="url"
                label="Website URL"
                value={companyProfile.website}
                onChange={updateCompanyField}
                invalid={Boolean(validationErrors.website)}
              />
              <FieldError errors={validationErrors} name="website" />

              <CountryPicker
                value={companyProfile.country}
                onChange={(event) => updateCompanyField({
                  target: { name: 'country', value: event.target.value },
                })}
                invalid={Boolean(validationErrors.country)}
              />
              <FieldError errors={validationErrors} name="country" />

              <CompanyPhoneField
                errors={validationErrors}
                value={companyProfile.phone}
                onChange={updateCompanyField}
              />

              <FloatingField
                id="company-industry"
                name="industry"
                type="text"
                label="Industry"
                value={companyProfile.industry}
                onChange={updateCompanyField}
                invalid={Boolean(validationErrors.industry)}
              />
              <FieldError errors={validationErrors} name="industry" />

              <div className="relative">
                <textarea
                  id="company-description"
                  name="description"
                  rows="4"
                  placeholder=" "
                  value={companyProfile.description}
                  onChange={updateCompanyField}
                  className="peer w-full resize-y rounded-lg border border-border bg-surface px-3 pb-2 pt-7 text-[15px] leading-tight text-text-primary outline-none transition-colors hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-focus-ring"
                />
                <label
                  htmlFor="company-description"
                  className="pointer-events-none absolute left-3 top-[0.85rem] text-[11px] leading-none text-text-muted transition-all peer-placeholder-shown:top-[1.35rem] peer-placeholder-shown:text-[15px] peer-focus:top-[0.85rem] peer-focus:text-[11px]"
                >
                  What the company does
                </label>
              </div>
              <FieldError errors={validationErrors} name="description" />
            </>
          )}

            <input type="hidden" name="role" value={selectedRole} />

            {error && (
              <p
                role="alert"
                className="border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger-text"
              >
                {error}
              </p>
            )}

            <Captcha onToken={setCaptchaToken} />

            <button
              type="submit"
              disabled={captchaEnabled && !captchaToken}
              className="block w-full rounded-lg border border-primary bg-primary px-4 py-3 text-center text-base font-bold text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:opacity-60"
            >
              Create account
            </button>
          </form>

        <hr className="my-6 border-border" />

        <Link
          to="/login"
          className="block rounded-lg border border-primary bg-surface px-4 py-2 text-center text-sm font-bold text-primary no-underline transition-colors hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          Already have an account?
        </Link>
        </div>
        )}

        {showTerms && (
        <TermsDialog
          isSubmitting={isSubmitting}
          onCancel={() => setShowTerms(false)}
          onAccept={createAccount}
        />
        )}

        <p className="mt-10 flex items-center justify-center gap-1.5 text-text-muted">
          <LinkPortLogo className="h-[18px] w-auto" />
          <span className="text-[15px] font-medium tracking-[-0.01em]">LinkPort</span>
        </p>
      </div>
    </AuthLayout>
  )
}
