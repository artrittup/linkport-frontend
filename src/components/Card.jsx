const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
}) {
  const paddingClass = paddingClasses[padding] ?? paddingClasses.md
  const hoverClass = hover
    ? 'hover:-translate-y-1 hover:border-primary/50 hover:bg-surface-elevated hover:shadow-lg hover:shadow-black/20'
    : ''

  return (
    <div
      className={`rounded-lg border border-border bg-surface text-text-primary transition-all duration-200 ${paddingClass} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 space-y-1.5 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-text-primary ${className}`}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm leading-relaxed text-text-muted ${className}`}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '' }) {
  return <div className={`text-text-primary ${className}`}>{children}</div>
}
