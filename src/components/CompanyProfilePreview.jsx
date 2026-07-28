import Card from './Card'
import CompanyBrandMark from './CompanyBrandMark'
import { getSafeCompanyUrl } from '../utils/companyProfile'

function PublicLink({ href, children }) {
  const safeUrl = getSafeCompanyUrl(href)
  if (!safeUrl) return null
  return <a href={safeUrl} target="_blank" rel="noreferrer" className="max-w-full break-all text-sm font-medium text-[#64ffda] hover:underline">{children} <span className="sr-only">(opens in a new tab)</span></a>
}

export default function CompanyProfilePreview({ form, localLogoUrl }) {
  const logoUrl = localLogoUrl || form.logoUrl
  return (
    <Card padding="lg" className="min-w-0">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#64ffda]">Profile preview</p>
      <p className="mt-2 text-xs leading-5 text-[#64748b]">A preview of how supported public information may appear across LinkPort.</p>
      <div className="mt-6 flex min-w-0 items-start gap-4">
        <CompanyBrandMark name={form.companyName} logoUrl={logoUrl} temporary={Boolean(localLogoUrl)} size="lg" />
        <div className="min-w-0">
          <h3 className="break-words text-xl font-bold">{form.companyName || 'Company name'}</h3>
          {form.industry && <p className="mt-1 break-words text-sm text-[#64ffda]">{form.industry}</p>}
          {form.location && <p className="mt-2 break-words text-xs text-[#8892b0]">{form.location}</p>}
          {form.employeeCount && <p className="mt-1 text-xs text-[#8892b0]">{Number(form.employeeCount).toLocaleString()} employees</p>}
        </div>
      </div>
      <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-6 text-[#a8b2d1]">{form.description || 'Add a description to introduce your company.'}</p>
      {(getSafeCompanyUrl(form.website) || getSafeCompanyUrl(form.linkedinUrl)) && <div className="mt-5 flex min-w-0 flex-wrap gap-4 border-t border-[#233554] pt-4"><PublicLink href={form.website}>Website</PublicLink><PublicLink href={form.linkedinUrl}>LinkedIn</PublicLink></div>}
      <p className="mt-5 text-xs leading-5 text-[#64748b]">Phone and account email are not included in this public preview.</p>
    </Card>
  )
}
