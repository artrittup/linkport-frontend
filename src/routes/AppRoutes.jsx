import { BrowserRouter, Route, Routes } from "react-router"

import LandingPage from "../pages/LandingPage"
import Login from "../pages/Login"
import Register from "../pages/Register"
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
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}