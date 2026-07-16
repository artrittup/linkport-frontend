import Card from '../components/Card'
import mockAdminJobs from '../data/mockAdminJobs'
import mockAdminProjects from '../data/mockAdminProjects'
import mockAdminUsers from '../data/mockAdminUsers'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Users', href: '/admin/users' },
  { label: 'Candidates', href: '/admin/candidates' }, { label: 'Companies', href: '/admin/companies' },
  { label: 'Jobs', href: '/admin/jobs' }, { label: 'Projects', href: '/admin/projects' },
  { label: 'Reports', href: '/admin/reports' }, { label: 'Logout', href: '/login' },
]

function RecentList({ items, getTitle, getMeta, href }) {
  return <Card className="h-full"><div className="space-y-1">{items.slice(0, 4).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 border-b border-[#233554]/70 py-3 first:pt-0 last:border-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-medium text-[#e6f1ff]">{getTitle(item)}</p><p className="mt-1 truncate text-xs text-[#8892b0]">{getMeta(item)}</p></div><span className="shrink-0 font-mono text-[10px] text-[#64ffda]">{item.status}</span></div>)}</div><a href={href} className="mt-5 inline-block text-xs text-[#64ffda] hover:opacity-80">View all →</a></Card>
}

export default function AdminDashboard() {
  const stats = [
    ['Total Users', mockAdminUsers.length],
    ['Candidates', mockAdminUsers.filter((item) => item.role === 'Candidate').length],
    ['Companies', mockAdminUsers.filter((item) => item.role === 'Company').length],
    ['Jobs', mockAdminJobs.length], ['Projects', mockAdminProjects.length],
    ['Applications', 18], ['Bids', 12],
  ]
  return <DashboardLayout title="Admin Dashboard" navItems={navItems} userType="Admin"><div className="space-y-10"><section><p className="font-mono text-sm text-[#64ffda]">Platform overview</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Admin Dashboard</h2><p className="mt-3 text-[#8892b0]">Monitor users, companies, jobs, projects, applications, and bids.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-7">{stats.map(([label, value], index) => <Card key={label} hover><p className="text-sm text-[#8892b0]">{label}</p><div className="mt-3 flex items-end justify-between"><p className="text-3xl font-bold">{value}</p><span className="font-mono text-xs text-[#64ffda]">0{index + 1}</span></div></Card>)}</div></section><section><h2 className="mb-5 text-xl font-semibold sm:text-2xl">Recent Activity</h2><div className="grid gap-5 lg:grid-cols-3"><div><h3 className="mb-3 text-sm text-[#8892b0]">Recent Users</h3><RecentList items={mockAdminUsers} getTitle={(item) => item.name} getMeta={(item) => `${item.role} · ${item.createdDate}`} href="/admin/users" /></div><div><h3 className="mb-3 text-sm text-[#8892b0]">Recent Jobs</h3><RecentList items={mockAdminJobs} getTitle={(item) => item.title} getMeta={(item) => `${item.company} · ${item.createdDate}`} href="/admin/jobs" /></div><div><h3 className="mb-3 text-sm text-[#8892b0]">Recent Projects</h3><RecentList items={mockAdminProjects} getTitle={(item) => item.title} getMeta={(item) => `${item.company} · ${item.createdDate}`} href="/admin/projects" /></div></div></section></div></DashboardLayout>
}
