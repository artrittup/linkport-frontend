import { Link } from 'react-router'
import Card from '../components/Card'
import CompanyLayout from '../layouts/CompanyLayout'

export default function CompanyTalent() {
  return (
    <CompanyLayout title="Talent">
      <div className="space-y-8">
        <section><p className="font-mono text-sm text-[#64ffda]">People</p><h2 className="mt-2 text-3xl font-bold">Talent</h2><p className="mt-2 max-w-2xl text-[#8892b0]">Companies will be able to discover members through their skills, projects, and interests.</p></section>
        <Card className="max-w-2xl">
          <h3 className="text-xl font-semibold">Talent tools are coming later</h3>
          <p className="mt-3 text-sm leading-6 text-[#8892b0]">For now, you can explore LinkPort’s public experience or review candidates who have already applied to your opportunities.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/company/applications" className="rounded-lg bg-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#071426]">Review applications</Link>
            <Link to="/" className="rounded-lg border border-[#233554] px-4 py-2.5 text-sm font-semibold text-[#e6f1ff] hover:border-[#64ffda]/50 hover:text-[#64ffda]">Explore LinkPort</Link>
          </div>
        </Card>
      </div>
    </CompanyLayout>
  )
}
