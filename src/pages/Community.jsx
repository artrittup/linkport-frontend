import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import Button from '../components/Button'
import Modal from '../components/Modal'
import {
  communityEvents,
  communityInterests,
  communityMembers,
} from '../data/mockCommunity'
import { mockProjects, PROJECT_STATUSES } from '../data/mockProjects'
import useToast from '../hooks/useToast'
import CandidateLayout from '../layouts/CandidateLayout'

const discordUrl = 'https://discord.gg/8NemkkpJj'

export default function Community() {
  const { showToast } = useToast()
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedInterest, setSelectedInterest] = useState('')
  const teammateProjects = mockProjects
    .filter((project) => project.status === PROJECT_STATUSES.LOOKING_FOR_TEAM)
    .slice(0, 3)

  const visibleMembers = useMemo(
    () => selectedInterest
      ? communityMembers.filter((member) => member.interests.includes(selectedInterest))
      : communityMembers,
    [selectedInterest],
  )

  const overview = [
    { label: 'Active members', value: '240+' },
    { label: 'Upcoming events', value: communityEvents.length },
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

        <section className="mt-12 min-w-0">
          <div>
            <h3 className="text-2xl font-semibold text-[#e6f1ff]">Upcoming events</h3>
            <p className="mt-2 text-sm text-[#8892b0]">Meet, learn, and share useful feedback with the community.</p>
          </div>
          <div className="mt-5 grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {communityEvents.map((event) => (
              <article key={event.id} className="flex min-w-0 flex-col rounded-2xl border border-[#233554] bg-[#112240]/65 p-5">
                <span className="w-fit rounded-full border border-[#64ffda]/25 bg-[#64ffda]/5 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide text-[#64ffda]">
                  {event.type}
                </span>
                <h4 className="mt-4 break-words text-lg font-semibold text-[#e6f1ff]">{event.title}</h4>
                <p className="mt-2 break-words text-sm leading-6 text-[#8892b0]">{event.description}</p>
                <div className="mt-5 space-y-1 border-t border-[#233554] pt-4 text-xs text-[#a8b2d1]">
                  <p>{event.date} · {event.time}</p>
                  <p>{event.location}</p>
                </div>
                <div className="mt-auto pt-5">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedEvent(event)}>
                    View event
                  </Button>
                </div>
              </article>
            ))}
          </div>
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
            {selectedInterest && (
              <button type="button" onClick={() => setSelectedInterest('')} className="text-sm text-[#64ffda] hover:underline">
                Show all members
              </button>
            )}
          </div>
          <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleMembers.map((member) => {
              const initials = member.name.split(' ').map((part) => part[0]).slice(0, 2).join('')
              return (
                <article key={member.id} className="flex min-w-0 flex-col rounded-2xl border border-[#233554] bg-[#112240]/65 p-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#64ffda]/30 bg-[#0a192f] font-mono text-xs font-semibold text-[#64ffda]">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate font-semibold text-[#e6f1ff]">{member.name}</h4>
                      <p className="mt-1 break-words text-sm text-[#a8b2d1]">{member.headline}</p>
                      <p className="mt-1 break-words text-xs text-[#64748b]">{member.organization}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex min-w-0 flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <span key={skill} className="max-w-full break-words rounded-md border border-[#233554] px-2.5 py-1 text-xs text-[#8892b0]">{skill}</span>
                    ))}
                  </div>
                  <div className="mt-auto pt-5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => showToast('Public profiles for preview members will be connected later.', 'info')}
                    >
                      View profile
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="mt-12 min-w-0">
          <h3 className="text-2xl font-semibold text-[#e6f1ff]">Projects looking for teammates</h3>
          <p className="mt-2 text-sm text-[#8892b0]">Join a member project that needs your skills.</p>
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

      <Modal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        eyebrow={selectedEvent?.type}
        title={selectedEvent?.title ?? 'Community event'}
        maxWidth="max-w-xl"
      >
        {selectedEvent && (
          <div>
            <dl className="grid gap-4 rounded-xl border border-[#233554] bg-[#0a192f]/45 p-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#64748b]">Date and time</dt>
                <dd className="mt-1 text-sm text-[#e6f1ff]">{selectedEvent.date} · {selectedEvent.time}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#64748b]">Location</dt>
                <dd className="mt-1 text-sm text-[#e6f1ff]">{selectedEvent.location}</dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-6 text-[#8892b0]">{selectedEvent.details}</p>
            <p className="mt-4 text-xs text-[#64748b]">Event registration will be shared through the LinkPort Discord community.</p>
          </div>
        )}
      </Modal>
    </CandidateLayout>
  )
}
