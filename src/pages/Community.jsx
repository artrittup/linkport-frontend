import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import EventCard from '../components/EventCard'
import MemberCard from '../components/MemberCard'
import TeammateRequestCard from '../components/TeammateRequestCard'
import { communityInterests } from '../data/mockCommunity'
import { mockMembers } from '../data/mockMembers'
import { TEAMMATE_REQUEST_STATUSES } from '../data/teammateRequestMapper'
import useCommunityProjects from '../hooks/useCommunityProjects'
import useCommunityEvents from '../hooks/useCommunityEvents'
import useTeammateRequests from '../hooks/useTeammateRequests'
import CandidateLayout from '../layouts/CandidateLayout'

const discordUrl = 'https://discord.gg/8NemkkpJj'

export default function Community() {
  const {
    projects: teammateProjects,
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

  const visibleMembers = useMemo(() => {
    const directoryInterest = communityInterests
      .find((interest) => interest.name === selectedInterest)
      ?.directoryInterest

    return mockMembers
      .filter((member) => !directoryInterest || member.interests.includes(directoryInterest))
      .slice(0, 6)
  }, [selectedInterest])

  const overview = [
    { label: 'Active members', value: '240+' },
    { label: 'Upcoming events', value: eventsLoading ? '...' : eventsError ? '—' : eventsMeta.total },
    { label: 'Interest areas', value: communityInterests.length },
    { label: 'Projects seeking teammates', value: teammateProjects.length },
  ]

  return (
    <CandidateLayout title="Community">
      <div className="min-w-0 max-w-full">
        <section className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-sm text-[#64ffda]">Meet and build together</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-4xl">Community</h2>
            <p className="mt-4 max-w-2xl leading-7 text-[#8892b0]">
              Connect, learn, collaborate, and take part in activities with other LinkPort members.
            </p>
          </div>
          <a
            href={discordUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#64ffda] bg-[#64ffda] px-5 py-2.5 text-sm font-semibold text-[#071426] transition-colors hover:bg-[#7dffe1]"
          >
            Join Discord
          </a>
        </section>

        <section className="mt-10 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Community overview">
          {overview.map((item) => (
            <article key={item.label} className="min-w-0 rounded-xl border border-[#233554] bg-[#112240]/55 p-4">
              <p className="text-2xl font-bold text-[#e6f1ff]">{item.value}</p>
              <p className="mt-1 text-sm text-[#8892b0]">{item.label}</p>
            </article>
          ))}
        </section>

        <section id="collaboration" className="mt-12 min-w-0 scroll-mt-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold text-[#e6f1ff]">Collaboration requests</h3>
              <p className="mt-2 text-sm text-[#8892b0]">Recent member requests for project teammates.</p>
            </div>
            <Link to="/candidate/create/team" className="text-sm font-medium text-[#64ffda] hover:underline">Create a request</Link>
          </div>
          {requestsLoading ? (
            <p className="mt-5 rounded-xl border border-[#233554] bg-[#112240]/45 p-5 text-sm text-[#8892b0]">Loading collaboration requests...</p>
          ) : requestsError ? (
            <div className="mt-5 rounded-xl border border-[#233554] bg-[#112240]/45 p-5">
              <p className="text-sm text-[#8892b0]">Collaboration requests are temporarily unavailable. The rest of Community remains available.</p>
              <button type="button" onClick={retryRequests} className="mt-3 text-sm font-medium text-[#64ffda] hover:underline">Try again</button>
            </div>
          ) : collaborationRequests.length === 0 ? (
            <p className="mt-5 rounded-xl border border-[#233554] bg-[#112240]/45 p-5 text-sm text-[#8892b0]">
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
              <h3 className="text-2xl font-semibold text-[#e6f1ff]">Upcoming events</h3>
              <p className="mt-2 text-sm text-[#8892b0]">Meet, learn, and share useful feedback with the community.</p>
            </div>
            <Link to="/candidate/community/events" className="text-sm font-medium text-[#64ffda] hover:underline">View all events</Link>
          </div>
          {eventsLoading ? (
            <p className="mt-5 rounded-xl border border-[#233554] bg-[#112240]/45 p-5 text-sm text-[#8892b0]">Loading upcoming events...</p>
          ) : eventsError ? (
            <div className="mt-5 rounded-xl border border-[#233554] bg-[#112240]/45 p-5">
              <p className="text-sm text-[#8892b0]">Upcoming events are temporarily unavailable. The rest of Community remains available.</p>
              <button type="button" onClick={retryEvents} className="mt-3 text-sm font-medium text-[#64ffda] hover:underline">Try again</button>
            </div>
          ) : events.length === 0 ? (
            <p className="mt-5 rounded-xl border border-[#233554] bg-[#112240]/45 p-5 text-sm text-[#8892b0]">No upcoming events are published yet.</p>
          ) : (
            <div className="mt-5 grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </section>

        <section className="mt-12 min-w-0">
          <h3 className="text-2xl font-semibold text-[#e6f1ff]">Community interests</h3>
          <p className="mt-2 text-sm text-[#8892b0]">Select an area to preview members with similar interests.</p>
          <div className="mt-5 flex min-w-0 flex-wrap gap-3">
            {communityInterests.map((interest) => {
              const isSelected = selectedInterest === interest.name
              return (
                <button
                  key={interest.name}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedInterest(isSelected ? '' : interest.name)}
                  className={`max-w-full break-words rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    isSelected
                      ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]'
                      : 'border-[#233554] bg-[#112240]/55 text-[#a8b2d1] hover:border-[#64ffda]/40'
                  }`}
                >
                  <span className="font-medium">{interest.name}</span>
                  <span className="ml-2 text-xs text-[#64748b]">{interest.memberCount} members</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-12 min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold text-[#e6f1ff]">Member preview</h3>
              <p className="mt-2 text-sm text-[#8892b0]">
                {selectedInterest ? `Members interested in ${selectedInterest}.` : 'A few people building and learning on LinkPort.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {selectedInterest && (
                <button type="button" onClick={() => setSelectedInterest('')} className="text-sm text-[#a8b2d1] hover:text-[#64ffda] hover:underline">
                  Show all
                </button>
              )}
              <Link to="/candidate/community/members" className="text-sm font-medium text-[#64ffda] hover:underline">
                View all members
              </Link>
            </div>
          </div>
          <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleMembers.map((member) => <MemberCard key={member.id} member={member} />)}
          </div>
        </section>

        <section className="mt-12 min-w-0">
          <h3 className="text-2xl font-semibold text-[#e6f1ff]">Projects looking for teammates</h3>
          <p className="mt-2 text-sm text-[#8892b0]">Join a member project that needs your skills.</p>
          {projectsLoading ? (
            <p className="mt-5 rounded-xl border border-[#233554] bg-[#112240]/45 p-5 text-sm text-[#8892b0]">Loading projects looking for teammates...</p>
          ) : projectsError ? (
            <div className="mt-5 rounded-xl border border-[#233554] bg-[#112240]/45 p-5">
              <p className="text-sm text-[#8892b0]">Projects are temporarily unavailable. The rest of Community remains available.</p>
              <button type="button" onClick={retryProjects} className="mt-3 text-sm font-medium text-[#64ffda] hover:underline">Try again</button>
            </div>
          ) : teammateProjects.length === 0 ? (
            <p className="mt-5 rounded-xl border border-[#233554] bg-[#112240]/45 p-5 text-sm text-[#8892b0]">No community projects are currently looking for teammates.</p>
          ) : (
            <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {teammateProjects.map((project) => (
              <article key={project.id} className="flex min-w-0 flex-col rounded-2xl border border-[#233554] bg-[#112240]/65 p-5">
                <span className="font-mono text-[10px] font-semibold tracking-wide text-[#64ffda]">LOOKING FOR TEAM</span>
                <h4 className="mt-3 break-words text-lg font-semibold text-[#e6f1ff]">{project.title}</h4>
                <p className="mt-2 break-words text-sm leading-6 text-[#8892b0]">{project.description}</p>
                <p className="mt-4 text-xs text-[#a8b2d1]">{project.lookingForRoles.join(' · ')}</p>
                <div className="mt-auto pt-5">
                  <Link
                    to={`/candidate/projects/${project.id}`}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-[#64ffda] px-4 py-2 text-sm font-semibold text-[#64ffda] transition-colors hover:bg-[#64ffda]/10"
                  >
                    View project
                  </Link>
                </div>
              </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12 rounded-2xl border border-[#64ffda]/20 bg-[#64ffda]/5 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
          <div className="min-w-0">
            <h3 className="text-2xl font-semibold text-[#e6f1ff]">Continue the conversation on Discord</h3>
            <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-[#8892b0]">
              Use Discord for daily discussions, help and questions, finding collaborators, and online community events.
            </p>
          </div>
          <a
            href={discordUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex shrink-0 items-center justify-center rounded-lg border border-[#64ffda] bg-[#64ffda] px-5 py-2.5 text-sm font-semibold text-[#071426] hover:bg-[#7dffe1] sm:mt-0"
          >
            Join Discord
          </a>
        </section>
      </div>

    </CandidateLayout>
  )
}
