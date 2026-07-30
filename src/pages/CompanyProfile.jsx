import { useEffect, useMemo, useState } from 'react'
import {
  getCompanyProfile,
  getProfileValidationErrors,
  updateCompanyProfile,
} from '../api/profileApi'
import Button from '../components/Button'
import Card from '../components/Card'
import CompanyBrandMark from '../components/CompanyBrandMark'
import CompanyProfilePreview from '../components/CompanyProfilePreview'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  COMPANY_PROFILE_FIELD_MAP,
  COMPANY_PROFILE_UPDATED_EVENT,
  getCompanyProfileCompleteness,
  mapCompanyProfileToForm,
  mapCompanyProfileToPayload,
} from '../utils/companyProfile'

const inputClasses = 'mt-2 w-full min-w-0 rounded-lg border border-border bg-background/70 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring'

function FieldError({ id, children }) {
  if (!children) return null
  return <p id={id} role="alert" className="mt-1.5 text-xs text-danger-text">{children}</p>
}

function FormSection({ title, description, children }) {
  return (
    <section className="border-b border-border pb-7 last:border-0 last:pb-0">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
      <div className="mt-5 grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  )
}

export default function CompanyProfile() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState(() => mapCompanyProfileToForm(null, user?.email))
  const [savedForm, setSavedForm] = useState(() => mapCompanyProfileToForm(null, user?.email))
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [localLogoUrl, setLocalLogoUrl] = useState('')
  const [localLogoName, setLocalLogoName] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getCompanyProfile().then(({ profile }) => {
      if (!active) return
      const nextForm = mapCompanyProfileToForm(profile, user?.email)
      setForm(nextForm)
      setSavedForm(nextForm)
      setLoadError(false)
      window.dispatchEvent(new CustomEvent(COMPANY_PROFILE_UPDATED_EVENT, {
        detail: {
          companyName: nextForm.companyName,
          logoUrl: nextForm.logoUrl,
        },
      }))
    }).catch(() => {
      if (active) setLoadError(true)
    }).finally(() => {
      if (active) setIsLoading(false)
    })
    return () => { active = false }
  }, [refreshKey, user?.email])

  useEffect(() => () => {
    if (localLogoUrl) URL.revokeObjectURL(localLogoUrl)
  }, [localLogoUrl])

  const profileValues = useMemo(() => mapCompanyProfileToPayload(form), [form])
  const savedValues = useMemo(() => mapCompanyProfileToPayload(savedForm), [savedForm])
  const isDirty = JSON.stringify(profileValues) !== JSON.stringify(savedValues)
  const completeness = getCompanyProfileCompleteness(profileValues)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setSaved(false)
    setGeneralError('')
    const backendField = COMPANY_PROFILE_FIELD_MAP[name]
    if (backendField) setFieldErrors((current) => ({ ...current, [backendField]: '' }))
  }

  const selectLocalLogo = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setLocalLogoUrl(URL.createObjectURL(file))
    setLocalLogoName(file.name)
  }

  const clearLocalLogo = () => {
    setLocalLogoUrl('')
    setLocalLogoName('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isDirty || isSaving) return
    setIsSaving(true)
    setSaved(false)
    setGeneralError('')
    setFieldErrors({})
    try {
      const response = await updateCompanyProfile(profileValues)
      const nextForm = mapCompanyProfileToForm(response.profile, user?.email)
      setForm(nextForm)
      setSavedForm(nextForm)
      setSaved(true)
      window.dispatchEvent(new CustomEvent(COMPANY_PROFILE_UPDATED_EVENT, {
        detail: {
          companyName: nextForm.companyName,
          logoUrl: nextForm.logoUrl,
        },
      }))
      showToast(response.message ?? 'Company profile saved successfully.', 'success')
    } catch (error) {
      const validationErrors = getProfileValidationErrors(error)
      setFieldErrors(validationErrors)
      setGeneralError(Object.keys(validationErrors).length ? 'Please correct the highlighted fields.' : 'Unable to save your Company Profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DashboardLayout title="Company Profile" userType="Company"><LoadingSpinner label="Loading your Company Profile..." size="lg" /></DashboardLayout>

  if (loadError) {
    return (
      <DashboardLayout title="Company Profile" userType="Company">
        <Card padding="lg" className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">Company Profile unavailable</h2>
          <p className="mt-3 text-sm text-text-muted">Your saved profile could not be loaded, so editing is temporarily disabled to protect your information.</p>
          <Button className="mt-6" onClick={() => { setIsLoading(true); setRefreshKey((current) => current + 1) }}>Try again</Button>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Company Profile" userType="Company">
      <div className="min-w-0 space-y-7">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="font-mono text-sm text-primary">Brand presence</p><h2 className="mt-2 text-3xl font-bold">Company Profile</h2><p className="mt-2 max-w-2xl text-text-muted">Manage supported company information and preview how it may appear across LinkPort.</p></div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <Button type="submit" form="company-profile-form" size="lg" disabled={isSaving || !isDirty}>{isSaving ? 'Saving...' : 'Save changes'}</Button>
            <p aria-live="polite" className="text-xs text-text-muted">{isDirty ? 'Unsaved changes' : saved ? 'All changes saved' : 'No unsaved changes'}</p>
          </div>
        </section>

        <Card className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <CompanyBrandMark name={form.companyName} logoUrl={form.logoUrl} size="lg" />
          <div className="min-w-0 flex-1"><h3 className="break-words text-xl font-semibold">{form.companyName || 'Set up your Company Profile'}</h3><p className="mt-1 break-words text-sm text-text-muted">{form.industry || 'Add your industry and company details.'}</p></div>
          <div className="w-full sm:max-w-xs">
            <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">{completeness.label}</span><span className="font-mono text-sm text-primary">{completeness.percentage}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-background" role="progressbar" aria-label="Company Profile completeness" aria-valuemin="0" aria-valuemax="100" aria-valuenow={completeness.percentage}><div className="h-full bg-primary" style={{ width: `${completeness.percentage}%` }} /></div>
            {completeness.missing.length > 0 && <p className="mt-2 text-xs leading-5 text-text-muted">Missing: {completeness.missing.join(', ')}</p>}
          </div>
        </Card>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(19rem,0.8fr)]">
          <Card padding="lg">
            <form id="company-profile-form" onSubmit={handleSubmit} className="space-y-7" noValidate>
              <FormSection title="Basic information" description="Account and contact information supported by your Company Profile.">
                <div><label htmlFor="company-name" className="text-sm font-medium">Company name</label><input id="company-name" name="companyName" value={form.companyName} onChange={updateField} maxLength="255" aria-invalid={Boolean(fieldErrors.company_name)} aria-describedby={fieldErrors.company_name ? 'company-name-error' : undefined} className={inputClasses} /><FieldError id="company-name-error">{fieldErrors.company_name}</FieldError></div>
                <div><label htmlFor="company-email" className="text-sm font-medium">Account email</label><input id="company-email" type="email" value={form.contactEmail} readOnly className={`${inputClasses} cursor-not-allowed opacity-70`} /><p className="mt-1.5 text-xs text-text-subtle">Read-only account information; it is not saved with this profile.</p></div>
                <div><label htmlFor="company-phone" className="text-sm font-medium">Phone</label><input id="company-phone" name="phone" type="tel" value={form.phone} onChange={updateField} maxLength="30" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'company-phone-error' : undefined} className={inputClasses} /><FieldError id="company-phone-error">{fieldErrors.phone}</FieldError></div>
                <div><label htmlFor="company-location" className="text-sm font-medium">Location</label><input id="company-location" name="location" value={form.location} onChange={updateField} maxLength="120" aria-invalid={Boolean(fieldErrors.location)} aria-describedby={fieldErrors.location ? 'company-location-error' : undefined} className={inputClasses} /><FieldError id="company-location-error">{fieldErrors.location}</FieldError></div>
              </FormSection>

              <FormSection title="Company details" description="Public context that helps members understand your organization.">
                <div><label htmlFor="company-industry" className="text-sm font-medium">Industry</label><input id="company-industry" name="industry" value={form.industry} onChange={updateField} maxLength="120" aria-invalid={Boolean(fieldErrors.industry)} aria-describedby={fieldErrors.industry ? 'company-industry-error' : undefined} className={inputClasses} /><FieldError id="company-industry-error">{fieldErrors.industry}</FieldError></div>
                <div><label htmlFor="employee-count" className="text-sm font-medium">Employee count</label><input id="employee-count" name="employeeCount" type="number" min="1" max="10000000" value={form.employeeCount} onChange={updateField} aria-invalid={Boolean(fieldErrors.employee_count)} aria-describedby={fieldErrors.employee_count ? 'employee-count-error' : undefined} className={inputClasses} /><FieldError id="employee-count-error">{fieldErrors.employee_count}</FieldError></div>
                <div className="md:col-span-2"><label htmlFor="company-description" className="text-sm font-medium">Description</label><textarea id="company-description" name="description" rows="6" maxLength="5000" value={form.description} onChange={updateField} aria-invalid={Boolean(fieldErrors.description)} aria-describedby={fieldErrors.description ? 'company-description-error' : undefined} className={`${inputClasses} resize-y`} /><FieldError id="company-description-error">{fieldErrors.description}</FieldError></div>
              </FormSection>

              <FormSection title="Online presence" description="Public links shown only when valid values are saved.">
                <div><label htmlFor="company-website" className="text-sm font-medium">Website</label><input id="company-website" name="website" type="url" value={form.website} onChange={updateField} placeholder="https://company.example" aria-invalid={Boolean(fieldErrors.website)} aria-describedby={fieldErrors.website ? 'company-website-error' : undefined} className={inputClasses} /><FieldError id="company-website-error">{fieldErrors.website}</FieldError></div>
                <div><label htmlFor="company-linkedin" className="text-sm font-medium">LinkedIn URL</label><input id="company-linkedin" name="linkedinUrl" type="url" value={form.linkedinUrl} onChange={updateField} placeholder="https://linkedin.com/company/..." aria-invalid={Boolean(fieldErrors.linkedin_url)} aria-describedby={fieldErrors.linkedin_url ? 'company-linkedin-error' : undefined} className={inputClasses} /><FieldError id="company-linkedin-error">{fieldErrors.linkedin_url}</FieldError></div>
              </FormSection>

              <FormSection title="Logo and brand image" description="Use a hosted URL to persist your logo, or choose a local file for temporary preview only.">
                <div><label htmlFor="company-logo-url" className="text-sm font-medium">Persisted logo URL</label><input id="company-logo-url" name="logoUrl" type="url" value={form.logoUrl} onChange={updateField} placeholder="https://company.example/logo.png" aria-invalid={Boolean(fieldErrors.logo_url)} aria-describedby={fieldErrors.logo_url ? 'company-logo-error' : undefined} className={inputClasses} /><FieldError id="company-logo-error">{fieldErrors.logo_url}</FieldError></div>
                <div><label htmlFor="company-logo-file" className="text-sm font-medium">Temporary local preview</label><input id="company-logo-file" type="file" accept="image/*" onChange={selectLocalLogo} className={`${inputClasses} file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-contrast`} />{localLogoName && <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-warning"><span className="break-all">{localLogoName} is preview-only.</span><button type="button" onClick={clearLocalLogo} className="font-semibold text-primary">Clear preview</button></div>}<p className="mt-1.5 text-xs leading-5 text-text-subtle">File upload is not connected yet. Use a hosted logo URL to save your logo.</p></div>
              </FormSection>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div aria-live="polite">{generalError && <p role="alert" className="text-sm text-danger-text">{generalError}</p>}{saved && <p className="text-sm text-success-bright">Company Profile saved successfully.</p>}</div>
                <Button type="submit" size="lg" disabled={isSaving || !isDirty}>{isSaving ? 'Saving...' : 'Save changes'}</Button>
              </div>
            </form>
          </Card>

          <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start"><CompanyProfilePreview form={form} localLogoUrl={localLogoUrl} /></aside>
        </div>
      </div>
    </DashboardLayout>
  )
}
