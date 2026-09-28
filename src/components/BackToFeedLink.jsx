import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'

export default function BackToFeedLink({ fallbackPath, fallbackLabel }) {
  const location = useLocation()
  const navigate = useNavigate()
  const returnTo = typeof location.state?.feedReturnTo === 'string'
    ? location.state.feedReturnTo
    : null
  const label = returnTo?.startsWith('/member/home') ? 'Back to Home' : fallbackLabel
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const className = 'inline-flex items-center text-sm font-medium text-primary no-underline transition-colors hover:text-primary-hover hover:no-underline'

  if (returnTo) {
    return (
      <button type="button" onClick={() => navigate(-1)} className={className}>
        <span aria-hidden="true">←</span><span className="ml-1.5">{label}</span>
      </button>
    )
  }

  return (
    <Link to={fallbackPath} className={className}>
      <span aria-hidden="true">←</span><span className="ml-1.5">{fallbackLabel}</span>
    </Link>
  )
}
