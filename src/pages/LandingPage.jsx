import { useEffect, useState } from 'react'
import { getJobs } from '../api/jobsApi'
import { getProjects } from '../api/projectsApi'
import Button from '../components/Button'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const navigation = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'candidates', label: 'Candidates', icon: 'users' },
  { id: 'companies', label: 'Companies', icon: 'building' },
  { id: 'projects', label: 'Projects', icon: 'layers' },
  { id: 'jobs', label: 'Jobs', icon: 'briefcase' },
  { id: 'community', label: 'Community', icon: 'network' },
]

const candidateFeatures = [
  {
    icon: 'profile',
    title: 'Build your profile',
    description: 'Turn skills and experience into a profile companies can trust.',
  },
  {
    icon: 'send',
    title: 'Apply to jobs',
    description: 'Discover focused roles and keep every application organized.',
  },
  {
    icon: 'spark',
    title: 'Bid on projects',
    description: 'Win practical work, collaborate, and grow your portfolio.',
  },
]

const companyFeatures = [
  {
    icon: 'briefcase',
    title: 'Post jobs',
    description: 'Reach emerging professionals with clear, focused roles.',
  },
  {
    icon: 'layers',
    title: 'Launch projects',
    description: 'Publish real briefs and receive structured proposals.',
  },
  {
    icon: 'users',
    title: 'Review talent',
    description: 'Compare profiles, applications, and bids in one place.',
  },
]

function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5M9 21v-7h6v7" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    building: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M9 21v-3h6v3" /></>,
    layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    network: <><circle cx="12" cy="12" r="3" /><circle cx="5" cy="5" r="2" /><circle cx="19" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><path d="m7 7 3 3m4 0 3-3m-7 7-3 3m7-3 3 3" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></>,
    spark: <><path d="m12 3-1.4 4.2a5 5 0 0 1-3.2 3.2L3 12l4.4 1.6a5 5 0 0 1 3.2 3.2L12 21l1.4-4.2a5 5 0 0 1 3.2-3.2L21 12l-4.4-1.6a5 5 0 0 1-3.2-3.2L12 3Z" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></>,
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function scrollToSection(event, id) {
  event.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function DesktopSidebar({ activeSection, onSelect }) {
  const {
    user,
    isLoading,
    isAuthenticated,
    logout,
    getDashboardPath,
  } = useAuth()

  return (
    <aside className="fixed bottom-0 left-0 top-[88px] z-40 hidden w-20 border-r border-[#233554]/80 bg-[#071426]/95 backdrop-blur-lg lg:flex lg:flex-col">
      <nav className="flex flex-1 flex-col items-center gap-1 px-2 py-5" aria-label="Landing sections">
        {navigation.map((item) => {
          const active = activeSection === item.id

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => {
                onSelect(item.id)
                scrollToSection(event, item.id)
              }}
              className={`group flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-[10px] font-medium transition-all duration-200 ${
                active
                  ? 'bg-[#64ffda]/10 text-[#64ffda]'
                  : 'text-[#64748b] hover:bg-[#112240] hover:text-[#e6f1ff]'
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
            </a>
          )
        })}
      </nav>
      <div className="w-full border-t border-[#233554]/80 p-2">
        {isLoading ? (
          <div className="mx-auto my-3 h-8 w-8 animate-pulse rounded-full bg-[#112240]" />
        ) : isAuthenticated ? (
          <div className="space-y-1">
            <a
              href={getDashboardPath(user?.role)}
              title={user?.name || 'Open dashboard'}
              className="flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-[9px] text-[#64ffda] transition-colors hover:bg-[#112240]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#64ffda]/40 bg-[#64ffda]/10 text-[9px] font-bold">
                {(user?.name || 'U').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
              </span>
              Account
            </a>
            <button
              type="button"
              onClick={logout}
              className="flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-[9px] text-[#ef4444] transition-colors hover:bg-[#ef4444]/10"
            >
              <Icon name="logout" className="h-4 w-4" />
              Logout
            </button>
          </div>
        ) : (
          <a
            href="/login"
            title="Not signed in"
            className="flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-center text-[9px] leading-tight text-[#64748b] transition-colors hover:bg-[#112240] hover:text-[#e6f1ff]"
          >
            <span className="relative">
              <Icon name="profile" className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#071426] bg-[#64748b]" />
            </span>
            Not signed in
          </a>
        )}
      </div>
    </aside>
  )
}

function MobileNavigation({ activeSection, onSelect }) {
  return (
    <nav
      className="sticky top-[88px] z-40 flex gap-2 overflow-x-auto border-b border-[#233554]/80 bg-[#071426]/95 px-4 py-3 backdrop-blur-lg lg:hidden"
      aria-label="Landing sections"
    >
      {navigation.map((item) => {
        const active = activeSection === item.id

        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(event) => {
              onSelect(item.id)
              scrollToSection(event, item.id)
            }}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
              active
                ? 'border-[#64ffda]/50 bg-[#64ffda]/10 text-[#64ffda]'
                : 'border-[#233554] bg-[#112240]/70 text-[#8892b0]'
            }`}
          >
            <Icon name={item.icon} className="h-4 w-4" />
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}

function SectionHeader({ label, title, description, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64ffda]">{label}</p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-[#8892b0]">{description}</p>
    </div>
  )
}

function FeatureCard({ feature }) {
  return (
    <article className="group rounded-2xl border border-[#233554] bg-[#112240]/65 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#64ffda]/35 hover:bg-[#112240]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#64ffda]/20 bg-[#64ffda]/10 text-[#64ffda]">
        <Icon name={feature.icon} />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-[#e6f1ff]">{feature.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#8892b0]">{feature.description}</p>
    </article>
  )
}

function OpportunityVisual({ job, project, isLoading }) {
  return (
    <div className="relative mx-auto w-full max-w-lg py-8 lg:py-0">
      <div className="absolute inset-8 rounded-full bg-[#64ffda]/10 blur-3xl" />
      <div className="relative rounded-3xl border border-[#233554] bg-[#071426]/90 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#64748b]">Opportunity feed</p>
            <p className="mt-1 text-sm font-semibold text-[#e6f1ff]">Matched for you</p>
          </div>
          <span className="rounded-full bg-[#64ffda]/10 px-3 py-1 text-xs font-medium text-[#64ffda]">
            {isLoading ? 'Loading' : 'Live'}
          </span>
        </div>

        <div className="space-y-3">
          <div className="translate-x-3 rounded-2xl border border-[#233554] bg-[#112240] p-4 shadow-lg sm:translate-x-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#64ffda]/10 text-[#64ffda]">
                  <Icon name="briefcase" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#e6f1ff]">{job?.title ?? 'No open jobs'}</p>
                  <p className="mt-1 text-xs text-[#8892b0]">
                    {job ? `${job.company} - ${job.location}` : 'New roles will appear here'}
                  </p>
                </div>
              </div>
              {job?.type && <span className="text-xs text-[#64ffda]">{job.type}</span>}
            </div>
          </div>

          <div className="-translate-x-2 rounded-2xl border border-[#233554] bg-[#112240] p-4 shadow-lg sm:-translate-x-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#64ffda]/10 text-[#64ffda]">
                  <Icon name="layers" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#e6f1ff]">{project?.title ?? 'No active projects'}</p>
                  <p className="mt-1 text-xs text-[#8892b0]">
                    {project ? `${project.company} - ${formatCurrency(project.budget)}` : 'New projects will appear here'}
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-[#233554] px-2 py-1 text-[10px] text-[#8892b0]">New</span>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-5 w-fit rounded-full border border-[#233554] bg-[#0a192f] px-4 py-2 text-xs text-[#8892b0]">
          Live opportunities from LinkPort
        </p>
      </div>
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <article className="group rounded-2xl border border-[#233554] bg-[#112240]/65 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#64ffda]/40 hover:shadow-xl hover:shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#64ffda]/10 px-3 py-1 text-xs font-medium text-[#64ffda]">{project.category || 'Project'}</span>
        <span className="text-xs text-[#64748b]">{project.company}</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-[#e6f1ff]">{project.title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.skills.map((tag) => <span key={tag} className="rounded-md border border-[#233554] px-2.5 py-1 text-xs text-[#8892b0]">{tag}</span>)}
      </div>
      <div className="mt-6 flex items-end justify-between border-t border-[#233554] pt-4">
        <div><p className="text-[10px] uppercase tracking-wide text-[#64748b]">Budget</p><p className="mt-1 font-semibold text-[#e6f1ff]">{formatCurrency(project.budget)}</p></div>
        <span className="text-[#64ffda] transition-transform group-hover:translate-x-1"><Icon name="arrow" /></span>
      </div>
    </article>
  )
}

function JobRow({ job }) {
  return (
    <article className="group flex flex-col gap-4 rounded-2xl border border-[#233554] bg-[#112240]/65 p-5 transition-all duration-200 hover:border-[#64ffda]/35 hover:bg-[#112240] sm:flex-row sm:items-center">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#64ffda]/10 text-[#64ffda]"><Icon name="briefcase" /></div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-[#e6f1ff]">{job.title}</h3>
        <p className="mt-1 text-sm text-[#8892b0]">{job.company}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-[#233554] px-3 py-1.5 text-xs text-[#8892b0]">{job.location}</span>
        <span className="rounded-full border border-[#233554] px-3 py-1.5 text-xs text-[#8892b0]">{job.type}</span>
      </div>
      <span className="hidden text-[#64ffda] transition-transform group-hover:translate-x-1 sm:block"><Icon name="arrow" /></span>
    </article>
  )
}

function CommunityVisual() {
  const nodes = [
    ['Developers', 'left-3 top-8'],
    ['Designers', 'right-2 top-12'],
    ['Students', 'bottom-5 left-8'],
    ['Companies', 'bottom-8 right-5'],
  ]

  return (
    <div className="relative mx-auto h-72 max-w-lg overflow-hidden rounded-3xl border border-[#233554] bg-[#071426]/80">
      <div className="absolute inset-1/4 rounded-full bg-[#64ffda]/10 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[#64ffda]/40 bg-[#112240] text-[#64ffda] shadow-[0_0_40px_rgba(100,255,218,0.12)]">
        <Icon name="network" />
        <span className="mt-1 text-xs font-semibold">LinkPort</span>
      </div>
      <div className="absolute left-[23%] right-[23%] top-1/2 h-px bg-gradient-to-r from-transparent via-[#64ffda]/30 to-transparent" />
      <div className="absolute bottom-[24%] top-[24%] left-1/2 w-px bg-gradient-to-b from-transparent via-[#64ffda]/30 to-transparent" />
      {nodes.map(([label, position]) => (
        <span key={label} className={`absolute ${position} rounded-full border border-[#233554] bg-[#112240] px-3 py-2 text-xs text-[#8892b0]`}>
          {label}
        </span>
      ))}
    </div>
  )
}

const sectionClass = 'scroll-mt-40 py-20 sm:py-24 lg:scroll-mt-24'

const formatCurrency = (value) => {
  const amount = Number(value)
  return Number.isFinite(amount)
    ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(amount)
    : 'Budget not specified'
}

export default function LandingPage() {
  const { user, isLoading, isAuthenticated, getDashboardPath } = useAuth()
  const [activeSection, setActiveSection] = useState('home')
  const [jobs, setJobs] = useState([])
  const [projects, setProjects] = useState([])
  const [jobTotal, setJobTotal] = useState(null)
  const [projectTotal, setProjectTotal] = useState(null)
  const [jobsError, setJobsError] = useState('')
  const [projectsError, setProjectsError] = useState('')
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(true)
  const goToPrimaryAction = () => {
    if (isLoading) return
    window.location.assign(
      isAuthenticated ? getDashboardPath(user?.role) : '/register',
    )
  }
  const primaryActionLabel = isAuthenticated ? 'Open Dashboard' : 'Get Started'

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-20% 0px -60%', threshold: [0, 0.1, 0.25] },
    )

    navigation.forEach(({ id }) => {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let isActive = true

    async function loadOpportunities() {
      const [jobsResult, projectsResult] = await Promise.allSettled([
        getJobs({ per_page: 3 }),
        getProjects({ per_page: 3 }),
      ])

      if (!isActive) return

      if (jobsResult.status === 'fulfilled') {
        setJobs(jobsResult.value.data)
        setJobTotal(Number(jobsResult.value.total ?? jobsResult.value.data.length))
      } else {
        setJobsError(
          jobsResult.reason?.response?.data?.message || 'Unable to load current jobs.',
        )
      }

      if (projectsResult.status === 'fulfilled') {
        setProjects(projectsResult.value.data)
        setProjectTotal(
          Number(projectsResult.value.total ?? projectsResult.value.data.length),
        )
      } else {
        setProjectsError(
          projectsResult.reason?.response?.data?.message ||
            'Unable to load current projects.',
        )
      }

      setIsLoadingOpportunities(false)
    }

    loadOpportunities()
    return () => {
      isActive = false
    }
  }, [])

  const uniqueSkills = new Set([
    ...jobs.flatMap((job) => job.skills ?? []),
    ...projects.flatMap((project) => project.skills ?? []),
  ]).size
  const metrics = [
    { value: jobTotal ?? '—', label: 'Open roles' },
    { value: projectTotal ?? '—', label: 'Active projects' },
    {
      value:
        jobTotal !== null && projectTotal !== null
          ? jobTotal + projectTotal
          : '—',
      label: 'Live opportunities',
    },
    { value: isLoadingOpportunities ? '—' : uniqueSkills, label: 'Skills requested' },
  ]

  return (
    <main className="min-h-screen bg-[#0a192f] text-[#e6f1ff]">
      <Navbar />
      <DesktopSidebar activeSection={activeSection} onSelect={setActiveSection} />

      <div className="pt-22 lg:pl-20">
        <MobileNavigation activeSection={activeSection} onSelect={setActiveSection} />

        <section id="home" className="scroll-mt-40 overflow-hidden border-b border-[#233554]/70 lg:scroll-mt-24">
          <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#64ffda]/20 bg-[#64ffda]/5 px-3 py-1.5 text-xs font-medium text-[#64ffda]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#64ffda] shadow-[0_0_10px_#64ffda]" />
                The professional launchpad for emerging talent
              </div>
              <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-[#e6f1ff] sm:text-6xl xl:text-7xl">
                Where talent meets <span className="text-[#64ffda]">opportunity.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#8892b0]">
                Build your future through meaningful jobs, real projects, and connections that move your career forward.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" disabled={isLoading} onClick={goToPrimaryAction}>
                  {isLoading ? 'Checking account...' : primaryActionLabel}
                </Button>
                <a
                  href="#projects"
                  onClick={(event) => scrollToSection(event, 'projects')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm font-semibold text-[#e6f1ff] transition-colors hover:text-[#64ffda]"
                >
                  Explore Opportunities <Icon name="arrow" className="h-4 w-4" />
                </a>
              </div>
            </div>
            <OpportunityVisual
              job={jobs[0]}
              project={projects[0]}
              isLoading={isLoadingOpportunities}
            />
          </div>
        </section>

        <section aria-label="Platform snapshot" className="border-b border-[#233554]/70 bg-[#071426]/55">
          <div className="mx-auto grid max-w-7xl grid-cols-2 px-6 py-7 sm:grid-cols-4 lg:px-10">
            {metrics.map((metric, index) => (
              <div key={metric.label} className={`px-4 py-3 text-center ${index > 0 ? 'border-l border-[#233554]' : ''}`}>
                <p className="text-2xl font-bold text-[#e6f1ff] sm:text-3xl">{metric.value}</p>
                <p className="mt-1 text-xs text-[#8892b0] sm:text-sm">{metric.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="candidates" className={`${sectionClass} border-b border-[#233554]/70`}>
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <SectionHeader label="For candidates" title="Turn potential into proof." description="Create a profile that works for you, then move from discovery to real experience." />
            <div className="mt-10 grid gap-4 md:grid-cols-3">{candidateFeatures.map((feature) => <FeatureCard key={feature.title} feature={feature} />)}</div>
          </div>
        </section>

        <section id="companies" className={`${sectionClass} border-b border-[#233554]/70 bg-[#071426]/35`}>
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <SectionHeader label="For companies" title="Find the signal in emerging talent." description="Publish opportunities, review strong matches, and build the team or solution you need." />
            <div className="mt-10 grid gap-4 md:grid-cols-3">{companyFeatures.map((feature) => <FeatureCard key={feature.title} feature={feature} />)}</div>
          </div>
        </section>

        <section id="projects" className={`${sectionClass} border-b border-[#233554]/70`}>
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader label="Project marketplace" title="Build something real." description="Browse focused briefs, send a clear proposal, and turn your skills into delivered work." />
              <a href="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64ffda]">View projects <Icon name="arrow" className="h-4 w-4" /></a>
            </div>
            {projectsError ? (
              <p className="mt-10 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 p-4 text-sm text-[#fca5a5]">{projectsError}</p>
            ) : !isLoadingOpportunities && projects.length === 0 ? (
              <p className="mt-10 rounded-xl border border-[#233554] bg-[#112240]/60 p-6 text-sm text-[#8892b0]">There are no open projects right now.</p>
            ) : (
              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
            )}
          </div>
        </section>

        <section id="jobs" className={`${sectionClass} border-b border-[#233554]/70 bg-[#071426]/35`}>
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader label="Jobs board" title="Your next role could start here." description="Discover early-career openings from companies looking for fresh thinking and real potential." />
              <a href="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64ffda]">View jobs <Icon name="arrow" className="h-4 w-4" /></a>
            </div>
            {jobsError ? (
              <p className="mt-10 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 p-4 text-sm text-[#fca5a5]">{jobsError}</p>
            ) : !isLoadingOpportunities && jobs.length === 0 ? (
              <p className="mt-10 rounded-xl border border-[#233554] bg-[#112240]/60 p-6 text-sm text-[#8892b0]">There are no open jobs right now.</p>
            ) : (
              <div className="mt-10 grid gap-4">{jobs.map((job) => <JobRow key={job.id} job={job} />)}</div>
            )}
          </div>
        </section>

        <section id="community" className={sectionClass}>
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10">
            <div>
              <SectionHeader label="Community" title="Connections that compound." description="A growing network for learning, collaboration, shared resources, and the conversations that shape better careers." />
              <div className="mt-8 grid grid-cols-2 gap-3">
                {['Learn together', 'Meet collaborators', 'Share experience', 'Grow your network'].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl border border-[#233554] bg-[#112240]/55 p-3 text-sm text-[#e6f1ff]">
                    <span className="text-[#64ffda]"><Icon name="check" className="h-4 w-4" /></span>{item}
                  </div>
                ))}
              </div>
            </div>
            <CommunityVisual />
          </div>
        </section>

        <section className="px-6 pb-20 lg:px-10">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#64ffda]/20 bg-gradient-to-br from-[#112240] to-[#071426] px-6 py-12 text-center shadow-2xl shadow-black/20 sm:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64ffda]">Your next move</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold text-[#e6f1ff] sm:text-4xl">Start building your future on LinkPort.</h2>
            <Button size="lg" className="mt-8" disabled={isLoading} onClick={goToPrimaryAction}>
              {isLoading ? 'Checking account...' : isAuthenticated ? 'Open Dashboard' : 'Create your account'}
            </Button>
          </div>
        </section>

        <footer className="border-t border-[#233554] px-6 py-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[#8892b0]">&copy; 2026 LinkPort. All rights reserved.</p>
            <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer navigation">
              {['About Us', 'Terms of Service', 'Privacy Policy', 'Help & Support'].map((label) => (
                <a key={label} href="#home" onClick={(event) => scrollToSection(event, 'home')} className="text-[#8892b0] transition-colors hover:text-[#64ffda]">{label}</a>
              ))}
            </nav>
          </div>
        </footer>
      </div>
    </main>
  )
}
