import Card from '../components/Card'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/candidate/dashboard' },
  { label: 'My Profile', href: '/candidate/profile' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'My Applications', href: '/candidate/applications' },
  { label: 'Projects', href: '/projects' },
  { label: 'My Bids', href: '/candidate/bids' },
  { label: 'Settings', href: '/settings' },
  { label: 'Logout', href: '/login' },
]

const stats = [
  { label: 'Jobs Applied', value: '12' },
  { label: 'Active Applications', value: '5' },
  { label: 'Project Bids', value: '8' },
  { label: 'Accepted Offers', value: '2' },
]

export default function CandidateDashboard() {
  return (
    <DashboardLayout
      title="Candidate Dashboard"
      navItems={navItems}
      userType="Candidate"
    >
      <section>
        <p className="font-mono text-sm text-[#64ffda]">Welcome back</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Ready for your next opportunity?
        </h2>
        <p className="mt-3 max-w-2xl text-[#8892b0]">
          Track your applications, project bids, and recent activity from one place.
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
