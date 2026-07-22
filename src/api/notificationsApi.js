import api from './axios'

export const NOTIFICATIONS_CHANGED_EVENT = 'linkport:notifications-changed'

export function announceNotificationsChanged() {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT))
}

export async function getNotifications(params = {}) {
  const normalizedParams = {
    ...params,
    unread: params.unread === true ? 1 : params.unread === false ? 0 : params.unread,
  }
  const response = await api.get('/notifications', { params: normalizedParams })
  return response.data
}

export async function getUnreadNotificationCount() {
  const response = await api.get('/notifications/unread-count')
  return response.data
}

export async function markNotificationAsRead(id) {
  const response = await api.patch(`/notifications/${id}/read`)
  return response.data
}

export async function markAllNotificationsAsRead() {
  const response = await api.patch('/notifications/read-all')
  return response.data
}

export async function deleteNotification(id) {
  const response = await api.delete(`/notifications/${id}`)
  return response.data
}

export function getNotificationErrorMessage(error, fallback = 'Unable to load notifications.') {
  return error.response?.data?.message || error.message || fallback
}
