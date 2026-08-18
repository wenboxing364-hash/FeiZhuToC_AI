import { Check } from 'lucide-react'

interface SuggestionChipsProps {
  options: string[]
  onSelect: (value: string) => void
  disabled?: boolean
}
export function SuggestionChips({ options, onSelect, disabled = false }: SuggestionChipsProps) {
  return (
    <div className="message-enter ml-[42px] flex flex-wrap gap-2" aria-label="快捷问题">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className="suggestion-chip"
          disabled={disabled}
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

interface PreferenceChipsProps {
  options: string[]
  selected: string[]
  disabled?: boolean
  onToggle: (value: string) => void
  onConfirm: () => void
}

export function PreferenceChips({
  options,
  selected,
  disabled = false,
  onToggle,
  onConfirm,
}: PreferenceChipsProps) {
  return (
    <div className="message-enter ml-[42px] space-y-2.5" aria-label="旅行偏好">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              className={`preference-chip ${isSelected ? 'preference-chip-selected' : ''}`}
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onToggle(option)}
            >
              {isSelected && <Check size={12} strokeWidth={3} />}
              {option}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <button
          type="button"
          className="inline-flex h-8 items-center rounded-full bg-[#1677FF] px-3.5 text-xs font-medium text-white shadow-[0_4px_10px_rgba(22,119,255,0.18)] transition active:scale-95 disabled:opacity-50"
          disabled={disabled}
          onClick={onConfirm}
        >
          按此偏好规划
        </button>
      )}
    </div>
  )
}
