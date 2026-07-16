import Button from '../components/Button'
import Card from '../components/Card'
import mockJobs from '../data/mockJobs'
import mockProjects from '../data/mockProjects'
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
  { label: 'Jobs Applied', value: '6' },
  { label: 'Active Applications', value: '3' },
  { label: 'Project Bids', value: '4' },
  { label: 'Accepted Offers', value: '1' },
]

const profileChecklist = [
  { label: 'Profile information completed', complete: true },
  { label: 'Skills added', complete: true },
  { label: 'CV uploaded', complete: true },
  { label: 'Portfolio missing', complete: false },
]

function SectionHeading({ title, description }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#e6f1ff] sm:text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-[#8892b0]">{description}</p>
    </div>
  )
}

function SkillBadges({ skills }) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill}
          className="rounded-full border border-[#233554] bg-[#0a192f]/70 px-2.5 py-1 font-mono text-[11px] text-[#64ffda]"
        >
          {skill}
        </span>
      ))}
    </div>
  )
}

export default function CandidateDashboard() {
  return (
    <DashboardLayout
      title="Candidate Dashboard"
      navItems={navItems}
      userType="Candidate"
    >
      <div className="space-y-10">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Candidate workspace</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, Candidate
          </h2>
          <p className="mt-3 max-w-2xl text-[#8892b0]">
            Track your applications, discover jobs, and find project opportunities.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={stat.label} hover>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#8892b0]">{stat.label}</p>
                    <p className="mt-3 text-3xl font-bold text-[#e6f1ff]">
                      {stat.value}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#64ffda]">
                    0{index + 1}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            title="Recommended Jobs"
            description="Opportunities selected to match your profile and skills."
          />
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {mockJobs.slice(0, 3).map((job) => (
              <Card key={job.id} hover className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold leading-snug text-[#e6f1ff]">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#64ffda]">{job.company}</p>
                  </div>
                  <span className="rounded-full bg-[#22c55e]/10 px-2 py-1 text-[10px] font-medium text-[#22c55e]">
                    {job.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[#233554] py-4 text-xs">
                  <div>
                    <p className="text-[#64748b]">Location</p>
                    <p className="mt-1 text-[#8892b0]">{job.location}</p>
                  </div>
                  <div>
                    <p className="text-[#64748b]">Type</p>
                    <p className="mt-1 text-[#8892b0]">{job.type}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <SkillBadges skills={job.skills} />
                </div>
                <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                  <div>
                    <p className="text-[11px] text-[#64748b]">Apply before</p>
                    <p className="mt-1 text-xs text-[#facc15]">{job.deadline}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            title="Open Projects"
            description="Put your skills into practice and send an offer for real work."
          />
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {mockProjects.slice(0, 3).map((project) => (
              <Card key={project.id} hover className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold leading-snug text-[#e6f1ff]">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#64ffda]">{project.company}</p>
                  </div>
                  <span className="rounded-full bg-[#22c55e]/10 px-2 py-1 text-[10px] font-medium text-[#22c55e]">
                    {project.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[#233554] py-4 text-xs">
                  <div>
                    <p className="text-[#64748b]">Budget</p>
                    <p className="mt-1 font-medium text-[#e6f1ff]">{project.budget}</p>
                  </div>
                  <div>
                    <p className="text-[#64748b]">Current bids</p>
                    <p className="mt-1 text-[#8892b0]">{project.bids} offers</p>
                  </div>
                </div>

                <div className="mt-4">
                  <SkillBadges skills={project.skills} />
                </div>
                <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                  <div>
                    <p className="text-[11px] text-[#64748b]">Deadline</p>
                    <p className="mt-1 text-xs text-[#facc15]">{project.deadline}</p>
                  </div>
                  <Button size="sm">Send Offer</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            title="Profile Completion"
            description="A complete profile helps companies discover and trust your work."
          />
          <Card className="mt-5 max-w-3xl" padding="lg">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#e6f1ff]">Your profile is almost ready</p>
                <p className="mt-1 text-xs text-[#8892b0]">
                  Complete the remaining step to improve your visibility.
                </p>
              </div>
              <span className="font-mono text-2xl font-bold text-[#64ffda]">70%</span>
            </div>

            <div
              className="mt-5 h-2 overflow-hidden rounded-full bg-[#0a192f]"
              role="progressbar"
              aria-label="Profile completion"
              aria-valuenow="70"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div className="h-full w-[70%] rounded-full bg-[#64ffda]" />
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {profileChecklist.map((item) => (
                <li key={item.label} className="flex items-center gap-3 text-sm">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                      item.complete
                        ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                        : 'border-[#ef4444] bg-[#ef4444]/10 text-[#ef4444]'
                    }`}
                    aria-hidden="true"
                  >
                    {item.complete ? '✓' : '!'}
                  </span>
                  <span className={item.complete ? 'text-[#8892b0]' : 'text-[#e6f1ff]'}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  )
}
