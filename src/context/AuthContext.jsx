/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../api/authApi'

const AuthContext = createContext(null)

const dashboardPaths = {
  candidate: '/candidate/dashboard',
  company: '/company/dashboard',
  admin: '/admin/dashboard',
}

export function getDashboardPath(role) {
  return dashboardPaths[role] ?? '/login'
}

const getStoredUser = () => {
  const storedUser = localStorage.getItem('linkport_user')

  if (!storedUser) return null

  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem('linkport_user')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)
  const [token, setToken] = useState(() =>
    localStorage.getItem('linkport_token'),
  )
  const [isLoading, setIsLoading] = useState(() =>
    Boolean(localStorage.getItem('linkport_token')),
  )

  const clearSession = () => {
    localStorage.removeItem('linkport_token')
    localStorage.removeItem('linkport_user')
    setToken(null)
    setUser(null)
  }

  const saveSession = ({ token: nextToken, user: nextUser }) => {
    if (!nextToken || !nextUser) {
      throw new Error('The server returned an invalid authentication response.')
    }

    localStorage.setItem('linkport_token', nextToken)
    localStorage.setItem('linkport_user', JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)

    return nextUser
  }

  useEffect(() => {
    const handleUnauthorized = () => clearSession()
    window.addEventListener('linkport:unauthorized', handleUnauthorized)

    return () =>
      window.removeEventListener('linkport:unauthorized', handleUnauthorized)
  }, [])

  useEffect(() => {
    let isActive = true

    async function verifySession() {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await getCurrentUser()

        if (isActive) {
          localStorage.setItem('linkport_user', JSON.stringify(currentUser))
          setUser(currentUser)
        }
      } catch {
        if (isActive) clearSession()
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    verifySession()

    return () => {
      isActive = false
    }
  }, [token])

  const login = async (credentials) => {
    const response = await loginUser(credentials)
    return saveSession(response)
  }

  const register = async (data) => {
    const response = await registerUser(data)
    return saveSession(response)
  }

  const logout = async () => {
    try {
      if (token) await logoutUser()
    } catch {
      // The local session must still end if the token is already invalid.
    } finally {
      clearSession()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
