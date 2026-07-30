export default function NotificationRow({
  notification,
  compact = false,
  selected = false,
  selectionMode = false,
  onSelect,
  onOpen,
  onDelete,
  formattedTime,
  disabled = false,
  isDeleting = false,
}) {
  const isRead = notification.isRead
  const timestamp = notification.createdAt

  if (compact) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onOpen?.(notification)}
        className={`relative block w-full min-w-0 rounded-lg px-3 py-3 text-left transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-wait ${
          isRead ? '' : 'bg-primary/5'
        }`}
      >
        {!isRead && <span className="absolute right-3 top-4 h-1.5 w-1.5 rounded-full bg-primary" aria-label="Unread" />}
        <p className="break-words pr-4 text-sm font-medium text-text-primary">{notification.title}</p>
        {notification.message && <p className="mt-1 line-clamp-2 break-words pr-3 text-xs leading-5 text-text-muted">{notification.message}</p>}
        <time dateTime={timestamp} className="mt-1.5 block text-[10px] text-text-subtle">{formattedTime}</time>
      </button>
    )
  }

  return (
    <article className={`group flex min-w-0 items-start transition-colors hover:bg-surface-elevated ${isRead ? '' : 'bg-primary/5'}`}>
      {selectionMode && (
        <div className="flex shrink-0 items-center self-stretch pl-4 sm:pl-5">
          <input
          type="checkbox"
          checked={selected}
          disabled={disabled}
            onChange={(event) => onSelect?.(notification.id, event.target.checked)}
            aria-label={`Select notification: ${notification.title}`}
            className="h-4 w-4 cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-wait disabled:opacity-60"
          />
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => onOpen?.(notification)}
        className="relative min-w-0 flex-1 px-3 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring disabled:cursor-wait sm:px-4"
      >
        {!isRead && <span className="absolute right-3 top-5 h-1.5 w-1.5 rounded-full bg-primary" aria-label="Unread" />}
        <p className="break-words pr-4 text-sm font-medium text-text-primary">{notification.title}</p>
        {notification.message && <p className="mt-1 break-words pr-3 text-xs leading-5 text-text-muted sm:text-sm sm:leading-6">{notification.message}</p>}
        <time dateTime={timestamp} className="mt-1.5 block break-words text-[10px] text-text-subtle sm:text-[11px]">{formattedTime}</time>
      </button>

      {onDelete && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(notification.id)}
          aria-label={`Delete notification: ${notification.title}`}
          title="Delete notification"
          className="mr-2 mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background hover:text-danger-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-wait disabled:opacity-50 sm:opacity-70 sm:group-hover:opacity-100 sm:focus:opacity-100"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${isDeleting ? 'animate-pulse' : ''}`} aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v5M14 11v5" />
          </svg>
        </button>
      )}
    </article>
  )
}
