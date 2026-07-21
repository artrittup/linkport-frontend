import { BrowserRouter, Route, Routes } from "react-router"

import LandingPage from "../pages/LandingPage"
import Login from "../pages/Login"
import Register from "../pages/Register"
import Jobs from "../pages/Jobs"
import Projects from "../pages/Projects"
import MyApplications from "../pages/MyApplications"
import MyBids from "../pages/MyBids"
import CandidateProfile from "../pages/CandidateProfile"
import CompanyProfile from "../pages/CompanyProfile"
import ManageJobs from "../pages/ManageJobs"
import ManageProjects from "../pages/ManageProjects"
import CompanyApplications from "../pages/CompanyApplications"
import CompanyBids from "../pages/CompanyBids"
import AdminUsers from "../pages/AdminUsers"
import AdminJobs from "../pages/AdminJobs"
import AdminProjects from "../pages/AdminProjects"
import CandidateDashboard from "../pages/CandidateDashboard"
import Circles from "../pages/Circles"
import CircleDetails from "../pages/CircleDetails"
import CompanyDashboard from "../pages/CompanyDashboard"
import AdminDashboard from "../pages/AdminDashboard"
import ProtectedRoute from "./ProtectedRoute"

const candidateRoles = ["candidate"]
const companyRoles = ["company"]
const adminRoles = ["admin"]

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<ProtectedRoute allowedRoles={candidateRoles}><Jobs /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute allowedRoles={candidateRoles}><Projects /></ProtectedRoute>} />
        <Route path="/candidate/applications" element={<ProtectedRoute allowedRoles={candidateRoles}><MyApplications /></ProtectedRoute>} />
        <Route path="/candidate/bids" element={<ProtectedRoute allowedRoles={candidateRoles}><MyBids /></ProtectedRoute>} />
        <Route path="/candidate/profile" element={<ProtectedRoute allowedRoles={candidateRoles}><CandidateProfile /></ProtectedRoute>} />
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
      </Routes>
    </BrowserRouter>
  )
}
