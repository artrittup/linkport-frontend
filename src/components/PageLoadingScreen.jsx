import { useLayoutEffect, useState } from 'react'
import { useLocation } from 'react-router'
import LinkPortLogo from './LinkPortLogo'
import {
  getPageLoadingState,
  startPageLoad,
  subscribeToPageLoading,
} from '../utils/pageLoading'

export function FullPageLoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-surface-deep px-6 text-text-primary"
      role="status"
      aria-live="polite"
      aria-label="Loading LinkPort"
    >
      <div className="flex flex-col items-center text-center">
        <LinkPortLogo className="h-14 w-auto" />
        <p className="mt-5 text-xl font-bold">
          Link<span className="text-primary">Port</span>
        </p>
        <span className="mt-6 h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden="true" />
        <p className="mt-4 text-sm text-text-muted">Loading everything you need...</p>
      </div>
    </div>
  )
}

export default function PageLoadingScreen() {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(getPageLoadingState)

  useLayoutEffect(
    () => subscribeToPageLoading(setIsLoading),
    [],
  )

  useLayoutEffect(() => {
    startPageLoad()
  }, [location.pathname, location.search])

  return isLoading ? <FullPageLoadingScreen /> : null
}
