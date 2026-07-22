import api from './axios'

export async function loginUser(credentials) {
  const response = await api.post('/login', {
    email: credentials.email,
    password: credentials.password,
  })
  return response.data
}

export async function registerUser(data) {
  const role = data.role

  if (!['candidate', 'company'].includes(role)) {
    throw new Error('Please register as a member or company.')
  }

  const optionalString = (value) => value?.trim() || undefined
  const profile = role === 'candidate'
    ? {
        headline: optionalString(data.candidateProfile?.professionalTitle),
        bio: optionalString(data.candidateProfile?.bio),
        location: optionalString(data.candidateProfile?.location),
        phone: optionalString(data.candidateProfile?.phone),
        website: optionalString(data.candidateProfile?.portfolioLink),
        github_url: optionalString(data.candidateProfile?.githubUrl),
        linkedin_url: optionalString(data.candidateProfile?.linkedinUrl),
        skills: data.candidateProfile?.skills?.length
          ? data.candidateProfile.skills
          : undefined,
        education: optionalString(data.candidateProfile?.education),
        experience: optionalString(data.candidateProfile?.experience),
        cv_url: optionalString(data.candidateProfile?.cvUrl),
      }
    : {
        company_name: optionalString(data.companyProfile?.companyName),
        description: optionalString(data.companyProfile?.description),
        industry: optionalString(data.companyProfile?.industry),
        location: optionalString(data.companyProfile?.location),
        phone: optionalString(data.companyProfile?.phone),
        website: optionalString(data.companyProfile?.website),
        linkedin_url: optionalString(data.companyProfile?.linkedinUrl),
        logo_url: optionalString(data.companyProfile?.logoUrl),
        employee_count: data.companyProfile?.employeeCount
          ? Number(data.companyProfile.employeeCount)
          : undefined,
      }

  const response = await api.post('/register', {
    fullName: data.fullName ?? data.name,
    email: data.email,
    password: data.password,
    confirmPassword: data.confirmPassword,
    role,
    ...profile,
  })
  return response.data
}

export async function logoutUser() {
  const response = await api.post('/logout')
  return response.data
}

export async function getCurrentUser() {
  const response = await api.get('/user')
  return response.data
}

export function getAuthErrorMessage(error, fallbackMessage) {
  const validationErrors = error.response?.data?.errors
  const firstValidationMessage = validationErrors
    ? Object.values(validationErrors).flat().find(Boolean)
    : null

  return (
    firstValidationMessage ||
    error.response?.data?.message ||
    error.message ||
    fallbackMessage
  )
}
