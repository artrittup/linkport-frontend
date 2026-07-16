import Card from '../components/Card'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/company/dashboard' },
  { label: 'Company Profile', href: '/company/profile' },
  { label: 'Jobs', href: '/company/jobs' },
  { label: 'Applications', href: '/company/applications' },
  { label: 'Projects', href: '/company/projects' },
  { label: 'Bids', href: '/company/bids' },
  { label: 'Settings', href: '/settings' },
  { label: 'Logout', href: '/login' },
]

const stats = [
  { label: 'Active Jobs', value: '6' },
  { label: 'Applications Received', value: '34' },
  { label: 'Active Projects', value: '4' },
  { label: 'Project Bids', value: '19' },
]

export default function CompanyDashboard() {
  return (
    <DashboardLayout title="Company Dashboard" navItems={navItems} userType="Company">
      <section>
        <p className="font-mono text-sm text-[#64ffda]">Company workspace</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back to LinkPort.
        </h2>
        <p className="mt-3 max-w-2xl text-[#8892b0]">
          Review your hiring activity, live projects, and incoming talent offers.
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
