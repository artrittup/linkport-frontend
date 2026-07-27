import { getCandidateActivityPath } from '../config/candidateActivity'

export default function ActivityToastMessage({ message, tab }) {
  return (
    <span>
      {message}{' '}
      <a href={getCandidateActivityPath(tab)} className="font-semibold text-[#64ffda] underline underline-offset-2">
        View in My Activity
      </a>
    </span>
  )
}
