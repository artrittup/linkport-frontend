import { useState } from 'react'
import Button from './Button'

export default function SkillsInput({
  skills,
  setSkills,
  placeholder = 'Add a skill...',
}) {
  const [value, setValue] = useState('')

  const addSkill = () => {
    const nextSkill = value.trim()
    const isDuplicate = skills.some(
      (skill) => skill.toLowerCase() === nextSkill.toLowerCase(),
    )

    if (!nextSkill || isDuplicate) {
      setValue('')
      return
    }

    setSkills([...skills, nextSkill])
    setValue('')
  }

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addSkill()
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-2.5 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]"
        />
        <Button type="button" variant="outline" size="sm" onClick={addSkill}>
          Add
        </Button>
      </div>

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Selected skills">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#64ffda]/30 bg-[#64ffda]/10 py-1 pl-3 pr-1.5 font-mono text-xs text-[#64ffda]"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-[#8892b0] transition-colors hover:bg-[#ef4444]/20 hover:text-[#ef4444] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#64ffda]"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
