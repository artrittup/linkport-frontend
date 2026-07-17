const sizes = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
}

export default function LoadingSpinner({ label = 'Loading...', size = 'md' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8" role="status">
      <span
        className={`animate-spin rounded-full border-[#233554] border-t-[#64ffda] ${sizes[size] ?? sizes.md}`}
        aria-hidden="true"
      />
      {label && <span className="text-sm text-[#8892b0]">{label}</span>}
    </div>
  )
}
