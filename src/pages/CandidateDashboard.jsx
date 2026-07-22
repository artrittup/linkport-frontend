import { useEffect, useState } from 'react'
import { getDashboardSummary } from '../api/dashboardApi'
import { getJobs } from '../api/jobsApi'
import { getCandidateProfile } from '../api/profileApi'
import { getProjects } from '../api/projectsApi'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import JobCard from '../components/JobCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ProjectCard from '../components/ProjectCard'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../layouts/DashboardLayout'

function SectionHeading({ title, description }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#e6f1ff] sm:text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-[#8892b0]">{description}</p>
    </div>
  )
}

export default function CandidateDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [projects, setProjects] = useState([])
  const [jobsError, setJobsError] = useState('')
  const [projectsError, setProjectsError] = useState('')
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [summary, setSummary] = useState({})
  const [summaryError, setSummaryError] = useState('')
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  const count = (key) => {
    const value = Number(summary[key])
    return Number.isFinite(value) ? value : 0
  }

  const stats = [
    { label: 'Applications', value: count('applications_count') },
    { label: 'Pending Applications', value: count('pending_applications_count') },
    { label: 'Accepted Applications', value: count('accepted_applications_count') },
    { label: 'Project Bids', value: count('bids_count') },
    { label: 'Pending Bids', value: count('pending_bids_count') },
    { label: 'Accepted Bids', value: count('accepted_bids_count') },
  ]
  const profileChecklist = [
    {
      label: 'Profile information completed',
      complete: Boolean(profile?.headline && profile?.bio && profile?.location),
    },
    { label: 'Skills added', complete: Boolean(profile?.skills?.length) },
    { label: 'CV linked', complete: Boolean(profile?.cv_url) },
    {
      label: 'Portfolio or professional link added',
      complete: Boolean(profile?.website || profile?.github_url || profile?.linkedin_url),
    },
  ]
  const completedProfileSteps = profileChecklist.filter((item) => item.complete).length
  const profileCompletion = Math.round(
    (completedProfileSteps / profileChecklist.length) * 100,
  )

  useEffect(() => {
    let isActive = true

    getJobs({ per_page: 3 })
      .then((response) => {
        if (isActive) setJobs(response.data)
      })
      .catch((error) => {
        if (isActive) {
          setJobsError(
            error.response?.data?.message || 'Unable to load recommended jobs.',
          )
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingJobs(false)
      })

    getProjects({ per_page: 3 })
      .then((response) => {
        if (isActive) setProjects(response.data)
      })
      .catch((error) => {
        if (isActive) {
          setProjectsError(
            error.response?.data?.message || 'Unable to load open projects.',
          )
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingProjects(false)
      })

    getDashboardSummary()
      .then((response) => {
        if (isActive) setSummary(response ?? {})
      })
      .catch((error) => {
        if (isActive) {
          setSummaryError(
            error.response?.data?.message ||
              'Unable to load your dashboard summary.',
          )
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingSummary(false)
      })

    getCandidateProfile()
      .then((response) => {
        if (isActive) setProfile(response.profile ?? null)
      })
      .catch((error) => {
        if (isActive) {
          setProfileError(
            error.response?.data?.message || 'Unable to load profile completion.',
          )
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingProfile(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  return (
    <DashboardLayout
      title="Member Dashboard"
      userType="Member"
    >
      <div className="space-y-10">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Member workspace</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h2>
          <p className="mt-3 max-w-2xl text-[#8892b0]">
            Track your applications, discover jobs, and find project opportunities.
          </p>

          {isLoadingSummary ? (
            <LoadingSpinner label="Loading dashboard summary..." />
          ) : summaryError ? (
            <div className="mt-8">
              <EmptyState title="Unable to load summary" description={summaryError} />
            </div>
          ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
          )}
        </section>

        <section>
          <SectionHeading
            title="Recommended Jobs"
            description="Opportunities selected to match your profile and skills."
          />
          {isLoadingJobs ? (
            <LoadingSpinner label="Loading recommended jobs..." />
          ) : jobsError ? (
            <div className="mt-5"><EmptyState title="Unable to load jobs" description={jobsError} /></div>
          ) : jobs.length === 0 ? (
            <div className="mt-5"><EmptyState title="No open jobs" description="There are no public job opportunities right now." /></div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => <JobCard key={job.id} job={job} compact />)}
            </div>
          )}
        </section>

        <section>
          <SectionHeading
            title="Open Projects"
            description="Put your skills into practice and send an offer for real work."
          />
          {isLoadingProjects ? (
            <LoadingSpinner label="Loading open projects..." />
          ) : projectsError ? (
            <div className="mt-5"><EmptyState title="Unable to load projects" description={projectsError} /></div>
          ) : projects.length === 0 ? (
            <div className="mt-5"><EmptyState title="No open projects" description="There are no public projects right now." /></div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => <ProjectCard key={project.id} project={project} compact />)}
            </div>
          )}
        </section>

        <section>
          <SectionHeading
            title="Profile Completion"
            description="A complete profile helps companies discover and trust your work."
          />
          {isLoadingProfile ? (
            <LoadingSpinner label="Loading profile completion..." />
          ) : profileError ? (
            <div className="mt-5"><EmptyState title="Unable to load profile" description={profileError} /></div>
          ) : (
          <Card className="mt-5 max-w-3xl" padding="lg">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#e6f1ff]">Your profile is almost ready</p>
                <p className="mt-1 text-xs text-[#8892b0]">
                  Complete the remaining step to improve your visibility.
                </p>
              </div>
              <span className="font-mono text-2xl font-bold text-[#64ffda]">{profileCompletion}%</span>
            </div>

            <div
              className="mt-5 h-2 overflow-hidden rounded-full bg-[#0a192f]"
              role="progressbar"
              aria-label="Profile completion"
              aria-valuenow={profileCompletion}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div className="h-full rounded-full bg-[#64ffda]" style={{ width: `${profileCompletion}%` }} />
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
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
