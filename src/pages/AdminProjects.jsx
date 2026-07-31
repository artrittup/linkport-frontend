import AdminOpportunityList from '../components/AdminOpportunityList'
import DashboardLayout from '../layouts/DashboardLayout'

export default function AdminProjects() {
  return (
    <DashboardLayout title="Projects" userType="Admin">
      <AdminOpportunityList type="projects" showHeading />
    </DashboardLayout>
  )
}
