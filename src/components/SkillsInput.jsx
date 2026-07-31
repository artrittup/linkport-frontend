import { useState } from 'react'
import Button from './Button'
import skillGroups from './skillOptions'

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
  const filteredGroups = skillGroups
    .map((group) => ({
      ...group,
      skills: group.skills
        .filter((option) => !skills.some((skill) => skill.toLowerCase() === option.toLowerCase()))
        .filter((option) => !normalizedValue || option.toLowerCase().includes(normalizedValue)),
    }))
    .filter((group) => group.skills.length > 0)
  const suggestionCount = filteredGroups.reduce((total, group) => total + group.skills.length, 0)

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
            aria-expanded={showSuggestions && suggestionCount > 0}
            aria-controls="skill-suggestions"
            className="w-full rounded-md border border-border bg-background/70 px-4 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring"
          />

          {showSuggestions && suggestionCount > 0 && (
            <div id="skill-suggestions" role="listbox" className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-2xl shadow-black/40">
              {filteredGroups.map((group) => (
                <section key={group.category} aria-label={group.category} className="not-last:mb-2">
                  <p className="sticky top-0 z-10 bg-surface px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                    {group.category}
                  </p>
                  {group.skills.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      role="option"
                      aria-selected="false"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => addSkill(suggestion)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {suggestion}
                      <span className="text-xs text-text-subtle">Add</span>
                    </button>
                  ))}
                </section>
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
            <span key={skill} className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 py-1 pl-3 pr-1.5 font-mono text-xs text-primary">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-danger/20 hover:text-danger focus:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring"
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
