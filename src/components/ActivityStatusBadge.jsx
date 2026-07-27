const statusClasses = {
  Pending: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#fde047]',
  Accepted: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#86efac]',
  Rejected: 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#fca5a5]',
}

export default function ActivityStatusBadge({ status }) {
  const statusClass = statusClasses[status]
    ?? 'border-[#233554] bg-[#0a192f]/70 text-[#8892b0]'

  return (
    <span className={`inline-flex max-w-full break-words rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
      {status || 'Unknown'}
    </span>
  )
}
