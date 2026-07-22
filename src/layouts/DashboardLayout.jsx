import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { getNavigationForRole } from '../config/navigation'
import { useAuth } from '../context/AuthContext'

export default function DashboardLayout({ children, title, userType }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useAuth()
  const navItems = getNavigationForRole(user?.role)

  return (
    <div className="min-h-screen bg-[#0a192f] text-[#e6f1ff]">
      <Sidebar
        navItems={navItems}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen lg:ml-20">
        <Topbar
          title={title}
          userType={userType}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
