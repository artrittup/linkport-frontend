import { useEffect, useId } from 'react'
import Button from './Button'

export default function Modal({
  isOpen,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  maxWidth = 'max-w-2xl',
}) {
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`max-h-[calc(100vh-4rem)] w-full ${maxWidth} overflow-y-auto rounded-2xl border border-[#233554] bg-[#112240] shadow-2xl shadow-black/40`}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#233554] bg-[#112240] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {eyebrow && <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#64ffda]">{eyebrow}</p>}
            <h2 id={titleId} className={`${eyebrow ? 'mt-1.5' : ''} break-words text-xl font-bold text-[#e6f1ff] sm:text-2xl`}>{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close details" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-[#8892b0] transition-colors hover:bg-[#172a45] hover:text-[#64ffda]">&times;</button>
        </header>

        <div className="px-5 py-5 sm:px-6">{children}</div>

        <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-[#233554] bg-[#112240] px-5 py-4 sm:px-6">
          {footer}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </footer>
      </section>
    </div>
  )
}

export function DetailGrid({ items }) {
  return (
    <dl className="grid gap-4 rounded-xl border border-[#233554] bg-[#0a192f]/45 p-4 sm:grid-cols-2">
      {items.filter((item) => item.value !== undefined && item.value !== null && item.value !== '').map((item) => (
        <div key={item.label} className={item.fullWidth ? 'sm:col-span-2' : ''}>
          <dt className="text-[11px] uppercase tracking-wide text-[#64748b]">{item.label}</dt>
          <dd className="mt-1 break-words text-sm text-[#e6f1ff]">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function DetailSection({ label, children, fallback = 'Not provided.' }) {
  return (
    <section className="mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#64ffda]">{label}</h3>
      <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#8892b0]">{children || fallback}</div>
    </section>
  )
}

export function SkillList({ skills }) {
  const items = Array.isArray(skills) ? skills : []
  return (
    <DetailSection label="Skills" fallback="No skills listed.">
      {items.length > 0 && <div className="flex flex-wrap gap-2">{items.map((skill) => <span key={skill} className="rounded-full border border-[#64ffda]/20 bg-[#64ffda]/5 px-2.5 py-1 text-xs text-[#64ffda]">{skill}</span>)}</div>}
    </DetailSection>
  )
}
