import api from './axios'

export async function loginUser(credentials) {
  const response = await api.post('/login', {
    email: credentials.email,
    password: credentials.password,
    captcha_token: credentials.captchaToken,
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
    ? {}
    : {
        company_name: optionalString(data.companyProfile?.companyName),
        owner_name: optionalString(data.companyProfile?.ownerName),
        company_type: optionalString(data.companyProfile?.companyType),
        registration_number: optionalString(data.companyProfile?.registrationNumber),
        registration_document_url: optionalString(data.companyProfile?.registrationDocumentUrl),
        contact_email: optionalString(data.companyProfile?.contactEmail),
        country: optionalString(data.companyProfile?.country),
        location: optionalString(data.companyProfile?.location),
        phone: optionalString(data.companyProfile?.phone),
        website: optionalString(data.companyProfile?.website),
        industry: optionalString(data.companyProfile?.industry),
        description: optionalString(data.companyProfile?.description),
      }

  const response = await api.post('/register', {
    fullName: data.fullName ?? data.name,
    username: data.username,
    captcha_token: data.captchaToken,
    email: data.email,
    password: data.password,
    confirmPassword: data.confirmPassword,
    role,
    ...profile,
  })
  return response.data
}

export async function requestPasswordReset(email) {
  const response = await api.post('/forgot-password', { email })
  return response.data
}

export async function resetPassword({ token, email, password, passwordConfirmation }) {
  const response = await api.post('/reset-password', {
    token,
    email,
    password,
    password_confirmation: passwordConfirmation,
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
