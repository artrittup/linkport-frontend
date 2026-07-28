import { useState } from 'react'
import { getCompanyInitials } from '../utils/companyProfile'

const sizes = {
  sm: 'h-10 w-10 rounded-full text-xs',
  md: 'h-16 w-16 rounded-xl text-base',
  lg: 'h-24 w-24 rounded-2xl text-2xl',
}

export default function CompanyBrandMark({
  name,
  logoUrl,
  size = 'md',
  temporary = false,
}) {
  const [failedUrl, setFailedUrl] = useState('')
  const showImage = logoUrl && failedUrl !== logoUrl

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-[#64ffda]/35 bg-[#0a192f] font-mono font-bold text-[#64ffda] ${sizes[size] ?? sizes.md}`}>
      {showImage ? (
        <img src={logoUrl} alt={`${name || 'Company'} logo`} onError={() => setFailedUrl(logoUrl)} className="h-full w-full object-cover" />
      ) : getCompanyInitials(name)}
      {temporary && <span className="absolute inset-x-0 bottom-0 bg-[#071426]/90 py-0.5 text-center text-[8px] font-sans font-semibold uppercase text-[#facc15]">Preview</span>}
    </div>
  )
}
