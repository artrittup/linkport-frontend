import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { getNavigationForRole } from '../config/navigation'
import { useAuth } from '../context/AuthContext'
import AdminLayout from './AdminLayout'
import CandidateLayout from './CandidateLayout'
import CompanyLayout from './CompanyLayout'

export default function DashboardLayout({ children, title, userType }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useAuth()
  const navItems = getNavigationForRole(user?.role)

  if (user?.role === 'candidate') {
    return (
      <CandidateLayout title={title}>
        {children}
      </CandidateLayout>
    )
  }

  if (user?.role === 'company') {
    return (
      <CompanyLayout title={title}>
        {children}
      </CompanyLayout>
    )
  }

  if (user?.role === 'admin') {
    return (
      <AdminLayout title={title}>
        {children}
      </AdminLayout>
    )
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
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
