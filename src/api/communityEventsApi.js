import { mapCommunityEvent } from '../data/communityEventMapper'
import { normalizePaginatedResponse } from '../utils/apiResponse'
import api from './axios'

function mapPaginatedEvents(payload, perPage) {
  return normalizePaginatedResponse(payload, {
    mapItem: mapCommunityEvent,
    perPage,
  })
}

function mapEventPayload(payload) {
  return {
    ...payload,
    data: mapCommunityEvent(payload?.data),
  }
}

export async function getCommunityEvents(params = {}) {
  const response = await api.get('/community-events', { params })
  return mapPaginatedEvents(response.data, params.per_page ?? 15)
}

export async function getCommunityEvent(id) {
  const response = await api.get(`/community-events/${id}`)
  return mapEventPayload(response.data)
}

export async function attendCommunityEvent(id) {
  const response = await api.post(`/community-events/${id}/attend`)
  return mapEventPayload(response.data)
}

export async function removeCommunityEventAttendance(id) {
  const response = await api.delete(`/community-events/${id}/attend`)
  return mapEventPayload(response.data)
}

export async function getMyCommunityEvents(params = {}) {
  const response = await api.get('/my-community-events', { params })
  return mapPaginatedEvents(response.data, params.per_page ?? 15)
}

export async function deleteCommunityEvent(id) {
  const response = await api.delete(`/community-events/${id}`)
  return response.data
}

export function getCommunityEventErrorMessage(error, fallback = 'Community events are temporarily unavailable. Please try again.') {
  const status = error.response?.status
  return status && status < 500
    ? error.response?.data?.message || fallback
    : fallback
}

export function isCommunityEventNotFound(error) {
  return error.response?.status === 404
}
