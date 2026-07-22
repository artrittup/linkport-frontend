import { useState } from 'react'
import Button from './Button'
import skillOptions from './skillOptions'

export default function SkillsInput({ skills, setSkills, placeholder = 'Add a skill...' }) {
  const [value, setValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const addSkill = (skill = value) => {
    const nextSkill = skill.trim()
    const isDuplicate = skills.some(
      (selectedSkill) => selectedSkill.toLowerCase() === nextSkill.toLowerCase(),
    )

    if (!nextSkill || isDuplicate) {
      setValue('')
      return
    }

    setSkills([...skills, nextSkill])
    setValue('')
    setShowSuggestions(false)
  }

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const normalizedValue = value.trim().toLowerCase()
  const suggestions = skillOptions
    .filter((option) => !skills.some((skill) => skill.toLowerCase() === option.toLowerCase()))
    .filter((option) => !normalizedValue || option.toLowerCase().includes(normalizedValue))
    .slice(0, 8)

  return (
    <div>
      <div className="flex items-start gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addSkill()
              }
              if (event.key === 'Escape') setShowSuggestions(false)
            }}
            placeholder={placeholder}
            autoComplete="off"
            aria-label="Search or add a skill"
            aria-expanded={showSuggestions && suggestions.length > 0}
            aria-controls="skill-suggestions"
            className="w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-2.5 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]"
          />

          {showSuggestions && suggestions.length > 0 && (
            <div id="skill-suggestions" role="listbox" className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-[#233554] bg-[#112240] p-1.5 shadow-2xl shadow-black/40">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  role="option"
                  aria-selected="false"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addSkill(suggestion)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-[#a8b2d1] transition-colors hover:bg-[#64ffda]/10 hover:text-[#64ffda]"
                >
                  {suggestion}
                  <span className="text-xs text-[#64748b]">Add</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={() => addSkill()}>
          Add
        </Button>
      </div>

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Selected skills">
          {skills.map((skill) => (
            <span key={skill} className="inline-flex items-center gap-1.5 rounded-full border border-[#64ffda]/30 bg-[#64ffda]/10 py-1 pl-3 pr-1.5 font-mono text-xs text-[#64ffda]">
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
