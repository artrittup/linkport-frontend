import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import LoadingSpinner from '../components/LoadingSpinner'
import ProtectedRoute from './ProtectedRoute'

const LandingPage = lazy(() => import('../pages/LandingPage'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const InfoPage = lazy(() => import('../pages/InfoPage'))
const Jobs = lazy(() => import('../pages/Jobs'))
const Projects = lazy(() => import('../pages/Projects'))
const MyApplications = lazy(() => import('../pages/MyApplications'))
const MyBids = lazy(() => import('../pages/MyBids'))
const CandidateProfile = lazy(() => import('../pages/CandidateProfile'))
const CandidateDashboard = lazy(() => import('../pages/CandidateDashboard'))
const Connections = lazy(() => import('../pages/Connections'))
const Circles = lazy(() => import('../pages/Circles'))
const CircleDetails = lazy(() => import('../pages/CircleDetails'))
const CompanyProfile = lazy(() => import('../pages/CompanyProfile'))
const CompanyDashboard = lazy(() => import('../pages/CompanyDashboard'))
const ManageJobs = lazy(() => import('../pages/ManageJobs'))
const ManageProjects = lazy(() => import('../pages/ManageProjects'))
const CompanyApplications = lazy(() => import('../pages/CompanyApplications'))
const CompanyBids = lazy(() => import('../pages/CompanyBids'))
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'))
const AdminUsers = lazy(() => import('../pages/AdminUsers'))
const AdminJobs = lazy(() => import('../pages/AdminJobs'))
const AdminProjects = lazy(() => import('../pages/AdminProjects'))
const MemberPublicProfile = lazy(() => import('../pages/MemberPublicProfile'))
const CompanyPublicProfile = lazy(() => import('../pages/CompanyPublicProfile'))
const Notifications = lazy(() => import('../pages/Notifications'))
const NotFound = lazy(() => import('../pages/NotFound'))

const candidateRoles = ['candidate']
const companyRoles = ['company']
const adminRoles = ['admin']
const authenticatedRoles = ['candidate', 'company', 'admin']

function RouteLoadingFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a192f] px-4 text-[#e6f1ff]">
      <div className="rounded-2xl border border-[#233554] bg-[#112240]/80 px-10 py-5 shadow-xl shadow-black/20">
        <LoadingSpinner label="Loading LinkPort..." />
      </div>
    </main>
  )
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
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
        <Route path="/candidate/applications" element={<ProtectedRoute allowedRoles={candidateRoles}><MyApplications /></ProtectedRoute>} />
        <Route path="/candidate/bids" element={<ProtectedRoute allowedRoles={candidateRoles}><MyBids /></ProtectedRoute>} />
        <Route path="/candidate/profile" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateProfile /></ProtectedRoute>} />
        <Route path="/connections" element={<ProtectedRoute allowedRoles={candidateRoles}><Connections /></ProtectedRoute>} />
        <Route path="/circles" element={<ProtectedRoute allowedRoles={candidateRoles}><Circles /></ProtectedRoute>} />
        <Route path="/circles/:id" element={<ProtectedRoute allowedRoles={candidateRoles}><CircleDetails /></ProtectedRoute>} />
        <Route path="/company/profile" element={<ProtectedRoute allowedRoles={companyRoles}><CompanyProfile /></ProtectedRoute>} />
        <Route path="/company/jobs" element={<ProtectedRoute allowedRoles={companyRoles}><ManageJobs /></ProtectedRoute>} />
        <Route path="/company/projects" element={<ProtectedRoute allowedRoles={companyRoles}><ManageProjects /></ProtectedRoute>} />
        <Route path="/company/applications" element={<ProtectedRoute allowedRoles={companyRoles}><CompanyApplications /></ProtectedRoute>} />
        <Route path="/company/bids" element={<ProtectedRoute allowedRoles={companyRoles}><CompanyBids /></ProtectedRoute>} />
        <Route path="/candidate/dashboard" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateDashboard /></ProtectedRoute>} />
        <Route path="/company/dashboard" element={<ProtectedRoute allowedRoles={companyRoles}><CompanyDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={adminRoles}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={adminRoles}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={adminRoles}><AdminJobs /></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute allowedRoles={adminRoles}><AdminProjects /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
