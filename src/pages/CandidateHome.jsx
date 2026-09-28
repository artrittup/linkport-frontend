import CommunityFeed from '../components/CommunityFeed'
import MemberHomeComposer from '../components/MemberHomeComposer'
import { useAuth } from '../context/AuthContext'
import CandidateLayout from '../layouts/CandidateLayout'

export default function CandidateHome() {
  const { user } = useAuth()
  const firstName = user?.name?.trim().split(/\s+/)[0]

  return (
    <CandidateLayout title="Home">
      <div className="mx-auto min-w-0 max-w-3xl">
        <header>
          <p className="font-mono text-sm text-primary">Your community</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">
            See what your community is doing and discover things you can join.
          </p>
        </header>

        <MemberHomeComposer memberName={user?.name} />

        <div className="mt-9 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-primary">Latest</p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">From your community</h3>
          </div>
          <p className="max-w-sm text-sm leading-6 text-text-muted">Posts, project ideas, collaboration requests, and opportunities picked for members.</p>
        </div>

        <CommunityFeed fullPageLoading contextLabel="Home" homeFeed />
      </div>
    </CandidateLayout>
  )
}
