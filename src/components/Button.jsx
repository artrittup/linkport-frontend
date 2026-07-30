const variants = {
  primary:
    'border border-primary bg-primary text-primary-contrast shadow-sm shadow-primary/10 hover:border-primary-hover hover:bg-primary-hover active:border-primary-active active:bg-primary-active',
  outline:
    'border border-primary bg-transparent text-primary hover:bg-primary/10',
  danger:
    'border border-danger bg-danger text-on-danger hover:border-danger/85 hover:bg-danger/85',
  ghost:
    'border border-transparent bg-transparent text-text-muted hover:bg-surface hover:text-text-primary',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
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
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </button>
  )
}
