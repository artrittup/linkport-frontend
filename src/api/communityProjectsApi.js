import { mapCommunityProject } from '../data/communityProjectMapper'
import { normalizePaginatedResponse } from '../utils/apiResponse'
import api from './axios'

function mapProjectPayload(payload) {
  return {
    ...payload,
    data: mapCommunityProject(payload?.data),
  }
}

export async function getCommunityProjects(params = {}) {
  const response = await api.get('/community-projects', { params })
  return normalizePaginatedResponse(response.data, {
    mapItem: mapCommunityProject,
    perPage: params.per_page ?? 12,
  })
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

  if (validationMessages.length > 0) return validationMessages.join(' ')

  const status = error.response?.status
  return status && status < 500
    ? error.response?.data?.message || fallback
    : fallback
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
