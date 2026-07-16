export default function Topbar({ title, userType, onMenuClick }) {
  const initials = userType?.slice(0, 2).toUpperCase() || 'LP'

  return (
    <header className="sticky top-0 z-30 border-b border-[#233554] bg-[#0a192f]/90 backdrop-blur-md">
      <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-md text-[#64ffda] transition-colors hover:bg-[#172a45] lg:hidden"
          aria-label="Open navigation"
        >
          <span className="h-0.5 w-5 bg-current" />
          <span className="h-0.5 w-5 bg-current" />
          <span className="h-0.5 w-5 bg-current" />
        </button>

        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-[#e6f1ff] sm:text-xl">
          {title}
        </h1>

        <div className="hidden w-full max-w-xs sm:block">
          <label htmlFor="dashboard-search" className="sr-only">
            Search
          </label>
          <input
            id="dashboard-search"
            type="search"
            placeholder="Search..."
            className="w-full rounded-md border border-[#233554] bg-[#112240] px-4 py-2.5 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]"
          />
        </div>

        <div className="flex items-center gap-3 border-l border-[#233554] pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#64ffda]/40 bg-[#172a45] font-mono text-xs font-semibold text-[#64ffda]">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[#e6f1ff]">LinkPort User</p>
            <p className="text-xs text-[#8892b0]">{userType}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
