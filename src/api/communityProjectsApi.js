import { mapCommunityProject } from '../data/communityProjectMapper'
import api from './axios'

function mapProjectPayload(payload) {
  return {
    ...payload,
    data: mapCommunityProject(payload?.data),
  }
}

export async function getCommunityProjects(params = {}) {
  const response = await api.get('/community-projects', { params })
  const payload = response.data

  return {
    data: Array.isArray(payload?.data)
      ? payload.data.map(mapCommunityProject).filter(Boolean)
      : [],
    links: payload?.links ?? {},
    meta: payload?.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: 12,
      total: 0,
    },
  }
}

export async function getCommunityProject(id) {
  const response = await api.get(`/community-projects/${id}`)
  return mapProjectPayload(response.data)
}

export async function createCommunityProject(payload) {
  const response = await api.post('/community-projects', payload)
  return mapProjectPayload(response.data)
}

export async function updateCommunityProject(id, payload) {
  const response = await api.patch(`/community-projects/${id}`, payload)
  return mapProjectPayload(response.data)
}

export async function deleteCommunityProject(id) {
  const response = await api.delete(`/community-projects/${id}`)
  return response.data
}

export function getCommunityProjectErrorMessage(error, fallback = 'Community projects are temporarily unavailable. Please try again.') {
  const validationErrors = error.response?.data?.errors
  const validationMessages = validationErrors && typeof validationErrors === 'object'
    ? Object.values(validationErrors).flat().filter(Boolean)
    : []

  return validationMessages.length > 0
    ? validationMessages.join(' ')
    : error.response?.data?.message || fallback
}

export function getCommunityProjectValidationErrors(error) {
  const validationErrors = error.response?.data?.errors
  if (!validationErrors || typeof validationErrors !== 'object') return {}

  return Object.fromEntries(
    Object.entries(validationErrors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.filter(Boolean).join(' ') : String(messages),
    ]),
  )
}

export function isCommunityProjectNotFound(error) {
  return error.response?.status === 404
}
