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

  return messages.length > 0
    ? messages.join(' ')
    : error.response?.data?.message || error.message || fallbackMessage
}
