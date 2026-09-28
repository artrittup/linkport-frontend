import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { getCircleErrorMessage, requestToJoinCircle } from '../api/circlesApi'
import useCommunityCircles from '../hooks/useCommunityCircles'
import useCommunityConnections from '../hooks/useCommunityConnections'
import useCommunityMembers from '../hooks/useCommunityMembers'
import useToast from '../hooks/useToast'
import { useAuth } from '../context/AuthContext'
import Button from './Button'
import ConnectionButton from './ConnectionButton'

function getInitials(name) {
  return String(name ?? 'LP')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function recommendationScore(values, interests) {
  return values.reduce((score, value) => {
    const normalized = String(value ?? '').toLowerCase()
    return score + (interests.some((interest) => normalized.includes(interest) || interest.includes(normalized)) ? 1 : 0)
  }, 0)
}

function SuggestionPanel({ title, allPath, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm shadow-slate-200/40 dark:shadow-black/10">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3.5">
        <h3 className="text-sm font-bold text-text-primary">{title}</h3>
        <Link to={allPath} className="shrink-0 text-xs font-semibold text-primary no-underline hover:text-primary-hover hover:no-underline">See all</Link>
      </div>
      <div className="divide-y divide-border/70 px-4">{children}</div>
    </section>
  )
}

function LoadingRows() {
  return [0, 1, 2].map((row) => (
    <div key={row} className="flex animate-pulse items-center gap-3 py-4">
      <span className="h-9 w-9 shrink-0 rounded-full bg-surface-elevated" />
      <span className="h-3 flex-1 rounded bg-surface-elevated" />
    </div>
  ))
}

export default function HomeSuggestions() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { members, isLoading: membersLoading, error: membersError } = useCommunityMembers({ perPage: 8 })
  const connections = useCommunityConnections()
  const { circles, isLoading: circlesLoading, error: circlesError, retry: retryCircles } = useCommunityCircles()
  const [joiningId, setJoiningId] = useState(null)
  const [pendingCircleIds, setPendingCircleIds] = useState(() => new Set())
  const profile = user?.candidate_profile ?? user?.candidateProfile ?? {}
  const interests = useMemo(() => [
    ...(profile.skills ?? []),
    ...(profile.interests ?? []),
  ].map((value) => String(value).toLowerCase()).filter(Boolean), [profile.skills, profile.interests])

  const suggestedMembers = useMemo(() => members
    .filter((member) => {
      if (member.isCurrentUser) return false
      const connection = connections.statuses.get(String(member.id))
      return !connection || ['none', 'rejected'].includes(connection.status)
    })
    .toSorted((first, second) => recommendationScore([...second.skills, ...second.interests], interests) - recommendationScore([...first.skills, ...first.interests], interests))
    .slice(0, 3), [connections.statuses, interests, members])

  const suggestedCircles = useMemo(() => circles
    .filter((circle) => !circle.isJoined)
    .toSorted((first, second) => recommendationScore([second.name, second.category, ...(second.tags ?? [])], interests) - recommendationScore([first.name, first.category, ...(first.tags ?? [])], interests))
    .slice(0, 3), [circles, interests])

  const joinCircle = async (circle) => {
    if (joiningId || circle.isPending || pendingCircleIds.has(circle.id)) return
    setJoiningId(circle.id)
    try {
      await requestToJoinCircle(circle.id)
      setPendingCircleIds((current) => new Set(current).add(circle.id))
      showToast('Request sent to the Circle owner.', 'success')
      retryCircles()
    } catch (error) {
      showToast(getCircleErrorMessage(error, 'Unable to request membership.'), 'error')
    } finally {
      setJoiningId(null)
    }
  }

  return (
    <aside className="hidden self-start xl:sticky xl:top-6 xl:block" aria-label="Suggested connections and Circles">
      <div className="space-y-5">
        <SuggestionPanel title="People you may know" allPath="/member/community/members">
          {membersLoading || connections.isLoading ? <LoadingRows /> : membersError ? (
            <p className="py-4 text-xs leading-5 text-text-muted">Member suggestions are unavailable right now.</p>
          ) : suggestedMembers.length === 0 ? (
            <p className="py-4 text-xs leading-5 text-text-muted">You are already connected with the current suggestions.</p>
          ) : suggestedMembers.map((member) => {
            const initialStatus = connections.statuses.get(String(member.id)) ?? { status: 'none' }
            return (
              <div key={member.id} className="py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Link to={'/member/community/members/' + member.id} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 font-mono text-[11px] font-bold text-primary no-underline hover:no-underline">{member.initials}</Link>
                  <div className="min-w-0 flex-1">
                    <Link to={'/member/community/members/' + member.id} className="block truncate text-sm font-semibold text-text-primary no-underline hover:text-primary hover:no-underline">{member.name}</Link>
                    <p className="mt-0.5 truncate text-xs text-text-subtle">{member.skills.slice(0, 2).join(' · ') || member.fieldOfStudy || 'LinkPort member'}</p>
                  </div>
                  {!connections.error && <ConnectionButton key={member.id + '-' + initialStatus.status + '-' + (initialStatus.connection_id ?? 'none')} userId={member.id} initialStatus={initialStatus} />}
                </div>
              </div>
            )
          })}
        </SuggestionPanel>

        <SuggestionPanel title="Circles for you" allPath="/member/community/circles">
          {circlesLoading ? <LoadingRows /> : circlesError ? (
            <p className="py-4 text-xs leading-5 text-text-muted">Circle suggestions are unavailable right now.</p>
          ) : suggestedCircles.length === 0 ? (
            <p className="py-4 text-xs leading-5 text-text-muted">No new Circle suggestions right now.</p>
          ) : suggestedCircles.map((circle) => {
            const isPending = circle.isPending || pendingCircleIds.has(circle.id)
            return (
              <div key={circle.id} className="py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Link to={'/member/community/circles/' + circle.id} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 font-mono text-[10px] font-bold text-primary no-underline hover:no-underline">{getInitials(circle.name)}</Link>
                  <div className="min-w-0 flex-1">
                    <Link to={'/member/community/circles/' + circle.id} className="block truncate text-sm font-semibold text-text-primary no-underline hover:text-primary hover:no-underline">{circle.name}</Link>
                    <p className="mt-0.5 truncate text-xs text-text-subtle">{circle.category} · {circle.memberCount.toLocaleString()} members</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="outline" disabled={isPending || joiningId === circle.id} onClick={() => joinCircle(circle)}>{joiningId === circle.id ? 'Sending...' : isPending ? 'Pending' : 'Join'}</Button>
                </div>
              </div>
            )
          })}
        </SuggestionPanel>
      </div>
    </aside>
  )
}
