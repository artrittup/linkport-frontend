import { useLayoutEffect, useState } from 'react'
import { useLocation } from 'react-router'
import linkPortLogo from '../assets/linkport-logo.svg'
import {
  getPageLoadingState,
  startPageLoad,
  subscribeToPageLoading,
} from '../utils/pageLoading'

export function FullPageLoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-[#071426] px-6 text-[#e6f1ff]"
      role="status"
      aria-live="polite"
      aria-label="Loading LinkPort"
    >
      <div className="flex flex-col items-center text-center">
        <img src={linkPortLogo} alt="" className="h-14 w-auto" />
        <p className="mt-5 text-xl font-bold">
          Link<span className="text-[#64ffda]">Port</span>
        </p>
        <span className="mt-6 h-9 w-9 animate-spin rounded-full border-2 border-[#233554] border-t-[#64ffda]" aria-hidden="true" />
        <p className="mt-4 text-sm text-[#8892b0]">Loading everything you need...</p>
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
