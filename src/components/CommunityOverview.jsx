import { Link } from 'react-router'
import CircleCard from './CircleCard'
import EmptyState from './EmptyState'
import useCommunityPosts from '../hooks/useCommunityPosts'
import useCommunityProjects from '../hooks/useCommunityProjects'
import { getCommunityPostCategoryLabel } from '../data/communityPostMapper'

function SectionHeader({ title, action, onAction }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button className="text-sm font-semibold text-primary hover:underline" onClick={onAction}>
        {action}
      </button>
    </div>
  )
}
export default function CommunityOverview({ circles, onViewChange, onPreview }) {
  const joined = circles.filter((circle) => circle.isJoined).slice(0, 4)
  const discover = circles.filter((circle) => !circle.isJoined).slice(0, 4)
  const discussions = useCommunityPosts({ perPage: 4, sort: 'active' })
  const ideas = useCommunityProjects({ perPage: 3, lookingForTeammates: true })
  return (
    <div className="grid min-w-0 gap-8 xl:grid-cols-2">
      <section className="min-w-0">
        <SectionHeader title="Your Circles" action="View all" onAction={() => onViewChange('my-circles')} />
        <div className="mt-4 grid gap-3">
          {joined.map((circle) => (
            <CircleCard key={circle.id} circle={circle} variant="compact" onOpen={onPreview} />
          ))}
          {!joined.length && (
            <EmptyState
              title="Find your people"
              description="Join a Circle around an interest or idea you care about."
              actionLabel="Discover Circles"
              onAction={() => onViewChange('discover')}
            />
          )}
        </div>
      </section>
      <section className="min-w-0">
        <SectionHeader
          title="Discover something new"
          action="Discover Circles"
          onAction={() => onViewChange('discover')}
        />
        <div className="mt-4 grid gap-3">
          {discover.map((circle) => (
            <CircleCard key={circle.id} circle={circle} variant="compact" onOpen={onPreview} />
          ))}
          {!discover.length && (
            <p className="rounded-xl border border-border p-5 text-sm text-text-muted">
              You’re all caught up. New public Circles will appear here.
            </p>
          )}
        </div>
      </section>
      <section className="min-w-0 xl:col-span-2">
        <SectionHeader
          title="Active discussions"
          action="Browse discussions"
          onAction={() => onViewChange('discussions')}
        />
        {discussions.isLoading ? (
          <p role="status" className="mt-4 text-text-muted">
            Loading discussions...
          </p>
        ) : discussions.error ? (
          <EmptyState
            title="Discussions unavailable"
            description={discussions.error}
            actionLabel="Try again"
            onAction={discussions.retry}
          />
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {discussions.posts.map((post) => (
              <Link
                key={post.id}
                to={`/member/community/discussions/${post.id}`}
                className="min-w-0 rounded-xl border border-border bg-surface/55 p-5 text-left hover:border-primary"
              >
                <span className="text-xs font-semibold text-primary">
                  {getCommunityPostCategoryLabel(post.category)}
                </span>
                <p className="mt-2 line-clamp-3 break-words text-sm leading-6">{post.content}</p>
                <p className="mt-3 text-xs text-text-muted">
                  {post.authorName} · {post.commentsCount} replies
                  {post.circleId ? ` · ${post.circleName}` : ''}
                </p>
              </Link>
            ))}
            {!discussions.posts.length && (
              <p className="text-sm text-text-muted">Start the community’s first discussion.</p>
            )}
          </div>
        )}
      </section>
      <section className="min-w-0 xl:col-span-2">
        <SectionHeader
          title="Ideas looking for people"
          action="Explore ideas"
          onAction={() => onViewChange('ideas')}
        />
        {ideas.isLoading ? (
          <p role="status" className="mt-4 text-text-muted">
            Loading ideas...
          </p>
        ) : ideas.error ? (
          <EmptyState
            title="Ideas unavailable"
            description={ideas.error}
            actionLabel="Try again"
            onAction={ideas.retry}
          />
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {ideas.projects.map((idea) => (
              <Link
                key={idea.id}
                to={`/member/projects/${idea.id}`}
                className="min-w-0 rounded-xl border border-border bg-surface/55 p-5 hover:border-primary"
              >
                <h3 className="break-words font-semibold">{idea.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-muted">{idea.description}</p>
                <p className="mt-3 text-xs text-primary">
                  {idea.lookingForRoles.join(', ') || 'Open to collaborators'}
                </p>
                <p className="mt-3 text-xs text-text-muted">By {idea.creator}</p>
              </Link>
            ))}
            {!ideas.projects.length && (
              <p className="text-sm text-text-muted">Share an idea to find your first collaborators.</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
