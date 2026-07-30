import { useEffect, useId, useRef } from 'react'
import Button from './Button'

export default function Modal({
  isOpen,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  showCloseButton = true,
  maxWidth = 'max-w-2xl',
}) {
  const titleId = useId()
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement
    const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusTimer = window.setTimeout(() => {
      const firstFocusable = dialogRef.current?.querySelector(focusableSelector)
      if (firstFocusable) firstFocusable.focus()
      else dialogRef.current?.focus()
    }, 0)
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = [...dialogRef.current.querySelectorAll(focusableSelector)]
      if (focusable.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-overlay/70 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`max-h-[calc(100vh-4rem)] w-full ${maxWidth} overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl shadow-black/40`}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-surface px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {eyebrow && <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">{eyebrow}</p>}
            <h2 id={titleId} className={`${eyebrow ? 'mt-1.5' : ''} break-words text-xl font-bold text-text-primary sm:text-2xl`}>{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close details" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-text-muted transition-colors hover:bg-surface-elevated hover:text-primary">&times;</button>
        </header>

        <div className="px-5 py-5 sm:px-6">{children}</div>

        <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-border bg-surface px-5 py-4 sm:px-6">
          {footer}
          {showCloseButton && <Button variant="outline" onClick={onClose}>Close</Button>}
        </footer>
      </section>
    </div>
  )
}

export function DetailGrid({ items }) {
  return (
    <dl className="grid gap-4 rounded-xl border border-border bg-background/45 p-4 sm:grid-cols-2">
      {items.filter((item) => item.value !== undefined && item.value !== null && item.value !== '').map((item) => (
        <div key={item.label} className={item.fullWidth ? 'sm:col-span-2' : ''}>
          <dt className="text-[11px] uppercase tracking-wide text-text-subtle">{item.label}</dt>
          <dd className="mt-1 break-words text-sm text-text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function DetailSection({ label, children, fallback = 'Not provided.' }) {
  return (
    <section className="mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">{label}</h3>
      <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-muted">{children || fallback}</div>
    </section>
  )
}

export function SkillList({ skills }) {
  const items = Array.isArray(skills) ? skills : []
  return (
    <DetailSection label="Skills" fallback="No skills listed.">
      {items.length > 0 && <div className="flex flex-wrap gap-2">{items.map((skill) => <span key={skill} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-primary">{skill}</span>)}</div>}
    </DetailSection>
  )
}
