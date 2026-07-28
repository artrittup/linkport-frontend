import api from './axios'
import { mapNotification, mapNotificationsResponse } from '../utils/notificationMapper'

export const NOTIFICATIONS_CHANGED_EVENT = 'linkport:notifications-changed'

export function announceNotificationsChanged(source = '') {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT, {
    detail: { source },
  }))
}

export async function getNotifications(params = {}) {
  const response = await api.get('/notifications', { params })
  return mapNotificationsResponse(response.data)
}

export async function getUnreadNotificationCount() {
  const response = await api.get('/notifications/unread-count')
  return response.data
}

export async function markNotificationAsRead(id) {
  const response = await api.patch(`/notifications/${id}/read`)
  return {
    ...response.data,
    notification: mapNotification(response.data.notification),
    unreadCount: Number(response.data.unread_count ?? 0),
  }
}

export async function markAllNotificationsAsRead() {
  const response = await api.patch('/notifications/read-all')
  return {
    ...response.data,
    unreadCount: Number(response.data.unread_count ?? 0),
  }
}

export async function deleteNotification(id) {
  const response = await api.delete(`/notifications/${id}`)
  return {
    ...response.data,
    unreadCount: Number(response.data.unread_count ?? 0),
  }
}

export async function deleteSelectedNotifications(ids) {
  const notificationIds = [...new Set(ids)]
  const response = await api.post('/notifications/delete-selected', {
    notification_ids: notificationIds,
  })
  return {
    ...response.data,
    unreadCount: Number(response.data.unread_count ?? 0),
  }
}

export async function deleteAllNotifications() {
  const response = await api.delete('/notifications')
  return {
    ...response.data,
    unreadCount: Number(response.data.unread_count ?? 0),
  }
}

export const markNotificationRead = markNotificationAsRead
export const markAllNotificationsRead = markAllNotificationsAsRead

export function getNotificationErrorMessage(error, fallback = 'Unable to load notifications.') {
  if (error.response?.status === 401) return 'Your session has expired. Please sign in again.'
  if (error.response?.status >= 400 && error.response?.status < 500) {
    return error.response?.data?.message || fallback
  }
  return fallback
}
