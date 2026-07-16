const variants = {
  primary:
    'border border-[#64ffda] bg-[#64ffda] text-[#0a192f] hover:bg-[#64ffda]/85 hover:border-[#64ffda]/85',
  outline:
    'border border-[#64ffda] bg-transparent text-[#64ffda] hover:bg-[#64ffda]/10',
  danger:
    'border border-[#ef4444] bg-[#ef4444] text-[#e6f1ff] hover:border-[#ef4444]/85 hover:bg-[#ef4444]/85',
  ghost:
    'border border-transparent bg-transparent text-[#8892b0] hover:bg-[#112240] hover:text-[#e6f1ff]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  onClick,
  disabled = false,
}) {
  const variantClasses = variants[variant] ?? variants.primary
  const sizeClasses = sizes[size] ?? sizes.md

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a192f] disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </button>
  )
}
