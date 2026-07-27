/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useRef, useState } from 'react'

const STORAGE_KEY = 'linkport_candidate_content_v1'
const emptyContent = { projects: [], posts: [], teamRequests: [], attendingEventIds: [] }
const LocalContentContext = createContext(null)

function sanitizeArray(value, normalize) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === 'object').map(normalize).filter(Boolean)
    : []
}

function readStoredContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { content: emptyContent, error: '' }

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid local content')

    const projects = sanitizeArray(parsed.projects, (project) => (
      typeof project.id === 'string' && typeof project.title === 'string'
        ? {
            ...project,
            skills: Array.isArray(project.skills) ? project.skills.filter((item) => typeof item === 'string') : [],
            teamMembers: Array.isArray(project.teamMembers) ? project.teamMembers.filter((item) => typeof item === 'string') : [],
            lookingForRoles: Array.isArray(project.lookingForRoles) ? project.lookingForRoles.filter((item) => typeof item === 'string') : [],
          }
        : null
    ))
    const posts = sanitizeArray(parsed.posts, (post) => (
      typeof post.id === 'string' && typeof post.text === 'string'
        ? { ...post, tags: Array.isArray(post.tags) ? post.tags.filter((item) => typeof item === 'string') : [] }
        : null
    ))
    const teamRequests = sanitizeArray(parsed.teamRequests, (request) => (
      typeof request.id === 'string' && typeof request.title === 'string'
        ? {
            ...request,
            roles: Array.isArray(request.roles) ? request.roles.filter((item) => typeof item === 'string') : [],
            skills: Array.isArray(request.skills) ? request.skills.filter((item) => typeof item === 'string') : [],
          }
        : null
    ))
    const attendingEventIds = Array.isArray(parsed.attendingEventIds)
      ? [...new Set(parsed.attendingEventIds.filter((eventId) => typeof eventId === 'string' && eventId.trim()))]
      : []

    return {
      content: { projects, posts, teamRequests, attendingEventIds },
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

function createId(prefix) {
  const randomId = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return `${prefix}-${randomId}`
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

  const storeItem = useCallback((collection, item) => {
    persistContent({
      ...contentRef.current,
      [collection]: [item, ...contentRef.current[collection]],
    })
  }, [persistContent])

  const addProject = useCallback((project) => {
    const item = { ...project, id: createId('local-project'), createdAt: new Date().toISOString(), local: true }
    storeItem('projects', item)
    return item
  }, [storeItem])

  const addPost = useCallback((post) => {
    const item = { ...post, id: createId('local-post'), createdAt: new Date().toISOString(), local: true }
    storeItem('posts', item)
    return item
  }, [storeItem])

  const addTeamRequest = useCallback((request) => {
    const item = { ...request, id: createId('local-team'), createdAt: new Date().toISOString(), local: true }
    storeItem('teamRequests', item)
    return item
  }, [storeItem])

  const getProject = useCallback(
    (projectId) => content.projects.find((project) => project.id === projectId),
    [content.projects],
  )

  const setEventAttendance = useCallback((eventId, isAttending) => {
    if (typeof eventId !== 'string' || !eventId.trim()) return

    const currentIds = contentRef.current.attendingEventIds
    const nextIds = isAttending
      ? [...new Set([...currentIds, eventId])]
      : currentIds.filter((savedEventId) => savedEventId !== eventId)

    persistContent({
      ...contentRef.current,
      attendingEventIds: nextIds,
    })
  }, [persistContent])

  return (
    <LocalContentContext.Provider value={{
      projects: content.projects,
      posts: content.posts,
      teamRequests: content.teamRequests,
      attendingEventIds: content.attendingEventIds,
      storageError,
      addProject,
      addPost,
      addTeamRequest,
      getProject,
      setEventAttendance,
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
