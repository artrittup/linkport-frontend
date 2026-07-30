import { getCandidateActivityPath } from '../config/candidateActivity'

export function getNotificationDestination(notification, fallback = '/notifications') {
  const targetRoute = notification?.targetRoute
  const hasUnsafeCharacter = typeof targetRoute === 'string' && (
    targetRoute.includes('\\')
    || [...targetRoute].some((character) => {
      const code = character.charCodeAt(0)
      return code < 32 || code === 127
    })
  )
  if (
    typeof targetRoute === 'string'
    && targetRoute.startsWith('/')
    && !targetRoute.startsWith('//')
    && !hasUnsafeCharacter
  ) {
    return targetRoute.replace(/^\/candidate(?=\/|$)/, '/member')
  }

  const data = notification?.metadata ?? {}
  const type = notification?.eventType ?? notification?.type

  if (type === 'connection_request') return '/connections?tab=requests'
  if (type === 'connection_accepted') return '/connections?tab=network'
  if (type === 'circle_invitation') return '/circles?tab=invitations'
  if (type?.startsWith('circle_') && data.circle_id) return `/circles/${data.circle_id}`
  if (type === 'job_application_received') return '/company/applications'
  if (type === 'job_application_status') return getCandidateActivityPath('applications')
  if (type === 'project_bid_received') return '/company/applications?type=proposals'
  if (type === 'project_bid_status') return getCandidateActivityPath('proposals')

  return fallback
}
