import { useMemo } from 'react'
import { Link } from 'react-router'
import CircleCard from './CircleCard'
import EmptyState from './EmptyState'
import MemberCard from './MemberCard'
import { useAuth } from '../context/AuthContext'
import { COMMUNITY_TOPICS, getPreferenceScore, normalizePreference } from '../data/communityTaxonomy'
import useCommunityConnections from '../hooks/useCommunityConnections'
import useCommunityMembers from '../hooks/useCommunityMembers'

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
  const { user } = useAuth()
  const query = normalizePreference(search)
  const membersState = useCommunityMembers({ search: search.trim(), perPage: 12 })
  const connections = useCommunityConnections()
  const profile = user?.candidate_profile ?? user?.candidateProfile ?? {}
  const preferences = useMemo(() => [
    ...(profile.interests ?? []),
    ...(profile.skills ?? []),
  ].map(normalizePreference).filter(Boolean), [profile.interests, profile.skills])
  const visibleTopics = useMemo(() => {
    const communitySignals = [
      ...membersState.members.flatMap((member) => [...member.interests, ...member.skills]),
      ...circles.flatMap((circle) => [circle.name, circle.category, ...circle.tags]),
    ]

    return COMMUNITY_TOPICS
      .filter((topic) => !query || [topic.name, topic.detail, ...topic.keywords]
        .some((value) => normalizePreference(value).includes(query)))
      .map((topic, index) => {
        const topicValues = [topic.name, ...topic.keywords]
        const preferenceScore = getPreferenceScore(topicValues, preferences)
        const trendScore = getPreferenceScore(communitySignals, topicValues)
        return {
          ...topic,
          index,
          score: (preferenceScore * 100) + trendScore,
        }
      })
      .sort((first, second) => second.score - first.score || first.index - second.index)
      .slice(0, 5)
  }, [circles, membersState.members, preferences, query])
  const suggestedMembers = useMemo(() => membersState.members
    .filter((member) => !member.isCurrentUser)
    .map((member, index) => ({
      ...member,
      recommendationIndex: index,
      recommendationScore: getPreferenceScore([
        ...member.skills,
        ...member.interests,
        member.fieldOfStudy,
        member.location,
      ], preferences),
    }))
    .sort((first, second) => second.recommendationScore - first.recommendationScore || first.recommendationIndex - second.recommendationIndex)
    .slice(0, 3), [membersState.members, preferences])
  const suggestedCircles = useMemo(() => circles
    .filter((circle) => !query || [
      circle.name,
      circle.tagline,
      circle.description,
      circle.category,
      circle.location,
      ...circle.tags,
    ].some((value) => normalizePreference(value).includes(query)))
    .map((circle) => ({
      ...circle,
      recommendationScore: getPreferenceScore([circle.name, circle.category, ...circle.tags], preferences),
    }))
    .sort((first, second) => second.recommendationScore - first.recommendationScore
      || Number(first.isJoined) - Number(second.isJoined)
      || second.memberCount - first.memberCount)
    .slice(0, 3), [circles, preferences, query])

  return (
    <div className="space-y-12">
      <section aria-labelledby="community-topics-heading">
        <SectionHeading
          id="community-topics-heading"
          eyebrow="Explore interests"
          title={preferences.length > 0 ? 'Topics picked for you' : 'Find something you enjoy'}
          description={preferences.length > 0
            ? 'Five suggestions ranked from your interests and skills, then by what is popular across the community.'
            : 'Five currently popular interests, based on what members and Circles are talking about.'}
          action={<Link to="/member/community/circles" className="text-sm font-semibold text-primary hover:underline">Browse all Circles</Link>}
        />
        <div className="mt-5 flex flex-wrap gap-2.5">
          {visibleTopics.map((topic) => (
            <Link
              key={topic.name}
              to={`/member/community/circles?category=${encodeURIComponent(topic.circleCategory)}`}
              title={topic.detail}
              className="rounded-full border border-border bg-surface/65 px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              {topic.name}
            </Link>
          ))}
          {visibleTopics.length === 0 && <p className="text-sm text-text-muted">No topics match this search.</p>}
        </div>
      </section>

      <section aria-labelledby="suggested-circles-heading">
        <SectionHeading
          id="suggested-circles-heading"
          eyebrow="Circles"
          title="Communities to explore"
          description="Small groups for hobbies, sports, culture, learning, careers, local life, and everything in between."
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

      <section aria-labelledby="suggested-people-heading">
        <SectionHeading
          id="suggested-people-heading"
          eyebrow="People"
          title="Members worth meeting"
          description="People are suggested from shared interests and skills, with space for every kind of background."
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
    </div>
  )
}
