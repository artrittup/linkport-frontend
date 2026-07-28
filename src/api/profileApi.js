import api from './axios'

export async function getCandidateProfile() {
  const response = await api.get('/candidate/profile')
  return response.data
}

export async function updateCandidateProfile(data) {
  const response = await api.put('/candidate/profile', data)
  return response.data
}

export async function getCompanyProfile() {
  const response = await api.get('/company/profile')
  return response.data
}

export async function updateCompanyProfile(data) {
  const response = await api.put('/company/profile', data)
  return response.data
}

export function getProfileErrorMessage(error, fallbackMessage) {
  const validationErrors = error.response?.data?.errors
  const messages = validationErrors
    ? Object.values(validationErrors).flat().filter(Boolean)
    : []

  if (messages.length > 0) return messages.join(' ')

  const status = error.response?.status
  return status && status < 500
    ? error.response?.data?.message || fallbackMessage
    : fallbackMessage
}

export function getProfileValidationErrors(error) {
  const validationErrors = error.response?.data?.errors

  if (!validationErrors || typeof validationErrors !== 'object') return {}

  return Object.fromEntries(
    Object.entries(validationErrors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.filter(Boolean).join(' ') : String(messages),
    ]),
  )
}
