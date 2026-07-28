import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

const opportunityTypes = [
  {
    label: 'Post a job',
    description: 'Publish a role for candidates.',
    path: '/company/jobs/create',
  },
  {
    label: 'Post an internship',
    description: 'Dedicated internship publishing is coming later.',
  },
  {
    label: 'Post a company project',
    description: 'Publish a brief and receive proposals.',
    path: '/company/projects/create',
  },
  {
    label: 'Create a challenge',
    description: 'Company challenges are coming later.',
  },
]

export default function PostOpportunityMenu({ compact = false, onNavigate }) {
  const navigate = useNavigate()
  const menuId = useId()
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('mousedown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  const openSupportedType = (path) => {
    setIsOpen(false)
    onNavigate?.()
    navigate(path)
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
        className={`inline-flex max-w-full items-center justify-center rounded-lg bg-[#64ffda] font-semibold text-[#071426] transition-colors hover:bg-[#7dffe1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071426] ${
          compact ? 'h-10 px-3 text-xs' : 'w-full px-4 py-3 text-sm'
        }`}
      >
        {compact ? '+ Post' : '+ Post opportunity'}
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          className={`absolute z-[70] mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#233554] bg-[#112240] p-1.5 shadow-2xl shadow-black/40 ${
            compact ? 'right-0' : 'left-0'
          }`}
        >
          {opportunityTypes.map((type) => (
            type.path ? (
              <button
                key={type.label}
                type="button"
                role="menuitem"
                onClick={() => openSupportedType(type.path)}
                className="block w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#172a45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]"
              >
                <span className="block text-sm font-medium text-[#e6f1ff]">{type.label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-[#8892b0]">{type.description}</span>
              </button>
            ) : (
              <div key={type.label} className="rounded-lg px-3 py-2.5 opacity-65">
                <span className="block text-sm font-medium text-[#a8b2d1]">{type.label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-[#64748b]">{type.description}</span>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}
