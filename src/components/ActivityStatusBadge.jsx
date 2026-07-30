const statusClasses = {
  Pending: 'border-warning/30 bg-warning/10 text-warning-text',
  Accepted: 'border-success/30 bg-success/10 text-success-text',
  Rejected: 'border-danger/30 bg-danger/10 text-danger-text',
}

export default function ActivityStatusBadge({ status }) {
  const statusClass = statusClasses[status]
    ?? 'border-border bg-background/70 text-text-muted'

  return (
    <span className={`inline-flex max-w-full break-words rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
      {status || 'Unknown'}
    </span>
  )
}
