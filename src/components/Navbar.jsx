import { useState } from 'react'
import Button from './Button'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Candidates', href: '#candidates' },
  { label: 'Companies', href: '#companies' },
  { label: 'Projects', href: '#projects' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#233554]/80 bg-[#0a192f]/85 backdrop-blur-md">
      <nav
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <a
          href="/"
          className="text-2xl font-bold tracking-tight text-[#e6f1ff] transition-opacity hover:opacity-80"
          aria-label="LinkPort home"
        >
          Link<span className="text-[#64ffda]">Port</span>
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          <div className="flex items-center gap-7">
            {navLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-sm text-[#8892b0] transition-colors hover:text-[#64ffda]"
              >
                <span className="mr-1 text-xs text-[#64ffda]">
                  {String(index + 1).padStart(2, '0')}.
                </span>
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => window.location.assign('/login')}
            >
              Login
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.assign('/register')}
            >
              Get Started
            </Button>
          </div>
        </div>

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-md text-[#64ffda] transition-colors hover:bg-[#64ffda]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda] lg:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
          <span className="flex w-6 flex-col gap-1.5" aria-hidden="true">
            <span
              className={`h-0.5 w-full bg-current transition-transform ${isOpen ? 'translate-y-2 rotate-45' : ''}`}
            />
            <span
              className={`h-0.5 w-full bg-current transition-opacity ${isOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`h-0.5 w-full bg-current transition-transform ${isOpen ? '-translate-y-2 -rotate-45' : ''}`}
            />
          </span>
        </button>
      </nav>

      {isOpen && (
        <div
          id="mobile-menu"
          className="border-t border-[#233554] bg-[#0a192f]/95 px-6 py-6 backdrop-blur-md lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-md px-3 py-3 font-mono text-sm text-[#8892b0] transition-colors hover:bg-[#64ffda]/5 hover:text-[#64ffda]"
              >
                <span className="mr-2 text-xs text-[#64ffda]">
                  {String(index + 1).padStart(2, '0')}.
                </span>
                {link.label}
              </a>
            ))}

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#233554] pt-5">
              <Button
                variant="ghost"
                className="border-[#233554] text-[#e6f1ff] hover:border-[#64ffda] hover:text-[#64ffda]"
                onClick={() => window.location.assign('/login')}
              >
                Login
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.assign('/register')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
