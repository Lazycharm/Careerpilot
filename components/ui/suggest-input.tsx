'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { filterSuggestions } from '@/lib/suggestions'

interface SuggestInputProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  className?: string
  inputClassName?: string
  maxResults?: number
  disabled?: boolean
  id?: string
}

export function SuggestInput({
  value,
  onChange,
  suggestions,
  placeholder,
  className,
  inputClassName,
  maxResults = 8,
  disabled,
  id: externalId,
}: SuggestInputProps) {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const internalId = useId()
  const id = externalId ?? internalId
  const listId = `${id}-list`
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = filterSuggestions(value, suggestions, maxResults)

  useEffect(() => {
    setActiveIdx(-1)
  }, [value])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const select = (item: string) => {
    onChange(item)
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      select(filtered[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && filtered.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeIdx >= 0 ? `${listId}-${activeIdx}` : undefined}
      />
      {open && filtered.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-56 overflow-y-auto py-1"
        >
          {filtered.map((item, i) => (
            <li
              key={item}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={(e) => { e.preventDefault(); select(item) }}
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
    </div>
  )
}
