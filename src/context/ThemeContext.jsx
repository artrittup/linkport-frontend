/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const THEMES = new Set(['light', 'dark'])
const ThemeContext = createContext(null)

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.__LINKPORT_INITIAL_THEME__ === 'dark' ? 'dark' : 'light'
}

function applyTheme(theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.style.colorScheme = theme
  window.__LINKPORT_INITIAL_THEME__ = theme
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)

  const setTheme = useCallback((nextTheme) => {
    const validatedTheme = THEMES.has(nextTheme) ? nextTheme : 'light'
    applyTheme(validatedTheme)
    setThemeState(validatedTheme)

    try {
      if (window.__LINKPORT_THEME_STORAGE_KEY__) {
        window.localStorage.setItem(
          window.__LINKPORT_THEME_STORAGE_KEY__,
          validatedTheme,
        )
      }
    } catch {
      // The theme still applies for this session when storage is unavailable.
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  }), [setTheme, theme, toggleTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
