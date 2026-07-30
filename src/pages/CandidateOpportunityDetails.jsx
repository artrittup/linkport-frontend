import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getJobById } from '../api/jobsApi'
import { getProjectById } from '../api/projectsApi'
import ActivityToastMessage from '../components/ActivityToastMessage'
import ApplyJobModal from '../components/ApplyJobModal'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import SendBidModal from '../components/SendBidModal'
import { jobToOpportunity, projectToOpportunity } from '../data/opportunityAdapters'
import useToast from '../hooks/useToast'
import CandidateLayout from '../layouts/CandidateLayout'

const typeClasses = {
  JOB: 'border-info/30 bg-info/10 text-info-text',
  INTERNSHIP: 'border-violet/30 bg-violet/10 text-violet-text',
  'COMPANY PROJECT': 'border-primary/30 bg-primary/10 text-primary',
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
        } else result = null

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
        <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface/65 p-8 text-center sm:p-10">
          <p className="font-mono text-sm text-primary">Member opportunities</p>
          <h2 className="mt-3 text-2xl font-bold text-text-primary">Opportunity not found</h2>
          <p className="mt-3 text-sm leading-6 text-text-muted">
            This opportunity does not exist or is no longer available.
          </p>
          <Link to="/member/opportunities" className="mt-6 inline-flex rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">
            Back to opportunities
          </Link>
        </section>
      </CandidateLayout>
    )
  }

  return (
    <CandidateLayout title={opportunity.title}>
      <Link to="/member/opportunities" className="text-sm font-medium text-primary hover:underline">
        ← Back to opportunities
      </Link>

      <article className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-2xl border border-border bg-surface/65 p-6 sm:p-8">
          <span className={`inline-flex rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-wide ${typeClasses[opportunity.type]}`}>
            {opportunity.type}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-text-primary">{opportunity.title}</h2>
          <p className="mt-2 text-lg font-medium text-primary">{opportunity.company}</p>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">About the opportunity</h3>
            <p className="mt-3 whitespace-pre-line leading-7 text-text-muted">{opportunity.fullDescription}</p>
          </section>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Required or preferred skills</h3>
            {opportunity.skills.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {opportunity.skills.map((skill) => (
                  <span key={skill} className="rounded-md border border-border bg-background/45 px-3 py-1.5 text-sm text-text-secondary">{skill}</span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-text-muted">No specific skills listed.</p>
            )}
          </section>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Eligibility and requirements</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-text-muted">{opportunity.eligibility}</p>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-surface/65 p-6">
          <dl className="space-y-5">
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-subtle">Location</dt>
              <dd className="mt-1 text-sm text-text-primary">{opportunity.location}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-subtle">Work style</dt>
              <dd className="mt-1 text-sm text-text-primary">{opportunity.workStyle}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-subtle">Deadline</dt>
              <dd className="mt-1 text-sm text-text-primary">{formatDeadline(opportunity.deadline)}</dd>
            </div>
          </dl>

          <Button className="mt-7 w-full" onClick={handlePrimaryAction}>
            {opportunity.actionLabel}
          </Button>
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
