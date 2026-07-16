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
    ? 'hover:-translate-y-1 hover:border-[#64ffda]/50 hover:bg-[#172a45] hover:shadow-lg hover:shadow-black/20'
    : ''

  return (
    <div
      className={`rounded-lg border border-[#233554] bg-[#112240] text-[#e6f1ff] transition-all duration-200 ${paddingClass} ${hoverClass} ${className}`}
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
    <h3 className={`text-lg font-semibold text-[#e6f1ff] ${className}`}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm leading-relaxed text-[#8892b0] ${className}`}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '' }) {
  return <div className={`text-[#e6f1ff] ${className}`}>{children}</div>
}
