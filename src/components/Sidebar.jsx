import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ navItems = [], isOpen = false, onClose }) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const currentPath = window.location.pathname
  const mainItems = navItems.filter((item) => item.label.toLowerCase() !== 'logout')
  const logoutItem = navItems.find((item) => item.label.toLowerCase() === 'logout')

  const handleLogout = async () => {
    await logout()
    onClose?.()
    navigate('/login', { replace: true })
  }

  const renderItem = (item) => {
    const isActive = currentPath === item.href

    return (
      <a
        key={item.label}
        href={item.href}
        onClick={onClose}
        aria-current={isActive ? 'page' : undefined}
        className={`group flex items-center gap-3 rounded-md border-l-2 px-4 py-3 text-sm transition-colors ${
          isActive
            ? 'border-[#64ffda] bg-[#172a45] text-[#64ffda]'
            : 'border-transparent text-[#8892b0] hover:bg-[#172a45] hover:text-[#e6f1ff]'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            isActive ? 'bg-[#64ffda]' : 'bg-[#64748b] group-hover:bg-[#64ffda]'
          }`}
          aria-hidden="true"
        />
        {item.label}
      </a>
    )
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#233554] bg-[#112240] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-[#233554] px-6">
          <a href="/" className="text-xl font-bold tracking-tight text-[#e6f1ff]">
            Link<span className="text-[#64ffda]">Port</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-xl text-[#8892b0] transition-colors hover:bg-[#172a45] hover:text-[#64ffda] lg:hidden"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6" aria-label="Dashboard navigation">
          {mainItems.map(renderItem)}
        </nav>

        {logoutItem && (
          <div className="border-t border-[#233554] p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm text-[#ef4444] transition-colors hover:bg-[#ef4444]/10"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" aria-hidden="true" />
              {logoutItem.label}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
