import { mapCommunityEvent } from '../data/communityEventMapper'
import api from './axios'

const defaultMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
}

function mapPaginatedEvents(payload) {
  return {
    data: Array.isArray(payload?.data)
      ? payload.data.map(mapCommunityEvent).filter(Boolean)
      : [],
    links: payload?.links ?? {},
    meta: payload?.meta ?? defaultMeta,
  }
}

function mapEventPayload(payload) {
  return {
    ...payload,
    data: mapCommunityEvent(payload?.data),
  }
}

export async function getCommunityEvents(params = {}) {
  const response = await api.get('/community-events', { params })
  return mapPaginatedEvents(response.data)
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
  return mapPaginatedEvents(response.data)
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
