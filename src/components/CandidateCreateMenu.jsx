import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

const createActions = [
  { label: 'Share a project', path: '/member/create/project' },
  { label: 'Create a post', path: '/member/create/post' },
  { label: 'Find teammates', path: '/member/create/team' },
]

export default function CandidateCreateMenu({ onActionComplete }) {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  const handleAction = (path) => {
    setIsOpen(false)
    onActionComplete?.()
    navigate(path)
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="inline-flex w-full items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        + Create
      </button>

      {isOpen && (
        <div role="menu" className="absolute bottom-full left-0 z-[70] mb-2 w-full min-w-52 rounded-xl border border-border bg-surface p-1.5 shadow-2xl shadow-black/40">
          {createActions.map((action) => (
            <button
              key={action.path}
              type="button"
              role="menuitem"
              onClick={() => handleAction(action.path)}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-text-primary transition-colors hover:bg-surface-elevated hover:text-primary focus:outline-none focus-visible:bg-surface-elevated focus-visible:text-primary"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
