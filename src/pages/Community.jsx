import { useState } from 'react'
import { Link } from 'react-router'
import EventCard from '../components/EventCard'
import MemberCard from '../components/MemberCard'
import TeammateRequestCard from '../components/TeammateRequestCard'
import { INTEREST_OPTIONS, getInterestLabel } from '../data/communityMemberMapper'
import { TEAMMATE_REQUEST_STATUSES } from '../data/teammateRequestMapper'
import useCommunityProjects from '../hooks/useCommunityProjects'
import useCommunityEvents from '../hooks/useCommunityEvents'
import useCommunityMembers from '../hooks/useCommunityMembers'
import useTeammateRequests from '../hooks/useTeammateRequests'
import CandidateLayout from '../layouts/CandidateLayout'

const discordUrl = 'https://discord.gg/8NemkkpJj'
const communityInterests = INTEREST_OPTIONS.filter((interest) => interest.value)

export default function Community() {
  const {
    projects: teammateProjects,
    meta: teammateProjectsMeta,
    isLoading: projectsLoading,
    error: projectsError,
    retry: retryProjects,
  } = useCommunityProjects({ lookingForTeammates: 'true', perPage: 3 })
  const {
    requests: collaborationRequests,
    isLoading: requestsLoading,
    error: requestsError,
    retry: retryRequests,
  } = useTeammateRequests({
    status: TEAMMATE_REQUEST_STATUSES.OPEN,
    perPage: 3,
  })
  const {
    events,
    meta: eventsMeta,
    isLoading: eventsLoading,
    error: eventsError,
    retry: retryEvents,
  } = useCommunityEvents({ perPage: 3 })
  const [selectedInterest, setSelectedInterest] = useState('')
  const {
    members: visibleMembers,
    meta: membersMeta,
    isLoading: membersLoading,
    error: membersError,
    retry: retryMembers,
  } = useCommunityMembers({ interest: selectedInterest, perPage: 6 })

  const overview = [
    { label: selectedInterest ? 'Matching members' : 'Active members', value: membersLoading ? '...' : membersError ? '—' : membersMeta.total },
    { label: 'Upcoming events', value: eventsLoading ? '...' : eventsError ? '—' : eventsMeta.total },
    { label: 'Interest areas', value: communityInterests.length },
    { label: 'Projects seeking teammates', value: projectsLoading ? '...' : projectsError ? '—' : teammateProjectsMeta.total },
  ]

  return (
    <CandidateLayout title="Community">
      <div className="min-w-0 max-w-full">
        <section className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-sm text-primary">Meet and build together</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Community</h2>
            <p className="mt-4 max-w-2xl leading-7 text-text-muted">
              Connect, learn, collaborate, and take part in activities with other LinkPort members.
            </p>
          </div>
          <a
            href={discordUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover"
          >
            Join Discord
          </a>
        </section>

        <section className="mt-10 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Community overview">
          {overview.map((item) => (
            <article key={item.label} className="min-w-0 rounded-xl border border-border bg-surface/55 p-4">
              <p className="text-2xl font-bold text-text-primary">{item.value}</p>
              <p className="mt-1 text-sm text-text-muted">{item.label}</p>
            </article>
          ))}
        </section>

        <section id="collaboration" className="mt-12 min-w-0 scroll-mt-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold text-text-primary">Collaboration requests</h3>
              <p className="mt-2 text-sm text-text-muted">Recent member requests for project teammates.</p>
            </div>
            <Link to="/member/create/team" className="text-sm font-medium text-primary hover:underline">Create a request</Link>
          </div>
          {requestsLoading ? (
            <p className="mt-5 rounded-xl border border-border bg-surface/45 p-5 text-sm text-text-muted">Loading collaboration requests...</p>
          ) : requestsError ? (
            <div className="mt-5 rounded-xl border border-border bg-surface/45 p-5">
              <p className="text-sm text-text-muted">Collaboration requests are temporarily unavailable. The rest of Community remains available.</p>
              <button type="button" onClick={retryRequests} className="mt-3 text-sm font-medium text-primary hover:underline">Try again</button>
            </div>
          ) : collaborationRequests.length === 0 ? (
            <p className="mt-5 rounded-xl border border-border bg-surface/45 p-5 text-sm text-text-muted">
              No open teammate requests are available yet.
            </p>
          ) : (
            <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {collaborationRequests.map((request) => <TeammateRequestCard key={request.id} request={request} />)}
            </div>
          )}
        </section>

        <section className="mt-12 min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold text-text-primary">Upcoming events</h3>
              <p className="mt-2 text-sm text-text-muted">Meet, learn, and share useful feedback with the community.</p>
            </div>
            <Link to="/member/community/events" className="text-sm font-medium text-primary hover:underline">View all events</Link>
          </div>
          {eventsLoading ? (
            <p className="mt-5 rounded-xl border border-border bg-surface/45 p-5 text-sm text-text-muted">Loading upcoming events...</p>
          ) : eventsError ? (
            <div className="mt-5 rounded-xl border border-border bg-surface/45 p-5">
              <p className="text-sm text-text-muted">Upcoming events are temporarily unavailable. The rest of Community remains available.</p>
              <button type="button" onClick={retryEvents} className="mt-3 text-sm font-medium text-primary hover:underline">Try again</button>
            </div>
          ) : events.length === 0 ? (
            <p className="mt-5 rounded-xl border border-border bg-surface/45 p-5 text-sm text-text-muted">No upcoming events are published yet.</p>
          ) : (
            <div className="mt-5 grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </section>

        <section className="mt-12 min-w-0">
          <h3 className="text-2xl font-semibold text-text-primary">Community interests</h3>
          <p className="mt-2 text-sm text-text-muted">Select an area to preview members with similar interests.</p>
          <div className="mt-5 flex min-w-0 flex-wrap gap-3">
            {communityInterests.map((interest) => {
              const isSelected = selectedInterest === interest.value
              return (
                <button
                  key={interest.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedInterest(isSelected ? '' : interest.value)}
                  className={`max-w-full break-words rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-surface/55 text-text-secondary hover:border-primary/40'
                  }`}
                >
                  <span className="font-medium">{interest.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-12 min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold text-text-primary">Member preview</h3>
              <p className="mt-2 text-sm text-text-muted">
                {selectedInterest ? `Members interested in ${getInterestLabel(selectedInterest)}.` : 'A few people building and learning on LinkPort.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {selectedInterest && (
                <button type="button" onClick={() => setSelectedInterest('')} className="text-sm text-text-secondary hover:text-primary hover:underline">
                  Show all
                </button>
              )}
              <Link to="/member/community/members" className="text-sm font-medium text-primary hover:underline">
                View all members
              </Link>
            </div>
          </div>
          {membersLoading ? (
            <p className="mt-5 rounded-xl border border-border bg-surface/45 p-5 text-sm text-text-muted">Loading community members...</p>
          ) : membersError ? (
            <div className="mt-5 rounded-xl border border-border bg-surface/45 p-5">
              <p className="text-sm text-text-muted">Member previews are temporarily unavailable. The rest of Community remains available.</p>
              <button type="button" onClick={retryMembers} className="mt-3 text-sm font-medium text-primary hover:underline">Try again</button>
            </div>
          ) : visibleMembers.length === 0 ? (
            <p className="mt-5 rounded-xl border border-border bg-surface/45 p-5 text-sm text-text-muted">No members are available for this interest yet.</p>
          ) : (
            <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleMembers.map((member) => <MemberCard key={member.id} member={member} />)}
            </div>
          )}
        </section>

        <section className="mt-12 min-w-0">
          <h3 className="text-2xl font-semibold text-text-primary">Projects looking for teammates</h3>
          <p className="mt-2 text-sm text-text-muted">Join a member project that needs your skills.</p>
          {projectsLoading ? (
            <p className="mt-5 rounded-xl border border-border bg-surface/45 p-5 text-sm text-text-muted">Loading projects looking for teammates...</p>
          ) : projectsError ? (
            <div className="mt-5 rounded-xl border border-border bg-surface/45 p-5">
              <p className="text-sm text-text-muted">Projects are temporarily unavailable. The rest of Community remains available.</p>
              <button type="button" onClick={retryProjects} className="mt-3 text-sm font-medium text-primary hover:underline">Try again</button>
            </div>
          ) : teammateProjects.length === 0 ? (
            <p className="mt-5 rounded-xl border border-border bg-surface/45 p-5 text-sm text-text-muted">No community projects are currently looking for teammates.</p>
          ) : (
            <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {teammateProjects.map((project) => (
              <article key={project.id} className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface/65 p-5">
                <span className="font-mono text-[10px] font-semibold tracking-wide text-primary">LOOKING FOR TEAM</span>
                <h4 className="mt-3 break-words text-lg font-semibold text-text-primary">{project.title}</h4>
                <p className="mt-2 break-words text-sm leading-6 text-text-muted">{project.description}</p>
                <p className="mt-4 text-xs text-text-secondary">{project.lookingForRoles.join(' · ')}</p>
                <div className="mt-auto pt-5">
                  <Link
                    to={`/member/projects/${project.id}`}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    View project
                  </Link>
                </div>
              </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
          <div className="min-w-0">
            <h3 className="text-2xl font-semibold text-text-primary">Continue the conversation on Discord</h3>
            <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-text-muted">
              Use Discord for daily discussions, help and questions, finding collaborators, and online community events.
            </p>
          </div>
          <a
            href={discordUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex shrink-0 items-center justify-center rounded-lg border border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-primary-contrast hover:bg-primary-hover sm:mt-0"
          >
            Join Discord
          </a>
        </section>
      </div>

    </CandidateLayout>
  )
}
