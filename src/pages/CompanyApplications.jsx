import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  acceptApplication,
  getCompanyApplications,
  rejectApplication,
} from '../api/applicationsApi'
import { acceptBid, getCompanyBids, rejectBid } from '../api/bidsApi'
import Button from '../components/Button'
import Card from '../components/Card'
import CompanyApplicationTabs from '../components/CompanyApplicationTabs'
import CompanyResponseCard from '../components/CompanyResponseCard'
import CompanyResponseReviewModal from '../components/CompanyResponseReviewModal'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  APPLICATION_FILTER_STATUSES,
  mapCompanyApplication,
  mapCompanyProposal,
  PROPOSAL_FILTER_STATUSES,
  responseMatchesSearch,
} from '../utils/companyResponse'

const initialSource = {
  items: [],
  loading: true,
  error: false,
  currentPage: 1,
  lastPage: 1,
  total: 0,
}
const controlClasses = 'w-full rounded-lg border border-[#233554] bg-[#112240] px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

export default function CompanyApplications() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedType = searchParams.get('type')
  const type = requestedType === 'proposals' ? 'proposals' : 'applications'
  const validStatuses = type === 'applications'
    ? APPLICATION_FILTER_STATUSES
    : PROPOSAL_FILTER_STATUSES
  const requestedStatus = searchParams.get('status')?.toLowerCase()
  const status = validStatuses.includes(requestedStatus) ? requestedStatus : 'all'
  const applicationStatus = type === 'applications' ? status : 'all'
  const proposalStatus = type === 'proposals' ? status : 'all'
  const [search, setSearch] = useState('')
  const [applicationPage, setApplicationPage] = useState(1)
  const [proposalPage, setProposalPage] = useState(1)
  const [applicationRefresh, setApplicationRefresh] = useState(0)
  const [proposalRefresh, setProposalRefresh] = useState(0)
  const [applications, setApplications] = useState(initialSource)
  const [proposals, setProposals] = useState(initialSource)
  const [selected, setSelected] = useState(null)
  const [reviewing, setReviewing] = useState('')

  useEffect(() => {
    let active = true
    getCompanyApplications({
      status: applicationStatus !== 'all' ? applicationStatus : undefined,
      page: applicationPage,
      per_page: 15,
    }).then((response) => {
      if (!active) return
      setApplications({
        items: response.data.map(mapCompanyApplication),
        loading: false,
        error: false,
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      })
    }).catch(() => {
      if (active) setApplications((current) => ({ ...current, items: [], loading: false, error: true }))
    })
    return () => { active = false }
  }, [applicationPage, applicationRefresh, applicationStatus])

  useEffect(() => {
    let active = true
    getCompanyBids({
      status: proposalStatus !== 'all' ? proposalStatus : undefined,
      page: proposalPage,
      per_page: 15,
    }).then((response) => {
      if (!active) return
      setProposals({
        items: response.data.map(mapCompanyProposal),
        loading: false,
        error: false,
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      })
    }).catch(() => {
      if (active) setProposals((current) => ({ ...current, items: [], loading: false, error: true }))
    })
    return () => { active = false }
  }, [proposalPage, proposalRefresh, proposalStatus])

  const activeSource = type === 'applications' ? applications : proposals
  const opportunityFilterKey = type === 'applications' ? 'job_id' : 'project_id'
  const opportunityId = searchParams.get(opportunityFilterKey)
  const query = search.trim().toLowerCase()
  const visibleResponses = useMemo(() => activeSource.items.filter((response) =>
    responseMatchesSearch(response, query)
    && (status === 'all' || response.statusValue === status)
    && (!opportunityId || String(response.opportunityId) === opportunityId),
  ), [activeSource.items, opportunityId, query, status])

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all') next.delete(key)
      else next.set(key, value)
    })
    setSearchParams(next)
  }

  const changeStatus = (nextStatus) => {
    if (type === 'applications') {
      setApplications((current) => ({ ...current, loading: true, error: false }))
      setApplicationPage(1)
    } else {
      setProposals((current) => ({ ...current, loading: true, error: false }))
      setProposalPage(1)
    }
    updateParams({ status: nextStatus })
  }

  const closeReview = useCallback(() => {
    if (!reviewing) setSelected(null)
  }, [reviewing])

  const reviewResponse = async (response, decision) => {
    if (response.statusValue !== 'pending' || reviewing) return
    setReviewing(decision)
    try {
      const request = response.type === 'application'
        ? decision === 'accept' ? acceptApplication : rejectApplication
        : decision === 'accept' ? acceptBid : rejectBid
      const result = await request(response.id)
      showToast(result.message ?? `${response.typeLabel} ${decision === 'accept' ? 'accepted' : 'rejected'} successfully.`, 'success')
      setSelected(null)
      if (response.type === 'application') {
        setApplications((current) => ({ ...current, loading: true, error: false }))
        setApplicationRefresh((current) => current + 1)
      } else {
        setProposals((current) => ({ ...current, loading: true, error: false }))
        setProposalRefresh((current) => current + 1)
      }
    } catch (error) {
      showToast(`Unable to ${decision} this ${response.type}. Please try again.`, 'error')
      if (error.response?.status === 409) {
        setSelected(null)
        if (response.type === 'application') {
          setApplications((current) => ({ ...current, loading: true, error: false }))
          setApplicationRefresh((current) => current + 1)
        } else {
          setProposals((current) => ({ ...current, loading: true, error: false }))
          setProposalRefresh((current) => current + 1)
        }
      }
    } finally {
      setReviewing('')
    }
  }

  const pendingApplications = applications.items.filter((item) => item.statusValue === 'pending').length
  const pendingProposals = proposals.items.filter((item) => item.statusValue === 'pending').length
  const summary = [
    { label: type === 'applications' && status !== 'all' ? 'Matching applications' : 'Applications', value: applications.loading || applications.error ? '—' : applications.total, path: '/company/applications?type=applications' },
    { label: type === 'proposals' && status !== 'all' ? 'Matching proposals' : 'Proposals', value: proposals.loading || proposals.error ? '—' : proposals.total, path: '/company/applications?type=proposals' },
    { label: 'Pending applications on page', value: applications.loading || applications.error ? '—' : pendingApplications, path: '/company/applications?type=applications&status=pending' },
    { label: 'Pending proposals on page', value: proposals.loading || proposals.error ? '—' : pendingProposals, path: '/company/applications?type=proposals&status=pending' },
  ]

  const clearLocalFilters = () => {
    setSearch('')
    setApplicationPage(1)
    setProposalPage(1)
    updateParams({ status: null, job_id: null, project_id: null })
  }

  return (
    <DashboardLayout title="Applications" userType="Company">
      <div className="min-w-0 space-y-7">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Response workspace</p>
          <h2 className="mt-2 text-3xl font-bold">Applications</h2>
          <p className="mt-2 max-w-2xl text-[#8892b0]">Review job applications and company project proposals in one place.</p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) => <Link key={item.label} to={item.path} onClick={() => {
            setApplicationPage(1)
            setProposalPage(1)
          }} className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]"><Card hover className="h-full"><p className="text-sm text-[#8892b0]">{item.label}</p><p className="mt-3 text-3xl font-bold">{item.value}</p></Card></Link>)}
        </section>

        <CompanyApplicationTabs />

        <section className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <div className="min-w-0">
            <label htmlFor="company-response-search" className="sr-only">Search responses</label>
            <input id="company-response-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={type === 'applications' ? 'Search members, jobs, or skills...' : 'Search members, projects, or proposals...'} className={controlClasses} />
          </div>
          <div>
            <label htmlFor="company-response-status" className="sr-only">Filter response status</label>
            <select id="company-response-status" value={status} onChange={(event) => changeStatus(event.target.value)} className={controlClasses}>
              <option value="all">All statuses</option>
              {validStatuses.map((value) => <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>)}
            </select>
          </div>
        </section>

        {opportunityId && <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#64ffda]/30 bg-[#64ffda]/10 px-4 py-3 text-sm"><span>Filtering by {type === 'applications' ? 'job' : 'project'} ID {opportunityId}</span><button type="button" onClick={() => updateParams({ [opportunityFilterKey]: null })} className="font-semibold text-[#64ffda]">Clear opportunity filter</button></div>}

        {type === 'applications' && applications.error && <p role="alert" className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">Applications could not be loaded right now. Proposals remain available.</p>}
        {type === 'proposals' && proposals.error && <p role="alert" className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">Proposals could not be loaded right now. Applications remain available.</p>}

        {activeSource.loading ? <LoadingSpinner label={`Loading ${type}...`} /> : !activeSource.error && visibleResponses.length > 0 ? (
          <section className="grid min-w-0 gap-5 lg:grid-cols-2">{visibleResponses.map((response) => <CompanyResponseCard key={response.key} response={response} onReview={setSelected} />)}</section>
        ) : !activeSource.error ? (
          <EmptyState
            title={search || opportunityId || status !== 'all' ? (status !== 'all' && !search && !opportunityId ? 'No responses have this status.' : 'No responses match your search.') : type === 'applications' ? 'No applications have been received yet.' : 'No project proposals have been received yet.'}
            description={search || opportunityId || status !== 'all' ? 'Clear the current filters to see other responses.' : `New ${type} will appear here.`}
            actionLabel={search || opportunityId || status !== 'all' ? 'Clear filters' : type === 'applications' ? 'View jobs' : 'View projects'}
            onAction={search || opportunityId || status !== 'all' ? clearLocalFilters : () => navigate(type === 'applications' ? '/company/jobs' : '/company/projects')}
          />
        ) : null}

        {!activeSource.loading && !activeSource.error && activeSource.lastPage > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="sm" disabled={activeSource.currentPage <= 1} onClick={() => {
              if (type === 'applications') {
                setApplications((current) => ({ ...current, loading: true, error: false }))
                setApplicationPage((page) => page - 1)
              } else {
                setProposals((current) => ({ ...current, loading: true, error: false }))
                setProposalPage((page) => page - 1)
              }
            }}>Previous</Button>
            <span className="text-sm text-[#8892b0]">Page {activeSource.currentPage} of {activeSource.lastPage}</span>
            <Button variant="outline" size="sm" disabled={activeSource.currentPage >= activeSource.lastPage} onClick={() => {
              if (type === 'applications') {
                setApplications((current) => ({ ...current, loading: true, error: false }))
                setApplicationPage((page) => page + 1)
              } else {
                setProposals((current) => ({ ...current, loading: true, error: false }))
                setProposalPage((page) => page + 1)
              }
            }}>Next</Button>
          </div>
        )}
      </div>

      <CompanyResponseReviewModal response={selected} reviewing={reviewing} onClose={closeReview} onDecision={reviewResponse} />
    </DashboardLayout>
  )
}
