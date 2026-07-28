import { useEffect, useState } from 'react'
import { getCommunityEvents } from '../api/communityEventsApi'
import { getCommunityPosts } from '../api/communityPostsApi'
import { getCommunityProjects } from '../api/communityProjectsApi'
import { getTeammateRequests } from '../api/teammateRequestsApi'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import DashboardLayout from '../layouts/DashboardLayout'

const initialSource = { total: 0, loading: true, error: false }

const contentTypes = [
  {
    key: 'projects',
    title: 'Community Projects',
    description: 'Read access and backend-authorized deletion exist. Dedicated Admin review tools are not connected yet.',
  },
  {
    key: 'posts',
    title: 'Community Posts',
    description: 'Read access and backend-authorized deletion exist. Dedicated Admin review tools are not connected yet.',
  },
  {
    key: 'requests',
    title: 'Teammate Requests',
    description: 'Read access and backend-authorized deletion exist. Dedicated Admin review tools are not connected yet.',
  },
  {
    key: 'events',
    title: 'Community Events',
    description: 'The count covers published Events. Admin event management is supported by the backend, but an Admin workflow is not connected yet.',
    countLabel: 'published records',
  },
]

export default function AdminCommunity() {
  const [sources, setSources] = useState({
    projects: initialSource,
    posts: initialSource,
    requests: initialSource,
    events: initialSource,
  })

  useEffect(() => {
    let active = true
    const update = (key, next) => {
      if (active) setSources((current) => ({ ...current, [key]: next }))
    }
    const load = (key, request) => {
      request
        .then((response) => update(key, {
          total: Number(response.meta?.total ?? 0),
          loading: false,
          error: false,
        }))
        .catch(() => update(key, { total: 0, loading: false, error: true }))
    }

    load('projects', getCommunityProjects({ per_page: 1 }))
    load('posts', getCommunityPosts({ per_page: 1 }))
    load('requests', getTeammateRequests({ per_page: 1 }))
    load('events', getCommunityEvents({ per_page: 1, upcoming: false }))

    return () => {
      active = false
    }
  }, [])

  return (
    <DashboardLayout title="Community" userType="Admin">
      <div className="min-w-0 space-y-8">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Moderation foundation</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Community</h2>
          <p className="mt-3 max-w-2xl text-[#8892b0]">Review the community content currently visible to Admins and the moderation tools that still need a dedicated connection.</p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          {contentTypes.map((item) => {
            const source = sources[item.key]
            return (
              <Card key={item.key} className="min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#8892b0]">{item.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {source.loading ? (
                      <LoadingSpinner label="Loading..." size="sm" />
                    ) : source.error ? (
                      <span className="text-xs text-[#fca5a5]">Unavailable</span>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-[#e6f1ff]">{source.total}</p>
                        <p className="text-xs text-[#64748b]">{item.countLabel ?? 'records'}</p>
                      </>
                    )}
                  </div>
                </div>
                <p className="mt-5 border-t border-[#233554] pt-4 text-xs font-medium text-[#facc15]">
                  Moderation tools are not connected yet.
                </p>
              </Card>
            )
          })}
        </div>

        <Card>
          <h3 className="font-semibold">Current moderation scope</h3>
          <p className="mt-2 text-sm leading-6 text-[#8892b0]">This foundation does not add reports, approval queues, flags, bulk actions, or Candidate creation controls. Counts are loaded from existing authenticated list APIs and failures remain isolated to their content type.</p>
        </Card>
      </div>
    </DashboardLayout>
  )
}
