import api from './axios'

export async function searchProfiles(params = {}) {
  const response = await api.get('/search', { params })
  return response.data
}

export async function getMemberPublicProfile(id) {
  const response = await api.get(`/members/${id}`)
  return response.data
}

export async function getCompanyPublicProfile(id) {
  const response = await api.get(`/companies/${id}`)
  return response.data
}
