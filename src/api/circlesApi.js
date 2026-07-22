import api from './axios'

export function normalizeCircle(circle) {
  if (!circle) return null

  const members = Array.isArray(circle.members) ? circle.members : []

  return {
    ...circle,
    skills: Array.isArray(circle.skills) ? circle.skills : [],
    members,
    memberCount: Number(circle.members_count ?? members.length),
    membershipRole: circle.pivot?.role ?? null,
    ownerName: circle.owner?.name ?? 'Unknown member',
  }
}

function normalizePaginatedCircles(payload = {}, params = {}) {
  return {
    ...payload,
    data: Array.isArray(payload.data)
      ? payload.data.map(normalizeCircle)
      : [],
    current_page: Number(payload.current_page ?? 1),
    total: Number(payload.total ?? 0),
    per_page: Number(payload.per_page ?? params.per_page ?? 15),
  }
}

export async function getCircles(params = {}) {
  const response = await api.get('/circles', { params })
  return normalizePaginatedCircles(response.data, params)
}

export async function getMyCircles(params = {}) {
  const response = await api.get('/circles/my', { params })
  return normalizePaginatedCircles(response.data, params)
}

export async function createCircle(data) {
  const response = await api.post('/circles', data)
  return {
    ...response.data,
    circle: normalizeCircle(response.data.circle),
  }
}

export async function getCircle(id) {
  const response = await api.get(`/circles/${id}`)
  return {
    ...response.data,
    circle: normalizeCircle(response.data.circle),
  }
}

export async function updateCircle(id, data) {
  const response = await api.patch(`/circles/${id}`, data)
  return {
    ...response.data,
    circle: normalizeCircle(response.data.circle),
  }
}

export async function deleteCircle(id) {
  const response = await api.delete(`/circles/${id}`)
  return response.data
}

export async function inviteMember(circleId, data) {
  const response = await api.post(`/circles/${circleId}/invitations`, data)
  return response.data
}

export async function getMyCircleInvitations(params = {}) {
  const response = await api.get('/circle-invitations/my', { params })
  const payload = response.data ?? {}

  return {
    ...payload,
    data: Array.isArray(payload.data)
      ? payload.data.map((invitation) => ({
          ...invitation,
          circle: normalizeCircle(invitation.circle),
          invitedBy: invitation.inviter?.name ?? 'Unknown member',
        }))
      : [],
  }
}

export async function acceptInvitation(id) {
  const response = await api.patch(`/circle-invitations/${id}/accept`)
  return response.data
}

export async function rejectInvitation(id) {
  const response = await api.patch(`/circle-invitations/${id}/reject`)
  return response.data
}

export async function requestToJoinCircle(circleId) {
  const response = await api.post(`/circles/${circleId}/join-requests`)
  return response.data
}

export async function getCircleJoinRequests(circleId, params = {}) {
  const response = await api.get(`/circles/${circleId}/join-requests`, { params })
  return response.data
}

export async function getMyCircleJoinRequests(params = {}) {
  const response = await api.get('/circle-join-requests/my', { params })
  return response.data
}

export async function acceptJoinRequest(id) {
  const response = await api.patch(`/circle-join-requests/${id}/accept`)
  return response.data
}

export async function rejectJoinRequest(id) {
  const response = await api.patch(`/circle-join-requests/${id}/reject`)
  return response.data
}

export async function removeCircleMember(circleId, userId) {
  const response = await api.delete(`/circles/${circleId}/members/${userId}`)
  return response.data
}

export function getCircleErrorMessage(error, fallbackMessage) {
  const validationErrors = error.response?.data?.errors
  const messages = validationErrors
    ? Object.values(validationErrors).flat().filter(Boolean)
    : []

  return messages.length > 0
    ? messages.join(' ')
    : error.response?.data?.message || error.message || fallbackMessage
}
