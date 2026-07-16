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
import CandidateDashboard from "../pages/CandidateDashboard"
import CompanyDashboard from "../pages/CompanyDashboard"
import AdminDashboard from "../pages/AdminDashboard"

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/candidate/applications" element={<MyApplications />} />
        <Route path="/candidate/bids" element={<MyBids />} />
        <Route path="/candidate/profile" element={<CandidateProfile />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="/company/jobs" element={<ManageJobs />} />
        <Route path="/company/projects" element={<ManageProjects />} />
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
