import { mapCommunityMember } from '../data/communityMemberMapper'
import api from './axios'

const defaultMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
}

export async function getCommunityMembers(params = {}) {
  const response = await api.get('/community-members', { params })
  const payload = response.data

  return {
    data: Array.isArray(payload?.data)
      ? payload.data.map(mapCommunityMember).filter(Boolean)
      : [],
    links: payload?.links ?? {},
    meta: payload?.meta ?? defaultMeta,
  }
}

export async function getCommunityMember(userId) {
  const response = await api.get(`/community-members/${userId}`)
  return {
    ...response.data,
    data: mapCommunityMember(response.data?.data),
  }
}

export function getCommunityMemberErrorMessage(error, fallback = 'Community members are temporarily unavailable. Please try again.') {
  const status = error.response?.status
  return status && status < 500
    ? error.response?.data?.message || fallback
    : fallback
}

export function isCommunityMemberNotFound(error) {
  return error.response?.status === 404
}
