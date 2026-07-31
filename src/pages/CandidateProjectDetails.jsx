import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  getCommunityProject,
  getCommunityProjectErrorMessage,
  isCommunityProjectNotFound,
} from '../api/communityProjectsApi'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import {
  COMMUNITY_PROJECT_STATUSES,
  getCommunityProjectStatusLabel,
} from '../data/communityProjectMapper'
import useToast from '../hooks/useToast'
import CandidateLayout from '../layouts/CandidateLayout'

const statusClasses = {
  [COMMUNITY_PROJECT_STATUSES.LOOKING_FOR_TEAM]: 'border-primary/30 bg-primary/10 text-primary',
  [COMMUNITY_PROJECT_STATUSES.IN_PROGRESS]: 'border-warning/30 bg-warning/10 text-warning',
  [COMMUNITY_PROJECT_STATUSES.COMPLETED]: 'border-success/30 bg-success/10 text-success',
}

function MissingProject({ isNotFound, message }) {
  return (
    <CandidateLayout title={isNotFound ? 'Project not found' : 'Project unavailable'}>
      <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface/65 p-8 text-center sm:p-10">
        <p className="font-mono text-sm text-primary">Project showcase</p>
        <h2 className="mt-3 text-2xl font-bold text-text-primary">
          {isNotFound ? 'Project not found' : 'Unable to load this project'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          {isNotFound
            ? 'This project does not exist or is no longer available in the showcase.'
            : message}
        </p>
        <Link to="/member/projects" className="mt-6 inline-flex rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">
          Back to projects
        </Link>
      </section>
    </CandidateLayout>
  )
}

export default function CandidateProjectDetails() {
  const { projectId } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let isActive = true

    async function loadProject() {
      setIsLoading(true)
      setError('')
      setNotFound(false)

      try {
        const response = await getCommunityProject(projectId)
        if (isActive) setProject(response.data)
      } catch (requestError) {
        if (!isActive) return
        setProject(null)
        setNotFound(isCommunityProjectNotFound(requestError))
        setError(getCommunityProjectErrorMessage(requestError, 'This project is temporarily unavailable. Please try again.'))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadProject()
    return () => {
      isActive = false
    }
  }, [projectId])

  if (isLoading) {
    return (
      <CandidateLayout title="Project">
        <LoadingSpinner label="Loading project..." size="lg" />
      </CandidateLayout>
    )
  }

  if (!project) return <MissingProject isNotFound={notFound} message={error} />

  const lookingForTeam = project.status === COMMUNITY_PROJECT_STATUSES.LOOKING_FOR_TEAM
    || project.lookingForTeammates
  const isOwner = String(project.ownerId) === String(user?.id)

  const handleJoinRequest = () => {
    showToast('Join requests are not available yet. Your interest was not sent.', 'info')
  }

  return (
    <CandidateLayout title={project.title}>
      <Link to="/member/projects" className="text-sm font-medium text-primary hover:underline">
        ← Back to projects
      </Link>

      <article className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 rounded-2xl border border-border bg-surface/65 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-primary">Member project</p>
              <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-text-primary">{project.title}</h2>
              <p className="mt-3 break-words text-sm leading-6 text-text-muted">{project.shortDescription}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {isOwner && <span className="rounded-full border border-border-strong/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Your project</span>}
              <span className={`rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-wide ${statusClasses[project.status]}`}>
                {getCommunityProjectStatusLabel(project.status)}
              </span>
            </div>
          </div>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">About the project</h3>
            <p className="mt-3 whitespace-pre-line break-words leading-7 text-text-muted">{project.fullDescription}</p>
          </section>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Skills and technologies</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <span key={skill} className="max-w-full break-words rounded-md border border-border bg-background/45 px-3 py-1.5 text-sm text-text-secondary">{skill}</span>
              ))}
            </div>
          </section>

          {lookingForTeam && project.lookingForRoles.length > 0 && (
            <section className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Looking for</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                {project.lookingForRoles.map((role) => <li key={role} className="break-words">• {role}</li>)}
              </ul>
            </section>
          )}
        </div>

        <aside className="h-fit min-w-0 rounded-2xl border border-border bg-surface/65 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Created by</h3>
          <p className="mt-3 break-words font-semibold text-text-primary">{project.creator}</p>
          {project.creatorHeadline && <p className="mt-1 break-words text-sm text-text-muted">{project.creatorHeadline}</p>}
          {project.creatorLocation && <p className="mt-1 break-words text-xs text-text-subtle">{project.creatorLocation}</p>}

          {(project.repositoryUrl || project.liveUrl) && (
            <div className="mt-6 space-y-3 border-t border-border pt-5">
              {project.repositoryUrl && (
                <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">
                  View repository
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">
                  View live project
                </a>
              )}
            </div>
          )}

          {lookingForTeam && (
            <div className="mt-6">
              <Button className="w-full" onClick={handleJoinRequest}>Request to join</Button>
              <p className="mt-3 text-center text-xs text-text-subtle">This is a placeholder; no request will be sent.</p>
            </div>
          )}
        </aside>
      </article>
    </CandidateLayout>
  )
}
