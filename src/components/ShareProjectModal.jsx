import { useState } from 'react'
import Button from './Button'
import Modal from './Modal'

const controlClasses = 'mt-2 w-full rounded-lg border border-[#233554] bg-[#0a192f]/70 px-3.5 py-2.5 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

export default function ShareProjectModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false)

  const handleClose = () => {
    setSubmitted(false)
    onClose()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={submitted ? 'Project ready for a future update' : 'Share a project'}
      eyebrow="Preview"
      maxWidth="max-w-xl"
    >
      {submitted ? (
        <div className="rounded-xl border border-[#64ffda]/25 bg-[#64ffda]/5 p-5">
          <p className="font-semibold text-[#e6f1ff]">Thanks for preparing your project.</p>
          <p className="mt-2 text-sm leading-6 text-[#8892b0]">
            Publishing is not connected yet. Your information was not saved or sent anywhere.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm leading-6 text-[#8892b0]">
            Full project publishing is coming later. You can preview the planned fields below; nothing will be saved or sent to a backend.
          </p>
          <form id="share-project-form" className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-[#a8b2d1]">
              Project title
              <input required name="title" placeholder="What are you building?" className={controlClasses} />
            </label>
            <label className="block text-sm font-medium text-[#a8b2d1]">
              Short description
              <textarea required name="description" rows="3" placeholder="Explain the project in a few lines." className={controlClasses} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[#a8b2d1]">
                Status
                <select name="status" className={controlClasses} defaultValue="IN PROGRESS">
                  <option>LOOKING FOR TEAM</option>
                  <option>IN PROGRESS</option>
                  <option>COMPLETED</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-[#a8b2d1]">
                Skills
                <input name="skills" placeholder="React, Research, CAD" className={controlClasses} />
              </label>
            </div>
            <label className="flex items-center gap-3 rounded-lg border border-[#233554] bg-[#0a192f]/45 p-3.5 text-sm text-[#a8b2d1]">
              <input type="checkbox" name="lookingForTeam" className="h-4 w-4 accent-[#64ffda]" />
              Looking for teammates
            </label>
            <Button type="submit" className="w-full">Preview submission</Button>
          </form>
        </>
      )}
    </Modal>
  )
}
