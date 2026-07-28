export const COMPANY_PROFILE_UPDATED_EVENT = 'linkport:company-profile-updated'

export const COMPANY_PROFILE_FIELD_MAP = {
  companyName: 'company_name',
  description: 'description',
  industry: 'industry',
  location: 'location',
  phone: 'phone',
  website: 'website',
  linkedinUrl: 'linkedin_url',
  logoUrl: 'logo_url',
  employeeCount: 'employee_count',
}

export const emptyCompanyProfileForm = {
  companyName: '',
  description: '',
  industry: '',
  location: '',
  phone: '',
  website: '',
  linkedinUrl: '',
  logoUrl: '',
  employeeCount: '',
  contactEmail: '',
}

export function mapCompanyProfileToForm(profile, email = '') {
  return {
    companyName: profile?.company_name ?? '',
    description: profile?.description ?? '',
    industry: profile?.industry ?? '',
    location: profile?.location ?? '',
    phone: profile?.phone ?? '',
    website: profile?.website ?? '',
    linkedinUrl: profile?.linkedin_url ?? '',
    logoUrl: profile?.logo_url ?? '',
    employeeCount: profile?.employee_count?.toString() ?? '',
    contactEmail: email,
  }
}

const nullable = (value = '') => String(value).trim() || null

export function mapCompanyProfileToPayload(form) {
  return {
    company_name: nullable(form.companyName),
    description: nullable(form.description),
    industry: nullable(form.industry),
    location: nullable(form.location),
    phone: nullable(form.phone),
    website: nullable(form.website),
    linkedin_url: nullable(form.linkedinUrl),
    logo_url: nullable(form.logoUrl),
    employee_count: form.employeeCount ? Number(form.employeeCount) : null,
  }
}

const completenessFields = [
  { key: 'company_name', label: 'Company name' },
  { key: 'description', label: 'Description' },
  { key: 'industry', label: 'Industry' },
  { key: 'website', label: 'Website' },
  { key: 'logo_url', label: 'Logo' },
  { key: 'employee_count', label: 'Employee count' },
]

export function getCompanyProfileCompleteness(profile) {
  const missing = completenessFields
    .filter(({ key }) => {
      const value = profile?.[key]
      return value === null || value === undefined || String(value).trim() === ''
    })
    .map(({ label }) => label)
  const completed = completenessFields.length - missing.length
  const percentage = Math.round((completed / completenessFields.length) * 100)

  return {
    percentage,
    missing,
    label: percentage === 100
      ? 'Profile complete'
      : percentage >= 67
        ? 'Profile is mostly complete'
        : 'Profile needs information',
  }
}

export function getCompanyInitials(name) {
  return String(name || 'Company')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'CO'
}

export function getSafeCompanyUrl(value) {
  if (!value) return ''
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : ''
  } catch {
    return ''
  }
}
