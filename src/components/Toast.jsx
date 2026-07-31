const styles = {
  success: { border: 'border-success/40', accent: 'bg-success', label: 'Success' },
  error: { border: 'border-danger/40', accent: 'bg-danger', label: 'Error' },
  warning: { border: 'border-warning/40', accent: 'bg-warning', label: 'Warning' },
  info: { border: 'border-info/40', accent: 'bg-info', label: 'Info' },
}

export default function Toast({ message, type = 'info', onDismiss }) {
  const style = styles[type] ?? styles.info

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg border bg-surface p-4 shadow-2xl shadow-black/30 ${style.border}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${style.accent}`} />
      <div className="flex items-start gap-3 pl-1">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-primary">
            {style.label}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-text-muted">{message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}
