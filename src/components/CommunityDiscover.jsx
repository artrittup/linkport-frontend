import { Link } from 'react-router'
import CircleCard from './CircleCard'
import EmptyState from './EmptyState'
import MemberCard from './MemberCard'
import useCommunityConnections from '../hooks/useCommunityConnections'
import useCommunityMembers from '../hooks/useCommunityMembers'

const topics = [
  { name: 'AI', detail: 'Models, data, and applied ideas' },
  { name: 'Design', detail: 'Product, UI, UX, and research' },
  { name: 'Startups', detail: 'Early ideas and new teams' },
  { name: 'Robotics', detail: 'Hardware, control, and automation' },
  { name: 'Web Development', detail: 'Frontend, backend, and the web' },
  { name: 'C++', detail: 'Systems, performance, and tooling' },
  { name: 'Student Projects', detail: 'Learn by building together' },
]

function SectionHeading({ id, eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.13em] text-primary">{eyebrow}</p>
        <h3 id={id} className="mt-1 text-2xl font-bold tracking-tight text-text-primary">{title}</h3>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export default function CommunityDiscover({
  circles,
  circlesLoading,
  circlesError,
  onJoinCircle,
  onOpenCircle,
  onRetryCircles,
  search = '',
}) {
  const query = search.trim().toLowerCase()
  const membersState = useCommunityMembers({ search: search.trim(), perPage: 12 })
  const connections = useCommunityConnections()
  const visibleTopics = topics.filter((topic) => !query || [topic.name, topic.detail].some((value) => value.toLowerCase().includes(query)))
  const suggestedMembers = membersState.members.filter((member) => !member.isCurrentUser).slice(0, 3)
  const suggestedCircles = circles.filter((circle) => !query || [
    circle.name,
    circle.tagline,
    circle.description,
    circle.category,
    circle.location,
    ...circle.tags,
  ].some((value) => String(value ?? '').toLowerCase().includes(query)))
    .sort((first, second) => Number(first.isJoined) - Number(second.isJoined) || second.memberCount - first.memberCount)
    .slice(0, 3)

  return (
    <div className="space-y-12">
      <section aria-labelledby="community-topics-heading">
        <SectionHeading
          id="community-topics-heading"
          eyebrow="Explore interests"
          title="Topics people are building around"
          description="Use these as starting points for finding people and Circles that match what you want to learn or create."
        />
        <div className="mt-5 flex flex-wrap gap-2.5">
          {visibleTopics.map((topic) => (
            <Link
              key={topic.name}
              to={`/member/community/members?search=${encodeURIComponent(topic.name)}`}
              title={topic.detail}
              className="rounded-full border border-border bg-surface/65 px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              {topic.name}
            </Link>
          ))}
          {visibleTopics.length === 0 && <p className="text-sm text-text-muted">No topics match this search.</p>}
        </div>
      </section>

      <section aria-labelledby="suggested-people-heading">
        <SectionHeading
          id="suggested-people-heading"
          eyebrow="People"
          title="Members worth meeting"
          description="Profiles with active interests, useful skills, or an openness to collaborate."
          action={<Link to="/member/community/members" className="text-sm font-semibold text-primary hover:underline">Browse all members</Link>}
        />
        {membersState.isLoading || connections.isLoading ? (
          <div className="mt-5 grid gap-4 md:grid-cols-3" aria-label="Loading suggested members">
            {[0, 1, 2].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl border border-border bg-surface/45" />)}
          </div>
        ) : membersState.error ? (
          <div className="mt-5"><EmptyState title="Member suggestions unavailable" description={membersState.error} actionLabel="Try again" onAction={membersState.retry} /></div>
        ) : suggestedMembers.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {suggestedMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                compact
                showConnection={!connections.error}
                initialConnectionStatus={connections.statuses.get(String(member.id)) ?? { status: 'none' }}
              />
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-xl border border-border bg-surface/50 p-5 text-sm text-text-muted">No members match this search yet.</p>
        )}
      </section>

      <section aria-labelledby="suggested-circles-heading">
        <SectionHeading
          id="suggested-circles-heading"
          eyebrow="Circles"
          title="Communities to explore"
          description="Small groups organized around shared fields, interests, and things people want to build."
          action={<Link to="/member/community/circles" className="text-sm font-semibold text-primary hover:underline">See all Circles</Link>}
        />
        {circlesLoading ? (
          <div className="mt-5 grid gap-4 md:grid-cols-3" aria-label="Loading suggested Circles">
            {[0, 1, 2].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl border border-border bg-surface/45" />)}
          </div>
        ) : circlesError ? (
          <div className="mt-5"><EmptyState title="Circle suggestions unavailable" description={circlesError} actionLabel="Try again" onAction={onRetryCircles} /></div>
        ) : suggestedCircles.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {suggestedCircles.map((circle) => (
              <CircleCard key={circle.id} circle={circle} onOpen={onOpenCircle} onJoin={onJoinCircle} />
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-xl border border-border bg-surface/50 p-5 text-sm text-text-muted">No Circles match this search yet.</p>
        )}
      </section>
    </div>
  )
}
