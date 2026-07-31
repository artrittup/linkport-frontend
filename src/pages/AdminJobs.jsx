import AdminOpportunityList from '../components/AdminOpportunityList'
import DashboardLayout from '../layouts/DashboardLayout'

export default function AdminJobs() {
  return (
    <DashboardLayout title="Jobs" userType="Admin">
      <AdminOpportunityList type="jobs" showHeading />
    </DashboardLayout>
  )
}
