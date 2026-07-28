/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useRef, useState } from 'react'

const STORAGE_KEY = 'linkport_candidate_content_v1'
const emptyContent = {
  readNotificationIds: [],
  deletedNotificationIds: [],
}
const LocalContentContext = createContext(null)

function readStoredContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { content: emptyContent, error: '' }

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid local content')

    const readNotificationIds = Array.isArray(parsed.readNotificationIds)
      ? [...new Set(parsed.readNotificationIds.filter((notificationId) => typeof notificationId === 'string' && notificationId.trim()))]
      : []
    const deletedNotificationIds = Array.isArray(parsed.deletedNotificationIds)
      ? [...new Set(parsed.deletedNotificationIds.filter((notificationId) => typeof notificationId === 'string' && notificationId.trim()))]
      : []

    return {
      content: {
        readNotificationIds,
        deletedNotificationIds,
      },
      error: '',
    }
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // The in-memory experience remains available when storage is blocked.
    }
    return {
      content: emptyContent,
      error: 'Saved local content could not be read and was reset safely.',
    }
  }
}

export function LocalContentProvider({ children }) {
  const [initialContent] = useState(readStoredContent)
  const [content, setContent] = useState(initialContent.content)
  const [storageError, setStorageError] = useState(initialContent.error)
  const contentRef = useRef(initialContent.content)

  const persistContent = useCallback((nextContent) => {
    contentRef.current = nextContent
    setContent(nextContent)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextContent))
      setStorageError('')
    } catch {
      setStorageError('Content is available for this session, but this browser could not save it for refresh.')
    }
  }, [])

  const markCandidateNotificationRead = useCallback((notificationId) => {
    if (typeof notificationId !== 'string' || !notificationId.trim()) return

    persistContent({
      ...contentRef.current,
      readNotificationIds: [...new Set([
        ...contentRef.current.readNotificationIds,
        notificationId,
      ])],
    })
  }, [persistContent])

  const markAllCandidateNotificationsRead = useCallback((notificationIds) => {
    const validIds = Array.isArray(notificationIds)
      ? notificationIds.filter((notificationId) => typeof notificationId === 'string' && notificationId.trim())
      : []

    persistContent({
      ...contentRef.current,
      readNotificationIds: [...new Set([
        ...contentRef.current.readNotificationIds,
        ...validIds,
      ])],
    })
  }, [persistContent])

  const deleteCandidateNotifications = useCallback((notificationIds) => {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds]
    const validIds = ids.filter((notificationId) => (
      typeof notificationId === 'string' && notificationId.trim()
    ))
    if (validIds.length === 0) return

    persistContent({
      ...contentRef.current,
      deletedNotificationIds: [...new Set([
        ...contentRef.current.deletedNotificationIds,
        ...validIds,
      ])],
    })
  }, [persistContent])

  return (
    <LocalContentContext.Provider value={{
      readNotificationIds: content.readNotificationIds,
      deletedNotificationIds: content.deletedNotificationIds,
      storageError,
      markCandidateNotificationRead,
      markAllCandidateNotificationsRead,
      deleteCandidateNotifications,
    }}>
      {children}
    </LocalContentContext.Provider>
  )
}

export function useLocalContent() {
  const context = useContext(LocalContentContext)
  if (!context) throw new Error('useLocalContent must be used within LocalContentProvider')
  return context
}
