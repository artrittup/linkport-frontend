const styles = {
  success: { border: 'border-[#22c55e]/40', accent: 'bg-[#22c55e]', label: 'Success' },
  error: { border: 'border-[#ef4444]/40', accent: 'bg-[#ef4444]', label: 'Error' },
  warning: { border: 'border-[#facc15]/40', accent: 'bg-[#facc15]', label: 'Warning' },
  info: { border: 'border-[#64ffda]/40', accent: 'bg-[#64ffda]', label: 'Info' },
}

export default function Toast({ message, type = 'info', onDismiss }) {
  const style = styles[type] ?? styles.info

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg border bg-[#112240] p-4 shadow-2xl shadow-black/30 ${style.border}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${style.accent}`} />
      <div className="flex items-start gap-3 pl-1">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#e6f1ff]">
            {style.label}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#8892b0]">{message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#8892b0] transition-colors hover:bg-[#172a45] hover:text-[#e6f1ff]"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}
