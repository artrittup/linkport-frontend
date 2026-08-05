import { lazy, Suspense } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router'
import PageLoadingScreen, {
  FullPageLoadingScreen,
} from '../components/PageLoadingScreen'
import { getCandidateActivityPath } from '../config/candidateActivity'
import ProtectedRoute from './ProtectedRoute'

const LandingPage = lazy(() => import('../pages/LandingPage'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const InfoPage = lazy(() => import('../pages/InfoPage'))
const Jobs = lazy(() => import('../pages/Jobs'))
const Projects = lazy(() => import('../pages/Projects'))
const CandidateProfile = lazy(() => import('../pages/CandidateProfile'))
const CandidateActivity = lazy(() => import('../pages/CandidateActivity'))
const CandidateNotifications = lazy(() => import('../pages/CandidateNotifications'))
const CandidateHome = lazy(() => import('../pages/CandidateHome'))
const CandidateProjects = lazy(() => import('../pages/CandidateProjects'))
const CandidateProjectDetails = lazy(() => import('../pages/CandidateProjectDetails'))
const CandidateOpportunities = lazy(() => import('../pages/CandidateOpportunities'))
const CandidateOpportunityDetails = lazy(() => import('../pages/CandidateOpportunityDetails'))
const CandidateCreatePage = lazy(() => import('../pages/CandidateCreatePage'))
const Community = lazy(() => import('../pages/Community'))
const CandidateMembers = lazy(() => import('../pages/CandidateMembers'))
const CandidateMemberProfile = lazy(() => import('../pages/CandidateMemberProfile'))
const CandidateEvents = lazy(() => import('../pages/CandidateEvents'))
const CandidateEventDetails = lazy(() => import('../pages/CandidateEventDetails'))
const CandidateTeammateRequestDetails = lazy(() => import('../pages/CandidateTeammateRequestDetails'))
const Connections = lazy(() => import('../pages/Connections'))
const Circles = lazy(() => import('../pages/Circles'))
const CircleDetails = lazy(() => import('../pages/CircleDetails'))
const CompanyProfile = lazy(() => import('../pages/CompanyProfile'))
const CompanyOverview = lazy(() => import('../pages/CompanyOverview'))
const CompanyOpportunities = lazy(() => import('../pages/CompanyOpportunities'))
const CompanyTalent = lazy(() => import('../pages/CompanyTalent'))
const CompanyTalentProfile = lazy(() => import('../pages/CompanyTalentProfile'))
const ManageJobs = lazy(() => import('../pages/ManageJobs'))
const ManageProjects = lazy(() => import('../pages/ManageProjects'))
const CompanyApplications = lazy(() => import('../pages/CompanyApplications'))
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'))
const AdminUsers = lazy(() => import('../pages/AdminUsers'))
const AdminJobs = lazy(() => import('../pages/AdminJobs'))
const AdminProjects = lazy(() => import('../pages/AdminProjects'))
const AdminOpportunities = lazy(() => import('../pages/AdminOpportunities'))
const AdminCommunity = lazy(() => import('../pages/AdminCommunity'))
const MemberPublicProfile = lazy(() => import('../pages/MemberPublicProfile'))
const CompanyPublicProfile = lazy(() => import('../pages/CompanyPublicProfile'))
const Notifications = lazy(() => import('../pages/Notifications'))
const NotFound = lazy(() => import('../pages/NotFound'))

const candidateRoles = ['candidate']
const companyRoles = ['company']
const adminRoles = ['admin']
const authenticatedRoles = ['candidate', 'company', 'admin']

function RouteLoadingFallback() {
  return <FullPageLoadingScreen />
}

function LegacyCandidateRedirect() {
  const location = useLocation()
  const { '*': legacyPath = '' } = useParams()
  const memberPath = legacyPath ? `/member/${legacyPath}` : '/member/home'

  return (
    <Navigate
      to={`${memberPath}${location.search}${location.hash}`}
      replace
    />
  )
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <PageLoadingScreen />
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/:page" element={<InfoPage />} />
        <Route path="/members/:id" element={<ProtectedRoute allowedRoles={authenticatedRoles}><MemberPublicProfile /></ProtectedRoute>} />
        <Route path="/companies/:id" element={<ProtectedRoute allowedRoles={authenticatedRoles}><CompanyPublicProfile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute allowedRoles={authenticatedRoles}><Notifications /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute allowedRoles={candidateRoles}><Jobs /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute allowedRoles={candidateRoles}><Projects /></ProtectedRoute>} />
        <Route path="/member/applications" element={<ProtectedRoute allowedRoles={candidateRoles}><Navigate to={getCandidateActivityPath('applications')} replace /></ProtectedRoute>} />
        <Route path="/member/bids" element={<ProtectedRoute allowedRoles={candidateRoles}><Navigate to={getCandidateActivityPath('proposals')} replace /></ProtectedRoute>} />
        <Route path="/member/home" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateHome /></ProtectedRoute>} />
        <Route path="/member/saved-posts" element={<ProtectedRoute allowedRoles={candidateRoles}><Navigate to="/member/home?filter=saved" replace /></ProtectedRoute>} />
        <Route path="/member/projects" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateProjects /></ProtectedRoute>} />
        <Route path="/member/projects/:projectId" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateProjectDetails /></ProtectedRoute>} />
        <Route path="/member/opportunities" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateOpportunities /></ProtectedRoute>} />
        <Route path="/member/opportunities/:opportunityId" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateOpportunityDetails /></ProtectedRoute>} />
        <Route path="/member/create/project" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateCreatePage type="project" /></ProtectedRoute>} />
        <Route path="/member/create/post" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateCreatePage type="post" /></ProtectedRoute>} />
        <Route path="/member/create/team" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateCreatePage type="team" /></ProtectedRoute>} />
        <Route path="/member/community" element={<ProtectedRoute allowedRoles={candidateRoles}><Community /></ProtectedRoute>} />
        <Route path="/member/community/members" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateMembers /></ProtectedRoute>} />
        <Route path="/member/community/members/:memberId" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateMemberProfile /></ProtectedRoute>} />
        <Route path="/member/community/events" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateEvents /></ProtectedRoute>} />
        <Route path="/member/community/events/:eventId" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateEventDetails /></ProtectedRoute>} />
        <Route path="/member/community/team-requests/:requestId" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateTeammateRequestDetails /></ProtectedRoute>} />
        <Route path="/member/profile" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateProfile /></ProtectedRoute>} />
        <Route path="/member/activity" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateActivity /></ProtectedRoute>} />
        <Route path="/member/notifications" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateNotifications /></ProtectedRoute>} />
        <Route path="/connections" element={<ProtectedRoute allowedRoles={candidateRoles}><Connections /></ProtectedRoute>} />
        <Route path="/circles" element={<ProtectedRoute allowedRoles={candidateRoles}><Circles /></ProtectedRoute>} />
        <Route path="/circles/:id" element={<ProtectedRoute allowedRoles={candidateRoles}><CircleDetails /></ProtectedRoute>} />
        <Route path="/company/profile" element={<ProtectedRoute allowedRoles={companyRoles}><CompanyProfile /></ProtectedRoute>} />
        <Route path="/company/overview" element={<ProtectedRoute allowedRoles={companyRoles}><CompanyOverview /></ProtectedRoute>} />
        <Route path="/company/opportunities" element={<ProtectedRoute allowedRoles={companyRoles}><CompanyOpportunities /></ProtectedRoute>} />
        <Route path="/company/talent" element={<ProtectedRoute allowedRoles={companyRoles}><CompanyTalent /></ProtectedRoute>} />
        <Route path="/company/talent/:candidateId" element={<ProtectedRoute allowedRoles={companyRoles}><CompanyTalentProfile /></ProtectedRoute>} />
        <Route path="/company/jobs" element={<ProtectedRoute allowedRoles={companyRoles}><ManageJobs /></ProtectedRoute>} />
        <Route path="/company/jobs/create" element={<ProtectedRoute allowedRoles={companyRoles}><ManageJobs key="create-job" initialCreate /></ProtectedRoute>} />
        <Route path="/company/projects" element={<ProtectedRoute allowedRoles={companyRoles}><ManageProjects /></ProtectedRoute>} />
        <Route path="/company/projects/create" element={<ProtectedRoute allowedRoles={companyRoles}><ManageProjects key="create-project" initialCreate /></ProtectedRoute>} />
        <Route path="/company/applications" element={<ProtectedRoute allowedRoles={companyRoles}><CompanyApplications /></ProtectedRoute>} />
        <Route path="/company/bids" element={<ProtectedRoute allowedRoles={companyRoles}><Navigate to="/company/applications?type=proposals" replace /></ProtectedRoute>} />
        <Route path="/member/dashboard" element={<ProtectedRoute allowedRoles={candidateRoles}><Navigate to="/member/home" replace /></ProtectedRoute>} />
        <Route path="/candidate/*" element={<LegacyCandidateRedirect />} />
        <Route path="/company/dashboard" element={<ProtectedRoute allowedRoles={companyRoles}><Navigate to="/company/overview" replace /></ProtectedRoute>} />
        <Route path="/admin/overview" element={<ProtectedRoute allowedRoles={adminRoles}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={adminRoles}><Navigate to="/admin/overview" replace /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={adminRoles}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/opportunities" element={<ProtectedRoute allowedRoles={adminRoles}><AdminOpportunities /></ProtectedRoute>} />
        <Route path="/admin/community" element={<ProtectedRoute allowedRoles={adminRoles}><AdminCommunity /></ProtectedRoute>} />
        <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={adminRoles}><AdminJobs /></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute allowedRoles={adminRoles}><AdminProjects /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
