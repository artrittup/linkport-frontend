export function getNotificationDestination(notification) {
  const data = notification?.data ?? {}

  if (notification?.type === 'connection_request') return '/connections?tab=requests'
  if (notification?.type === 'connection_accepted') return '/connections?tab=network'
  if (notification?.type === 'circle_invitation') return '/circles?tab=invitations'
  if (notification?.type?.startsWith('circle_') && data.circle_id) return `/circles/${data.circle_id}`
  if (notification?.type === 'job_application_received') return '/company/applications'
  if (notification?.type === 'job_application_status') return '/candidate/applications'
  if (notification?.type === 'project_bid_received') return '/company/bids'
  if (notification?.type === 'project_bid_status') return '/candidate/bids'

  return '/notifications'
}
