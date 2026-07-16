import Card from '../components/Card'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Candidates', href: '/admin/candidates' },
  { label: 'Companies', href: '/admin/companies' },
  { label: 'Jobs', href: '/admin/jobs' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'Reports', href: '/admin/reports' },
  { label: 'Logout', href: '/login' },
]

const stats = [
  { label: 'Total Users', value: '1,248' },
  { label: 'Candidates', value: '892' },
  { label: 'Companies', value: '156' },
  { label: 'Jobs', value: '203' },
]

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard" navItems={navItems} userType="Admin">
      <section>
        <p className="font-mono text-sm text-[#64ffda]">Platform overview</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, Admin.
        </h2>
        <p className="mt-3 max-w-2xl text-[#8892b0]">
          Monitor LinkPort users, companies, opportunities, and platform activity.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={stat.label} hover>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-[#8892b0]">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold text-[#e6f1ff]">{stat.value}</p>
                </div>
                <span className="font-mono text-xs text-[#64ffda]">0{index + 1}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </DashboardLayout>
  )
}
