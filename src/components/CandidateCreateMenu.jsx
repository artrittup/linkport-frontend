import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import useToast from '../hooks/useToast'

const createActions = ['Share a project', 'Create a post', 'Find teammates']

export default function CandidateCreateMenu({ onActionComplete }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
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

  const handleAction = (label) => {
    setIsOpen(false)
    onActionComplete?.()

    if (label === 'Share a project') {
      navigate('/candidate/projects?share=true')
      return
    }

    showToast(`${label} will be available in the next community update.`, 'info')
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="inline-flex w-full items-center justify-center rounded-lg border border-[#64ffda] bg-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#071426] transition-colors hover:bg-[#7dffe1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]"
      >
        + Create
      </button>

      {isOpen && (
        <div role="menu" className="absolute bottom-full left-0 z-[70] mb-2 w-full min-w-52 rounded-xl border border-[#233554] bg-[#112240] p-1.5 shadow-2xl shadow-black/40">
          {createActions.map((label) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={() => handleAction(label)}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-[#e6f1ff] transition-colors hover:bg-[#172a45] hover:text-[#64ffda] focus:outline-none focus-visible:bg-[#172a45] focus-visible:text-[#64ffda]"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
