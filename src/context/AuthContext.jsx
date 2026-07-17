/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

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

  const saveSession = (nextUser) => {
    const mockToken = 'mock-token'

    localStorage.setItem('linkport_token', mockToken)
    localStorage.setItem('linkport_user', JSON.stringify(nextUser))
    setToken(mockToken)
    setUser(nextUser)

    return nextUser
  }

  const login = async (email, password, role = 'candidate') => {
    void password

    return saveSession({
      name: email.split('@')[0] || 'LinkPort User',
      email,
      role,
    })
  }

  const register = async (data) => {
    return saveSession({
      name: data.name,
      email: data.email,
      role: data.role,
    })
  }

  const logout = () => {
    localStorage.removeItem('linkport_token')
    localStorage.removeItem('linkport_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
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
