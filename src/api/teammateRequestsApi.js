import { mapTeammateRequest } from '../data/teammateRequestMapper'
import api from './axios'

function mapRequestPayload(payload) {
  return {
    ...payload,
    data: mapTeammateRequest(payload?.data),
  }
}

export async function getTeammateRequests(params = {}) {
  const response = await api.get('/teammate-requests', { params })
  const payload = response.data

  return {
    data: Array.isArray(payload?.data)
      ? payload.data.map(mapTeammateRequest).filter(Boolean)
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

export async function getTeammateRequest(id) {
  const response = await api.get(`/teammate-requests/${id}`)
  return mapRequestPayload(response.data)
}

export async function createTeammateRequest(payload) {
  const response = await api.post('/teammate-requests', payload)
  return mapRequestPayload(response.data)
}

export async function updateTeammateRequest(id, payload) {
  const response = await api.patch(`/teammate-requests/${id}`, payload)
  return mapRequestPayload(response.data)
}

export async function deleteTeammateRequest(id) {
  const response = await api.delete(`/teammate-requests/${id}`)
  return response.data
}

export function getTeammateRequestErrorMessage(error, fallback = 'Teammate requests are temporarily unavailable. Please try again.') {
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

export function getTeammateRequestValidationErrors(error) {
  const validationErrors = error.response?.data?.errors
  if (!validationErrors || typeof validationErrors !== 'object') return {}

  const normalizedErrors = Object.fromEntries(
    Object.entries(validationErrors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.filter(Boolean).join(' ') : String(messages),
    ]),
  )

  Object.entries(normalizedErrors).forEach(([field, message]) => {
    const parentField = field.split('.')[0]
    if (!normalizedErrors[parentField]) normalizedErrors[parentField] = message
  })

  return normalizedErrors
}

export function isTeammateRequestNotFound(error) {
  return error.response?.status === 404
}
