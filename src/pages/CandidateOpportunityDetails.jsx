import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getJobById } from '../api/jobsApi'
import { getProjectById } from '../api/projectsApi'
import ActivityToastMessage from '../components/ActivityToastMessage'
import ApplyJobModal from '../components/ApplyJobModal'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import SendBidModal from '../components/SendBidModal'
import { getMockOpportunity, OPPORTUNITY_TYPES } from '../data/mockOpportunities'
import { jobToOpportunity, projectToOpportunity } from '../data/opportunityAdapters'
import useToast from '../hooks/useToast'
import CandidateLayout from '../layouts/CandidateLayout'

const typeClasses = {
  JOB: 'border-[#60a5fa]/30 bg-[#60a5fa]/10 text-[#93c5fd]',
  INTERNSHIP: 'border-[#a78bfa]/30 bg-[#a78bfa]/10 text-[#c4b5fd]',
  'COMPANY PROJECT': 'border-[#64ffda]/30 bg-[#64ffda]/10 text-[#64ffda]',
  CHALLENGE: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#fde047]',
}

function formatDeadline(deadline) {
  if (!deadline) return 'No deadline'
  const date = new Date(deadline)
  return Number.isNaN(date.getTime())
    ? deadline
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(date)
}

export default function CandidateOpportunityDetails() {
  const { opportunityId } = useParams()
  const { showToast } = useToast()
  const [opportunity, setOpportunity] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [applicationJob, setApplicationJob] = useState(null)
  const [bidProject, setBidProject] = useState(null)

  useEffect(() => {
    let isActive = true

    async function loadOpportunity() {
      setIsLoading(true)
      setNotFound(false)

      try {
        let result
        if (opportunityId.startsWith('job-')) {
          const response = await getJobById(opportunityId.slice(4))
          result = jobToOpportunity(response.job)
        } else if (opportunityId.startsWith('project-')) {
          const response = await getProjectById(opportunityId.slice(8))
          result = projectToOpportunity(response.project)
        } else {
          result = getMockOpportunity(opportunityId)
        }

        if (!isActive) return
        if (result) setOpportunity(result)
        else setNotFound(true)
      } catch {
        if (isActive) setNotFound(true)
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadOpportunity()
    return () => {
      isActive = false
    }
  }, [opportunityId])

  const handlePrimaryAction = () => {
    if (opportunity.source === 'job') {
      setApplicationJob(opportunity.sourceData)
      return
    }
    if (opportunity.source === 'project') {
      setBidProject(opportunity.sourceData)
      return
    }

    const message = opportunity.type === OPPORTUNITY_TYPES.CHALLENGE
      ? 'Challenge submissions will be available in a future update.'
      : 'Applications for this preview internship are not open yet.'
    showToast(message, 'info')
  }

  if (isLoading) {
    return (
      <CandidateLayout title="Loading opportunity">
        <LoadingSpinner label="Loading opportunity..." size="lg" />
      </CandidateLayout>
    )
  }

  if (notFound || !opportunity) {
    return (
      <CandidateLayout title="Opportunity not found">
        <section className="mx-auto max-w-2xl rounded-2xl border border-[#233554] bg-[#112240]/65 p-8 text-center sm:p-10">
          <p className="font-mono text-sm text-[#64ffda]">Candidate opportunities</p>
          <h2 className="mt-3 text-2xl font-bold text-[#e6f1ff]">Opportunity not found</h2>
          <p className="mt-3 text-sm leading-6 text-[#8892b0]">
            This opportunity does not exist or is no longer available.
          </p>
          <Link to="/candidate/opportunities" className="mt-6 inline-flex rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] hover:bg-[#64ffda]/10">
            Back to opportunities
          </Link>
        </section>
      </CandidateLayout>
    )
  }

  return (
    <CandidateLayout title={opportunity.title}>
      <Link to="/candidate/opportunities" className="text-sm font-medium text-[#64ffda] hover:underline">
        ← Back to opportunities
      </Link>

      <article className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-2xl border border-[#233554] bg-[#112240]/65 p-6 sm:p-8">
          <span className={`inline-flex rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-wide ${typeClasses[opportunity.type]}`}>
            {opportunity.type}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#e6f1ff]">{opportunity.title}</h2>
          <p className="mt-2 text-lg font-medium text-[#64ffda]">{opportunity.company}</p>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#a8b2d1]">About the opportunity</h3>
            <p className="mt-3 whitespace-pre-line leading-7 text-[#8892b0]">{opportunity.fullDescription}</p>
          </section>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#a8b2d1]">Required or preferred skills</h3>
            {opportunity.skills.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {opportunity.skills.map((skill) => (
                  <span key={skill} className="rounded-md border border-[#233554] bg-[#0a192f]/45 px-3 py-1.5 text-sm text-[#a8b2d1]">{skill}</span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#8892b0]">No specific skills listed.</p>
            )}
          </section>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#a8b2d1]">Eligibility and requirements</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#8892b0]">{opportunity.eligibility}</p>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-[#233554] bg-[#112240]/65 p-6">
          <dl className="space-y-5">
            <div>
              <dt className="text-xs uppercase tracking-wide text-[#64748b]">Location</dt>
              <dd className="mt-1 text-sm text-[#e6f1ff]">{opportunity.location}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[#64748b]">Work style</dt>
              <dd className="mt-1 text-sm text-[#e6f1ff]">{opportunity.workStyle}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[#64748b]">Deadline</dt>
              <dd className="mt-1 text-sm text-[#e6f1ff]">{formatDeadline(opportunity.deadline)}</dd>
            </div>
          </dl>

          <Button className="mt-7 w-full" onClick={handlePrimaryAction}>
            {opportunity.type === OPPORTUNITY_TYPES.CHALLENGE ? 'View challenge details' : opportunity.actionLabel}
          </Button>
          {opportunity.source === 'mock' && (
            <p className="mt-3 text-center text-xs text-[#64748b]">Preview only; no information will be sent.</p>
          )}
        </aside>
      </article>

      {applicationJob && (
        <ApplyJobModal
          job={applicationJob}
          onClose={() => setApplicationJob(null)}
          onSuccess={(response) => {
            setApplicationJob(null)
            showToast(<ActivityToastMessage message={response.message ?? 'Application submitted successfully.'} tab="applications" />, 'success', 6000)
          }}
        />
      )}

      {bidProject && (
        <SendBidModal
          project={bidProject}
          onClose={() => setBidProject(null)}
          onSuccess={(response) => {
            setBidProject(null)
            showToast(<ActivityToastMessage message={response.message ?? 'Proposal submitted successfully.'} tab="proposals" />, 'success', 6000)
          }}
        />
      )}
    </CandidateLayout>
  )
}
