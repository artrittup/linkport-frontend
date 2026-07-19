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
    throw new Error('Please register as a candidate or company.')
  }

  const response = await api.post('/register', {
    fullName: data.fullName ?? data.name,
    email: data.email,
    password: data.password,
    confirmPassword: data.confirmPassword,
    role,
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
