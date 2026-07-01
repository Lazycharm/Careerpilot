'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { filterSuggestions, SKILLS_LIST } from '@/lib/suggestions'

interface SkillTagInputProps {
  value: string[]
  onChange: (skills: string[]) => void
  suggestions?: string[]
  placeholder?: string
  className?: string
  maxTags?: number
}

export function SkillTagInput({
  value,
  onChange,
  suggestions = SKILLS_LIST,
  placeholder = 'Add a skill…',
  className,
  maxTags = 30,
}: SkillTagInputProps) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const id = useId()
  const listId = `${id}-list`
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = filterSuggestions(
    input,
    suggestions.filter(s => !value.includes(s)),
    8
  )

  useEffect(() => {
    setActiveIdx(-1)
  }, [input])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const addSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (!trimmed || value.includes(trimmed) || value.length >= maxTags) return
    onChange([...value, trimmed])
    setInput('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const removeSkill = (skill: string) => {
    onChange(value.filter(s => s !== skill))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
      return
    }
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (activeIdx >= 0 && filtered[activeIdx]) {
        addSkill(filtered[activeIdx])
      } else if (input.trim()) {
        addSkill(input)
      }
      return
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      removeSkill(value[value.length - 1])
      return
    }
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2 min-h-[42px] cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map(skill => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1"
          >
            {skill}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeSkill(skill) }}
              className="hover:text-blue-600 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400"
              aria-label={`Remove ${skill}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {value.length < maxTags && (
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            autoComplete="off"
            role="combobox"
            aria-expanded={open && filtered.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeIdx >= 0 ? `${listId}-${activeIdx}` : undefined}
          />
        )}
      </div>
      {open && filtered.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-52 overflow-y-auto py-1"
        >
          {filtered.map((item, i) => (
            <li
              key={item}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={(e) => { e.preventDefault(); addSkill(item) }}
              className={cn(
                'cursor-pointer px-3 py-2 text-sm',
                i === activeIdx ? 'bg-blue-50 text-blue-700' : 'text-gray-800 hover:bg-gray-50'
              )}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-gray-400 mt-1">
        Type and press Enter or comma to add. Click a suggestion to select it.
      </p>
    </div>
  )
}
